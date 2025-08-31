"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import MedicareDisclaimer from "@/components/medicare-disclaimer";
import MedicareQuoteFlow from "@/components/MedicareQuoteFlow";
import { MedicareAdvantageShopContent } from "@/components/medicare-shop/advantage";
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
import { saveDentalQuotesToStorage, loadDentalQuotesFromStorage } from "@/lib/dental-storage";
import { quoteService } from "@/lib/services/quote-service";
import { carrierService } from "@/lib/services/carrier-service-simple";
import { getCarrierByNaicCode, getProperLogoUrl } from "@/lib/naic-carriers";
import { CrossCircledIcon, PersonIcon, RocketIcon } from "@radix-ui/react-icons";
import StorageDiagnostics from '@/components/StorageDiagnostics';

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
  ADVANTAGE_QUOTES_KEY,
  DRUG_PLAN_QUOTES_KEY,
  DENTAL_QUOTES_KEY,
  HOSPITAL_INDEMNITY_QUOTES_KEY,
  FINAL_EXPENSE_QUOTES_KEY,
  CANCER_INSURANCE_QUOTES_KEY
} from "@/components/medicare-shop/shared";

import {
  MedigapPlanTypeControls,
  MedigapEmptyState,
  MedigapCarrierGroup,
  MedigapResultsHeader,
  PlanComparisonModal
} from "@/components/medicare-shop/medigap";

import {
  DentalShopContent,
  DentalSidebar,
  DentalEmptyState
} from "@/components/medicare-shop/dental";

import {
  CancerInsuranceShopContent,
  CancerInsuranceSidebar,
  CancerInsuranceEmptyState
} from "@/components/medicare-shop/chs";

import {
  HospitalIndemnityShopContent,
  HospitalIndemnitySidebar,
  HospitalIndemnityEmptyState
} from "@/components/medicare-shop/hospital-indemnity";

import {
  FinalExpenseShopContent,
  FinalExpenseSidebar,
  FinalExpenseEmptyState
} from "@/components/medicare-shop/final-expense";

export default function MedicareShopContent() {
  // Core state from backup
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // UI State
  const [isInitializing, setIsInitializing] = useState(true);
  const [showMedicareFlow, setShowMedicareFlow] = useState(false);
  const [medicareFlowMode, setMedicareFlowMode] = useState<'guided' | 'quick'>('guided');
  const [showQuoteLoading, setShowQuoteLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState<string[]>([]); // Track specific items being loaded
  const [showPlanDifferencesModal, setShowPlanDifferencesModal] = useState(false);

  // Quote and form state
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
  const [selectedFlowCategories, setSelectedFlowCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('medigap');
  const [activeCategory, setActiveCategory] = useState('medigap');
  const [realQuotes, setRealQuotes] = useState<any[]>([]);
  const [advantageQuotes, setAdvantageQuotes] = useState<any[]>([]);
  const [drugPlanQuotes, setDrugPlanQuotes] = useState<any[]>([]);
  const [dentalQuotes, setDentalQuotes] = useState<OptimizedDentalQuote[]>([]);
  const [hospitalIndemnityQuotes, setHospitalIndemnityQuotes] = useState<OptimizedHospitalIndemnityQuote[]>([]);
  const [finalExpenseQuotes, setFinalExpenseQuotes] = useState<any[]>([]);
  const [cancerInsuranceQuotes, setCancerInsuranceQuotes] = useState<any[]>([]);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const [quotesReady, setQuotesReady] = useState(false); // Track when quotes are actually ready for display
  const [expectedQuoteTypes, setExpectedQuoteTypes] = useState<string[]>([]); // Track which quote types we're expecting
  const [startedQuoteTypes, setStartedQuoteTypes] = useState<string[]>([]); // Track which quote types have started API calls
  const [completedQuoteTypes, setCompletedQuoteTypes] = useState<string[]>([]); // Track completed quote types in real-time
  const [currentQuoteType, setCurrentQuoteType] = useState<string | null>(null); // Currently processing quote type
  const [totalExpectedQuotes, setTotalExpectedQuotes] = useState(0); // Total number of individual quotes expected
  const [hasAutoSwitched, setHasAutoSwitched] = useState(false); // Track if we've auto-switched to first completed category
  const [quotesError, setQuotesError] = useState<string | null>(null);
  const [loadingPlanButton, setLoadingPlanButton] = useState<string | null>(null);

  // Helper function to check if a specific category is currently loading
  const isCategoryLoading = (category: string) => {
    // Check if this category is expected but not yet completed
    const categoryMapping: Record<string, string> = {
      'medigap': 'medigap',
      'advantage': 'advantage', 
      'drug-plan': 'drug-plan',
      'dental': 'dental',
      'cancer': 'cancer',
      'hospital-indemnity': 'hospital-indemnity',
      'final-expense': 'final-expense'
    };
    
    const expectedType = categoryMapping[category];
    if (!expectedType) return false;
    
    // If we expect this type but haven't completed it yet, it's loading
    return expectedQuoteTypes.includes(expectedType) && !completedQuoteTypes.some(completed => {
      // Handle special cases for completion tracking
      if (expectedType === 'medigap') {
        return completed === 'Supplement Plans' || completed.startsWith('Plan ');
      }
      if (expectedType === 'advantage') {
        return completed === 'Medicare Advantage Plans';
      }
      if (expectedType === 'drug-plan') {
        return completed === 'Drug Plans';
      }
      if (expectedType === 'dental') {
        return completed === 'Dental Insurance';
      }
      if (expectedType === 'cancer') {
        return completed === 'Cancer Insurance';
      }
      if (expectedType === 'hospital-indemnity') {
        return completed === 'Hospital Indemnity';
      }
      if (expectedType === 'final-expense') {
        return completed === 'Final Expense Life';
      }
      return false;
    });
  };
  const [quoteFormCompleted, setQuoteFormCompleted] = useState(false);

  // Filter and display state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'popularity'>('popularity');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedCoverageLevel, setSelectedCoverageLevel] = useState('all');
  const [selectedMedigapPlans, setSelectedMedigapPlans] = useState(['plan-f', 'plan-g', 'plan-n']);
  const [selectedQuotePlans, setSelectedQuotePlans] = useState(['F', 'G', 'N']);
  const [applyDiscounts, setApplyDiscounts] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'monthly' | 'quarterly' | 'annually'>('monthly');
  const [currentPage, setCurrentPage] = useState(1);
  const [cart, setCart] = useState<any[]>([]);
  const [carrierLogos, setCarrierLogos] = useState<Record<string, string>>({});

  // Product categories for dropdown
  const productCategories = [
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
  ];

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

  // Initialize component with async storage loading
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        // Monitor storage usage on component initialization
        console.group('📊 Storage Status on Page Load');
        const storageInfo = await getFirestoreStorageInfo();
        console.log('� Firestore storage usage:', storageInfo.readable);
        console.log('📊 Total quotes across all categories:', storageInfo.totalQuotes);
        console.groupEnd();
        
        // Migrate legacy localStorage data if it exists
        await migrateLegacyStorage();
        
        // Load saved data from Firestore
        const [
          savedFormData,
          savedQuotes,
          savedAdvantageQuotes,
          savedDrugPlanQuotes,
          savedHospitalIndemnityQuotes,
          savedFinalExpenseQuotes,
          savedCancerInsuranceQuotes
        ] = await Promise.all([
          loadFromStorage(QUOTE_FORM_DATA_KEY, null),
          loadFromStorage(REAL_QUOTES_KEY, []),
          loadFromStorage(ADVANTAGE_QUOTES_KEY, []),
          loadFromStorage(DRUG_PLAN_QUOTES_KEY, []),
          loadFromStorage(HOSPITAL_INDEMNITY_QUOTES_KEY, []),
          loadFromStorage(FINAL_EXPENSE_QUOTES_KEY, []),
          loadFromStorage(CANCER_INSURANCE_QUOTES_KEY, [])
        ]);

        // Load UI state from localStorage
        const savedCategories = loadSelectedCategories();
        const savedActiveCategory = loadCurrentFlowStep();

        // Load optimized dental quotes from storage
        const savedDentalData = await loadDentalQuotesFromStorage();
        const savedDentalQuotes = savedDentalData ? savedDentalData.quotes : [];

        // Check URL for category parameter - this takes precedence
        const urlCategory = searchParams.get('category');
        const initialCategory = (urlCategory === 'medigap' || urlCategory === 'advantage' || urlCategory === 'drug-plan' || 
                                urlCategory === 'dental' || urlCategory === 'cancer' || urlCategory === 'hospital-indemnity' || 
                                urlCategory === 'final-expense') 
          ? urlCategory 
          : savedActiveCategory;

        if (savedFormData) {
          setQuoteFormData(savedFormData);
        }
        if (savedCategories && Array.isArray(savedCategories)) {
          console.log('� Loading saved categories from Firestore:', savedCategories);
          setSelectedFlowCategories(savedCategories);
        } else {
          console.log('📋 No saved categories found in Firestore');
        }
        if (savedQuotes && Array.isArray(savedQuotes)) {
          console.log('� Loading realQuotes from Firestore:', savedQuotes.length, 'quotes');
          console.log('📋 First realQuote sample:', savedQuotes[0]);
          setRealQuotes(savedQuotes);
        }
        if (savedAdvantageQuotes && Array.isArray(savedAdvantageQuotes)) {
          console.log('� Loading advantageQuotes from Firestore:', savedAdvantageQuotes.length, 'quotes');
          console.log('📋 First advantageQuote sample:', savedAdvantageQuotes[0]);
          setAdvantageQuotes(savedAdvantageQuotes);
        }
        if (savedDrugPlanQuotes && Array.isArray(savedDrugPlanQuotes)) {
          console.log('📋 Loading drugPlanQuotes from storage:', savedDrugPlanQuotes.length, 'quotes');
          console.log('📋 First drugPlanQuote sample:', savedDrugPlanQuotes[0]);
          setDrugPlanQuotes(savedDrugPlanQuotes);
        }
        if (savedDentalQuotes && Array.isArray(savedDentalQuotes)) {
          setDentalQuotes(savedDentalQuotes);
        }
        if (savedHospitalIndemnityQuotes && Array.isArray(savedHospitalIndemnityQuotes)) {
          // Check if these are already optimized quotes (have 'planName' field)
          // or raw quotes (have 'plan_name' field)
          if (savedHospitalIndemnityQuotes.length > 0) {
            const firstQuote = savedHospitalIndemnityQuotes[0];
            if (firstQuote.planName) {
              // Already optimized quotes
              setHospitalIndemnityQuotes(savedHospitalIndemnityQuotes);
            } else if (firstQuote.plan_name) {
              // Raw quotes that need optimization and 2025 filtering
              console.log('🔄 Converting saved raw hospital indemnity quotes...');
              const optimized = optimizeHospitalIndemnityQuotes(savedHospitalIndemnityQuotes);
              setHospitalIndemnityQuotes(optimized);
              // Save the optimized version back to storage
              await saveToStorage(HOSPITAL_INDEMNITY_QUOTES_KEY, optimized);
            }
          }
        }
        if (savedFinalExpenseQuotes && Array.isArray(savedFinalExpenseQuotes)) {
          console.log('� Loading final expense quotes from Firestore:', savedFinalExpenseQuotes.length, 'quotes');
          console.log('💾 Sample final expense quote:', savedFinalExpenseQuotes[0]);
          setFinalExpenseQuotes(savedFinalExpenseQuotes);
        } else {
          console.log('💾 No final expense quotes found in localStorage');
        }
        if (savedCancerInsuranceQuotes && Array.isArray(savedCancerInsuranceQuotes)) {
          console.log('� Loading cancer insurance quotes from Firestore:', savedCancerInsuranceQuotes.length, 'quotes');
          setCancerInsuranceQuotes(savedCancerInsuranceQuotes);
        }
        
        // Auto-detect categories if not properly saved but quotes exist
        if (!savedCategories || savedCategories.length === 0) {
          const detectedCategories = [];
          if (savedQuotes && savedQuotes.length > 0) detectedCategories.push('medigap');
          if (savedAdvantageQuotes && savedAdvantageQuotes.length > 0) detectedCategories.push('advantage');
          if (savedDrugPlanQuotes && savedDrugPlanQuotes.length > 0) detectedCategories.push('drug-plan');
          if (savedDentalQuotes && savedDentalQuotes.length > 0) detectedCategories.push('dental');
          if (savedHospitalIndemnityQuotes && savedHospitalIndemnityQuotes.length > 0) detectedCategories.push('hospital-indemnity');
          if (savedFinalExpenseQuotes && savedFinalExpenseQuotes.length > 0) detectedCategories.push('final-expense');
          if (savedCancerInsuranceQuotes && savedCancerInsuranceQuotes.length > 0) detectedCategories.push('cancer');
          
          if (detectedCategories.length > 0) {
            console.log('🔍 Auto-detected categories from existing quotes:', detectedCategories);
            console.log('📋 Detected categories from quotes:', detectedCategories);
            setSelectedFlowCategories(detectedCategories);
            saveSelectedCategories(detectedCategories);
          }
        }
        
        setActiveCategory(initialCategory);
        setSelectedCategory(initialCategory);

        setIsInitializing(false);
      } catch (error) {
        console.error('Error initializing component:', error);
        setIsInitializing(false);
      }
    };

    initializeComponent();
  }, [searchParams]);

  // Helper functions from backup
  const hasQuotes = () => {
    const result = (realQuotes?.length > 0) || (advantageQuotes?.length > 0) || (drugPlanQuotes?.length > 0) || 
           (dentalQuotes?.length > 0) || (hospitalIndemnityQuotes?.length > 0) || 
           (finalExpenseQuotes?.length > 0) || (cancerInsuranceQuotes?.length > 0) || 
           (selectedFlowCategories?.length > 0);
    
    console.log('🔍 hasQuotes check:', {
      result,
      realQuotes: realQuotes?.length || 0,
      advantageQuotes: advantageQuotes?.length || 0,
      drugPlanQuotes: drugPlanQuotes?.length || 0,
      dentalQuotes: dentalQuotes?.length || 0,
      hospitalIndemnityQuotes: hospitalIndemnityQuotes?.length || 0,
      finalExpenseQuotes: finalExpenseQuotes?.length || 0,
      cancerInsuranceQuotes: cancerInsuranceQuotes?.length || 0,
      selectedFlowCategories: selectedFlowCategories?.length || 0,
      categories: selectedFlowCategories
    });
    
    return result;
  };

  const hasQuotesForPlan = (planType: string) => {
    return realQuotes?.some(quote => quote?.plan === planType) || false;
  };

  const fetchIndividualPlanQuotes = useCallback(async (planType: string, formData?: any) => {
    setLoadingPlanButton(planType);
    
    try {
      console.log(`Fetching quotes for plan type: ${planType}`);
      
      // Use stored form data if not provided
      const dataToUse = formData || loadFromStorage(QUOTE_FORM_DATA_KEY, null);
      
      if (!dataToUse) {
        console.log('⚠️ Form data incomplete for individual plan fetch');
        return [];
      }

      // Handle individual medigap plan letters (F, G, N)
      if (['F', 'G', 'N'].includes(planType)) {
        // Set loading items for individual plan
        setLoadingItems([`Plan ${planType}`]);
        
        const quoteParams = {
          zipCode: dataToUse.zipCode,
          age: dataToUse.age.toString(),
          gender: dataToUse.gender === 'male' ? 'M' as const : 'F' as const,
          tobacco: dataToUse.tobaccoUse ? "1" as const : "0" as const,
          plans: [planType], // Only fetch for this specific plan
        };

        console.log(`Fetching Plan ${planType} quotes with params:`, quoteParams);
        
        const result = await getMedigapQuotes(quoteParams);
        
        if (result?.quotes && result.quotes.length > 0) {
          console.log(`✅ Success! Received ${result.quotes.length} quotes for Plan ${planType}`);
          
          // Add the new quotes to existing quotes (merge, don't replace)
          setRealQuotes(prev => [...prev, ...result.quotes || []]);
          
          // Add the plan to selected plans if not already included
          setSelectedQuotePlans(prev => 
            prev.includes(planType) ? prev : [...prev, planType]
          );
          
          await preloadCarrierLogos(result.quotes);
          return result.quotes;
        } else {
          console.log(`❌ No quotes received for Plan ${planType}`);
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
        console.log('Received medigap quotes result:', result);
        
        if (result?.quotes && result.quotes.length > 0) {
          await preloadCarrierLogos(result.quotes);
          setRealQuotes(result.quotes);
          setActiveCategory('medigap');
          setSelectedCategory('medigap');
          return result.quotes;
        }
      } else if (planType === 'advantage') {
        setLoadingItems(['Medicare Advantage Plans']);
        
        const result = await getMedicareAdvantageQuotes(dataToUse);
        console.log('Received advantage quotes result:', result);
        
        if (result?.quotes && result.quotes.length > 0) {
          await preloadCarrierLogos(result.quotes);
          setRealQuotes(result.quotes);
          setActiveCategory('advantage');
          setSelectedCategory('advantage');
          return result.quotes;
        }
      } else if (planType === 'drug-plan') {
        setLoadingItems(['Drug Plans']);
        
        const result = await getDrugPlanQuotes(dataToUse);
        console.log('Received drug plan quotes result:', result);
        
        if (result?.quotes && result.quotes.length > 0) {
          await preloadCarrierLogos(result.quotes);
          setDrugPlanQuotes(result.quotes);
          setActiveCategory('drug-plan');
          setSelectedCategory('drug-plan');
          return result.quotes;
        }
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching ${planType} quotes:`, error);
      return [];
    } finally {
      setLoadingPlanButton(null);
      setLoadingItems([]); // Clear loading items when individual fetch is complete
    }
  }, [preloadCarrierLogos]);

  // Wrapper function for component compatibility
  const handleFetchQuotes = (planType: string) => {
    fetchIndividualPlanQuotes(planType);
  };

  // Persist advantage quotes to Firestore when they change
  useEffect(() => {
    if (advantageQuotes.length > 0) {
      saveToStorage(ADVANTAGE_QUOTES_KEY, advantageQuotes);
    }
  }, [advantageQuotes]);

  // Persist supplement quotes to Firestore when they change
  useEffect(() => {
    if (realQuotes.length > 0) {
      saveToStorage(REAL_QUOTES_KEY, realQuotes);
    }
  }, [realQuotes]);

  // Persist drug plan quotes to Firestore when they change
  useEffect(() => {
    if (drugPlanQuotes.length > 0) {
      saveToStorage(DRUG_PLAN_QUOTES_KEY, drugPlanQuotes);
    }
  }, [drugPlanQuotes]);

  // Persist final expense quotes to Firestore when they change
  useEffect(() => {
    if (finalExpenseQuotes.length > 0) {
      saveToStorage(FINAL_EXPENSE_QUOTES_KEY, finalExpenseQuotes);
    }
  }, [finalExpenseQuotes]);

  // Persist hospital indemnity quotes to Firestore when they change
  useEffect(() => {
    if (hospitalIndemnityQuotes.length > 0) {
      saveToStorage(HOSPITAL_INDEMNITY_QUOTES_KEY, hospitalIndemnityQuotes);
    }
  }, [hospitalIndemnityQuotes]);

  // Persist cancer insurance quotes to Firestore when they change
  useEffect(() => {
    if (cancerInsuranceQuotes.length > 0) {
      saveToStorage(CANCER_INSURANCE_QUOTES_KEY, cancerInsuranceQuotes);
    }
  }, [cancerInsuranceQuotes]);

  // Persist dental quotes to Firestore when they change
  useEffect(() => {
    if (dentalQuotes.length > 0) {
      saveToStorage(DENTAL_QUOTES_KEY, dentalQuotes);
    }
  }, [dentalQuotes]);

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
      console.log('All expected quotes are ready!');
      setQuotesReady(true);
    } else if (!hasAllExpectedQuotes) {
      // Debug logging to help diagnose loading issues
      console.log('Quotes status check:', {
        expectedQuoteTypes,
        realQuotes: realQuotes.length,
        advantageQuotes: advantageQuotes.length,
        drugPlanQuotes: drugPlanQuotes.length,
        dentalQuotes: dentalQuotes.length,
        hospitalIndemnityQuotes: hospitalIndemnityQuotes.length,
        finalExpenseQuotes: finalExpenseQuotes.length,
        cancerInsuranceQuotes: cancerInsuranceQuotes.length,
        hasAllExpectedQuotes,
        quotesReady
      });
    }
  }, [realQuotes, advantageQuotes, drugPlanQuotes, dentalQuotes, hospitalIndemnityQuotes, finalExpenseQuotes, cancerInsuranceQuotes, expectedQuoteTypes, quotesReady]);

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

  // Auto-switch to first completed category when parallel quotes finish
  useEffect(() => {
    if (completedQuoteTypes.length > 0 && !hasAutoSwitched && showQuoteLoading) {
      // Add a small delay to allow multiple quotes to potentially complete 
      // and prioritize the most common/important categories
      const timer = setTimeout(() => {
        // Map completed quote types to category IDs
        const categoryMapping: Record<string, string> = {
          'Supplement Plans': 'medigap',
          'Plan F': 'medigap',
          'Plan G': 'medigap', 
          'Plan N': 'medigap',
          'Medicare Advantage Plans': 'advantage',
          'Drug Plans': 'drug-plan',
          'Dental Insurance': 'dental',
          'Cancer Insurance': 'cancer',
          'Hospital Indemnity': 'hospital-indemnity',
          'Final Expense Life': 'final-expense'
        };

        // Priority order for auto-switching (most common Medicare categories first)
        const priorityOrder = ['medigap', 'advantage', 'drug-plan', 'dental', 'cancer', 'hospital-indemnity', 'final-expense'];
        
        // Find the highest priority completed category
        let firstCompletedCategory: string | null = null;
        for (const priority of priorityOrder) {
          const matchingType = completedQuoteTypes.find(type => categoryMapping[type] === priority);
          if (matchingType) {
            firstCompletedCategory = priority;
            break;
          }
        }
        
        if (firstCompletedCategory) {
          console.log(`🎯 Auto-switching to first completed category: ${firstCompletedCategory} (from ${completedQuoteTypes.length} completed types)`);
          
          // Set the category to switch to
          setSelectedCategory(firstCompletedCategory);
          setActiveCategory(firstCompletedCategory);
          
          // Update URL to reflect the auto-selected category
          const params = new URLSearchParams(searchParams.toString());
          params.set('category', firstCompletedCategory);
          router.push(`${pathname}?${params.toString()}`);
          
          // Mark that we've auto-switched
          setHasAutoSwitched(true);
        }
      }, 1000); // 1 second delay to allow multiple quotes to complete

      return () => clearTimeout(timer);
    }
  }, [completedQuoteTypes, hasAutoSwitched, showQuoteLoading, searchParams, pathname, router]);

  // Handle quote form submission
  const handleQuoteFormSubmit = async () => {
    console.log('🔥 handleQuoteFormSubmit called');
    console.log('🔥 quoteFormData:', quoteFormData);
    console.log('🔥 selectedCategory:', selectedCategory);
    
    // Use the conditional validation by calling handleQuoteFormSubmitWithData
    await handleQuoteFormSubmitWithData(quoteFormData, selectedCategory);
  };

  // Handle quote form submission with specific form data (for async state issues)
  const handleQuoteFormSubmitWithData = async (formData: QuoteFormData, category?: string, plansList?: string[], manageLoadingState: boolean = true) => {
    const targetCategory = category || selectedCategory;
    console.log('🔥 handleQuoteFormSubmitWithData called');
    console.log('🔥 formData:', formData);
    console.log('🔥 formData.age:', formData.age, 'type:', typeof formData.age);
    console.log('🔥 targetCategory:', targetCategory);
    console.log('🔥 plansList:', plansList);
    console.log('🔥 manageLoadingState:', manageLoadingState);
    console.log('🔥 selectedCategory state:', selectedCategory);
    
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
    
    // Set specific loading items based on what's being requested (only if managing state)
    if (manageLoadingState) {
      if (targetCategory === 'medigap') {
        const plansToFetch = plansList || selectedQuotePlans;
        const planNames = plansToFetch.length > 1 
          ? ['Supplement Plans'] 
          : plansToFetch.map(plan => {
              const planLetter = plan.replace('plan-', '').toUpperCase();
              return `Plan ${planLetter}`;
            });
        setLoadingItems(planNames);
      } else if (targetCategory === 'advantage') {
        setLoadingItems(['Medicare Advantage Plans']);
      } else if (targetCategory === 'drug-plan') {
        setLoadingItems(['Drug Plans']);
      } else if (targetCategory === 'dental') {
        setLoadingItems(['Dental Insurance']);
      } else if (targetCategory === 'cancer') {
        setLoadingItems(['Cancer Insurance']);
      } else if (targetCategory === 'hospital-indemnity') {
        setLoadingItems(['Hospital Indemnity']);
      } else if (targetCategory === 'final-expense') {
        setLoadingItems(['Final Expense Life']);
      }
    }
    
    // Clear quotes for the specific category (only in non-parallel mode)
    if (manageLoadingState) {
      if (targetCategory === 'medigap') {
        setRealQuotes([]);
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
    }
    
    try {
      // Only get quotes for the specified category
      if (targetCategory === 'medigap') {
        console.log('🔥 Category is medigap, proceeding with API call...');
        const plansToFetch = plansList || selectedQuotePlans;
        console.log('🔥 Selected quote plans to fetch:', plansToFetch);
        
        // Set current quote type based on number of plans
        if (plansToFetch.length > 1) {
          setCurrentQuoteType('Supplement Plans');
        } else {
          // Convert plan-x format to Plan X format for single plan
          const planLetter = plansToFetch[0].replace('plan-', '').toUpperCase();
          setCurrentQuoteType(`Plan ${planLetter}`);
        }
        
        // Convert form data to API format for our enhanced getMedigapQuotes action
        const quoteParams = {
          zipCode: formData.zipCode,
          age: getSafeAge(formData.age).toString(),
          gender: formData.gender === 'male' ? 'M' as const : 'F' as const,
          tobacco: formData.tobaccoUse ? "1" as const : "0" as const,
          plans: plansToFetch.length > 0 ? plansToFetch : ['F', 'G', 'N'], // Use selected plans from parameter or state
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
          
          // Save drug plan quotes to Firestore
          await saveToStorage(DRUG_PLAN_QUOTES_KEY, response.quotes);
          
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
            console.log('✅ Dental quotes optimization successful!');
            setDentalQuotes(optimizationResult.quotes);
            
            // Save optimized dental quotes using specialized storage function
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
              console.log('💾 Optimized dental quotes saved to localStorage');
            } else {
              console.error('❌ Failed to save optimized dental quotes');
              // Fallback to regular storage
              await saveToStorage(DENTAL_QUOTES_KEY, optimizationResult.quotes);
            }
            
            // Mark Dental Insurance as completed
            setCompletedQuoteTypes(prev => [...prev, 'Dental Insurance']);
            setCurrentQuoteType(null);
            
            // Set quotes as ready if this is the only expected type
            if (expectedQuoteTypes.length === 1 && expectedQuoteTypes.includes('dental')) {
              setQuotesReady(true);
            }
            
            // Navigate to dental results view
            setActiveCategory('dental');
            setSelectedCategory('dental');
            
            // Update URL to reflect dental category
            const params = new URLSearchParams(searchParams);
            params.set('category', 'dental');
            router.push(`${pathname}?${params.toString()}`);
            
            // Preload carrier logos for better user experience
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
                    naic: quote.company_base?.naic || '',
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
            
            // Navigate to dental results view
            setActiveCategory('dental');
            setSelectedCategory('dental');
            
            // Update URL to reflect dental category
            const params = new URLSearchParams(searchParams);
            params.set('category', 'dental');
            router.push(`${pathname}?${params.toString()}`);
            
            // Preload carrier logos for better user experience
            preloadCarrierLogos(response.quotes);
          }
        } else {
          console.log('🔥 No dental quotes found');
          setQuotesError('No dental insurance plans found for your area and criteria');
        }
      } else if (targetCategory === 'cancer') {
        console.log('🔥 Category is cancer, proceeding with API call...');
        
        setCurrentQuoteType('Cancer Insurance');
        
        // Convert formData to CancerInsuranceQuoteParams format - using minimal required parameters
        const cancerParams = {
          state: 'TX' as const, // Cancer insurance is only available in Texas
          age: getSafeAge(formData.age),
          familyType: 'Applicant Only' as const, // Use default for broader coverage
          tobaccoStatus: formData.tobaccoUse ? 'Tobacco' as const : 'Non-Tobacco' as const,
          premiumMode: 'Monthly Bank Draft' as const, // Use most common payment mode
          carcinomaInSitu: '25%' as const, // Use default conservative option
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
      
      // Immediately save the completion status to Firestore to ensure persistence
      await saveToStorage(QUOTE_FORM_COMPLETED_KEY, true);
      
      // Update URL to indicate results are shown
      const newUrl = `${pathname}?step=results${targetCategory ? `&category=${targetCategory}` : ''}`;
      window.history.replaceState(null, '', newUrl);
      
    } catch (error) {
      console.error('🔥 Error in quote submission:', error);
      
      // Enhanced error handling for Firebase function errors
      let errorMessage = 'An error occurred while fetching quotes';
      
      if (error && typeof error === 'object') {
        // Handle Firebase function errors specifically
        const firebaseError = error as any; // Firebase errors have non-standard typing
        
        if (firebaseError.code === 'functions/internal') {
          errorMessage = `Service temporarily unavailable for ${targetCategory} quotes. Please try again in a few moments.`;
          console.error(`🔥 Firebase function internal error for ${targetCategory}:`, error);
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
    // Implementation from backup
    let price = quote.monthly_premium || quote.premium || 0;
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
    // Use carrierId as the naicCode since that's what the API returns
    const carrierKey = carrierId || carrierName;
    
    // Check if we have a cached logo URL
    if (carrierLogos[carrierKey]) {
      const cachedUrl = carrierLogos[carrierKey];
      
      // Check if the cached URL is a bad NAIC-based URL (like https://logo.clearbit.com/60219.com)
      // If the URL ends with a 5-digit number followed by .com, it's likely a NAIC code URL
      const isBadNaicUrl = /https:\/\/logo\.clearbit\.com\/\d{5}\.com$/i.test(cachedUrl);
      
      if (!isBadNaicUrl) {
        console.log(`Using cached logo for ${carrierKey}:`, cachedUrl);
        return cachedUrl;
      } else {
        console.log(`Ignoring bad cached NAIC-based logo URL for ${carrierKey}:`, cachedUrl);
        // Remove the bad cached URL
        delete carrierLogos[carrierKey];
      }
    }
    
    // Use the proper logo URL function from NAIC carriers
    const logoUrl = getProperLogoUrl(carrierId, carrierName);
    console.log(`Generated logo URL for NAIC ${carrierId}, carrier "${carrierName}":`, logoUrl);
    return logoUrl;
  };

  // Get the display name for a carrier (prefer short name from NAIC data)
  const getCarrierDisplayName = (carrierName: string, carrierId: string): string => {
    // Try to get the carrier from NAIC data using the carrierId (which should be the NAIC code)
    const naicCarrier = getCarrierByNaicCode(carrierId);
    if (naicCarrier?.shortName) {
      return naicCarrier.shortName;
    }
    
    // Fallback to the original carrier name
    return carrierName;
  };

  const openPlanModal = (carrierGroup: any) => {
    console.log('Opening plan modal for:', carrierGroup);
    
    try {
      // Store the data for plan details page
      const planDetailsData = {
        carrierGroup: carrierGroup
      };
      
      // Store in localStorage for plan details page to access
      localStorage.setItem('planDetailsData', JSON.stringify(planDetailsData));
      
      // Store return URL so user can come back to current page
      const currentUrl = window.location.href;
      localStorage.setItem('planDetailsReturnUrl', currentUrl);
      
      // Navigate to plan details page
      router.push('/plan-details');
    } catch (error) {
      console.error('Error opening plan details:', error);
      // Could add toast notification here for user feedback
    }
  };

  const handleCategoryToggle = (category: 'medigap' | 'advantage' | 'drug-plan' | 'dental' | 'cancer' | 'hospital-indemnity' | 'final-expense') => {
    setActiveCategory(category);
    setSelectedCategory(category);
    saveToStorage('activeCategory', category); // Fire and forget - no await needed for UI performance
    
    // Update URL to reflect the new category
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', category);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
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
          ? data.selectedMedigapPlans 
          : ['F', 'G', 'N'];
        const planNames = selectedPlans.length > 1 
          ? ['Supplement Plans'] 
          : selectedPlans.map((plan: string) => {
              const planLetter = plan.replace('plan-', '').toUpperCase();
              return `Plan ${planLetter}`;
            });
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
          ? data.selectedMedigapPlans 
          : ['F', 'G', 'N'];
        setSelectedQuotePlans(selectedPlans);
        
        const planNames = selectedPlans.length > 1 
          ? ['Supplement Plans'] 
          : selectedPlans.map((plan: string) => {
              const planLetter = plan.replace('plan-', '').toUpperCase();
              return `Plan ${planLetter}`;
            });
        
        loadingItemsList.push(...planNames);
        executionPlan.push({
          category: 'medigap',
          plans: selectedPlans,
          displayName: planNames.length > 1 ? 'Supplement Plans' : `Plan ${selectedPlans[0].replace('plan-', '').toUpperCase()}`
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
      
      // Set initial category for URL
      const firstCategory = executionPlan[0]?.category || 'medigap';
      setSelectedCategory(firstCategory);
      setActiveCategory(firstCategory);
      
      // Update URL
      const params = new URLSearchParams(searchParams.toString());
      params.set('category', firstCategory);
      router.push(`${pathname}?${params.toString()}`);
      
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
      
      // Log storage usage after all quotes are saved
      console.group('📊 Storage Status After Quote Completion');
      try {
        const finalStorageInfo = await getFirestoreStorageInfo();
        console.log('� Final Firestore storage usage:', finalStorageInfo.readable);
        console.log('📦 Total quotes stored:', finalStorageInfo.totalQuotes);
      } catch (error) {
        console.warn('Could not get storage info:', error);
      }
      console.groupEnd();
      
      // Loading will be hidden automatically by useEffect when quotes are ready
      
      setQuoteFormCompleted(true);
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
    setCurrentQuoteType(null);
    setTotalExpectedQuotes(0);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPriceRange([0, 500]);
    setSelectedCoverageLevel('all');
    setSortBy('popularity');
    setSelectedMedigapPlans(['plan-f', 'plan-g', 'plan-n']);
    setSelectedQuotePlans(['F', 'G', 'N']);
    setApplyDiscounts(false);
    setPaymentMode('monthly');
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedQuotePlans(['F', 'G', 'N']);
  };

  // Display data processing - handle both real quotes types
  const displayData = React.useMemo(() => {
    if (selectedCategory === 'medigap' && realQuotes?.length > 0) {
      // Group by carrier for medigap
      const filteredQuotes = realQuotes.filter(quote => {
        const matchesPlan = selectedQuotePlans?.includes(quote?.plan || '') || false;
        if (searchQuery && matchesPlan) {
          const carrierId = quote?.carrier?.naic || quote?.company_base?.naic || quote?.naic || 'unknown';
          const carrierName = quote?.carrier?.name || 
                             quote?.company_base?.name ||
                             quote?.company ||
                             'Unknown Carrier';
          const displayName = getCarrierDisplayName(carrierName, carrierId);
          
          // Search against both original name and short name
          return carrierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 displayName.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return matchesPlan;
      });

      const groupedByCarrier = filteredQuotes.reduce((groups: Record<string, any>, quote: any) => {
        const carrierId = quote.carrier?.naic || quote.company_base?.naic || quote.naic || 'unknown';
        const carrierName = quote.carrier?.name || quote.company_base?.name || quote.company || 'Unknown Carrier';
        const displayName = getCarrierDisplayName(carrierName, carrierId);
        
        if (!groups[carrierId]) {
          groups[carrierId] = {
            carrierId,
            carrierName: displayName, // Use the display name (short name when available)
            originalCarrierName: carrierName, // Keep original name for fallback
            quotes: []
          };
        }
        groups[carrierId].quotes.push(quote);
        return groups;
      }, {});

      return {
        type: 'grouped' as const,
        data: Object.values(groupedByCarrier)
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
  }, [selectedCategory, realQuotes, advantageQuotes, selectedQuotePlans, searchQuery]);

  // Pagination
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

  return (
    <MedicareShopLayout
      hasQuotes={hasQuotes()}
      cartCount={cart.length}
      selectedFlowCategories={selectedFlowCategories}
      activeCategory={activeCategory}
      selectedCategory={selectedCategory}
      productCategories={productCategories}
      onCategoryToggle={handleCategoryToggle}
      onCategorySelect={handleCategorySelect}
      onReset={clearStorageAndReset}
    >
      {/* Show loading spinner while initializing */}
      {isInitializing ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading your Medicare plans...</p>
          </div>
        </div>
      ) : showQuoteLoading ? (
        /* Show loading page between flow and results */
        <MedicareQuoteLoadingPage
          loadingItems={loadingItems}
          zipCode={quoteFormData.zipCode}
          age={quoteFormData.age?.toString()}
          selectedCategories={selectedFlowCategories}
          useExternalProgress={true}
          externalProgress={quotesReady ? 100 : 75} // Fallback progress
          completedQuoteTypes={completedQuoteTypes}
          startedQuoteTypes={startedQuoteTypes}
          currentQuoteType={currentQuoteType || undefined}
          totalExpectedQuotes={totalExpectedQuotes}
          onComplete={() => {
            console.log('Loading page onComplete triggered', { quotesReady, hasQuotes: hasQuotes() });
            // Always hide loading after a delay, even if quotesReady is false
            // This prevents users from getting stuck on loading page
            if (quotesReady || hasQuotes()) {
              setShowQuoteLoading(false);
            } else {
              // Fallback: hide loading after 2 seconds even if quotes aren't marked as ready
              // This can happen if there's a state sync issue
              console.warn('Forcing loading page to close - quotes may not be properly synced');
              setTimeout(() => {
                setShowQuoteLoading(false);
              }, 2000);
            }
          }}
        />
      ) : selectedCategory === 'advantage' || activeCategory === 'advantage' ? (
        /* Route to dedicated Medicare Advantage component */
        <MedicareAdvantageShopContent 
          isExternallyLoading={isCategoryLoading('advantage')}
        />
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
          ) : hasQuotes() ? (
            /* Show Plans When There Are Quotes */
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Enhanced Sidebar with Combined Filters */}
              <MedicareShopSidebar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                sortBy={sortBy}
                setSortBy={setSortBy}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                selectedCoverageLevel={selectedCoverageLevel}
                setSelectedCoverageLevel={setSelectedCoverageLevel}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
                selectedMedigapPlans={selectedMedigapPlans}
                setSelectedMedigapPlans={setSelectedMedigapPlans}
                applyDiscounts={applyDiscounts}
                setApplyDiscounts={setApplyDiscounts}
                paymentMode={paymentMode}
                setPaymentMode={setPaymentMode}
                quoteFormData={quoteFormData}
                realQuotes={realQuotes}
                selectedQuotePlans={selectedQuotePlans}
                onClearFilters={clearFilters}
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

                {/* Storage Diagnostics - Temporary Debug Tool */}
                {process.env.NODE_ENV === 'development' && (
                  <StorageDiagnostics 
                    onDataRestored={() => {
                      // Refresh the page or reload data
                      window.location.reload();
                    }}
                  />
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
                        setSelectedQuotePlans={setSelectedQuotePlans}
                        hasQuotesForPlan={hasQuotesForPlan}
                        fetchIndividualPlanQuotes={handleFetchQuotes}
                        loadingPlanButton={loadingPlanButton}
                      />
                    )}
                  </div>

                    {/* Product Grid - Show loading or display plans based on category */}
                    {selectedCategory === 'medigap' && isLoadingQuotes ? (
                      /* Loading Screen for Medigap Quotes */
                      <GenericQuoteLoading 
                        title="Getting Your Medigap Quotes"
                        message="Searching for Medicare Supplement plans in your area..."
                      />
                    ) : selectedCategory === 'medigap' && realQuotes.length === 0 && !isLoadingQuotes && !isCategoryLoading('medigap') ? (
                      /* Empty State for Medigap */
                      <MedigapEmptyState onResetFilters={resetFilters} />
                    ) : selectedCategory === 'medigap' && realQuotes.length === 0 && isCategoryLoading('medigap') ? (
                      /* Loading State for Medigap (when expected but not completed) */
                      <GenericQuoteLoading 
                        title="Getting Your Medigap Quotes"
                        message="Searching for Medicare Supplement plans in your area..."
                      />
                    ) : selectedCategory === 'drug-plan' && isLoadingQuotes ? (
                      /* Loading Screen for Drug Plan Quotes */
                      <GenericQuoteLoading 
                        title="Getting Your Drug Plan Quotes"
                        message="Searching for Drug Plan (PDP) coverage in your area..."
                      />
                    ) : selectedCategory === 'drug-plan' && drugPlanQuotes.length === 0 && !isLoadingQuotes && !isCategoryLoading('drug-plan') ? (
                      /* Empty State for Drug Plans */
                      <div className="text-center py-12">
                        <p className="text-muted-foreground mb-4">No drug plans found for your area.</p>
                        <button 
                          onClick={() => window.location.reload()} 
                          className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md text-sm font-medium"
                        >
                          Try Again
                        </button>
                      </div>
                    ) : selectedCategory === 'drug-plan' && drugPlanQuotes.length === 0 && isCategoryLoading('drug-plan') ? (
                      /* Loading State for Drug Plans (when expected but not completed) */
                      <GenericQuoteLoading 
                        title="Getting Your Drug Plan Quotes"
                        message="Searching for Drug Plan (PDP) coverage in your area..."
                      />
                    ) : selectedCategory === 'drug-plan' && drugPlanQuotes.length > 0 ? (
                      /* Display Drug Plans */
                      <div className="space-y-6">
                        {isCategoryLoading('drug-plan') ? (
                          /* Loading overlay for drug plans */
                          <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                              <div key={i} className="bg-card border rounded-lg p-6 animate-pulse">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                                  </div>
                                  <div className="text-right">
                                    <div className="h-8 bg-gray-200 rounded w-20 mb-1"></div>
                                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                  <div className="h-4 bg-gray-200 rounded"></div>
                                  <div className="h-4 bg-gray-200 rounded"></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          /* Actual drug plan data */
                          paginatedData.map((quote: any, index: number) => (
                          <div key={index} className="bg-card border rounded-lg p-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {quote?.carrier?.name || quote?.company || 'Unknown Plan'}
                                </h3>
                                <p className="text-muted-foreground">
                                  {quote?.plan_name || 'Drug Plan'}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold">
                                  ${quote?.monthlyPremium || quote?.premium || quote?.monthly_premium || 'N/A'}
                                  <span className="text-sm font-normal text-muted-foreground">/month</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                        )}
                      </div>
                    ) : selectedCategory === 'dental' && isLoadingQuotes ? (
                      /* Loading Screen for Dental Quotes */
                      <GenericQuoteLoading 
                        title="Getting Your Dental Insurance Quotes"
                        message="Searching for dental insurance plans in your area..."
                      />
                    ) : selectedCategory === 'dental' && dentalQuotes.length === 0 && !isLoadingQuotes && !isCategoryLoading('dental') ? (
                      /* Empty State for Dental */
                      <DentalEmptyState />
                    ) : selectedCategory === 'dental' && dentalQuotes.length === 0 && isCategoryLoading('dental') ? (
                      /* Loading State for Dental (when expected but not completed) */
                      <GenericQuoteLoading 
                        title="Getting Your Dental Insurance Quotes"
                        message="Searching for dental insurance plans in your area..."
                      />
                    ) : selectedCategory === 'dental' && dentalQuotes.length > 0 ? (
                      /* Display Dental Plans */
                      <DentalShopContent 
                        quotes={dentalQuotes} 
                        isLoading={isCategoryLoading('dental')} 
                      />
                    ) : selectedCategory === 'cancer' && isLoadingQuotes ? (
                      /* Loading Screen for Cancer Insurance Quotes */
                      <GenericQuoteLoading 
                        title="Getting Your Cancer Insurance Quotes"
                        message="Searching for cancer insurance plans in your area..."
                      />
                    ) : selectedCategory === 'cancer' && cancerInsuranceQuotes.length === 0 && !isLoadingQuotes && !isCategoryLoading('cancer') ? (
                      /* Empty State for Cancer Insurance */
                      <CancerInsuranceEmptyState />
                    ) : selectedCategory === 'cancer' && cancerInsuranceQuotes.length === 0 && isCategoryLoading('cancer') ? (
                      /* Loading State for Cancer Insurance (when expected but not completed) */
                      <GenericQuoteLoading 
                        title="Getting Your Cancer Insurance Quotes"
                        message="Searching for cancer insurance plans in your area..."
                      />
                    ) : selectedCategory === 'cancer' && cancerInsuranceQuotes.length > 0 ? (
                      /* Display Cancer Insurance Plans */
                      <CancerInsuranceShopContent 
                        quotes={cancerInsuranceQuotes} 
                        isLoading={isCategoryLoading('cancer')} 
                      />
                    ) : selectedCategory === 'hospital-indemnity' && isLoadingQuotes ? (
                      /* Loading Screen for Hospital Indemnity Quotes */
                      <GenericQuoteLoading 
                        title="Getting Your Hospital Indemnity Quotes"
                        message="Searching for hospital indemnity insurance plans in your area..."
                      />
                    ) : selectedCategory === 'hospital-indemnity' && hospitalIndemnityQuotes.length === 0 && !isLoadingQuotes && !isCategoryLoading('hospital-indemnity') ? (
                      /* Empty State for Hospital Indemnity */
                      <HospitalIndemnityEmptyState />
                    ) : selectedCategory === 'hospital-indemnity' && hospitalIndemnityQuotes.length === 0 && isCategoryLoading('hospital-indemnity') ? (
                      /* Loading State for Hospital Indemnity (when expected but not completed) */
                      <GenericQuoteLoading 
                        title="Getting Your Hospital Indemnity Quotes"
                        message="Searching for hospital indemnity insurance plans in your area..."
                      />
                    ) : selectedCategory === 'hospital-indemnity' && hospitalIndemnityQuotes.length > 0 ? (
                      /* Display Hospital Indemnity Plans */
                      <HospitalIndemnityShopContent 
                        quotes={hospitalIndemnityQuotes} 
                        isLoading={isCategoryLoading('hospital-indemnity')} 
                      />
                    ) : selectedCategory === 'final-expense' && isLoadingQuotes ? (
                      /* Loading Screen for Final Expense Quotes */
                      <GenericQuoteLoading 
                        title="Getting Your Final Expense Life Insurance Quotes"
                        message="Searching for final expense life insurance plans in your area..."
                      />
                    ) : selectedCategory === 'final-expense' && finalExpenseQuotes.length === 0 && !isLoadingQuotes && !isCategoryLoading('final-expense') ? (
                      /* Empty State for Final Expense */
                      <FinalExpenseEmptyState />
                    ) : selectedCategory === 'final-expense' && finalExpenseQuotes.length === 0 && isCategoryLoading('final-expense') ? (
                      /* Loading State for Final Expense (when expected but not completed) */
                      <GenericQuoteLoading 
                        title="Getting Your Final Expense Life Insurance Quotes"
                        message="Searching for final expense life insurance plans in your area..."
                      />
                    ) : selectedCategory === 'final-expense' && finalExpenseQuotes.length > 0 ? (
                      /* Display Final Expense Plans */
                      <FinalExpenseShopContent 
                        quotes={finalExpenseQuotes} 
                        isLoading={isCategoryLoading('final-expense')} 
                      />
                    ) : (
                      /* Display Medigap Plans */
                      <div className={`grid gap-6 ${
                        selectedQuotePlans.length === 1 
                          ? 'grid-cols-1 sm:grid-cols-2' 
                          : 'grid-cols-1'
                      }`}>
                        {isCategoryLoading('medigap') && (
                          /* Loading overlay for medigap plans */
                          <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                              <Card key={i} className="animate-pulse">
                                <CardContent className="p-6">
                                  <div className="mb-6 pb-4 border-b">
                                    <div className="flex items-center gap-3">
                                      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                                      <div>
                                        <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="space-y-4">
                                    {[...Array(2)].map((_, j) => (
                                      <div key={j} className="border rounded-lg p-4">
                                        <div className="h-5 bg-gray-200 rounded w-20 mb-3"></div>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div className="h-4 bg-gray-200 rounded"></div>
                                          <div className="h-4 bg-gray-200 rounded"></div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                        {!isCategoryLoading('medigap') && displayData.type === 'grouped' && (
                          // Grouped by carrier display (Medigap real quotes) - inline from backup
                          paginatedData.map((carrierGroup: any) => {
                            // Filter plans based on selected plan types
                            const filteredQuotes = carrierGroup.quotes.filter((quote: any) => 
                              selectedQuotePlans.includes(quote.plan)
                            );
                            
                            // Skip carrier if no plans match selected types
                            if (filteredQuotes.length === 0) return null;
                            
                            // Create filtered carrier group
                            const filteredCarrierGroup = {
                              ...carrierGroup,
                              quotes: filteredQuotes
                            };
                            
                            return (
                              <Card key={`${carrierGroup.carrierId}-${selectedQuotePlans.join('-')}`} className="group hover:shadow-xl transition-all duration-300 hover:border-primary/20">
                                <CardContent className="p-6">
                                  {/* Carrier Header */}
                                  <div className="mb-6 pb-4 border-b">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        {/* Carrier Logo */}
                                        <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                          <Image
                                            src={getCachedLogoUrl(carrierGroup.carrierName, carrierGroup.carrierId)}
                                            alt={`${carrierGroup.carrierName} logo`}
                                            width={48}
                                            height={48}
                                            className="w-full h-full object-contain"
                                            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                              const target = e.currentTarget;
                                              const parent = target.parentElement;
                                              if (parent) {
                                                target.style.display = 'none';
                                                const initials = carrierGroup.carrierName
                                                  .split(' ')
                                                  .map((word: string) => word[0])
                                                  .join('')
                                                  .substring(0, 2)
                                                  .toUpperCase();
                                                parent.innerHTML = `<span class="text-sm font-semibold text-gray-600">${initials}</span>`;
                                              }
                                            }}
                                          />
                                        </div>
                                        <div>
                                          <h3 className="text-xl font-bold text-primary">{carrierGroup.carrierName}</h3>
                                          <p className="text-sm text-muted-foreground">
                                            {filteredQuotes.length} plan{filteredQuotes.length !== 1 ? 's' : ''} available
                                          </p>
                                        </div>
                                      </div>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => setShowPlanDifferencesModal(true)}
                                        className="text-xs px-3 py-1"
                                      >
                                        {selectedQuotePlans.length === 1 ? "What's covered?" : "What's the difference?"}
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Plans from this carrier - flexible layout that adjusts to content */}
                                  <div className={`space-y-6 md:space-y-0 ${
                                    selectedQuotePlans.length === 1 
                                      ? 'md:grid md:grid-cols-1'
                                      : selectedQuotePlans.length === 2
                                      ? 'md:grid md:grid-cols-2 md:gap-6' 
                                      : 'md:grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
                                  } md:gap-4`}>
                                    {(() => {
                                      // Group quotes by plan type within this carrier (only for selected plan types)
                                      const planGroups = filteredQuotes.reduce((groups: Record<string, any[]>, quote: any) => {
                                        const planType = quote.plan || 'Unknown';
                                        if (!groups[planType]) {
                                          groups[planType] = [];
                                        }
                                        groups[planType].push(quote);
                                        return groups;
                                      }, {} as Record<string, any[]>);

                                      return Object.entries(planGroups).map(([planType, quotes], index: number) => {
                                        const quotesArray = quotes as any[];
                                        // Calculate price range for this plan type
                                        const premiums = quotesArray.map((q: any) => calculateDiscountedPrice(q));
                                        const minPremium = Math.min(...premiums);
                                        const maxPremium = Math.max(...premiums);
                                        const hasMultipleVersions = quotesArray.length > 1;
                                        
                                        // Get the best quote for this plan type (lowest premium)
                                        const bestQuote = quotesArray.find((q: any) => {
                                          const premium = calculateDiscountedPrice(q);
                                          return premium === minPremium;
                                        }) || quotesArray[0];

                                        return (
                                          <div key={planType} className={`flex flex-col p-6 rounded-lg bg-card/50 transition-colors h-full min-h-[300px] ${
                                            selectedQuotePlans.length > 1 ? (
                                              planType === 'F' ? 'border border-blue-200 dark:border-blue-800' :
                                              planType === 'G' ? 'border border-green-200 dark:border-green-800' :
                                              planType === 'N' ? 'border border-purple-200 dark:border-purple-800' :
                                              'bg-card'
                                            ) : 'bg-card'
                                          }`}>
                                            {/* Plan Header - Price with type indicator */}
                                            <div className="flex items-baseline gap-1 mb-4">
                                              <div className={`font-bold text-primary ${
                                                selectedQuotePlans.length === 2 
                                                  ? 'text-2xl md:text-3xl' 
                                                  : 'text-2xl md:text-2xl lg:text-3xl'
                                              }`}>
                                                {hasMultipleVersions ? 
                                                  `$${Math.round(convertPriceByPaymentMode(minPremium))}-$${Math.round(convertPriceByPaymentMode(maxPremium))}` : 
                                                  `$${Math.round(convertPriceByPaymentMode(minPremium))}`
                                                }
                                              </div>
                                              <div className="text-sm text-muted-foreground">{getPaymentLabel()}</div>
                                            </div>
                                            
                                            {/* Plan Details - flex-grow to push button to bottom */}
                                            <div className="flex-grow space-y-2 mb-4">
                                              <div className="flex items-center gap-2 mb-2">
                                                <h4 className="font-semibold text-lg">
                                                  Plan {planType}
                                                </h4>
                                                {selectedQuotePlans.length > 1 && (
                                                  <Badge 
                                                    variant="outline" 
                                                    className={`text-xs font-semibold ${
                                                      selectedQuotePlans.length > 1 ? (
                                                        planType === 'F' ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' :
                                                        planType === 'G' ? 'bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' :
                                                        planType === 'N' ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' :
                                                        'bg-muted text-muted-foreground border-border'
                                                      ) : 'bg-muted text-muted-foreground border-border'
                                                    }`}
                                                  >
                                                    {planType === 'F' ? 'Premium Plan' :
                                                     planType === 'G' ? 'Popular Choice' : 
                                                     planType === 'N' ? 'Lower Premium' : 
                                                     'Standard Plan'}
                                                  </Badge>
                                                )}
                                              </div>
                                              <p className="text-sm text-muted-foreground">
                                                {planType === 'F' ? 'Covers all gaps including Part B deductible' :
                                                 planType === 'G' ? 'Covers all gaps except Part B deductible ($240/yr)' :
                                                 planType === 'N' ? 'Lower cost with small copays for office visits & ER' :
                                                 'Medicare supplement coverage'}
                                              </p>
                                              {hasMultipleVersions && (
                                                <p className="text-xs text-muted-foreground">
                                                  Multiple versions available
                                                </p>
                                              )}
                                              <p className="text-xs text-muted-foreground">
                                                Effective: {bestQuote.effectiveDate || '7/1/2025'}
                                              </p>
                                            </div>
                                            
                                            {/* Action Button - always at bottom */}
                                            <Button 
                                              className="w-full mt-auto bg-primary hover:bg-primary/90 text-primary-foreground"
                                              onClick={() => openPlanModal(filteredCarrierGroup)}
                                            >
                                              Select Plan
                                            </Button>
                                          </div>
                                        );
                                      });
                                    })()}
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })
                        )}
                      </div>
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
            <div className="min-h-screen -mt-6 -mx-4 sm:-mx-6 lg:-mx-8">
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
                          className="w-full border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 rounded-md text-sm font-medium transition-colors"
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
