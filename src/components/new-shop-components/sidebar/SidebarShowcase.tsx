"use client";
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookmarkIcon, BookmarkFilledIcon } from '@radix-ui/react-icons';
import { SavedPlanRecord } from '@/lib/savedPlans';
import Image from 'next/image';
import { useSavedPlans } from '@/contexts/SavedPlansContext';
import { MinimalRateChips, CarrierSummaryMinimal } from '@/components/new-shop-components/quote-cards/MinimalRateChips';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface NavItem {
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  active?: boolean;
  disabled?: boolean;
}

const primaryNavSeed: NavItem[] = [
  { label: 'Filters', active: true },
  { label: 'Quotes' },
  { label: 'Plan Builder' },
  { label: 'Compare' },
  { label: 'Saved' },
];

const filters: NavItem[] = [
  { label: 'All Carriers', active: true },
  { label: 'Preferred' },
  { label: 'Low Premium' },
  { label: 'High Coverage' },
];

// Icon box with dedicated bookmark icon for Saved (outline vs filled when active)
const IconBox: React.FC<{active?: boolean; label?: string; count?: number}> = ({active, label, count}) => {
  const base = `w-5 h-5 rounded-sm border flex items-center justify-center text-[10px] font-medium ${active ? 'bg-blue-primary text-white border-blue-400' : 'bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-600'}`;
  if (label === 'Saved') {
    const Icon = active ? BookmarkFilledIcon : BookmarkIcon;
    return (
      <div className={base} aria-hidden="true">
        <Icon className="w-3.5 h-3.5" />
      </div>
    );
  }
  return <div className={base}>i</div>;
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
  onGenerateQuotes,
  loadingCategories = [],
  completedQuoteTypes = []
}) => {
  // State: active detail tab, active nav item
  const [activeTab, setActiveTab] = React.useState<string | null>(null);
  const [planBuilderState, setPlanBuilderState] = React.useState<PlanBuilderState>({});
  const [activeNav, setActiveNav] = React.useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('shopSidebar.activeNav');
      // Migrate legacy 'Overview' to new 'Filters'
      if (stored === 'Overview') return 'Filters';
      return stored || 'Filters';
    }
    return 'Filters';
  });
  const tabPanelId = React.useId();
  const closeButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const lastFocusedTriggerRef = React.useRef<HTMLButtonElement | null>(null);
  const { savedPlans } = useSavedPlans();

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
                  {planBuilderState.original && (
                    <Badge className="bg-blue-primary/20 text-blue-primary dark:text-blue-200">In Progress</Badge>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">Build a supplement-focused comparison starting from Parts A & B baseline coverage.</p>
                <div className="flex gap-2">
                  {planBuilderState.original ? (
                    <>
                      <Button size="sm" className="h-7 px-3 text-xs btn-brand" onClick={() => {/* continue editing */}}>Edit</Button>
                      <Button size="sm" variant="outline" className="h-7 px-3 text-xs" onClick={() => setPlanBuilderState(s => ({...s, original: true}))}>Start New</Button>
                    </>
                  ) : (
                    <Button size="sm" className="h-7 px-3 text-xs btn-brand" onClick={() => setPlanBuilderState(s => ({...s, original: true}))}>Start New</Button>
                  )}
                </div>
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
                      <Button size="sm" className="h-7 px-3 text-xs btn-brand" onClick={() => {/* continue editing */}}>Edit</Button>
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
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {filters.map(f => (
                <button
                  key={f.label}
                  className={`px-2 py-1.5 rounded-md text-[11px] font-medium transition border focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60
                    ${f.active ? 'bg-blue-primary text-white border-blue-400 shadow-sm' : 'bg-slate-50 dark:bg-slate-700/40 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600/60'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="rounded-lg bg-slate-100/80 dark:bg-slate-800/60 p-3 border border-slate-200 dark:border-slate-700/60 backdrop-blur-sm">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Tune filters to surface preferred carriers faster.</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="h-8 text-xs flex-1 border-slate-300 dark:border-slate-600/70 hover:bg-slate-100 dark:hover:bg-slate-700/60">Reset</Button>
              <Button size="sm" className="h-8 text-xs flex-1 btn-brand">Apply</Button>
            </div>
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
                <IconBox active={isActive} label={item.label} />
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && <Badge className="bg-white/20 text-white h-5 px-2">·</Badge>}
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
        <h3 className="text-xs font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400 px-1.5">Workspace</h3>
        {primaryNavSeed.map(item => {
          const logicalActive = activeNav === item.label;
          const panelOpen = activeTab === 'nav';
          const isActive = logicalActive && panelOpen; // visual active only when panel open
          const savedCount = item.label === 'Saved' ? savedPlans.length : 0;
          return (
            <button
              key={item.label}
              ref={el => { if (logicalActive) lastFocusedTriggerRef.current = el; }}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-left transition group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60
                ${isActive ? 'bg-blue-primary text-white shadow-sm' : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200'}`}
              onClick={(e) => {
                setActiveNav(item.label);
                // If panel closed, open nav panel. If open on filters, switch to nav. If already on nav, keep open.
                if (activeTab == null || activeTab !== 'nav') {
                  openTab('nav', e.currentTarget);
                } else {
                  // keep panel open; still update last focused trigger for proper focus restore
                  lastFocusedTriggerRef.current = e.currentTarget;
                }
              }}
              aria-controls={tabPanelId}
              aria-expanded={activeTab === 'nav'}
              role="tab"
              aria-current={logicalActive ? 'page' : undefined}
            >
              <IconBox active={isActive} label={item.label} count={savedCount} />
              <span className="flex-1 truncate flex items-center gap-1">{item.label}{savedCount > 0 && item.label === 'Saved' && <span className="inline-flex items-center justify-center h-5 min-w-[1.25rem] px-1 rounded-full text-[10px] font-semibold border border-amber-300/60 text-amber-600 dark:text-amber-300 dark:border-amber-400/40 bg-amber-50/70 dark:bg-amber-400/10 shadow-sm">{savedCount}</span>}</span>
              {isActive && <Badge className="bg-white/20 text-white h-5 px-2">·</Badge>}
            </button>
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
