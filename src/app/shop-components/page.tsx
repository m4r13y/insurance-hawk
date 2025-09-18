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
import { planBadges } from '@/components/new-shop-components/constants/planBadges';
import SidebarShowcase from '@/components/new-shop-components/sidebar/SidebarShowcase';
import PlanDetailsShowcase from '@/components/new-shop-components/plan-details/PlanDetailsShowcase';
// Removed Tabs import after refactor to checkbox toggles inside Sandbox Controls
import Image from 'next/image';
import { getMedigapQuotes } from '@/lib/actions/medigap-quotes';
import { filterPreferredCarriers } from '@/lib/carrier-system';
import { runCarrierStream } from '@/lib/streaming/medigapStreaming';

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

export default function CardsSandboxPage() {
  // Real Medigap data (first carrier group) -------------------------------------------------
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [carrierSummaries, setCarrierSummaries] = useState<any[]>([]);
  const [reloadIndex, setReloadIndex] = useState(0);

  // Performance / instrumentation
  const [fetchStartTs, setFetchStartTs] = useState<number | null>(null);
  const [fetchEndTs, setFetchEndTs] = useState<number | null>(null);
  const [firstCarrierReadyTs, setFirstCarrierReadyTs] = useState<number | null>(null);
  const [streamingActive, setStreamingActive] = useState(false);
  const [streamedCarriers, setStreamedCarriers] = useState<any[]>([]);
  const streamingEnabled = process.env.NEXT_PUBLIC_ENABLE_MEDIGAP_STREAMING === '1';
  const [firstPlanVisibleMs, setFirstPlanVisibleMs] = useState<number | null>(null);
  const [allPlansCompleteMs, setAllPlansCompleteMs] = useState<number | null>(null);

  // Basic demo params (mirrors typical default form selection)
  const demoParams = { zipCode: '76116', age: '65', gender: 'M' as const, tobacco: '0' as const, plans: ['F','G','N'] };

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoadingQuotes(true); setQuoteError(null);
      setFetchStartTs(performance.now());
      setFetchEndTs(null); setFirstCarrierReadyTs(null);
      try {
        const res = await getMedigapQuotes(demoParams);
        if (!mounted) return;
        if (res.error) {
          setQuoteError(res.error);
        } else {
          setQuotes(res.quotes || []);
          setFetchEndTs(performance.now());
        }
      } catch (e:any) {
        if (!mounted) return; setQuoteError(e.message || 'Failed to load quotes');
      } finally { if (mounted) setLoadingQuotes(false); }
    }
    load();
    return () => { mounted = false; };
  }, [reloadIndex]);

  // Group quotes by carrier name (preferred carriers only if available)
  const firstCarrierGroup = useMemo(() => {
    if (!quotes || quotes.length === 0) return null;
    const category = 'medicare-supplement' as const;
    const preferred = filterPreferredCarriers(quotes, category);
    const sourceQuotes = preferred.length ? preferred : quotes;
    const map: Record<string, any[]> = {};
    for (const q of sourceQuotes) {
      const name = q.carrier?.name || q.company || 'Unknown';
      if (!map[name]) map[name] = []; map[name].push(q);
    }
    const entries = Object.entries(map);
    const summaries = entries.map(([name, cQuotes], idx) => {
      const logo = cQuotes[0]?.carrier?.logo_url || `/carrier-logos/${(idx % 9)+1}.png`;
      // Representative lowest prices per plan (legacy quick access)
      const planPrices: Record<string, number | undefined> = { F: undefined, G: undefined, N: undefined };
      // Detailed per-plan range stats
      const planRanges: Record<string, { min: number; max: number; count: number } | undefined> = { F: undefined, G: undefined, N: undefined };
      cQuotes.forEach(q => {
        const planLetter = (q.plan || q.plan_name || '').slice(-1).toUpperCase();
        if (!['F','G','N'].includes(planLetter)) return;
        const prem = q.monthly_premium;
        if (typeof prem !== 'number') return;
        // Lowest representative price
        if (planPrices[planLetter] == null || prem < (planPrices[planLetter] as number)) planPrices[planLetter] = prem;
        // Range aggregation
        const existing = planRanges[planLetter];
        if (!existing) {
          planRanges[planLetter] = { min: prem, max: prem, count: 1 };
        } else {
          if (prem < existing.min) existing.min = prem;
          if (prem > existing.max) existing.max = prem;
          existing.count += 1;
        }
      });
      const premiums = cQuotes.map(cq => cq.monthly_premium).filter((n: any) => typeof n === 'number');
      const min = premiums.length ? Math.min(...premiums) : undefined;
      const max = premiums.length ? Math.max(...premiums) : undefined;
      return { id: name, name, logo, rating: 'A', min, max, plans: planPrices, planRanges };
    });
    setCarrierSummaries(summaries);
    if (!firstCarrierReadyTs && summaries.length > 0) {
      const ts = performance.now();
      setFirstCarrierReadyTs(ts);
      if (!firstPlanVisibleMs && fetchStartTs) setFirstPlanVisibleMs(ts - fetchStartTs);
    }
    const [carrierName, carrierQuotes] = entries[0];
    return { carrierName, carrierQuotes };
  }, [quotes]);

  const carriers = carrierSummaries;

  // Global selected plan letter for dark inverse experiment (could be per-carrier later)
  const [selectedPlan, setSelectedPlan] = useState<'F'|'G'|'N'>('G');
  // Variant visibility toggles (developer aids)
  const [variantVisibility, setVariantVisibility] = useState({
    minimal: true,
    lightInverse: true,
    density: true,
    comparison: true,
  });

  const toggleVariant = useCallback((key: keyof typeof variantVisibility) => {
    setVariantVisibility(v => ({ ...v, [key]: !v[key] }));
  }, []);

  const handleRefetch = () => setReloadIndex(i => i + 1);

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

  const effectiveCarriers = streamingEnabled && streamedCarriers.length
    ? streamedCarriers
    : carrierSummaries;

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
  const [activeCategory, setActiveCategory] = useState('medigap');
  const [viewVisibility, setViewVisibility] = useState({
    cards: true,
    planDetails: false,
  });
  const toggleView = (key: keyof typeof viewVisibility) => {
    setViewVisibility(v => ({ ...v, [key]: !v[key] }));
  };

  const loadingActive = loadingQuotes && !carrierSummaries.length;
  const [sidebarPanelOpen, setSidebarPanelOpen] = useState(false);
  const [closeSignal, setCloseSignal] = useState(0);

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
          <SidebarShowcase onPanelStateChange={setSidebarPanelOpen} externalCloseSignal={closeSignal} />
        </aside>
        <div className={`space-y-12 ${sidebarPanelOpen ? 'lg:blur-sm lg:pointer-events-none' : ''}`} aria-busy={loadingActive} aria-describedby="carrier-loading-status">
        <span id="carrier-loading-status" role="status" aria-live="polite" className="sr-only">
          {loadingActive ? 'Loading Medigap carriers…' : carrierSummaries.length ? `${carrierSummaries.length} Medigap carriers loaded.` : 'No carriers.'}
        </span>
        {viewVisibility.cards && (
        <div className="space-y-8">
          {/* Developer Controls */}
          <Card className="bg-white/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Sandbox Controls</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-4">
              <div className="flex flex-wrap gap-3">
                {(['minimal','lightInverse','density','comparison'] as const).map(k => (
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
                        onClick={() => setActiveCategory(cat)}
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
                  {loadingQuotes ? 'Refreshing…' : 'Refetch Quotes'}
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

          {variantVisibility.minimal && (
            <>
              <MinimalRateChips carriers={effectiveCarriers} loading={loadingQuotes && !effectiveCarriers.length} />
              <Separator />
            </>
          )}
          {variantVisibility.lightInverse && (
            <>
              <LightInverseCards
                carriers={effectiveCarriers}
                loading={loadingQuotes && !effectiveCarriers.length}
                planBadges={planBadges as any}
                availablePlans={availablePlans}
                selectedPlan={selectedPlan}
                onSelectPlan={setSelectedPlan}
              />
              <Separator />
            </>
          )}
          {variantVisibility.density && (
            <>
              <DensityStressGrid carriers={effectiveCarriers} loading={loadingQuotes && !effectiveCarriers.length} />
              <Separator />
            </>
          )}
          {variantVisibility.comparison && (
            <>
              <ComparisonRowCards carriers={effectiveCarriers} loading={loadingQuotes && !effectiveCarriers.length} planBadges={planBadges} />
              <Separator />
            </>
          )}
        </div>
      )}
      {viewVisibility.planDetails && (
        <div className="space-y-8">
          <PlanDetailsShowcase />
        </div>
      )}

      {/* 8. Next Steps */}
      <section className="space-y-4 pt-4">
        <h2 className="text-xl font-semibold">Next Steps & Notes</h2>
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
    </div>
  );
}
