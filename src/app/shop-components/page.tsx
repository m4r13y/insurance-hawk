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
import { REAL_QUOTES_KEY, getAllMedigapStorageKeys, saveToStorage, loadFromStorage, ADVANTAGE_QUOTES_KEY, DRUG_PLAN_QUOTES_KEY, DENTAL_QUOTES_KEY, HOSPITAL_INDEMNITY_QUOTES_KEY, FINAL_EXPENSE_QUOTES_KEY, CANCER_INSURANCE_QUOTES_KEY, getMedigapStorageKey, SELECTED_CATEGORIES_KEY } from '@/components/medicare-shop/shared/storage';
// New storage abstractions for sandbox parity
import { flattenPlanQuotes, loadAllStoredPlanQuotes, savePlanQuotes } from '@/lib/medigap/planStorage';
import { loadCategoryQuotes, type NonMedigapCategory } from '@/lib/storage/categoryStorage';
import { runCarrierStream } from '@/lib/streaming/medigapStreaming';
// Reuse shared Medigap discount utilities instead of ad‑hoc logic
import { getBaseRate } from '@/lib/medigap-utils';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useCategoryQuotes } from '@/components/new-shop-components/adapters/useCategoryQuotes';
import { getEnhancedCarrierInfo, mapUICategoryToProductCategory } from '@/lib/carrier-system';
import { buildAdvantageCarrierCards } from '@/components/new-shop-components/quote-cards/quoteCardMapper';
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
  const router = useRouter();
  const { savedPlans } = useSavedPlans();
  // Real Medigap data (first carrier group) -------------------------------------------------
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [carrierSummaries, setCarrierSummaries] = useState<any[]>([]);
  const [reloadIndex, setReloadIndex] = useState(0);
  // UI panel + details state (restored after refactor removal)
  const [sidebarPanelOpen, setSidebarPanelOpen] = useState(false);
  const [closeSignal, setCloseSignal] = useState(0);
  const [viewVisibility, setViewVisibility] = useState({ cards: true, planDetails: false });
  const toggleView = (k: keyof typeof viewVisibility) => setViewVisibility(v => ({ ...v, [k]: !v[k] }));
  const [activeCarrierId, setActiveCarrierId] = useState<string | null>(null);
  const openPlanDetails = (carrier: { id: string }) => { setActiveCarrierId(carrier.id); setViewVisibility(v => ({ ...v, planDetails: true })); };
  const closePlanDetails = () => { setActiveCarrierId(null); setViewVisibility(v => ({ ...v, planDetails: false })); };
  const openPdpDetails = (carrier: { id: string }) => { openPlanDetails(carrier as any); };
  const openCategoryDetails = (carrierName: string, _category: string) => { openPlanDetails({ id: carrierName }); };
  // Quote view mode (retain list vs cards for Medigap experimentation)
  const [quoteViewMode, setQuoteViewMode] = useState<'list' | 'cards'>('cards');
  // Discount toggle lives early so summary memo can depend on it
  const [applyDiscounts, setApplyDiscounts] = useState(false);

  // Performance / instrumentation
  const [fetchStartTs, setFetchStartTs] = useState<number | null>(null);
  const [fetchEndTs, setFetchEndTs] = useState<number | null>(null);
  const [firstCarrierReadyTs, setFirstCarrierReadyTs] = useState<number | null>(null);
  const [streamingActive, setStreamingActive] = useState(false);
  // Derived loading flag for aria (after streamingActive declared)
  const loadingActive = loadingQuotes || streamingActive;

  // Simple refetch bumps reloadIndex
  const handleRefetch = () => setReloadIndex(i => i + 1);
  const simulateStreaming = () => {/* no-op placeholder */};
  const [streamedCarriers, setStreamedCarriers] = useState<any[]>([]);
  const streamingEnabled = process.env.NEXT_PUBLIC_ENABLE_MEDIGAP_STREAMING === '1';
  const [firstPlanVisibleMs, setFirstPlanVisibleMs] = useState<number | null>(null);
  const [allPlansCompleteMs, setAllPlansCompleteMs] = useState<number | null>(null);

  // (moved below activeCategory state)
  // (Removed legacy firstCarrierGroup aggregation; adapter summaries now drive displays.)



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
  const [medigapPlanQuotes, setMedigapPlanQuotes] = useState<{F:any[];G:any[];N:any[]}>({F:[],G:[],N:[]});
  const flattenedMedigapQuotes = useMemo(()=>flattenPlanQuotes(medigapPlanQuotes),[medigapPlanQuotes]);
  const { normalized: adapterMedigapQuotes, summaries: adapterMedigapSummaries, timing: adapterTiming } = useCategoryQuotes<any>('medigap', activeCategory==='medigap' ? flattenedMedigapQuotes : [], {
    applyDiscounts,
    enabled: true,
  });
  if (adapterTiming.count && typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.debug('ADAPTER_PERF medigap', adapterTiming);
  }

  // Hydrate quotes for active category (Firestore-only). This was removed during refactor; restored here.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (activeCategory === 'medigap') {
          const { planQuotes } = await loadAllStoredPlanQuotes();
          if (!cancelled) setMedigapPlanQuotes(planQuotes);
        } else {
          const cat = (activeCategory === 'hospital' ? 'hospital-indemnity' : activeCategory) as NonMedigapCategory;
          const arr = await loadCategoryQuotes(cat);
          if (!cancelled) setQuotes(Array.isArray(arr) ? arr : []);
        }
      } catch (e) {
        if (!cancelled) setQuoteError((e as any)?.message || 'Failed to load stored quotes');
      }
    })();
    return () => { cancelled = true; };
  }, [activeCategory, reloadIndex]);

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
  const advantageCarriers = useMemo(()=> {
    if (activeCategory !== 'advantage') return [] as any[];
    const productCategory = mapUICategoryToProductCategory('advantage') || 'medicare-advantage';
    return buildAdvantageCarrierCards({
      summaries: advantageSummaries as any,
      normalized: advantageNormalized as any,
      productCategory,
      getEnhancedCarrierInfo: getEnhancedCarrierInfo as any,
    });
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
  // Always invoke hooks unconditionally to satisfy Rules of Hooks. We create a secondary adapter instance
  // that is only enabled when we actually want to use the sticky snapshot. This avoids conditional
  // invocation while preserving fallback behavior for flickering hospital quotes.
  const stickyHospitalAdapter = useCategoryQuotes<any>('hospital', stickyHospitalQuotes, {
    enabled: activeCategory === 'hospital' && hospitalNormalized.length === 0 && stickyHospitalQuotes.length > 0,
  });
  const effectiveHospitalNormalized = (activeCategory === 'hospital'
    && hospitalNormalized.length === 0
    && stickyHospitalQuotes.length > 0)
    ? stickyHospitalAdapter.normalized
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

  // (Removed duplicated pagination & hydration block after integrating new storage abstractions above.)

  // Update hospital category usages in render conditionals to canonical id
  // NOTE: For backward URL compatibility we still accept 'hospital' in buttons but state stores 'hospital-indemnity'.

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

  // Use enriched medigap carriers (adapter derived) when active; otherwise legacy summaries.
  const effectiveCarriers = (streamingEnabled && streamedCarriers.length)
    ? streamedCarriers
    : carriers;


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
    return letters.filter(l => medigapPlanQuotes[l].length > 0);
  }, [medigapPlanQuotes]);

  // Category + View toggles (replacing upper tabs)
  // (moved activeCategory earlier for pagination dependency ordering)

  // Conditional quote hydration (no auto generation). We look for existing categories and medigap quotes.
  useEffect(() => {
    let mounted = true;
    async function hydrate() {
      if (typeof window === 'undefined') return;
      setLoadingQuotes(true);
      try {
        // Read selected categories list (lightweight UI marker)
        let selectedCategories: string[] = [];
        try { const raw = localStorage.getItem(SELECTED_CATEGORIES_KEY); if (raw) selectedCategories = JSON.parse(raw); } catch {}
        // Always normalize hospital -> hospital-indemnity
        selectedCategories = selectedCategories.map(c => c === 'hospital' ? 'hospital-indemnity' : c);
        if (!selectedCategories.includes(activeCategory)) {
          // Clear current category quotes if deselected
          if (activeCategory === 'medigap') {
            setMedigapPlanQuotes({F:[],G:[],N:[]});
          } else {
            setQuotes([]);
          }
          setLoadingQuotes(false);
          return;
        }
        if (activeCategory === 'medigap') {
          const { planQuotes } = await loadAllStoredPlanQuotes();
            if (!mounted) return;
            setMedigapPlanQuotes(planQuotes);
        } else {
          const cat = (activeCategory === 'hospital' ? 'hospital-indemnity' : activeCategory) as NonMedigapCategory;
          const arr = await loadCategoryQuotes(cat);
          if (!mounted) return;
          setQuotes(Array.isArray(arr)?arr:[]);
        }
      } catch (e:any) {
        if (mounted) setQuoteError(e.message || 'Failed to hydrate quotes');
      } finally {
        if (mounted) setLoadingQuotes(false);
      }
    }
    hydrate();
    return () => { mounted = false; };
  }, [activeCategory, reloadIndex]);

  // Incremental Medigap plan add (sandbox parity with production)
  const addMedigapPlan = useCallback(async (planLetter: 'F'|'G'|'N', formData: any) => {
    if (!formData) return;
    const params = {
      zipCode: String(formData.zipCode || ''),
      age: String(formData.age || ''),
      gender: (formData.gender || 'male').toString().toLowerCase().startsWith('m') ? 'M' : 'F',
      tobacco: formData.tobaccoUse ? '1' : '0',
      plans: [planLetter]
    } as any;
    try {
      const { quotes: newQuotes, error } = await getMedigapQuotes(params);
      if (error) throw new Error(error);
      if (newQuotes && newQuotes.length) {
        await savePlanQuotes(planLetter, newQuotes);
        setMedigapPlanQuotes(prev => ({ ...prev, [planLetter]: newQuotes }));
      }
    } catch (e) {
      console.error('Failed to add Medigap plan', planLetter, e);
    }
  }, []);

  // Update hospital category usages in render conditionals to canonical id
  // NOTE: For backward URL compatibility we still accept 'hospital' in buttons but state stores 'hospital-indemnity'.

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
                // Firestore-backed persistence (reuse production storage helpers)
                const persistQuotes = async (key: string, quotes: any[]) => {
                  if (!Array.isArray(quotes) || !quotes.length) return;
                  try {
                    await saveToStorage(key, quotes);
                  } catch (e) {
                    console.error('Failed to persist quotes to Firestore', key, e);
                  }
                };
                let storageKey = `medicare_${category.replace(/-/g,'_')}_quotes`;
                if (category === 'medigap') {
                  // Store per-plan using canonical plan-specific keys (F/G/N)
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
                    const byPlan: Record<string, any[]> = {};
                    mgQuotes.forEach(q => {
                      const letter = String((q.plan || q.plan_name || '').slice(-1)).toUpperCase();
                      if (!['F','G','N'].includes(letter)) return;
                      if (!byPlan[letter]) byPlan[letter] = [];
                      byPlan[letter].push(q);
                    });
                    await Promise.all(Object.entries(byPlan).map(([pl, arr]) => persistQuotes(getMedigapStorageKey(pl), arr)));
                    storageKey = REAL_QUOTES_KEY; // logical grouping placeholder; actual writes done per plan
                  }
                } else if (category === 'advantage') {
                  const { quotes, error } = await getMedicareAdvantageQuotes({ zipCode: String(formData.zipCode) });
                  if (error) throw new Error(error);
                  if (quotes) await persistQuotes(ADVANTAGE_QUOTES_KEY, quotes);
                } else if (category === 'drug-plan') {
                  const { quotes, error } = await getDrugPlanQuotes({ zipCode: String(formData.zipCode) } as any);
                  if (error) throw new Error(error);
                  if (quotes) await persistQuotes(DRUG_PLAN_QUOTES_KEY, quotes);
                } else if (category === 'dental') {
                  const { success, quotes, error } = await getDentalQuotes({
                    age: formData.age,
                    zipCode: String(formData.zipCode),
                    gender: formData.gender,
                    tobaccoUse: !!formData.tobaccoUse,
                    coveredMembers: formData.coveredMembers ? parseInt(formData.coveredMembers,10) : undefined
                  });
                  if (!success) throw new Error(error || 'Dental quote fetch failed');
                  await persistQuotes(DENTAL_QUOTES_KEY, quotes);
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
                  await persistQuotes(CANCER_INSURANCE_QUOTES_KEY, quotes);
                } else if (category === 'hospital') {
                  const hospParams = {
                    zipCode: String(formData.zipCode),
                    age: parseInt(formData.age,10) || 65,
                    gender: (formData.gender || 'male').toString().toLowerCase().startsWith('m') ? 'M' : 'F',
                    tobaccoUse: !!formData.tobaccoUse
                  };
                  const { quotes, success, error } = await getHospitalIndemnityQuotes(hospParams as any);
                  if (!success) throw new Error(error || 'Hospital Indemnity quote fetch failed');
                  await persistQuotes(HOSPITAL_INDEMNITY_QUOTES_KEY, quotes);
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
                  await persistQuotes(FINAL_EXPENSE_QUOTES_KEY, quotes);
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
          {loadingActive ? 'Loading Medigap carriers…' : (carriers && carriers.length ? `${carriers.length} Medigap carriers loaded.` : 'No carriers.')}
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
