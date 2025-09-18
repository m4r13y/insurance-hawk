"use client";
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookmarkIcon, BookmarkFilledIcon } from '@radix-ui/react-icons';
import { FaFilter, FaClipboardList, FaPuzzlePiece, FaBalanceScale, FaBookmark, FaChevronRight } from 'react-icons/fa';
import { SavedPlanRecord } from '@/lib/savedPlans';
import Image from 'next/image';
import { useSavedPlans } from '@/contexts/SavedPlansContext';
import { MinimalRateChips, CarrierSummaryMinimal } from '@/components/new-shop-components/quote-cards/MinimalRateChips';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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
  { label: 'Quotes', icon: <FaClipboardList className="w-3.5 h-3.5" /> },
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

interface QuoteFormData {
  age: number | '';
  zipCode: string;
  gender: 'male' | 'female' | '';
  tobaccoUse: boolean | null;
  email?: string;
  firstName?: string;
  effectiveDate?: string;
  familyType?: 'individual' | 'family' | '';
  carcinomaInSitu?: boolean | null;
  premiumMode?: 'monthly' | 'annual' | '';
  coveredMembers?: string;
  desiredFaceValue?: string;
  benefitAmount?: string;
  state?: string;
}

interface SidebarShowcaseProps {
  onPanelStateChange?: (open: boolean) => void;
  externalCloseSignal?: number; // increment to force close from parent
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
  preferredOnly?: boolean;
  onTogglePreferred?: (value: boolean) => void;
  applyDiscounts?: boolean;
  onToggleApplyDiscounts?: (value: boolean) => void;
  // New props for quote generation flow
  onGenerateQuotes?: (category: string, formData: QuoteFormData, plansList?: string[]) => Promise<void> | void;
  loadingCategories?: string[];
  completedQuoteTypes?: string[];
}

const quoteCategories = ['medigap','advantage','cancer','hospital','final-expense','drug-plan','dental'];

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
  onGenerateQuotes,
  loadingCategories = [],
  completedQuoteTypes = []
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
  React.useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('shopSidebar.activeNav') : null;
      if (stored && stored !== activeNav) {
        setActiveNav(stored === 'Overview' ? 'Filters' : stored);
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generated quote categories (for potential category-specific filters or future use)
  const [generatedCats, setGeneratedCats] = React.useState<string[]>([]);
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('medicare_selected_categories');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setGeneratedCats(parsed);
      }
    } catch {}
  }, []);

  // Primary nav no longer injects Preferred/Discounts as panels
  const primaryNavSeed = baseNav;
  const tabPanelId = React.useId();
  const closeButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const lastFocusedTriggerRef = React.useRef<HTMLButtonElement | null>(null);
  const { savedPlans } = useSavedPlans();
  // Selected quote categories (persisted) for inline display under Quotes nav
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('medicare_selected_categories');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setSelectedCategories(parsed);
      }
    } catch {}
  }, []);

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

  // When panel opens, move focus to first focusable (close button)
  React.useEffect(() => {
    if (activeTab && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [activeTab]);

  // Quotes panel subcomponent (defined before tabs to allow reference)
  // Quote generation support state (mirrors MedicareShopLayout logic simplified)
  const [showMissingFieldsModal, setShowMissingFieldsModal] = React.useState(false);
  const [selectedCategoryForQuote, setSelectedCategoryForQuote] = React.useState<string>('');
  const [missingFields, setMissingFields] = React.useState<string[]>([]);
  const [formInputs, setFormInputs] = React.useState<QuoteFormData>({
    age: '',
    zipCode: '',
    gender: '',
    tobaccoUse: null,
    familyType: '',
    carcinomaInSitu: null,
    premiumMode: '',
    coveredMembers: '',
    desiredFaceValue: '',
    benefitAmount: '',
    state: ''
  });
  const [isMedigapSelectionOpen, setIsMedigapSelectionOpen] = React.useState(false);
  const [selectedMedigapPlans, setSelectedMedigapPlans] = React.useState<string[]>([]);

  const getRequiredFields = (category: string): string[] => {
    switch (category) {
      case 'advantage':
      case 'drug-plan':
      case 'dental':
        return ['zipCode'];
      case 'hospital': // mapping hospital-indemnity alias
      case 'hospital-indemnity':
        return ['age','zipCode','gender','tobaccoUse'];
      case 'final-expense':
        return ['zipCode'];
      case 'cancer':
        return ['age','gender','tobaccoUse'];
      case 'medigap':
      default:
        return ['age','zipCode','gender','tobaccoUse'];
    }
  };

  const getAdditionalFields = (category: string): string[] => {
    switch (category) {
      case 'cancer':
        return ['familyType','carcinomaInSitu','premiumMode','benefitAmount','state'];
      case 'dental':
        return ['coveredMembers'];
      case 'final-expense':
        return ['desiredFaceValue'];
      default:
        return [];
    }
  };

  const validateRequiredData = (category: string, data: QuoteFormData): { isValid: boolean; missing: string[] } => {
    const required = [...getRequiredFields(category), ...getAdditionalFields(category)];
    const missing = required.filter(field => {
      const value = (data as any)[field];
      return value === '' || value === null || value === undefined;
    });
    return { isValid: missing.length === 0, missing };
  };

  const loadStoredFormData = (): QuoteFormData => {
    if (typeof window === 'undefined') return formInputs;
    try {
      const raw = localStorage.getItem('medicare_quote_form_data');
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...formInputs, ...parsed };
      }
    } catch {}
    return formInputs;
  };

  const persistFormData = (data: QuoteFormData) => {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem('medicare_quote_form_data', JSON.stringify(data)); } catch {}
  };

  const handleGenerateFromMoreOptions = (category: string) => {
    if (!onGenerateQuotes) {
      // fallback just select category
      onSelectCategory?.(category);
      return;
    }
    const stored = loadStoredFormData();
    setFormInputs(stored);
    const validation = validateRequiredData(category, stored);
    if (validation.isValid) {
      if (category === 'medigap') {
        setSelectedCategoryForQuote(category);
        setIsMedigapSelectionOpen(true);
      } else {
        onGenerateQuotes(category, stored);
      }
    } else {
      setSelectedCategoryForQuote(category);
      setMissingFields(validation.missing);
      setShowMissingFieldsModal(true);
    }
  };

  const handleMissingFieldsSubmit = async () => {
    const validation = validateRequiredData(selectedCategoryForQuote, formInputs);
    if (!validation.isValid || !onGenerateQuotes) return;
    persistFormData(formInputs);
    setShowMissingFieldsModal(false);
    if (selectedCategoryForQuote === 'medigap') {
      setIsMedigapSelectionOpen(true);
    } else {
      await onGenerateQuotes(selectedCategoryForQuote, formInputs);
      setSelectedCategoryForQuote('');
    }
  };

  const handleMedigapPlanConfirm = async () => {
    if (!onGenerateQuotes || selectedMedigapPlans.length === 0) return;
    persistFormData(formInputs);
    setIsMedigapSelectionOpen(false);
    await onGenerateQuotes(selectedCategoryForQuote, formInputs, selectedMedigapPlans);
    setSelectedCategoryForQuote('');
    setSelectedMedigapPlans([]);
  };

  const handleMedigapPlanCancel = () => {
    setIsMedigapSelectionOpen(false);
    setSelectedCategoryForQuote('');
    setSelectedMedigapPlans([]);
  };

  const QuotesPanel: React.FC<{ activeCategory?: string; onSelectCategory?: (c:string)=>void }> = ({ activeCategory, onSelectCategory }) => {
    const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
    React.useEffect(() => {
      if (typeof window === 'undefined') return;
      try {
        const raw = localStorage.getItem('medicare_selected_categories');
        if (raw) {
          const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) setSelectedCategories(parsed);
        }
      } catch {}
    }, [activeTab]);

    const myQuotes = quoteCategories.filter(c => selectedCategories.includes(c));
    const moreOptions = quoteCategories.filter(c => !selectedCategories.includes(c));

    const renderGroup = (title: string, cats: string[], mode: 'my' | 'more') => (
      <div className="space-y-2">
        <h5 className="text-[10px] font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400 px-0.5">{title}</h5>
        <div className="grid grid-cols-2 gap-2">
          {cats.map(cat => {
            const selected = activeCategory === cat;
            const isLoading = loadingCategories.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => mode === 'more' ? handleGenerateFromMoreOptions(cat) : onSelectCategory?.(cat)}
                className={`relative px-2.5 py-1.5 rounded-md text-[11px] font-medium border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60
                  ${selected ? 'bg-blue-primary text-white border-blue-primary shadow-sm' : 'bg-slate-100/60 dark:bg-slate-700/40 hover:bg-slate-200 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600/60'}`}
                aria-pressed={selected}
                disabled={isLoading}
              >
                <span className="inline-flex items-center gap-1">
                  {cat.replace(/-/g,' ').replace(/\b\w/g, c => c.toUpperCase())}
                  {mode === 'more' && isLoading && <span className="ml-1 h-2 w-2 rounded-full bg-blue-primary animate-pulse" aria-hidden="true" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );

    return (
      <div className="space-y-4">
        {myQuotes.length > 0 && renderGroup('My Quotes', myQuotes, 'my')}
        {renderGroup(myQuotes.length ? 'More Options' : 'Quote Categories', moreOptions, 'more')}
        {myQuotes.length === 0 && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed px-0.5">No stored quotes yet. Generate quotes in the main Medicare flow to pin them here.</p>
        )}
      </div>
    );
  };

  const tabs = [
    {
      id: 'nav',
      label: 'Navigation',
      content: (
        activeNav === 'Quotes' ? (
          <QuotesPanel activeCategory={activeCategory} onSelectCategory={onSelectCategory} />
        ) : activeNav === 'Plan Builder' ? (
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
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">Limits quote results to carriers designated as preferred partners.</p>
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
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">Shows rates with household or other eligible discounts applied when available.</p>
            </div>
            {generatedCats.filter(c => c !== 'medigap').length > 0 && (
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/40 p-3 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300">Category Filters (Coming Soon)</p>
                <div className="flex flex-wrap gap-1.5">
                  {generatedCats.filter(c => c !== 'medigap').map(c => (
                    <span key={c} className="px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-700/60 text-[10px] text-slate-700 dark:text-slate-300 capitalize">{c.replace(/-/g,' ')}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : activeNav === 'Saved' ? (
          <div className="space-y-6">
            {savedPlans.length === 0 && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">No saved plans yet. Use the bookmark icon on any plan card to save it here.</p>
            )}
            {savedPlans.length > 0 && (
              (() => {
                // Group by category then list each saved record (single plan type badge only)
                const byCategory: Record<string, SavedPlanRecord[]> = {};
                savedPlans.forEach(p => { (byCategory[p.category] ||= []).push(p); });
                const categories = Object.keys(byCategory).sort();
                return (
                  <div className="space-y-5">
                    {categories.map(cat => {
                      const records = byCategory[cat];
                      // Aggregate carriers for range display using provided structure (single plan per record)
                      return (
                        <div key={cat} className="space-y-2">
                          <h5 className="text-[10px] font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400">{cat.replace(/-/g,' ')}</h5>
                          <div className="flex flex-col gap-3">
                            {records.map(r => (
                              <div key={r.key} className="flex items-center justify-between gap-3 rounded-xl border bg-white/80 dark:bg-slate-800/60 px-3 py-2 shadow-sm hover:shadow transition text-slate-800 dark:text-slate-100">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-8 h-8 rounded-full border bg-white dark:bg-slate-700/40 flex items-center justify-center overflow-hidden relative">
                                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                                      {r.carrierName.charAt(0)}
                                    </span>
                                    {r.logo && (
                                      <Image src={r.logo} alt={r.carrierName} width={32} height={32} className="object-contain relative z-10" onError={(e)=>{(e.currentTarget as HTMLImageElement).style.display='none';}} />
                                    )}
                                  </div>
                                  <span className="text-sm font-medium break-words whitespace-normal max-w-[220px]">{r.carrierName}</span>
                                  {r.planType && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900/80 text-white dark:bg-slate-600/70 dark:text-slate-100 tracking-wide">
                                      {r.planType}
                                    </span>
                                  )}
                                </div>
                                <div className="text-right flex flex-col leading-tight">
                                  {r.price !== undefined ? (
                                    <span className="text-sm font-semibold">${r.price.toFixed(0)}</span>
                                  ) : (
                                    <span className="text-sm font-semibold">{r.min !== undefined ? `$${r.min.toFixed(0)}` : '—'}</span>
                                  )}
                                  {r.max !== undefined && r.max !== r.min && (
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400">to ${r.max.toFixed(0)}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()
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
  <div className="flex gap-4 mt-2 lg:mt-2">
      {/* Compact Rail (unchanged baseline) */}
      <div className="flex flex-col w-52 rounded-xl border bg-white/70 dark:bg-slate-800/60 backdrop-blur p-3 gap-2 shadow-sm relative">
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
              {/* Sidebar sub-tabs (Preferred & Discounts) injected directly after Filters and before Quotes */}
              {item.label === 'Filters' && primaryNavSeed[index + 1]?.label === 'Quotes' && (
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
              {item.label === 'Quotes' && selectedCategories.length > 0 && (
                <div className="mt-1 ml-10 flex flex-wrap gap-1.5 pr-1">
                  {selectedCategories.map(cat => {
                    const cLabel = cat.replace(/-/g,' ').replace(/\b\w/g, m => m.toUpperCase());
                    const selected = activeCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={(e) => { e.stopPropagation(); onSelectCategory?.(cat); setActiveNav('Quotes'); if (activeTab == null) openTab('nav', null); }}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-medium border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 ${selected ? 'bg-blue-primary text-white border-blue-primary' : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600/60'}`}
                        aria-pressed={selected}
                      >{cLabel}</button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        <Separator className="my-1" />
        <div className="flex gap-2 px-1.5">
          <Button size="sm" className="h-8 text-xs flex-1 btn-brand">New Quote</Button>
        </div>

        {/* Collapsible Tab Panel (slides out) */}
        <div
          id={tabPanelId}
          role="tabpanel"
          aria-hidden={activeTab == null}
          className={`absolute top-0 left-full ml-3 ${activeNav === 'Saved' ? 'w-[25rem] sm:w-[28rem]' : 'w-72 sm:w-80'} transition-all duration-300 ${activeTab ? 'opacity-100 translate-x-0' : 'opacity-0 pointer-events-none -translate-x-2'} z-10`}
        >
          <div ref={panelRef} className="rounded-2xl border bg-gradient-to-br from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 shadow-md relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_85%_18%,hsl(var(--blue-primary)/0.15),transparent_60%)]" />
            <div className="relative">
              {/* Header row with dynamic title & close */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-200">
                  {activeNav}
                </h3>
                <button
                  ref={closeButtonRef}
                  onClick={() => { setActiveTab(null); queueMicrotask(() => lastFocusedTriggerRef.current?.focus()); }}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
                >
                  <span className="text-sm">×</span>
                  <span className="sr-only">Close panel</span>
                </button>
              </div>
              {/* Direct content (navigation content only) */}
              <div className="space-y-4 text-sm">
                {tabs[0].content}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Missing Fields Modal */}
      <Dialog open={showMissingFieldsModal} onOpenChange={setShowMissingFieldsModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Additional Information Required</DialogTitle>
            <DialogDescription className="sr-only">Provide required information to generate quotes</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">We need a bit more information to generate {selectedCategoryForQuote.replace(/-/g,' ')} quotes.</p>
            <div className="space-y-3">
              {missingFields.includes('age') && (
                <div className="space-y-1">
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" value={formInputs.age} onChange={(e) => setFormInputs(p => ({...p, age: e.target.value ? parseInt(e.target.value) : ''}))} />
                </div>
              )}
              {missingFields.includes('zipCode') && (
                <div className="space-y-1">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input id="zipCode" value={formInputs.zipCode} onChange={(e) => setFormInputs(p => ({...p, zipCode: e.target.value}))} />
                </div>
              )}
              {missingFields.includes('gender') && (
                <div className="space-y-1">
                  <Label>Gender</Label>
                  <Select value={formInputs.gender} onValueChange={(v) => setFormInputs(p => ({...p, gender: v as 'male' | 'female'}))}>
                    <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {missingFields.includes('tobaccoUse') && (
                <div className="space-y-1">
                  <Label>Tobacco Use</Label>
                  <Select value={formInputs.tobaccoUse === null ? '' : formInputs.tobaccoUse.toString()} onValueChange={(v) => setFormInputs(p => ({...p, tobaccoUse: v === 'true'}))}>
                    <SelectTrigger><SelectValue placeholder="Do you use tobacco?" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {missingFields.includes('state') && selectedCategoryForQuote !== 'cancer' && (
                <div className="space-y-1">
                  <Label>State</Label>
                  <Select value={formInputs.state} onValueChange={(v) => setFormInputs(p => ({...p, state: v}))}>
                    <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>
                      {['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'].map(st => <SelectItem key={st} value={st}>{st}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {selectedCategoryForQuote === 'cancer' && (
                <>
                  {missingFields.includes('state') && (
                    <div className="space-y-1">
                      <Label>State</Label>
                      <Select value={formInputs.state} onValueChange={(v) => setFormInputs(p => ({...p, state: v}))}>
                        <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TX">Texas</SelectItem>
                          <SelectItem value="GA">Georgia</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Cancer insurance currently limited to TX & GA.</p>
                    </div>
                  )}
                  {missingFields.includes('familyType') && (
                    <div className="space-y-1">
                      <Label>Coverage Type</Label>
                      <Select value={formInputs.familyType} onValueChange={(v) => setFormInputs(p => ({...p, familyType: v as 'individual' | 'family'}))}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="family">Family</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {missingFields.includes('carcinomaInSitu') && (
                    <div className="space-y-1">
                      <Label>Carcinoma In Situ Benefit</Label>
                      <Select value={formInputs.carcinomaInSitu === null || formInputs.carcinomaInSitu === undefined ? '' : formInputs.carcinomaInSitu.toString()} onValueChange={(v) => setFormInputs(p => ({...p, carcinomaInSitu: v === 'true'}))}>
                        <SelectTrigger><SelectValue placeholder="Benefit %" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="false">25%</SelectItem>
                          <SelectItem value="true">100%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {missingFields.includes('premiumMode') && (
                    <div className="space-y-1">
                      <Label>Premium Mode</Label>
                      <Select value={formInputs.premiumMode} onValueChange={(v) => setFormInputs(p => ({...p, premiumMode: v as 'monthly' | 'annual'}))}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="annual">Annual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {missingFields.includes('benefitAmount') && (
                    <div className="space-y-1">
                      <Label>Benefit Amount</Label>
                      <Select value={formInputs.benefitAmount} onValueChange={(v) => setFormInputs(p => ({...p, benefitAmount: v}))}>
                        <SelectTrigger><SelectValue placeholder="Select amount" /></SelectTrigger>
                        <SelectContent>
                          {['10000','25000','50000','75000','100000'].map(val => <SelectItem key={val} value={val}>${val.replace(/(\d{2})(\d{3})?/, (m,a,b) => b ? a+','+b : a )}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}
              {selectedCategoryForQuote === 'dental' && missingFields.includes('coveredMembers') && (
                <div className="space-y-1">
                  <Label>Covered Members</Label>
                  <Input value={formInputs.coveredMembers} onChange={(e) => setFormInputs(p => ({...p, coveredMembers: e.target.value}))} />
                </div>
              )}
              {selectedCategoryForQuote === 'final-expense' && missingFields.includes('desiredFaceValue') && (
                <div className="space-y-1">
                  <Label>Coverage Amount</Label>
                  <Select value={formInputs.desiredFaceValue} onValueChange={(v) => setFormInputs(p => ({...p, desiredFaceValue: v}))}>
                    <SelectTrigger><SelectValue placeholder="Select amount" /></SelectTrigger>
                    <SelectContent>
                      {['10000','15000','20000','25000','50000'].map(val => <SelectItem key={val} value={val}>${val}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowMissingFieldsModal(false)}>Cancel</Button>
            <Button size="sm" onClick={handleMissingFieldsSubmit}>Get Quote</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Medigap Plan Selection Modal */}
      <Dialog open={isMedigapSelectionOpen} onOpenChange={setIsMedigapSelectionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Medigap Plans</DialogTitle>
            <DialogDescription>Choose one or more plans to include.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              {['G','N','F'].map(plan => (
                <div key={plan} className="flex items-center space-x-2">
                  <Checkbox
                    id={`plan-${plan}`}
                    checked={selectedMedigapPlans.includes(plan)}
                    onCheckedChange={(checked: boolean) => {
                      setSelectedMedigapPlans(prev => checked ? [...prev, plan] : prev.filter(p => p !== plan));
                    }}
                  />
                  <Label htmlFor={`plan-${plan}`} className="text-sm font-medium">Plan {plan}</Label>
                </div>
              ))}
            </div>
            {selectedMedigapPlans.length === 0 && <p className="text-xs text-slate-500 dark:text-slate-400">Select at least one plan to continue.</p>}
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleMedigapPlanCancel}>Cancel</Button>
            <Button size="sm" disabled={selectedMedigapPlans.length === 0} onClick={handleMedigapPlanConfirm}>Generate Quotes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SidebarShowcase;
