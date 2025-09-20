'use client';

import React, { useEffect, useState } from 'react';
import { AdaptiveDentalPlanBuilder } from './dental-field-mapping/AdaptiveDentalPlanBuilder';
import { OptimizedDentalQuote } from '@/lib/dental-quote-optimizer';
import DentalPlanCards, { DentalCarrierSummary } from '@/components/medicare-shop/quote-cards/DentalPlanCards';
import DentalPlanCardsLegacy from '@/components/medicare-shop/quote-cards/DentalPlanCardsLegacy';
import { getEnhancedCarrierInfo, getCarrierDisplayName } from '@/lib/carrier-system';
import { PlanCardsSkeleton } from '@/components/medicare-shop/shared';

interface AdaptiveDentalShopContentProps {
  quotes: OptimizedDentalQuote[];
  isLoading?: boolean;
  onPlanSelect: (selectedQuote: OptimizedDentalQuote) => void;
}

function AdaptiveDentalShopContent({ 
  quotes, 
  isLoading = false, 
  onPlanSelect 
}: AdaptiveDentalShopContentProps) {
  const [dentalCardsMode, setDentalCardsMode] = useState<'legacy'|'new'>(() => {
    if (typeof window === 'undefined') return 'legacy';
    try { return (localStorage.getItem('dentalCardsMode') as 'legacy'|'new') || 'legacy'; } catch { return 'legacy'; }
  });
  const [activeCompany, setActiveCompany] = useState<string | null>(null);

  // Listen for external toggle events (sidebar) & company param changes
  useEffect(() => {
    const modeHandler = (e: any) => {
      const mode = e?.detail?.mode; if (mode === 'legacy' || mode === 'new') setDentalCardsMode(mode);
    };
    window.addEventListener('dentalCardsMode:change', modeHandler);
    return () => window.removeEventListener('dentalCardsMode:change', modeHandler);
  }, []);

  // Persist & dispatch when changed locally (future internal toggle support)
  useEffect(() => {
    try { localStorage.setItem('dentalCardsMode', dentalCardsMode); } catch {}
    try { window.dispatchEvent(new CustomEvent('dentalCardsMode:change', { detail: { mode: dentalCardsMode } })); } catch {}
  }, [dentalCardsMode]);

  useEffect(() => {
    const readCompany = () => {
      try {
        const url = new URL(window.location.href);
        setActiveCompany(url.searchParams.get('company'));
      } catch { setActiveCompany(null); }
    };
    readCompany();
    const companyChanged = (e: any) => setActiveCompany(e?.detail?.company || null);
    window.addEventListener('company:changed', companyChanged);
    window.addEventListener('popstate', readCompany);
    return () => {
      window.removeEventListener('company:changed', companyChanged);
      window.removeEventListener('popstate', readCompany);
    };
  }, []);

  const handlePlanBuilt = (selectedQuote: OptimizedDentalQuote, configuration: any) => {
    onPlanSelect(selectedQuote);
  };

  if (isLoading) {
    return <PlanCardsSkeleton count={4} title="Dental Plans" />;
  }

  if (!quotes || quotes.length === 0) {
    return <div className="text-center py-8">No dental plans available.</div>;
  }

  // Build carrier summaries similar to hospital pattern
  const carrierSummaries: DentalCarrierSummary[] = React.useMemo(() => {
    const map = new Map<string, OptimizedDentalQuote[]>();
    quotes.forEach(q => {
      const name = getCarrierDisplayName(q.companyName, 'dental');
      if (!map.has(name)) map.set(name, []);
      map.get(name)!.push(q);
    });
    return Array.from(map.entries()).map(([name, list]) => {
      const first = list[0];
      const monthlyValues = list.map(q => q.monthlyPremium).filter(v => typeof v === 'number');
      const min = monthlyValues.length ? Math.min(...monthlyValues) : undefined;
      const max = monthlyValues.length ? Math.max(...monthlyValues) : undefined;
      const enhanced = getEnhancedCarrierInfo({ carrier: { name: first.companyName } } as any, 'dental');
      // Attempt to extract annual max & deductible from first quote where available
      return {
        id: name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),
        name,
        logo: enhanced.logoUrl || '/images/carrier-placeholder.svg',
        min,
        max,
        planRange: (min!=null && max!=null) ? { min, max, count: list.length } : undefined,
        planName: first.planName,
        annualMax: (first as any).annualMaximum ?? (first as any).annualMax ?? undefined,
        deductibleIndividual: (first as any).deductibleIndividual ?? (first as any).deductible ?? undefined,
        visionIncluded: (first as any).visionIncluded ?? false,
        hearingIncluded: (first as any).hearingIncluded ?? false,
        count: list.length
      } as DentalCarrierSummary;
    });
  }, [quotes]);

  const cards = dentalCardsMode === 'new' ? (
    <DentalPlanCards carriers={carrierSummaries} loading={false} />
  ) : (
    <DentalPlanCardsLegacy carriers={carrierSummaries} loading={false} />
  );

  const clearCompany = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('company');
      window.history.pushState({}, '', url.toString());
      window.dispatchEvent(new CustomEvent('company:changed', { detail: { company: null, category: 'dental' } }));
    } catch {}
  };

  // Active company: replace cards with builder like hospital pattern
  if (activeCompany) {
    return (
      <div className="space-y-8" id="dental-builder">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">{activeCompany}</h2>
          <button onClick={clearCompany} className="text-xs px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">Back</button>
        </div>
        <AdaptiveDentalPlanBuilder quotes={quotes} onPlanBuilt={handlePlanBuilt} preselectedCompany={activeCompany} hideCarrierHeader />
      </div>
    );
  }

  return (
    <div className="space-y-8" id="dental-cards">
      {cards}
    </div>
  );
}

export default AdaptiveDentalShopContent;
