"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef, useLayoutEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ComparisonRowCards } from '@/components/new-shop-components/quote-cards/ComparisonRowCards';
import { MinimalRateChips } from '@/components/new-shop-components/quote-cards/MinimalRateChips';
import { DensityStressGrid } from '@/components/new-shop-components/quote-cards/DensityStressGrid';
import { LightInverseCards } from '@/components/new-shop-components/quote-cards/PrimaryCards';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { planBadges } from '@/components/new-shop-components/constants/planBadges';
// legacyGetBaseRate no longer needed after adapter dual pricing implementation
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
import { getEnhancedCarrierInfo, mapUICategoryToProductCategory, categorySupportsPreferredCarriers, getPreferredCarriers, getCarrierById } from '@/lib/carrier-system';
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
import { getDentalQuotes, getDentalQuotesWithRetry } from '@/lib/actions/dental-quotes';
import { getCancerInsuranceQuotes } from '@/lib/actions/cancer-insurance-quotes';
import { getHospitalIndemnityQuotes } from '@/lib/actions/hospital-indemnity-quotes';
import { getFinalExpenseLifeQuotes } from '@/lib/actions/final-expense-quotes';
import { buildFinalExpenseParams, buildHospitalParams, buildCancerParams, buildDentalParams } from '@/lib/quoteParamBuilders';
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
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { savedPlans } = useSavedPlans();
  // Real Medigap data (first carrier group) -------------------------------------------------
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  // Track whether a category has completed at least one hydration attempt so we don't prematurely
  // render an empty-state message before the fetch effect has a chance to flip loadingQuotes true.
  const [categoryHydrated, setCategoryHydrated] = useState<Record<string, boolean>>({});
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [carrierSummaries, setCarrierSummaries] = useState<any[]>([]);
  const [reloadIndex, setReloadIndex] = useState(0);
  // UI panel + details state (restored after refactor removal)
  const [sidebarPanelOpen, setSidebarPanelOpen] = useState(false);
  const [closeSignal, setCloseSignal] = useState(0);
  // viewVisibility controls whether the carrier card grid or the plan details panel is shown.
  // Requirement: plan details should REPLACE (not append below) the cards area and restore prior scroll on close.
  const [viewVisibility, setViewVisibility] = useState({ cards: true, planDetails: false });
  const previousScrollRef = useRef(0);
  const toggleView = (k: keyof typeof viewVisibility) => setViewVisibility(v => ({ ...v, [k]: !v[k] }));
  const [activeCarrierId, setActiveCarrierId] = useState<string | null>(null);
  const openPlanDetails = (carrier: { id: string }) => {
    try { previousScrollRef.current = window.scrollY || 0; } catch {}
    setActiveCarrierId(carrier.id);
    // Hide cards while showing details
    setViewVisibility({ cards: false, planDetails: true });
    // Scroll to top so details start at viewport top for better focus
  try { window.scrollTo({ top: 0, behavior: 'auto' }); } catch {}
  };
  const closePlanDetails = () => {
    setActiveCarrierId(null);
    // Restore cards view
    setViewVisibility({ cards: true, planDetails: false });
    // Restore previous scroll position after next paint
    try {
      const y = previousScrollRef.current || 0;
  requestAnimationFrame(() => { try { window.scrollTo({ top: y, behavior: 'auto' }); } catch {} });
    } catch {}
  };
  const openPdpDetails = (carrier: { id: string }) => { openPlanDetails(carrier as any); };
  const openCategoryDetails = (carrierName: string, _category: string) => { openPlanDetails({ id: carrierName }); };
  // Quote view mode (retain list vs cards for Medigap experimentation)
  const [quoteViewMode, setQuoteViewMode] = useState<'list' | 'cards'>('cards');
  // Discount toggle lives early so summary memo can depend on it
  const [applyDiscounts, setApplyDiscounts] = useState(false);
  // Global selected plan (moved earlier so carrier sorting can depend on it)
  const [selectedPlan, setSelectedPlan] = useState<'F'|'G'|'N'>('G');

  // Utility: robust carrier identity matcher
  // Issue observed: preferred carriers often receive an enhanced displayName (branding cleanup) that no longer exactly
  // matches the raw carrier.name/id coming from normalized quote objects. Simple equality caused detail lookups to
  // return zero plan variants for preferred carriers across non-medigap categories. We normalize & apply token_overlap.
  // Extension: canonical brand aliasing (Aetna family). Some product feeds emit related brands (SilverScript, CVS, Caremark)
  // whose carrier quotes should consolidate under Aetna for plan details. Without aliasing, displayName 'Aetna' fails to
  // match quote carrier.name 'SilverScript' (no shared tokens after generic suffix removal). We map these to a canonical id.
  const canonicalizeBrand = useCallback((value: string) => {
    const v = (value || '').toLowerCase();
    if (!v) return value;
    // Order matters: check explicit brand tokens first; any presence yields canonical 'aetna'
    if (/(silverscript|cvs|caremark)/.test(v)) return 'aetna';
    if (/aetna/.test(v)) return 'aetna';
    return value;
  }, []);

  const carrierMatches = useCallback((activeId: string, carrier: any) => {
    if (!activeId || !carrier) return false;
    const rawCandidates = [carrier.id, carrier.name, carrier.displayName, carrier.company, carrier.carrierName];
    // Fast exact pass (original behavior)
    if (rawCandidates.filter(Boolean).some(v => v === activeId)) return true;
    const norm = (s: any) => {
      let out = String(s || '')
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\b(life|insurance|health|company|co|inc|corp|corporation|holdings|group|grp|plans|plan|llc|the)\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      out = canonicalizeBrand(out);
      return out;
    };
    const activeNorm = norm(activeId);
    if (!activeNorm) return false;
    const candidateNorms = rawCandidates.filter(Boolean).map(norm).filter(Boolean);
    // Direct normalized equality
    if (candidateNorms.some(c => c === activeNorm)) return true;
    // Token overlap (require >= 60% of smaller token list or single token match)
    const tokenize = (s: string) => s.split(' ').filter(Boolean);
    const targetTokens = tokenize(activeNorm);
    const targetSet = new Set(targetTokens);
    const targetLen = targetTokens.length || 1;
    for (const c of candidateNorms) {
      const toks = tokenize(c);
      if (!toks.length) continue;
      const overlap = toks.filter(t => targetSet.has(t));
      const smaller = Math.min(toks.length, targetLen);
      if (overlap.length >= Math.max(1, Math.ceil(smaller * 0.6))) return true;
    }
    // Levenshtein distance fallback for very close single-token brand variants (cheap threshold)
    if (targetLen === 1) {
      const dist = (a: string, b: string) => {
        const m = a.length, n = b.length;
        const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;
        for (let i = 1; i <= m; i++) {
          for (let j = 1; j <= n; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
              dp[i - 1][j] + 1,
              dp[i][j - 1] + 1,
              dp[i - 1][j - 1] + cost
            );
          }
        }
        return dp[m][n];
      };
      for (const c of candidateNorms) {
        if (Math.min(activeNorm.length, c.length) >= 4) {
          const d = dist(activeNorm, c);
            if (d <= 1) return true; // allow one edit for canonicalization
        }
      }
    }
    return false;
  }, []);

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
  // Hydrate activeCategory from URL (?category=) taking precedence over prop and default.
  // Hydration-safe initial category: derive purely from searchParams (same on server & client) to avoid mismatch.
  const [activeCategory, setActiveCategory] = useState(() => {
    const urlCat = searchParams?.get('category');
    if (urlCat && ['medigap','advantage','drug-plan','dental','cancer','hospital','final-expense','hospital-indemnity'].includes(urlCat)) {
      return urlCat === 'hospital-indemnity' ? 'hospital' : urlCat; // internal alias uses 'hospital'
    }
    return initialCategory || 'medigap';
  });
  const [preferredOnly, setPreferredOnly] = useState(true);
  // Client-only derived UI badge for Final Expense header (avoid SSR hydration mismatch)
  const [finalExpenseBadge, setFinalExpenseBadge] = useState<string | null>(null);

  // Sync activeCategory into URL query string (shallow) without full reload.
  // NOTE: Removed searchParams from dependency list & added guard ref to prevent rapid oscillation
  // that was triggering repeated GET /shop-components?category=medigap|advantage requests.
  const lastSyncedCategoryRef = useRef<string | null>(null);
  useEffect(() => {
    if (!pathname) return;
    const canonical = activeCategory === 'hospital' ? 'hospital-indemnity' : activeCategory;
    // If we've already synced this canonical value, skip.
    if (lastSyncedCategoryRef.current === canonical) return;
    const current = searchParams?.get('category');
    if (current === canonical) {
      // Record that we're in sync to avoid another replace when activeCategory updates again.
      lastSyncedCategoryRef.current = canonical;
      return;
    }
    const params = new URLSearchParams(searchParams ? Array.from(searchParams.entries()) : []);
    params.set('category', canonical);
    try {
      lastSyncedCategoryRef.current = canonical;
      router.replace(`${pathname}?${params.toString()}` as any, { scroll: false });
    } catch (e) {
      console.warn('Failed to update category param', e);
    }
  }, [activeCategory, pathname, router]);

  // Respond to manual URL changes (back/forward) by updating state.
  useEffect(() => {
    const urlCat = searchParams?.get('category');
    if (!urlCat) return;
    const normalized = urlCat === 'hospital-indemnity' ? 'hospital' : urlCat;
    if (['medigap','advantage','drug-plan','dental','cancer','hospital','final-expense'].includes(normalized) && normalized !== activeCategory) {
      setActiveCategory(normalized as any);
    }
  }, [searchParams, activeCategory]);

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
    const quotesUpdatedHandler = () => {
      // Force hydration of latest quotes without manual refresh
      setReloadIndex(i => i + 1);
    };
    try { window.addEventListener('quotes:updated', quotesUpdatedHandler as EventListener); } catch {}
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
    return () => { cancelled = true; try { window.removeEventListener('quotes:updated', quotesUpdatedHandler as EventListener); } catch {} };
  }, [activeCategory, reloadIndex]);

  // Resolve carriers (legacy vs adapter derived) early so downstream memos (availablePlans, pagination) use unified source
  const carriers = useMemo(() => {
    if (activeCategory === 'medigap' && adapterMedigapSummaries?.length) {
      const productCategory = mapUICategoryToProductCategory('medigap') || 'medicare-supplement';
      const enriched = adapterMedigapSummaries.map((s: any) => {
        const planKeys = ['F','G','N'] as const;
        // Baseline (non-discount) and discountedPlans (if present) emitted by adapter
        const discountedPlans: Record<string, number | undefined> | undefined = (s as any).discountedPlans;
        const discountMeta = (s as any).__discountMeta;
        // When applying discounts, we only override individual plan prices that have a discounted value.
        // Carriers or plan letters without a discount should continue to display their baseline price.
        let activePlans: Record<string, number | undefined> = s.plans;
        if (applyDiscounts && discountedPlans) {
          activePlans = { ...s.plans };
          for (const k of Object.keys(discountedPlans)) {
            const dv = (discountedPlans as any)[k];
            if (typeof dv === 'number' && !Number.isNaN(dv)) {
              activePlans[k] = dv;
            }
          }
        }
        const candidatePrices: number[] = [];
        planKeys.forEach(pk => { const p = activePlans[pk]; if (typeof p === 'number') candidatePrices.push(p); });
        const min = candidatePrices.length ? Math.min(...candidatePrices) : undefined;
        const max = candidatePrices.length ? Math.max(...candidatePrices) : undefined;
        // Compute potential savings: compare baseline vs discounted across tracked plans
        let savings: number | undefined;
        if (discountMeta?.perPlan) {
          const deltas: number[] = [];
          for (const pk of planKeys) {
            const meta = discountMeta.perPlan[pk];
            if (meta?.baseline != null && meta?.discounted != null && meta.discounted < meta.baseline) {
              deltas.push(meta.baseline - meta.discounted);
            }
          }
          if (deltas.length) savings = Math.max(...deltas); // largest plan-specific savings as headline
        }
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
          plans: activePlans,
          planRanges: s.planRanges,
          __preferred: !!enhancedInfo.isPreferred,
          __preferredPriority: enhancedInfo.priority ?? 999,
          __discountsApplied: !!applyDiscounts && !!discountedPlans,
          __savings: savings,
        };
      });
      // Sort: strictly by selected plan's active (possibly discounted) price ascending.
      // Preferred carriers only act as a secondary tie-breaker (price always wins for clarity).
      const getSortPrice = (c: any) => {
        const p = c.plans?.[selectedPlan];
        if (typeof p === 'number' && !Number.isNaN(p)) return p;
        return Number.POSITIVE_INFINITY; // sink carriers lacking this plan
      };
      enriched.forEach((c:any)=>{ c.__sortPrice = getSortPrice(c); });
      // Sorting updated: pure price ordering (ascending) with name as final tie-breaker.
      // Preferred status no longer influences ordering; it is only used for filtering via the toggle.
      enriched.sort((a: any, b: any) => {
        if (a.__sortPrice !== b.__sortPrice) return a.__sortPrice - b.__sortPrice;
        return (a.name || '').localeCompare(b.name || '');
      });
      return enriched;
    }
    // Fallback: use legacy computed summaries (still hydrated above) if adapter produced none
    return carrierSummaries;
  }, [activeCategory, adapterMedigapSummaries, adapterMedigapQuotes, carrierSummaries, applyDiscounts, selectedPlan]);

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
      const enhancedInfo: { displayName: string; logoUrl: string; isPreferred?: boolean; priority?: number } = related.length
        ? (getEnhancedCarrierInfo(related[0], productCategory as any) as any)
        : {
            displayName: s.carrierName,
            logoUrl: s.logoUrl || '/images/carrier-placeholder.svg',
            isPreferred: false,
            priority: undefined
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
        __preferred: !!enhancedInfo?.isPreferred,
        __preferredPriority: typeof enhancedInfo?.priority === 'number' ? enhancedInfo.priority : 999,
      };
    });
  }, [pdpSummaries, pdpNormalized, activeCategory]);

  // Reusable preferred filtering for non-medigap categories (price ordering already handled in their own memos)
  const applyPreferredFilter = useCallback(<T extends { __preferred?: boolean; name?: string }>(arr: T[], uiCategory: string): T[] => {
    if (!preferredOnly) return arr;
    if (!categorySupportsPreferredCarriers(uiCategory)) return arr;
    let preferred = arr.filter(c => c.__preferred);
    if (preferred.length) return preferred;
    // Fallback inference: attempt on-the-fly token overlap if none previously marked.
    try {
      const productCat = mapUICategoryToProductCategory(uiCategory);
      if (productCat) {
        const basePreferred = getPreferredCarriers(productCat as any);
        if (basePreferred.length) {
          const STOP = new Set(['life','insurance','ins','company','co','inc','grp','group','health','assurance','national','america','american','plans','plan','holdings']);
          const tok = (s:string) => (s||'').toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(Boolean).filter(w=>!STOP.has(w));
          const variants: { carrierId:string; tokens:Set<string>; priority:number }[] = [];
          basePreferred.forEach(p => { const info = getCarrierById(p.carrierId as any) as any; if(!info) return; const set = new Set<string>(); [info.displayName, info.shortName, info.name, ...(info.namePatterns||[])].forEach(v=> v && tok(v).forEach(t=> set.add(t))); if(set.size) variants.push({ carrierId:p.carrierId, tokens:set, priority:p.priority }); });
          const inferred: T[] = [];
          arr.forEach(c => {
            const nTokens = tok(String(c.name||'')); if(!nTokens.length) return; const nSet = new Set(nTokens);
            let bestScore = 0; let bestPriority = Infinity; let matched = false;
            variants.forEach(v => { const overlap = Array.from(v.tokens).filter(t=> nSet.has(t)); if(!overlap.length) return; const smaller = Math.min(v.tokens.size, nSet.size)||1; const score = overlap.length / smaller; if(score > bestScore || (score === bestScore && v.priority < bestPriority)){ bestScore = score; bestPriority = v.priority; } });
            if (bestScore >= 0.5) { matched = true; }
            if (matched) inferred.push({ ...(c as any), __preferred: true });
          });
          if (inferred.length) {
            preferred = inferred;
            if (process.env.NODE_ENV !== 'production') {
              // eslint-disable-next-line no-console
              console.info(`[preferredFilter:fallback] Inferred ${inferred.length} preferred carriers for category '${uiCategory}' via token overlap.`);
            }
            return preferred;
          }
        }
      }
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('[preferredFilter:fallback] inference error', err);
      }
    }
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.info(`[preferredFilter] No preferred carriers matched for category '${uiCategory}'. Returning empty list.`);
    }
    return preferred; // empty
  }, [preferredOnly]);


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
  const filteredAdvantageCarriers = useMemo(()=> applyPreferredFilter(advantageCarriers, 'advantage'), [advantageCarriers, applyPreferredFilter]);

  // New category adapter integrations ----------------------------------------------------
  const { summaries: dentalSummaries, normalized: dentalNormalized } = useCategoryQuotes<any>('dental', activeCategory==='dental' ? quotes : [], { enabled: true });

  // Generic multi-category carrier enrichment with canonical name + second-pass preferred detection
  const normalizeCarrierName = useCallback((rawName: string) => {
    if (!rawName) return rawName;
    let n = rawName.toLowerCase();
    n = n.replace(/(insurance|healthcare|solutions|company|companies|life|health|senior|plans|corp\.?|corporation|inc\.?|holdings)/g,'')
         .replace(/[^a-z0-9\s]/g,'')
         .replace(/\s+/g,' ') // collapse whitespace
         .trim();
    return n.split(' ').map(w=> w.charAt(0).toUpperCase()+w.slice(1)).join(' ');
  }, []);

  interface GenericEnrichedArgs { categoryKey: string; planKey: string; summaries: any[]; normalized: any[]; overrideNormalized?: any[] }
  const buildGenericCarriers = useCallback(({ categoryKey, planKey, summaries, normalized, overrideNormalized }: GenericEnrichedArgs) => {
    const dataset = overrideNormalized || normalized;
    const productCategory = mapUICategoryToProductCategory(categoryKey) || categoryKey;
    const map = new Map<string, any>();
    for (const s of summaries) {
      const range = s.planRanges?.[planKey];
      const related = dataset.filter(q => q.carrier.id === s.carrierId);
      const representativeQuote = related[0];
      let enhancedInfo = getEnhancedCarrierInfo(representativeQuote || { carrier: { name: s.carrierName, id: s.carrierId } }, productCategory as any) as any;
      if (!enhancedInfo.isPreferred) {
        const canonical = normalizeCarrierName(s.carrierName || '');
        if (canonical && canonical !== s.carrierName) {
          const second = getEnhancedCarrierInfo({ carrier: { name: canonical } } as any, productCategory as any) as any;
          if (second?.isPreferred) enhancedInfo = second;
        }
      }
      // Category-specific aggregation
      const extra: Record<string, any> = {};
      if (categoryKey === 'dental') {
        let annualMax: number|undefined; let deductibleIndividual: number|undefined; let visionIncluded: boolean|undefined; let hearingIncluded: boolean|undefined; let planName: string|undefined;
        related.forEach(r => {
          if (annualMax == null && typeof r.metadata?.annualMax === 'number') annualMax = r.metadata.annualMax;
          if (deductibleIndividual == null && typeof r.metadata?.deductibleIndividual === 'number') deductibleIndividual = r.metadata.deductibleIndividual;
          if (visionIncluded == null && typeof r.metadata?.visionIncluded === 'boolean') visionIncluded = r.metadata.visionIncluded;
          if (hearingIncluded == null && typeof r.metadata?.hearingIncluded === 'boolean') hearingIncluded = r.metadata.hearingIncluded;
          if (!planName) planName = r.plan.display;
        });
        Object.assign(extra, { annualMax, deductibleIndividual, visionIncluded, hearingIncluded, planName });
      } else if (categoryKey === 'cancer') {
        let lumpSum: number|undefined; let wellness: number|undefined; let recurrence: boolean|undefined; let planName: string|undefined;
        related.forEach(r => { if (lumpSum == null && typeof r.metadata?.lumpSum === 'number') lumpSum = r.metadata.lumpSum; if (wellness == null && typeof r.metadata?.wellness === 'number') wellness = r.metadata.wellness; if (recurrence == null && typeof r.metadata?.recurrence === 'boolean') recurrence = r.metadata.recurrence; if (!planName) planName = r.plan.display; });
        Object.assign(extra, { lumpSum, wellness, recurrence, planName });
      } else if (categoryKey === 'hospital') {
        let dailyBenefit: number|undefined; let daysCovered: number|undefined; let ambulance: number|undefined; let icuUpgrade: boolean|undefined; let planName: string|undefined;
        related.forEach(r => { if (dailyBenefit == null && typeof r.metadata?.dailyBenefit === 'number') dailyBenefit = r.metadata.dailyBenefit; if (daysCovered == null && typeof r.metadata?.daysCovered === 'number') daysCovered = r.metadata.daysCovered; if (ambulance == null && typeof r.metadata?.ambulance === 'number') ambulance = r.metadata.ambulance; if (icuUpgrade == null && typeof r.metadata?.icuUpgrade === 'boolean') icuUpgrade = r.metadata.icuUpgrade; if (!planName) planName = r.plan.display; });
        Object.assign(extra, { dailyBenefit, daysCovered, ambulance, icuUpgrade, planName });
      }
      const key = (enhancedInfo.displayName || s.carrierName || s.carrierId).toLowerCase();
      const existing = map.get(key);
      if (existing) {
        // merge price ranges and counts
        if (typeof range?.min === 'number') existing.min = Math.min(existing.min ?? Infinity, range.min);
        if (typeof range?.max === 'number') existing.max = Math.max(existing.max ?? -Infinity, range.max);
        existing.count += related.length;
        Object.entries(extra).forEach(([k,v])=> { if (existing[k] == null && v != null) existing[k] = v; });
      } else {
        map.set(key, {
          id: s.carrierId,
          name: enhancedInfo.displayName || s.carrierName,
          logo: enhancedInfo.logoUrl || s.logoUrl || '/images/carrier-placeholder.svg',
          min: range?.min,
          max: range?.max,
          planRange: range,
          count: related.length,
          __preferred: !!enhancedInfo.isPreferred,
          __preferredPriority: enhancedInfo.priority ?? 999,
          ...extra,
        });
      }
    }
    const enriched = Array.from(map.values());
    // Secondary preferred inference: if no carriers (or some) marked preferred, try relaxed token overlap against preferred carrier variants.
    try {
      const productCat = mapUICategoryToProductCategory(categoryKey) as any;
      const preferredList = productCat ? getPreferredCarriers(productCat) : [];
      if (preferredList.length) {
        const STOP = new Set(['life','insurance','ins','company','co','inc','grp','group','health','assurance','national','america','american','plans','plan','holdings']);
        const tok = (s:string) => (s||'').toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(Boolean).filter(w=>!STOP.has(w));
        interface PrefVariant { carrierId:string; tokens:Set<string>; priority:number; }
        const variants: PrefVariant[] = [];
        preferredList.forEach(p => {
          const info = getCarrierById(p.carrierId as any) as any;
          if (!info) return;
          const varSet = new Set<string>();
          [info.displayName, info.shortName, info.name, ...(info.namePatterns||[])].forEach(v=> { if(v) tok(v).forEach(t=> varSet.add(t)); });
          if (varSet.size) variants.push({ carrierId: p.carrierId, tokens: varSet, priority: p.priority });
        });
        enriched.forEach((e: any) => {
          if (e.__preferred) return; // already preferred
          const nameTokens = tok(String(e.name||''));
            if (!nameTokens.length) return;
            let best: any = null;
            const nameTokenSet = new Set(nameTokens);
            variants.forEach(v => {
              const overlap = Array.from(v.tokens).filter(t => nameTokenSet.has(t));
              const smaller = Math.min(v.tokens.size, nameTokenSet.size) || 1;
              const score = overlap.length / smaller;
              if (overlap.length && score >= 0.6) {
                if (!best || score > best.score || (score === best.score && v.priority < best.priority)) {
                  best = { carrierId: v.carrierId, score, priority: v.priority };
                }
              }
            });
            if (best && typeof best.priority === 'number') {
              (e as any).__preferred = true;
              (e as any).__preferredPriority = best.priority;
            }
        });
      }
    } catch {/* silent */}
    enriched.sort((a:any,b:any)=>{ const aMin=typeof a.min==='number'?a.min:Infinity; const bMin=typeof b.min==='number'?b.min:Infinity; if(aMin===bMin){ return String(a.name??'').localeCompare(String(b.name??'')); } return aMin-bMin; });
    if (process.env.NODE_ENV !== 'production') {
      const preferredCount = enriched.filter(e=>e.__preferred).length;
      // eslint-disable-next-line no-console
      console.debug(`[carrierEnrichment:${categoryKey}] total=${enriched.length} preferred=${preferredCount}`);
      if (!preferredCount) {
        // eslint-disable-next-line no-console
        console.debug(`[carrierEnrichment:${categoryKey}] sample names`, enriched.slice(0,5).map(e=>e.name));
      }
    }
    return enriched;
  }, [normalizeCarrierName]);

  const dentalCarriers = useMemo(()=> activeCategory==='dental' ? buildGenericCarriers({ categoryKey:'dental', planKey:'DENTAL', summaries: dentalSummaries, normalized: dentalNormalized }) : [], [activeCategory, dentalSummaries, dentalNormalized, buildGenericCarriers]);
  const filteredDentalCarriers = useMemo(()=> applyPreferredFilter(dentalCarriers, 'dental'), [dentalCarriers, applyPreferredFilter]);

  const { summaries: cancerSummaries, normalized: cancerNormalized } = useCategoryQuotes<any>('cancer', activeCategory==='cancer' ? quotes : [], { enabled: true });
  const cancerCarriers = useMemo(()=> activeCategory==='cancer' ? buildGenericCarriers({ categoryKey:'cancer', planKey:'CANCER', summaries: cancerSummaries, normalized: cancerNormalized }) : [], [activeCategory, cancerSummaries, cancerNormalized, buildGenericCarriers]);
  const filteredCancerCarriers = useMemo(()=> applyPreferredFilter(cancerCarriers, 'cancer'), [cancerCarriers, applyPreferredFilter]);

  // Use canonical id 'hospital-indemnity' for adapter consistency
  const { summaries: hospitalSummaries, normalized: hospitalNormalized } = useCategoryQuotes<any>('hospital-indemnity', activeCategory==='hospital' ? quotes : [], { enabled: true });
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
  const stickyHospitalAdapter = useCategoryQuotes<any>('hospital-indemnity', stickyHospitalQuotes, {
    enabled: activeCategory === 'hospital' && hospitalNormalized.length === 0 && stickyHospitalQuotes.length > 0,
  });
  const effectiveHospitalNormalized = (activeCategory === 'hospital'
    && hospitalNormalized.length === 0
    && stickyHospitalQuotes.length > 0)
    ? stickyHospitalAdapter.normalized
    : hospitalNormalized;
  const hospitalCarriers = useMemo(()=> activeCategory==='hospital' ? buildGenericCarriers({ categoryKey:'hospital', planKey:'HOSP', summaries: hospitalSummaries, normalized: hospitalNormalized, overrideNormalized: (effectiveHospitalNormalized || hospitalNormalized) }) : [], [activeCategory, hospitalSummaries, hospitalNormalized, effectiveHospitalNormalized, buildGenericCarriers]);
  const filteredHospitalCarriers = useMemo(()=> applyPreferredFilter(hospitalCarriers, 'hospital'), [hospitalCarriers, applyPreferredFilter]);

  const { summaries: finalExpenseSummaries, normalized: finalExpenseNormalized } = useCategoryQuotes<any>('final-expense', activeCategory==='final-expense' ? quotes : [], { enabled: true });
  const finalExpenseCarriers = useMemo(() => {
    if (activeCategory !== 'final-expense') return [] as any[];
    const productCategory = mapUICategoryToProductCategory('final-expense') || 'final-expense';
    // Grab requested face value (if any) from stored form state (same source used in header display)
    let requestedFace: number | undefined; let feMode: 'face'|'rate' = 'face'; let targetRate: number | undefined;
    try {
      const raw = typeof window!=='undefined'? localStorage.getItem('medicare_form_state'):null;
      if(raw){ const o=JSON.parse(raw); if(o?.finalExpenseQuoteMode==='rate') feMode='rate'; if(o?.desiredFaceValue){ const v=parseInt(o.desiredFaceValue,10); if(!isNaN(v)) requestedFace=v; } if(o?.desiredRate){ const r=parseFloat(o.desiredRate); if(!isNaN(r)) targetRate=r; } }
    } catch {/* ignore */}
    const FACE_TOLERANCE = 0.2; // ±20%
    interface FEEntry { id:string; name:string; logo:string; min?:number; max?:number; fullMin?:number; fullMax?:number; planRange?:any; planNames:string[]; faceAmount?:number; faceAmountMin?:number; faceAmountMax?:number; graded?:boolean; immediate?:boolean; accidental?:boolean; underwritingType?:string; requestedFace?:number; quoteMode: 'face'|'rate'; targetRate?:number; count:number; __preferred:boolean; __preferredPriority:number; }
    const aggregate = new Map<string, FEEntry>();
    for (const s of finalExpenseSummaries) {
      const range = s.planRanges?.FE; const related = finalExpenseNormalized.filter(q => q.carrier.id === s.carrierId);
      let faceAmount: number|undefined; let graded: boolean|undefined; let immediate: boolean|undefined; let accidental: boolean|undefined; let planName: string|undefined; let underwritingType: string|undefined; let faceAmountMin: number|undefined; let faceAmountMax: number|undefined;
      const allPrices: number[] = []; const requestedBandPrices: number[] = [];
      related.forEach(r => {
        if (faceAmount == null && typeof r.metadata?.faceAmount === 'number') faceAmount = r.metadata.faceAmount;
        if (typeof r.metadata?.faceAmount === 'number') {
          if (faceAmountMin == null || r.metadata.faceAmount < faceAmountMin) faceAmountMin = r.metadata.faceAmount;
          if (faceAmountMax == null || r.metadata.faceAmount > faceAmountMax) faceAmountMax = r.metadata.faceAmount;
        }
        const total = (r.pricing as any).totalMonthly ?? r.pricing.monthly;
        if (typeof total === 'number') {
          allPrices.push(total);
          const fv = (r.metadata as any)?.faceValue || r.metadata?.faceAmount;
            if (feMode === 'face' && requestedFace && typeof fv === 'number') {
              const lower = requestedFace * (1 - FACE_TOLERANCE);
              const upper = requestedFace * (1 + FACE_TOLERANCE);
              if (fv >= lower && fv <= upper) requestedBandPrices.push(total);
            }
        }
        if (graded == null && typeof r.metadata?.graded === 'boolean') graded = r.metadata.graded;
        if (immediate == null && typeof r.metadata?.immediate === 'boolean') immediate = r.metadata.immediate;
        if (accidental == null && typeof r.metadata?.accidental === 'boolean') accidental = r.metadata.accidental;
        if (!planName) planName = r.plan.display;
        if (!underwritingType) {
          const uw = (r.metadata as any)?.underwritingType || (r.metadata as any)?.underwriting;
          if (typeof uw === 'string' && uw.trim()) underwritingType = uw.trim();
        }
      });
      const representativeQuote = related[0];
      let enhancedInfo = representativeQuote ? getEnhancedCarrierInfo(representativeQuote, productCategory as any) : { displayName: s.carrierName, logoUrl: s.logoUrl, isPreferred: false, priority: undefined };
      if (!enhancedInfo.isPreferred) {
        // second pass with canonical name
        try { const canonical = (typeof normalizeCarrierName === 'function') ? (normalizeCarrierName(enhancedInfo.displayName || s.carrierName || '')) : undefined; if (canonical && canonical !== (enhancedInfo.displayName||s.carrierName)) { const second = getEnhancedCarrierInfo({ carrier:{ name: canonical } } as any, productCategory as any) as any; if (second?.isPreferred) enhancedInfo = second; } } catch {/* ignore */}
      }
      const rawName: any = enhancedInfo.displayName || s.carrierName;
      const name = typeof rawName === 'string' ? rawName : String(rawName ?? 'Unknown');
      const displayPrices = (feMode === 'face' && requestedFace && requestedBandPrices.length) ? requestedBandPrices : allPrices;
      const displayMin = displayPrices.length ? Math.min(...displayPrices) : undefined;
      const displayMax = displayPrices.length ? Math.max(...displayPrices) : undefined;
      const fullMin = allPrices.length ? Math.min(...allPrices) : displayMin;
      const fullMax = allPrices.length ? Math.max(...allPrices) : displayMax;
      const key = name.toLowerCase();
      const existing = aggregate.get(key);
      if (existing) {
        existing.min = Math.min(existing.min ?? Infinity, displayMin ?? Infinity);
        existing.max = Math.max(existing.max ?? -Infinity, displayMax ?? -Infinity);
        existing.fullMin = Math.min(existing.fullMin ?? Infinity, fullMin ?? Infinity);
        existing.fullMax = Math.max(existing.fullMax ?? -Infinity, fullMax ?? -Infinity);
        existing.count += related.length;
        if (planName && !existing.planNames.includes(planName)) existing.planNames.push(planName);
        existing.faceAmountMin = faceAmountMin != null ? Math.min(existing.faceAmountMin ?? faceAmountMin, faceAmountMin) : existing.faceAmountMin;
        existing.faceAmountMax = faceAmountMax != null ? Math.max(existing.faceAmountMax ?? faceAmountMax, faceAmountMax) : existing.faceAmountMax;
        existing.faceAmount = existing.faceAmount ?? faceAmount;
        existing.graded = existing.graded ?? graded;
        existing.immediate = existing.immediate ?? immediate;
        existing.accidental = existing.accidental ?? accidental;
        existing.underwritingType = existing.underwritingType ?? underwritingType;
        existing.__preferred = existing.__preferred || !!enhancedInfo.isPreferred;
        existing.__preferredPriority = Math.min(existing.__preferredPriority, enhancedInfo.priority ?? 999);
      } else {
        aggregate.set(key, {
          id: s.carrierId,
          name,
          logo: enhancedInfo.logoUrl || s.logoUrl || '/carrier-logos/1.png',
          min: displayMin,
          max: displayMax,
          fullMin,
          fullMax,
          planRange: { ...(range||{}), min: displayMin, max: displayMax },
          planNames: planName ? [planName] : [],
          faceAmount,
          faceAmountMin,
          faceAmountMax,
          graded,
          immediate,
          accidental,
          underwritingType,
          requestedFace,
          quoteMode: feMode,
          targetRate,
          count: related.length,
          __preferred: !!enhancedInfo.isPreferred,
          __preferredPriority: enhancedInfo.priority ?? 999,
        });
      }
    }
    const enriched = Array.from(aggregate.values());
    // Secondary preferred inference (same logic as generic) in case enhancedInfo missed a pattern form.
    try {
      const productCat = mapUICategoryToProductCategory('final-expense') as any;
      const preferredList = productCat ? getPreferredCarriers(productCat) : [];
      if (preferredList.length) {
        const STOP = new Set(['life','insurance','ins','company','co','inc','grp','group','health','assurance','national','america','american','plans','plan','holdings']);
        const tok = (s:string) => (s||'').toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(Boolean).filter(w=>!STOP.has(w));
        interface PrefVariant { carrierId:string; tokens:Set<string>; priority:number; }
        const variants: PrefVariant[] = [];
        preferredList.forEach(p => {
          const info = getCarrierById(p.carrierId as any) as any;
          if (!info) return;
          const varSet = new Set<string>();
          [info.displayName, info.shortName, info.name, ...(info.namePatterns||[])].forEach(v=> { if(v) tok(v).forEach(t=> varSet.add(t)); });
          if (varSet.size) variants.push({ carrierId: p.carrierId, tokens: varSet, priority: p.priority });
        });
        enriched.forEach((e: any) => {
          if (e.__preferred) return;
          const nameTokens = tok(String(e.name||''));
          if (!nameTokens.length) return;
          let best: any = null;
          const nameTokenSet = new Set(nameTokens);
          variants.forEach(v => {
            const overlap = Array.from(v.tokens).filter(t => nameTokenSet.has(t));
            const smaller = Math.min(v.tokens.size, nameTokenSet.size) || 1;
            const score = overlap.length / smaller;
            if (overlap.length && score >= 0.6) {
              if (!best || score > best.score || (score === best.score && v.priority < best.priority)) {
                best = { carrierId: v.carrierId, score, priority: v.priority };
              }
            }
          });
          if (best && typeof best.priority === 'number') {
            (e as any).__preferred = true;
            (e as any).__preferredPriority = best.priority;
          }
        });
      }
    } catch {/* ignore */}
    // Diagnostics (retain suspicious pricing detection, aggregated now)
    if (process.env.NODE_ENV !== 'production') {
      try {
        const diagnostics = enriched.filter(e=> typeof e.min==='number').map(e=>({ carrier:e.name, min:e.min, max:e.max, fullMin:e.fullMin, fullMax:e.fullMax, count:e.count }));
        const suspicious = diagnostics.filter(d=> d.min!=null && d.min < 30);
        if (suspicious.length) {
          // eslint-disable-next-line no-console
          console.groupCollapsed('[FE Pricing Diagnostics] Suspicious low mins (aggregated)');
          console.table(suspicious);
          console.groupEnd();
        }
        const preferredCount = enriched.filter(e=>e.__preferred).length;
        // eslint-disable-next-line no-console
        console.debug(`[carrierEnrichment:final-expense] total=${enriched.length} preferred=${preferredCount}`);
        if (!preferredCount) {
          // eslint-disable-next-line no-console
          console.debug('[carrierEnrichment:final-expense] sample names', enriched.slice(0,5).map(e=>e.name));
        }
      } catch {/* noop */}
    }
    enriched.sort((a:any,b:any)=>{ const aMin=typeof a.min==='number'?a.min:Infinity; const bMin=typeof b.min==='number'?b.min:Infinity; if(aMin===bMin){ return String(a.name??'').localeCompare(String(b.name??'')); } return aMin-bMin; });
    return enriched;
  }, [activeCategory, finalExpenseSummaries, finalExpenseNormalized, normalizeCarrierName]);
  const filteredFinalExpenseCarriers = useMemo(()=> applyPreferredFilter(finalExpenseCarriers, 'final-expense'), [finalExpenseCarriers, applyPreferredFilter]);

  const filteredPdpCarriers = useMemo(()=> applyPreferredFilter(pdpCarriers, 'drug-plan'), [pdpCarriers, applyPreferredFilter]);

  // ----------------------------------------------------------------------------------
  // Client-only effects (moved from inline render IIFEs to prevent hydration mismatch)
  useEffect(() => {
    if (typeof window === 'undefined') return; // SSR guard
    if (activeCategory !== 'final-expense') return;
    try {
      const raw = localStorage.getItem('medicare_form_state');
      if (raw) {
        const obj = JSON.parse(raw);
        let badge: string | null = null;
        if (obj?.finalExpenseQuoteMode === 'rate' && obj?.desiredRate) {
          badge = `(Target: $${obj.desiredRate}/mo)`;
        } else if (obj?.desiredFaceValue) {
          badge = `(Requested: $${obj.desiredFaceValue})`;
        }
        setFinalExpenseBadge(badge);
      } else {
        setFinalExpenseBadge(null);
      }
    } catch { setFinalExpenseBadge(null); }
  }, [activeCategory, filteredFinalExpenseCarriers.length]);

  // Persist a snapshot of final expense raw quotes (original inline side-effect moved here)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (activeCategory !== 'final-expense') return;
    try {
      if (!localStorage.getItem('last_final_expense_raw_response')) {
        const stored = localStorage.getItem('medicare_final_expense_quotes');
        if (stored) {
          const quotes = JSON.parse(stored);
          if (Array.isArray(quotes) && quotes.length) {
            let params: any = undefined;
            const paramsRaw = localStorage.getItem('medicare_form_state');
            try { if (paramsRaw) params = JSON.parse(paramsRaw); } catch {}
            localStorage.setItem('last_final_expense_raw_response', JSON.stringify({ fetchedAt: new Date().toISOString(), params, quotes }, null, 2));
          }
        }
      }
    } catch {/* noop */}
  }, [activeCategory, finalExpenseNormalized.length]);

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
  // Hydrate stored page index (per-category key to prevent cross-category jumping)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const key = `carrier_page_${activeCategory}`;
      const raw = localStorage.getItem(key);
      const parsed = raw ? parseInt(raw, 10) : 1;
      if (parsed > 0) setCarrierPage(parsed);
    } catch {}
  }, [activeCategory]);

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
    if (preferredOnly && categorySupportsPreferredCarriers(activeCategory)) {
      const preferredList = base.filter((c: any) => c.__preferred);
      // If no preferred carriers for the current dataset (e.g., not loaded yet), show base to avoid empty state confusion.
      return preferredList.length ? preferredList : base;
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

  // Persist page index with per-category key
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try { localStorage.setItem(`carrier_page_${activeCategory}`, String(carrierPage)); } catch {}
    }
  }, [carrierPage, activeCategory]);

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
  // Pre-emptively mark a category as loading on change (layout effect prevents flash of "No X plans" before effect runs)
  // Only do this if we have not hydrated that category before.
  try { /* useLayoutEffect may not exist server-side */ } catch {}
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useLayoutEffect?.(() => {
    if (!categoryHydrated[activeCategory]) {
      setLoadingQuotes(true);
    }
  }, [activeCategory, categoryHydrated]);

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
        if (mounted) {
          setCategoryHydrated(prev => (prev[activeCategory] ? prev : { ...prev, [activeCategory]: true }));
        }
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
        <>
          {/* Visual deemphasis overlay (non-blur for perf; mild backdrop blur optional) */}
          <div
            aria-hidden="true"
            className="fixed inset-0 z-[110] hidden lg:block bg-white/50 dark:bg-slate-900/40 backdrop-blur-[2px] transition-opacity"
          />
          {/* Click-catcher */}
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setCloseSignal(s => s + 1)}
            className="fixed inset-0 z-[111] hidden lg:block cursor-default"
          />
        </>
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
                // Immediately show skeletons for target category
                setLoadingQuotes(true);
                // Early add category to selected list so button appears immediately
                let selected: string[] = [];
                try {
                  const rawEarly = localStorage.getItem(SELECTED_CATEGORIES_KEY);
                  if (rawEarly) selected = JSON.parse(rawEarly);
                } catch {}
                const alreadyHad = selected.includes(category);
                if (!alreadyHad) {
                  selected.push(category);
                  try { localStorage.setItem(SELECTED_CATEGORIES_KEY, JSON.stringify(selected)); } catch {}
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
                  const dentalParams = buildDentalParams(formData);
                  const attemptStart = Date.now();
                  const { success, quotes, error } = await getDentalQuotesWithRetry(dentalParams as any, { attempts: 3 });
                  if (!success) {
                    const isTimeout = /deadline/i.test(error || '');
                    // Try fallback to previously persisted quotes
                    let cached: any[] = [];
                    try { const raw = await loadFromStorage(DENTAL_QUOTES_KEY, []); if (Array.isArray(raw)) cached = raw; } catch {}
                    if (cached.length) {
                      console.warn('🦷 Dental fetch failed; using cached quotes fallback', { cached: cached.length, error });
                      await persistQuotes(DENTAL_QUOTES_KEY, cached); // refresh timestamp
                    } else {
                      const friendly = isTimeout
                        ? 'Dental quote request timed out. Please retry – the service may be under temporary load.'
                        : (error || 'Dental quote fetch failed');
                      throw new Error(friendly);
                    }
                  } else if (quotes) {
                    await persistQuotes(DENTAL_QUOTES_KEY, quotes);
                  }
                  if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.debug('[dental quotes] completed', { durationMs: Date.now() - attemptStart, success });
                  }
                } else if (category === 'cancer') {
                  const cancerParams = buildCancerParams(formData, { benefitStrategy: 'form' });
                  const { quotes, success, error } = await getCancerInsuranceQuotes(cancerParams as any);
                  if (!success) throw new Error(error || 'Cancer quote fetch failed');
                  await persistQuotes(CANCER_INSURANCE_QUOTES_KEY, quotes);
                } else if (category === 'hospital') {
                  const hospParams = buildHospitalParams(formData);
                  if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.debug('[hospital quotes] requesting with params', hospParams);
                  }
                  const { quotes, success, error } = await getHospitalIndemnityQuotes(hospParams as any);
                  if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.debug('[hospital quotes] response meta', { success, error, count: quotes?.length });
                    if (quotes && quotes.length > 0) {
                      // eslint-disable-next-line no-console
                      const first = quotes[0] as any;
                      console.debug('[hospital quotes] first quote sample', {
                        key: first?.key || first?.plan_name || '(no-key)',
                        carrier: first?.company || first?.carrier_name || first?.company_base?.name,
                        plan: first?.plan_name,
                        policy_fee: first?.policy_fee,
                        base_plans: Array.isArray(first?.base_plans) ? first.base_plans.length : undefined,
                        riders: Array.isArray(first?.riders) ? first.riders.length : undefined
                      });
                    }
                  }
                  if (!success) throw new Error(error || 'Hospital Indemnity quote fetch failed');
                  await persistQuotes(HOSPITAL_INDEMNITY_QUOTES_KEY, quotes);
                  if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.debug('[hospital quotes] persisted', { key: HOSPITAL_INDEMNITY_QUOTES_KEY, storedCount: quotes?.length });
                  }
                } else if (category === 'final-expense') {
                  const feParams = buildFinalExpenseParams(formData);
                  // Defensive defaults if user skipped fields (should be required now, but guard anyway)
                  if(!feParams.age) (feParams as any).age = 65;
                  if(!feParams.gender) (feParams as any).gender = 'M';
                  if(typeof feParams.tobaccoUse !== 'boolean') (feParams as any).tobaccoUse = false;
                  // Read benefit type selection (persisted) to pass upstream if provided
                  let benefitNameParam: string | undefined = undefined;
                  try {
                    const rawState = localStorage.getItem('medicare_form_state');
                    if (rawState) {
                      const s = JSON.parse(rawState);
                      const bt = s?.finalExpenseBenefitType;
                      if (bt && bt !== '__all' && bt !== 'All' && bt !== '') benefitNameParam = bt;
                    }
                  } catch {}
                  const { quotes, success, error } = await getFinalExpenseLifeQuotes({
                    zipCode: feParams.zipCode,
                    age: feParams.age,
                    gender: feParams.gender,
                    tobaccoUse: feParams.tobaccoUse,
                    desiredFaceValue: feParams.quoteMode === 'face' ? feParams.desiredFaceValue : undefined,
                    desiredRate: feParams.quoteMode === 'rate' ? feParams.desiredRate : undefined
                  } as any); // benefitName intentionally omitted (client-side filtering only)
                  if (!success) throw new Error(error || 'Final Expense quote fetch failed');
                  // Benefit Type filtering (client-side) based on stored form state
                  let filtered = quotes;
                  try {
                    const rawState = localStorage.getItem('medicare_form_state');
                    if(rawState){
                      const s = JSON.parse(rawState);
                      const benefitType = s?.finalExpenseBenefitType;
                      if(benefitType && benefitType !== '__all' && benefitType !== 'All'){
                        filtered = quotes.filter((q:any)=> (q.benefit_name||q.benefitName||'').toLowerCase() === String(benefitType).toLowerCase());
                      }
                    }
                  } catch {}
                  await persistQuotes(FINAL_EXPENSE_QUOTES_KEY, filtered);
                  try {
                    // Persist last raw FE response (compact) for copy helper
                    localStorage.setItem('last_final_expense_raw_response', JSON.stringify({ fetchedAt: new Date().toISOString(), params: feParams, quotes, filteredCount: filtered.length }, null, 2));
                  } catch {}
                }

                // Finalize selected categories list (already added above if new)
                // Dispatch event so any listeners (including hydration effect) can reload sooner
                try { window.dispatchEvent(new CustomEvent('quotes:updated', { detail: { category } })); } catch {}
              } catch (e) {
                console.error('Quote generation failed', e);
                // Roll back early category addition if quotes failed and no quotes key stored
                try {
                  const key = `medicare_${category.replace(/-/g,'_')}_quotes`;
                  const hasQuotes = !!localStorage.getItem(category==='medigap' ? 'medigap_plan_quotes_stub' : key);
                  if (!hasQuotes) {
                    const rawRollback = localStorage.getItem(SELECTED_CATEGORIES_KEY);
                    if (rawRollback) {
                      let arr = [] as string[];
                      try { arr = JSON.parse(rawRollback); } catch {}
                      const next = arr.filter(c => c !== category);
                      if (next.length !== arr.length) {
                        localStorage.setItem(SELECTED_CATEGORIES_KEY, JSON.stringify(next));
                        try { window.dispatchEvent(new CustomEvent('selectedCategories:updated')); } catch {}
                      }
                    }
                  }
                } catch {}
              }
              finally {
                // Allow a slight delay to ensure persistence before clearing loading (avoid flicker if extremely fast)
                setTimeout(()=> setLoadingQuotes(false), 50);
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

          {/* Removed empty-state notice per request (prevent persistent box) */}

          {/* Saved plans strip */}
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
              {pdpCarriers.length === 0 && !loadingQuotes && categoryHydrated['drug-plan'] && (
                <div className="text-xs text-slate-500 dark:text-slate-400">No drug plans loaded.</div>
              )}
              <DrugPlanCards carriers={filteredPdpCarriers as any} loading={loadingQuotes} onOpenCarrierDetails={(c)=>openPdpDetails({ id: c.name })} />
            </section>
          )}
          {activeCategory === 'advantage' && (
            <section className="space-y-6">
              <h3 className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-200">Medicare Advantage Plans</h3>
              {(!loadingQuotes && advantageCarriers.length === 0 && categoryHydrated['advantage']) && (
                <div className="text-xs text-slate-500 dark:text-slate-400">No advantage plans loaded.</div>
              )}
              <AdvantagePlanCards
                carriers={filteredAdvantageCarriers as any}
                loading={loadingQuotes && advantageCarriers.length === 0}
                onOpenCarrierDetails={(c)=> openCategoryDetails(c.name,'advantage') }
              />
            </section>
          )}
          {activeCategory === 'dental' && (
            <section className="space-y-6">
              <h3 className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-200">Dental Plans</h3>
              {/* Quick access developer utility buttons for plan builder / field mapping */}
              {dentalCarriers.length > 0 && (
                <div className="flex flex-wrap gap-2 -mt-2">
                  <Button size="sm" variant="outline" onClick={()=>{ try { window.open('/dental-field-mapping','_blank'); } catch { router.push('/dental-field-mapping'); } }}>Field Mapping</Button>
                </div>
              )}
              {(!loadingQuotes && dentalCarriers.length === 0 && categoryHydrated['dental']) && (<div className="text-xs text-slate-500 dark:text-slate-400">No dental plans loaded.</div>)}
              <DentalPlanCards carriers={filteredDentalCarriers as any} loading={loadingQuotes && dentalCarriers.length===0} onOpenCarrierDetails={(c)=> openCategoryDetails(c.name,'dental')} />
            </section>
          )}
          {activeCategory === 'cancer' && (
            <section className="space-y-6">
              <h3 className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-200">Cancer Plans</h3>
              {(!loadingQuotes && cancerCarriers.length === 0 && categoryHydrated['cancer']) && (<div className="text-xs text-slate-500 dark:text-slate-400">No cancer plans loaded.</div>)}
              <CancerPlanCards carriers={filteredCancerCarriers as any} loading={loadingQuotes && cancerCarriers.length===0} onOpenCarrierDetails={(c)=> openCategoryDetails(c.name,'cancer')} />
            </section>
          )}
          {activeCategory === 'hospital' && (
            <section className="space-y-6">
              <h3 className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-200">Hospital Indemnity Plans</h3>
              {filteredHospitalCarriers.length > 0 && (
                <div className="flex flex-wrap gap-2 -mt-2">
                  <Button size="sm" variant="outline" onClick={()=>{ try { window.open('/hospital-indemnity-field-mapping','_blank'); } catch { router.push('/hospital-indemnity-field-mapping'); } }}>Field Mapping</Button>
                  <Button size="sm" variant="outline" onClick={()=>{ try { window.open('/hospital-indemnity-plan-builder','_blank'); } catch { router.push('/hospital-indemnity-plan-builder'); } }}>Plan Builder</Button>
                </div>
              )}
              {(!loadingQuotes && filteredHospitalCarriers.length === 0 && categoryHydrated['hospital']) && (<div className="text-xs text-slate-500 dark:text-slate-400">No hospital indemnity plans loaded.</div>)}
              <HospitalIndemnityPlanCards carriers={filteredHospitalCarriers as any} loading={loadingQuotes && filteredHospitalCarriers.length===0} onOpenCarrierDetails={(c)=> openCategoryDetails(c.name,'hospital')} />
            </section>
          )}
              {activeCategory === 'final-expense' && (
            <section className="space-y-6">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  Final Expense Plans {finalExpenseBadge && <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{finalExpenseBadge}</span>}
                </h3>
              </div>
              {(!loadingQuotes && filteredFinalExpenseCarriers.length === 0 && categoryHydrated['final-expense']) && (<div className="text-xs text-slate-500 dark:text-slate-400">No final expense plans loaded.</div>)}
              <FinalExpensePlanCards carriers={filteredFinalExpenseCarriers as any} loading={loadingQuotes && filteredFinalExpenseCarriers.length===0} onOpenCarrierDetails={(c)=> openCategoryDetails(c.name,'final-expense')} />
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
            quotes={adapterMedigapQuotes.filter((q:any) => carrierMatches(activeCarrierId, q.carrier)).map((q:any) => {
              // If discounts are applied, prefer quotes whose metadata facet is with_hhd; else sans_hhd -> with_hhd -> unknown
              return q; // details component will internally compute display using plan key + discount state if needed
            })}
            plan={selectedPlan}
            onClose={closePlanDetails}
          />
        </div>
      )}
      {viewVisibility.planDetails && activeCarrierId && activeCategory === 'drug-plan' && (
        <div className="space-y-8">
          <PdpDetailsShowcase
            carrierName={activeCarrierId}
            quotes={pdpNormalized.filter(q => carrierMatches(activeCarrierId, q.carrier))}
            onClose={closePlanDetails}
          />
        </div>
      )}
      {viewVisibility.planDetails && activeCarrierId && activeCategory === 'advantage' && (
        <div className="space-y-8">
          <AdvantageDetailsShowcase
            carrierName={activeCarrierId}
            quotes={advantageNormalized.filter(q => carrierMatches(activeCarrierId, q.carrier))}
            onClose={closePlanDetails}
          />
        </div>
      )}
      {viewVisibility.planDetails && activeCarrierId && activeCategory === 'dental' && (
        <div className="space-y-8">
          {(() => {
            const norm = (s: string) => {
              const base = (s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
              return canonicalizeBrand(base);
            };
            // First pass: strict match via carrierMatches helper
            let related = dentalNormalized.filter(q => carrierMatches(activeCarrierId, q.carrier));

            // Second pass: simple substring fuzzy (existing behavior)
            if (!related.length) {
              const target = norm(activeCarrierId);
              related = dentalNormalized.filter(q => {
                const variants = [q.carrier?.id, q.carrier?.name, (q as any).carrier?.displayName]
                  .filter(Boolean)
                  .map(v => norm(String(v)));
                return variants.some(v => v && (v.includes(target) || target.includes(v)));
              });
            }

            // Third pass: token-based similarity ignoring generic suffix words (Inc, Insurance, Company, Life, Corp, Dental, Plan, Co, The)
            if (!related.length) {
              const stop = new Set(['inc','insurance','company','life','corp','corporation','dental','plan','co','the']);
              const tokenize = (s: string) => {
                const cleaned = (s||'')
                  .toLowerCase()
                  .replace(/[^a-z0-9\s]/g,' ')
                  .split(/\s+/)
                  .filter(w => w && !stop.has(w));
                return cleaned.map(t => canonicalizeBrand(t));
              };
              const targetTokens = tokenize(activeCarrierId);
              const targetSet = new Set(targetTokens);
              const targetLen = targetTokens.length || 1;
              related = dentalNormalized.filter(q => {
                const rawNames = [q.carrier?.name, q.carrier?.id, (q as any).carrier?.displayName].filter(Boolean) as string[];
                return rawNames.some(name => {
                  const toks = tokenize(name);
                  if (!toks.length) return false;
                  const overlap = toks.filter(t => targetSet.has(t));
                  // Require at least half of the smaller token list to overlap, or a single exact token if only one remains
                  const smaller = Math.min(toks.length, targetLen);
                  return overlap.length >= Math.max(1, Math.ceil(smaller * 0.5));
                });
              });
            }

            // As a last resort pick carriers with minimal Levenshtein distance on normalized strings (cheap manual implementation threshold)
            if (!related.length && dentalNormalized.length) {
              const a = norm(activeCarrierId);
              function dist(x: string, y: string) {
                const m = x.length, n = y.length;
                const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1));
                for (let i=0;i<=m;i++) dp[i][0]=i;
                for (let j=0;j<=n;j++) dp[0][j]=j;
                for (let i=1;i<=m;i++) {
                  for (let j=1;j<=n;j++) {
                    const cost = x[i-1] === y[j-1] ? 0 : 1;
                    dp[i][j] = Math.min(
                      dp[i-1][j] + 1,
                      dp[i][j-1] + 1,
                      dp[i-1][j-1] + cost
                    );
                  }
                }
                return dp[m][n];
              }
              let best: any[] = [];
              let bestScore = Infinity;
              dentalNormalized.forEach(q => {
                const candidates = [q.carrier?.name, q.carrier?.id, (q as any).carrier?.displayName].filter(Boolean) as string[];
                candidates.forEach(c => {
                  const d = dist(a, norm(c));
                  if (d < bestScore) { bestScore = d; best = [q]; }
                  else if (d === bestScore) { best.push(q); }
                });
              });
              if (bestScore <= Math.max(3, Math.floor(a.length * 0.3))) { // accept reasonably similar
                related = Array.from(new Set(best));
              }
            }

            try {
              const sampleCarrierNames = dentalNormalized.slice(0,10).map(q => q.carrier?.name || q.carrier?.id);
              console.debug('[dental details] carrier lookup', {
                request: activeCarrierId,
                totalDental: dentalNormalized.length,
                matched: related.length,
                sampleCarrierNames,
                firstMatch: related[0]
              });
            } catch {}
            return (
              <DentalDetailsShowcase
                carrierName={activeCarrierId}
                quotes={related}
                onClose={closePlanDetails}
              />
            );
          })()}
        </div>
      )}
      {viewVisibility.planDetails && activeCarrierId && activeCategory === 'cancer' && (
        <div className="space-y-8">
          <CancerDetailsShowcase
            carrierName={activeCarrierId}
            quotes={cancerNormalized.filter(q => carrierMatches(activeCarrierId, q.carrier))}
            onClose={closePlanDetails}
          />
        </div>
      )}
      {viewVisibility.planDetails && activeCarrierId && activeCategory === 'hospital' && (
        <div className="space-y-8">
          {(() => {
            // Multi-pass fuzzy carrier resolution (mirrors dental & final expense approach) to mitigate
            // enhanced preferred displayName vs raw quote carrier.id/name divergence.
            const stop = new Set(['inc','insurance','company','companies','life','health','corp','corporation','solutions','group','holding','holdings','assurance','plan','plans','the']);
            const normTight = (s:string) => {
              const base = (s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
              return canonicalizeBrand(base);
            };
            const tokenize = (s:string) => (s||'')
              .toLowerCase()
              .replace(/[^a-z0-9\s]/g,' ')
              .split(/\s+/)
              .filter(Boolean)
              .filter(w => !stop.has(w));
            // IMPORTANT: use effectiveHospitalNormalized (may contain sticky snapshot when primary normalized array is empty)
            let related = (effectiveHospitalNormalized || hospitalNormalized).filter(q => carrierMatches(activeCarrierId, q.carrier));
            // Direct id fallback
            if (!related.length) {
              const aid = activeCarrierId.toLowerCase();
              related = (effectiveHospitalNormalized || hospitalNormalized).filter(q => (q.carrier?.id || '').toLowerCase() === aid);
            }
            // Substring fuzzy
            if (!related.length) {
              const target = normTight(activeCarrierId);
              related = (effectiveHospitalNormalized || hospitalNormalized).filter(q => {
                const variants = [q.carrier?.id, q.carrier?.name, (q as any).carrier?.displayName].filter(Boolean) as string[];
                return variants.some(v => {
                  const n = normTight(v);
                  return !!n && (n.includes(target) || target.includes(n));
                });
              });
            }
            // Token overlap (>=50% smaller list)
            if (!related.length) {
              const targetTokens = tokenize(activeCarrierId);
              const targetSet = new Set(targetTokens);
              const targetLen = targetTokens.length || 1;
              related = (effectiveHospitalNormalized || hospitalNormalized).filter(q => {
                const rawNames = [q.carrier?.name, q.carrier?.id, (q as any).carrier?.displayName].filter(Boolean) as string[];
                return rawNames.some(name => {
                  const toks = tokenize(name);
                  if (!toks.length) return false;
                  const overlap = toks.filter(t => targetSet.has(t));
                  const smaller = Math.min(toks.length, targetLen);
                  return overlap.length >= Math.max(1, Math.ceil(smaller * 0.5));
                });
              });
            }
            // Levenshtein fallback (distance threshold relative to length)
            if (!related.length && (effectiveHospitalNormalized || hospitalNormalized).length) {
              const a = normTight(activeCarrierId);
              const dist = (x:string,y:string) => {
                const m=x.length,n=y.length; const dp = Array.from({length:m+1},()=>new Array<number>(n+1));
                for(let i=0;i<=m;i++) dp[i][0]=i; for(let j=0;j<=n;j++) dp[0][j]=j;
                for(let i=1;i<=m;i++){ for(let j=1;j<=n;j++){ const c = x[i-1]===y[j-1]?0:1; dp[i][j]=Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+c); }}
                return dp[m][n];
              };
              let best: any[] = []; let bestScore = Infinity;
              (effectiveHospitalNormalized || hospitalNormalized).forEach(q => {
                const candidates = [q.carrier?.name, q.carrier?.id, (q as any).carrier?.displayName].filter(Boolean) as string[];
                candidates.forEach(c => {
                  const d = dist(a, normTight(c));
                  if (d < bestScore) { bestScore = d; best = [q]; }
                  else if (d === bestScore) { best.push(q); }
                });
              });
              if (bestScore <= Math.max(3, Math.floor(a.length * 0.3))) {
                related = Array.from(new Set(best));
              }
            }
            try {
              const baseRef = (effectiveHospitalNormalized || hospitalNormalized);
              const sampleCarrierNames = baseRef.slice(0,10).map(q => q.carrier?.name || q.carrier?.id);
              console.debug('[hospital details] carrier lookup', {
                request: activeCarrierId,
                totalHospital: (effectiveHospitalNormalized || hospitalNormalized).length,
                matched: related.length,
                sampleCarrierNames,
                firstMatch: related[0]
              });
            } catch {}
            // Final ultra-relaxed fallback: if still no related quotes but we have hospital data, attempt alias + token containment
            if (!related.length && (effectiveHospitalNormalized || hospitalNormalized).length) {
              try {
                const base = (effectiveHospitalNormalized || hospitalNormalized);
                const activeCanon = canonicalizeBrand((activeCarrierId || '').toLowerCase());
                const normLoose = (s:string) => canonicalizeBrand(s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim());
                const aTokens = new Set(activeCanon.split(' ').filter(Boolean));
                let loose: any[] = [];
                base.forEach(q => {
                  const cname = (q.carrier as any)?.displayName || q.carrier?.name || (q.carrier as any)?.id || '';
                  const canon = normLoose(cname);
                  if (!canon) return;
                  const toks = canon.split(' ').filter(Boolean);
                  const overlap = toks.filter(t => aTokens.has(t));
                  if (canon === activeCanon || overlap.length >= Math.max(1, Math.ceil(Math.min(toks.length, aTokens.size) * 0.5))) {
                    loose.push(q);
                  }
                });
                if (loose.length) {
                  console.debug('[hospital details] applied ultraRelaxed alias fallback', { request: activeCarrierId, looseCount: loose.length });
                  related = loose;
                }
              } catch (e) {
                console.warn('[hospital details] ultraRelaxed fallback failed', e);
              }
            }
            return (
              <HospitalIndemnityDetailsShowcase
                carrierName={activeCarrierId}
                quotes={related}
                onClose={closePlanDetails}
              />
            );
          })()}
        </div>
      )}
      {viewVisibility.planDetails && activeCarrierId && activeCategory === 'final-expense' && (
        <div className="space-y-8">
          <FinalExpenseDetailsShowcase
            carrierName={activeCarrierId}
            quotes={( () => {
              // Multi-pass matching similar to dental fuzzy logic, adapted for Final Expense.
              const norm = (s:string) => {
                const base = (s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
                return canonicalizeBrand(base);
              };
              const tokenClean = (s:string) => (s||'')
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g,' ')
                .split(/\s+/)
                .filter(Boolean)
                .filter(w => !STOP.has(w));
              const STOP = new Set(['inc','insurance','company','companies','life','health','corp','corporation','solutions','group','holding','holdings','assurance','plan','plans','the']);

              // Pass 1: strict via carrierMatches helper (preferred path if canonical names align)
              let related = finalExpenseNormalized.filter(q => carrierMatches(activeCarrierId, q.carrier));

              // Additional strict Pass 1b: If the card's activeCarrierId corresponds exactly to an underlying carrier.id value
              // (common when displayName differs via carrier-system), try direct id equality before fuzzy fallbacks.
              if (!related.length) {
                related = finalExpenseNormalized.filter(q => {
                  const id = q.carrier?.id; if(!id) return false; return id.toLowerCase() === activeCarrierId.toLowerCase();
                });
              }

              // Pass 2: simple substring fuzzy on multiple candidate name fields
              if (!related.length) {
                const target = norm(activeCarrierId);
                related = finalExpenseNormalized.filter(q => {
                  const variants = [q.carrier?.id, q.carrier?.name, (q as any).carrier?.displayName]
                    .filter(Boolean)
                    .map(v => norm(String(v)));
                  return variants.some(v => v && (v.includes(target) || target.includes(v)));
                });
              }

              // Pass 3: token overlap (>=50% of smaller token list overlap) ignoring stop words
              if (!related.length) {
                const targetTokens = tokenClean(activeCarrierId);
                const targetSet = new Set(targetTokens);
                const targetLen = targetTokens.length || 1;
                related = finalExpenseNormalized.filter(q => {
                  const names = [q.carrier?.name, q.carrier?.id, (q as any).carrier?.displayName].filter(Boolean) as string[];
                  return names.some(n => {
                    const toks = tokenClean(n);
                    if (!toks.length) return false;
                    const overlap = toks.filter(t => targetSet.has(t));
                    const smaller = Math.min(toks.length, targetLen);
                    return overlap.length >= Math.max(1, Math.ceil(smaller * 0.5));
                  });
                });
              }

              // Pass 4: canonical normalization reuse (normalizeCarrierName) if available
              if (!related.length && typeof normalizeCarrierName === 'function') {
                const targetCanon = norm(normalizeCarrierName(activeCarrierId));
                related = finalExpenseNormalized.filter(q => {
                  const cands = [q.carrier?.name, q.carrier?.id, (q as any).carrier?.displayName]
                    .filter(Boolean)
                    .map(v => norm(normalizeCarrierName(String(v))));
                  return cands.includes(targetCanon);
                });
              }

              // Pass 5: Levenshtein distance fallback (cheap) on normalized strings
              if (!related.length && finalExpenseNormalized.length) {
                const a = norm(activeCarrierId);
                function dist(x:string,y:string){
                  const m=x.length,n=y.length; const dp=Array.from({length:m+1},()=>new Array<number>(n+1));
                  for(let i=0;i<=m;i++) dp[i][0]=i; for(let j=0;j<=n;j++) dp[0][j]=j;
                  for(let i=1;i<=m;i++){
                    for(let j=1;j<=n;j++){
                      const cost = x[i-1]===y[j-1]?0:1;
                      dp[i][j]=Math.min(dp[i-1][j]+1,dp[i][j-1]+1,dp[i-1][j-1]+cost);
                    }
                  }
                  return dp[m][n];
                }
                let best: any[] = []; let bestScore = Infinity;
                finalExpenseNormalized.forEach(q => {
                  const cands = [q.carrier?.name, q.carrier?.id, (q as any).carrier?.displayName].filter(Boolean) as string[];
                  cands.forEach(c => {
                    const d = dist(a, norm(c));
                    if (d < bestScore) { bestScore = d; best = [q]; }
                    else if (d === bestScore) { best.push(q); }
                  });
                });
                if (bestScore <= Math.max(3, Math.floor(a.length * 0.3))) {
                  related = Array.from(new Set(best));
                }
              }

              if (!related.length && process.env.NODE_ENV !== 'production') {
                try {
                  const sample = finalExpenseNormalized.slice(0,10).map(q => q.carrier?.name || q.carrier?.id);
                  // eslint-disable-next-line no-console
                  console.debug('[final-expense details] no matches; sample carriers', { request: activeCarrierId, sample });
                } catch {}
              } else if (process.env.NODE_ENV !== 'production') {
                try {
                  // eslint-disable-next-line no-console
                  console.debug('[final-expense details] carrier lookup', { request: activeCarrierId, matched: related.length, firstMatch: related[0]?.carrier?.name });
                } catch {}
              }

              // Enrich each variant with aggregated face amount range after final matching
              let faceMin: number|undefined; let faceMax: number|undefined;
              related.forEach(r=> { const fv = r.metadata?.faceAmount ?? r.metadata?.faceValue; if(typeof fv==='number'){ if(faceMin==null||fv<faceMin) faceMin=fv; if(faceMax==null||fv>faceMax) faceMax=fv; } });
              return related.map(r => ({
                ...r,
                metadata: {
                  ...r.metadata,
                  faceAmountMin: r.metadata?.faceAmountMin ?? faceMin,
                  faceAmountMax: r.metadata?.faceAmountMax ?? faceMax,
                }
              }));
            })()}
            onClose={closePlanDetails}
          />
        </div>
      )}
        </div>
        </div>
    </div>
  );
}


