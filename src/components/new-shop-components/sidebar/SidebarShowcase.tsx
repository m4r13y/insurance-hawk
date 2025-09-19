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
  // Dual-mode Final Expense support: if quote by monthly rate, capture desiredRate and set finalExpenseQuoteMode
  finalExpenseQuoteMode?: 'face' | 'rate';
  finalExpenseBenefitType?: string; // New: benefit_name filter for Final Expense quotes
  desiredRate?: string; // monthly rate target when finalExpenseQuoteMode === 'rate'
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
  // New: allow parent to provide restored form data snapshot
  initialFormData?: Partial<QuoteFormData>;
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
  completedQuoteTypes = [],
  initialFormData
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
  // View mode state (card | list) default card
  const [quoteViewMode, setQuoteViewMode] = React.useState<'card' | 'list'>(() => {
    if (typeof window === 'undefined') return 'card';
    try { return (localStorage.getItem('quote_view_mode') as 'card' | 'list') || 'card'; } catch { return 'card'; }
  });
  const persistQuoteViewMode = React.useCallback((mode: 'card' | 'list') => {
    setQuoteViewMode(mode);
    try { localStorage.setItem('quote_view_mode', mode); } catch {}
    try { window.dispatchEvent(new CustomEvent('quoteViewMode:changed', { detail: { mode } })); } catch {}
  }, []);

  // resetAllQuotes defined later after concurrent loading helpers; placeholder will be overwritten
  const resetAllQuotesRef = React.useRef<() => void>(()=>{});

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
  // Track whether the user has already focused an element inside the slide-out panel
  // so we don't keep stealing focus back to the close button (causing apparent input blur).
  const userFocusedInsideRef = React.useRef(false);
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
  // Listen for updates so newly generated categories appear immediately in rail
  React.useEffect(() => {
    const handler = () => {
      try {
        const raw = localStorage.getItem('medicare_selected_categories');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setSelectedCategories(parsed);
        } else {
          setSelectedCategories([]);
        }
      } catch {}
    };
    window.addEventListener('selectedCategories:updated', handler as EventListener);
    return () => window.removeEventListener('selectedCategories:updated', handler as EventListener);
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

  // Quotes panel subcomponent (defined before tabs to allow reference)
  // Quote generation support state (mirrors MedicareShopLayout logic simplified)
  // Inline quote generation form states (replaces previous modal UX)
  const [showInlineQuoteForm, setShowInlineQuoteForm] = React.useState(false);
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
    finalExpenseQuoteMode: 'face',
  finalExpenseBenefitType: '__all',
    desiredRate: '',
    benefitAmount: '',
    state: ''
  });
  // One-time seeding of form inputs from restored parent snapshot (if provided)
  const seededRef = React.useRef(false);
  React.useEffect(() => {
    if (!seededRef.current && initialFormData && typeof window !== 'undefined') {
      setFormInputs(prev => ({
        ...prev,
        ...initialFormData,
        // Ensure correct types for core fields
        age: (initialFormData.age as any) ?? prev.age,
        zipCode: (initialFormData.zipCode as any) ?? prev.zipCode,
        gender: (initialFormData.gender as any) ?? prev.gender,
        tobaccoUse: (initialFormData.tobaccoUse as any) ?? prev.tobaccoUse,
        finalExpenseQuoteMode: (initialFormData.finalExpenseQuoteMode as any) || prev.finalExpenseQuoteMode,
        finalExpenseBenefitType: (initialFormData.finalExpenseBenefitType as any) || prev.finalExpenseBenefitType,
      }));
      seededRef.current = true;
    }
  }, [initialFormData]);
  // Ref & focus restoration helpers for inline form to mitigate any parent re-mounts
  const inlineFormRef = React.useRef<HTMLDivElement | null>(null);
  const lastActiveFieldNameRef = React.useRef<string | null>(null);

  // Capture last focused input name on focus events
  React.useEffect(() => {
    const handler = (e: Event) => {
      if (!(e.target instanceof HTMLElement)) return;
      if (inlineFormRef.current && inlineFormRef.current.contains(e.target)) {
        const name = e.target.getAttribute('id') || e.target.getAttribute('name');
        if (name) lastActiveFieldNameRef.current = name;
      }
    };
    window.addEventListener('focusin', handler as any);
    return () => window.removeEventListener('focusin', handler as any);
  }, []);

  // NOTE: Focus restoration effect moved below formMode state declaration to avoid TS temporal dead zone errors.
  // Removed separate Medigap selection modal; selection now always inline once base fields satisfied
  const [selectedMedigapPlans, setSelectedMedigapPlans] = React.useState<string[]>([]);
  // Concurrent loading state (allow multiple categories generating simultaneously)
  const [loadingCategoriesLocal, setLoadingCategoriesLocal] = React.useState<string[]>([]);
  const addLoading = React.useCallback((cat:string) => setLoadingCategoriesLocal(prev => prev.includes(cat) ? prev : [...prev, cat]), []);
  const removeLoading = React.useCallback((cat:string) => setLoadingCategoriesLocal(prev => prev.filter(c => c !== cat)), []);
  const isCategoryLoading = React.useCallback((cat:string) => loadingCategoriesLocal.includes(cat) || loadingCategories.includes(cat), [loadingCategoriesLocal, loadingCategories]);
  const anyGenerating = React.useMemo(() => loadingCategoriesLocal.length > 0 || loadingCategories.length > 0, [loadingCategoriesLocal, loadingCategories]);
  // Edit / reset workflow state
  const [isEditing, setIsEditing] = React.useState(false);
  const [editCategory, setEditCategory] = React.useState<string | null>(null);
  const [formMode, setFormMode] = React.useState<'new' | 'edit'>('new');

  // After each render where the inline form is visible, if focus was lost due to a panel re-render, attempt to restore it.
  React.useEffect(() => {
    if (!showInlineQuoteForm) return;
    const active = typeof document !== 'undefined' ? document.activeElement : null;
    if (active && inlineFormRef.current && inlineFormRef.current.contains(active)) return;
    if (lastActiveFieldNameRef.current && inlineFormRef.current) {
      const candidate = inlineFormRef.current.querySelector<HTMLElement>(`#${CSS.escape(lastActiveFieldNameRef.current)}`);
      if (candidate) {
        try { candidate.focus(); } catch {}
      }
    }
  }, [showInlineQuoteForm, formInputs, selectedCategoryForQuote, missingFields, formMode]);

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
        // Require core demographics to avoid backend rejection
        return ['age','zipCode','gender','tobaccoUse'];
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
        // For dual mode final expense, we conditionally require desiredFaceValue OR desiredRate.
        // Keep returning desiredFaceValue here for backward compatibility; validation below will handle mode switch.
        return ['desiredFaceValue'];
      default:
        return [];
    }
  };

  const validateRequiredData = (category: string, data: QuoteFormData): { isValid: boolean; missing: string[] } => {
    let required = [...getRequiredFields(category), ...getAdditionalFields(category)];
    // Final expense dual mode adjustment
    if (category === 'final-expense') {
      // If quoting by rate, replace desiredFaceValue with desiredRate; if by face (default), keep existing
      if (data.finalExpenseQuoteMode === 'rate') {
        required = required.filter(r => r !== 'desiredFaceValue');
        required.push('desiredRate');
      }
    }
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
    // Also persist to broader form state key for other components (details panels, fetch filters)
    try {
      const existingRaw = localStorage.getItem('medicare_form_state');
      let merged: any = {};
      if (existingRaw) { try { merged = JSON.parse(existingRaw); } catch {} }
      merged = { ...merged, ...data };
      localStorage.setItem('medicare_form_state', JSON.stringify(merged));
    } catch {}
  };

  // Optimistically add a category to localStorage (and dispatch update) so the sidebar button appears immediately when generation starts.
  const optimisticAddCategory = React.useCallback((category: string) => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('medicare_selected_categories');
      let arr: string[] = [];
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) arr = parsed;
      }
      if (!arr.includes(category)) {
        arr.push(category);
        localStorage.setItem('medicare_selected_categories', JSON.stringify(arr));
        window.dispatchEvent(new CustomEvent('selectedCategories:updated'));
      }
    } catch {}
  }, []);

  // Implement resetAllQuotes now that loading state helpers (anyGenerating) exist further down via useEffect ordering safety.
  const resetAllQuotes = React.useCallback(() => {
    // anyGenerating may not yet be declared at this point (hoisted later) so access via function that checks local state directly if undefined
    const generating = (loadingCategoriesLocal.length > 0) || (loadingCategories.length > 0);
    if (generating) return;
    const QUOTE_KEYS = [
      'medigap_plan_quotes_stub',
      'medicare_advantage_quotes',
      'medicare_drug_plan_quotes',
      'medicare_dental_quotes',
      'medicare_hospital_indemnity_quotes',
      'medicare_final_expense_quotes',
      'medicare_cancer_insurance_quotes'
    ];
    try {
      QUOTE_KEYS.forEach(k => { try { localStorage.removeItem(k); } catch {} });
      const EXTRA_KEYS = [
        'medicare_selected_categories',
        'medicare_quote_form_data', // inline quote form persistence
        'medicare_form_state',      // broader form state used in other flows
        'saved_plans_v1',           // saved plans cache
        'carrier_search_query',
        'quote_view_mode',
        'visitor_id'
      ];
      EXTRA_KEYS.forEach(k => { try { localStorage.removeItem(k); } catch {} });
      window.dispatchEvent(new CustomEvent('selectedCategories:updated'));
      window.dispatchEvent(new CustomEvent('carrierSearch:changed', { detail: { query: '' } }));
      window.dispatchEvent(new CustomEvent('quoteViewMode:changed', { detail: { mode: 'card' } }));
      setSelectedCategories([]);
      setCarrierSearch('');
      setQuoteViewMode('card');
      setIsEditing(false);
      setEditCategory(null);
      setShowInlineQuoteForm(false);
      setSelectedCategoryForQuote('');
      setFormInputs({
        age: '', zipCode: '', gender: '', tobaccoUse: null, familyType: '', carcinomaInSitu: null, premiumMode: '', coveredMembers: '', desiredFaceValue: '', finalExpenseQuoteMode: 'face', desiredRate: '', benefitAmount: '', state: '', finalExpenseBenefitType: ''
      });
      try { localStorage.removeItem('plan_builder_cache_v1'); } catch {}
      try { window.dispatchEvent(new CustomEvent('planBuilder:updated')); } catch {}
    } catch {}
  }, [loadingCategoriesLocal, loadingCategories]);
  resetAllQuotesRef.current = resetAllQuotes;

  // Confirmation dialog state for destructive reset
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);
  const confirmReset = () => { setShowResetConfirm(true); };
  const executeConfirmedReset = () => { setShowResetConfirm(false); resetAllQuotes(); };
  const cancelReset = () => setShowResetConfirm(false);

  const handleGenerateFromMoreOptions = (category: string) => {
    if (isCategoryLoading(category)) return; // prevent duplicate generation for same category
    if (!onGenerateQuotes) {
      // fallback just select category
      onSelectCategory?.(category);
      return;
    }
    const stored = loadStoredFormData();
    setFormInputs(stored);
    const validation = validateRequiredData(category, stored);
    if (validation.isValid) {
      // For medigap we still show inline form (to pick plans) instead of auto-generating
      if (category === 'medigap') {
        setSelectedCategoryForQuote(category);
        setMissingFields([]);
        setFormMode('new');
        setShowInlineQuoteForm(true);
      } else {
        (async () => {
          try {
            addLoading(category);
            optimisticAddCategory(category);
            await onGenerateQuotes(category, stored);
          } finally {
            removeLoading(category);
          }
        })();
      }
    } else {
      setSelectedCategoryForQuote(category);
      setMissingFields(validation.missing);
      setFormMode('new');
      setShowInlineQuoteForm(true);
    }
  };

  const handleMissingFieldsSubmit = async () => {
    const validation = validateRequiredData(selectedCategoryForQuote, formInputs);
    if (!validation.isValid || !onGenerateQuotes) return;
    persistFormData(formInputs);
    setShowInlineQuoteForm(false);
    if (selectedCategoryForQuote === 'medigap') return;
    try {
      addLoading(selectedCategoryForQuote);
      optimisticAddCategory(selectedCategoryForQuote);
      await onGenerateQuotes(selectedCategoryForQuote, formInputs);
    } finally {
      removeLoading(selectedCategoryForQuote);
      setSelectedCategoryForQuote('');
      setShowInlineQuoteForm(false);
    }
  };

  const handleMedigapPlanConfirm = async () => {
    if (!onGenerateQuotes || selectedMedigapPlans.length === 0) return;
    persistFormData(formInputs);
    try {
      addLoading('medigap');
      optimisticAddCategory('medigap');
      await onGenerateQuotes(selectedCategoryForQuote, formInputs, selectedMedigapPlans);
    } finally {
      removeLoading('medigap');
      setSelectedCategoryForQuote('');
      setSelectedMedigapPlans([]);
      setShowInlineQuoteForm(false);
    }
  };

  const handleMedigapPlanCancel = () => {
    setSelectedCategoryForQuote('');
    setSelectedMedigapPlans([]);
  setShowInlineQuoteForm(false);
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
      const handler = () => {
        try {
          const raw2 = localStorage.getItem('medicare_selected_categories');
          if (raw2) {
            const parsed2 = JSON.parse(raw2);
            if (Array.isArray(parsed2)) setSelectedCategories(parsed2);
          }
        } catch {}
      };
      window.addEventListener('selectedCategories:updated', handler as EventListener);
      return () => window.removeEventListener('selectedCategories:updated', handler as EventListener);
    }, [activeTab]);

    const myQuotes = quoteCategories.filter(c => selectedCategories.includes(c));
    const moreOptions = quoteCategories.filter(c => !selectedCategories.includes(c));

    // Start edit flow
    const startEdit = () => {
      if (!myQuotes.length) return;
      setIsEditing(true);
      setFormMode('edit');
      if (myQuotes.length === 1) {
        chooseEditCategory(myQuotes[0]);
      }
    };

    const chooseEditCategory = (cat: string) => {
      setEditCategory(cat);
      setSelectedCategoryForQuote(cat);
      const stored = loadStoredFormData();
      setFormInputs(stored);
      setMissingFields([]); // show all fields in edit mode
      // Prefill medigap plans from existing quotes if possible
      if (cat === 'medigap') {
        try {
          const raw = localStorage.getItem('medigap_plan_quotes_stub');
          if (raw) {
            const quotes = JSON.parse(raw);
            if (Array.isArray(quotes)) {
              const plans = Array.from(new Set(quotes.map((q:any)=> q?.plan).filter(Boolean)));
              if (plans.length) setSelectedMedigapPlans(plans as string[]);
            }
          }
        } catch {}
      }
      setShowInlineQuoteForm(true);
    };

    const cancelEdit = () => {
      setIsEditing(false);
      setEditCategory(null);
      setFormMode('new');
      setShowInlineQuoteForm(false);
      setSelectedCategoryForQuote('');
    };

    const resetAllQuotes = () => resetAllQuotesRef.current();

    const renderGroup = (title: string, cats: string[], mode: 'my' | 'more') => (
      <div className="space-y-2">
        <h5 className="text-[10px] font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400 px-0.5">{title}</h5>
        <div className="grid grid-cols-2 gap-2">
          {cats.map(cat => {
            const selected = activeCategory === cat;
            const isLoading = isCategoryLoading(cat);
            return (
              <button
                key={cat}
                onClick={() => mode === 'more' ? handleGenerateFromMoreOptions(cat) : onSelectCategory?.(cat)}
                className={`relative px-3 py-2 rounded-md text-[12px] font-medium border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60
                  ${selected ? 'bg-blue-primary text-white border-blue-primary shadow-sm' : 'bg-slate-100/80 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700/70 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600/60'}`}
                aria-pressed={selected}
                disabled={isLoading}
              >
                <span className="inline-flex items-center gap-1">
                  {isLoading && <span className="inline-block h-3 w-3 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden="true" />}
                  <span>{cat.replace(/-/g,' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                  {mode === 'more' && !isLoading && <span className="sr-only">Generate quotes</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );

    return (
      <div className="space-y-4">
        {!showInlineQuoteForm && myQuotes.length > 0 && renderGroup('My Quotes', myQuotes, 'my')}
        {!showInlineQuoteForm && moreOptions.length > 0 && renderGroup(myQuotes.length ? 'More Options' : 'Quote Categories', moreOptions, 'more')}
        {!showInlineQuoteForm && myQuotes.length > 0 && (
          <div className="flex justify-end gap-2 pt-1">
            {!isEditing && (
              <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" onClick={startEdit} disabled={anyGenerating}>Edit</Button>
            )}
            <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] text-red-600 dark:text-red-400" onClick={confirmReset} disabled={anyGenerating}>Reset</Button>
          </div>
        )}
        {showResetConfirm && !showInlineQuoteForm && (
          <div className="rounded-md border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 p-3 space-y-2 animate-in fade-in slide-in-from-top-1">
            <p className="text-[11px] font-semibold text-red-700 dark:text-red-300">Reset All Data?</p>
            <p className="text-[11px] text-red-600 dark:text-red-200 leading-snug">This will permanently clear quotes, form inputs, saved plans, visitor id, and preferences. This cannot be undone.</p>
            <div className="flex justify-end gap-2 pt-1">
              <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" onClick={cancelReset}>Cancel</Button>
              <Button size="sm" className="h-7 px-2 text-[11px] bg-red-600 hover:bg-red-700 text-white" onClick={executeConfirmedReset}>Yes, Reset</Button>
            </div>
          </div>
        )}
        {isEditing && !showInlineQuoteForm && !editCategory && myQuotes.length > 1 && (
          <div className="rounded-md border border-slate-300 dark:border-slate-600 p-2 space-y-2 bg-white/60 dark:bg-slate-800/50">
            <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300">Select a category to edit:</p>
            <div className="grid grid-cols-2 gap-2">
              {myQuotes.map(cat => (
                <Button key={cat} size="sm" variant="outline" className="h-7 text-[11px]" onClick={()=>chooseEditCategory(cat)}>{cat.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</Button>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px]" onClick={cancelEdit}>Cancel</Button>
            </div>
          </div>
        )}
        {showInlineQuoteForm && (
          <div ref={inlineFormRef} className="mt-2 pb-2 space-y-3 relative z-30">
            <div className="flex items-start">
              <div>
                <h6 className="text-[11px] font-semibold tracking-wide uppercase text-slate-600 dark:text-slate-300">{formMode==='edit' ? 'Edit' : 'Generate'} {selectedCategoryForQuote.replace(/-/g,' ') || 'Quotes'}</h6>
                {formMode==='new' && !!missingFields.length && <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Provide required fields below.</p>}
                {formMode==='edit' && <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Update fields and regenerate.</p>}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {(() => {
                const allFields = selectedCategoryForQuote ? [...getRequiredFields(selectedCategoryForQuote), ...getAdditionalFields(selectedCategoryForQuote)] : [];
                const showAll = formMode === 'edit';
                const shouldShow = (field:string) => showAll ? allFields.includes(field) : missingFields.includes(field);
                return (
                <>
              {shouldShow('age') && (
                <div className="space-y-1 col-span-1">
                  <Label htmlFor="inline-age" className="text-[11px]">Age</Label>
                  <Input id="inline-age" type="number" className="h-7 text-[11px]" value={formInputs.age} onChange={(e)=>setFormInputs(p=>({...p, age: e.target.value? parseInt(e.target.value): ''}))} />
                </div>
              )}
              {shouldShow('zipCode') && (
                <div className="space-y-1 col-span-1">
                  <Label htmlFor="inline-zip" className="text-[11px]">ZIP Code</Label>
                  <Input id="inline-zip" className="h-7 text-[11px]" value={formInputs.zipCode} onChange={(e)=>setFormInputs(p=>({...p, zipCode: e.target.value}))} />
                </div>
              )}
              {shouldShow('gender') && (
                <div className="space-y-1 col-span-1">
                  <Label className="text-[11px]">Gender</Label>
                  <Select value={formInputs.gender} onValueChange={(v)=>setFormInputs(p=>({...p, gender: v as 'male'|'female'}))}>
                    <SelectTrigger className="h-7 text-[11px] relative z-50"><SelectValue placeholder="Gender" /></SelectTrigger>
                    <SelectContent className="z-[999] relative"> 
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {shouldShow('tobaccoUse') && (
                <div className="space-y-1 col-span-1">
                  <Label className="text-[11px]">Tobacco</Label>
                  <Select value={formInputs.tobaccoUse === null ? '' : formInputs.tobaccoUse.toString()} onValueChange={(v)=>setFormInputs(p=>({...p, tobaccoUse: v==='true'}))}>
                    <SelectTrigger className="h-7 text-[11px] relative z-50"><SelectValue placeholder="Use?" /></SelectTrigger>
                    <SelectContent className="z-[999] relative">
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {/* State (non-cancer) */}
              {shouldShow('state') && selectedCategoryForQuote !== 'cancer' && (
                <div className="space-y-1 col-span-1">
                  <Label className="text-[11px]">State</Label>
                  <Select value={formInputs.state} onValueChange={(v)=>setFormInputs(p=>({...p, state: v}))}>
                    <SelectTrigger className="h-7 text-[11px] relative z-50"><SelectValue placeholder="State" /></SelectTrigger>
                    <SelectContent className="max-h-52 z-[999] relative">
                      {['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'].map(st=> <SelectItem key={st} value={st}>{st}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {/* Cancer specific */}
              {selectedCategoryForQuote === 'cancer' && shouldShow('state') && (
                <div className="space-y-1 col-span-1">
                  <Label className="text-[11px]">State</Label>
                  <Select value={formInputs.state} onValueChange={(v)=>setFormInputs(p=>({...p, state: v}))}>
                    <SelectTrigger className="h-7 text-[11px] relative z-50"><SelectValue placeholder="State" /></SelectTrigger>
                    <SelectContent className="z-[999] relative">
                      <SelectItem value="TX">TX</SelectItem>
                      <SelectItem value="GA">GA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {selectedCategoryForQuote === 'cancer' && shouldShow('familyType') && (
                <div className="space-y-1 col-span-1">
                  <Label className="text-[11px]">Coverage</Label>
                  <Select value={formInputs.familyType} onValueChange={(v)=>setFormInputs(p=>({...p, familyType: v as 'individual'|'family'}))}>
                    <SelectTrigger className="h-7 text-[11px] relative z-50"><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent className="z-[999] relative">
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {selectedCategoryForQuote === 'cancer' && shouldShow('carcinomaInSitu') && (
                <div className="space-y-1 col-span-1">
                  <Label className="text-[11px]">CIS %</Label>
                  <Select value={formInputs.carcinomaInSitu == null ? '' : formInputs.carcinomaInSitu.toString()} onValueChange={(v)=>setFormInputs(p=>({...p, carcinomaInSitu: v==='true'}))}>
                    <SelectTrigger className="h-7 text-[11px] relative z-50"><SelectValue placeholder="%" /></SelectTrigger>
                    <SelectContent className="z-[999] relative">
                      <SelectItem value="false">25%</SelectItem>
                      <SelectItem value="true">100%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {selectedCategoryForQuote === 'cancer' && shouldShow('premiumMode') && (
                <div className="space-y-1 col-span-1">
                  <Label className="text-[11px]">Mode</Label>
                  <Select value={formInputs.premiumMode} onValueChange={(v)=>setFormInputs(p=>({...p, premiumMode: v as 'monthly'|'annual'}))}>
                    <SelectTrigger className="h-7 text-[11px] relative z-50"><SelectValue placeholder="Mode" /></SelectTrigger>
                    <SelectContent className="z-[999] relative">
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {selectedCategoryForQuote === 'cancer' && shouldShow('benefitAmount') && (
                <div className="space-y-1 col-span-1">
                  <Label className="text-[11px]">Benefit</Label>
                  <Select value={formInputs.benefitAmount} onValueChange={(v)=>setFormInputs(p=>({...p, benefitAmount: v}))}>
                    <SelectTrigger className="h-7 text-[11px] relative z-50"><SelectValue placeholder="Amount" /></SelectTrigger>
                    <SelectContent className="z-[999] relative">
                      {['10000','25000','50000','75000','100000'].map(val => <SelectItem key={val} value={val}>${val}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {selectedCategoryForQuote === 'dental' && shouldShow('coveredMembers') && (
                <div className="space-y-1 col-span-1">
                  <Label className="text-[11px]">Members</Label>
                  <Input className="h-7 text-[11px]" value={formInputs.coveredMembers} onChange={(e)=>setFormInputs(p=>({...p, coveredMembers: e.target.value}))} />
                </div>
              )}
              {selectedCategoryForQuote === 'final-expense' && shouldShow('desiredFaceValue') && (
                <div className="space-y-1 col-span-1">
                  <Label className="text-[11px] flex items-center justify-between w-full">
                    <span>Quote By</span>
                    <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">{formInputs.finalExpenseQuoteMode === 'face' ? 'Face Value' : 'Monthly Rate'}</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-1">
                    <button type="button" onClick={()=> setFormInputs(p=>({...p, finalExpenseQuoteMode: 'face'}))} className={`text-[10px] px-1 py-1 rounded border ${formInputs.finalExpenseQuoteMode==='face' ? 'bg-blue-primary text-white border-blue-primary' : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600'}`}>Face</button>
                    <button type="button" onClick={()=> setFormInputs(p=>({...p, finalExpenseQuoteMode: 'rate'}))} className={`text-[10px] px-1 py-1 rounded border ${formInputs.finalExpenseQuoteMode==='rate' ? 'bg-blue-primary text-white border-blue-primary' : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600'}`}>Rate</button>
                  </div>
                    <div className="mt-1">
                      <Label className="text-[10px]">Benefit Type</Label>
                      <Select value={formInputs.finalExpenseBenefitType || '__all'} onValueChange={(v)=> setFormInputs(p=>({...p, finalExpenseBenefitType: v}))}>
                        <SelectTrigger className="h-7 text-[11px] relative z-50"><SelectValue placeholder="All" /></SelectTrigger>
                        <SelectContent className="z-[999] relative max-h-60">
                          {[{val:'__all', label:'All'}, {val:'Level Benefit', label:'Level Benefit'}, {val:'Graded Benefit', label:'Graded Benefit'}, {val:'Modified Benefit', label:'Modified Benefit'}, {val:'Single Pay', label:'Single Pay'}, {val:'10 Pay', label:'10 Pay'}].map(opt => <SelectItem key={opt.val} value={opt.val}>{opt.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  {formInputs.finalExpenseQuoteMode === 'face' ? (
                    <div className="mt-1">
                      <Label className="text-[10px]">Face Value</Label>
                      <Select value={formInputs.desiredFaceValue} onValueChange={(v)=>setFormInputs(p=>({...p, desiredFaceValue: v}))}>
                        <SelectTrigger className="h-7 text-[11px] relative z-50"><SelectValue placeholder="Amount" /></SelectTrigger>
                        <SelectContent className="z-[999] relative">
                          {['10000','15000','20000','25000','50000'].map(val => <SelectItem key={val} value={val}>${val}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="mt-1">
                      <Label className="text-[10px]">Target Monthly Rate</Label>
                      <Input className="h-7 text-[11px]" placeholder="e.g. 40" value={formInputs.desiredRate || ''} onChange={(e)=> setFormInputs(p=>({...p, desiredRate: e.target.value }))} />
                    </div>
                  )}
                </div>
              )}
                </>
                ); })()}
            {/* Inline Medigap plan selection moved INTO field grid for cohesive layout */}
            {selectedCategoryForQuote === 'medigap' && showInlineQuoteForm && ((formMode==='new' && missingFields.length === 0) || formMode==='edit') && (
              <div className="col-span-2 mt-1">
                <Label className="text-[11px] mb-1 block">Plans</Label>
                <div className="flex gap-2 flex-wrap">
                  {['G','N','F'].map(pl => {
                    const active = selectedMedigapPlans.includes(pl);
                    return (
                      <button
                        type="button"
                        key={pl}
                        onClick={()=> setSelectedMedigapPlans(prev => active ? prev.filter(p=>p!==pl) : [...prev, pl])}
                        className={`px-2 py-1 rounded-md text-[11px] border transition-colors ${active ? 'bg-blue-primary text-white border-blue-primary shadow-sm' : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                        aria-pressed={active}
                      >Plan {pl}</button>
                    );
                  })}
                </div>
                {selectedMedigapPlans.length === 0 && <p className="text-[10px] text-slate-500 mt-1">Select at least one.</p>}
              </div>
            )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={()=>{ setShowInlineQuoteForm(false); setSelectedCategoryForQuote(''); if(formMode==='edit'){ cancelEdit(); } }}>Cancel</Button>
              <Button size="sm" disabled={(selectedCategoryForQuote && isCategoryLoading(selectedCategoryForQuote)) || (selectedCategoryForQuote==='medigap' && ((formMode==='new' && missingFields.length===0 && selectedMedigapPlans.length===0) || (formMode==='edit' && selectedMedigapPlans.length===0)))} onClick={async ()=>{
                if (selectedCategoryForQuote && isCategoryLoading(selectedCategoryForQuote)) return;
                if (formMode==='new' && missingFields.length){
                  await handleMissingFieldsSubmit();
                } else if (selectedCategoryForQuote === 'medigap') {
                  await handleMedigapPlanConfirm();
                } else {
                  await handleMissingFieldsSubmit();
                }
                setShowInlineQuoteForm(false);
                if (formMode==='edit') { setIsEditing(false); setEditCategory(null); setFormMode('new'); }
              }}>{(selectedCategoryForQuote && isCategoryLoading(selectedCategoryForQuote)) ? (formMode==='edit' ? 'Saving…' : 'Working…') : (formMode==='edit' ? 'Regenerate' : 'Generate')}</Button>
            </div>
          </div>
        )}
        {!showInlineQuoteForm && myQuotes.length === 0 && (
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
              <div className="flex items-center justify-between gap-3 text-xs font-medium text-slate-700 dark:text-slate-200">
                <span>Quote View</span>
                <div className="inline-flex items-center gap-1 bg-white/70 dark:bg-slate-700/60 border border-slate-300 dark:border-slate-600 rounded-md p-0.5">
                  <button type="button" aria-pressed={quoteViewMode==='card'} onClick={()=>persistQuoteViewMode('card')} className={`px-2 h-6 rounded text-[10px] font-medium transition ${quoteViewMode==='card' ? 'bg-blue-primary text-white shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-600/50'}`}>Card</button>
                  <button type="button" aria-pressed={quoteViewMode==='list'} onClick={()=>persistQuoteViewMode('list')} className={`px-2 h-6 rounded text-[10px] font-medium transition ${quoteViewMode==='list' ? 'bg-blue-primary text-white shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-600/50'}`}>List</button>
                </div>
              </div>
              <Separator className="my-1" />
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
                <div className="mt-1 flex flex-wrap gap-2 pr-1 pl-2">
                  {selectedCategories.map(cat => {
                    const cLabel = cat.replace(/-/g,' ').replace(/\b\w/g, m => m.toUpperCase());
                    const selected = activeCategory === cat;
                    return (
                      <button
                        key={cat}
                        /* Selecting a quote category from the rail should NOT open the slideout panel. Only clicking the 'Quotes' nav item opens it. */
                        onClick={(e) => { e.stopPropagation(); onSelectCategory?.(cat); setActiveNav('Quotes'); /* intentionally omit openTab */ }}
                        className={`px-3 h-7 inline-flex items-center rounded-md text-[11px] font-medium border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 ${selected ? 'bg-blue-primary text-white border-blue-primary shadow-sm' : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600/60'}`}
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
          <Button
            size="sm"
            className="h-8 text-xs flex-1 btn-brand"
            onClick={() => {
              // Open the Quotes panel and start a fresh inline form immediately for fast UX feedback
              setActiveNav('Quotes');
              if (activeTab !== 'nav') {
                openTab('nav');
              }
              // Default to Medigap (most common) if no existing selection; surface its required fields
              const defaultCat = 'medigap';
              setSelectedCategoryForQuote(defaultCat);
              const stored = loadStoredFormData();
              const merged = { ...stored };
              setFormInputs(merged);
              const validation = validateRequiredData(defaultCat, merged);
              setMissingFields(validation.missing);
              setFormMode('new');
              setShowInlineQuoteForm(true);
            }}
          >New Quote</Button>
        </div>

        {/* Collapsible Tab Panel (slides out) */}
        <div
          id={tabPanelId}
          role="tabpanel"
          aria-hidden={activeTab == null}
          // NOTE: Previously width changed between Saved (w-[25rem]) and others (w-72) while using transition-all,
          // causing layout + transform jank (flash/jitter) on rapid nav switching. We now pin a stable panel width
          // and only transition opacity + transform for smoother GPU-friendly animation.
          className={`absolute top-0 left-full ml-3 w-[25rem] sm:w-[28rem] transform-gpu transition-opacity duration-250 ease-out ${activeTab ? 'opacity-100 translate-x-0' : 'opacity-0 pointer-events-none -translate-x-2'} z-10`}
          data-active={!!activeTab}
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
      {/* Removed separate Medigap plan selection modal; selection handled inline in the form */}
    </div>
  );
};

export default SidebarShowcase;
