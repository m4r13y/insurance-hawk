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
import { useRouter, useSearchParams } from 'next/navigation';
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

  const carriers = carrierSummaries;

  // Category + View toggles (replacing upper tabs)
  const [activeCategory, setActiveCategory] = useState(initialCategory || 'medigap');
  const [preferredOnly, setPreferredOnly] = useState(true);

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

  // Apply preferred filter before slicing so page counts stay consistent with user view
  const filteredCarriers = useMemo(() => {
    if (preferredOnly && activeCategory === 'medigap') {
      return effectiveCarriers.filter((c: any) => c.__preferred);
    }
    return effectiveCarriers;
  }, [effectiveCarriers, preferredOnly, activeCategory]);

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

  const handleRefetch = () => setReloadIndex(i => i + 1); // now just re-hydrates from storage

  // Simulated streaming demonstration (sandbox only)
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
          const key = `medicare_${activeCategory.replace(/-/g,'_')}_quotes`;
          const data = await loadFromStorage(key, []);
          if (Array.isArray(data)) loadedQuotes = data;
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
  const [viewVisibility, setViewVisibility] = useState({
    cards: true,
    planDetails: false,
  });
  const [activeCarrierId, setActiveCarrierId] = useState<string | null>(null);
  const toggleView = (key: keyof typeof viewVisibility) => {
    setViewVisibility(v => ({ ...v, [key]: !v[key] }));
  };

  const loadingActive = loadingQuotes && !carrierSummaries.length;
  const [sidebarPanelOpen, setSidebarPanelOpen] = useState(false);
  const [closeSignal, setCloseSignal] = useState(0);
  // (moved preferredOnly earlier for pagination dependency ordering)
  // applyDiscounts state moved earlier; keep setter accessible here (no redeclare)

  // URL navigation for plan details (sandbox experiment)
  const router = useRouter();
  const searchParams = useSearchParams();

  const openPlanDetails = useCallback((carrier: any) => {
    if (!carrier) return;
    setActiveCarrierId(carrier.id);
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('carrier', carrier.id);
    params.set('view', 'plan-details');
    router.replace(`?${params.toString()}`, { scroll: false });
    setViewVisibility({ cards: false, planDetails: true });
  }, [router, searchParams]);

  const closePlanDetails = useCallback(() => {
    setViewVisibility({ cards: true, planDetails: false });
    setActiveCarrierId(null);
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.delete('carrier');
    params.delete('view');
    router.replace(`?${params.toString()}`);
  }, [router, searchParams]);

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
          />
        </aside>
        <div className={`space-y-12 ${sidebarPanelOpen ? 'lg:blur-sm lg:pointer-events-none' : ''}`} aria-busy={loadingActive} aria-describedby="carrier-loading-status">
        <span id="carrier-loading-status" role="status" aria-live="polite" className="sr-only">
          {loadingActive ? 'Loading Medigap carriers…' : carrierSummaries.length ? `${carrierSummaries.length} Medigap carriers loaded.` : 'No carriers.'}
        </span>
        {viewVisibility.cards && (
        <div className="space-y-8">
          {/* Developer Controls moved to bottom */}

          {variantVisibility.minimal && (
            <>
              {(() => {
                // Build carriers from saved medigap plans only
                const medigapSaved = savedPlans.filter(p => p.category === 'medigap');
                const map: Record<string, { id:string; name:string; logo:string; rating:string; min?:number; max?:number; savedPlanTypes:string[] }> = {};
                medigapSaved.forEach(p => {
                  if (!map[p.carrierId]) {
                    map[p.carrierId] = { id: p.carrierId, name: p.carrierName, logo: p.logo, rating: p.rating || 'N/A', min: p.min, max: p.max, savedPlanTypes: p.planType ? [p.planType] : [] };
                  } else {
                    if (p.planType && !map[p.carrierId].savedPlanTypes.includes(p.planType)) map[p.carrierId].savedPlanTypes.push(p.planType);
                    if (typeof p.min === 'number') {
                      if (map[p.carrierId].min === undefined || p.min < (map[p.carrierId].min as number)) map[p.carrierId].min = p.min;
                    }
                    if (typeof p.max === 'number') {
                      if (map[p.carrierId].max === undefined || p.max > (map[p.carrierId].max as number)) map[p.carrierId].max = p.max;
                    }
                  }
                });
                const savedCarrierList = Object.values(map);
                if (!savedCarrierList.length) return <p className="text-xs text-slate-500 dark:text-slate-400">No saved plans yet. Bookmark a plan to see it summarized here.</p>;
                return <MinimalRateChips carriers={savedCarrierList} loading={false} />;
              })()}
              <Separator />
            </>
          )}
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
          {variantVisibility.comparison && (
            <>
              <ComparisonRowCards
                carriers={paginatedCarriers}
                loading={loadingQuotes && !effectiveCarriers.length}
                planBadges={planBadges}
                selectedPlan={selectedPlan as any}
                onSelectPlan={(p:'F'|'G'|'N') => setSelectedPlan(p)}
                onOpenPlanDetails={openPlanDetails as any}
              />
              <Separator />
            </>
          )}
          {(variantVisibility.lightInverse || variantVisibility.comparison) && (
            <PaginationControls />
          )}
        </div>
      )}
      {viewVisibility.planDetails && activeCarrierId && (
        <div className="space-y-8">
          <PlanDetailsShowcase
            carrierId={activeCarrierId}
            quotes={quotes.filter(q => (q.carrier?.name || q.company) === activeCarrierId)}
            plan={selectedPlan}
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
                            router.push(`/shop-components/${cat}` + (searchParams?.toString() ? `?${searchParams.toString()}` : ''));
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
