"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { debounce } from "lodash";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import MedicareDisclaimer from "@/components/medicare-disclaimer";
import MedicareQuoteFlow from "@/components/MedicareQuoteFlow";
import { MedicareAdvantageShopContent } from "@/components/medicare-shop/advantage/MedicareAdvantageShopContentNew";
import MedicareQuoteLoadingPage from "@/components/MedicareQuoteLoadingPage";
import GenericQuoteLoading from "@/components/GenericQuoteLoading";
import { getMedigapQuotes } from "@/lib/actions/medigap-quotes";
import { getMedicareAdvantageQuotes } from "@/lib/actions/advantage-quotes";
import { getDrugPlanQuotes } from "@/lib/actions/drug-plan-quotes";
import { getDentalQuotes } from "@/lib/actions/dental-quotes";
import { getHospitalIndemnityQuotes } from "@/lib/actions/hospital-indemnity-quotes";
import { getFinalExpenseLifeQuotes } from "@/lib/actions/final-expense-quotes";
import { getCancerInsuranceQuotes } from "@/lib/actions/cancer-insurance-quotes";
import { optimizeDentalQuotes, OptimizedDentalQuote, filter2025Quotes } from "@/lib/dental-quote-optimizer";
import { optimizeHospitalIndemnityQuotes, OptimizedHospitalIndemnityQuote } from "@/lib/hospital-indemnity-quote-optimizer";
import { saveDentalQuotesToStorage } from "@/lib/dental-storage";
import { quoteService } from "@/lib/services/quote-service";
import { cancelAllRequests } from "@/lib/services/temporary-storage";
import { 
  getCarrierLogoUrl as getProperLogoUrl, 
  getCarrierDisplayName as getCarrierDisplayNameFromSystem,
  getEnhancedCarrierInfo,
  filterPreferredCarriers,
  type ProductCategory
} from "@/lib/carrier-system";
import { consolidateQuoteVariations } from "@/lib/plan-consolidation";
import { CrossCircledIcon, PersonIcon, RocketIcon } from "@radix-ui/react-icons";
import { useDiscountState } from "@/lib/services/discount-state";

// Import organized components
import {
  MedicareShopLayout,
  MedicareShopHeader,
  MedicareShopSidebar,
  MedicareShopNavigation,
  PaginationControls,
  type QuoteFormData,
  loadFromStorage,
  saveToStorage,
  getFirestoreStorageInfo,
  migrateLegacyStorage,
  saveSelectedCategories,
  loadSelectedCategories,
  saveCurrentFlowStep,
  loadCurrentFlowStep,
  QUOTE_FORM_DATA_KEY,
  QUOTE_FORM_COMPLETED_KEY,
  REAL_QUOTES_KEY,
  getMedigapStorageKey,
  getAllMedigapStorageKeys,
  ADVANTAGE_QUOTES_KEY,
  DRUG_PLAN_QUOTES_KEY,
  DENTAL_QUOTES_KEY,
  HOSPITAL_INDEMNITY_QUOTES_KEY,
  FINAL_EXPENSE_QUOTES_KEY,
  CANCER_INSURANCE_QUOTES_KEY,
  PlanCardsSkeleton,
  hasQuotes
} from "@/components/medicare-shop/shared";

import {
  MedigapPlanTypeControls,
  MedigapCarrierGroup,
  MedigapResultsHeader,
  PlanComparisonModal
} from "@/components/medicare-shop/medigap";
import MedigapCarrierSkeleton from "@/components/MedigapCarrierSkeleton";

import {
  DentalShopContent,
  DentalSidebar
} from "@/components/medicare-shop/dental";

import {
  CancerInsuranceShopContent,
  CancerInsuranceSidebar
} from "@/components/medicare-shop/chs";

import {
  HospitalIndemnityShopContent,
  HospitalIndemnitySidebar
} from "@/components/medicare-shop/hospital-indemnity";

import {
  FinalExpenseShopContent,
  FinalExpenseSidebar
} from "@/components/medicare-shop/final-expense";

import {
  DrugPlanShopContent,
  DrugPlanSidebar
} from "@/components/medicare-shop/drug-plan";

// Import custom hooks
import { useMedicareState } from "@/hooks/medicare";
import { useLazyQuoteLoading } from "@/hooks/medicare/useLazyQuoteLoading";

// Import extracted components
import MedicareLoadingStates from './MedicareLoadingStates';
import QuoteResultsSection from './QuoteResultsSection';

function MedicareShopContent() {
  // Core navigation hooks
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Use our custom Medicare state management hooks
  const medicareState = useMedicareState();
  const { loadQuotesForCategory } = useLazyQuoteLoading(medicareState);

  // Form data state (keeping this separate as it's form-specific)
  const [quoteFormData, setQuoteFormData] = useState<QuoteFormData>({
    age: "",
    zipCode: '',
    gender: "",
    tobaccoUse: null,
    // Cancer Insurance specific fields
    familyType: '',
    carcinomaInSitu: null,
    premiumMode: '',
    // Dental Insurance specific fields
    coveredMembers: '',
    // Final Expense specific fields
    desiredFaceValue: '',
    desiredRate: '',
    underwritingType: '',
    // Cancer Insurance specific fields  
    benefitAmount: '',
    // State field for cancer insurance
    state: ''
  });

  // Destructure what we need from medicareState for easier access
  const {
    // Quote state
    realQuotes, advantageQuotes, drugPlanQuotes, dentalQuotes,
    hospitalIndemnityQuotes, finalExpenseQuotes, cancerInsuranceQuotes,
    // Quote actions
    setRealQuotes, setAdvantageQuotes, setDrugPlanQuotes, setDentalQuotes,
    setHospitalIndemnityQuotes, setFinalExpenseQuotes, setCancerInsuranceQuotes,
    hasQuotes, getQuotesForCategory,
    // Loading state
    isInitializing, setIsInitializing, isLoadingQuotes, setIsLoadingQuotes,
    showQuoteLoading, setShowQuoteLoading, quotesReady, setQuotesReady,
    loadingItems, setLoadingItems, loadingPlanButton, setLoadingPlanButton,
    expectedQuoteTypes, setExpectedQuoteTypes, startedQuoteTypes, setStartedQuoteTypes,
    completedQuoteTypes, setCompletedQuoteTypes, currentQuoteType, setCurrentQuoteType,
    totalExpectedQuotes, setTotalExpectedQuotes, hasAutoSwitched, setHasAutoSwitched,
    isCategoryLoading,
    // Category management
    selectedCategory, setSelectedCategory, activeCategory, setActiveCategory,
    selectedFlowCategories, setSelectedFlowCategories, handleCategoryToggle, handleCategoryToggleAutomatic, handleCategorySelect,
    // UI state
    showMedicareFlow, setShowMedicareFlow, medicareFlowMode, setMedicareFlowMode,
    showPlanDifferencesModal, setShowPlanDifferencesModal, quotesError, setQuotesError,
  } = medicareState;

  // Optimized category toggle handler for smooth tab switching
  const handleOptimizedCategoryToggle = useCallback(async (category: any) => {
    // Don't reload quotes if we already have them for this category
    const hasExistingQuotes = () => {
      switch (category) {
        case 'medigap': return realQuotes && realQuotes.length > 0;
        case 'advantage': return advantageQuotes && advantageQuotes.length > 0;
        case 'drug-plan': return drugPlanQuotes && drugPlanQuotes.length > 0;
        case 'dental': return dentalQuotes && dentalQuotes.length > 0;
        case 'hospital-indemnity': return hospitalIndemnityQuotes && hospitalIndemnityQuotes.length > 0;
        case 'final-expense': return finalExpenseQuotes && finalExpenseQuotes.length > 0;
        case 'cancer': return cancerInsuranceQuotes && cancerInsuranceQuotes.length > 0;
        default: return false;
      }
    };

    // Call the category toggle without loading callback if we have quotes
    if (hasExistingQuotes()) {
      await handleCategoryToggle(category);
    } else {
      // Only load quotes if we don't have them
      await handleCategoryToggle(category, loadQuotesForCategory);
    }
  }, [handleCategoryToggle, loadQuotesForCategory]);

  // Form completion state (keeping this separate as it's form-specific)
  const [quoteFormCompleted, setQuoteFormCompleted] = useState(false);
  
  // Track when we're recovering an existing session to prevent showing landing page
  const [isRecoveringSession, setIsRecoveringSession] = useState(false);
  
  // Track when initial load is completely finished to prevent auto-switching
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Filter and display state
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedCoverageLevel, setSelectedCoverageLevel] = useState('all');
  // Single source of truth for plan selections - always use this format
  const [selectedQuotePlans, setSelectedQuotePlans] = useState(['F', 'G', 'N']);
  // Track which plans have quotes available (for checkbox display logic)
  // Plan-specific state management (like test-multi-plan working pattern)
  const [planQuotes, setPlanQuotes] = useState<{
    F: any[];
    G: any[];
    N: any[];
  }>({
    F: [],
    G: [],
    N: []
  });

  const [planStates, setPlanStates] = useState<{
    F: { loading: boolean; loaded: boolean; visible: boolean };
    G: { loading: boolean; loaded: boolean; visible: boolean };
    N: { loading: boolean; loaded: boolean; visible: boolean };
  }>({
    F: { loading: false, loaded: false, visible: false },
    G: { loading: false, loaded: false, visible: false },
    N: { loading: false, loaded: false, visible: false }
  });

  // Legacy state - kept for compatibility with other quote types
  const [availableMedigapPlans, setAvailableMedigapPlans] = useState<Record<string, boolean>>({});
  const [applyDiscounts, setApplyDiscounts] = useDiscountState();
  const [paymentMode, setPaymentMode] = useState<'monthly' | 'quarterly' | 'annually'>('monthly');
  const [currentPage, setCurrentPage] = useState(1);
  const [cart, setCart] = useState<any[]>([]);
  const [showPreferredOnly, setShowPreferredOnly] = useState(true);
  const [isPlanLoading, setIsPlanLoading] = useState(false);

  // Wrapper for handleCategorySelect that prevents auto-switching after manual selection
  const handleManualCategorySelect = useCallback((categoryId: string) => {
    // Mark initial load as complete to prevent future auto-switching
    setInitialLoadComplete(true);
    // Call the manual category toggle handler (which WILL update URL)
    handleCategoryToggle(categoryId as any);
  }, [handleCategoryToggle]);

  // Enhanced wrapper that prevents ALL automatic category changes after manual selection
  const handleManualCategoryToggle = useCallback(async (category: any) => {
    // Always mark as manual selection to prevent any auto-switching
    setInitialLoadComplete(true);
    // Call optimized toggle
    await handleOptimizedCategoryToggle(category);
  }, [handleOptimizedCategoryToggle]);
  const [carrierLogos, setCarrierLogos] = useState<Record<string, string>>({});

  // Memoized product categories for dropdown to prevent unnecessary re-renders
  const productCategories = React.useMemo(() => [
    {
      id: 'medigap',
      name: 'Medicare Supplement',
      plans: realQuotes || []
    },
    {
      id: 'advantage',
      name: 'Medicare Advantage',
      plans: advantageQuotes || []
    },
    {
      id: 'drug-plan',
      name: 'Drug Plans',
      plans: drugPlanQuotes || []
    },
    {
      id: 'dental',
      name: 'Dental Insurance',
      plans: dentalQuotes || []
    },
    {
      id: 'cancer',
      name: 'Cancer Insurance',
      plans: cancerInsuranceQuotes || []
    },
    {
      id: 'hospital-indemnity',
      name: 'Hospital Indemnity',
      plans: hospitalIndemnityQuotes || []
    },
    {
      id: 'final-expense',
      name: 'Final Expense Life',
      plans: finalExpenseQuotes || []
    }
  ], [realQuotes, advantageQuotes, drugPlanQuotes, dentalQuotes, cancerInsuranceQuotes, hospitalIndemnityQuotes, finalExpenseQuotes]);

  // Preload carrier logos
  const preloadCarrierLogos = useCallback(async (quotes: any[]) => {
    const logoPromises = quotes.map(async (quote) => {
      if (quote.carrier_id && !carrierLogos[quote.carrier_id]) {
        try {
          const logoUrl = `/carrier-logos/${quote.carrier_id}.png`;
          // Test if the image exists
          const img = document.createElement('img');
          img.src = logoUrl;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          return { [quote.carrier_id]: logoUrl };
        } catch {
          return { [quote.carrier_id]: '/images/carrier-placeholder.svg' };
        }
      }
      return null;
    });

    const logoResults = await Promise.all(logoPromises);
    const newLogos = logoResults.reduce((acc, result) => {
      if (result) return { ...acc, ...result };
      return acc;
    }, {} as Record<string, string>);

    if (newLogos && Object.keys(newLogos).length > 0) {
      setCarrierLogos(prev => ({ ...prev, ...newLogos }));
    }
  }, [carrierLogos]);

  // Save selectedQuotePlans to storage whenever they change (single source of truth)
  useEffect(() => {
    const saveSelectedPlans = async () => {
      if (selectedQuotePlans.length > 0) {
        // Convert to storage format and save
        const storageFormat = selectedQuotePlans.map(plan => `plan-${plan.toLowerCase()}`);
        const currentData = await loadFromStorage(QUOTE_FORM_DATA_KEY, {});
        const updatedData = {
          ...currentData,
          selectedQuotePlans: storageFormat
        };
        await saveToStorage(QUOTE_FORM_DATA_KEY, updatedData);
      }
    };
    
    saveSelectedPlans();
  }, [selectedQuotePlans]);

  // Initialize component with async storage loading
  useEffect(() => {
    let isComponentMounted = true;
    
    const initializeComponent = async () => {
      try {
        
        // Migrate legacy localStorage data if it exists
        await migrateLegacyStorage();
        
        // Check for existing quote session on page refresh
        const hasVisitorId = localStorage.getItem('visitor_id');
        const hasMedicareCategories = localStorage.getItem('medicare_selected_categories');
        const hasActiveCategory = localStorage.getItem('medicare_current_flow_step');
        
        // Check if we have any saved quotes using visitor_id presence
        // visitor_id is only created when quotes are generated, so it's a reliable indicator
        const hasExistingQuotes = !!hasVisitorId;
        
        // If we have all required keys, this is a page refresh with existing session
        // Make session detection more forgiving - visitor_id + categories is sufficient
        const isExistingSession = hasVisitorId && hasMedicareCategories;
        const hasExistingQuoteSession = isExistingSession && hasExistingQuotes;
        
        // Only load form data on initialization - quotes will be loaded lazily
        const savedFormData = await loadFromStorage(QUOTE_FORM_DATA_KEY, null);

        // Load UI state from localStorage (these are lightweight)
        const savedCategories = loadSelectedCategories();
        const savedActiveCategory = loadCurrentFlowStep();

        // Check URL for category parameter - this takes precedence
        const urlCategory = searchParams.get('category');
        const initialCategory = (urlCategory === 'medigap' || urlCategory === 'advantage' || urlCategory === 'drug-plan' || 
                                urlCategory === 'dental' || urlCategory === 'cancer' || urlCategory === 'hospital-indemnity' || 
                                urlCategory === 'final-expense') 
          ? urlCategory 
          : savedActiveCategory || 'medigap'; // Default to 'medigap' if flow step is missing

        if (savedFormData) {
          setQuoteFormData(savedFormData);
          
          // Load any existing medigap quotes from storage
          if (initialCategory === 'medigap') {
            console.log('🔍 Loading existing medigap quotes from storage...');
            await loadAllPlanQuotes();
          }
        }
        if (savedCategories && Array.isArray(savedCategories)) {
          setSelectedFlowCategories(savedCategories);
        }
        
        // For existing sessions with quotes, load all quotes and show results
        if (hasExistingQuoteSession) {
          
          // Set recovery mode and form completed state FIRST
          setIsRecoveringSession(true);
          setQuoteFormCompleted(true);
          medicareState.setShowMedicareFlow(false);
          
          // Ensure the current flow step is saved if missing
          if (!hasActiveCategory && initialCategory) {
            saveCurrentFlowStep(initialCategory);
          }
          
          // Load quotes for selected categories - but do it lazily, one at a time
          if (savedCategories && Array.isArray(savedCategories) && savedCategories.length > 0) {
            // Set expected quote types based on saved categories to enable quotesReady detection
            setExpectedQuoteTypes(savedCategories);
            
            // Only load the first/active category immediately
            const primaryCategory = savedCategories[0];
            if (primaryCategory) {
              // Set the active category BEFORE loading quotes
              setActiveCategory(primaryCategory);
              setSelectedCategory(primaryCategory);
              
              await loadQuotesForCategory(primaryCategory);
              // Don't set quotesReady here - let the existing useEffect handle it when state updates
            }
            // Other categories will be loaded when user switches to them
          }
          
          // Reset recovery mode after quotes are loaded
          setIsRecoveringSession(false);
        } else if (isExistingSession && savedFormData) {
          // For existing sessions with form data but no quotes, they've completed the flow but need to regenerate quotes
          setQuoteFormCompleted(true);
          medicareState.setShowMedicareFlow(false); // This will show the flow selection page
        } else if (initialCategory) {
          // For new sessions or incomplete sessions, load quotes for active category only
          await loadQuotesForCategory(initialCategory);
        }
        
        // Only set categories if we haven't already set them during session recovery
        if (!hasExistingQuoteSession) {
          setActiveCategory(initialCategory);
          setSelectedCategory(initialCategory);
        }
        
        // Check if component is still mounted before setting initialization state
        if (isComponentMounted) {
          setIsInitializing(false);
        }
      } catch (error) {
        console.error('❌ Error during component initialization:', error);
        if (isComponentMounted) {
          setIsInitializing(false);
        }
      }
    };
    
    // Only run initialization once per component mount
    if (!isInitializing) {
      return;
    }
    
    initializeComponent();

    return () => {
      isComponentMounted = false;
      // Cancel all pending requests on unmount
      cancelAllRequests();
    };
  }, []); // Empty dependency array - only run once on mount

  const hasQuotesForPlan = (planType: string) => {
    if (selectedCategory === 'medigap') {
      // Use new plan states pattern for medigap
      return planStates[planType as 'F' | 'G' | 'N']?.loaded || false;
    }
    // Legacy logic for other categories
    return availableMedigapPlans[planType] || realQuotes?.some(quote => quote?.plan === planType) || false;
  };

  // Utility function to update plan availability tracking
  const updatePlanAvailability = useCallback((quotes: any[]) => {
    if (!quotes || quotes.length === 0) {
      setAvailableMedigapPlans({});
      return;
    }
    
    const planTypes = [...new Set(quotes.map(quote => quote?.plan).filter(Boolean))];
    const newAvailability: Record<string, boolean> = {};
    planTypes.forEach(planType => {
      newAvailability[planType] = true;
    });
    
    console.log('📊 Updating plan availability:', newAvailability);
    setAvailableMedigapPlans(prev => ({...prev, ...newAvailability}));
  }, []);

  // Sync plan availability tracking with realQuotes whenever quotes change
  useEffect(() => {
    updatePlanAvailability(realQuotes);
  }, [realQuotes, updatePlanAvailability]);

  // Clear loading state when all requested plans are available OR when we have some plans to show
  useEffect(() => {
    if (isPlanLoading && selectedQuotePlans.length > 0) {
      const allRequestedPlansAvailable = selectedQuotePlans.every(plan => availableMedigapPlans[plan]);
      const hasAnyAvailablePlans = selectedQuotePlans.some(plan => availableMedigapPlans[plan]);
      
      // FIXED: Clear loading if we have ANY available plans to show, not just ALL
      if (allRequestedPlansAvailable || hasAnyAvailablePlans) {
        setIsPlanLoading(false);
      }
    }
  }, [isPlanLoading, selectedQuotePlans, availableMedigapPlans]);

  // Safety: Clear loading state after 2 seconds for individual plan loads (not initial category loads)
  useEffect(() => {
    if (isPlanLoading) {
      const timeout = setTimeout(() => {
        console.warn('⚠️ Clearing stuck loading state after 2 seconds');
        setIsPlanLoading(false);
      }, 2000); // Reduced from 5 seconds to 2 seconds for better UX
      
      return () => clearTimeout(timeout);
    }
  }, [isPlanLoading]);

  // Load quotes from plan-specific storage
  const loadPlanQuotes = useCallback(async (planType: string) => {
    try {
      const storageKey = getMedigapStorageKey(planType);
      const savedQuotes = await loadFromStorage(storageKey, []);
      
      if (savedQuotes && savedQuotes.length > 0) {
        // Update planQuotes state
        setPlanQuotes(prev => ({
          ...prev,
          [planType]: savedQuotes
        }));
        
        // Update plan states
        setPlanStates(prev => ({
          ...prev,
          [planType]: { ...prev[planType as keyof typeof prev], loaded: true, visible: true }
        }));
        
        // Automatically add to selectedQuotePlans if not already there
        setSelectedQuotePlans(prev => {
          if (!prev.includes(planType)) {
            console.log(`✅ Auto-selecting plan ${planType} after loading quotes`);
            return [...prev, planType];
          }
          return prev;
        });
        
        // Also update legacy realQuotes if this is the first plan loaded
        setRealQuotes(prevQuotes => {
          const otherPlans = prevQuotes?.filter(q => q.plan !== planType) || [];
          return [...otherPlans, ...savedQuotes];
        });
        
        console.log(`📥 Loaded ${savedQuotes.length} quotes for plan ${planType} from storage`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`❌ Failed to load quotes for plan ${planType}:`, error);
      return false;
    }
  }, []);

  // Load all available plan quotes from storage
  const loadAllPlanQuotes = useCallback(async () => {
    const planTypes = ['F', 'G', 'N'];
    const loadPromises = planTypes.map(loadPlanQuotes);
    const results = await Promise.all(loadPromises);
    
    const loadedCount = results.filter(Boolean).length;
    console.log(`📥 Loaded quotes for ${loadedCount} plans from storage`);
    
    return loadedCount > 0;
  }, [loadPlanQuotes]);

  const fetchIndividualPlanQuotes = useCallback(async (planType: string, formData?: any) => {
    setLoadingPlanButton(planType);
    
    try {
      // Use provided form data, current state, or stored form data as fallback
      const dataToUse = formData || quoteFormData || loadFromStorage(QUOTE_FORM_DATA_KEY, null);
      
      console.log('🔍 fetchIndividualPlanQuotes - dataToUse:', dataToUse);
      console.log('🔍 fetchIndividualPlanQuotes - planType:', planType);
      
      if (!dataToUse) {
        console.error('❌ No form data found for individual plan quotes');
        return [];
      }

      // Helper function to safely convert age
      const getSafeAge = (age: number | ''): number => {
        if (typeof age === 'number' && !isNaN(age)) {
          return age;
        }
        if (typeof age === 'string' && age.trim() !== '') {
          const parsedAge = parseInt(age);
          if (!isNaN(parsedAge)) {
            return parsedAge;
          }
        }
        // Return default age if invalid
        return 65;
      };

      // Handle individual medigap plan letters (F, G, N)
      if (['F', 'G', 'N'].includes(planType)) {
        console.log(`🔥 Fetching individual plan ${planType}...`);
        
        // Set expected quote type for loading detection
        const planDisplayName = `Plan ${planType}`;
        setExpectedQuoteTypes(prev => {
          if (!prev.includes(planDisplayName)) {
            return [...prev, planDisplayName];
          }
          return prev;
        });
        
        // Convert form data to API format for getMedigapQuotes
        const quoteParams = {
          zipCode: dataToUse.zipCode,
          age: getSafeAge(dataToUse.age).toString(),
          gender: dataToUse.gender === 'male' ? 'M' as const : 'F' as const,
          tobacco: dataToUse.tobaccoUse ? "1" as const : "0" as const,
          plans: [planType], // Just this single plan
        };

        console.log('Fetching individual plan with params:', quoteParams);
        
        const response = await getMedigapQuotes(quoteParams);
        
        if (response?.quotes && response.quotes.length > 0) {
          console.log(`✅ Got ${response.quotes.length} quotes for plan ${planType}`);
          
          // Preload carrier logos
          await preloadCarrierLogos(response.quotes);
          
          // Add to existing quotes instead of replacing them
          const existingQuotes = realQuotes || [];
          console.log(`🔍 Before adding ${planType}:`, {
            existingQuotes: existingQuotes.length,
            existingPlans: existingQuotes.map(q => q?.plan).filter(Boolean),
            planTypeBeingAdded: planType
          });
          
          const planQuotes = response.quotes.filter(quote => quote?.plan === planType);
          console.log(`🔍 New quotes for ${planType}:`, planQuotes.length, planQuotes.map(q => q?.plan));
          
          // Remove any existing quotes for this plan type to avoid duplicates
          const otherQuotes = existingQuotes.filter(quote => quote?.plan !== planType);
          console.log(`🔍 Other quotes after filtering:`, {
            otherQuotesCount: otherQuotes.length,
            otherPlans: otherQuotes.map(q => q?.plan).filter(Boolean)
          });
          
          const updatedQuotes = [...otherQuotes, ...planQuotes];
          console.log(`🔍 Final updated quotes:`, {
            totalCount: updatedQuotes.length,
            allPlans: updatedQuotes.map(q => q?.plan).filter(Boolean)
          });
          
          // FIXED: Update all state values atomically to prevent inconsistent state
          React.startTransition(() => {
            // Update the legacy quotes state (for compatibility)
            setRealQuotes(updatedQuotes);
            
            // Update plan-specific quotes state (primary data store)
            setPlanQuotes(prev => ({
              ...prev,
              [planType]: response.quotes
            }));
            
            // Update plan states
            setPlanStates(prev => ({
              ...prev,
              [planType]: { loading: false, loaded: true, visible: true }
            }));
            
            // Update plan availability tracking immediately in same transition
            setAvailableMedigapPlans(prev => ({
              ...prev,
              [planType]: true
            }));
            
            // Automatically add to selectedQuotePlans if not already there
            setSelectedQuotePlans(prev => {
              if (!prev.includes(planType)) {
                console.log(`✅ Auto-selecting plan ${planType} after fetching quotes`);
                return [...prev, planType];
              }
              return prev;
            });
          });
          
          // Save to plan-specific storage
          const storageKey = getMedigapStorageKey(planType);
          await saveToStorage(storageKey, response.quotes);
          
          // Add this plan to selected plans if not already there
          if (!selectedQuotePlans.includes(planType)) {
            const newSelectedPlans = [...selectedQuotePlans, planType];
            setSelectedQuotePlans(newSelectedPlans);
            // Note: selectedQuotePlans will be automatically saved via useEffect
          }
          
          // Mark this individual plan as completed
          const planDisplayName = `Plan ${planType}`;
          setCompletedQuoteTypes(prev => {
            if (!prev.includes(planDisplayName)) {
              return [...prev, planDisplayName];
            }
            return prev;
          });
          
          console.log(`✅ Added plan ${planType} to quote collection`);
          return updatedQuotes;
        } else {
          console.error(`❌ No quotes returned for plan ${planType}`);
          
          // Clean up expected quote types when no quotes returned
          const planDisplayName = `Plan ${planType}`;
          setExpectedQuoteTypes(prev => prev.filter(type => type !== planDisplayName));
          
          return [];
        }
      } 
      // Handle quote type categories (supplement, advantage)
      else if (planType === 'supplement') {
        // Use current selected plans or default
        const currentPlans = selectedQuotePlans.length > 0 ? selectedQuotePlans : ['F', 'G', 'N'];
        const planNames = currentPlans.length > 1 
          ? ['Supplement Plans'] 
          : currentPlans.map((plan: string) => {
              const planLetter = plan.replace('plan-', '').toUpperCase();
              return `Plan ${planLetter}`;
            });
        setLoadingItems(planNames);
        
        const result = await getMedigapQuotes(dataToUse);
        
        if (result?.quotes && result.quotes.length > 0) {
          await preloadCarrierLogos(result.quotes);
          setRealQuotes(result.quotes);
          
          // Update plan availability tracking
          updatePlanAvailability(result.quotes);
          
          // Save Medigap quotes to plan-specific Firebase collections and update state
          if (result.quotes && result.quotes.length > 0) {
            const quotesByPlan = new Map<string, any[]>();
            
            // Group quotes by plan type
            result.quotes.forEach((quote: any) => {
              const plan = quote?.plan;
              if (plan) {
                if (!quotesByPlan.has(plan)) {
                  quotesByPlan.set(plan, []);
                }
                quotesByPlan.get(plan)!.push(quote);
              }
            });
            
            // Update planQuotes state
            React.startTransition(() => {
              const updatedPlanQuotes = { ...planQuotes };
              const updatedPlanStates = { ...planStates };
              
              Array.from(quotesByPlan.entries()).forEach(([plan, quotes]) => {
                if (plan in updatedPlanQuotes) {
                  updatedPlanQuotes[plan as keyof typeof updatedPlanQuotes] = quotes;
                  updatedPlanStates[plan as keyof typeof updatedPlanStates] = {
                    loading: false,
                    loaded: true,
                    visible: true
                  };
                }
              });
              
              setPlanQuotes(updatedPlanQuotes);
              setPlanStates(updatedPlanStates);
              
              // Auto-select plans that have quotes loaded
              setSelectedQuotePlans(prev => {
                const newPlans = Array.from(quotesByPlan.keys()).filter(plan => !prev.includes(plan));
                if (newPlans.length > 0) {
                  console.log(`✅ Auto-selecting plans after bulk loading: ${newPlans.join(', ')}`);
                  return [...prev, ...newPlans];
                }
                return prev;
              });
            });
            
            // Save each plan's quotes to its own collection
            const savePromises = Array.from(quotesByPlan.entries()).map(([plan, quotes]) => {
              const storageKey = getMedigapStorageKey(plan);
              return saveToStorage(storageKey, quotes);
            });
            
            await Promise.all(savePromises);
          }
          // Removed auto-switching - only update quotes, let user manually switch tabs
          return result.quotes;
        }
      } else if (planType === 'advantage') {
        setLoadingItems(['Medicare Advantage Plans']);
        
        const result = await getMedicareAdvantageQuotes(dataToUse);
        
        if (result?.quotes && result.quotes.length > 0) {
          await preloadCarrierLogos(result.quotes);
          setAdvantageQuotes(result.quotes);
          // Save Medicare Advantage quotes to Firebase storage
          await saveToStorage(ADVANTAGE_QUOTES_KEY, result.quotes);
          // Removed auto-switching - only update quotes, let user manually switch tabs
          return result.quotes;
        }
      } else if (planType === 'drug-plan') {
        setLoadingItems(['Drug Plans']);
        
        const result = await getDrugPlanQuotes(dataToUse);
        
        if (result?.quotes && result.quotes.length > 0) {
          await preloadCarrierLogos(result.quotes);
          setDrugPlanQuotes(result.quotes);
          // Save Drug Plan quotes to Firebase storage
          await saveToStorage(DRUG_PLAN_QUOTES_KEY, result.quotes);
          // Removed auto-switching - only update quotes, let user manually switch tabs
          return result.quotes;
        }
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching ${planType} quotes:`, error);
      
      // Clean up expected quote types for individual plans that failed
      if (['F', 'G', 'N'].includes(planType)) {
        const planDisplayName = `Plan ${planType}`;
        setExpectedQuoteTypes(prev => prev.filter(type => type !== planDisplayName));
      }
      
      return [];
    } finally {
      setLoadingPlanButton(null);
      setLoadingItems([]); // Clear loading items when individual fetch is complete
    }
  }, [preloadCarrierLogos, quoteFormData]);

  // Memoized wrapper function for component compatibility
  const handleFetchQuotes = useCallback((planType: string) => {
    fetchIndividualPlanQuotes(planType);
  }, [fetchIndividualPlanQuotes]);

  // Simple optimization: Only save quotes when they're actually new or changed significantly
  const [lastSaveTimestamp, setLastSaveTimestamp] = useState<{[key: string]: number}>({});
  
  // Helper to check if we should save (avoid excessive saves)
  const shouldSaveQuotes = useCallback((key: string, quotes: any[]): boolean => {
    if (quotes.length === 0) return false;
    
    const now = Date.now();
    const lastSave = lastSaveTimestamp[key] || 0;
    const timeSinceLastSave = now - lastSave;
    
    // Only save if it's been at least 30 seconds since last save for this key
    // OR if this is the first time we have quotes
    return timeSinceLastSave > 30000 || lastSave === 0;
  }, [lastSaveTimestamp]);

  // Optimized save function
  const saveQuotesIfNeeded = useCallback(async (key: string, quotes: any[]) => {
    if (shouldSaveQuotes(key, quotes)) {
      await saveToStorage(key, quotes);
      setLastSaveTimestamp(prev => ({ ...prev, [key]: Date.now() }));
    }
  }, [shouldSaveQuotes]);

  // Check if all expected quotes are ready
  useEffect(() => {
    if (expectedQuoteTypes.length === 0) return;
    
    const hasAllExpectedQuotes = expectedQuoteTypes.every(type => {
      if (type === 'medigap') return realQuotes.length > 0;
      if (type === 'advantage') return advantageQuotes.length > 0;
      if (type === 'drug-plan') return drugPlanQuotes.length > 0;
      if (type === 'dental') return dentalQuotes.length > 0;
      if (type === 'hospital-indemnity') return hospitalIndemnityQuotes.length > 0;
      if (type === 'final-expense') return finalExpenseQuotes.length > 0;
      if (type === 'cancer') return cancerInsuranceQuotes.length > 0;
      return false;
    });
    
    if (hasAllExpectedQuotes && !quotesReady) {
      setQuotesReady(true);
    }
  }, [realQuotes, advantageQuotes, drugPlanQuotes, dentalQuotes, hospitalIndemnityQuotes, finalExpenseQuotes, cancerInsuranceQuotes, expectedQuoteTypes, quotesReady]);

  // Debug render conditions
  useEffect(() => {
    console.log('🔍 Render Debug:', {
      isInitializing,
      showQuoteLoading,
      selectedCategory,
      activeCategory,
      showMedicareFlow,
      hasQuotes: hasQuotes(),
      isRecoveringSession,
      realQuotesLength: realQuotes.length,
      quotesReady,
      renderCondition: hasQuotes() || isRecoveringSession || realQuotes.length > 0,
      realQuotesFirstItem: realQuotes[0]
    });
  }, [isInitializing, showQuoteLoading, selectedCategory, activeCategory, showMedicareFlow, isRecoveringSession, realQuotes.length, quotesReady, realQuotes]);

  // Auto-hide loading page when quotes are ready
  useEffect(() => {
    if (quotesReady && showQuoteLoading) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setShowQuoteLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [quotesReady, showQuoteLoading]);

  // Failsafe: Auto-hide loading page if it's been showing for too long
  useEffect(() => {
    if (showQuoteLoading) {
      // Set a 30-second timeout to automatically hide loading page
      const failsafeTimer = setTimeout(() => {
        console.warn('Loading page timeout reached - forcing transition to results');
        setShowQuoteLoading(false);
      }, 30000); // 30 seconds

      return () => clearTimeout(failsafeTimer);
    }
  }, [showQuoteLoading]);

  // Cleanup effect: Cancel all pending requests when component unmounts or category changes
  useEffect(() => {
    return () => {
      // Cancel all pending Firestore requests to prevent race conditions
      cancelAllRequests();
    };
  }, [activeCategory]); // Cancel when category changes

  // Load quotes when selectedQuotePlans changes
  useEffect(() => {
    const loadQuotesForSelectedPlans = async () => {
      if (selectedQuotePlans.length === 0) return;
      
      for (const planType of selectedQuotePlans) {
        // Check if we already have quotes for this plan
        const currentQuotes = planQuotes[planType as keyof typeof planQuotes];
        if (!currentQuotes || currentQuotes.length === 0) {
          console.log(`📥 Loading stored quotes for plan ${planType}...`);
          await loadPlanQuotes(planType);
        }
      }
    };
    
    loadQuotesForSelectedPlans();
  }, [selectedQuotePlans, loadPlanQuotes, planQuotes]);

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      // Cancel all pending requests on unmount
      cancelAllRequests();
    };
  }, []);

  // Handle quote form submission
  const handleQuoteFormSubmit = async () => {
    // Use the conditional validation by calling handleQuoteFormSubmitWithData
    // Force refresh when user explicitly submits the form
    await handleQuoteFormSubmitWithData(quoteFormData, selectedCategory, undefined, true, true);
  };

  // Handle quote form submission with specific form data (for async state issues)
  const handleQuoteFormSubmitWithData = async (formData: QuoteFormData, category?: string, plansList?: string[], manageLoadingState: boolean = true, forceRefresh: boolean = false) => {
    const targetCategory = category || selectedCategory;
    
    // Helper function to safely convert age
    const getSafeAge = (age: number | ''): number => {
      if (typeof age === 'number' && !isNaN(age)) {
        return age;
      }
      if (typeof age === 'string' && age.trim() !== '') {
        const parsedAge = parseInt(age);
        if (!isNaN(parsedAge)) {
          return parsedAge;
        }
      }
      throw new Error(`Invalid age provided: ${age} (type: ${typeof age})`);
    };
    
    // Conditional validation based on category (like in backup)
    let requiredFields: string[];
    if (targetCategory === 'advantage' || targetCategory === 'drug-plan' || 
        targetCategory === 'dental' || targetCategory === 'hospital-indemnity' || 
        targetCategory === 'final-expense') {
      // Medicare Advantage, Drug Plans, and additional insurance products only require ZIP code
      requiredFields = ['zipCode'];
    } else if (targetCategory === 'cancer') {
      // Cancer insurance doesn't require zipCode, only uses hardcoded state (TX)
      requiredFields = ['age', 'gender', 'tobaccoUse'];
    } else {
      // Medigap and other categories require all fields
      requiredFields = ['age', 'zipCode', 'gender', 'tobaccoUse'];
    }
    
    const missingFields = requiredFields.filter(field => {
      const value = formData[field as keyof QuoteFormData];
      return value === '' || value === null || value === undefined;
    });

    console.log('🔥 Required fields for', targetCategory, ':', requiredFields);
    console.log('🔥 Missing fields:', missingFields);

    if (missingFields.length > 0) {
      console.log('🔥 Validation failed - missing:', missingFields);
      alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }

    console.log('🔥 Validation passed, starting quote fetch...');
    if (manageLoadingState) {
      setIsLoadingQuotes(true);
    }
    setQuotesReady(false); // Reset quotes ready state when starting new request
    setQuotesError(null);
    
    // Set expected quote types for category-specific loading indicators (always do this)
    let categoryQuoteTypes: string[] = [];
    if (targetCategory === 'medigap') {
      const plansToFetch = plansList || selectedQuotePlans;
      categoryQuoteTypes = plansToFetch.length > 1 
        ? ['Supplement Plans'] 
        : plansToFetch.map(plan => {
            const planLetter = plan.replace('plan-', '').toUpperCase();
            return `Plan ${planLetter}`;
          });
    } else if (targetCategory === 'advantage') {
      categoryQuoteTypes = ['Medicare Advantage Plans'];
    } else if (targetCategory === 'drug-plan') {
      categoryQuoteTypes = ['Drug Plans'];
    } else if (targetCategory === 'dental') {
      categoryQuoteTypes = ['Dental Insurance'];
    } else if (targetCategory === 'cancer') {
      categoryQuoteTypes = ['Cancer Insurance'];
    } else if (targetCategory === 'hospital-indemnity') {
      categoryQuoteTypes = ['Hospital Indemnity'];
    } else if (targetCategory === 'final-expense') {
      categoryQuoteTypes = ['Final Expense Life'];
    }

    // Set expected quote types for category loading detection
    setExpectedQuoteTypes(prev => [...new Set([...prev, ...categoryQuoteTypes])]);
    
    // Set global loading items only if managing global state
    if (manageLoadingState) {
      setLoadingItems(categoryQuoteTypes);
    }
    
    // Clear quotes for the specific category only if we're going to fetch new ones
    // Don't clear if quotes already exist and we're just switching categories
    if (manageLoadingState) {
      // Check if we should preserve existing quotes
      const shouldClearQuotes = forceRefresh || (() => {
        // Check if we already have quotes for this category
        switch (targetCategory) {
          case 'medigap': return realQuotes.length === 0;
          case 'advantage': return advantageQuotes.length === 0;
          case 'drug-plan': return drugPlanQuotes.length === 0;
          case 'dental': return dentalQuotes.length === 0;
          case 'cancer': return cancerInsuranceQuotes.length === 0;
          case 'hospital-indemnity': return hospitalIndemnityQuotes.length === 0;
          case 'final-expense': return finalExpenseQuotes.length === 0;
          default: return true;
        }
      })();
      
      if (shouldClearQuotes) {
        if (targetCategory === 'medigap') {
          setRealQuotes([]);
          setAvailableMedigapPlans({}); // Clear tracking when clearing quotes
        } else if (targetCategory === 'advantage') {
          setAdvantageQuotes([]);
        } else if (targetCategory === 'drug-plan') {
          setDrugPlanQuotes([]);
        } else if (targetCategory === 'dental') {
          setDentalQuotes([]);
        } else if (targetCategory === 'cancer') {
          setCancerInsuranceQuotes([]);
        } else if (targetCategory === 'hospital-indemnity') {
          setHospitalIndemnityQuotes([]);
        } else if (targetCategory === 'final-expense') {
          setFinalExpenseQuotes([]);
        }
      } else {
        console.log(`🔄 Preserving existing ${targetCategory} quotes (${
          targetCategory === 'medigap' ? realQuotes.length :
          targetCategory === 'advantage' ? advantageQuotes.length :
          targetCategory === 'drug-plan' ? drugPlanQuotes.length :
          targetCategory === 'dental' ? dentalQuotes.length :
          targetCategory === 'cancer' ? cancerInsuranceQuotes.length :
          targetCategory === 'hospital-indemnity' ? hospitalIndemnityQuotes.length :
          targetCategory === 'final-expense' ? finalExpenseQuotes.length : 0
        } quotes)`);
      }
    }
    
    try {
      // Check if we should skip fetching and just return existing quotes
      const hasExistingQuotes = (() => {
        switch (targetCategory) {
          case 'medigap': return realQuotes.length > 0;
          case 'advantage': return advantageQuotes.length > 0;
          case 'drug-plan': return drugPlanQuotes.length > 0;
          case 'dental': return dentalQuotes.length > 0;
          case 'cancer': return cancerInsuranceQuotes.length > 0;
          case 'hospital-indemnity': return hospitalIndemnityQuotes.length > 0;
          case 'final-expense': return finalExpenseQuotes.length > 0;
          default: return false;
        }
      })();
      
      if (hasExistingQuotes && !forceRefresh) {
        console.log(`✅ Using existing ${targetCategory} quotes, skipping API call`);
        // Mark as completed and ready
        setQuoteFormCompleted(true);
        setQuotesReady(true);
        if (manageLoadingState) {
          setIsLoadingQuotes(false);
          setLoadingItems([]);
        }
        return; // Exit early with existing quotes
      }
      
      // Only get quotes for the specified category
      if (targetCategory === 'medigap') {
        console.log('🔥 Category is medigap, proceeding with API call...');
        const plansToFetch = plansList || selectedQuotePlans;
        console.log('🔥 Selected quote plans to fetch:', plansToFetch);
        
        // Set current quote type based on number of plans
        if (plansToFetch.length > 1) {
          setCurrentQuoteType('Supplement Plans');
        } else {
          // Handle both old format (plan-x) and new format (X) for single plan
          const planLetter = plansToFetch[0].includes('plan-') 
            ? plansToFetch[0].replace('plan-', '').toUpperCase()
            : plansToFetch[0].toUpperCase();
          setCurrentQuoteType(`Plan ${planLetter}`);
        }
        
        // Convert form data to API format for our enhanced getMedigapQuotes action
        const quoteParams = {
          zipCode: formData.zipCode,
          age: getSafeAge(formData.age).toString(),
          gender: formData.gender === 'male' ? 'M' as const : 'F' as const,
          tobacco: formData.tobaccoUse ? "1" as const : "0" as const,
          plans: plansToFetch.length > 0 
            ? plansToFetch.map(plan => plan.includes('plan-') ? plan.replace('plan-', '').toUpperCase() : plan.toUpperCase())
            : ['F', 'G', 'N'], // Use selected plans from parameter or state, converting format if needed
        };

        console.log('Fetching Medigap quotes with params:', quoteParams);
        
        const response = await getMedigapQuotes(quoteParams);
        
        console.log('🔥 API Response:', response);
        
        if (response.error) {
          console.log('🔥 API Error:', response.error);
          setQuotesError(response.error);
        } else if (response.quotes && Array.isArray(response.quotes)) {
          console.log('🔥 Success! Received quotes:', response.quotes.length);
          setRealQuotes(response.quotes);
          
          // Update plan availability tracking
          updatePlanAvailability(response.quotes);
          
          // Save Medigap quotes to plan-specific Firebase collections
          try {
            if (response.quotes && response.quotes.length > 0) {
              const quotesByPlan = new Map<string, any[]>();
              
              // Group quotes by plan type
              response.quotes.forEach((quote: any) => {
                const plan = quote?.plan;
                if (plan) {
                  if (!quotesByPlan.has(plan)) {
                    quotesByPlan.set(plan, []);
                  }
                  quotesByPlan.get(plan)!.push(quote);
                }
              });
              
              // Update planQuotes state
              React.startTransition(() => {
                const updatedPlanQuotes = { ...planQuotes };
                const updatedPlanStates = { ...planStates };
                
                Array.from(quotesByPlan.entries()).forEach(([plan, quotes]) => {
                  if (plan in updatedPlanQuotes) {
                    updatedPlanQuotes[plan as keyof typeof updatedPlanQuotes] = quotes;
                    updatedPlanStates[plan as keyof typeof updatedPlanStates] = {
                      loading: false,
                      loaded: true,
                      visible: true
                    };
                  }
                });
                
                setPlanQuotes(updatedPlanQuotes);
                setPlanStates(updatedPlanStates);
                
                // Auto-select plans that have quotes loaded
                setSelectedQuotePlans(prev => {
                  const newPlans = Array.from(quotesByPlan.keys()).filter(plan => !prev.includes(plan));
                  if (newPlans.length > 0) {
                    console.log(`✅ Auto-selecting plans after bulk quote fetch: ${newPlans.join(', ')}`);
                    return [...prev, ...newPlans];
                  }
                  return prev;
                });
              });
              
              // Save each plan's quotes to its own collection
              const savePromises = Array.from(quotesByPlan.entries()).map(([plan, quotes]) => {
                const storageKey = getMedigapStorageKey(plan);
                return saveToStorage(storageKey, quotes);
              });
              
              await Promise.all(savePromises);
              console.log('💾 Medigap quotes saved to plan-specific Firebase collections');
            }
          } catch (error) {
            console.error('❌ Failed to save Medigap quotes to Firebase:', error);
          }
          
          // Mark medigap plans as completed (use same logic as loading items)
          const completedPlans = plansToFetch.length > 1 
            ? ['Supplement Plans'] 
            : plansToFetch.map(plan => {
                const planLetter = plan.replace('plan-', '').toUpperCase();
                return `Plan ${planLetter}`;
              });
          setCompletedQuoteTypes(prev => [...prev, ...completedPlans]);
          setCurrentQuoteType(null);
          
          console.log(`Received ${response.quotes.length} Medigap quotes`);
          
          // Preload carrier logos for better user experience
          preloadCarrierLogos(response.quotes);
        }
      } else if (targetCategory === 'advantage') {
        console.log('🔥 Category is advantage, proceeding with API call...');
        
        setCurrentQuoteType('Medicare Advantage Plans');
        
        const response = await getMedicareAdvantageQuotes(formData);
        console.log('🔥 Advantage API Response:', response);
        
        if (response.error) {
          console.log('🔥 Advantage API Error:', response.error);
          setQuotesError(response.error);
        } else if (response.quotes && Array.isArray(response.quotes)) {
          console.log('🔥 Success! Received advantage quotes:', response.quotes.length);
          setAdvantageQuotes(response.quotes);
          
          // Save advantage quotes to Firebase storage
          try {
            await saveToStorage(ADVANTAGE_QUOTES_KEY, response.quotes);
            console.log('💾 Advantage quotes saved to Firebase storage');
          } catch (error) {
            console.error('❌ Failed to save advantage quotes to Firebase:', error);
          }
          
          // Mark Medicare Advantage as completed
          setCompletedQuoteTypes(prev => [...prev, 'Medicare Advantage Plans']);
          setCurrentQuoteType(null);
          
          // Preload carrier logos for better user experience
          preloadCarrierLogos(response.quotes);
        }
      } else if (targetCategory === 'drug-plan') {
        console.log('🔥 Category is drug-plan, proceeding with API call...');
        
        setCurrentQuoteType('Drug Plans');
        
        const response = await getDrugPlanQuotes(formData);
        console.log('🔥 Drug Plan API Response:', response);
        
        if (response.error) {
          console.log('🔥 Drug Plan API Error:', response.error);
          setQuotesError(response.error);
        } else if (response.quotes && Array.isArray(response.quotes)) {
          console.log('🔥 Success! Received drug plan quotes:', response.quotes.length);
          setDrugPlanQuotes(response.quotes);
          
          // Save drug plan quotes to Firestore with optimization
          saveQuotesIfNeeded(DRUG_PLAN_QUOTES_KEY, response.quotes);
          
          // Mark Drug Plans as completed
          setCompletedQuoteTypes(prev => [...prev, 'Drug Plans']);
          setCurrentQuoteType(null);
          
          // Preload carrier logos for better user experience
          preloadCarrierLogos(response.quotes);
        }
      } else if (targetCategory === 'dental') {
        console.log('🔥 Category is dental, proceeding with API call...');
        
        setCurrentQuoteType('Dental Insurance');
        
        // Only send necessary parameters for dental quotes
        const dentalParams = {
          age: getSafeAge(formData.age),
          zipCode: formData.zipCode,
          gender: formData.gender,
          tobaccoUse: formData.tobaccoUse || false,
          coveredMembers: formData.coveredMembers ? parseInt(formData.coveredMembers) : 1
        };
        
        const response = await getDentalQuotes(dentalParams);
        console.log('🔥 Dental API Response:', response);
        
        if (response.error) {
          console.log('🔥 Dental API Error:', response.error);
          setQuotesError(response.error);
        } else if (response.quotes && Array.isArray(response.quotes)) {
          console.log('🔥 Success! Received dental quotes:', response.quotes.length);
          
          // Optimize dental quotes before storing to prevent localStorage bloat
          console.log('🎯 Optimizing dental quotes for storage...');
          const optimizationResult = optimizeDentalQuotes(response);
          
          if (optimizationResult.success) {
            setDentalQuotes(optimizationResult.quotes);
            
            // Save optimized dental quotes using Firebase storage (same as other quotes)
            try {
              await saveToStorage(DENTAL_QUOTES_KEY, optimizationResult.quotes);
              console.log('💾 Optimized dental quotes saved to Firebase storage');
            } catch (error) {
              console.error('❌ Failed to save dental quotes to Firebase:', error);
              // Fallback to localStorage-only storage
              const saveSuccess = saveDentalQuotesToStorage(
                optimizationResult.quotes,
                dentalParams,
                {
                  originalSize: optimizationResult.originalSize,
                  optimizedSize: optimizationResult.optimizedSize,
                  compressionRatio: optimizationResult.compressionRatio
                }
              );
              if (saveSuccess) {
                console.log('💾 Dental quotes saved to localStorage as fallback');
              }
            }
            
            // Mark Dental Insurance as completed
            setCompletedQuoteTypes(prev => [...prev, 'Dental Insurance']);
            setCurrentQuoteType(null);
            
            // Set quotes as ready if this is the only expected type
            if (expectedQuoteTypes.length === 1 && expectedQuoteTypes.includes('dental')) {
              setQuotesReady(true);
            }
            
            // Removed auto-navigation to dental tab - let user manually switch
            // Only preload carrier logos for better user experience when they do switch
            preloadCarrierLogos(optimizationResult.quotes);
          } else {
            console.error('❌ Dental quotes optimization failed:', optimizationResult.error);
            // Fallback: Try to optimize quotes individually with 2025 filtering
            try {
              const filtered2025Quotes = filter2025Quotes(response.quotes);
              const fallbackQuotes = filtered2025Quotes.map((quote: any) => {
                  const basePlan = quote.base_plans?.find((plan: any) => plan.included) || quote.base_plans?.[0];
                  const mainBenefit = basePlan?.benefits?.[0];
                  
                  return {
                    id: quote.key || '',
                    planName: quote.plan_name || '',
                    fullPlanName: basePlan?.name || '',
                    companyName: quote.company_base?.name || '',
                    companyFullName: quote.company_base?.name_full || '',
                    annualMaximum: parseInt(mainBenefit?.amount || '0'),
                    monthlyPremium: mainBenefit?.rate || 0,
                    state: quote.state || '',
                    benefitNotes: basePlan?.benefit_notes || '',
                    limitationNotes: basePlan?.limitation_notes || '',
                    ambestRating: quote.company_base?.ambest_rating || '',
                    ambestOutlook: quote.company_base?.ambest_outlook || '',
                    productKey: quote.product_key || '',
                    age: quote.age || 0,
                    gender: quote.gender,
                    tobacco: quote.tobacco
                  } as OptimizedDentalQuote;
                });
              console.log(`🎯 Fallback: Filtered to ${fallbackQuotes.length} quotes (2025 only)`);
              setDentalQuotes(fallbackQuotes);
              await saveToStorage(DENTAL_QUOTES_KEY, fallbackQuotes);
            } catch (fallbackError) {
              console.error('❌ Fallback dental quote processing failed:', fallbackError);
              setDentalQuotes([]);
            }
            
            // Mark Dental Insurance as completed
            setCompletedQuoteTypes(prev => [...prev, 'Dental Insurance']);
            setCurrentQuoteType(null);
            
            // Set quotes as ready if this is the only expected type
            if (expectedQuoteTypes.length === 1 && expectedQuoteTypes.includes('dental')) {
              setQuotesReady(true);
            }
            
            // Removed auto-navigation to dental tab - let user manually switch
            // Only preload carrier logos for better user experience when they do switch
            preloadCarrierLogos(response.quotes);
          }
        } else {
          console.log('🔥 No dental quotes found');
          setQuotesError('No dental insurance plans found for your area and criteria');
        }
      } else if (targetCategory === 'cancer') {
        console.log('🔥 Category is cancer, proceeding with API call...');
        
        setCurrentQuoteType('Cancer Insurance');
        
        // Convert formData to CancerInsuranceQuoteParams format - using actual form data
        const validCancerStates = ['TX', 'GA'] as const;
        const cancerState = validCancerStates.includes(formData.state as any) ? formData.state as 'TX' | 'GA' : 'TX';
        
        const cancerParams = {
          state: cancerState,
          age: getSafeAge(formData.age),
          familyType: formData.familyType === 'family' ? 'Applicant and Spouse' as const : 'Applicant Only' as const,
          tobaccoStatus: formData.tobaccoUse ? 'Tobacco' as const : 'Non-Tobacco' as const,
          premiumMode: formData.premiumMode === 'annual' ? 'Annual' as const : 'Monthly Bank Draft' as const,
          carcinomaInSitu: formData.carcinomaInSitu ? '100%' as const : '25%' as const,
          benefitAmount: 25000 // Use standard benefit amount
        };
        
        const response = await getCancerInsuranceQuotes(cancerParams);
        console.log('🔥 Cancer Insurance API Response:', response);
        
        if (response.error) {
          console.log('🔥 Cancer Insurance API Error:', response.error);
          setQuotesError(response.error);
        } else if (response.quotes && Array.isArray(response.quotes)) {
          console.log('🔥 Success! Received cancer insurance quotes:', response.quotes.length);
          setCancerInsuranceQuotes(response.quotes);
          
          // Save cancer insurance quotes to Firestore
          console.log('� Saving cancer insurance quotes to Firestore:', response.quotes.length, 'quotes');
          await saveToStorage(CANCER_INSURANCE_QUOTES_KEY, response.quotes);
          
          // Log storage usage after saving cancer quotes
          const storageInfo = await getFirestoreStorageInfo();
          console.log('📊 Firestore usage after cancer quotes:', storageInfo.readable);
          
          // Mark Cancer Insurance as completed
          setCompletedQuoteTypes(prev => [...prev, 'Cancer Insurance']);
          setCurrentQuoteType(null);
          
          // Preload carrier logos for better user experience
          preloadCarrierLogos(response.quotes);
        }
      } else if (targetCategory === 'hospital-indemnity') {
        console.log('🔥 Category is hospital-indemnity, proceeding with API call...');
        
        setCurrentQuoteType('Hospital Indemnity');
        
        // Convert formData to HospitalIndemnityQuoteParams format
        const hospitalParams = {
          zipCode: formData.zipCode,
          age: getSafeAge(formData.age),
          gender: formData.gender === 'male' ? 'M' as const : 'F' as const,
          tobaccoUse: formData.tobaccoUse || false
        };
        
        console.log('🏥 Hospital Indemnity params being sent:', hospitalParams);
        
        const response = await getHospitalIndemnityQuotes(hospitalParams);
        console.log('🔥 Hospital Indemnity API Response:', response);
        
        if (response.error) {
          console.log('🔥 Hospital Indemnity API Error:', response.error);
          setQuotesError(response.error);
        } else if (response.quotes && Array.isArray(response.quotes)) {
          console.log('🔥 Success! Received hospital indemnity quotes:', response.quotes.length);
          
          // Optimize the hospital indemnity quotes and filter for 2025
          const optimizationResult = optimizeHospitalIndemnityQuotes(response.quotes);
          console.log('📊 Hospital indemnity optimization complete:', optimizationResult.length);
          
          setHospitalIndemnityQuotes(optimizationResult);
          
          // Save optimized hospital indemnity quotes to Firestore
          await saveToStorage(HOSPITAL_INDEMNITY_QUOTES_KEY, optimizationResult);
          
          // Mark Hospital Indemnity as completed
          setCompletedQuoteTypes(prev => [...prev, 'Hospital Indemnity']);
          setCurrentQuoteType(null);
          
          // Preload carrier logos for better user experience
          preloadCarrierLogos(optimizationResult);
        }
      } else if (targetCategory === 'final-expense') {
        console.log('🔥 Category is final-expense, proceeding with API call...');
        
        setCurrentQuoteType('Final Expense Life');
        
        // Convert formData to simplified FinalExpenseQuoteParams format
        const finalExpenseParams = {
          zipCode: formData.zipCode,
          age: getSafeAge(formData.age),
          gender: formData.gender === 'male' ? 'M' as const : 'F' as const,
          tobaccoUse: formData.tobaccoUse || false,
          desiredFaceValue: formData.desiredFaceValue ? parseInt(formData.desiredFaceValue) : 10000,
          desiredRate: formData.desiredRate ? parseFloat(formData.desiredRate) : undefined,
          // Only include underwritingType if user has a specific preference (not "No Preference")
          ...(formData.underwritingType && formData.underwritingType !== 'No Preference' ? {
            underwritingType: formData.underwritingType as 'Full' | 'Simplified' | 'Guaranteed'
          } : {})
        };
        
        const response = await getFinalExpenseLifeQuotes(finalExpenseParams);
        console.log('🔥 Final Expense Life API Response:', response);
        
        if (response.error) {
          console.log('🔥 Final Expense Life API Error:', response.error);
          setQuotesError(response.error);
        } else if (response.quotes && Array.isArray(response.quotes)) {
          console.log('🔥 Success! Received final expense life quotes:', response.quotes.length);
          console.log('🔥 Setting finalExpenseQuotes state with:', response.quotes.length, 'quotes');
          setFinalExpenseQuotes(response.quotes);
          
          // Save final expense life quotes to Firestore
          console.log('💾 Saving final expense quotes to Firestore:', response.quotes.length, 'quotes');
          await saveToStorage(FINAL_EXPENSE_QUOTES_KEY, response.quotes);
          
          // Verify save was successful
          const verified = await loadFromStorage(FINAL_EXPENSE_QUOTES_KEY, []);
          console.log('✅ Verified final expense quotes in storage:', verified.length, 'quotes');
          
          // Log storage usage after saving final expense quotes
          const storageInfo = await getFirestoreStorageInfo();
          console.log('📊 Storage usage after final expense quotes:', storageInfo.readable);
          
          // Mark Final Expense Life as completed
          setCompletedQuoteTypes(prev => [...prev, 'Final Expense Life']);
          setCurrentQuoteType(null);
          
          // Preload carrier logos for better user experience
          preloadCarrierLogos(response.quotes);
        }
      }
      
      // Mark form as completed
      setQuoteFormCompleted(true);
      
      // Set session indicators for lightweight checking
      localStorage.setItem('medicare_quote_form_completed', 'true');
      localStorage.setItem('medicare_quote_session_active', 'true');
      
      // Immediately save the completion status to Firestore to ensure persistence
      await saveToStorage(QUOTE_FORM_COMPLETED_KEY, true);
      
      // DO NOT update URL automatically - only manual tab selection should update URL
      
    } catch (error) {
      console.error('🔥 Error in quote submission:', error);
      
      // Enhanced error handling for Firebase function errors
      let errorMessage = 'An error occurred while fetching quotes';
      
      if (error && typeof error === 'object') {
        // Handle Firebase function errors specifically
        const firebaseError = error as any; // Firebase errors have non-standard typing
        
        if (firebaseError.code === 'functions/deadline-exceeded' || 
            firebaseError.message?.includes('deadline-exceeded') ||
            firebaseError.message?.includes('timeout')) {
          errorMessage = `Quote request timed out for ${targetCategory} plans. The service is experiencing high load. Please try again in a few minutes or select fewer plans at once.`;
          console.error(`⏱️ Timeout error for ${targetCategory}:`, error);
        } else if (firebaseError.code === 'functions/internal' || 
                   firebaseError.message?.includes('Memory limit') ||
                   firebaseError.message?.includes('memory')) {
          errorMessage = `Quote service is experiencing high load for ${targetCategory} plans. Please try again in a few minutes or select fewer plans at once.`;
          console.error(`🧠 Memory limit error for ${targetCategory}:`, error);
        } else if (firebaseError.code?.startsWith('functions/')) {
          errorMessage = `Quote service error for ${targetCategory}. Please try again later.`;
          console.error(`🔥 Firebase function error for ${targetCategory}:`, firebaseError.code, error);
        } else if (firebaseError.message) {
          errorMessage = firebaseError.message;
        }
      }
      
      // Only set global error if no quotes were successfully loaded
      if (!hasQuotes()) {
        setQuotesError(errorMessage);
      } else {
        // If other quotes loaded successfully, just log the error but don't block the UI
        console.warn(`⚠️ Non-blocking error for ${targetCategory}: ${errorMessage}`);
      }
      
      // Mark the category as "completed" even if it failed to prevent loading states from hanging
      // This allows auto-switching to work even when some categories fail
      if (targetCategory) {
        const categoryDisplayNames: Record<string, string> = {
          'medigap': 'Supplement Plans',
          'advantage': 'Medicare Advantage Plans',
          'drug-plan': 'Drug Plans',
          'dental': 'Dental Insurance',
          'cancer': 'Cancer Insurance',
          'hospital-indemnity': 'Hospital Indemnity',
          'final-expense': 'Final Expense Life'
        };
        
        const displayName = categoryDisplayNames[targetCategory];
        if (displayName) {
          console.log(`🔄 Marking failed category ${targetCategory} as "completed" to enable auto-switching`);
          // Don't add to completedQuoteTypes as this would trigger auto-switching to empty results
          // Just ensure the loading state clears
          setCurrentQuoteType(null);
        }
      }
    } finally {
      if (manageLoadingState) {
        setIsLoadingQuotes(false);
        setLoadingItems([]); // Clear loading items when quote fetching is complete
        // Note: Don't hide showQuoteLoading here as it's managed by quotesReady state
      }
    }
  };

  const calculateDiscountedPrice = (quote: any) => {
    // Get the base rate (handle different rate formats)
    let price = 0;
    if (quote.rate?.month) {
      price = quote.rate.month;
    } else if (quote.rate?.semi_annual) {
      price = quote.rate.semi_annual / 6; // Convert semi-annual to monthly
    } else {
      price = quote.monthly_premium || quote.premium || 0;
    }
    
    // Convert from cents to dollars
    price = price >= 100 ? price / 100 : price;
    
    if (applyDiscounts && quote.discounts) {
      quote.discounts.forEach((discount: any) => {
        if (discount.type === 'percent') {
          price = price * (1 - discount.value);
        } else {
          price = Math.max(0, price - discount.value);
        }
      });
    }
    return price;
  };

  const convertPriceByPaymentMode = (monthlyPrice: number) => {
    switch (paymentMode) {
      case 'quarterly':
        return monthlyPrice * 3;
      case 'annually':
        return monthlyPrice * 12;
      default:
        return monthlyPrice;
    }
  };

  const getPaymentLabel = () => {
    switch (paymentMode) {
      case 'quarterly': return '/quarter';
      case 'annually': return '/year';
      default: return '/month';
    }
  };

  const getCachedLogoUrl = (carrierName: string, carrierId: string): string => {
    console.log(`🔍 getCachedLogoUrl called with carrierName: "${carrierName}", carrierId: "${carrierId}"`);
    
    // Use carrierName as the key since we're no longer using NAIC codes
    const carrierKey = carrierName;
    
    // Check if we have a cached logo URL
    if (carrierLogos[carrierKey]) {
      const cachedUrl = carrierLogos[carrierKey];
      
      // Check if the cached URL is a bad NAIC-based URL (like https://logo.clearbit.com/60219.com)
      // If the URL ends with a 5-digit number followed by .com, it's likely a NAIC code URL
      const isBadNaicUrl = /https:\/\/logo\.clearbit\.com\/\d{5}\.com$/i.test(cachedUrl);
      
      if (!isBadNaicUrl) {
        console.log(`✅ Using cached logo for ${carrierKey}:`, cachedUrl);
        return cachedUrl;
      } else {
        console.log(`❌ Ignoring bad cached NAIC-based logo URL for ${carrierKey}:`, cachedUrl);
        // Remove the bad cached URL
        delete carrierLogos[carrierKey];
      }
    }
    
    // Use the enhanced carrier info system that checks preferred carriers first
    const mockQuote = { carrier: { name: carrierName } };
    const productCategory: ProductCategory = selectedCategory === 'medigap' ? 'medicare-supplement' 
      : selectedCategory === 'advantage' ? 'medicare-advantage'
      : selectedCategory === 'dental' ? 'dental'
      : selectedCategory === 'final-expense' ? 'final-expense'
      : selectedCategory === 'hospital-indemnity' ? 'hospital-indemnity'
      : selectedCategory === 'cancer' ? 'cancer'
      : selectedCategory === 'drug-plan' ? 'drug-plan'
      : 'medicare-supplement';
    
    console.log(`🎯 Looking up carrier "${carrierName}" for category "${productCategory}"`);
    const enhancedInfo = getEnhancedCarrierInfo(mockQuote, productCategory);
    const logoUrl = enhancedInfo.logoUrl;
    console.log(`📸 Enhanced logo URL for carrier "${carrierName}":`, logoUrl);
    console.log(`📋 Enhanced info:`, enhancedInfo);
    
    // Don't update state during render - this will be cached by the preloadCarrierLogos function instead
    
    return logoUrl;
  };

  // Get the display name for a carrier (prefer preferred carrier display name, then short name from carrier system)
  const getCarrierDisplayName = (carrierName: string, carrierId: string): string => {
    // Map the selectedCategory to ProductCategory
    const productCategory: ProductCategory = selectedCategory === 'medigap' ? 'medicare-supplement' 
      : selectedCategory === 'advantage' ? 'medicare-advantage'
      : selectedCategory === 'dental' ? 'dental'
      : selectedCategory === 'final-expense' ? 'final-expense'
      : selectedCategory === 'hospital-indemnity' ? 'hospital-indemnity'
      : selectedCategory === 'cancer' ? 'cancer'
      : selectedCategory === 'drug-plan' ? 'drug-plan'
      : 'medicare-supplement';
    
    return getCarrierDisplayNameFromSystem(carrierName, productCategory);
  };

  const openPlanModal = (carrierGroup: any) => {
    console.log('Opening plan modal for:', carrierGroup);
    console.log('Current discount state:', applyDiscounts);
    
    try {
      // Store return URL so user can come back to current page
      const currentUrl = window.location.href;
      localStorage.setItem('planDetailsReturnUrl', currentUrl);
      
      // Extract carrier and plan information from carrierGroup
      const company = carrierGroup.company; // Primary identifier from API
      const planType = carrierGroup.selectedPlanType;
      
      console.log('Navigation data:', { company, planType });
      
      // Build URL with simplified parameters
      const params = new URLSearchParams();
      if (company) params.set('carrier', company); // Use company field as primary identifier
      if (planType) params.set('plan', planType);
      
      const planDetailsUrl = `/plan-details${params.toString() ? `?${params.toString()}` : ''}`;
      console.log('Navigating to:', planDetailsUrl);
      
      // Navigate to plan details page with specific carrier/plan context
      router.push(planDetailsUrl);
    } catch (error) {
      console.error('Error opening plan details:', error);
      // Could add toast notification here for user feedback
    }
  };

  const handleMedicareFlowComplete = async (data: any) => {
    console.log('🔥 handleMedicareFlowComplete called with data:', data);
    console.log('🔥 Selected plan categories:', data?.planCategories);
    console.log('🔥 Data keys:', Object.keys(data || {}));
    console.log('🔥 Full data object:', JSON.stringify(data, null, 2));
    
    // Map flow data to our form data structure (like in backup)
    const mappedFormData = {
      age: data.age === undefined || data.age === null || data.age === ""
        ? ""
        : typeof data.age === "number"
        ? data.age
        : isNaN(Number(data.age))
        ? ""
        : Number(data.age),
      zipCode: data.zipCode || "",
      gender: data.gender || "",
      tobaccoUse: data.tobaccoUse,
      email: data.email || "",
      firstName: data.firstName || "",
      effectiveDate: data.effectiveDate || "",
      // Cancer Insurance specific fields
      familyType: data.familyType || "",
      carcinomaInSitu: data.carcinomaInSitu,
      premiumMode: data.premiumMode || "",
      // Dental Insurance specific fields
      coveredMembers: data.coveredMembers || "",
      // Final Expense specific fields
      desiredFaceValue: data.desiredFaceValue || "",
      desiredRate: data.desiredRate || "",
      underwritingType: data.underwritingType || "",
      // Cancer Insurance specific fields
      benefitAmount: data.benefitAmount || "",
      // State field for cancer insurance
      state: data.state || ""
    };
    
    console.log('🔥 Mapped form data:', mappedFormData);
    setQuoteFormData(mappedFormData);
    await saveToStorage(QUOTE_FORM_DATA_KEY, mappedFormData);
    
    // Combine plan categories and additional options for complete category list
    const allCategories = [];
    
    // Add main plan categories with proper mapping
    if (data?.planCategories && Array.isArray(data.planCategories)) {
      data.planCategories.forEach((category: string) => {
        if (category === 'partd') {
          // Map partd to drug-plan for consistency with tab system
          allCategories.push('drug-plan');
        } else {
          allCategories.push(category);
        }
      });
    }
    
    // Add additional options with proper category IDs
    if (data?.selectedAdditionalOptions && Array.isArray(data.selectedAdditionalOptions)) {
      if (data.selectedAdditionalOptions.includes('dental')) {
        allCategories.push('dental');
      }
      if (data.selectedAdditionalOptions.includes('cancer')) {
        allCategories.push('cancer');
      }
      if (data.selectedAdditionalOptions.includes('hospital')) {
        allCategories.push('hospital-indemnity');
      }
      if (data.selectedAdditionalOptions.includes('final-expense')) {
        allCategories.push('final-expense');
      }
    }
    
    console.log('🔥 Combined categories for tabs:', allCategories);
    
    if (allCategories.length > 0) {
      console.log('📋 Setting all categories manually:', allCategories);
      setSelectedFlowCategories(allCategories);
      saveSelectedCategories(allCategories);
    }
    
    setShowMedicareFlow(false);
    setShowQuoteLoading(true);
    setQuotesReady(false); // Reset quotes ready state
    setCompletedQuoteTypes([]); // Reset completed quotes
    setStartedQuoteTypes([]); // Reset started quotes
    setHasAutoSwitched(false); // Reset auto-switch flag
    setCurrentQuoteType(null); // Reset current quote type
    
    try {
      console.log('Flow complete - Categories:', data.planCategories);
      console.log('Flow complete - Additional Options:', data.selectedAdditionalOptions);
      
      const hasMedigap = data.planCategories?.includes('medigap');
      const hasAdvantage = data.planCategories?.includes('advantage');
      const hasDrugPlan = data.planCategories?.includes('partd');
      
      // Detect additional insurance products
      const hasDental = data.selectedAdditionalOptions?.includes('dental');
      const hasCancer = data.selectedAdditionalOptions?.includes('cancer');
      const hasHospital = data.selectedAdditionalOptions?.includes('hospital');
      const hasFinalExpense = data.selectedAdditionalOptions?.includes('final-expense');
      
      console.log('Detected categories:', { hasMedigap, hasAdvantage, hasDrugPlan });
      console.log('Detected additional options:', { hasDental, hasCancer, hasHospital, hasFinalExpense });
      
      // Set expected quote types for tracking completion
      const expectedTypes: string[] = [];
      if (hasMedigap) expectedTypes.push('medigap');
      if (hasAdvantage) expectedTypes.push('advantage');
      if (hasDrugPlan) expectedTypes.push('drug-plan');
      if (hasDental) expectedTypes.push('dental');
      if (hasCancer) expectedTypes.push('cancer');
      if (hasHospital) expectedTypes.push('hospital-indemnity');
      if (hasFinalExpense) expectedTypes.push('final-expense');
      setExpectedQuoteTypes(expectedTypes);
      
      // Calculate total expected individual quotes for progress tracking
      let totalQuotes = 0;
      let expectedIndividualQuotes: string[] = [];
      
      if (hasMedigap) {
        const selectedPlans = data.selectedMedigapPlans && data.selectedMedigapPlans.length > 0 
          ? data.selectedMedigapPlans    // This is already ["F", "G", "N"] format from MedicareQuoteFlow
          : ['F', 'G', 'N'];              // Default fallback also in correct format
        
        // No conversion needed - selectedPlans is already in display format ["F", "G", "N"]
        setSelectedQuotePlans(selectedPlans);
        
        const planNames = selectedPlans.length > 1 
          ? ['Supplement Plans'] 
          : selectedPlans.map((plan: string) => `Plan ${plan}`);
        
        expectedIndividualQuotes.push(...planNames);
        totalQuotes += planNames.length;
      }
      
      if (hasAdvantage) {
        expectedIndividualQuotes.push('Medicare Advantage Plans');
        totalQuotes += 1;
      }
      
      if (hasDrugPlan) {
        expectedIndividualQuotes.push('Drug Plans');
        totalQuotes += 1;
      }
      
      if (hasDental) {
        expectedIndividualQuotes.push('Dental Insurance');
        totalQuotes += 1;
      }
      
      if (hasCancer) {
        expectedIndividualQuotes.push('Cancer Insurance');
        totalQuotes += 1;
      }
      
      if (hasHospital) {
        expectedIndividualQuotes.push('Hospital Indemnity');
        totalQuotes += 1;
      }
      
      if (hasFinalExpense) {
        expectedIndividualQuotes.push('Final Expense Life');
        totalQuotes += 1;
      }
      
      setTotalExpectedQuotes(totalQuotes);
      
      // Create sequential execution plan for all selected categories
      const executionPlan = [];
      const loadingItemsList = [];
      
      if (hasMedigap) {
        const selectedPlans = data.selectedMedigapPlans && data.selectedMedigapPlans.length > 0 
          ? data.selectedMedigapPlans    // This is already ["F", "G", "N"] format from MedicareQuoteFlow  
          : ['F', 'G', 'N'];              // Default fallback also in correct format
        
        // No conversion needed - selectedPlans is already in display format ["F", "G", "N"]
        setSelectedQuotePlans(selectedPlans);
        
        const planNames = selectedPlans.length > 1 
          ? ['Supplement Plans'] 
          : selectedPlans.map((plan: string) => `Plan ${plan}`);
        
        loadingItemsList.push(...planNames);
        executionPlan.push({
          category: 'medigap',
          plans: selectedPlans, // Use selectedPlans directly - already in correct format
          displayName: planNames.length > 1 ? 'Supplement Plans' : `Plan ${selectedPlans[0]}`
        });
      }
      
      if (hasAdvantage) {
        loadingItemsList.push('Medicare Advantage Plans');
        executionPlan.push({
          category: 'advantage',
          plans: undefined,
          displayName: 'Medicare Advantage Plans'
        });
      }
      
      if (hasDrugPlan) {
        loadingItemsList.push('Drug Plans');
        executionPlan.push({
          category: 'drug-plan',
          plans: undefined,
          displayName: 'Drug Plans'
        });
      }
      
      if (hasDental) {
        loadingItemsList.push('Dental Insurance');
        executionPlan.push({
          category: 'dental',
          plans: undefined,
          displayName: 'Dental Insurance'
        });
      }
      
      if (hasCancer) {
        loadingItemsList.push('Cancer Insurance');
        executionPlan.push({
          category: 'cancer',
          plans: undefined,
          displayName: 'Cancer Insurance'
        });
      }
      
      if (hasHospital) {
        loadingItemsList.push('Hospital Indemnity');
        executionPlan.push({
          category: 'hospital-indemnity',
          plans: undefined,
          displayName: 'Hospital Indemnity'
        });
      }
      
      if (hasFinalExpense) {
        loadingItemsList.push('Final Expense Life');
        executionPlan.push({
          category: 'final-expense',
          plans: undefined,
          displayName: 'Final Expense Life'
        });
      }
      
      // Set loading items for all categories
      setLoadingItems(loadingItemsList);
      
      // DO NOT automatically set category during quote execution
      // Only update category if user hasn't manually selected one yet (initial load only)
      if (!initialLoadComplete) {
        const firstCategory = executionPlan[0]?.category || 'medigap';
        setSelectedCategory(firstCategory);
        setActiveCategory(firstCategory);
      }
      
      // DO NOT update URL automatically - only manual selection should update URL
      
      // Execute all quote fetching simultaneously  
      console.log('🚀 Starting parallel quote execution for:', executionPlan.map(step => step.displayName));
      
      // Set initial progress state for parallel execution
      setCurrentQuoteType('Multiple quote types'); // Indicate parallel processing
      
      const quotePromises = executionPlan.map(async (step, index) => {
        try {
          console.log(`🔄 Starting ${step.displayName} quotes...`);
          
          // Mark this quote type as started for real-time progress tracking
          setStartedQuoteTypes(prev => [...prev, step.category]);
          
          // Fetch quotes for this category - the individual functions will handle completion tracking
          await handleQuoteFormSubmitWithData(mappedFormData, step.category, step.plans, false);
          
          console.log(`✅ Completed ${step.displayName} quotes`);
          return { success: true, category: step.category, displayName: step.displayName };
        } catch (error) {
          console.error(`❌ Error fetching ${step.displayName} quotes:`, error);
          return { success: false, category: step.category, displayName: step.displayName, error };
        }
      });
      
      // Wait for all quotes to complete (or fail)
      const results = await Promise.allSettled(quotePromises);
      console.log('🎉 All quote requests completed (successfully or with errors)');
      
      // Process results
      const successful = results
        .filter(result => result.status === 'fulfilled' && result.value.success)
        .map(result => (result as PromiseFulfilledResult<any>).value);
      
      const failed = results
        .filter(result => result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success))
        .map(result => {
          if (result.status === 'rejected') {
            return { displayName: 'Unknown', error: result.reason };
          } else {
            return (result as PromiseFulfilledResult<any>).value;
          }
        });
      
      console.log(`✅ Successful: ${successful.length}, ❌ Failed: ${failed.length}`);
      
      // Enhanced error reporting for Firebase function failures
      if (failed.length > 0) {
        console.group('📊 Quote Execution Summary');
        console.log('✅ Successful categories:', successful.map(s => s.displayName));
        console.log('❌ Failed categories:', failed.map(f => f.displayName));
        
        // Check for Firebase function errors specifically
        const firebaseErrors = failed.filter(f => 
          f.error && typeof f.error === 'object' && 
          (f.error as any).code?.startsWith('functions/')
        );
        
        if (firebaseErrors.length > 0) {
          console.warn('🔥 Firebase function errors detected:', firebaseErrors.map(f => ({
            category: f.displayName,
            code: (f.error as any).code
          })));
        }
        console.groupEnd();
      }
      
      // Determine if we should proceed with results or show error
      if (successful.length > 0) {
        console.log(`🎉 Proceeding with ${successful.length} successful quote type(s)`);
        // Let auto-switching handle navigation to first successful category
      } else {
        console.error('❌ All quote requests failed');
        setQuotesError('Unable to load quotes at this time. Please try again in a few moments.');
      }
      
      if (failed.length > 0) {
        console.warn('Some quote requests failed:', failed);
      }
      
      // Reset current quote type since all are done
      setCurrentQuoteType(null);
      
      // Simplified storage status logging
      try {
        const finalStorageInfo = await getFirestoreStorageInfo();
        console.log('📊 Storage:', finalStorageInfo.readable, '| Quotes:', finalStorageInfo.totalQuotes);
      } catch (error) {
        console.warn('Could not get storage info:', error);
      }
      
      // Loading will be hidden automatically by useEffect when quotes are ready
      
      setQuoteFormCompleted(true);
      
      // Set session indicators for lightweight checking
      localStorage.setItem('medicare_quote_form_completed', 'true');
      localStorage.setItem('medicare_quote_session_active', 'true');
    } catch (error) {
      console.error('Error processing flow data:', error);
      setQuotesError('Failed to fetch quotes. Please try again.');
      setShowQuoteLoading(false); // Hide loading on error
      setQuotesReady(false); // Reset quotes ready state on error
      setCompletedQuoteTypes([]); // Reset completed quotes on error
      setHasAutoSwitched(false); // Reset auto-switch flag
      setCurrentQuoteType(null); // Reset current quote type on error
    }
    // Note: Don't hide showQuoteLoading here - let it be controlled by quote completion
  };

  const clearStorageAndReset = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    setQuoteFormData({
      age: "",
      zipCode: '',
      gender: "",
      tobaccoUse: null
    });
    setSelectedFlowCategories([]);
    saveSelectedCategories([]); // Clear UI state as well
    setRealQuotes([]);
    setAvailableMedigapPlans({}); // Clear tracking when clearing quotes
    setAdvantageQuotes([]);
    setDrugPlanQuotes([]);
    setDentalQuotes([]);
    setHospitalIndemnityQuotes([]);
    setFinalExpenseQuotes([]);
    setCancerInsuranceQuotes([]);
    setActiveCategory('medigap');
    setSelectedCategory('medigap');
    setShowMedicareFlow(false);
    setShowQuoteLoading(false);
    setQuotesReady(false);
    setExpectedQuoteTypes([]);
    setCompletedQuoteTypes([]);
    setHasAutoSwitched(false); // Reset auto-switch flag
    setInitialLoadComplete(false); // Reset initial load flag to allow auto-switching for new submissions
    setCurrentQuoteType(null);
    setTotalExpectedQuotes(0);
    
    // Reset URL to clean Medicare shop page
    router.push('/medicare?section=shop');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPriceRange([0, 500]);
    setSelectedCoverageLevel('all');
    setShowPreferredOnly(true);
    // DON'T reset plan selections - these should persist from user's actual choices

    // setSelectedQuotePlans(['F', 'G', 'N']);
    setApplyDiscounts(false);
    setPaymentMode('monthly');
  };

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedQuotePlans(['F', 'G', 'N']);
  }, []);

  // Simplified plan selection handler - single source of truth
  const handlePlanSelection = useCallback((plans: string[]) => {
    // Check if any of the new plans require quote generation
    // (i.e., plans that are not currently available in availableMedigapPlans)
    const newPlansNeedingQuotes = plans.some(plan => !availableMedigapPlans[plan]);
    
    // FIXED: Only show loading skeleton if new quotes need to be generated AND we have no existing plans to show
    const hasExistingPlansToShow = plans.some(plan => availableMedigapPlans[plan]);
    if (newPlansNeedingQuotes && !hasExistingPlansToShow) {
      setIsPlanLoading(true);
    }
    
    // Update selectedQuotePlans directly (this triggers storage save via useEffect)
    setSelectedQuotePlans(plans);
  }, [availableMedigapPlans]);

  // Display data processing - handle both real quotes types
  const displayData = React.useMemo(() => {
    if (selectedCategory === 'medigap') {
      // Use plan-specific quotes from planQuotes state
      const selectedPlansData = selectedQuotePlans.flatMap(planType => {
        const quotes = planQuotes[planType as keyof typeof planQuotes] || [];
        return quotes;
      });
      
      // Only proceed if we have quotes for selected plans
      if (selectedPlansData.length === 0) {
        return {
          type: 'grouped' as const,
          data: []
        };
      }
      
      // Apply preferred carriers filter first if enabled
      let quotesToProcess = selectedPlansData;
      if (showPreferredOnly) {
        quotesToProcess = filterPreferredCarriers(selectedPlansData, 'medicare-supplement');
      }
      
      // Group by carrier for medigap - simplified filtering like test-multi-plan
      const filteredQuotes = quotesToProcess.filter(quote => {        
        if (searchQuery) {
          const carrierName = quote?.carrier?.name || 
                             quote?.company_base?.name ||
                             quote?.company ||
                             'Unknown Carrier';
          const displayName = getCarrierDisplayName(carrierName, '');
          
          // Search against both original name and short name
          return carrierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 displayName.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true; // No complex availability checks - if quote exists in selectedPlansData, show it
      });

      const groupedByCarrier = filteredQuotes.reduce((groups: Record<string, any>, quote: any) => {
        const carrierName = quote.carrier?.name || quote.company_base?.name || quote.company || 'Unknown Carrier';
        // TEMPORARY: Show actual API names instead of display names
        const displayName = carrierName; // Use original name to see actual structure
        // TEMPORARY: Use company field as the key to see how carriers split
        const carrierKey = quote.company || carrierName;
        
        if (!groups[carrierKey]) {
          groups[carrierKey] = {
            carrierId: carrierKey,
            carrierName: displayName, // Use the original API name temporarily
            originalCarrierName: carrierName, // Keep original name for fallback
            company: quote.company, // Add the company field from the API
            quotes: []
          };
        }
        groups[carrierKey].quotes.push(quote);
        return groups;
      }, {});

      console.log('🏗️ Created carrier groups:', Object.keys(groupedByCarrier).length, 'carriers');

      // Sort carrier groups by lowest price - simplified approach
      console.log('🎯 Calculating min rates for sorting (applyDiscounts=' + applyDiscounts + ')...');
      
      // Helper function to process options for display - exact copy from test-multi-plan
      const processOptionsForDisplay = (plan: any) => {
        const hasWithHHD = plan.options?.some((opt: any) => opt.view_type?.includes('with_hhd'));
        const hasSansHHD = plan.options?.some((opt: any) => opt.view_type?.includes('sans_hhd'));
        const hasPreCalculatedDiscounts = hasWithHHD && hasSansHHD;

        if (hasPreCalculatedDiscounts) {
          if (applyDiscounts) {
            return plan.options.filter((opt: any) => opt.view_type?.includes('with_hhd'));
          } else {
            return plan.options.filter((opt: any) => opt.view_type?.includes('sans_hhd'));
          }
        } else {
          if (applyDiscounts) {
            return plan.options?.map((opt: any) => {
              const hasDiscounts = opt.discounts && opt.discounts.length > 0;
              if (hasDiscounts) {
                let discountedRate = opt.rate.month;
                opt.discounts.forEach((discount: any) => {
                  const discountPercent = discount.value ? (discount.value * 100) : (discount.percent || 0);
                  discountedRate = discountedRate * (1 - discountPercent / 100);
                });
                return { ...opt, rate: { ...opt.rate, month: discountedRate }, isCalculatedDiscount: true };
              }
              return opt;
            }) || [];
          } else {
            return plan.options || [];
          }
        }
      };

      // Calculate min rate for each carrier once
      const carriersWithMinRates = Object.values(groupedByCarrier).map((carrierGroup: any) => {
        console.log('🔍 Processing carrier:', carrierGroup.carrierName, '- quotes:', carrierGroup.quotes?.length || 0);
        const plans = consolidateQuoteVariations(carrierGroup.quotes || []);
        console.log('  📋 Consolidated plans:', plans.length);
        let minRate = Infinity;
        
        plans.forEach((plan, planIndex) => {
          console.log('    📋 Plan', planIndex, 'for', carrierGroup.carrierName, '- type:', plan.plan);
          const displayOptions = processOptionsForDisplay(plan);
          console.log('    📊 Found', displayOptions.length, 'valid options for', carrierGroup.carrierName);
          
          displayOptions.forEach((opt: any, optIndex: number) => {
            const rate = opt.rate?.month || 0;
            // Check if rate needs conversion from cents to dollars
            const displayRate = rate > 1000 ? rate / 100 : rate;
            console.log('      � Option', optIndex, '- raw rate:', rate, 'display rate:', displayRate, 'view_type:', opt.view_type, 'type:', opt.type);
            if (displayRate > 0 && displayRate < minRate) {
              console.log('        🎯 NEW MIN for', carrierGroup.carrierName, ':', displayRate);
              minRate = displayRate;
            }
          });
        });
        
        const finalMinRate = minRate === Infinity ? 0 : minRate;
        console.log('💰', carrierGroup.carrierName, 'sorting with min rate:', finalMinRate);
        
        return {
          ...carrierGroup,
          minRate: finalMinRate
        };
      });

      // Sort by minimum rate
      const sortedCarrierGroups = carriersWithMinRates.sort((a, b) => a.minRate - b.minRate);
      
      console.log('📋 Final sorted order:', sortedCarrierGroups.map(c => `${c.carrierName} ($${c.minRate})`));

      return {
        type: 'grouped' as const,
        data: sortedCarrierGroups
      };
    } else if (selectedCategory === 'advantage' && advantageQuotes?.length > 0) {
      // Handle advantage quotes (could be individual or grouped depending on structure)
      const filteredQuotes = advantageQuotes.filter(quote => {
        if (searchQuery) {
          const carrierName = quote?.carrier?.name || 
                             quote?.company_base?.name ||
                             quote?.company ||
                             'Unknown Carrier';
          return carrierName.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
      });

      return {
        type: 'individual' as const,
        data: filteredQuotes
      };
    } else if (selectedCategory === 'drug-plan' && drugPlanQuotes?.length > 0) {
      // Handle drug plan quotes
      const filteredQuotes = drugPlanQuotes.filter(quote => {
        if (searchQuery) {
          const carrierName = quote?.carrier?.name || 
                             quote?.company_base?.name ||
                             quote?.company ||
                             'Unknown Carrier';
          return carrierName.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
      });

      return {
        type: 'individual' as const,
        data: filteredQuotes
      };
    }

    // Return empty data for other categories when no quotes
    return {
      type: 'individual' as const,
      data: []
    };
  }, [selectedCategory, planQuotes, advantageQuotes, drugPlanQuotes, selectedQuotePlans, searchQuery, showPreferredOnly, applyDiscounts]);

  // Memoized pagination calculations to prevent unnecessary re-computations
  const paginationData = React.useMemo(() => {
    const itemsPerPage = 10;
    const totalItems = displayData.data.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = displayData.data.slice(startIndex, endIndex);

    const paginationInfo = {
      currentPage,
      totalPages,
      totalItems,
      startItem: startIndex + 1,
      endItem: Math.min(endIndex, totalItems),
      hasPrevPage: currentPage > 1,
      hasNextPage: currentPage < totalPages
    };

    return { paginatedData, paginationInfo };
  }, [displayData.data, currentPage]);

  const { paginatedData, paginationInfo } = paginationData;

  // Handler for generating quotes from the additional options dropdown
  const handleGenerateQuotesForCategory = useCallback(async (category: string, formData: QuoteFormData) => {
    try {
      // Update form data state with any new information
      setQuoteFormData(formData);
      
      // Add category to selected flow categories if not already present
      if (!selectedFlowCategories.includes(category)) {
        const updatedCategories = [...selectedFlowCategories, category];
        setSelectedFlowCategories(updatedCategories);
        saveSelectedCategories(updatedCategories);
      }
      
      // Generate quotes for the specific category WITHOUT affecting global loading state
      await handleQuoteFormSubmitWithData(formData, category, undefined, false, true);
      
      // DON'T switch to the new category immediately - let user manually switch when ready
      // This preserves the current user experience while quotes load in background
      console.log(`✅ Background quote generation completed for ${category}`);
      
    } catch (error) {
      console.error('Error generating quotes for category:', category, error);
      setQuotesError(`Failed to generate quotes for ${category}. Please try again.`);
    }
  }, [selectedFlowCategories, setSelectedFlowCategories, handleQuoteFormSubmitWithData, setQuoteFormData, setQuotesError]);

  // Get currently loading categories for the additional options UI
  const getLoadingCategories = useCallback((): string[] => {
    const loading: string[] = [];
    
    // Check each category individually using isCategoryLoading
    const categories = ['medigap', 'advantage', 'drug-plan', 'dental', 'cancer', 'hospital-indemnity', 'final-expense'];
    
    categories.forEach(category => {
      if (isCategoryLoading(category)) {
        loading.push(category);
      }
    });
    
    return loading;
  }, [isCategoryLoading]);

  return (
    <MedicareShopLayout
      hasQuotes={hasQuotes()}
      cartCount={cart.length}
      selectedFlowCategories={selectedFlowCategories}
      activeCategory={activeCategory}
      selectedCategory={selectedCategory}
      productCategories={productCategories}
      onCategoryToggle={handleManualCategoryToggle}
      onCategorySelect={handleManualCategorySelect}
      onReset={clearStorageAndReset}
      quoteFormData={quoteFormData}
      onGenerateQuotes={handleGenerateQuotesForCategory}
      loadingCategories={getLoadingCategories()}
      completedQuoteTypes={completedQuoteTypes}
    >
      {/* Loading States Component */}
      <MedicareLoadingStates
        isInitializing={isInitializing}
        showQuoteLoading={showQuoteLoading}
        loadingItems={loadingItems}
        quoteFormData={quoteFormData}
        selectedFlowCategories={selectedFlowCategories}
        quotesReady={quotesReady}
        completedQuoteTypes={completedQuoteTypes}
        startedQuoteTypes={startedQuoteTypes}
        currentQuoteType={currentQuoteType}
        totalExpectedQuotes={totalExpectedQuotes}
        hasQuotes={hasQuotes}
        onLoadingComplete={() => {
          setShowQuoteLoading(false);
          setInitialLoadComplete(true); // Mark initial load as complete to prevent future auto-switching
        }}
      />

      {/* Content conditionally rendered when not loading */}
      {!isInitializing && !showQuoteLoading && (
        <>
          {selectedCategory === 'advantage' || activeCategory === 'advantage' ? (
            /* Route to dedicated Medicare Advantage component */
            <MedicareAdvantageShopContent 
              isExternallyLoading={false}
              externalQuotes={advantageQuotes}
            />
          ) : selectedCategory === 'drug-plan' || activeCategory === 'drug-plan' ? (
            /* Route to dedicated Drug Plan component */
            <DrugPlanShopContent />
          ) : (
            <>
              {/* Show content based on form completion and flow state */}
              {showMedicareFlow ? (
                /* Show New Medicare Flow */
                <MedicareQuoteFlow
                  mode={medicareFlowMode}
                  onComplete={handleMedicareFlowComplete}
                  onCancel={() => setShowMedicareFlow(false)}
                />
              ) : hasQuotes() || isRecoveringSession || realQuotes.length > 0 ? (
            /* Show Plans When There Are Quotes */
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Enhanced Sidebar with Combined Filters */}
              <MedicareShopSidebar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                selectedCoverageLevel={selectedCoverageLevel}
                setSelectedCoverageLevel={setSelectedCoverageLevel}
                selectedCategory={selectedCategory}
                selectedQuotePlans={selectedQuotePlans}
                setSelectedQuotePlans={handlePlanSelection}
                applyDiscounts={applyDiscounts}
                setApplyDiscounts={setApplyDiscounts}
                paymentMode={paymentMode}
                setPaymentMode={setPaymentMode}
                quoteFormData={quoteFormData}
                realQuotes={realQuotes}
                onClearFilters={clearFilters}
                showPreferredOnly={showPreferredOnly}
                setShowPreferredOnly={setShowPreferredOnly}
              />

              {/* Main Product Grid */}
              <main className="lg:col-span-3">
                {/* Quote Error Display */}
                {quotesError && (
                  <Card className="mb-6 border-red-200 bg-red-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-red-800">
                        <CrossCircledIcon className="w-5 h-5" />
                        <span className="font-medium">Quote Error</span>
                      </div>
                      <p className="text-sm text-red-700 mt-1">{quotesError}</p>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-6">
                  {/* Results Header with Pagination Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold">
                        {selectedCategory === 'medigap' ? 'Medigap (Supplement)' : 
                         selectedCategory === 'advantage' ? 'Medicare Advantage' : 
                         selectedCategory === 'drug-plan' ? 'Drug Plans' :
                         selectedCategory === 'dental' ? 'Dental Insurance' :
                         selectedCategory === 'cancer' ? 'Cancer Insurance' :
                         selectedCategory === 'hospital-indemnity' ? 'Hospital Indemnity' :
                         selectedCategory === 'final-expense' ? 'Final Expense Life Insurance' :
                         'Medicare Plans'}
                      </h2>
                      <MedigapResultsHeader
                        selectedCategory={selectedCategory}
                        realQuotes={realQuotes}
                        advantageQuotes={advantageQuotes}
                        drugPlanQuotes={drugPlanQuotes}
                        dentalQuotes={dentalQuotes}
                        hospitalIndemnityQuotes={hospitalIndemnityQuotes}
                        finalExpenseQuotes={finalExpenseQuotes}
                        cancerInsuranceQuotes={cancerInsuranceQuotes}
                        paginationInfo={paginationInfo}
                      />
                    </div>

                    {/* Plan Types Checkboxes/Buttons for Medigap */}
                    {selectedCategory === 'medigap' && realQuotes.length > 0 && (
                      <MedigapPlanTypeControls
                        selectedQuotePlans={selectedQuotePlans}
                        setSelectedQuotePlans={handlePlanSelection}
                        hasQuotesForPlan={hasQuotesForPlan}
                        fetchIndividualPlanQuotes={handleFetchQuotes}
                        loadingPlanButton={loadingPlanButton}
                      />
                    )}
                  </div>

                    {/* Product Grid - Show loading or display plans based on category */}
                    {selectedCategory === 'medigap' && (
                      // Only show loading screen for full category loads (Supplement Plans), not individual plan loads
                      expectedQuoteTypes.includes('Supplement Plans') && 
                      !completedQuoteTypes.includes('Supplement Plans') && 
                      !loadingPlanButton // Don't show loading screen when individual button is loading
                    ) ? (
                      /* Loading Screen for Medigap Quotes */
                      <GenericQuoteLoading 
                        title="Getting Your Medigap Quotes"
                        message="Searching for Medicare Supplement plans in your area..."
                      />
                    ) : selectedCategory === 'medigap' && realQuotes.length === 0 && (
                      // Show skeleton only when no quotes and not loading individual plans
                      !expectedQuoteTypes.includes('Supplement Plans') && !loadingPlanButton
                    ) ? (
                      /* Skeleton for Medigap */
                      <PlanCardsSkeleton count={6} title="Medicare Supplement Plans" />
                    ) : selectedCategory === 'dental' && isCategoryLoading('dental') ? (
                      /* Loading Screen for Dental Quotes */
                      <GenericQuoteLoading 
                        title="Getting Your Dental Insurance Quotes"
                        message="Searching for dental insurance plans in your area..."
                      />
                    ) : selectedCategory === 'dental' && dentalQuotes.length === 0 && !isCategoryLoading('dental') ? (
                      /* Skeleton for Dental */
                      <PlanCardsSkeleton count={5} title="Dental Insurance Plans" />
                    ) : selectedCategory === 'dental' && dentalQuotes.length > 0 ? (
                      /* Display Dental Plans */
                      <DentalShopContent 
                        quotes={dentalQuotes} 
                        isLoading={false} 
                      />
                    ) : selectedCategory === 'cancer' && isCategoryLoading('cancer') ? (
                      /* Loading Screen for Cancer Insurance Quotes */
                      <GenericQuoteLoading 
                        title="Getting Your Cancer Insurance Quotes"
                        message="Searching for cancer insurance plans in your area..."
                      />
                    ) : selectedCategory === 'cancer' && cancerInsuranceQuotes.length === 0 && !isCategoryLoading('cancer') ? (
                      /* Skeleton for Cancer Insurance */
                      <PlanCardsSkeleton count={4} title="Cancer Insurance Plans" />
                    ) : selectedCategory === 'cancer' && cancerInsuranceQuotes.length > 0 ? (
                      /* Display Cancer Insurance Plans */
                      <CancerInsuranceShopContent 
                        quotes={cancerInsuranceQuotes} 
                        isLoading={false} 
                      />
                    ) : selectedCategory === 'hospital-indemnity' && isCategoryLoading('hospital-indemnity') ? (
                      /* Loading Screen for Hospital Indemnity Quotes */
                      <GenericQuoteLoading 
                        title="Getting Your Hospital Indemnity Quotes"
                        message="Searching for hospital indemnity insurance plans in your area..."
                      />
                    ) : selectedCategory === 'hospital-indemnity' && hospitalIndemnityQuotes.length === 0 && !isCategoryLoading('hospital-indemnity') ? (
                      /* Skeleton for Hospital Indemnity */
                      <PlanCardsSkeleton count={4} title="Hospital Indemnity Plans" />
                    ) : selectedCategory === 'hospital-indemnity' && hospitalIndemnityQuotes.length > 0 ? (
                      /* Display Hospital Indemnity Plans */
                      <HospitalIndemnityShopContent 
                        quotes={hospitalIndemnityQuotes} 
                        isLoading={false} 
                      />
                    ) : selectedCategory === 'final-expense' && isCategoryLoading('final-expense') ? (
                      /* Loading Screen for Final Expense Quotes */
                      <GenericQuoteLoading 
                        title="Getting Your Final Expense Life Insurance Quotes"
                        message="Searching for final expense life insurance plans in your area..."
                      />
                    ) : selectedCategory === 'final-expense' && finalExpenseQuotes.length === 0 && !isCategoryLoading('final-expense') ? (
                      /* Skeleton for Final Expense */
                      <PlanCardsSkeleton count={5} title="Final Expense Life Insurance" />
                    ) : selectedCategory === 'final-expense' && finalExpenseQuotes.length > 0 ? (
                      /* Display Final Expense Plans */
                      <FinalExpenseShopContent 
                        quotes={finalExpenseQuotes} 
                        isLoading={false} 
                      />
                    ) : (
                      /* Display Medigap Plans */
                      (() => {
                        // Count actual unique plan types being displayed - this is bulletproof logic
                        const actualPlanTypesShowing = new Set();
                        paginatedData.forEach((carrierGroup: any) => {
                          carrierGroup.quotes?.forEach((quote: any) => {
                            if (quote.plan) {
                              actualPlanTypesShowing.add(quote.plan);
                            }
                          });
                        });
                        const actualPlanCount = actualPlanTypesShowing.size;
                        
                        console.log('🎯 LAYOUT DEBUG - Actual plan types showing:', Array.from(actualPlanTypesShowing), 'Count:', actualPlanCount);
                        
                        return (
                          <div className={`grid gap-6 ${
                            actualPlanCount === 1 
                              ? 'grid-cols-1 sm:grid-cols-2' 
                              : 'grid-cols-1'
                          }`}>
                            {isPlanLoading ? (
                              // Show skeleton loading state during plan changes
                              Array.from({ length: Math.min(paginatedData.length, 3) }).map((_, index) => (
                                <MedigapCarrierSkeleton 
                                  key={`skeleton-${index}`}
                                  planCount={actualPlanCount}
                                />
                              ))
                            ) : displayData.type === 'grouped' && (
                              // Use the dedicated MedigapCarrierGroup component with dynamic layout
                              paginatedData.map((carrierGroup: any) => (
                                <MedigapCarrierGroup
                                  key={`${carrierGroup.carrierId}-${Array.from(actualPlanTypesShowing).sort().join('-')}`}
                                  carrierGroup={carrierGroup}
                                  selectedQuotePlans={Array.from(actualPlanTypesShowing) as string[]}
                                  paymentMode={paymentMode}
                                  getCachedLogoUrl={getCachedLogoUrl}
                                  getCarrierDisplayName={getCarrierDisplayName}
                                  calculateDiscountedPrice={calculateDiscountedPrice}
                                  convertPriceByPaymentMode={convertPriceByPaymentMode}
                                  getPaymentLabel={getPaymentLabel}
                                  setShowPlanDifferencesModal={setShowPlanDifferencesModal}
                                  openPlanModal={openPlanModal}
                                  applyDiscounts={applyDiscounts}
                                />
                              ))
                            )}
                          </div>
                        );
                      })()
                    )}

                    {/* Pagination Controls */}
                    <PaginationControls
                      paginationInfo={paginationInfo}
                      setCurrentPage={setCurrentPage}
                    />
                </div>
              </main>
            </div>
          ) : (
            /* Landing Page with Flow Options */
            <div className="mt-8 -mx-4 sm:-mx-6 lg:-mx-8">
              <div className="px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-4xl mx-auto">
                  
                  {/* Simple Hero Header */}
                  <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-foreground mb-4">
                      Find Your Medicare Plan
                    </h1>
                    <p className="text-xl text-muted-foreground">
                      Choose how you'd like to get started
                    </p>
                  </div>

                  {/* Flow Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Guided Flow Option */}
                    <Card className="bg-card backdrop-blur-sm shadow-xl border border-border cursor-pointer hover:shadow-2xl transition-all duration-300">
                      <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                          <PersonIcon className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Guided Experience</h3>
                        <p className="text-muted-foreground mb-6">
                         We'll recommend the best plan types for you.
                        </p>
                        <button 
                          onClick={() => {
                            setMedicareFlowMode('guided');
                            setShowMedicareFlow(true);
                          }}
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                          Get Personalized Recommendations
                        </button>
                      </CardContent>
                    </Card>

                    {/* Quick Form Option */}
                    <Card className="bg-card backdrop-blur-sm shadow-xl border border-border">
                      <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                          <RocketIcon className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Quick Quote</h3>
                        <p className="text-muted-foreground mb-6">
                          Skip the questions and go straight to quotes.
                        </p>
                        <button 
                          onClick={() => {
                            setMedicareFlowMode('quick');
                            setShowMedicareFlow(true);
                          }}
                          className="w-full border border-border bg-card hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                          Get Quick Quotes
                        </button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          )}
              </>
            )}
          </>
        )}

      {/* Plan Differences Modal */}
      <PlanComparisonModal
        isOpen={showPlanDifferencesModal}
        onClose={setShowPlanDifferencesModal}
        selectedPlans={selectedQuotePlans}
      />

      {/* Medicare Disclaimer */}
      <MedicareDisclaimer />
    </MedicareShopLayout>
  );
}

// Export memoized component for better performance
export default React.memo(MedicareShopContent);
