"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StarFilledIcon, HomeIcon, CalendarIcon, CheckCircledIcon, TokensIcon as DollarSign, ReloadIcon } from "@radix-ui/react-icons";
import { OptimizedHospitalIndemnityQuote } from "@/lib/hospital-indemnity-quote-optimizer";
import { PlanCardsSkeleton } from "@/components/medicare-shop/shared";
import { SimplifiedHospitalIndemnityPlanBuilder } from './hospital-indemnity-field-mapping/SimplifiedHospitalIndemnityPlanBuilder';
import HospitalIndemnityPlanCards from '@/components/medicare-shop/quote-cards/HospitalIndemnityPlanCards';
import HospitalIndemnityPlanCardsLegacy from '@/components/medicare-shop/quote-cards/HospitalIndemnityPlanCardsLegacy';
import { getEnhancedCarrierInfo, getCarrierDisplayName } from '@/lib/carrier-system';

interface HospitalIndemnityShopContentProps {
  quotes: OptimizedHospitalIndemnityQuote[];
  isLoading?: boolean;
  onSelectPlan?: (quote: OptimizedHospitalIndemnityQuote) => void;
}

export default function HospitalIndemnityShopContent({ 
  quotes, 
  isLoading = false, 
  onSelectPlan 
}: HospitalIndemnityShopContentProps) {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [planConfig, setPlanConfig] = useState<any>(null);

  const [hospitalCardsMode, setHospitalCardsMode] = useState<'legacy'|'new'>(() => {
    if (typeof window === 'undefined') return 'legacy';
    try { return (localStorage.getItem('hospitalCardsMode') as 'legacy'|'new') || 'legacy'; } catch { return 'legacy'; }
  });
  // Track selected company from query string
  const [activeCompany, setActiveCompany] = useState<string | null>(null);
  useEffect(() => {
    const handler = (e: any) => {
      const mode = e?.detail?.mode;
      if (mode === 'legacy' || mode === 'new') setHospitalCardsMode(mode);
    };
    window.addEventListener('hospitalCardsMode:change', handler);
    return () => window.removeEventListener('hospitalCardsMode:change', handler);
  }, []);

  // Listen for company param changes (set by Details button); handle deep link on first mount
  useEffect(() => {
    const readCompany = () => {
      try {
        const url = new URL(window.location.href);
        const company = url.searchParams.get('company');
        setActiveCompany(company);
      } catch { setActiveCompany(null); }
    };
    readCompany();
    const companyChanged = (e: any) => {
      const company = e?.detail?.company || null;
      setActiveCompany(company);
    };
    window.addEventListener('company:changed', companyChanged);
    window.addEventListener('popstate', readCompany);
    return () => {
      window.removeEventListener('company:changed', companyChanged);
      window.removeEventListener('popstate', readCompany);
    };
  }, []);

  // (Auto scroll removed per updated UX decision)

  if (isLoading) return <PlanCardsSkeleton count={4} title="Hospital Indemnity Plans" />;

  const handlePlanBuilt = async (config: any) => {
    console.log('✅ Plan built successfully:', config);
    
    // Show processing state
    setIsProcessing(true);
    setPlanConfig(config);
    setShowSuccessModal(true);
    
    // Simulate processing time (you can replace this with actual API calls)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Here you would typically:
    // 1. Save the configuration to the user's profile
    // 2. Navigate to a checkout or enrollment page
    // 3. Process the enrollment
    
    setIsProcessing(false);
    
    // Auto-close modal after 3 seconds
    setTimeout(() => {
      setShowSuccessModal(false);
    }, 3000);
  };

  if (!quotes || quotes.length === 0) {
    return (
      <div className="text-center py-12">
        <HomeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Hospital Indemnity Plans Found</h3>
        <p className="text-gray-500">
          We couldn't find any hospital indemnity insurance plans for your area. Please try adjusting your search criteria.
        </p>
      </div>
    );
  }

  

  // Build carrier summaries for card components (both modes rely on similar base)
  const carrierSummaries = React.useMemo(() => {
    const map = new Map<string, OptimizedHospitalIndemnityQuote[]>();
    quotes.forEach(q => {
      const name = getCarrierDisplayName(q.companyName, 'hospital-indemnity');
      if (!map.has(name)) map.set(name, []);
      map.get(name)!.push(q);
    });
    return Array.from(map.entries()).map(([name, list]) => {
      const first = list[0];
      // Collect riders (names) across quotes
      const riderSet = new Set<string>();
      list.forEach(q => q.riders.forEach(r => riderSet.add(r.name)));
      const monthlyValues = list.map(q => q.monthlyPremium).filter(v => typeof v === 'number');
      const min = monthlyValues.length ? Math.min(...monthlyValues) : undefined;
      const max = monthlyValues.length ? Math.max(...monthlyValues) : undefined;
      const enhanced = getEnhancedCarrierInfo({ carrier: { name: first.companyName } } as any, 'hospital-indemnity');
      return {
        id: name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),
        name,
        logo: enhanced.logoUrl || '/images/carrier-placeholder.svg',
        min,
        max,
        planRange: (min!=null && max!=null) ? { min, max, count: list.length } : undefined,
        planName: first.planName,
        count: list.length,
        availableRiders: Array.from(riderSet)
      };
    });
  }, [quotes]);

  const cards = hospitalCardsMode === 'new' ? (
    <HospitalIndemnityPlanCards carriers={carrierSummaries as any} loading={false} />
  ) : (
    <HospitalIndemnityPlanCardsLegacy carriers={carrierSummaries as any} loading={false} />
  );

  const clearCompany = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('company');
      window.history.pushState({},'',url.toString());
      window.dispatchEvent(new CustomEvent('company:changed',{detail:{company:null, category:'hospital'}}));
    } catch {}
  };

  // When a company is selected, show ONLY the builder (replace cards) with a back action
  if (activeCompany) {
    return (
  <div className="space-y-8" id="hospital-builder">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">{activeCompany}</h2>
          <button onClick={clearCompany} className="text-xs px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">Back</button>
        </div>
        <SimplifiedHospitalIndemnityPlanBuilder quotes={quotes} onPlanBuilt={handlePlanBuilt} hideHeader />
      </div>
    );
  }

  // Default view: show carrier cards
  return (
    <div className="space-y-8" id="hospital-cards">
      {cards}
    </div>
  );
}
