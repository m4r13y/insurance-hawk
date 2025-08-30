"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MedicareDisclaimer from "@/components/medicare-disclaimer";
import MedicareQuoteFlow from "@/components/MedicareQuoteFlow";
import { MedicareAdvantageShopContent } from "@/components/medicare-shop/advantage";
import MedicareQuoteLoadingPage from "@/components/MedicareQuoteLoadingPage";
import GenericQuoteLoading from "@/components/GenericQuoteLoading";
import { getMedigapQuotes } from "@/lib/actions/medigap-quotes";
import { getMedicareAdvantageQuotes } from "@/lib/actions/advantage-quotes";
import { quoteService } from "@/lib/services/quote-service";
import { carrierService } from "@/lib/services/carrier-service-simple";
import { getCarrierByNaicCode, getProperLogoUrl } from "@/lib/naic-carriers";
import { CrossCircledIcon, PersonIcon, RocketIcon } from "@radix-ui/react-icons";

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
  QUOTE_FORM_DATA_KEY,
  QUOTE_FORM_COMPLETED_KEY,
  REAL_QUOTES_KEY,
  ADVANTAGE_QUOTES_KEY
} from "@/components/medicare-shop/shared";

import {
  MedigapPlanTypeControls,
  MedigapEmptyState,
  MedigapCarrierGroup,
  MedigapResultsHeader
} from "@/components/medicare-shop/medigap";

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
    tobaccoUse: null
  });
  const [selectedFlowCategories, setSelectedFlowCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('medigap');
  const [activeCategory, setActiveCategory] = useState('medigap');
  const [realQuotes, setRealQuotes] = useState<any[]>([]);
  const [advantageQuotes, setAdvantageQuotes] = useState<any[]>([]);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const [quotesError, setQuotesError] = useState<string | null>(null);
  const [loadingPlanButton, setLoadingPlanButton] = useState<string | null>(null);
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
    }
  ];

  // Preload carrier logos
  const preloadCarrierLogos = useCallback(async (quotes: any[]) => {
    const logoPromises = quotes.map(async (quote) => {
      if (quote.carrier_id && !carrierLogos[quote.carrier_id]) {
        try {
          const logoUrl = `/carrier-logos/${quote.carrier_id}.png`;
          // Test if the image exists
          const img = new Image();
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

  // Initialize component
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        // Load saved data from localStorage
        const savedFormData = loadFromStorage(QUOTE_FORM_DATA_KEY, null);
        const savedCategories = loadFromStorage('selectedFlowCategories', []);
        const savedQuotes = loadFromStorage(REAL_QUOTES_KEY, []);
        const savedAdvantageQuotes = loadFromStorage(ADVANTAGE_QUOTES_KEY, []);
        const savedActiveCategory = loadFromStorage('activeCategory', 'medigap');

        // Check URL for category parameter - this takes precedence
        const urlCategory = searchParams.get('category');
        const initialCategory = (urlCategory === 'medigap' || urlCategory === 'advantage') 
          ? urlCategory 
          : savedActiveCategory;

        if (savedFormData) {
          setQuoteFormData(savedFormData);
        }
        if (savedCategories && Array.isArray(savedCategories)) {
          setSelectedFlowCategories(savedCategories);
        }
        if (savedQuotes && Array.isArray(savedQuotes)) {
          setRealQuotes(savedQuotes);
        }
        if (savedAdvantageQuotes && Array.isArray(savedAdvantageQuotes)) {
          setAdvantageQuotes(savedAdvantageQuotes);
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
    return (realQuotes?.length > 0) || (selectedFlowCategories?.length > 0);
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
        const planNames = currentPlans.map((plan: string) => `Plan ${plan}`);
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

  // Persist advantage quotes to localStorage when they change
  useEffect(() => {
    if (advantageQuotes.length > 0) {
      saveToStorage(ADVANTAGE_QUOTES_KEY, advantageQuotes);
    }
  }, [advantageQuotes]);

  // Persist supplement quotes to localStorage when they change
  useEffect(() => {
    if (realQuotes.length > 0) {
      saveToStorage(REAL_QUOTES_KEY, realQuotes);
    }
  }, [realQuotes]);

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
    console.log('🔥 targetCategory:', targetCategory);
    console.log('🔥 plansList:', plansList);
    console.log('🔥 manageLoadingState:', manageLoadingState);
    
    // Conditional validation based on category (like in backup)
    let requiredFields: string[];
    if (targetCategory === 'advantage') {
      // Medicare Advantage only requires ZIP code
      requiredFields = ['zipCode'];
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
    setQuotesError(null);
    
    // Set specific loading items based on what's being requested
    if (targetCategory === 'medigap') {
      const plansToFetch = plansList || selectedQuotePlans;
      const planNames = plansToFetch.map(plan => `Plan ${plan}`);
      setLoadingItems(planNames);
    } else if (targetCategory === 'advantage') {
      setLoadingItems(['Medicare Advantage Plans']);
    }
    
    // Clear quotes for the specific category
    if (targetCategory === 'medigap') {
      setRealQuotes([]);
    } else if (targetCategory === 'advantage') {
      setAdvantageQuotes([]);
    }
    
    try {
      // Only get quotes for the specified category
      if (targetCategory === 'medigap') {
        console.log('🔥 Category is medigap, proceeding with API call...');
        const plansToFetch = plansList || selectedQuotePlans;
        console.log('🔥 Selected quote plans to fetch:', plansToFetch);
        
        // Convert form data to API format for our enhanced getMedigapQuotes action
        const quoteParams = {
          zipCode: formData.zipCode,
          age: formData.age.toString(),
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
          console.log(`Received ${response.quotes.length} Medigap quotes`);
          
          // Preload carrier logos for better user experience
          preloadCarrierLogos(response.quotes);
        }
      } else if (targetCategory === 'advantage') {
        console.log('🔥 Category is advantage, proceeding with API call...');
        
        const response = await getMedicareAdvantageQuotes(formData);
        console.log('🔥 Advantage API Response:', response);
        
        if (response.error) {
          console.log('🔥 Advantage API Error:', response.error);
          setQuotesError(response.error);
        } else if (response.quotes && Array.isArray(response.quotes)) {
          console.log('🔥 Success! Received advantage quotes:', response.quotes.length);
          setAdvantageQuotes(response.quotes);
          
          // Preload carrier logos for better user experience
          preloadCarrierLogos(response.quotes);
        }
      }
      
      // Mark form as completed
      setQuoteFormCompleted(true);
      
      // Immediately save the completion status to localStorage to ensure persistence
      saveToStorage(QUOTE_FORM_COMPLETED_KEY, true);
      
      // Update URL to indicate results are shown
      const newUrl = `${pathname}?step=results${targetCategory ? `&category=${targetCategory}` : ''}`;
      window.history.replaceState(null, '', newUrl);
      
    } catch (error) {
      console.error('🔥 Error in quote submission:', error);
      setQuotesError(error instanceof Error ? error.message : 'An error occurred while fetching quotes');
    } finally {
      if (manageLoadingState) {
        setIsLoadingQuotes(false);
        setLoadingItems([]); // Clear loading items when quote fetching is complete
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

  const handleCategoryToggle = (category: 'medigap' | 'advantage') => {
    setActiveCategory(category);
    setSelectedCategory(category);
    saveToStorage('activeCategory', category);
    
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
    };
    
    console.log('🔥 Mapped form data:', mappedFormData);
    setQuoteFormData(mappedFormData);
    saveToStorage(QUOTE_FORM_DATA_KEY, mappedFormData);
    
    if (data?.planCategories && Array.isArray(data.planCategories)) {
      setSelectedFlowCategories(data.planCategories);
      saveToStorage('selectedFlowCategories', data.planCategories);
    }
    
    setShowMedicareFlow(false);
    setShowQuoteLoading(true);
    
    try {
      const hasMedigap = data.planCategories?.includes('medigap');
      const hasAdvantage = data.planCategories?.includes('advantage');
      
      if (hasMedigap && hasAdvantage) {
        // Both selected - default to medigap first, but fetch both simultaneously
        console.log('🔥 Fetching both Medigap and Advantage quotes');
        setSelectedCategory('medigap');
        setActiveCategory('medigap');
        
        // Explicitly set URL to medigap when both are selected
        const params = new URLSearchParams(searchParams.toString());
        params.set('category', 'medigap');
        router.push(`${pathname}?${params.toString()}`);
        
        const selectedPlans = data.selectedMedigapPlans && data.selectedMedigapPlans.length > 0 
          ? data.selectedMedigapPlans 
          : ['F', 'G', 'N'];
        setSelectedQuotePlans(selectedPlans);
        
        // Set loading items for both categories
        const planNames = selectedPlans.map((plan: string) => `Plan ${plan}`);
        setLoadingItems([...planNames, 'Medicare Advantage Plans']);
        
        // Fetch both quote types simultaneously without individual loading states
        await Promise.all([
          handleQuoteFormSubmitWithData(mappedFormData, 'medigap', selectedPlans, false),
          handleQuoteFormSubmitWithData(mappedFormData, 'advantage', undefined, false)
        ]);
      } else if (hasMedigap) {
        console.log('🔥 Fetching Medigap quotes');
        setSelectedCategory('medigap');
        setActiveCategory('medigap');
        const selectedPlans = data.selectedMedigapPlans && data.selectedMedigapPlans.length > 0 
          ? data.selectedMedigapPlans 
          : ['F', 'G', 'N'];
        setSelectedQuotePlans(selectedPlans);
        
        // Set loading items for medigap only
        const planNames = selectedPlans.map((plan: string) => `Plan ${plan}`);
        setLoadingItems(planNames);
        
        await handleQuoteFormSubmitWithData(mappedFormData, 'medigap', selectedPlans, false);
      } else if (hasAdvantage) {
        console.log('🔥 Fetching Advantage quotes');
        setSelectedCategory('advantage');
        setActiveCategory('advantage');
        
        // Set loading items for advantage only
        setLoadingItems(['Medicare Advantage Plans']);
        await handleQuoteFormSubmitWithData(mappedFormData, 'advantage', undefined, false);
      } else {
        console.log('🔥 Default to Medigap quotes');
        setSelectedCategory('medigap');
        setActiveCategory('medigap');
        const defaultPlans = ['F', 'G', 'N'];
        setSelectedQuotePlans(defaultPlans);
        
        await handleQuoteFormSubmitWithData(mappedFormData, 'medigap', defaultPlans, false);
      }
      
      setQuoteFormCompleted(true);
    } catch (error) {
      console.error('Error processing flow data:', error);
      setQuotesError('Failed to fetch quotes. Please try again.');
    } finally {
      setShowQuoteLoading(false);
      setLoadingItems([]); // Clear loading items when complete
    }
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
    setRealQuotes([]);
    setAdvantageQuotes([]);
    setActiveCategory('medigap');
    setSelectedCategory('medigap');
    setShowMedicareFlow(false);
    setShowQuoteLoading(false);
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
          onComplete={() => setShowQuoteLoading(false)}
        />
      ) : selectedCategory === 'advantage' || activeCategory === 'advantage' ? (
        /* Route to dedicated Medicare Advantage component */
        <MedicareAdvantageShopContent />
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

                <div className="space-y-6">
                  {/* Results Header with Pagination Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold">
                        {selectedCategory === 'medigap' ? 'Medigap (Supplement)' : 
                         selectedCategory === 'advantage' ? 'Medicare Advantage' : 
                         'Medicare Plans'}
                      </h2>
                      <MedigapResultsHeader
                        selectedCategory={selectedCategory}
                        realQuotes={realQuotes}
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

                    {/* Product Grid - Show loading for Medigap or display plans */}
                    {selectedCategory === 'medigap' && isLoadingQuotes ? (
                      /* Loading Screen for Medigap Quotes */
                      <GenericQuoteLoading 
                        title="Getting Your Medigap Quotes"
                        message="Searching for Medicare Supplement plans in your area..."
                      />
                    ) : selectedCategory === 'medigap' && realQuotes.length === 0 && !isLoadingQuotes ? (
                      /* Empty State for Medigap */
                      <MedigapEmptyState onResetFilters={resetFilters} />
                    ) : (
                      /* Display Plans */
                      <div className={`${
                        selectedQuotePlans.length === 1 
                          ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' 
                          : 'space-y-6'
                      }`}>
                        {displayData.type === 'grouped' && (
                          // Grouped by carrier display (Medigap real quotes)
                          paginatedData.map((carrierGroup: any) => (
                            <MedigapCarrierGroup
                              key={`${carrierGroup.carrierId}-${selectedQuotePlans.join('-')}`}
                              carrierGroup={carrierGroup}
                              selectedQuotePlans={selectedQuotePlans}
                              paymentMode={paymentMode}
                              getCachedLogoUrl={getCachedLogoUrl}
                              calculateDiscountedPrice={calculateDiscountedPrice}
                              convertPriceByPaymentMode={convertPriceByPaymentMode}
                              getPaymentLabel={getPaymentLabel}
                              setShowPlanDifferencesModal={setShowPlanDifferencesModal}
                              openPlanModal={openPlanModal}
                            />
                          ))
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
      <Dialog open={showPlanDifferencesModal} onOpenChange={setShowPlanDifferencesModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedQuotePlans.length === 1 
                ? `Plan ${selectedQuotePlans[0]} Coverage Details`
                : `Plan Comparison: ${selectedQuotePlans.join(', ')}`
              }
            </DialogTitle>
            <DialogDescription>
              {selectedQuotePlans.length === 1
                ? `Understanding what's included in your selected Medigap Plan ${selectedQuotePlans[0]}`
                : "Understanding the key differences between your selected Medigap plan types"
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Plan comparison details would go here...
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Medicare Disclaimer */}
      <MedicareDisclaimer />
    </MedicareShopLayout>
  );
}
