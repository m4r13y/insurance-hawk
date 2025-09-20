"use client";

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircledIcon, StarFilledIcon, PersonIcon, ClockIcon, FileTextIcon, GlobeIcon, CalendarIcon } from "@radix-ui/react-icons";
import { PlanCardsSkeleton } from "@/components/medicare-shop/shared";
import { CancerInsuranceEmptyState } from "./";
import CancerPlanCards, { CancerCarrierSummary } from '@/components/medicare-shop/quote-cards/CancerPlanCards';
import CancerDetailsShowcase from '@/components/medicare-shop/plan-details/core/CancerDetailsShowcase';
import { getEnhancedCarrierInfo, getCarrierDisplayName } from "@/lib/carrier-system";

interface CancerInsuranceQuote {
  monthly_premium: number;
  carrier: string;
  plan_name: string;
  benefit_amount: number;
}

interface CancerInsuranceShopContentProps {
  quotes: CancerInsuranceQuote[];
  isLoading?: boolean;
  onSelectPlan?: (quote: CancerInsuranceQuote) => void;
}

export default function CancerInsuranceShopContent({
  quotes,
  isLoading = false,
  onSelectPlan
}: CancerInsuranceShopContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const companyParam = searchParams?.get('company');
  // Card mode state (persisted) similar to Final Expense implementation
  const [useNewCards, setUseNewCards] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false; // default to legacy simple grid
    try {
      const stored = localStorage.getItem('cancerCardsMode');
      if (stored === 'new') return true;
      if (stored === 'legacy') return false;
    } catch {}
    return false;
  });

  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.mode) setUseNewCards(detail.mode === 'new');
    };
    window.addEventListener('cancerCardsMode:change', handler as EventListener);
    return () => window.removeEventListener('cancerCardsMode:change', handler as EventListener);
  }, []);

  if (isLoading) {
    return <PlanCardsSkeleton count={4} title="Cancer Insurance Plans" />;
  }
  if (!quotes || quotes.length === 0) {
    return <CancerInsuranceEmptyState />;
  }

  const formatCurrency = (amount: number): string => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2,
  }).format(amount).replace('$','');

  const getCarrierDisplayNameForQuote = (quote: CancerInsuranceQuote): string => (
    getCarrierDisplayName(quote.carrier, 'cancer')
  );

  const getCarrierLogoUrl = (carrier: string): string => {
    const temp = { carrier } as any;
    const enhanced = getEnhancedCarrierInfo(temp, 'cancer');
    return enhanced.logoUrl || '/images/carrier-placeholder.svg';
  };

  // Group quotes by carrier to feed enriched card variant
  const carrierSummaries: CancerCarrierSummary[] = React.useMemo(() => {
    const map = new Map<string, CancerInsuranceQuote[]>();
    quotes.forEach(q => {
      const key = getCarrierDisplayNameForQuote(q);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(q);
    });
    const summaries: CancerCarrierSummary[] = [];
    map.forEach((list, displayName) => {
      const monthlyValues = list.map(q => q.monthly_premium).filter(v => typeof v === 'number');
      const min = Math.min(...monthlyValues);
      const max = Math.max(...monthlyValues);
      // Use first quote for representative details
      const first = list[0];
      summaries.push({
        id: displayName.toLowerCase().replace(/[^a-z0-9]+/g,'-') || Math.random().toString(36).slice(2),
        name: displayName,
        logo: getCarrierLogoUrl(first.carrier),
        min, max,
        planRange: { min, max, count: list.length },
        planName: first.plan_name,
        lumpSum: first.benefit_amount, // map benefit_amount -> lumpSum label used in legacy enriched card
        wellness: undefined,
        recurrence: false,
        count: list.length
      });
    });
    return summaries;
  }, [quotes]);

  // Map carrier name -> first quote for selection
  const carrierFirstQuote = React.useMemo(() => {
    const m = new Map<string, CancerInsuranceQuote>();
    quotes.forEach(q => {
      const name = getCarrierDisplayNameForQuote(q);
      if (!m.has(name)) m.set(name, q);
    });
    return m;
  }, [quotes]);

  // Legacy simple grid (original implementation) extracted for clarity
  const LegacyGrid: React.FC = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {quotes.map((quote, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300">
            <div className="flex items-center justify-between p-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  <Image
                    src={getCarrierLogoUrl(quote.carrier)}
                    alt={`${getCarrierDisplayNameForQuote(quote)} logo`}
                    width={40}
                    height={40}
                    className="w-full h-full object-contain"
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { (e.currentTarget as HTMLImageElement).style.display='none'; }}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-base">{getCarrierDisplayNameForQuote(quote)}</h3>
                  <p className="text-sm text-gray-600">Cancer Insurance Coverage</p>
                </div>
              </div>
            </div>
            <div className="px-4 pb-4">
              <div className="mb-4">
                <div className="text-3xl font-bold text-gray-900 mb-1">${formatCurrency(quote.monthly_premium)} <span className="text-base font-normal text-gray-600">/month</span></div>
              </div>
              <div className="mb-4">
                <p className="text-lg font-bold text-gray-600">${quote.benefit_amount?.toLocaleString()} benefit amount</p>
              </div>
              <div className="mb-4">
                <div className="grid grid-cols-1 gap-2">
                  {['Lump sum payment upon diagnosis','No network restrictions','Use benefits as you choose'].map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircledIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={() => onSelectPlan?.(quote)} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-3" size="lg">Select Plan</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  // If a company query param is present, attempt inline details view (prefer new cards context; still allow from legacy)
  if (companyParam) {
    // Normalize match (case-insensitive) vs carrier display names
    const targetName = companyParam.replace(/-/g,' ').toLowerCase();
    const matchingQuotes = quotes.filter(q => getCarrierDisplayNameForQuote(q).toLowerCase() === targetName);
    const carrierName = matchingQuotes[0] ? getCarrierDisplayNameForQuote(matchingQuotes[0]) : companyParam;
    const handleClose = () => {
      const sp = new URLSearchParams(searchParams?.toString() || '');
      sp.delete('company');
      const qs = sp.toString();
      router.replace(`?${qs}`, { scroll: false });
    };
    return (
      <div className="space-y-8">
        <CancerDetailsShowcase
          carrierName={carrierName}
          quotes={matchingQuotes}
          onClose={handleClose}
        />
      </div>
    );
  }

  return useNewCards ? (
    <CancerPlanCards
      carriers={carrierSummaries}
      loading={false}
      onOpenCarrierDetails={(c) => {
        // Update query param for inline details
        const sp = new URLSearchParams(searchParams?.toString() || '');
        sp.set('company', c.name.toLowerCase());
        router.replace(`?${sp.toString()}`, { scroll: false });
      }}
    />
  ) : (
    <LegacyGrid />
  );
}
