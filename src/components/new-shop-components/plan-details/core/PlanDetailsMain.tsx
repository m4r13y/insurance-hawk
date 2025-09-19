"use client";

// Core Medigap plan details orchestrator (moved to core/ as part of folder re‑org)
import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { loadTemporaryData } from "@/lib/services/temporary-storage";
import { REAL_QUOTES_KEY, getAllMedigapStorageKeys } from "@/components/medicare-shop/shared/storage";
import { getBaseRate } from "@/lib/medigap-utils";
import { useDiscountState } from "@/lib/services/discount-state";
import { getMedigapQuotes } from '@/lib/actions/medigap-quotes';
import { savePlanQuotes } from '@/lib/medigap/planStorage';

// Internal relative imports now reflect new structure
import type { QuoteData } from '../types';
import { PlanDetailsHeader } from '../headers/PlanDetailsHeader';
// Tabs remain at root (not yet migrated)
import { PlanBuilderTab } from '../PlanBuilderTab';
import { PlanDetailsTab } from '../PlanDetailsTab';
import { UnderwritingTab } from '../UnderwritingTab';
import { LoadingState } from '../states/LoadingState';
import { ErrorState } from '../states/ErrorState';
import { Tabs } from "@/components/ui/tabs";

interface PlanDetailsMainProps {
  carrierId?: string;
  initialQuotes?: QuoteData[];
  plan?: string;
  onClose?: () => void;
}

interface PlanConfiguration {
  ratingClass: string;
  discounts: string[];
}

// Helper to adapt normalized adapter quotes into the legacy shape expected by existing builder logic.
// Normalized quote shape (adapter): { pricing.monthly, plan:{key,display}, metadata.discountFacet, __raw }
// Legacy builder expects: rate.month, plan (string), view_type tokens, discounts array, rating_class, etc.
const adaptNormalizedQuote = (q: any) => {
  if (!q || typeof q !== 'object') return q;
  // If it already looks legacy (rate.month exists) just return
  if (q.rate?.month != null) return q;
  if (q.pricing?.monthly != null) {
    const planKey = typeof q.plan === 'string' ? q.plan : (q.plan?.key || q.plan?.display || '');
    const discountFacet = q.metadata?.discountFacet;
    const viewType = discountFacet === 'with_hhd' ? ['with_hhd'] : (discountFacet === 'sans_hhd' ? ['sans_hhd'] : []);
    const raw = q.__raw || {};
    return {
      // Preserve normalized for potential future reference
      __normalized: q,
      // Spread raw first so adapter-derived fields override if duplicates
      ...raw,
      // For legacy code paths treat carrier as a simple string (avoid rendering object errors)
      carrier: q.carrier?.name || raw.carrier?.name || raw.company || 'Unknown Carrier',
      company: q.carrier?.name || raw.company,
      plan: planKey,
      planLetter: planKey,
      view_type: viewType,
      rate: { month: q.pricing.monthly, annual: q.pricing.monthly * 12 },
      discounts: raw.discounts || [],
      rating_class: raw.rating_class || 'Standard'
    };
  }
  return q; // fallback unchanged
};

// Ensure carrier field is always a primitive string for rendering (older persisted snapshots may store { name: 'Carrier' }).
const coerceCarrierToString = (q: any) => {
  if (q && q.carrier && typeof q.carrier === 'object' && q.carrier.name && typeof q.carrier.name === 'string') {
    return { ...q, carrier: q.carrier.name };
  }
  return q;
};

const PlanDetailsMain: React.FC<PlanDetailsMainProps> = ({ carrierId, initialQuotes, plan, onClose }) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [quoteData, setQuoteData] = React.useState<QuoteData | null>(null);
  const [carrierQuotes, setCarrierQuotes] = React.useState<QuoteData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [addingPlan, setAddingPlan] = React.useState<null | 'F' | 'G' | 'N'>(null);
  const [showGenerateQuote, setShowGenerateQuote] = React.useState(false);

  const [applyDiscounts] = useDiscountState();

  const [currentSelection, setCurrentSelection] = React.useState<PlanConfiguration>({
    ratingClass: '',
    discounts: []
  });
  const [hasUserSelection, setHasUserSelection] = React.useState(false);

  const loadExistingQuotes = async (): Promise<QuoteData[]> => {
    try {
      const quotes = await loadExistingMedigapQuotes();
      if (quotes?.length) return quotes;
    } catch (e) { console.error(e); }
    return [];
  };

  const loadExistingMedigapQuotes = async (): Promise<QuoteData[]> => {
    try {
      const planStorageKeys = getAllMedigapStorageKeys();
      const allPlanQuotes = await Promise.all(
        planStorageKeys.map(async (storageKey) => {
          try { return await loadTemporaryData(storageKey, []) as QuoteData[]; } catch { return []; }
        })
      );
      const combined = allPlanQuotes.flat();
      if (combined.length) return combined;
      const legacy = await loadTemporaryData(REAL_QUOTES_KEY, []);
      if (Array.isArray(legacy) && legacy.length) return legacy as QuoteData[];
      return [];
    } catch (e) { console.error(e); return []; }
  };

  const handleGoBack = () => {
    if (onClose) { onClose(); return; }
    const returnUrl = typeof window !== 'undefined' ? localStorage.getItem('planDetailsReturnUrl') : null;
    if (returnUrl) {
      localStorage.removeItem('planDetailsReturnUrl');
      let finalReturnUrl = returnUrl;
      if (!returnUrl.includes('step=results')) {
        finalReturnUrl += (returnUrl.includes('?') ? '&' : '?') + 'step=results';
      }
      router.push(finalReturnUrl);
      return;
    }
    router.push('/medicare/shop?step=results');
  };

  React.useEffect(() => {
    const init = async () => {
      const carrier = carrierId || searchParams.get('carrier');
      const planType = plan || searchParams.get('plan');
      setCurrentSelection({ ratingClass: '', discounts: [] });

      // Helper: safely resolve a plan token from either legacy string quotes or new adapter normalized shape.
      const resolvePlanToken = (q: any): string => {
        const p = q?.plan;
        if (!p) return '';
        if (typeof p === 'string') return p;
        // Adapter normalized shape: { key, display }
        if (typeof p === 'object') {
          if (typeof p.key === 'string') return p.key;
          if (typeof p.display === 'string') return p.display;
        }
        return String(p);
      };
      const planMatches = (q: any, target: string): boolean => {
        if (!target) return true;
        const token = resolvePlanToken(q).toUpperCase();
        const tgt = target.toUpperCase();
        return token === tgt || token.endsWith(tgt);
      };

      if (initialQuotes?.length) {
        // Adapt any normalized quotes into legacy-like shape for builder
  let adapted = initialQuotes.map(q => coerceCarrierToString(adaptNormalizedQuote(q)));
        let subset = adapted;
        if (planType) {
          const pf = subset.filter(q => planMatches(q, planType));
          if (pf.length) subset = pf;
        }
        setQuoteData(subset[0]);
        setCarrierQuotes(subset);
        setLoading(false);
        return;
      }

      let existingQuotes: QuoteData[] = await loadExistingQuotes();
      if (existingQuotes.length) {
        let filtered = existingQuotes;
        if (carrier || planType) {
          const carrierNorm = carrier ? carrier.toLowerCase().trim() : '';
            filtered = existingQuotes.filter(quote => {
              const company = (quote.company || '').toLowerCase();
              const nestedName = (quote as any).carrier?.name ? (quote as any).carrier.name.toLowerCase() : '';
              const baseName = (quote.company_base?.name || '').toLowerCase();
              const fullName = (quote.company_base?.name_full || '').toLowerCase();
              const matchesCarrier = !carrier || [company, nestedName, baseName, fullName].some(v => v && v === carrierNorm);
              const matchesPlan = !planType || planMatches(quote, planType);
              return matchesCarrier && matchesPlan;
            });
        }
        if (filtered.length) {
          const adapted = filtered.map(q => coerceCarrierToString(adaptNormalizedQuote(q)));
            setQuoteData(adapted[0]);
            setCarrierQuotes(adapted);
        } else { setShowGenerateQuote(true); }
      } else { setShowGenerateQuote(true); }
      setLoading(false);
    };
    init();
  }, [searchParams, carrierId, initialQuotes, plan]);

  const calculateDiscountedRate = (rate: number, discounts: any[]) => {
    let discountedRate = rate;
    discounts.forEach(d => { if (d.type === 'percent') discountedRate *= (1 - d.value); else if (d.type === 'fixed') discountedRate -= d.value; });
    return Math.round(discountedRate);
  };

  // Derive which plan letters are present among current carrierQuotes
  const presentPlans = React.useMemo(() => {
    const s = new Set<string>();
    carrierQuotes.forEach(q => { const p = (q as any)?.plan || (q as any)?.planLetter; if (p) s.add(String(p).toUpperCase()); });
    return ['F','G','N'].filter(l => s.has(l));
  }, [carrierQuotes]);
  const missingPlans = React.useMemo(() => ['F','G','N'].filter(l => !presentPlans.includes(l)), [presentPlans]);

  const handleAddPlan = async (planLetter: 'F'|'G'|'N') => {
    if (addingPlan || presentPlans.includes(planLetter)) return;
    setAddingPlan(planLetter);
    try {
      // Attempt to pull demographic context from persisted form state (sandbox + production parity)
      let age = 65, zipCode = '', gender = 'M', tobacco = '0';
      try {
        const raw = localStorage.getItem('medicare_form_state');
        if (raw) {
          const obj = JSON.parse(raw);
          if (obj?.age) age = parseInt(obj.age,10) || age;
          if (obj?.zipCode) zipCode = String(obj.zipCode);
          if (obj?.gender) gender = obj.gender.toString().toLowerCase().startsWith('m') ? 'M' : 'F';
          if (typeof obj?.tobaccoUse === 'boolean') tobacco = obj.tobaccoUse ? '1':'0';
        }
      } catch {}
      // Fallback to quoteData context if missing
      if (!zipCode && (quoteData as any)?.zip5) zipCode = (quoteData as any).zip5;
      const params: any = { zipCode: String(zipCode), age: String(age), gender, tobacco, plans: [planLetter] };
      const { quotes: fetched, error } = await getMedigapQuotes(params);
      if (error) throw new Error(error);
      if (fetched && fetched.length) {
        await savePlanQuotes(planLetter, fetched);
        setCarrierQuotes(prev => [...prev, ...fetched as any]);
      }
    } catch (e) {
      console.error('Failed to add plan', planLetter, e);
    } finally {
      setAddingPlan(null);
    }
  };

  const getCurrentSelectionRate = () => {
    if (!hasUserSelection || !currentSelection.ratingClass) return null;
    if (!carrierQuotes.length || !quoteData) return null;
    const match = carrierQuotes.find(q => (q.rating_class || '') === currentSelection.ratingClass && q.plan === quoteData.plan);
    if (match) return Math.round(getBaseRate(match, applyDiscounts));
    return null;
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount / 100);

  const handleSelectionChange = (selection: PlanConfiguration) => {
    setCurrentSelection(selection);
    if (selection.ratingClass) setHasUserSelection(true);
  };

  if (loading) return <LoadingState />;

  if (showGenerateQuote || !quoteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <Card className="w-full max-w-md mx-4 bg-white/80 dark:bg-slate-800/70 backdrop-blur border-slate-200 dark:border-slate-700 shadow-sm">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center gap-2 justify-center text-slate-800 dark:text-slate-100">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
              No Quote Data
            </CardTitle>
          </CardHeader>
            <CardContent className="text-center space-y-4">
            <p className="text-slate-600 dark:text-slate-400">No quote data is available. Please generate a new quote to view plan details.</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={handleGoBack} className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700">Go Back</Button>
              <Button onClick={handleGoBack} className="btn-brand dark:shadow-none">Generate Quote</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-100">
      <PlanDetailsHeader 
        quoteData={quoteData}
        onGoBack={handleGoBack}
        calculateDiscountedRate={calculateDiscountedRate}
        getCurrentRate={getCurrentSelectionRate}
        formatCurrency={formatCurrency}
      />
      {missingPlans.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="flex flex-wrap gap-2 text-[11px] items-center">
            <span className="text-slate-500 dark:text-slate-400">Add more plans:</span>
            {missingPlans.map(pl => (
              <Button
                key={pl}
                size="sm"
                variant="outline"
                disabled={addingPlan === pl}
                onClick={()=> handleAddPlan(pl as 'F'|'G'|'N')}
                className={`h-6 px-2 py-0 text-[11px] ${addingPlan===pl? 'opacity-70 cursor-wait':''}`}
              >{addingPlan===pl ? `Adding ${pl}…` : `Plan ${pl}`}</Button>
            ))}
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16">
        <Tabs defaultValue="builder" className="space-y-6">
          {/* Tab list lives inside PlanBuilderTab composition now */}
          <PlanBuilderTab 
            quoteData={quoteData}
            carrierQuotes={carrierQuotes}
            formatCurrency={formatCurrency}
            calculateDiscountedRate={calculateDiscountedRate}
            currentSelection={currentSelection}
            getCurrentRate={getCurrentSelectionRate}
            hasUserSelection={hasUserSelection}
          />
          <PlanDetailsTab quoteData={quoteData} />
          <UnderwritingTab quoteData={quoteData} />
        </Tabs>
      </div>
    </div>
  );
};

export default PlanDetailsMain;
