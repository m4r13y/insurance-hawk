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

const PlanDetailsMain: React.FC<PlanDetailsMainProps> = ({ carrierId, initialQuotes, plan, onClose }) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [quoteData, setQuoteData] = React.useState<QuoteData | null>(null);
  const [carrierQuotes, setCarrierQuotes] = React.useState<QuoteData[]>([]);
  const [loading, setLoading] = React.useState(true);
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

      if (initialQuotes?.length) {
        let subset = initialQuotes;
        if (planType) {
          const pf = subset.filter(q => (q.plan || '').toUpperCase().endsWith(planType.toUpperCase()));
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
              const matchesPlan = !planType || quote.plan === planType || (quote.plan || '').toUpperCase().endsWith(planType.toUpperCase());
              return matchesCarrier && matchesPlan;
            });
        }
        if (filtered.length) {
          setQuoteData(filtered[0]);
          setCarrierQuotes(filtered);
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
