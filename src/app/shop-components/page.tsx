"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ComparisonRowCards } from '@/components/new-shop-components/quote-cards/ComparisonRowCards';
import { MinimalRateChips } from '@/components/new-shop-components/quote-cards/MinimalRateChips';
import { DensityStressGrid } from '@/components/new-shop-components/quote-cards/DensityStressGrid';
import { LightInverseCards } from '@/components/new-shop-components/quote-cards/PrimaryCards';
import { useRouter } from 'next/navigation';
import { planBadges } from '@/components/new-shop-components/constants/planBadges';
import SidebarShowcase from '@/components/new-shop-components/sidebar/SidebarShowcase';
import { filterPreferredCarriers } from '@/lib/carrier-system';
import PlanDetailsShowcase from '@/components/new-shop-components/plan-details/PlanDetailsShowcase';
import { useSavedPlans } from '@/contexts/SavedPlansContext';
// Removed Tabs import after refactor to checkbox toggles inside Sandbox Controls
import Image from 'next/image';
import { loadFromStorage } from '@/components/medicare-shop/shared/storage';
import { REAL_QUOTES_KEY, getAllMedigapStorageKeys } from '@/components/medicare-shop/shared/storage';
import { SELECTED_CATEGORIES_KEY } from '@/components/medicare-shop/shared/storage';
import { runCarrierStream } from '@/lib/streaming/medigapStreaming';
// Reuse shared Medigap discount utilities instead of ad‑hoc logic
import { getBaseRate } from '@/lib/medigap-utils';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useCategoryQuotes } from '@/components/new-shop-components/adapters/useCategoryQuotes';
import { getEnhancedCarrierInfo, mapUICategoryToProductCategory } from '@/lib/carrier-system';
import DrugPlanCards from '@/components/new-shop-components/quote-cards/DrugPlanCards';
import { SavedPlanChips } from '@/components/new-shop-components/quote-cards/SavedPlanChips';
import PdpDetailsShowcase from '@/components/new-shop-components/plan-details/PdpDetailsShowcase';
import AdvantagePlanCards from '@/components/new-shop-components/quote-cards/AdvantagePlanCards';
import { AdvantageDetailsShowcase } from '@/components/new-shop-components/plan-details';
import DentalPlanCards from '@/components/new-shop-components/quote-cards/DentalPlanCards';
import CancerPlanCards from '@/components/new-shop-components/quote-cards/CancerPlanCards';
import HospitalIndemnityPlanCards from '@/components/new-shop-components/quote-cards/HospitalIndemnityPlanCards';
import FinalExpensePlanCards from '@/components/new-shop-components/quote-cards/FinalExpensePlanCards';
import { DentalDetailsShowcase, CancerDetailsShowcase, HospitalIndemnityDetailsShowcase, FinalExpenseDetailsShowcase } from '@/components/new-shop-components/plan-details';
// Real quote actions per category
import { getMedigapQuotes } from '@/lib/actions/medigap-quotes';
import { getMedicareAdvantageQuotes } from '@/lib/actions/advantage-quotes';
import { getDrugPlanQuotes } from '@/lib/actions/drug-plan-quotes';
import { getDentalQuotes } from '@/lib/actions/dental-quotes';
import { getCancerInsuranceQuotes } from '@/lib/actions/cancer-insurance-quotes';
import { getHospitalIndemnityQuotes } from '@/lib/actions/hospital-indemnity-quotes';
import { getFinalExpenseLifeQuotes } from '@/lib/actions/final-expense-quotes';
// Always-live adapter mode (shadow diff removed)

/*
  Cards Design Sandbox
  --------------------
  This page is an isolated playground for experimenting with card component patterns
  before integrating them into production flows. Safe to iterate & discard.

  Guidelines:
  - Keep variants visually grouped.
  - Each variant section should explain intended use cases.
  - Prefer composable primitives (Card, Badge, Button) over bespoke CSS.
  - Avoid coupling to real data sources; mock data only.
*/

// No mock carriers: show skeletons while loading / when empty.

export interface CardsSandboxProps { initialCategory?: string }
export default function CardsSandboxPage({ initialCategory }: CardsSandboxProps) {
  const { savedPlans } = useSavedPlans();
  // Real Medigap data (first carrier group) -------------------------------------------------
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [carrierSummaries, setCarrierSummaries] = useState<any[]>([]);
  const [reloadIndex, setReloadIndex] = useState(0);
  // Discount toggle lives early so summary memo can depend on it
  const [applyDiscounts, setApplyDiscounts] = useState(false);

  // Performance / instrumentation
  const [fetchStartTs, setFetchStartTs] = useState<number | null>(null);
  const [fetchEndTs, setFetchEndTs] = useState<number | null>(null);
  const [firstCarrierReadyTs, setFirstCarrierReadyTs] = useState<number | null>(null);
  const [streamingActive, setStreamingActive] = useState(false);
  const [streamedCarriers, setStreamedCarriers] = useState<any[]>([]);
  const streamingEnabled = process.env.NEXT_PUBLIC_ENABLE_MEDIGAP_STREAMING === '1';
  const [firstPlanVisibleMs, setFirstPlanVisibleMs] = useState<number | null>(null);
  const [allPlansCompleteMs, setAllPlansCompleteMs] = useState<number | null>(null);

  // (moved below activeCategory state)

  // Group quotes by carrier name (preferred carriers only if available)
  const firstCarrierGroup = useMemo(() => {
    if (!quotes || quotes.length === 0) return null;
    const category = 'medicare-supplement' as const;
    // Always start from full quotes list; preferred filtering now handled at display time
    const preferredSubset = filterPreferredCarriers(quotes, category);
    const preferredIds = new Set(preferredSubset.map(p => p.carrier?.name || p.company));
    const map: Record<string, any[]> = {};
    for (const q of quotes) {
      const name = q.carrier?.name || q.company || 'Unknown';
      if (!map[name]) map[name] = []; map[name].push(q);
    }
    const entries = Object.entries(map);
    let summaries = entries.map(([name, cQuotes], idx) => {
      const logo = cQuotes[0]?.carrier?.logo_url || `/carrier-logos/${(idx % 9)+1}.png`;
      // Filter quotes to respect discount toggle for pre‑calculated variants (with_hhd vs sans_hhd)
      const filtered = cQuotes.filter(q => {
        const vt = Array.isArray(q.view_type) ? q.view_type : [];
        const hasHHDVariants = vt.some((s: string) => s.includes('hhd'));
        if (!hasHHDVariants) return true; // calculated or standard pattern – keep for now and later rate calc will apply discounts if needed
        if (applyDiscounts) return vt.includes('with_hhd');
        return vt.includes('sans_hhd');
      });

      // Build normalized rates using shared getBaseRate so calculated discount pattern applies when requested
      const enriched = filtered.map(q => {
        const raw = getBaseRate(q, applyDiscounts);
        // Heuristic: API sometimes returns cents (e.g. 13014 -> $130.14). Treat 4+ digit values as cents.
        const norm = raw >= 1000 ? raw / 100 : raw; // avoid dividing valid dollar figures like 130
        return { quote: q, normRate: norm };
      }).filter(item => typeof item.normRate === 'number' && !isNaN(item.normRate));

      // Representative lowest prices per plan (legacy quick access) & range stats
      const planPrices: Record<string, number | undefined> = { F: undefined, G: undefined, N: undefined };
      const planRanges: Record<string, { min: number; max: number; count: number } | undefined> = { F: undefined, G: undefined, N: undefined };

      enriched.forEach(({ quote, normRate }) => {
        const planLetter = (quote.plan || quote.plan_name || '').slice(-1).toUpperCase();
        if (!['F','G','N'].includes(planLetter)) return;
        if (planPrices[planLetter] == null || normRate < (planPrices[planLetter] as number)) {
          planPrices[planLetter] = normRate;
        }
        const existing = planRanges[planLetter];
        if (!existing) {
          planRanges[planLetter] = { min: normRate, max: normRate, count: 1 };
        } else {
          if (normRate < existing.min) existing.min = normRate;
          if (normRate > existing.max) existing.max = normRate;
          existing.count += 1;
        }
      });

      const allRates = enriched.map(e => e.normRate);
      const min = allRates.length ? Math.min(...allRates) : undefined;
      const max = allRates.length ? Math.max(...allRates) : undefined;

      // --- AM Best rating derivation ----------------------------------------------------
      // Collect potential rating fields from quotes (company_base.ambest_rating, ambest_rating, rating)
  const ratingCandidates: string[] = [];
  cQuotes.forEach((q:any) => {
        const r1 = q?.company_base?.ambest_rating;
        const r2 = q?.company?.ambest_rating; // in case structure differs for some carriers
        const r3 = q?.ambest_rating;
        const r4 = q?.rating; // last resort generic field
        [r1,r2,r3,r4].forEach(r => {
          if (typeof r === 'string' && r.trim()) ratingCandidates.push(r.trim().toUpperCase());
        });
      });
      let derivedRating: string | undefined;
      if (ratingCandidates.length) {
        // Mode (most frequent) to smooth inconsistencies
        const freq = ratingCandidates.reduce<Record<string, number>>((acc, r) => { acc[r] = (acc[r]||0)+1; return acc; }, {});
        derivedRating = Object.entries(freq).sort((a,b)=> b[1]-a[1] || a[0].localeCompare(b[0]))[0][0];
      }
      // Basic normalization for variants like 'A+' vs 'A PLUS' could be added here if encountered.

      return { id: name, name, logo, rating: derivedRating || undefined, min, max, plans: planPrices, planRanges, __preferred: preferredIds.has(name) } as any;
    });
    // Sort carriers by lowest normalized rate (ascending). If tie, fallback to name.
    summaries.sort((a, b) => {
      if (a.min == null && b.min == null) return a.name.localeCompare(b.name);
      if (a.min == null) return 1;
      if (b.min == null) return -1;
      if (a.min === b.min) return a.name.localeCompare(b.name);
      return a.min - b.min;
    });
    // Sort carriers by lowest available (normalized) rate to align with primary shop behavior
    const sorted = [...summaries].sort((a, b) => {
      const aMin = typeof a.min === 'number' ? a.min : Number.POSITIVE_INFINITY;
      const bMin = typeof b.min === 'number' ? b.min : Number.POSITIVE_INFINITY;
      if (aMin === bMin) return (a.name || '').localeCompare(b.name || '');
      return aMin - bMin;
    });
    setCarrierSummaries(sorted);
    if (!firstCarrierReadyTs && summaries.length > 0) {
      const ts = performance.now();
      setFirstCarrierReadyTs(ts);
      if (!firstPlanVisibleMs && fetchStartTs) setFirstPlanVisibleMs(ts - fetchStartTs);
    }
    const [carrierName, carrierQuotes] = entries[0];
    return { carrierName, carrierQuotes };
  }, [quotes, applyDiscounts]);

  // Adapter integration: legacy grouping still computed (for fallback) but UI always prefers adapter summaries.

  // Carrier search (listens to sidebar events / storage)
  // Hydration-safe default; apply persisted carrier search after mount to avoid SSR mismatch.
  const [carrierSearch, setCarrierSearch] = useState<string>('');
  useEffect(() => {
    try {
      const persisted = localStorage.getItem('carrier_search_query');
      if (persisted) setCarrierSearch(persisted);
    } catch {}
  }, []);
  useEffect(() => {
    const STORAGE_KEY = 'carrier_search_query';
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setCarrierSearch(e.newValue || '');
        setCarrierPage(1);
      }
    };
    const handleCustom = (e: any) => {
      const q = e?.detail?.query;
      if (typeof q === 'string') { setCarrierSearch(q); setCarrierPage(1); }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('carrierSearch:changed', handleCustom as EventListener);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('carrierSearch:changed', handleCustom as EventListener);
    };
  }, []);

  // Category + View toggles (replacing upper tabs)
  const [activeCategory, setActiveCategory] = useState(initialCategory || 'medigap');
  const [preferredOnly, setPreferredOnly] = useState(true);

  // Adapter shadow integration (Medigap only for now) – must run after activeCategory declaration
  const { normalized: adapterMedigapQuotes, summaries: adapterMedigapSummaries, timing: adapterTiming } = useCategoryQuotes<any>('medigap', activeCategory==='medigap' ? quotes : [], {
    applyDiscounts,
    enabled: true,
  });
  if (adapterTiming.count && typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.debug('ADAPTER_PERF medigap', adapterTiming);
  }

  // Resolve carriers (legacy vs adapter derived) early so downstream memos (availablePlans, pagination) use unified source
  const carriers = useMemo(() => {
    if (activeCategory === 'medigap' && adapterMedigapSummaries?.length) {
      const productCategory = mapUICategoryToProductCategory('medigap') || 'medicare-supplement';
      const enriched = adapterMedigapSummaries.map((s: any) => {
        const planKeys = ['F','G','N'] as const;
        const candidatePrices: number[] = [];
        planKeys.forEach(pk => { const p = s.plans[pk]; if (typeof p === 'number') candidatePrices.push(p); });
        const min = candidatePrices.length ? Math.min(...candidatePrices) : undefined;
        const max = candidatePrices.length ? Math.max(...candidatePrices) : undefined;
        // Find a representative quote from normalized adapter quotes for enrichment
        const representativeQuote = adapterMedigapQuotes?.find((q: any) => q.carrier?.id === s.carrierId || q.carrier?.name === s.carrierName);
        const enhancedInfo = representativeQuote
          ? getEnhancedCarrierInfo(representativeQuote, productCategory as any)
          : { displayName: s.carrierName, logoUrl: s.logoUrl || '/images/carrier-placeholder.svg', isPreferred: false, priority: undefined };
        return {
          id: s.carrierId,
          name: enhancedInfo.displayName || s.carrierName,
          logo: enhancedInfo.logoUrl || s.logoUrl || `/carrier-logos/1.png`,
          rating: s.rating || 'N/A',
          min,
          max,
          plans: s.plans,
          planRanges: s.planRanges,
          __preferred: !!enhancedInfo.isPreferred,
          __preferredPriority: enhancedInfo.priority ?? 999,
        };
      });
      // Sort: preferred first by priority, then by min rate, then name
      enriched.sort((a: any, b: any) => {
        if (a.__preferred && !b.__preferred) return -1;
        if (!a.__preferred && b.__preferred) return 1;
        if (a.__preferred && b.__preferred) {
          if (a.__preferredPriority !== b.__preferredPriority) return a.__preferredPriority - b.__preferredPriority;
        }
        const aMin = typeof a.min === 'number' ? a.min : Number.POSITIVE_INFINITY;
        const bMin = typeof b.min === 'number' ? b.min : Number.POSITIVE_INFINITY;
        if (aMin === bMin) return (a.name || '').localeCompare(b.name || '');
        return aMin - bMin;
      });
      return enriched;
    }
    // Fallback: use legacy computed summaries (still hydrated above) if adapter produced none
    return carrierSummaries;
  }, [activeCategory, adapterMedigapSummaries, adapterMedigapQuotes, carrierSummaries]);

  // When leaving Medigap and coming back, we want to briefly show skeletons instead of stale carrier boxes.
  // We detect a return by tracking previous category and clearing transient carrier arrays; hydrateExisting() will repopulate.
  const [prevCategory, setPrevCategory] = useState<string>('medigap');
  useEffect(() => {
    if (prevCategory !== activeCategory) {
      if (activeCategory === 'medigap') {
        // Clear streamed + summaries so UI renders loading skeleton while legacy/adapters rebuild.
        setStreamedCarriers([]);
        // Only clear carrierSummaries if we have quotes cached (prevents flicker on first ever load)
        if (carrierSummaries.length) setCarrierSummaries([]);
        // Reset first carrier timing to recalc perf metrics
        setFirstCarrierReadyTs(null);
      }
      setPrevCategory(activeCategory);
    }
  }, [activeCategory, prevCategory, carrierSummaries.length]);

  // PDP (drug-plan) adapters integration (simplified first pass)
  const { summaries: pdpSummaries, normalized: pdpNormalized } = useCategoryQuotes<any>('drug-plan', activeCategory==='drug-plan' ? quotes : [], { enabled: true });
  // Persist PDP normalized quotes for details page (lightweight cache)
  useEffect(() => {
    if (pdpNormalized && pdpNormalized.length) {
      try {
        localStorage.setItem('drug_plan_normalized_quotes', JSON.stringify(pdpNormalized));
      } catch {}
    }
  }, [pdpNormalized]);
  const pdpCarriers = useMemo(() => {
    if (activeCategory !== 'drug-plan') return [] as any[];
    const productCategory = mapUICategoryToProductCategory('drug-plan') || 'drug-plan';
    return pdpSummaries.map(s => {
      const range = s.planRanges?.PDP;
      const related = pdpNormalized.filter(q => q.carrier.id === s.carrierId);
      let star: number | undefined; let deductible: number | undefined; let representativePlan: string | undefined;
      related.forEach(r => {
        const sr = r.metadata?.starRating;
        if (typeof sr === 'number') star = sr;
        const ded = r.metadata?.deductible;
        if (typeof ded === 'number' && (deductible == null || ded < deductible)) deductible = ded;
        if (!representativePlan || r.pricing.monthly === s.plans.PDP) representativePlan = r.plan.display;
      });
      // use enhanced carrier info for consistent naming + logo (preferred logic)
      const enhancedInfo = related.length ? getEnhancedCarrierInfo(related[0], productCategory as any) : {
        displayName: s.carrierName,
        logoUrl: s.logoUrl || '/images/carrier-placeholder.svg'
      };
      return {
        id: s.carrierId,
        name: enhancedInfo.displayName || s.carrierName,
        logo: enhancedInfo.logoUrl || s.logoUrl || '/images/carrier-placeholder.svg',
        rating: star != null ? String(star) : 'N/A',
        min: s.plans.PDP,
        max: range?.max,
        planRange: range,
        deductible,
        count: range?.count || 1,
        planName: (s as any)._planName || representativePlan,
      };
    });
  }, [pdpSummaries, pdpNormalized, activeCategory]);

  // Add advantage adapter hook usage
  const { summaries: advantageSummaries, normalized: advantageNormalized } = useCategoryQuotes<any>('advantage', activeCategory==='advantage' ? quotes : [], { enabled: true });
  // Persist advantage normalized quotes lightly for details if needed
  useEffect(()=>{ if(advantageNormalized?.length){ try{ localStorage.setItem('advantage_normalized_quotes', JSON.stringify(advantageNormalized)); }catch{} } },[advantageNormalized]);
  const advantageCarriers = useMemo(()=> {
    if (activeCategory !== 'advantage') return [] as any[];
    const productCategory = mapUICategoryToProductCategory('advantage') || 'medicare-advantage';
    const enriched = advantageSummaries.map(s => {
      const range = s.planRanges?.MA;
      const related = advantageNormalized.filter(q => q.carrier.id === s.carrierId);
      let medDed: string|undefined; let drugDed: string|undefined; let star: number|undefined; let moop: string|undefined; let planName: string|undefined;
      related.forEach(r => {
        if (!medDed && r.metadata?.medicalDeductible) medDed = r.metadata.medicalDeductible;
        if (!drugDed && r.metadata?.drugDeductible) drugDed = r.metadata.drugDeductible;
        if (!moop && r.metadata?.moop) moop = r.metadata.moop;
        if (!planName) planName = r.plan.display;
        if (typeof r.metadata?.starRating === 'number' && star == null) star = r.metadata.starRating;
      });
      const representativeQuote = related[0];
      const enhancedInfo = representativeQuote
        ? getEnhancedCarrierInfo(representativeQuote, productCategory as any)
        : { displayName: s.carrierName, logoUrl: s.logoUrl || '/images/carrier-placeholder.svg', isPreferred: false, priority: undefined };
      return {
        id: s.carrierId,
        name: enhancedInfo.displayName || s.carrierName,
        logo: enhancedInfo.logoUrl || s.logoUrl || '/carrier-logos/1.png',
        rating: star,
        min: range?.min,
        max: range?.max,
        planRange: range,
        planName,
        medicalDeductible: medDed,
        drugDeductible: drugDed,
        moop,
        count: related.length,
        __preferred: !!enhancedInfo.isPreferred,
        __preferredPriority: enhancedInfo.priority ?? 999,
      };
    });
    enriched.sort((a: any, b: any) => {
      if (a.__preferred && !b.__preferred) return -1;
      if (!a.__preferred && b.__preferred) return 1;
      if (a.__preferred && b.__preferred && a.__preferredPriority !== b.__preferredPriority) return a.__preferredPriority - b.__preferredPriority;
      const aMin = typeof a.min === 'number' ? a.min : Number.POSITIVE_INFINITY;
      const bMin = typeof b.min === 'number' ? b.min : Number.POSITIVE_INFINITY;
      if (aMin === bMin) return (a.name || '').localeCompare(b.name || '');
      return aMin - bMin;
    });
    return enriched;
  }, [activeCategory, advantageSummaries, advantageNormalized]);

  // New category adapter integrations ----------------------------------------------------
  const { summaries: dentalSummaries, normalized: dentalNormalized } = useCategoryQuotes<any>('dental', activeCategory==='dental' ? quotes : [], { enabled: true });
  const dentalCarriers = useMemo(() => {
    if (activeCategory !== 'dental') return [] as any[];
    const productCategory = mapUICategoryToProductCategory('dental') || 'dental';
    const enriched = dentalSummaries.map(s => {
      const range = s.planRanges?.DENTAL; const related = dentalNormalized.filter(q => q.carrier.id === s.carrierId);
      let annualMax: number|undefined; let deductibleIndividual: number|undefined; let visionIncluded: boolean|undefined; let hearingIncluded: boolean|undefined; let planName: string|undefined;
      related.forEach(r => {
        if (annualMax == null && typeof r.metadata?.annualMax === 'number') annualMax = r.metadata.annualMax;
        if (deductibleIndividual == null && typeof r.metadata?.deductibleIndividual === 'number') deductibleIndividual = r.metadata.deductibleIndividual;
        if (visionIncluded == null && typeof r.metadata?.visionIncluded === 'boolean') visionIncluded = r.metadata.visionIncluded;
        if (hearingIncluded == null && typeof r.metadata?.hearingIncluded === 'boolean') hearingIncluded = r.metadata.hearingIncluded;
        if (!planName) planName = r.plan.display;
      });
      const representativeQuote = related[0];
      const enhancedInfo = representativeQuote ? getEnhancedCarrierInfo(representativeQuote, productCategory as any) : { displayName: s.carrierName, logoUrl: s.logoUrl, isPreferred: false, priority: undefined };
      return { id: s.carrierId, name: enhancedInfo.displayName || s.carrierName, logo: enhancedInfo.logoUrl || s.logoUrl || '/carrier-logos/1.png', min: range?.min, max: range?.max, planRange: range, planName, annualMax, deductibleIndividual, visionIncluded, hearingIncluded, count: related.length, __preferred: !!enhancedInfo.isPreferred, __preferredPriority: enhancedInfo.priority ?? 999 };
    });
    enriched.sort((a:any,b:any)=>{ if(a.__preferred&&!b.__preferred) return -1; if(!a.__preferred&&b.__preferred) return 1; if(a.__preferred&&b.__preferred&&a.__preferredPriority!==b.__preferredPriority) return a.__preferredPriority-b.__preferredPriority; const aMin=typeof a.min==='number'?a.min:Infinity; const bMin=typeof b.min==='number'?b.min:Infinity; if(aMin===bMin) return (a.name||'').localeCompare(b.name||''); return aMin-bMin;});
    return enriched;
  }, [activeCategory, dentalSummaries, dentalNormalized]);

  const { summaries: cancerSummaries, normalized: cancerNormalized } = useCategoryQuotes<any>('cancer', activeCategory==='cancer' ? quotes : [], { enabled: true });
  const cancerCarriers = useMemo(() => {
    if (activeCategory !== 'cancer') return [] as any[];
    const productCategory = mapUICategoryToProductCategory('cancer') || 'cancer';
    const enriched = cancerSummaries.map(s => {
      const range = s.planRanges?.CANCER; const related = cancerNormalized.filter(q => q.carrier.id === s.carrierId);
      let lumpSum: number|undefined; let wellness: number|undefined; let recurrence: boolean|undefined; let planName: string|undefined;
      related.forEach(r => {
        if (lumpSum == null && typeof r.metadata?.lumpSum === 'number') lumpSum = r.metadata.lumpSum;
        if (wellness == null && typeof r.metadata?.wellness === 'number') wellness = r.metadata.wellness;
        if (recurrence == null && typeof r.metadata?.recurrence === 'boolean') recurrence = r.metadata.recurrence;
        if (!planName) planName = r.plan.display;
      });
      const representativeQuote = related[0];
      const enhancedInfo = representativeQuote ? getEnhancedCarrierInfo(representativeQuote, productCategory as any) : { displayName: s.carrierName, logoUrl: s.logoUrl, isPreferred: false, priority: undefined };
      return { id: s.carrierId, name: enhancedInfo.displayName || s.carrierName, logo: enhancedInfo.logoUrl || s.logoUrl || '/carrier-logos/1.png', min: range?.min, max: range?.max, planRange: range, planName, lumpSum, wellness, recurrence, count: related.length, __preferred: !!enhancedInfo.isPreferred, __preferredPriority: enhancedInfo.priority ?? 999 };
    });
    enriched.sort((a:any,b:any)=>{ if(a.__preferred&&!b.__preferred) return -1; if(!a.__preferred&&b.__preferred) return 1; if(a.__preferred&&b.__preferred&&a.__preferredPriority!==b.__preferredPriority) return a.__preferredPriority-b.__preferredPriority; const aMin=typeof a.min==='number'?a.min:Infinity; const bMin=typeof b.min==='number'?b.min:Infinity; if(aMin===bMin) return (a.name||'').localeCompare(b.name||''); return aMin-bMin;});
    return enriched;
  }, [activeCategory, cancerSummaries, cancerNormalized]);

  const { summaries: hospitalSummaries, normalized: hospitalNormalized } = useCategoryQuotes<any>('hospital', activeCategory==='hospital' ? quotes : [], { enabled: true });
  // Defensive: if hospital quotes flicker (appear then disappear), keep a sticky snapshot while active session
  const [stickyHospitalQuotes, setStickyHospitalQuotes] = useState<any[]>([]);
  useEffect(() => {
    if (activeCategory === 'hospital' && quotes && quotes.length) {
      setStickyHospitalQuotes(prev => prev.length >= quotes.length ? prev : quotes);
    }
  }, [activeCategory, quotes]);
  const effectiveHospitalNormalized = activeCategory==='hospital' && hospitalNormalized.length===0 && stickyHospitalQuotes.length
    ? useCategoryQuotes<any>('hospital', stickyHospitalQuotes, { enabled: true }).normalized
    : hospitalNormalized;
  const hospitalCarriers = useMemo(() => {
    if (activeCategory !== 'hospital') return [] as any[];
    const productCategory = mapUICategoryToProductCategory('hospital-indemnity') || 'hospital-indemnity';
    const enriched = hospitalSummaries.map(s => {
      const range = s.planRanges?.HOSP; const related = (effectiveHospitalNormalized || hospitalNormalized).filter(q => q.carrier.id === s.carrierId);
      let dailyBenefit: number|undefined; let daysCovered: number|undefined; let ambulance: number|undefined; let icuUpgrade: boolean|undefined; let planName: string|undefined;
      related.forEach(r => {
        if (dailyBenefit == null && typeof r.metadata?.dailyBenefit === 'number') dailyBenefit = r.metadata.dailyBenefit;
        if (daysCovered == null && typeof r.metadata?.daysCovered === 'number') daysCovered = r.metadata.daysCovered;
        if (ambulance == null && typeof r.metadata?.ambulance === 'number') ambulance = r.metadata.ambulance;
        if (icuUpgrade == null && typeof r.metadata?.icuUpgrade === 'boolean') icuUpgrade = r.metadata.icuUpgrade;
        if (!planName) planName = r.plan.display;
      });
      const representativeQuote = related[0];
      const enhancedInfo = representativeQuote ? getEnhancedCarrierInfo(representativeQuote, productCategory as any) : { displayName: s.carrierName, logoUrl: s.logoUrl, isPreferred: false, priority: undefined };
      return { id: s.carrierId, name: enhancedInfo.displayName || s.carrierName, logo: enhancedInfo.logoUrl || s.logoUrl || '/carrier-logos/1.png', min: range?.min, max: range?.max, planRange: range, planName, dailyBenefit, daysCovered, ambulance, icuUpgrade, count: related.length, __preferred: !!enhancedInfo.isPreferred, __preferredPriority: enhancedInfo.priority ?? 999 };
    });
    enriched.sort((a:any,b:any)=>{ if(a.__preferred&&!b.__preferred) return -1; if(!a.__preferred&&b.__preferred) return 1; if(a.__preferred&&b.__preferred&&a.__preferredPriority!==b.__preferredPriority) return a.__preferredPriority-b.__preferredPriority; const aMin=typeof a.min==='number'?a.min:Infinity; const bMin=typeof b.min==='number'?b.min:Infinity; if(aMin===bMin) return (a.name||'').localeCompare(b.name||''); return aMin-bMin;});
    return enriched;
  }, [activeCategory, hospitalSummaries, hospitalNormalized]);

  const { summaries: finalExpenseSummaries, normalized: finalExpenseNormalized } = useCategoryQuotes<any>('final-expense', activeCategory==='final-expense' ? quotes : [], { enabled: true });
  const finalExpenseCarriers = useMemo(() => {
    if (activeCategory !== 'final-expense') return [] as any[];
    const productCategory = mapUICategoryToProductCategory('final-expense') || 'final-expense';
    const enriched = finalExpenseSummaries.map(s => {
      const range = s.planRanges?.FE; const related = finalExpenseNormalized.filter(q => q.carrier.id === s.carrierId);
      let faceAmount: number|undefined; let graded: boolean|undefined; let immediate: boolean|undefined; let accidental: boolean|undefined; let planName: string|undefined;
      related.forEach(r => {
        if (faceAmount == null && typeof r.metadata?.faceAmount === 'number') faceAmount = r.metadata.faceAmount;
        if (graded == null && typeof r.metadata?.graded === 'boolean') graded = r.metadata.graded;
        if (immediate == null && typeof r.metadata?.immediate === 'boolean') immediate = r.metadata.immediate;
        if (accidental == null && typeof r.metadata?.accidental === 'boolean') accidental = r.metadata.accidental;
        if (!planName) planName = r.plan.display;
      });
      const representativeQuote = related[0];
      const enhancedInfo = representativeQuote ? getEnhancedCarrierInfo(representativeQuote, productCategory as any) : { displayName: s.carrierName, logoUrl: s.logoUrl, isPreferred: false, priority: undefined };
      return { id: s.carrierId, name: enhancedInfo.displayName || s.carrierName, logo: enhancedInfo.logoUrl || s.logoUrl || '/carrier-logos/1.png', min: range?.min, max: range?.max, planRange: range, planName, faceAmount, graded, immediate, accidental, count: related.length, __preferred: !!enhancedInfo.isPreferred, __preferredPriority: enhancedInfo.priority ?? 999 };
    });
    enriched.sort((a:any,b:any)=>{ if(a.__preferred&&!b.__preferred) return -1; if(!a.__preferred&&b.__preferred) return 1; if(a.__preferred&&b.__preferred&&a.__preferredPriority!==b.__preferredPriority) return a.__preferredPriority-b.__preferredPriority; const aMin=typeof a.min==='number'?a.min:Infinity; const bMin=typeof b.min==='number'?b.min:Infinity; if(aMin===bMin) return (a.name||'').localeCompare(b.name||''); return aMin-bMin;});
    return enriched;
  }, [activeCategory, finalExpenseSummaries, finalExpenseNormalized]);

  // When live adapter mode first produces summaries, record timing metrics similar to legacy pipeline
  useEffect(() => {
    if (activeCategory === 'medigap' && adapterMedigapSummaries?.length && !firstCarrierReadyTs) {
      const ts = performance.now();
      setFirstCarrierReadyTs(ts);
      if (fetchStartTs && !firstPlanVisibleMs) setFirstPlanVisibleMs(ts - fetchStartTs);
    }
  }, [activeCategory, adapterMedigapSummaries, firstCarrierReadyTs, fetchStartTs, firstPlanVisibleMs]);

  // Pagination for carrier-based sections --------------------------------------------------
  const CARRIER_PAGE_SIZE = 12; // configurable page size
  const [carrierPage, setCarrierPage] = useState(1);
  // Hydrate stored page index
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('medigap_carrier_page');
      const parsed = raw ? parseInt(raw, 10) : 1;
      if (parsed > 0) setCarrierPage(parsed);
    } catch {}
  }, []);

  const effectiveCarriers = streamingEnabled && streamedCarriers.length
    ? streamedCarriers
    : carrierSummaries;


  // Apply search filter first (case-insensitive substring on carrier name)
  const searchedCarriers = useMemo(() => {
    if (!carrierSearch.trim()) return effectiveCarriers;
    const q = carrierSearch.trim().toLowerCase();
    return effectiveCarriers.filter((c: any) => (c.carrierName || c.name || '').toLowerCase().includes(q));
  }, [effectiveCarriers, carrierSearch]);

  // Apply preferred filter before slicing so page counts stay consistent with user view
  const filteredCarriers = useMemo(() => {
    const base = searchedCarriers;
    if (preferredOnly && activeCategory === 'medigap') {
      return base.filter((c: any) => c.__preferred);
    }
    return base;
  }, [searchedCarriers, preferredOnly, activeCategory]);

  const totalCarrierPages = Math.max(1, Math.ceil(filteredCarriers.length / CARRIER_PAGE_SIZE));
  // Clamp page if data size shrinks
  useEffect(() => {
    if (carrierPage > totalCarrierPages) setCarrierPage(1);
  }, [carrierPage, totalCarrierPages]);

  const paginatedCarriers = useMemo(() => {
    const start = (carrierPage - 1) * CARRIER_PAGE_SIZE;
    return filteredCarriers.slice(start, start + CARRIER_PAGE_SIZE);
  }, [filteredCarriers, carrierPage]);

  // Persist page index
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('medigap_carrier_page', String(carrierPage)); } catch {}
    }
  }, [carrierPage]);

  const handlePageChange = (dir: 'prev' | 'next') => {
    setCarrierPage(p => {
      if (dir === 'prev') return Math.max(1, p - 1);
      return Math.min(totalCarrierPages, p + 1);
    });
  };

  const PaginationControls: React.FC = () => {
    if (!filteredCarriers.length) return null;
    const start = (carrierPage - 1) * CARRIER_PAGE_SIZE + 1;
    const end = Math.min(filteredCarriers.length, carrierPage * CARRIER_PAGE_SIZE);
    return (
      <div className="flex items-center justify-between gap-4 pt-2" aria-label="Carrier pagination controls">
        <div className="text-[11px] text-slate-600 dark:text-slate-400" aria-live="polite">
          Showing <span className="font-medium">{start}</span>–<span className="font-medium">{end}</span> of <span className="font-medium">{filteredCarriers.length}</span> carriers
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" disabled={carrierPage === 1} onClick={() => handlePageChange('prev')} aria-label="Previous page">
            <FaChevronLeft className="w-3 h-3" />
          </Button>
          <span className="text-[11px] tabular-nums min-w-[3.5rem] text-center">{carrierPage} / {totalCarrierPages}</span>
            <Button size="sm" variant="outline" disabled={carrierPage === totalCarrierPages} onClick={() => handlePageChange('next')} aria-label="Next page">
            <FaChevronRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    );
  };

  // Global selected plan letter for dark inverse experiment (could be per-carrier later)
  const [selectedPlan, setSelectedPlan] = useState<'F'|'G'|'N'>('G');
  // Variant visibility toggles (developer aids)
  const [variantVisibility, setVariantVisibility] = useState({
    minimal: true,
    lightInverse: true,
    comparison: true,
  });

  const toggleVariant = useCallback((key: keyof typeof variantVisibility) => {
    setVariantVisibility(v => ({ ...v, [key]: !v[key] }));
  }, []);

  // (handleRefetch & simulateStreaming consolidated later)

  // effectiveCarriers moved above to integrate with pagination pipeline

  const fetchDuration = fetchStartTs && fetchEndTs ? (fetchEndTs - fetchStartTs) : null;
  const ttfcp = fetchStartTs && firstCarrierReadyTs ? (firstCarrierReadyTs - fetchStartTs) : null; // time to first carrier processed

  // Compute which plans exist in any carrier (based on planRanges count or presence in fallback)
  const availablePlans = useMemo(() => {
    const letters: ('F'|'G'|'N')[] = ['F','G','N'];
    const availability = letters.filter(l => carriers.some(c => c.planRanges?.[l]?.count > 0 || (c.plans && c.plans[l] != null)));
    return availability.length ? availability : letters; // fallback to all if nothing found
  }, [carriers]);

  // (Removed earlier attempt to wrap original /cards page)
  // Ensure selectedPlan is still valid when availability changes
  useEffect(() => {
    if (!availablePlans.includes(selectedPlan)) {
      const fallback = (['G','N','F'] as const).find(p => availablePlans.includes(p));
      if (fallback) setSelectedPlan(fallback);
    }
  }, [availablePlans, selectedPlan]);

  // (Removed Figma variant specific price helpers and plan-specific quote arrays after cleanup)

  // Category + View toggles (replacing upper tabs)
  // (moved activeCategory earlier for pagination dependency ordering)

  // Conditional quote hydration (no auto generation). We look for existing categories and medigap quotes.
  useEffect(() => {
    let mounted = true;
    async function hydrateExisting() {
      setQuoteError(null);
      setFetchStartTs(performance.now());
      setFetchEndTs(null); setFirstCarrierReadyTs(null);
      if (typeof window === 'undefined') return;
      try {
        const raw = localStorage.getItem(SELECTED_CATEGORIES_KEY);
        const selectedCategories: string[] = raw ? JSON.parse(raw) : [];
        if (!selectedCategories.includes(activeCategory)) {
          setQuotes([]);
          return;
        }
        setLoadingQuotes(true);
        let loadedQuotes: any[] = [];
        if (activeCategory === 'medigap') {
          const keys = getAllMedigapStorageKeys();
          for (const k of keys) {
            const part = await loadFromStorage(k, []);
            if (Array.isArray(part) && part.length) loadedQuotes = loadedQuotes.concat(part);
          }
          if (!loadedQuotes.length) {
            const legacy = await loadFromStorage(REAL_QUOTES_KEY, []);
            if (Array.isArray(legacy) && legacy.length) loadedQuotes = legacy;
          }
        } else {
          // Resolve primary + legacy storage keys for non-medigap categories
          const resolveKeys = (cat: string): string[] => {
            if (cat === 'hospital') return ['medicare_hospital_indemnity_quotes','medicare_hospital_quotes'];
            return [`medicare_${cat.replace(/-/g,'_')}_quotes`];
          };
          const primaryKeys = resolveKeys(activeCategory);
          for (const key of primaryKeys) {
            const data = await loadFromStorage(key, []);
            if (Array.isArray(data) && data.length) { loadedQuotes = data; break; }
          }
          // Fallback: attempt legacy storage keys if nothing loaded (backward compatibility)
          if ((!loadedQuotes || loadedQuotes.length === 0)) {
            const LEGACY_KEYS: Record<string,string[]> = {
              'dental': ['dental_quotes','medicare_dental_quotes','dentalQuotes'],
              'cancer': ['cancer_insurance_quotes','medicare_cancer_insurance_quotes'],
              'hospital': ['hospital_indemnity_quotes','medicare_hospital_indemnity_quotes'],
              'final-expense': ['final_expense_quotes','final_expense_life_quotes','medicare_final_expense_life_quotes']
            };
            const fallbacks = LEGACY_KEYS[activeCategory] || [];
            for (const fk of fallbacks) {
              try {
                const legacy = await loadFromStorage(fk, []);
                if (Array.isArray(legacy) && legacy.length) {
                  loadedQuotes = legacy;
                  console.info(`[hydrateExisting] Loaded ${legacy.length} ${activeCategory} quotes from legacy key '${fk}'.`);
                  break;
                }
              } catch {}
            }
          }
        }
        if (!mounted) return;
        setQuotes(loadedQuotes);
        setFetchEndTs(performance.now());
      } catch (e:any) {
        if (!mounted) return;
        setQuoteError(e.message || 'Failed to load stored quotes');
      } finally {
        if (mounted) setLoadingQuotes(false);
      }
    }
    hydrateExisting();
    return () => { mounted = false; };
  }, [activeCategory, reloadIndex]);
  // Consolidated state (removed duplicate inner component)
  const [viewVisibility, setViewVisibility] = useState({ cards: true, planDetails: false });
  const [activeCarrierId, setActiveCarrierId] = useState<string | null>(null);
  const [sidebarPanelOpen, setSidebarPanelOpen] = useState(false);
  const [closeSignal, setCloseSignal] = useState(0);
  const loadingActive = loadingQuotes && !carrierSummaries.length;
  const router = useRouter();
  const toggleView = (key: keyof typeof viewVisibility) => setViewVisibility(v => ({ ...v, [key]: !v[key] }));
  const handleRefetch = () => setReloadIndex(i => i + 1);
  // (CARRIER_PAGE_SIZE declared earlier – avoid redeclaration)
  const simulateStreaming = async () => {
    if (streamingActive) return;
    setStreamingActive(true);
    setStreamedCarriers([]);
    const snapshot = [...carrierSummaries];
    await runCarrierStream(snapshot, {
      delayMs: 400,
      onFirst: () => {
        if (fetchStartTs && !firstPlanVisibleMs) setFirstPlanVisibleMs(performance.now() - fetchStartTs);
      },
      onComplete: () => {
        setStreamingActive(false);
        if (fetchStartTs && !allPlansCompleteMs) setAllPlansCompleteMs(performance.now() - fetchStartTs);
      }
    }, (carrier) => setStreamedCarriers(prev => [...prev, carrier]));
  };

  // Query helper (avoid useSearchParams to remove Suspense split)
  const updateQuery = useCallback((mutate: (p: URLSearchParams) => void) => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    mutate(params);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router]);

  // Deep-link hydration
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view');
      const carrierParam = params.get('carrier');
      const categoryParam = params.get('category');
      if (categoryParam && categoryParam !== activeCategory) setActiveCategory(categoryParam);
      if (viewParam === 'plan-details' && carrierParam) {
        setActiveCarrierId(carrierParam);
        setViewVisibility({ cards: false, planDetails: true });
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openPlanDetails = useCallback((carrier: any) => {
    if (!carrier) return;
    setActiveCarrierId(carrier.id);
    updateQuery(p => { p.set('carrier', carrier.id); p.set('view', 'plan-details'); });
    setViewVisibility({ cards: false, planDetails: true });
  }, [updateQuery]);

  const openPdpDetails = useCallback((carrier: any) => {
    if (!carrier) return;
    setActiveCarrierId(carrier.id);
    updateQuery(p => { p.set('carrier', carrier.id); p.set('view', 'plan-details'); p.set('category', 'drug-plan'); });
    setViewVisibility({ cards: false, planDetails: true });
  }, [updateQuery]);

  // Generic helper for new categories (advantage, dental, cancer, hospital, final-expense)
  const openCategoryDetails = useCallback((carrierId: string, category: string) => {
    if (!carrierId) return;
    setActiveCarrierId(carrierId);
    updateQuery(p => { p.set('carrier', carrierId); p.set('view', 'plan-details'); p.set('category', category); });
    setActiveCategory(category);
    setViewVisibility({ cards: false, planDetails: true });
  }, [updateQuery]);

  const closePlanDetails = useCallback(() => {
    setViewVisibility({ cards: true, planDetails: false });
    setActiveCarrierId(null);
    updateQuery(p => { p.delete('carrier'); p.delete('view'); p.delete('category'); });
  }, [updateQuery]);

  // (removed duplicate handlers after consolidation)

  // View mode (card | list) - moved from inline IIFE to satisfy Rules of Hooks
  // Hydration-safe default; apply persisted view mode post-mount.
  const [quoteViewMode, setQuoteViewMode] = useState<'card' | 'list'>('card');
  useEffect(() => {
    try {
      const persisted = localStorage.getItem('quote_view_mode') as 'card' | 'list' | null;
      if (persisted === 'card' || persisted === 'list') setQuoteViewMode(persisted);
    } catch {}
  }, []);
  useEffect(() => {
    const STORAGE_KEY = 'quote_view_mode';
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const val = (e.newValue as 'card' | 'list') || 'card';
        setQuoteViewMode(val === 'list' ? 'list' : 'card');
      }
    };
    const handleCustom = (e: any) => {
      const mode = e?.detail?.mode;
      if (mode === 'list' || mode === 'card') setQuoteViewMode(mode);
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('quoteViewMode:changed', handleCustom as EventListener);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('quoteViewMode:changed', handleCustom as EventListener);
    };
  }, []);

  // (deep link sync handled on initial mount above)

  return (
    <div className="relative min-h-screen w-full px-4 py-10 mx-auto max-w-7xl">
      {/* Page-level overlay for sidebar panel (modal-style) */}
      {sidebarPanelOpen && (
        <button
          type="button"
          aria-hidden="true"
          tabIndex={-1}
          onClick={() => setCloseSignal(s => s + 1)}
          className="fixed inset-0 z-[110] hidden lg:block bg-slate-950/5 dark:bg-black/5 backdrop-blur-xsm"
        />
      )}
      <div className="grid grid-cols-1 lg:grid-cols-[16rem_minmax(0,1fr)] relative">
        <aside className="sticky hidden lg:block self-start h-fit top-28 z-[120]">
          <SidebarShowcase
            onPanelStateChange={setSidebarPanelOpen}
            externalCloseSignal={closeSignal}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            preferredOnly={preferredOnly}
            onTogglePreferred={setPreferredOnly}
            applyDiscounts={applyDiscounts}
            onToggleApplyDiscounts={setApplyDiscounts}
            onGenerateQuotes={async (category, formData: any, plansList) => {
              try {
                // Early add category to selected list so button appears immediately
                let selected: string[] = [];
                try {
                  const rawEarly = localStorage.getItem('medicare_selected_categories');
                  if (rawEarly) selected = JSON.parse(rawEarly);
                } catch {}
                const alreadyHad = selected.includes(category);
                if (!alreadyHad) {
                  selected.push(category);
                  try { localStorage.setItem('medicare_selected_categories', JSON.stringify(selected)); } catch {}
                  // Dispatch event so sidebar can re-read instantly
                  try { window.dispatchEvent(new CustomEvent('selectedCategories:updated')); } catch {}
                }
                // Safe persistence helper to avoid localStorage quota errors
                const persistQuotes = (key: string, quotes: any[]) => {
                  if (typeof window === 'undefined') return;
                  const attemptSave = (data: any) => {
                    localStorage.setItem(key, JSON.stringify(data));
                  };
                  const compressOne = (q: any) => {
                    if (!q || typeof q !== 'object') return q;
                    const copy: any = { ...q };
                    // Remove known large / rarely used fields
                    const largeFields = [
                      'description','long_description','detailed_description','terms','conditions','legal_text','disclaimer','benefits_description','coverage_details','exclusions','limitations','rider_description','plan_description',
                      'fullDescription','detailedBenefits','termsAndConditions','marketingMaterials','disclosures','legalDisclaimer','benefitDetails','underwritingGuidelines'
                    ];
                    largeFields.forEach(f => { if (f in copy) delete copy[f]; });
                    // Trim large string fields
                    Object.keys(copy).forEach(k => {
                      const v = copy[k];
                      if (typeof v === 'string' && v.length > 600) {
                        copy[k] = v.slice(0, 600) + '…';
                      }
                    });
                    // Limit large arrays
                    const arrayFields = ['benefits','features','riders'];
                    arrayFields.forEach(f => { if (Array.isArray(copy[f]) && copy[f].length > 12) copy[f] = copy[f].slice(0,12); });
                    return copy;
                  };
                  // Basic order by premium-ish field so truncation keeps most relevant
                  const sortByPremium = (arr: any[]) => [...arr].sort((a,b)=>{
                    const getP = (o:any)=> Number(o?.monthly_rate ?? o?.monthlyRate ?? o?.premium ?? o?.rate ?? o?.annual_rate ?? Infinity);
                    return getP(a)-getP(b);
                  });
                  const tryStrategies = (original: any[]) => {
                    const strategies: (()=>any[])[] = [];
                    strategies.push(()=> original); // full
                    strategies.push(()=> sortByPremium(original).slice(0,100)); // top 100
                    strategies.push(()=> sortByPremium(original).slice(0,60)); // top 60
                    strategies.push(()=> sortByPremium(original).slice(0,40).map(compressOne)); // top 40 compressed
                    strategies.push(()=> sortByPremium(original).slice(0,20).map(compressOne)); // top 20 compressed
                    for (const build of strategies) {
                      const data = build();
                      try {
                        attemptSave(data);
                        if (data.length && data.length < original.length) {
                          console.warn(`⚠️ Stored truncated quotes for ${key}: kept ${data.length} of ${original.length}`);
                        }
                        return;
                      } catch (e:any) {
                        if (!(e instanceof DOMException) || !/quota/i.test(e.name+e.message)) {
                          console.error('Unexpected quote save error', e);
                          return; // non-quota error; abort
                        }
                      }
                    }
                    try {
                      attemptSave([]);
                      console.warn(`⚠️ Could not store quotes for ${key}; saved empty array after all strategies failed.`);
                    } catch {}
                  };
                  try {
                    attemptSave(quotes);
                  } catch (e:any) {
                    if (e instanceof DOMException && /quota/i.test(e.name+e.message)) {
                      console.warn('LocalStorage quota exceeded, applying pruning/compression strategies for', key);
                      // Free up space by removing older quote categories (except current)
                      try {
                        const quoteKeysToClear = [
                          'medigap_plan_quotes_stub',
                          'medicare_advantage_quotes',
                          'medicare_drug_plan_quotes',
                          'medicare_dental_quotes',
                          'medicare_hospital_indemnity_quotes',
                          'medicare_final_expense_quotes',
                          'medicare_cancer_insurance_quotes'
                        ].filter(k=>k!==key);
                        quoteKeysToClear.forEach(k=>{ try { localStorage.removeItem(k); } catch {} });
                      } catch {}
                      tryStrategies(quotes);
                    } else {
                      console.error('Failed to save quotes for', key, e);
                    }
                  }
                };
                let storageKey = `medicare_${category.replace(/-/g,'_')}_quotes`;
                if (category === 'medigap') {
                  // Store per-plan using existing storage util pattern if possible; fallback single key
                  // We'll aggregate results from all selected plans
                  const plans = plansList && plansList.length ? plansList : ['G'];
                  const medigapParams = {
                    zipCode: String(formData.zipCode || ''),
                    age: String(formData.age || ''),
                    gender: (formData.gender || 'male').toString().toLowerCase().startsWith('m') ? 'M' : 'F',
                    tobacco: formData.tobaccoUse ? '1' : '0',
                    plans
                  } as any;
                  const { quotes: mgQuotes, error } = await getMedigapQuotes(medigapParams);
                  if (error) throw new Error(error);
                  if (mgQuotes && mgQuotes.length) {
                    // Persist under combined stub key (could refine to per-plan keys later)
                    persistQuotes('medigap_plan_quotes_stub', mgQuotes);
                    storageKey = 'medigap_plan_quotes_stub';
                  }
                } else if (category === 'advantage') {
                  const { quotes, error } = await getMedicareAdvantageQuotes({ zipCode: String(formData.zipCode) });
                  if (error) throw new Error(error);
                  if (quotes) persistQuotes(storageKey, quotes);
                } else if (category === 'drug-plan') {
                  const { quotes, error } = await getDrugPlanQuotes({ zipCode: String(formData.zipCode) } as any);
                  if (error) throw new Error(error);
                  if (quotes) persistQuotes(storageKey, quotes);
                } else if (category === 'dental') {
                  const { success, quotes, error } = await getDentalQuotes({
                    age: formData.age,
                    zipCode: String(formData.zipCode),
                    gender: formData.gender,
                    tobaccoUse: !!formData.tobaccoUse,
                    coveredMembers: formData.coveredMembers ? parseInt(formData.coveredMembers,10) : undefined
                  });
                  if (!success) throw new Error(error || 'Dental quote fetch failed');
                  persistQuotes(storageKey, quotes);
                } else if (category === 'cancer') {
                  const cancerParams = {
                    state: formData.state || 'TX',
                    age: parseInt(formData.age,10) || 65,
                    familyType: formData.familyType === 'family' ? 'Applicant and Spouse' : 'Applicant Only',
                    tobaccoStatus: formData.tobaccoUse ? 'Tobacco' : 'Non-Tobacco',
                    premiumMode: formData.premiumMode === 'annual' ? 'Annual' : 'Monthly Bank Draft',
                    carcinomaInSitu: formData.carcinomaInSitu ? '100%' : '25%',
                    benefitAmount: parseInt(formData.benefitAmount || '10000', 10)
                  } as any;
                  const { quotes, success, error } = await getCancerInsuranceQuotes(cancerParams);
                  if (!success) throw new Error(error || 'Cancer quote fetch failed');
                  persistQuotes(storageKey, quotes);
                } else if (category === 'hospital') {
                  const hospParams = {
                    zipCode: String(formData.zipCode),
                    age: parseInt(formData.age,10) || 65,
                    gender: (formData.gender || 'male').toString().toLowerCase().startsWith('m') ? 'M' : 'F',
                    tobaccoUse: !!formData.tobaccoUse
                  };
                  const { quotes, success, error } = await getHospitalIndemnityQuotes(hospParams as any);
                  if (!success) throw new Error(error || 'Hospital Indemnity quote fetch failed');
                  persistQuotes(storageKey, quotes);
                  // Also persist to canonical hospital_indemnity key for legacy tools & new adapter
                  try { persistQuotes('medicare_hospital_indemnity_quotes', quotes); } catch {}
                } else if (category === 'final-expense') {
                  const feParams = {
                    zipCode: String(formData.zipCode),
                    age: parseInt(formData.age,10) || 65,
                    gender: (formData.gender || 'male').toString().toLowerCase().startsWith('m') ? 'M' : 'F',
                    tobaccoUse: !!formData.tobaccoUse,
                    desiredFaceValue: formData.desiredFaceValue ? parseInt(formData.desiredFaceValue,10) : 10000
                  };
                  const { quotes, success, error } = await getFinalExpenseLifeQuotes(feParams as any);
                  if (!success) throw new Error(error || 'Final Expense quote fetch failed');
                  persistQuotes(storageKey, quotes);
                }

                // Finalize selected categories list (already added above if new)
                // Trigger reload to hydrate
                setReloadIndex(i => i + 1);
              } catch (e) {
                console.error('Quote generation failed', e);
                // Roll back early category addition if quotes failed and no quotes key stored
                try {
                  const key = `medicare_${category.replace(/-/g,'_')}_quotes`;
                  const hasQuotes = !!localStorage.getItem(category==='medigap' ? 'medigap_plan_quotes_stub' : key);
                  if (!hasQuotes) {
                    const rawRollback = localStorage.getItem('medicare_selected_categories');
                    if (rawRollback) {
                      let arr = [] as string[];
                      try { arr = JSON.parse(rawRollback); } catch {}
                      const next = arr.filter(c => c !== category);
                      if (next.length !== arr.length) {
                        localStorage.setItem('medicare_selected_categories', JSON.stringify(next));
                        try { window.dispatchEvent(new CustomEvent('selectedCategories:updated')); } catch {}
                      }
                    }
                  }
                } catch {}
              }
            }}
          />
        </aside>
        <div className={`space-y-12 ${sidebarPanelOpen ? 'lg:blur-sm lg:pointer-events-none' : ''}`} aria-busy={loadingActive} aria-describedby="carrier-loading-status">
        <span id="carrier-loading-status" role="status" aria-live="polite" className="sr-only">
          {loadingActive ? 'Loading Medigap carriers…' : carrierSummaries.length ? `${carrierSummaries.length} Medigap carriers loaded.` : 'No carriers.'}
        </span>
  {viewVisibility.cards && (
        <div className="space-y-8">
          {/* View mode (card | list) handled via top-level hook now */}
          {/* Developer Controls moved to bottom */}

          {filteredCarriers.length === 0 && !loadingQuotes && (
            <div className="rounded-md border border-dashed border-slate-300 dark:border-slate-600 p-6 text-center space-y-2">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">No carriers match your filters</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Try clearing the search{preferredOnly ? ' or disabling Preferred filter' : ''}.
              </p>
            </div>
          )}

          {/* Unified saved plans chip strip (all categories) */}
          <SavedPlanChips
            onOpen={(category, carrierName) => {
              switch (category) {
                case 'drug-plan':
                  openPdpDetails({ id: carrierName });
                  setActiveCategory('drug-plan');
                  break;
                case 'advantage':
                case 'dental':
                case 'cancer':
                case 'hospital':
                case 'final-expense':
                  openCategoryDetails(carrierName, category);
                  break;
                default:
                  openPlanDetails({ id: carrierName } as any);
                  setActiveCategory('medigap');
              }
            }}
            className="mb-6"
          />
          <Separator />
          {activeCategory === 'drug-plan' && (
            <section className="space-y-6">
              <h3 className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-200">Prescription Drug Plans</h3>
              {pdpCarriers.length === 0 && !loadingQuotes && (
                <div className="text-xs text-slate-500 dark:text-slate-400">No drug plans loaded.</div>
              )}
              <DrugPlanCards carriers={pdpCarriers as any} loading={loadingQuotes} onOpenCarrierDetails={(c)=>openPdpDetails({ id: c.name })} />
            </section>
          )}
          {activeCategory === 'advantage' && (
            <section className="space-y-6">
              <h3 className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-200">Medicare Advantage Plans</h3>
              {(!loadingQuotes && advantageCarriers.length === 0) && (
                <div className="text-xs text-slate-500 dark:text-slate-400">No advantage plans loaded.</div>
              )}
              <AdvantagePlanCards
                carriers={advantageCarriers as any}
                loading={loadingQuotes && advantageCarriers.length === 0}
                onOpenCarrierDetails={(c)=> openCategoryDetails(c.name,'advantage') }
              />
            </section>
          )}
          {activeCategory === 'dental' && (
            <section className="space-y-6">
              <h3 className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-200">Dental Plans</h3>
              {(!loadingQuotes && dentalCarriers.length === 0) && (<div className="text-xs text-slate-500 dark:text-slate-400">No dental plans loaded.</div>)}
              <DentalPlanCards carriers={dentalCarriers as any} loading={loadingQuotes && dentalCarriers.length===0} onOpenCarrierDetails={(c)=> openCategoryDetails(c.name,'dental')} />
            </section>
          )}
          {activeCategory === 'cancer' && (
            <section className="space-y-6">
              <h3 className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-200">Cancer Plans</h3>
              {(!loadingQuotes && cancerCarriers.length === 0) && (<div className="text-xs text-slate-500 dark:text-slate-400">No cancer plans loaded.</div>)}
              <CancerPlanCards carriers={cancerCarriers as any} loading={loadingQuotes && cancerCarriers.length===0} onOpenCarrierDetails={(c)=> openCategoryDetails(c.name,'cancer')} />
            </section>
          )}
          {activeCategory === 'hospital' && (
            <section className="space-y-6">
              <h3 className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-200">Hospital Indemnity Plans</h3>
              {(!loadingQuotes && hospitalCarriers.length === 0) && (<div className="text-xs text-slate-500 dark:text-slate-400">No hospital indemnity plans loaded.</div>)}
              <HospitalIndemnityPlanCards carriers={hospitalCarriers as any} loading={loadingQuotes && hospitalCarriers.length===0} onOpenCarrierDetails={(c)=> openCategoryDetails(c.name,'hospital')} />
            </section>
          )}
          {activeCategory === 'final-expense' && (
            <section className="space-y-6">
              <h3 className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-200">Final Expense Plans</h3>
              {(!loadingQuotes && finalExpenseCarriers.length === 0) && (<div className="text-xs text-slate-500 dark:text-slate-400">No final expense plans loaded.</div>)}
              <FinalExpensePlanCards carriers={finalExpenseCarriers as any} loading={loadingQuotes && finalExpenseCarriers.length===0} onOpenCarrierDetails={(c)=> openCategoryDetails(c.name,'final-expense')} />
            </section>
          )}
          {activeCategory === 'medigap' && (quoteViewMode === 'list' ? (
            <>
              {/* Plan type toggle (F/G/N) surfaced for list view */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <div className="inline-flex gap-2 rounded-full bg-white/80 dark:bg-slate-800/60 p-1 border border-slate-200 dark:border-slate-700 shadow-sm">
                    {(['F','G','N'] as const).filter(p => availablePlans.includes(p)).map(p => {
                      const active = selectedPlan === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setSelectedPlan(p)}
                          className={`px-3.5 py-1.5 text-[13px] font-medium rounded-full transition tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 focus-visible:ring-offset-1 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-800 ${active ? 'btn-brand shadow-inner' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700/60 dark:text-slate-200 dark:hover:bg-slate-600/60'}`}
                          aria-pressed={active}
                        >Plan {p}</button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <ComparisonRowCards
                carriers={paginatedCarriers}
                loading={loadingQuotes && !effectiveCarriers.length}
                planBadges={planBadges}
                selectedPlan={selectedPlan as any}
                onSelectPlan={(p:'F'|'G'|'N') => setSelectedPlan(p)}
                onOpenPlanDetails={openPlanDetails as any}
              />
              <Separator />
              <PaginationControls />
            </>
          ) : (
            <>
              {variantVisibility.lightInverse && (
                <>
                  <LightInverseCards
                    carriers={paginatedCarriers}
                    loading={loadingQuotes && !effectiveCarriers.length}
                    planBadges={planBadges as any}
                    availablePlans={availablePlans}
                    selectedPlan={selectedPlan}
                    onSelectPlan={setSelectedPlan}
                    onOpenPlanDetails={openPlanDetails}
                  />
                  <Separator />
                </>
              )}
              {(variantVisibility.lightInverse) && (
                <PaginationControls />
              )}
            </>
          ))}
        </div>
      )}
      {viewVisibility.planDetails && activeCarrierId && activeCategory === 'medigap' && (
        <div className="space-y-8">
          <PlanDetailsShowcase
            carrierId={activeCarrierId}
            quotes={quotes.filter(q => (q.carrier?.name || q.company) === activeCarrierId)}
            plan={selectedPlan}
            onClose={closePlanDetails}
          />
        </div>
      )}
      {viewVisibility.planDetails && activeCarrierId && activeCategory === 'drug-plan' && (
        <div className="space-y-8">
          <PdpDetailsShowcase
            carrierName={activeCarrierId}
            quotes={pdpNormalized.filter(q => (q.carrier.id === activeCarrierId || q.carrier.name === activeCarrierId))}
            onClose={closePlanDetails}
          />
        </div>
      )}
      {viewVisibility.planDetails && activeCarrierId && activeCategory === 'advantage' && (
        <div className="space-y-8">
          <AdvantageDetailsShowcase
            carrierName={activeCarrierId}
            quotes={advantageNormalized.filter(q => (q.carrier.id === activeCarrierId || q.carrier.name === activeCarrierId))}
            onClose={closePlanDetails}
          />
        </div>
      )}
      {viewVisibility.planDetails && activeCarrierId && activeCategory === 'dental' && (
        <div className="space-y-8">
          <DentalDetailsShowcase
            carrierName={activeCarrierId}
            quotes={dentalNormalized.filter(q => (q.carrier.id === activeCarrierId || q.carrier.name === activeCarrierId))}
            onClose={closePlanDetails}
          />
        </div>
      )}
      {viewVisibility.planDetails && activeCarrierId && activeCategory === 'cancer' && (
        <div className="space-y-8">
          <CancerDetailsShowcase
            carrierName={activeCarrierId}
            quotes={cancerNormalized.filter(q => (q.carrier.id === activeCarrierId || q.carrier.name === activeCarrierId))}
            onClose={closePlanDetails}
          />
        </div>
      )}
      {viewVisibility.planDetails && activeCarrierId && activeCategory === 'hospital' && (
        <div className="space-y-8">
          <HospitalIndemnityDetailsShowcase
            carrierName={activeCarrierId}
            quotes={hospitalNormalized.filter(q => (q.carrier.id === activeCarrierId || q.carrier.name === activeCarrierId))}
            onClose={closePlanDetails}
          />
        </div>
      )}
      {viewVisibility.planDetails && activeCarrierId && activeCategory === 'final-expense' && (
        <div className="space-y-8">
          <FinalExpenseDetailsShowcase
            carrierName={activeCarrierId}
            quotes={finalExpenseNormalized.filter(q => (q.carrier.id === activeCarrierId || q.carrier.name === activeCarrierId))}
            onClose={closePlanDetails}
          />
        </div>
      )}

      {/* 8. Next Steps */}
      <section className="space-y-4 pt-4" id="next-steps">
        <h2 className="text-xl font-semibold tracking-tight">Next Steps & Notes</h2>
        <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
          <li>Decide preferred baseline structure (compact vs expanded) for Medigap grouping.</li>
          <li>Abstract price block + plan badge cluster into reusable subcomponents.</li>
          <li>Add interaction states (selected, compared, disabled) & skeleton variants.</li>
          <li>Integrate discount / payment mode toggles inline (chip cluster or dropdown).</li>
          <li>Run quick Lighthouse/CLS checks for density stress grid once virtualized.</li>
        </ul>
      </section>
        </div>
        </div>
        {/* Bottom Sandbox Controls */}
        <div className="mt-12">
          <Card className="bg-white/60 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Sandbox Controls</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-4">
              <div className="flex flex-wrap gap-3">
                {(['minimal','lightInverse','comparison'] as const).map(k => (
                  <label key={k} className="flex items-center gap-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="accent-blue-primary"
                      checked={variantVisibility[k]}
                      onChange={() => toggleVariant(k)}
                    />
                    <span className="capitalize">{k}</span>
                  </label>
                ))}
              </div>
              <Separator className="my-2" />
              <div className="flex flex-wrap gap-6 text-[11px]">
                <div className="space-y-1">
                  <div className="font-semibold text-xs opacity-80">Category</div>
                  <div className="flex flex-wrap gap-2">
                    {['medigap','advantage','cancer','hospital','final-expense','drug-plan','dental'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => {
                          setActiveCategory(cat);
                          if (typeof window !== 'undefined') {
                            router.push(`/shop-components/${cat}${window.location.search || ''}`);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-md border text-[11px] transition ${activeCategory === cat ? 'bg-blue-primary text-white border-blue-primary' : 'bg-card/40 hover:bg-card/60 border-border'} `}
                      >
                        {cat.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-xs opacity-80">Views</div>
                  <div className="flex flex-wrap gap-2">
                    {([
                      { key: 'cards', label: 'Cards' },
                      { key: 'planDetails', label: 'Plan Details' },
                    ] as const).map(v => (
                      <label key={v.key} className="flex items-center gap-1 cursor-pointer select-none px-2 py-1 rounded-md border border-border bg-card/40 hover:bg-card/60">
                        <input
                          type="checkbox"
                          className="accent-blue-primary"
                          checked={viewVisibility[v.key]}
                          onChange={() => toggleView(v.key as any)}
                        />
                        <span className="text-[11px]">{v.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm" variant="outline" onClick={handleRefetch} disabled={loadingQuotes}>
                  {loadingQuotes ? 'Loading…' : 'Reload Stored Quotes'}
                </Button>
                {streamingEnabled && (
                  <Button size="sm" onClick={simulateStreaming} disabled={streamingActive || loadingQuotes} className="btn-brand">
                    {streamingActive ? 'Streaming…' : 'Simulate Streaming'}
                  </Button>
                )}
                {quoteError && <span className="text-red-600 dark:text-red-400">{quoteError}</span>}
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-[11px] leading-tight">
                <div>
                  <span className="font-medium">Carriers:</span> {carrierSummaries.length || 0}
                </div>
                <div>
                  <span className="font-medium">Plans Available:</span> {availablePlans.join(', ')}
                </div>
                <div>
                  <span className="font-medium">Fetch Duration:</span> {fetchDuration ? `${fetchDuration.toFixed(0)} ms` : '—'}
                </div>
                <div>
                  <span className="font-medium">TTFCP:</span> {ttfcp ? `${ttfcp.toFixed(0)} ms` : '—'}
                </div>
                <div>
                  <span className="font-medium">First Plan Visible:</span> {firstPlanVisibleMs ? `${firstPlanVisibleMs.toFixed(0)} ms` : '—'}
                </div>
                <div>
                  <span className="font-medium">All Plans Complete:</span> {allPlansCompleteMs ? `${allPlansCompleteMs.toFixed(0)} ms` : '—'}
                </div>
              </div>
              {streamingEnabled && (
                <div className="text-[11px] flex items-center gap-2">
                  <span className="font-medium">Streaming Mode:</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                    {streamingActive ? 'Active' : streamedCarriers.length ? 'Complete' : 'Idle'}
                  </Badge>
                  <span className="opacity-70">({streamedCarriers.length}/{carrierSummaries.length})</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
    </div>
  );
}
