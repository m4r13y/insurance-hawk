"use client";
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookmarkIcon, BookmarkFilledIcon } from '@radix-ui/react-icons';
import { FaFilter, FaPuzzlePiece, FaBalanceScale, FaBookmark, FaChevronRight } from 'react-icons/fa';
import { SavedPlanRecord } from '@/lib/savedPlans';
import { SavedPlanChips } from '@/components/medicare-shop/quote-cards/SavedPlanChips';
import Image from 'next/image';
import { useSavedPlans } from '@/contexts/SavedPlansContext';
import { MinimalRateChips, CarrierSummaryMinimal } from '@/components/new-shop-components/quote-cards/MinimalRateChips';
// Removed dialog, form, and select imports related to Quotes functionality
import { loadFromLocalCache as loadPBCache, clearLocalCache as clearPBLocalCache } from '@/components/new-shop-components/plan-details/planBuilderPersistence';
import { deletePlanBuilderData } from '@/lib/services/temporary-storage';

interface NavItem {
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  active?: boolean;
  disabled?: boolean;
}

// Base nav items; Preferred & Discounts now inline toggles (not standalone panels)
const baseNav: NavItem[] = [
  { label: 'Filters', active: true, icon: <FaFilter className="w-3.5 h-3.5" /> },
  { label: 'Plan Builder', icon: <FaPuzzlePiece className="w-3.5 h-3.5" /> },
  { label: 'Compare', icon: <FaBalanceScale className="w-3.5 h-3.5" /> },
  { label: 'Saved', icon: <FaBookmark className="w-3.5 h-3.5" /> },
];

const filters: NavItem[] = [
  { label: 'All Carriers', active: true },
  { label: 'Preferred' },
  { label: 'Low Premium' },
  { label: 'High Coverage' },
];

// Icon box updated: specific icons per nav; Saved uses filled/outline bookmark
const IconBox: React.FC<{active?: boolean; label?: string; icon?: React.ReactNode; count?: number}> = ({active, label, icon}) => {
  const base = `w-6 h-6 rounded-md border flex items-center justify-center text-[11px] font-medium shrink-0 ${active ? 'bg-blue-primary text-white border-blue-400' : 'bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-600'}`;
  if (label === 'Saved') {
    const Dynamic = active ? BookmarkFilledIcon : BookmarkIcon;
    return <div className={base} aria-hidden="true"><Dynamic className="w-4 h-4" /></div>;
  }
  return <div className={base} aria-hidden="true">{icon ?? (label ? label[0] : '•')}</div>;
};

// Quote functionality removed

interface SidebarShowcaseProps {
  onPanelStateChange?: (open: boolean) => void;
  externalCloseSignal?: number; // increment to force close from parent
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
  preferredOnly?: boolean;
  onTogglePreferred?: (value: boolean) => void;
  applyDiscounts?: boolean;
  onToggleApplyDiscounts?: (value: boolean) => void;
  // Quote generation props removed
}

// Quote categories removed

// Simulated plan builder session state (could later be lifted via props or context)
// For now just track a boolean for each product type.
interface PlanBuilderState { original?: boolean; advantage?: boolean; }

export const SidebarShowcase: React.FC<SidebarShowcaseProps> = ({
  onPanelStateChange,
  externalCloseSignal,
  activeCategory,
  onSelectCategory,
  preferredOnly = false,
  onTogglePreferred,
  applyDiscounts = false,
  onToggleApplyDiscounts,
  // Removed quote props
}) => {
  // State: active detail tab, active nav item
  const [activeTab, setActiveTab] = React.useState<string | null>(null);
  const [planBuilderState, setPlanBuilderState] = React.useState<PlanBuilderState>({});
  // Synced Original Medicare builder snapshot (lightweight summary)
  const [originalBuilderSnapshot, setOriginalBuilderSnapshot] = React.useState<any | null>(null);
  const [originalBuilderLoading, setOriginalBuilderLoading] = React.useState(false);
  const [originalBuilderError, setOriginalBuilderError] = React.useState<string | null>(null);

  // Hydrate sidebar snapshot from local cache quickly
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const cached = loadPBCache?.();
      if (cached) {
        setOriginalBuilderSnapshot(cached);
        setPlanBuilderState(s => ({ ...s, original: true }));
      }
    } catch (e) {
      // silent
    }
  }, []);

  const refreshOriginalBuilderSnapshot = React.useCallback(() => {
    setOriginalBuilderLoading(true);
    setOriginalBuilderError(null);
    try {
      const cached = loadPBCache?.();
      if (cached) {
        setOriginalBuilderSnapshot(cached);
        setPlanBuilderState(s => ({ ...s, original: true }));
      } else {
        setOriginalBuilderSnapshot(null);
      }
    } catch (e:any) {
      setOriginalBuilderError(e?.message || 'Failed to load builder cache');
    } finally {
      setOriginalBuilderLoading(false);
    }
  }, []);

  // Listen for cross-tab localStorage updates and custom events to auto-refresh snapshot
  React.useEffect(() => {
    const STORAGE_KEY = 'plan_builder_cache_v1';
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        refreshOriginalBuilderSnapshot();
      }
    };
    const handleCustomUpdate = () => refreshOriginalBuilderSnapshot();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('planBuilder:updated', handleCustomUpdate as EventListener);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('planBuilder:updated', handleCustomUpdate as EventListener);
    };
  }, [refreshOriginalBuilderSnapshot]);

  const handleOriginalReset = React.useCallback(async () => {
    try { clearPBLocalCache?.(); } catch {}
    try { await deletePlanBuilderData(); } catch (e) { console.warn('Sidebar remote delete failed:', e); }
    setOriginalBuilderSnapshot(null);
    setPlanBuilderState(s => ({ ...s, original: false }));
  }, []);

  // Helper to focus Plan Builder main section
  const goToPlanBuilder = React.useCallback(() => {
    setActiveNav('Plan Builder');
    setActiveTab(null); // ensure nav panel state resets
    // Optionally dispatch a custom event other components could listen for to open builder focus
    try { window.dispatchEvent(new CustomEvent('planBuilder:focus')); } catch {}
  }, []);
  // Deterministic initial value to avoid SSR/client mismatch. LocalStorage hydration deferred to effect.
  const [activeNav, setActiveNav] = React.useState<string>('Filters');
  // Quote view mode removed

  // resetAllQuotes defined later after concurrent loading helpers; placeholder will be overwritten
  // Quote reset ref removed

  // Carrier search (previously an inline IIFE with hooks inside Filters panel causing hook order issues)
  const [carrierSearch, setCarrierSearch] = React.useState<string>(() => {
    if (typeof window === 'undefined') return '';
    try { return localStorage.getItem('carrier_search_query') || ''; } catch { return ''; }
  });
  React.useEffect(() => {
    try { localStorage.setItem('carrier_search_query', carrierSearch); } catch {}
    try { window.dispatchEvent(new CustomEvent('carrierSearch:changed', { detail: { query: carrierSearch } })); } catch {}
  }, [carrierSearch]);
  React.useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('shopSidebar.activeNav') : null;
      if (stored && stored !== activeNav) {
        setActiveNav(stored === 'Overview' ? 'Filters' : stored);
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Removed generatedCats (quote categories) state

  // Primary nav no longer injects Preferred/Discounts as panels
  const primaryNavSeed = baseNav;
  const tabPanelId = React.useId();
  const closeButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const lastFocusedTriggerRef = React.useRef<HTMLButtonElement | null>(null);
  // Track whether the user has already focused an element inside the slide-out panel
  // so we don't keep stealing focus back to the close button (causing apparent input blur).
  const userFocusedInsideRef = React.useRef(false);
  const { savedPlans } = useSavedPlans();
  // FE Cards style toggle state (persisted globally via localStorage + custom event)
  const [feCardsMode, setFeCardsMode] = React.useState<'legacy'|'new'>(() => {
    if (typeof window === 'undefined') return 'legacy';
    try { return (localStorage.getItem('feCardsMode') as 'legacy'|'new') || 'legacy'; } catch { return 'legacy'; }
  });
  const toggleFeCardsMode = React.useCallback(() => {
    setFeCardsMode(m => (m === 'legacy' ? 'new' : 'legacy'));
  }, []);
  // Cancer cards style toggle mirrors FE pattern
  const [cancerCardsMode, setCancerCardsMode] = React.useState<'legacy'|'new'>(() => {
    if (typeof window === 'undefined') return 'legacy';
    try { return (localStorage.getItem('cancerCardsMode') as 'legacy'|'new') || 'legacy'; } catch { return 'legacy'; }
  });
  const toggleCancerCardsMode = React.useCallback(() => {
    setCancerCardsMode(m => (m === 'legacy' ? 'new' : 'legacy'));
  }, []);
  // Persist & broadcast AFTER render commit to avoid setState during another component's render
  React.useEffect(() => {
    try {
      localStorage.setItem('feCardsMode', feCardsMode);
      // Defer dispatch to microtask to ensure all state commits settle
      Promise.resolve().then(() => {
        try { window.dispatchEvent(new CustomEvent('feCardsMode:change', { detail: { mode: feCardsMode } })); } catch {}
      });
    } catch {}
  }, [feCardsMode]);
  React.useEffect(() => {
    try {
      localStorage.setItem('cancerCardsMode', cancerCardsMode);
      Promise.resolve().then(() => {
        try { window.dispatchEvent(new CustomEvent('cancerCardsMode:change', { detail: { mode: cancerCardsMode } })); } catch {}
      });
    } catch {}
  }, [cancerCardsMode]);
  // Selected quote categories removed

  // Persist active nav
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('shopSidebar.activeNav', activeNav);
    }
  }, [activeNav]);

  // Close on ESC
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeTab) {
        setActiveTab(null);
        // Restore focus to last trigger
        queueMicrotask(() => lastFocusedTriggerRef.current?.focus());
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeTab]);

  // Body scroll lock when panel open
  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    const original = document.body.style.overflow;
    if (activeTab) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = original;
    }
    return () => { document.body.style.overflow = original; };
  }, [activeTab]);

  // When panel opens, move focus to first focusable (close button)
  React.useEffect(() => {
    if (activeTab && closeButtonRef.current && !userFocusedInsideRef.current) {
      closeButtonRef.current.focus();
    }
    if (!activeTab) {
      // Reset when panel fully closes so next open will autofocus again
      userFocusedInsideRef.current = false;
    }
  }, [activeTab]);

  // Global focusin listener to detect first user interaction inside the panel
  React.useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      if (panelRef.current && e.target instanceof Element && panelRef.current.contains(e.target)) {
        userFocusedInsideRef.current = true;
      }
    };
    window.addEventListener('focusin', handleFocusIn as any, true);
    return () => window.removeEventListener('focusin', handleFocusIn as any, true);
  }, []);

  // Quotes panel and related UI removed

  const tabs = [
    {
      id: 'nav',
      label: 'Navigation',
      content: (
        activeNav === 'Plan Builder' ? (
          <div className="space-y-6">
            <div className="space-y-4">
              {/* Original Medicare Section */}
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-800/40 p-3 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Original Medicare</span>
                  {planBuilderState.original && originalBuilderSnapshot && (
                    <Badge className="bg-blue-primary/20 text-blue-primary dark:text-blue-200">In Progress</Badge>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">Build a supplement-focused configuration starting from Parts A & B baseline coverage.</p>
                {originalBuilderSnapshot ? (
                  <div className="space-y-3 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Monthly Total</span>
                      <span className="text-slate-900 dark:text-white font-semibold">${(originalBuilderSnapshot.totalMonthlyCost || 0).toFixed(2)}</span>
                    </div>
                    {/* Component chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {(() => {
                        const chips: { key:string; label:string; value?: number; tone: string }[] = [];
                        const m = originalBuilderSnapshot?.medigapPlan;
                        if (m) chips.push({ key:'medigap', label:`Medigap ${m.plan||m.planType||''}`.trim(), value:m.monthlyRate, tone:'bg-blue-600/90 text-white dark:bg-blue-500/80' });
                        const d = originalBuilderSnapshot?.selectedPlans?.drugPlan;
                        if (d) chips.push({ key:'drug', label:'Part D', value:(d.month_rate||d.part_d_rate||0)/100, tone:'bg-emerald-600/90 text-white dark:bg-emerald-500/80' });
                        const dvh = originalBuilderSnapshot?.selectedPlans?.dentalPlan;
                        if (dvh) chips.push({ key:'dvh', label:'DVH', value:dvh.monthlyPremium, tone:'bg-amber-600/90 text-white dark:bg-amber-500/80' });
                        const c = originalBuilderSnapshot?.selectedPlans?.cancerPlan;
                        if (c) chips.push({ key:'cancer', label:'Cancer', value:c.monthly_premium || c.monthlyPremium, tone:'bg-fuchsia-600/90 text-white dark:bg-fuchsia-500/80' });
                        if (!chips.length) return <span className="text-[10px] text-slate-500 dark:text-slate-400">No components selected yet.</span>;
                        return chips.map(ch => (
                          <span
                            key={ch.key}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium shadow-sm border border-white/10 ${ch.tone}`}
                          >
                            <span>{ch.label}</span>
                            {typeof ch.value === 'number' && ch.value > 0 && (
                              <span className="opacity-90">${ch.value.toFixed(2)}</span>
                            )}
                          </span>
                        ));
                      })()}
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {['medigapPlan','selectedPlans.drugPlan','selectedPlans.dentalPlan','selectedPlans.cancerPlan'].map(key => {
                        const parts = key.split('.');
                        let obj:any = originalBuilderSnapshot;
                        for (const p of parts) obj = obj?.[p];
                        if (!obj) return null;
                        const labelMap:Record<string,string> = { medigapPlan: 'Medigap', drugPlan: 'Part D', dentalPlan: 'DVH', cancerPlan: 'Cancer' };
                        const label = labelMap[parts.at(-1)!] || key;
                        const rate = obj.monthlyRate || ((obj.rate?.month||0)/100) || obj.monthlyPremium || obj.month_rate || obj.part_d_rate || obj.monthly_premium || 0;
                        const rateDisplay = typeof rate === 'number' ? (rate > 50 ? `$${(rate/100).toFixed(2)}` : `$${rate.toFixed(2)}`) : '—';
                        return (
                          <div key={key} className="flex items-center justify-between rounded-md bg-white/60 dark:bg-slate-700/40 px-2 py-1 border border-slate-200 dark:border-slate-600/50">
                            <span className="text-slate-600 dark:text-slate-300">{label}</span>
                            <span className="font-medium text-slate-800 dark:text-slate-100 text-[10px]">{rateDisplay}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]" onClick={goToPlanBuilder}>Open</Button>
                        <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]" onClick={refreshOriginalBuilderSnapshot} disabled={originalBuilderLoading}>{originalBuilderLoading ? '...' : 'Refresh'}</Button>
                      </div>
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-red-600 hover:text-red-700 dark:text-red-400" onClick={handleOriginalReset}>Reset</Button>
                    </div>
                    {originalBuilderError && <p className="text-[10px] text-red-600">{originalBuilderError}</p>}
                    <p className="text-[10px] text-slate-500 dark:text-slate-500">Updated {(originalBuilderSnapshot.lastUpdated?.seconds ? new Date(originalBuilderSnapshot.lastUpdated.seconds*1000).toLocaleTimeString() : 'now')}</p>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    {planBuilderState.original ? (
                      <>
                        <Button size="sm" className="h-7 px-3 text-xs btn-brand" onClick={goToPlanBuilder}>Edit</Button>
                        <Button size="sm" variant="outline" className="h-7 px-3 text-xs" onClick={() => setPlanBuilderState(s => ({...s, original: true}))}>Start New</Button>
                      </>
                    ) : (
                      <Button size="sm" className="h-7 px-3 text-xs btn-brand" onClick={() => setPlanBuilderState(s => ({...s, original: true}))}>Start New</Button>
                    )}
                  </div>
                )}
              </div>
              {/* Medicare Advantage Section */}
              <div className="rounded-lg border border-slate-200 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-800/40 p-3 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Medicare Advantage</span>
                  {planBuilderState.advantage && (
                    <Badge className="bg-blue-primary/20 text-blue-primary dark:text-blue-200">In Progress</Badge>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">Explore bundled medical + drug + extra benefits plan builder walkthrough.</p>
                <div className="flex gap-2">
                  {planBuilderState.advantage ? (
                    <>
                      <Button size="sm" className="h-7 px-3 text-xs btn-brand" onClick={goToPlanBuilder}>Edit</Button>
                      <Button size="sm" variant="outline" className="h-7 px-3 text-xs" onClick={() => setPlanBuilderState(s => ({...s, advantage: true}))}>Start New</Button>
                    </>
                  ) : (
                    <Button size="sm" className="h-7 px-3 text-xs btn-brand" onClick={() => setPlanBuilderState(s => ({...s, advantage: true}))}>Start New</Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : activeNav === 'Filters' ? (
          <div className="space-y-5">
            <div className="rounded-lg bg-slate-100/80 dark:bg-slate-800/60 p-3 border border-slate-200 dark:border-slate-700/60 space-y-3">
              {/* Carrier Search */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Search Carriers</span>
                  {carrierSearch && (
                    <button
                      type="button"
                      onClick={() => setCarrierSearch('')}
                      className="text-[10px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      Clear
                    </button>
                  )}
                </label>
                <input
                  type="text"
                  value={carrierSearch}
                  onChange={e => setCarrierSearch(e.target.value)}
                  placeholder="Type a carrier name..."
                  className="w-full h-7 px-2 rounded-md border text-[11px] bg-white/80 dark:bg-slate-700/60 border-slate-300 dark:border-slate-600 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                />
              </div>
            </div>
            <div className="rounded-lg bg-slate-100/80 dark:bg-slate-800/60 p-3 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between gap-3 text-xs font-medium text-slate-700 dark:text-slate-200">
                <span>Preferred Carriers Only</span>
                <button
                  type="button"
                  onClick={() => onTogglePreferred?.(!preferredOnly)}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer items-center rounded-full border transition-colors ${preferredOnly ? 'bg-blue-primary border-blue-400' : 'bg-slate-300/60 dark:bg-slate-600/60 border-slate-400/40 dark:border-slate-500/50'}`}
                  aria-pressed={preferredOnly}
                  aria-label="Toggle preferred carriers"
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition ${preferredOnly ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <Separator className="my-1" />
              <div className="flex items-center justify-between gap-3 text-xs font-medium text-slate-700 dark:text-slate-200">
                <span>Apply Discounts</span>
                <button
                  type="button"
                  onClick={() => onToggleApplyDiscounts?.(!applyDiscounts)}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer items-center rounded-full border transition-colors ${applyDiscounts ? 'bg-green-600 border-green-500' : 'bg-slate-300/60 dark:bg-slate-600/60 border-slate-400/40 dark:border-slate-500/50'}`}
                  aria-pressed={applyDiscounts}
                  aria-label="Toggle apply discounts"
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition ${applyDiscounts ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </div>
        ) : activeNav === 'Saved' ? (
          <div className="space-y-4">
            {savedPlans.length === 0 && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">No saved plans yet. Use the bookmark icon on any plan card to save it here.</p>
            )}
            {savedPlans.length > 0 && (
              <div className="-m-1">
                {/* Reuse shared chip component */}
                <SavedPlanChips
                  onOpen={(category, carrierName) => {
                    try { window.dispatchEvent(new CustomEvent('savedCarrier:focus', { detail: { category, carrierName } })); } catch {}
                    onSelectCategory?.(category);
                  }}
                  className="px-1"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {primaryNavSeed.map(item => {
              const isActive = activeNav === item.label;
              return (
              <button
                key={item.label}
                onClick={() => setActiveNav(item.label)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60
                  ${isActive ? 'bg-blue-primary text-white shadow-sm ring-1 ring-blue-300/40' : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200'}`}
              >
                <IconBox active={isActive} label={item.label} icon={item.icon} />
                <span className="flex-1 text-left">{item.label}</span>
                {/* Chevron indicator: shown when panel not active for this item */}
                {!isActive && (
                  <FaChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-300 transition" aria-hidden="true" />
                )}
              </button>
            )})}
          </div>
        )
      )
    }
  ];

  // Open a tab without closing if clicking the same (persist panel until explicit dismiss)
  const openTab = (id: string, trigger?: HTMLButtonElement | null) => {
    if (trigger) lastFocusedTriggerRef.current = trigger;
    setActiveTab(cur => cur === id ? cur : id);
  };

  // Notify parent when open state changes
  React.useEffect(() => {
    onPanelStateChange?.(!!activeTab);
  }, [activeTab, onPanelStateChange]);

  // Listen for external close signals
  React.useEffect(() => {
    if (externalCloseSignal != null) {
      setActiveTab(null);
    }
  }, [externalCloseSignal]);


  return (
  <div className="flex gap-4 mt-2 lg:mt-2 relative z-[120]">
      {/* Backdrop Overlay */}
      {activeTab && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] transition-opacity animate-in fade-in"
          role="presentation"
          aria-hidden="true"
          onClick={() => { setActiveTab(null); queueMicrotask(() => lastFocusedTriggerRef.current?.focus()); }}
        />
      )}
    {/* Compact Rail */}
  <div className="flex flex-col rounded-xl border bg-white/70 dark:bg-slate-800/60 backdrop-blur p-3 gap-2 shadow-sm relative z-50" style={{ minWidth: '-webkit-fill-available' }}>
  <h3 className="text-xs font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400 px-1.5">Explorer</h3>
        {primaryNavSeed.map((item, index) => {
          const logicalActive = activeNav === item.label;
          const panelOpen = activeTab === 'nav';
          const isActive = logicalActive && panelOpen; // visual active only when panel open
          const savedCount = item.label === 'Saved' ? savedPlans.length : 0;
          return (
            <div key={item.label} className="relative group">
              <button
                ref={el => { if (logicalActive) lastFocusedTriggerRef.current = el; }}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60
                  ${isActive ? 'bg-blue-primary text-white shadow-sm' : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200'}`}
                onClick={(e) => {
                  setActiveNav(item.label);
                  if (activeTab == null || activeTab !== 'nav') {
                    openTab('nav', e.currentTarget);
                  } else {
                    lastFocusedTriggerRef.current = e.currentTarget;
                  }
                }}
                aria-controls={tabPanelId}
                aria-expanded={activeTab === 'nav'}
                role="tab"
                aria-current={logicalActive ? 'page' : undefined}
              >
                <IconBox active={isActive} label={item.label} icon={item.icon} count={savedCount} />
                <span className="flex-1 truncate flex items-center gap-1">{item.label}{savedCount > 0 && item.label === 'Saved' && <span className="inline-flex items-center justify-center h-5 min-w-[1.25rem] px-1 rounded-full text-[10px] font-semibold border border-amber-300/60 text-amber-600 dark:text-amber-300 dark:border-amber-400/40 bg-amber-50/70 dark:bg-amber-400/10 shadow-sm">{savedCount}</span>}</span>
                {!isActive && (
                  <FaChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-300 transition" aria-hidden="true" />
                )}
              </button>
              {/* Inject FE card style toggle when Filters nav is active and category is final-expense */}
              {item.label === 'Filters' && activeCategory === 'final-expense' && (
                <div className="mt-1 ml-4 flex items-center justify-between gap-2 px-2 py-1.5 rounded-md border bg-slate-50 dark:bg-slate-700/40 border-slate-200 dark:border-slate-600/60">
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">FE Card Style</span>
                  <button
                    type="button"
                    onClick={(e)=>{ e.stopPropagation(); toggleFeCardsMode(); }}
                    className="text-[10px] px-2 py-0.5 rounded-md border bg-white/80 dark:bg-slate-800/60 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600/60 transition"
                    aria-label={feCardsMode === 'new' ? 'Showing New FE Cards. Switch to Original.' : 'Showing Original FE Cards. Switch to New.'}
                    title={feCardsMode === 'new' ? 'New FE Cards (click for Original)' : 'Original FE Cards (click for New)'}
                  >
                    {feCardsMode === 'new' ? 'New' : 'Original'}
                  </button>
                </div>
              )}
              {item.label === 'Filters' && activeCategory === 'cancer' && (
                <div className="mt-1 ml-4 flex items-center justify-between gap-2 px-2 py-1.5 rounded-md border bg-slate-50 dark:bg-slate-700/40 border-slate-200 dark:border-slate-600/60">
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">Cancer Card Style</span>
                  <button
                    type="button"
                    onClick={(e)=>{ e.stopPropagation(); toggleCancerCardsMode(); }}
                    className="text-[10px] px-2 py-0.5 rounded-md border bg-white/80 dark:bg-slate-800/60 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600/60 transition"
                    aria-label={cancerCardsMode === 'new' ? 'Showing New Cancer Cards. Switch to Original.' : 'Showing Original Cancer Cards. Switch to New.'}
                    title={cancerCardsMode === 'new' ? 'New Cancer Cards (click for Original)' : 'Original Cancer Cards (click for New)'}
                  >
                    {cancerCardsMode === 'new' ? 'New' : 'Original'}
                  </button>
                </div>
              )}
              {/* Sidebar sub-tabs (Preferred & Discounts) injected directly after Filters and before Quotes */}
              {item.label === 'Filters' && (
                <div className="mt-1 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2 ml-4 px-2 py-1.5 rounded-md border bg-slate-50 dark:bg-slate-700/40 border-slate-200 dark:border-slate-600/60">
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">Preferred</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onTogglePreferred?.(!preferredOnly); }}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer items-center rounded-full border transition-colors ${preferredOnly ? 'bg-blue-primary border-blue-400' : 'bg-slate-300/60 dark:bg-slate-600/60 border-slate-400/40 dark:border-slate-500/50'}`}
                      aria-pressed={preferredOnly}
                      aria-label="Toggle preferred carriers"
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition ${preferredOnly ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-2 ml-4 px-2 py-1.5 rounded-md border bg-slate-50 dark:bg-slate-700/40 border-slate-200 dark:border-slate-600/60">
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">Discounts</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onToggleApplyDiscounts?.(!applyDiscounts); }}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer items-center rounded-full border transition-colors ${applyDiscounts ? 'bg-green-600 border-green-500' : 'bg-slate-300/60 dark:bg-slate-600/60 border-slate-400/40 dark:border-slate-500/50'}`}
                      aria-pressed={applyDiscounts}
                      aria-label="Toggle apply discounts"
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition ${applyDiscounts ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>
              )}
              {/* Quote category chips removed */}
            </div>
          );
        })}
        {/* New Quote button removed */}


        {/* Collapsible Tab Panel (slides out) */}
        
        {/* Panel now inline flex child instead of absolute overlay (reverted to slide-out) */}
        
        <div
          id={tabPanelId}
          role="tabpanel"
          aria-hidden={activeTab == null}
          className={`absolute top-0 left-full ml-3 w-[25rem] sm:w-[28rem] transform-gpu transition-opacity duration-250 ease-out ${activeTab ? 'opacity-100 translate-x-0' : 'opacity-0 pointer-events-none -translate-x-2'} z-[130]`}
          data-active={!!activeTab}
        >
          <div ref={panelRef} className="rounded-2xl border bg-gradient-to-br from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 shadow-2xl relative overflow-hidden isolate z-[135]">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_85%_18%,hsl(var(--blue-primary)/0.15),transparent_60%)]" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-200">{activeNav}</h3>
                <button
                  ref={closeButtonRef}
                  onClick={() => { setActiveTab(null); queueMicrotask(() => lastFocusedTriggerRef.current?.focus()); }}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
                >
                  <span className="text-sm">×</span>
                  <span className="sr-only">Close panel</span>
                </button>
              </div>
              <div className="space-y-4 text-sm">
                {tabs[0].content}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Removed separate Medigap plan selection modal; selection handled inline in the form */}
    </div>
  );
};

export default SidebarShowcase;
