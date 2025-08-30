"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import MedicareDisclaimer from "@/components/medicare-disclaimer";
import MedicareQuoteFlow from "@/components/MedicareQuoteFlow";
import MedicareAdvantageShopContent from "@/components/medicare-shop/advantage/MedicareAdvantageShopContent";
import MedicareQuoteLoadingPage from "@/components/MedicareQuoteLoadingPage";
import { getMedigapQuotes } from "@/lib/actions/medigap-quotes";
import { getMedicareAdvantageQuotes } from "@/lib/actions/advantage-quotes";
import { quoteService } from "@/lib/services/quote-service";
import { carrierService } from "@/lib/services/carrier-service-simple";
import { getCarrierByNaicCode, getProperLogoUrl } from "@/lib/naic-carriers";
import Image from "next/image";
import GenericQuoteLoading from "@/components/GenericQuoteLoading";
import { 
  TokensIcon,
  HeartIcon,
  HeartFilledIcon,
  ActivityLogIcon,
  EyeOpenIcon,
  PersonIcon,
  InfoCircledIcon,
  CheckCircledIcon,
  FileTextIcon,
  VideoIcon,
  StarIcon,
  StarFilledIcon,
  CheckIcon,
  TriangleUpIcon,
  TargetIcon,
  ArchiveIcon,
  BadgeIcon,
  CalendarIcon,
  AvatarIcon,
  DotFilledIcon,
  CrossCircledIcon,
  MagnifyingGlassIcon,
  MixerHorizontalIcon,
  BookmarkIcon,
  BookmarkFilledIcon,
  RocketIcon,
  LightningBoltIcon,
  SizeIcon
} from '@radix-ui/react-icons';
import { Loader2, UserCheck, RotateCcw } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { 
  ProductCategory, 
  Plan, 
  CartItem, 
  QuoteFormData, 
  MedigapQuote,
  productCategories,
  chartConfig,
  popularityData,
  loadFromStorage,
  saveToStorage,
  cleanupOldStorage,
  QUOTE_FORM_DATA_KEY,
  QUOTE_FORM_COMPLETED_KEY,
  REAL_QUOTES_KEY,
  ADVANTAGE_QUOTES_KEY,
  FILTER_STATE_KEY
} from '@/components/medicare-shop/shared';

export default function MedicareShopContent() {
  // Initialize hooks
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Extract URL parameters immediately after hook initialization
  const stepParam = searchParams.get('step');
  const categoryParam = searchParams.get('category');

  // State management
  const [selectedCategory, setSelectedCategory] = useState("medigap");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [savedPlans, setSavedPlans] = useState<string[]>([]);
  
  // Filter states - initialize with localStorage if available
  const [searchQuery, setSearchQuery] = useState(() => 
    loadFromStorage(FILTER_STATE_KEY, {})?.searchQuery || ""
  );
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'popularity'>(() => 
    loadFromStorage(FILTER_STATE_KEY, {})?.sortBy || 'popularity'
  );
  const [priceRange, setPriceRange] = useState(() => 
    loadFromStorage(FILTER_STATE_KEY, {})?.priceRange || [0, 500]
  );
  const [selectedCoverageLevel, setSelectedCoverageLevel] = useState<string>(() => 
    loadFromStorage(FILTER_STATE_KEY, {})?.selectedCoverageLevel || 'all'
  );
  
  // Medigap plan filters for mock plans
  const [selectedMedigapPlans, setSelectedMedigapPlans] = useState<string[]>(() => 
    loadFromStorage(FILTER_STATE_KEY, {})?.selectedMedigapPlans || ['plan-f', 'plan-g', 'plan-n']
  );
  
  // Real quote plan filters for results page
  const [selectedQuotePlans, setSelectedQuotePlans] = useState<string[]>(() => 
    loadFromStorage(FILTER_STATE_KEY, {})?.selectedQuotePlans || ['F', 'G', 'N']
  );

  // Discount toggle state
  const [applyDiscounts, setApplyDiscounts] = useState(() => 
    loadFromStorage(FILTER_STATE_KEY, {})?.applyDiscounts || false
  );

  // Payment mode state
  const [paymentMode, setPaymentMode] = useState<'monthly' | 'quarterly' | 'annually'>(() => 
    loadFromStorage(FILTER_STATE_KEY, {})?.paymentMode || 'monthly'
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Quote form state with session storage - initialize with saved values
  const [quoteFormCompleted, setQuoteFormCompleted] = useState(false);
  const [showMedicareFlow, setShowMedicareFlow] = useState(false);
  const [medicareFlowMode, setMedicareFlowMode] = useState<'guided' | 'quick'>('guided');
  const [isInitializing, setIsInitializing] = useState(true);
  const [showQuoteLoading, setShowQuoteLoading] = useState(false); // New loading state
  
  const [quoteFormData, setQuoteFormData] = useState<QuoteFormData>({
    age: '',
    zipCode: '',
    gender: '',
    tobaccoUse: null,
    email: '',
    firstName: '',
    effectiveDate: ''
  });
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const [realQuotes, setRealQuotes] = useState<MedigapQuote[]>([]);
  const [advantageQuotes, setAdvantageQuotes] = useState<any[]>([]);
  const [quotesError, setQuotesError] = useState<string | null>(null);
  const [selectedFlowCategories, setSelectedFlowCategories] = useState<string[]>([]); // Categories selected in flow
  const [activeCategory, setActiveCategory] = useState<string>(''); // Currently active category for display
  const [loadingPlanButton, setLoadingPlanButton] = useState<string | null>(null); // Track which plan button is loading
  const [showPlanDifferencesModal, setShowPlanDifferencesModal] = useState(false); // Track plan differences modal
  
  // Save form data to localStorage whenever it changes (but not during initialization)
  useEffect(() => {
    if (!isInitializing) {
      saveToStorage(QUOTE_FORM_DATA_KEY, quoteFormData);
    }
  }, [quoteFormData, isInitializing]);

  // Save completion status to localStorage whenever it changes (but not during initialization)
  useEffect(() => {
    if (!isInitializing) {
      saveToStorage(QUOTE_FORM_COMPLETED_KEY, quoteFormCompleted);
    }
  }, [quoteFormCompleted, isInitializing]);

  // Save real quotes to localStorage whenever they change (but not during initialization)
  useEffect(() => {
    if (!isInitializing) {
      console.log('💾 Saving realQuotes to localStorage:', realQuotes.length, 'quotes');
      saveToStorage(REAL_QUOTES_KEY, realQuotes);
    }
  }, [realQuotes, isInitializing]);

  // Save advantage quotes to localStorage whenever they change (but not during initialization)
  useEffect(() => {
    if (!isInitializing) {
      console.log('💾 Saving advantageQuotes to localStorage:', advantageQuotes.length, 'quotes');
      saveToStorage(ADVANTAGE_QUOTES_KEY, advantageQuotes);
    }
  }, [advantageQuotes, isInitializing]);

  // Save filter state to localStorage whenever filters change (but not during initialization)
  useEffect(() => {
    if (!isInitializing) {
      const filterState = {
        searchQuery,
        sortBy,
        priceRange,
        selectedCoverageLevel,
        selectedMedigapPlans,
        selectedQuotePlans,
        applyDiscounts,
        paymentMode
      };
      saveToStorage(FILTER_STATE_KEY, filterState);
    }
  }, [searchQuery, sortBy, priceRange, selectedCoverageLevel, selectedMedigapPlans, selectedQuotePlans, applyDiscounts, paymentMode, isInitializing]);

  // Initialize all localStorage data on component mount
  useEffect(() => {
    try {
      // Clean up old data first - BUT NOT during navigation back from plan details
      const isNavigatingBackFromPlanDetails = localStorage.getItem('planDetailsData');
      if (!isNavigatingBackFromPlanDetails) {
        cleanupOldStorage();
      } else {
        console.log('🔄 Skipping cleanup - detected navigation back from plan details');
      }
      
      // Check URL parameters first using Next.js hook
      console.log('🔍 URL step parameter:', stepParam);
      console.log('🔍 All search params:', searchParams.toString());
      
      // Initialize form completion status
      const savedCompleted = localStorage.getItem(QUOTE_FORM_COMPLETED_KEY);
      const savedQuotes = localStorage.getItem(REAL_QUOTES_KEY);
      
      console.log('� Initialization - savedCompleted:', savedCompleted, 'savedQuotes:', !!savedQuotes);
      
      if (savedCompleted) {
        const parsedValue = JSON.parse(savedCompleted);
        console.log('🔄 Restoring quoteFormCompleted:', parsedValue);
        setQuoteFormCompleted(parsedValue);
      } else if (stepParam === 'results' && savedQuotes) {
        // If URL indicates results and we have quotes, set form as completed
        console.log('🔄 URL indicates results and quotes exist - setting form as completed');
        setQuoteFormCompleted(true);
      } else if (stepParam === 'results') {
        // If URL indicates results but no localStorage data, something went wrong
        console.log('🔄 URL indicates results but no localStorage data found - redirecting to form');
        setQuoteFormCompleted(false);
      } else {
        console.log('🔄 No saved quoteFormCompleted found');
      }

      // Initialize form data
      const savedFormData = localStorage.getItem(QUOTE_FORM_DATA_KEY);
      if (savedFormData) {
        const parsedData = JSON.parse(savedFormData);
        console.log('🔄 Restoring quoteFormData:', parsedData);
        setQuoteFormData(parsedData);
      } else {
        console.log('🔄 No saved quoteFormData found');
      }

      // Initialize real quotes
      if (savedQuotes) {
        const parsedQuotes = JSON.parse(savedQuotes);
        console.log('🔄 Restoring realQuotes:', parsedQuotes.length, 'quotes');
        setRealQuotes(parsedQuotes);
        
        // Update selectedQuotePlans based on available quote plan types
        const availablePlans = [...new Set(parsedQuotes.map((quote: any) => quote.plan).filter(Boolean))];
        if (availablePlans.length > 0) {
          setSelectedQuotePlans(availablePlans as string[]);
          console.log('🎯 Restored selectedQuotePlans from quotes:', availablePlans);
        }
      } else {
        console.log('🔄 No saved realQuotes found in localStorage');
        
        // Fallback: check if we have quotes stored in localStorage from plan details navigation
        try {
          const planDetailsDataStr = localStorage.getItem('planDetailsData');
          if (planDetailsDataStr) {
            const planDetailsData = JSON.parse(planDetailsDataStr);
            // Since we removed allQuotes from planDetailsData, we need another approach
            console.log('🔄 Plan details found but no allQuotes stored there anymore');
          }
        } catch (fallbackError) {
          console.error('Error loading quotes from localStorage fallback:', fallbackError);
        }
      }

      // Initialize advantage quotes
      const savedAdvantageQuotes = localStorage.getItem(ADVANTAGE_QUOTES_KEY);
      if (savedAdvantageQuotes) {
        const parsedAdvantageQuotes = JSON.parse(savedAdvantageQuotes);
        console.log('🔄 Restoring advantageQuotes:', parsedAdvantageQuotes.length, 'quotes');
        setAdvantageQuotes(parsedAdvantageQuotes);
      } else {
        console.log('🔄 No saved advantageQuotes found');
      }
    } catch (error) {
      console.error('Error loading localStorage data:', error);
    } finally {
      // Mark initialization as complete
      console.log('✅ Initialization complete');
      setIsInitializing(false);
    }
  }, [stepParam]);
  
  // Additional safeguard: if we have quotes but form isn't marked as completed, fix the state
  useEffect(() => {
    if (!isInitializing && hasQuotes() && !quoteFormCompleted) {
      console.log('🔧 Found quotes but form not marked as completed - fixing state');
      setQuoteFormCompleted(true);
      saveToStorage(QUOTE_FORM_COMPLETED_KEY, true);
    }
  }, [isInitializing, realQuotes.length, advantageQuotes.length, quoteFormCompleted]);
  
  // Ensure URL shows step=results when we have quotes
  useEffect(() => {
    if (!isInitializing && hasQuotes() && stepParam !== 'results') {
      console.log('🔧 Found quotes but URL missing step=results - updating URL');
      const newUrl = `${pathname}?step=results${selectedCategory ? `&category=${selectedCategory}` : ''}`;
      window.history.replaceState(null, '', newUrl);
    }
  }, [isInitializing, realQuotes.length, advantageQuotes.length, stepParam, pathname, selectedCategory]);
  
  const currentCategory = productCategories.find(cat => cat.id === selectedCategory);

  // E-commerce functions
  const addToCart = (plan: Plan, categoryId: string) => {
    const cartItem: CartItem = {
      planId: plan.id,
      categoryId: categoryId,
      planName: plan.name,
      monthlyPremium: plan.monthlyPremium
    };
    setCart(prev => [...prev, cartItem]);
  };

  // Navigate to plan details page
  const openPlanModal = (carrierGroup: any) => {
    try {
      // Store only essential data to avoid quota issues
      const planDetailsData = {
        carrierGroup: {
          carrierId: carrierGroup.carrierId,
          carrierName: carrierGroup.carrierName,
          quotes: carrierGroup.quotes.slice(0, 3), // Only store first 3 quotes to save space
          averagePremium: carrierGroup.averagePremium
        },
        quoteFormData: quoteFormData,
        // Don't store allQuotes here to save space - they're already in localStorage
        timestamp: Date.now()
      };
      
      // Check if we have space before storing
      const dataString = JSON.stringify(planDetailsData);
      if (dataString.length > 500000) { // ~500KB limit
        console.warn('Plan details data too large, storing minimal data only');
        // Store minimal data if too large
        localStorage.setItem('planDetailsData', JSON.stringify({
          carrierId: carrierGroup.carrierId,
          carrierName: carrierGroup.carrierName,
          timestamp: Date.now()
        }));
      } else {
        localStorage.setItem('planDetailsData', dataString);
      }
      
      console.log('✅ Stored plan details data for navigation');
    } catch (error) {
      console.error('Error storing plan details data:', error);
      // Continue navigation even if storage fails
    }
    
    // Store the current URL for back navigation
    try {
      localStorage.setItem('planDetailsReturnUrl', window.location.pathname + window.location.search);
    } catch (error) {
      console.error('Error storing return URL:', error);
    }
    
    // Navigate to the plan details page
    router.push(`/plan-details?carrier=${encodeURIComponent(carrierGroup.carrierName)}&plan=${carrierGroup.quotes[0]?.plan || 'G'}`);
  };

  // Carrier logo utility function with fallback for common carriers
  const getCarrierLogoUrl = (carrierName: string, naicCode?: string): string => {
    // Use the carrier service for consistent logo URL generation
    const identifier = naicCode || carrierName;
    return carrierService.getLogoUrlForCarrier(identifier);
  };

  // State for carrier logos to cache them
  const [carrierLogos, setCarrierLogos] = useState<Record<string, string>>({});

  // Preload carrier logos when quotes are loaded
  const preloadCarrierLogos = (quotes: any[]) => {
    const newLogos: Record<string, string> = { ...carrierLogos };

    for (const quote of quotes) {
      const carrierName = quote.carrier?.name || 
                          quote.company_base?.name || 
                          quote.company || 
                          'Unknown Carrier';
      const naicCode = quote.naic || quote.company_base?.naic;
      
      // Create a unique key for this carrier
      const carrierKey = naicCode || carrierName;
      
      // Skip if we already have this logo
      if (newLogos[carrierKey]) continue;
      
      // Get logo URL and preload
      const logoUrl = getCarrierLogoUrl(carrierName, naicCode);
      newLogos[carrierKey] = logoUrl;
      
      // Preload the image
      const img = new window.Image();
      img.src = logoUrl;
    }

    // Update state with new logos
    setCarrierLogos(newLogos);
  };

  // Helper function to get cached logo URL
  const getCachedLogoUrl = (carrierName: string, naicCode?: string): string => {
    const carrierKey = naicCode || carrierName;
    
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
    const logoUrl = getProperLogoUrl(naicCode, carrierName);
    console.log(`Generated logo URL for NAIC ${naicCode}, carrier "${carrierName}":`, logoUrl);
    return logoUrl;
  };

  // Handle plan selection from modal
  const handlePlanSelection = (selectedPlan: any, selectedAddOns: any[]) => {
    console.log('Plan selected:', selectedPlan);
    console.log('Add-ons selected:', selectedAddOns);
    
    // TODO: Implement actual plan selection logic (add to cart, etc.)
    
    // For now, just add the main plan to cart
    addToCart(selectedPlan, selectedCategory);
  };

  const toggleSavedPlan = (planId: string) => {
    setSavedPlans(prev => 
      prev.includes(planId) 
        ? prev.filter(id => id !== planId)
        : [...prev, planId]
    );
  };

  const handleGetQuotes = () => {
    // Since form is now inline, this can trigger form validation highlight or scroll
    const firstEmptyField = document.querySelector('input[value=""], select:not([value])');
    if (firstEmptyField) {
      (firstEmptyField as HTMLElement).focus();
    }
  };

  const handleMedicareFlowComplete = (flowData: any) => {
    console.log('Medicare flow completed with data:', flowData);
    console.log('Selected Medigap plans from flow:', flowData.selectedMedigapPlans);
    
    // Map flow data to our form data structure
    const mappedFormData: QuoteFormData = {
      age:
        flowData.age === undefined || flowData.age === null || flowData.age === ""
          ? ""
          : typeof flowData.age === "number"
          ? flowData.age
          : isNaN(Number(flowData.age))
          ? ""
          : Number(flowData.age),
      zipCode: flowData.zipCode || "",
      gender: flowData.gender || "",
      tobaccoUse: flowData.tobaccoUse,
      email: flowData.email || "",
      firstName: flowData.firstName || "",
      effectiveDate: flowData.effectiveDate || "",
    };
    
    setQuoteFormData(mappedFormData);

    // Set selected categories based on flow choices
    if (flowData.planCategories && flowData.planCategories.length > 0) {
      setSelectedFlowCategories(flowData.planCategories);
    }

    // Hide the flow and show loading page
    setShowMedicareFlow(false);
    setShowQuoteLoading(true);
    
    // Store the flow data for processing after loading
    setTimeout(() => {
      processFlowDataAndFetchQuotes(mappedFormData, flowData);
    }, 100);
  };

  // Process flow data and fetch quotes for all selected categories
  const processFlowDataAndFetchQuotes = async (mappedFormData: QuoteFormData, flowData: any) => {
    try {
      const hasMedigap = flowData.planCategories?.includes('medigap');
      const hasAdvantage = flowData.planCategories?.includes('advantage');
      
      // Determine initial category and settings
      let initialCategory = 'medigap'; // default
      let plansToUse = ['F', 'G', 'N']; // default
      
      if (hasMedigap && hasAdvantage) {
        // Both selected - default to medigap first, but fetch both in background
        initialCategory = 'medigap';
        setSelectedCategory('medigap');
        setActiveCategory('medigap');
        const selectedPlans = flowData.selectedMedigapPlans && flowData.selectedMedigapPlans.length > 0 
          ? flowData.selectedMedigapPlans 
          : ['F', 'G', 'N'];
        plansToUse = selectedPlans;
        setSelectedQuotePlans(selectedPlans);
        
        // Fetch both medigap and advantage quotes simultaneously without individual loading states
        await Promise.all([
          handleQuoteFormSubmitWithData(mappedFormData, 'medigap', plansToUse, false),
          handleQuoteFormSubmitWithData(mappedFormData, 'advantage', undefined, false)
        ]);
      } else if (hasMedigap) {
        initialCategory = 'medigap';
        setSelectedCategory('medigap');
        setActiveCategory('medigap');
        const selectedPlans = flowData.selectedMedigapPlans && flowData.selectedMedigapPlans.length > 0 
          ? flowData.selectedMedigapPlans 
          : ['F', 'G', 'N'];
        plansToUse = selectedPlans;
        setSelectedQuotePlans(selectedPlans);
        
        await handleQuoteFormSubmitWithData(mappedFormData, 'medigap', plansToUse, false);
      } else if (hasAdvantage) {
        initialCategory = 'advantage';
        setSelectedCategory('advantage');
        setActiveCategory('advantage');
        
        await handleQuoteFormSubmitWithData(mappedFormData, 'advantage', undefined, false);
      } else {
        // Default to medigap for general flows
        setSelectedCategory('medigap');
        setActiveCategory('medigap');
        setSelectedQuotePlans(['F', 'G', 'N']);
        
        await handleQuoteFormSubmitWithData(mappedFormData, 'medigap', ['F', 'G', 'N'], false);
      }
      
      setQuoteFormCompleted(true);
    } catch (error) {
      console.error('Error processing flow data:', error);
      setQuotesError('Failed to fetch quotes. Please try again.');
    } finally {
      setShowQuoteLoading(false);
    }
  };

  // New function that accepts data directly to avoid async state issues
  const handleQuoteFormSubmitWithData = async (formData: any, category: string, plansList?: string[], manageLoadingState: boolean = true) => {
    console.log('🔥 handleQuoteFormSubmitWithData called with:', { formData, category, plansList, manageLoadingState });
    
    // Validate required fields based on category
    let requiredFields: string[];
    if (category === 'advantage') {
      // Medicare Advantage only requires ZIP code
      requiredFields = ['zipCode'];
    } else {
      // Medigap and other categories require all fields
      requiredFields = ['age', 'zipCode', 'gender', 'tobaccoUse'];
    }
    
    const missingFields = requiredFields.filter(field => {
      const value = formData[field];
      return value === '' || value === null || value === undefined;
    });

    console.log('Missing fields:', missingFields);

    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }

    console.log('Validation passed, checking category:', category);

    if (category === 'medigap') {
      console.log('📊 Calling getMedigapQuotes with data:', formData);
      const plansToFetch = plansList || selectedQuotePlans;
      console.log('🎯 Selected quote plans to fetch:', plansToFetch);
      
      if (manageLoadingState) {
        setIsLoadingQuotes(true);
      }
      setQuotesError(null);
      setRealQuotes([]);
      
      try {
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
        
        console.log('📈 Medigap quotes response:', response);
        
        if (response.error) {
          console.log('🔥 API Error:', response.error);
          setQuotesError(response.error);
        } else if (response.quotes && Array.isArray(response.quotes)) {
          console.log('✅ Success! Received quotes:', response.quotes.length);
          setRealQuotes(response.quotes);
          console.log(`Received ${response.quotes.length} Medigap quotes`);
          
          // Preload carrier logos for better user experience
          preloadCarrierLogos(response.quotes);
        } else {
          console.error('❌ Invalid response format:', response);
          setQuotesError('Invalid response from quotes API');
        }
      } catch (error) {
        console.error('❌ Error getting medigap quotes:', error);
        setQuotesError(error instanceof Error ? error.message : 'Failed to fetch quotes');
      } finally {
        if (manageLoadingState) {
          setIsLoadingQuotes(false);
        }
      }
    } else if (category === 'advantage') {
      console.log('📊 Calling getMedicareAdvantageQuotes with data:', formData);
      
      if (manageLoadingState) {
        setIsLoadingQuotes(true);
      }
      setQuotesError(null);
      setAdvantageQuotes([]);
      
      try {
        // Convert form data to API format for Medicare Advantage quotes
        const quoteParams = {
          zipCode: formData.zipCode,
        };

        console.log('Fetching Medicare Advantage quotes with params:', quoteParams);
        
        const response = await getMedicareAdvantageQuotes(quoteParams);
        
        console.log('📈 Medicare Advantage quotes response:', response);
        
        if (response.error) {
          console.log('🔥 API Error:', response.error);
          setQuotesError(response.error);
        } else if (response.quotes && Array.isArray(response.quotes)) {
          console.log('✅ Success! Received quotes:', response.quotes.length);
          setAdvantageQuotes(response.quotes);
          
          // Save to localStorage for MedicareAdvantageShopContent to pick up
          localStorage.setItem('medicare_advantage_quotes', JSON.stringify(response.quotes));
          localStorage.setItem('medicare_advantage_zipcode', formData.zipCode);
          
          console.log(`Received ${response.quotes.length} Medicare Advantage quotes`);
        } else {
          console.error('❌ Invalid response format:', response);
          setQuotesError('Invalid response from quotes API');
        }
      } catch (error) {
        console.error('❌ Error getting Medicare Advantage quotes:', error);
        setQuotesError(error instanceof Error ? error.message : 'Failed to fetch quotes');
      } finally {
        if (manageLoadingState) {
          setIsLoadingQuotes(false);
        }
      }
    } else {
      console.log('⚠️ Category not supported, showing placeholder for:', category);
      // For other categories, show placeholder for now
      if (manageLoadingState) {
        setIsLoadingQuotes(false);
      }
    }
  };

  // Helper function to check if there are any quotes (medigap or advantage)
  const hasQuotes = () => {
    return realQuotes.length > 0 || advantageQuotes.length > 0;
  };

  // Function to toggle between medigap and advantage when both are selected
  const handleCategoryToggle = (category: 'medigap' | 'advantage') => {
    setActiveCategory(category);
    setSelectedCategory(category);
    
    // Update URL to reflect the new category
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', category);
    router.push(`/medicare?${params.toString()}`);
    
    // If we don't have quotes for this category yet, fetch them
    if (category === 'medigap' && realQuotes.length === 0 && quoteFormData.zipCode) {
      handleQuoteFormSubmitWithData(quoteFormData, category);
    } else if (category === 'advantage' && advantageQuotes.length === 0 && quoteFormData.zipCode) {
      handleQuoteFormSubmitWithData(quoteFormData, category);
    }
  };

  // Function to fetch quotes for a specific Medigap plan
  const fetchIndividualPlanQuotes = async (planType: string) => {
    console.log(`🎯 Fetching quotes for Plan ${planType}`);
    
    if (!quoteFormData.age || !quoteFormData.zipCode || !quoteFormData.gender || quoteFormData.tobaccoUse === null) {
      console.log('⚠️ Form data incomplete for individual plan fetch');
      return;
    }

    // Set loading state for this specific plan button
    setLoadingPlanButton(planType);

    try {
      // Small delay for better UX (optional - can be removed)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const quoteParams = {
        zipCode: quoteFormData.zipCode,
        age: quoteFormData.age.toString(),
        gender: quoteFormData.gender === 'male' ? 'M' as const : 'F' as const,
        tobacco: quoteFormData.tobaccoUse ? "1" as const : "0" as const,
        plans: [planType], // Only fetch for this specific plan
      };

      console.log(`Fetching Plan ${planType} quotes with params:`, quoteParams);
      
      const response = await getMedigapQuotes(quoteParams);
      
      if (response.error) {
        console.log(`🔥 API Error for Plan ${planType}:`, response.error);
      } else if (response.quotes && Array.isArray(response.quotes)) {
        console.log(`✅ Success! Received ${response.quotes.length} quotes for Plan ${planType}`);
        
        // Add the new quotes to existing quotes
        setRealQuotes(prev => [...prev, ...response.quotes || []]);
        
        // Add the plan to selected plans
        setSelectedQuotePlans(prev => [...prev, planType]);
        
        // Update localStorage with the new quotes
        const allQuotes = [...realQuotes, ...(response.quotes || [])];
        localStorage.setItem(REAL_QUOTES_KEY, JSON.stringify(allQuotes));
        
        console.log(`Plan ${planType} quotes added to storage`);
      } else {
        console.error(`❌ Invalid response format for Plan ${planType}:`, response);
      }
    } catch (error) {
      console.error(`❌ Error getting Plan ${planType} quotes:`, error);
    } finally {
      // Clear loading state for this plan button
      setLoadingPlanButton(null);
    }
  };

  // Helper function to check if quotes exist for a specific plan
  const hasQuotesForPlan = (planType: string) => {
    return realQuotes.some(quote => quote.plan === planType);
  };

  const handleQuoteFormSubmit = async () => {
    console.log('🔥 handleQuoteFormSubmit called');
    console.log('🔥 quoteFormData:', quoteFormData);
    console.log('🔥 selectedCategory:', selectedCategory);
    
    // Validate form
    if (!quoteFormData.age || !quoteFormData.zipCode || !quoteFormData.gender || quoteFormData.tobaccoUse === null) {
      console.log('🔥 Validation failed');
      alert('Please fill in all required fields');
      return;
    }

    console.log('🔥 Validation passed, starting quote fetch...');
    setIsLoadingQuotes(true);
    setQuotesError(null);
    setRealQuotes([]);
    
    try {
      // Only get quotes for Medigap category
      if (selectedCategory === 'medigap') {
        console.log('🔥 Category is medigap, proceeding with API call...');
        // Convert form data to API format for our enhanced getMedigapQuotes action
        const quoteParams = {
          zipCode: quoteFormData.zipCode,
          age: quoteFormData.age.toString(),
          gender: quoteFormData.gender === 'male' ? 'M' as const : 'F' as const,
          tobacco: quoteFormData.tobaccoUse ? "1" as const : "0" as const,
          plans: ['F', 'G', 'N'], // Default to most common Medigap plans
          // appointedNaicCodes: [] // Optional: Add specific NAIC codes if needed
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
      } else {
        console.log('🔥 Category is not medigap, selectedCategory:', selectedCategory);
      }
      
      // Mark form as completed
      setQuoteFormCompleted(true);
      
      // Immediately save the completion status to localStorage to ensure persistence
      saveToStorage(QUOTE_FORM_COMPLETED_KEY, true);
      
      // Update URL to indicate results are shown
      const newUrl = `${pathname}?step=results${selectedCategory ? `&category=${selectedCategory}` : ''}`;
      window.history.replaceState(null, '', newUrl);
      
    } catch (error) {
      console.error('Quote generation failed:', error);
      setQuotesError(error instanceof Error ? error.message : 'Failed to generate quotes. Please try again.');
    } finally {
      setIsLoadingQuotes(false);
    }
  };

  // Clear localStorage and reset form
  const clearStorageAndReset = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(QUOTE_FORM_DATA_KEY);
      localStorage.removeItem(QUOTE_FORM_COMPLETED_KEY);
      localStorage.removeItem(REAL_QUOTES_KEY);
      localStorage.removeItem(ADVANTAGE_QUOTES_KEY);
      localStorage.removeItem(FILTER_STATE_KEY);
      // Clean up any other Medicare-related data
      cleanupOldStorage();
    }
    setQuoteFormData({
      age: '',
      zipCode: '',
      gender: '',
      tobaccoUse: null,
      email: '',
      firstName: ''
    });
    setQuoteFormCompleted(false);
    setRealQuotes([]);
    setAdvantageQuotes([]);
    
    // Reset filter states to defaults
    setSearchQuery('');
    setSortBy('popularity');
    setPriceRange([0, 500]);
    setSelectedCoverageLevel('all');
    setSelectedMedigapPlans(['plan-f', 'plan-g', 'plan-n']);
    setSelectedQuotePlans(['F', 'G', 'N']);
    setApplyDiscounts(false);
    setPaymentMode('monthly');
    
    // Update URL to remove step parameter
    const newUrl = pathname;
    window.history.replaceState(null, '', newUrl);
    
    // Navigate back to main Medicare flow page
    if (typeof window !== 'undefined') {
      window.location.href = '/medicare';
    }
  };

  // Debug function to check storage state
  const debugStorageState = () => {
    console.log('🐛 Debug Storage State:');
    console.log('LocalStorage - Form Data:', localStorage.getItem(QUOTE_FORM_DATA_KEY));
    console.log('LocalStorage - Form Completed:', localStorage.getItem(QUOTE_FORM_COMPLETED_KEY));
    console.log('LocalStorage - Real Quotes:', localStorage.getItem(REAL_QUOTES_KEY));
    console.log('LocalStorage - Advantage Quotes:', localStorage.getItem(ADVANTAGE_QUOTES_KEY));
    console.log('LocalStorage - Filter State:', localStorage.getItem(FILTER_STATE_KEY));
    console.log('LocalStorage - Plan Details:', localStorage.getItem('planDetailsData'));
    console.log('LocalStorage - Quotes Backup:', localStorage.getItem('medicare_quotes_backup'));
    console.log('State - quoteFormCompleted:', quoteFormCompleted);
    console.log('State - realQuotes length:', realQuotes.length);
    console.log('State - advantageQuotes length:', advantageQuotes.length);
    console.log('State - hasQuotes():', hasQuotes());
    console.log('State - isInitializing:', isInitializing);
    console.log('State - selectedQuotePlans:', selectedQuotePlans);
  };

  // Make debug function available globally for testing
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).debugMedicareStorage = debugStorageState;
    }
  }, []);

  const isQuoteFormValid = () => {
    return quoteFormData.age && 
           quoteFormData.zipCode && 
           quoteFormData.gender && 
           quoteFormData.tobaccoUse !== null;
  };

  const getFilteredPlans = () => {
    if (!currentCategory) return [];
    
    let plans = currentCategory.plans;
    
    // Search filter
    if (searchQuery) {
      plans = plans.filter(plan => 
        plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.features.some(feature => feature.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Price range filter
    plans = plans.filter(plan => 
      plan.monthlyPremium >= priceRange[0] && plan.monthlyPremium <= priceRange[1]
    );
    
    // Coverage level filter
    if (selectedCoverageLevel !== 'all') {
      plans = plans.filter(plan => plan.coverageLevel === selectedCoverageLevel);
    }

    // Medigap plan filter (only apply when in medigap category)
    if (selectedCategory === 'medigap' && selectedMedigapPlans.length > 0) {
      plans = plans.filter(plan => selectedMedigapPlans.includes(plan.id));
    }
    
    // Sort
    plans = [...plans].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.monthlyPremium - b.monthlyPremium;
        case 'rating':
          // Handle null ratings - put null ratings at the end
          if (a.rating === null && b.rating === null) return 0;
          if (a.rating === null) return 1;
          if (b.rating === null) return -1;
          return b.rating - a.rating;
        case 'popularity':
          return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
        default:
          return 0;
      }
    });
    
    return plans;
  };

  // Function to get display plans - uses real quotes when available for Medigap
  const getDisplayPlans = () => {
    if (selectedCategory === 'medigap') {
      // For Medigap, only show real quotes or loading - no mock plans
      if (realQuotes.length > 0) {
        // Filter quotes by selected plan types first
        const filteredQuotes = realQuotes.filter(quote => {
          // Plan type filter
          const matchesPlan = selectedQuotePlans.includes(quote.plan || '');
          
          // Search filter for carrier names
          if (searchQuery && matchesPlan) {
            const carrierName = quote.carrier?.name || 
                               quote.carrier?.full_name || 
                               quote.company_base?.name ||
                               quote.company_base?.full_name ||
                               quote.company ||
                               'Unknown Carrier';
            
            return carrierName.toLowerCase().includes(searchQuery.toLowerCase());
          }
          
          return matchesPlan;
        });
        
        // Convert filtered real quotes to display format
        return filteredQuotes.map((quote, index) => {
          // Get carrier name from available sources
          const carrierName = quote.carrier?.name || 
                             quote.carrier?.full_name || 
                             quote.company_base?.name ||
                             quote.company_base?.full_name ||
                             quote.company ||
                             'Unknown Carrier';
          
          // Get monthly premium from available sources
          const monthlyPremium = quote.monthly_premium || 
                                (quote.rate?.month ? quote.rate.month / 100 : 0);
          
          return {
            id: quote.id || `quote-${quote.plan}-${carrierName.replace(/\s+/g, '-')}-${index}`,
            name: carrierName,
            description: `Plan ${quote.plan} - Medicare Supplement`,
            premiumRange: `$${Math.round(convertPriceByPaymentMode(monthlyPremium))}${getPaymentLabel()}`,
            monthlyPremium: monthlyPremium,
            deductible: quote.plan === 'F' ? 'None after Original Medicare' : 'Varies by plan',
            features: [`Plan ${quote.plan}`, 'Medicare Supplement', carrierName],
            pros: ['Real-time pricing', 'Licensed carrier', 'Medicare approved'],
            cons: ['Subject to underwriting', 'Premium may increase'],
            rating: null, // No rating for real quotes
            reviewCount: null, // No review count for real quotes
            coverageLevel: 'Standard' as const,
            suitableFor: ['Medicare beneficiaries', `Plan ${quote.plan} coverage`],
            isPopular: false,
            isBestValue: false, // Will be set based on lowest price
            isNew: false,
            plan: quote.plan,
            carrier: quote.carrier,
            naic: quote.naic,
            effective_date: quote.effective_date
          };
        }).map((plan, index, array) => ({
          ...plan,
          isBestValue: index === 0 && array.length > 1 // Mark first (lowest price) as best value
        }));
      } else {
        // For Medigap with no quotes, return empty array (will show loading or empty state)
        return [];
      }
    }
    
    // For other categories, use filtered mock plans
    return getFilteredPlans();
  };

  // Get paginated plans
  const getPaginatedPlans = () => {
    const allPlans = getDisplayPlans();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allPlans.slice(startIndex, endIndex);
  };

  // Get pagination info (updated for grouped display)
  const getPaginationInfo = () => {
    const display = getPaginatedDisplay();
    const totalPages = Math.ceil(display.totalItems / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, display.totalItems);
    
    return {
      totalItems: display.totalItems,
      totalPages,
      currentPage,
      startItem,
      endItem,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
      displayType: display.type
    };
  };

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, priceRange, selectedCoverageLevel, selectedMedigapPlans, selectedQuotePlans, sortBy]);

  // Group quotes by carrier when multiple plans are selected
  // Helper function to calculate price with discounts
  const calculateDiscountedPrice = (quote: any) => {
    // Try different possible paths for monthly premium
    let basePremium = 0;
    
    if (quote.monthly_premium) {
      basePremium = quote.monthly_premium;
    } else if (quote.rate?.month) {
      basePremium = quote.rate.month / 100; // Convert cents to dollars
    } else if (quote.monthlyPremium) {
      basePremium = quote.monthlyPremium;
    } else if (quote.premium) {
      basePremium = quote.premium;
    } else if (quote.rate?.annual) {
      basePremium = quote.rate.annual / 100 / 12; // Convert annual cents to monthly dollars
    }
    
    if (!applyDiscounts || !quote.discounts || quote.discounts.length === 0) {
      return basePremium;
    }

    let discountedPrice = basePremium;
    quote.discounts.forEach((discount: any) => {
      if (discount.type === 'percent') {
        discountedPrice = discountedPrice * (1 - discount.value);
      } else {
        // Assume it's a dollar amount
        discountedPrice = discountedPrice - discount.value;
      }
    });

    return Math.max(0, discountedPrice); // Ensure price doesn't go negative
  };

  // Helper function to convert price based on payment mode
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

  // Helper function to get payment label
  const getPaymentLabel = () => {
    switch (paymentMode) {
      case 'quarterly':
        return '/quarter';
      case 'annually':
        return '/year';
      default:
        return '/mo';
    }
  };

  const getGroupedPlansByCarrier = () => {
    if (selectedCategory !== 'medigap' || realQuotes.length === 0) {
      return null; // Use regular display for mock data
    }

    // Always use grouped display regardless of plan count
    const selectedPlanCount = selectedQuotePlans.length;
    console.log(`Grouping plans for ${selectedPlanCount} selected plan types:`, selectedQuotePlans);

    // Filter quotes by selected plan types
    const filteredQuotes = realQuotes.filter(quote => {
      // Plan type filter
      const matchesPlan = selectedQuotePlans.includes(quote.plan || '');
      
      // Search filter for carrier names
      if (searchQuery && matchesPlan) {
        const carrierName = quote.carrier?.name || 
                           quote.company_base?.name ||
                           quote.company ||
                           'Unknown Carrier';
        
        return carrierName.toLowerCase().includes(searchQuery.toLowerCase());
      }
      
      return matchesPlan;
    });

    // Group by NAIC (carrier identifier)
    const groupedByCarrier = filteredQuotes.reduce((groups, quote) => {
      // Try multiple fields to identify the carrier
      const carrierId = quote.naic || 
                       quote.carrier?.name || 
                       quote.company_base?.name ||
                       quote.company ||
                       'Unknown';
                       
      // Get carrier name from NAIC data if available, otherwise fallback to quote data
      let carrierName = quote.carrier?.name;
      if (quote.naic) {
        const naicCarrier = getCarrierByNaicCode(quote.naic);
        if (naicCarrier) {
          carrierName = naicCarrier.shortName || naicCarrier.carrierName;
        }
      }
      
      // Fallback if no carrier name found
      if (!carrierName) {
        carrierName = quote.carrier?.full_name || 
                     quote.company_base?.name ||
                     quote.company_base?.full_name ||
                     quote.company ||
                     `Carrier ${carrierId}`;
      }

      if (!groups[carrierId]) {
        groups[carrierId] = {
          carrierId,
          carrierName,
          quotes: []
        };
      }

      groups[carrierId].quotes.push(quote);
      return groups;
    }, {} as Record<string, { carrierId: string; carrierName: string; quotes: any[] }>);

    // Convert to array and sort carriers by average premium
    const carrierGroups = Object.values(groupedByCarrier).map(group => {
      // Sort quotes within each carrier by premium (lowest first)
      const sortedQuotes = group.quotes.sort((a, b) => {
        const premiumA = calculateDiscountedPrice(a);
        const premiumB = calculateDiscountedPrice(b);
        return premiumA - premiumB;
      });

      // Calculate average premium for sorting carriers
      const avgPremium = sortedQuotes.reduce((sum, quote) => {
        const premium = calculateDiscountedPrice(quote);
        return sum + premium;
      }, 0) / sortedQuotes.length;

      return {
        ...group,
        quotes: sortedQuotes,
        averagePremium: avgPremium
      };
    });

    // Debug log to see how many carrier groups we have
    console.log(`Created ${carrierGroups.length} carrier groups from ${filteredQuotes.length} quotes:`, 
      carrierGroups.map(g => ({ name: g.carrierName, id: g.carrierId, count: g.quotes.length }))
    );

    // Sort carriers by average premium
    return carrierGroups.sort((a, b) => a.averagePremium - b.averagePremium);
  };

  // Get paginated carrier groups or individual plans
  const getPaginatedDisplay = () => {
    const carrierGroups = getGroupedPlansByCarrier();
    
    if (carrierGroups) {
      // Return paginated carrier groups
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return {
        type: 'grouped',
        data: carrierGroups.slice(startIndex, endIndex),
        totalItems: carrierGroups.length
      };
    } else {
      // Return paginated individual plans
      const allPlans = getDisplayPlans();
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return {
        type: 'individual',
        data: allPlans.slice(startIndex, endIndex),
        totalItems: allPlans.length
      };
    }
  };

  const handlePlanClick = (categoryId: string, planId: string) => {
    router.push(`/medicare/shop/${categoryId}/${planId}`);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const stepParam = searchParams.get('step');
    const newUrl = `/medicare/shop?category=${categoryId}${stepParam ? `&step=${stepParam}` : ''}`;
    window.history.replaceState(null, '', newUrl);
  };

  // Initialize category from URL params
  React.useEffect(() => {
    if (categoryParam && productCategories.find(cat => cat.id === categoryParam)) {
      setSelectedCategory(categoryParam);
      setActiveCategory(categoryParam); // Also set activeCategory for proper routing
    }
  }, [searchParams, categoryParam]);

  // Debug routing decisions
  React.useEffect(() => {
    console.log('🔍 Routing Debug:', {
      selectedCategory,
      activeCategory,
      categoryParam,
      stepParam,
      shouldRouteToAdvantage: selectedCategory === 'advantage' || activeCategory === 'advantage',
      hasAdvantageQuotes: advantageQuotes.length > 0,
      isInitializing
    });
  }, [selectedCategory, activeCategory, categoryParam, stepParam, advantageQuotes.length, isInitializing]);

  const displayData = getPaginatedDisplay();
  const paginationInfo = getPaginationInfo();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          quoteType={(() => {
            const hasMedigap = selectedFlowCategories.includes('medigap');
            const hasAdvantage = selectedFlowCategories.includes('advantage');
            if (hasMedigap && hasAdvantage) return 'both';
            if (hasAdvantage) return 'advantage';
            return 'medigap';
          })()}
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
          {/* Show Shopping Header Only When There Are Quotes */}
      {hasQuotes() && (
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            
            {/* Cart Summary */}
            <div className="flex items-center gap-4">
              {cart.length > 0 && (
                <Badge variant="outline" className="px-3 py-1">
                  {cart.length} plan{cart.length !== 1 ? 's' : ''} selected
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Plan Type Controls - Under Shop/Learn/Resources Navigation */}
      {hasQuotes() && (
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-4">
              {/* Category Toggle for when both Medigap and Advantage are selected */}
              {selectedFlowCategories.includes('medigap') && selectedFlowCategories.includes('advantage') && (
                <div className="flex items-center gap-2 p-1 bg-background rounded-lg border">
                  <Button
                    variant={activeCategory === 'medigap' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleCategoryToggle('medigap')}
                    className="flex-1"
                  >
                    Medicare Supplement
                  </Button>
                  <Button
                    variant={activeCategory === 'advantage' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleCategoryToggle('advantage')}
                    className="flex-1"
                  >
                    Medicare Advantage
                  </Button>
                </div>
              )}
            </div>
            
            {/* Reset Button - Moved to right of toggles */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-muted-foreground hover:text-foreground"
                  title="Clear all quotes and start over"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset All Data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will clear all your quotes, form data, and filters. You'll need to start over from the beginning. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearStorageAndReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Reset Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

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
        <aside className="lg:col-span-1">
          <div className="space-y-4">
            {/* Search */}
            <div>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search carriers or plans..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Combined Categories and Filters */}
            <Card className="border">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <MixerHorizontalIcon className="w-4 h-4" />
                  Categories & Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Plan Categories Dropdown - moved from main content */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">Plan Category</h4>
                  <Select value={selectedCategory} onValueChange={(value) => handleCategorySelect(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select plan category" />
                    </SelectTrigger>
                    <SelectContent>
                      {productCategories.map((category) => {
                        // For Medigap, show count of real quotes when available
                        let planCount = category.plans.length;
                        if (category.id === 'medigap' && realQuotes.length > 0) {
                          const filteredQuotes = realQuotes.filter(quote => {
                            const matchesPlan = selectedQuotePlans.includes(quote.plan || '');
                            if (searchQuery && matchesPlan) {
                              const carrierName = quote.carrier?.name || 
                                                 quote.company_base?.name ||
                                                 quote.company ||
                                                 'Unknown Carrier';
                              return carrierName.toLowerCase().includes(searchQuery.toLowerCase());
                            }
                            return matchesPlan;
                          });
                          planCount = filteredQuotes.length;
                        }
                        
                        return (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2">
                                <span>{category.name}</span>
                                {category.isPopular && (
                                  <StarFilledIcon className="w-3 h-3 text-yellow-500" />
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground ml-2">({planCount})</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* User Details - moved from top right */}
                {quoteFormData && (quoteFormData.age || quoteFormData.zipCode || quoteFormData.gender) && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Your Information</h4>
                    <div className="space-y-2 text-sm">
                      {quoteFormData.age && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Age:</span>
                          <span className="font-medium">{quoteFormData.age}</span>
                        </div>
                      )}
                      {quoteFormData.gender && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Gender:</span>
                          <span className="font-medium">{quoteFormData.gender === 'male' ? 'Male' : 'Female'}</span>
                        </div>
                      )}
                      {quoteFormData.zipCode && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Zip Code:</span>
                          <span className="font-medium">{quoteFormData.zipCode}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Filter Controls */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground">Refine Results</h4>
                  
                  {/* Apply Discounts Toggle */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Discounts</label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="apply-discounts"
                        checked={applyDiscounts}
                        onCheckedChange={(checked) => setApplyDiscounts(checked as boolean)}
                      />
                      <label htmlFor="apply-discounts" className="text-sm">
                        Apply Discounts
                      </label>
                    </div>
                  </div>
                  
                  {/* Sort By */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort By</label>
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="popularity">Popularity</SelectItem>
                        <SelectItem value="price">Price (Low to High)</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Monthly Premium: ${priceRange[0]} - ${priceRange[1]}
                    </label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={500}
                      min={0}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>$0</span>
                      <span>$500+</span>
                    </div>
                  </div>

                  {/* Coverage Level */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Coverage Level</label>
                    <Select value={selectedCoverageLevel} onValueChange={setSelectedCoverageLevel}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="Basic">Basic</SelectItem>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="Premium">Premium</SelectItem>
                        <SelectItem value="Comprehensive">Comprehensive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Medigap Plan Selection - Only show for Medigap category */}
                  {selectedCategory === 'medigap' && realQuotes.length === 0 && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Medigap Plans
                      </label>
                      <div className="space-y-2">
                        {/* Mock data: use selectedMedigapPlans state */}
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="plan-f"
                            checked={selectedMedigapPlans.includes('plan-f')}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedMedigapPlans([...selectedMedigapPlans, 'plan-f']);
                              } else {
                                setSelectedMedigapPlans(selectedMedigapPlans.filter(id => id !== 'plan-f'));
                              }
                            }}
                            className="border-blue-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />
                          <label htmlFor="plan-f" className="text-sm">Plan F</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="plan-g"
                            checked={selectedMedigapPlans.includes('plan-g')}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedMedigapPlans([...selectedMedigapPlans, 'plan-g']);
                              } else {
                                setSelectedMedigapPlans(selectedMedigapPlans.filter(id => id !== 'plan-g'));
                              }
                            }}
                            className="border-green-400 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                          />
                          <label htmlFor="plan-g" className="text-sm">Plan G</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="plan-n"
                            checked={selectedMedigapPlans.includes('plan-n')}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedMedigapPlans([...selectedMedigapPlans, 'plan-n']);
                              } else {
                                setSelectedMedigapPlans(selectedMedigapPlans.filter(id => id !== 'plan-n'));
                              }
                            }}
                            className="border-purple-400 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                          />
                          <label htmlFor="plan-n" className="text-sm">Plan N</label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Filter Buttons */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Quick Filters</label>
                    <div className="grid grid-cols-1 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="justify-start text-xs"
                        onClick={() => setSortBy('popularity')}
                      >
                        <StarIcon className="w-3 h-3 mr-2" />
                        Most Popular
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="justify-start text-xs"
                        onClick={() => setSortBy('price')}
                      >
                        <TokensIcon className="w-3 h-3 mr-2" />
                        Lowest Cost
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="justify-start text-xs"
                        onClick={() => {
                          setSelectedCoverageLevel('Comprehensive');
                          setSortBy('rating');
                        }}
                      >
                        <HeartIcon className="w-3 h-3 mr-2" />
                        Best Coverage
                      </Button>
                    </div>
                  </div>

                  {/* Payment Mode */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Payment Mode</label>
                    <Select value={paymentMode} onValueChange={(value: 'monthly' | 'quarterly' | 'annually') => setPaymentMode(value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Clear Filters */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs"
                    onClick={() => {
                      setSearchQuery('');
                      setPriceRange([0, 500]);
                      setSelectedCoverageLevel('all');
                      setSortBy('popularity');
                      setSelectedMedigapPlans(['plan-f', 'plan-g', 'plan-n']);
                      setSelectedQuotePlans(['F', 'G', 'N']);
                      setApplyDiscounts(false);
                      setPaymentMode('monthly');
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

          {/* Popular Plans Chart */}
          <Card className="border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <ActivityLogIcon className="w-4 h-4" />
                Plan Popularity
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[180px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={popularityData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={30}
                    strokeWidth={3}
                  />
                </PieChart>
              </ChartContainer>
              <div className="mt-3 space-y-1">
                {popularityData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: item.fill }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          </div>
        </aside>

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

          {currentCategory && (
            <div className="space-y-6">
              {/* Results Header with Pagination Info */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">{currentCategory.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedCategory === 'medigap' && realQuotes.length > 0 ? (
                      <>
                        Showing {paginationInfo.startItem}-{paginationInfo.endItem} of {paginationInfo.totalItems} carrier{paginationInfo.totalItems !== 1 ? 's' : ''}
                        <span className="ml-2 text-xs">
                          ({realQuotes.length} quote{realQuotes.length !== 1 ? 's' : ''} loaded)
                        </span>
                      </>
                    ) : (
                      <>
                        Showing {paginationInfo.startItem}-{paginationInfo.endItem} of {paginationInfo.totalItems} plan{paginationInfo.totalItems !== 1 ? 's' : ''}
                      </>
                    )}
                  </p>
                </div>

                {/* Plan Types Checkboxes/Buttons for Medigap */}
                {selectedCategory === 'medigap' && realQuotes.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-muted-foreground">Plan Types:</span>
                      <div className="flex items-center gap-4">
                        {/* Plan F */}
                        {hasQuotesForPlan('F') ? (
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="header-plan-f"
                              checked={selectedQuotePlans.includes('F')}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedQuotePlans([...selectedQuotePlans, 'F']);
                                } else {
                                  setSelectedQuotePlans(selectedQuotePlans.filter(plan => plan !== 'F'));
                                }
                              }}
                              className="border-blue-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                            <label htmlFor="header-plan-f" className="text-sm font-medium">
                              Plan F
                            </label>
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => fetchIndividualPlanQuotes('F')}
                            disabled={loadingPlanButton === 'F'}
                            className="text-xs px-3 py-1 border-blue-300 text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-400"
                          >
                            {loadingPlanButton === 'F' ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                Loading...
                              </>
                            ) : (
                              '+ Plan F'
                            )}
                          </Button>
                        )}
                        
                        {/* Plan G */}
                        {hasQuotesForPlan('G') ? (
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="header-plan-g"
                              checked={selectedQuotePlans.includes('G')}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedQuotePlans([...selectedQuotePlans, 'G']);
                                } else {
                                  setSelectedQuotePlans(selectedQuotePlans.filter(plan => plan !== 'G'));
                                }
                              }}
                              className="border-green-400 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                            />
                            <label htmlFor="header-plan-g" className="text-sm font-medium">
                              Plan G
                            </label>
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => fetchIndividualPlanQuotes('G')}
                            disabled={loadingPlanButton === 'G'}
                            className="text-xs px-3 py-1 border-green-300 text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30 hover:border-green-400"
                          >
                            {loadingPlanButton === 'G' ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                Loading...
                              </>
                            ) : (
                              '+ Plan G'
                            )}
                          </Button>
                        )}
                        
                        {/* Plan N */}
                        {hasQuotesForPlan('N') ? (
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="header-plan-n"
                              checked={selectedQuotePlans.includes('N')}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedQuotePlans([...selectedQuotePlans, 'N']);
                                } else {
                                  setSelectedQuotePlans(selectedQuotePlans.filter(plan => plan !== 'N'));
                                }
                              }}
                              className="border-purple-400 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                            />
                            <label htmlFor="header-plan-n" className="text-sm font-medium">
                              Plan N
                            </label>
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => fetchIndividualPlanQuotes('N')}
                            disabled={loadingPlanButton === 'N'}
                            className="text-xs px-3 py-1 border-purple-300 text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:border-purple-400"
                          >
                            {loadingPlanButton === 'N' ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                Loading...
                              </>
                            ) : (
                              '+ Plan N'
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
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
                /* Empty State for Medigap (when no quotes available) */
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
                    <MagnifyingGlassIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No Medicare Supplement Plans Found
                  </h3>
                  <p className="text-muted-foreground mb-4 max-w-md">
                    We couldn't find any Medigap plans for your area and criteria. Try adjusting your search or contact us for assistance.
                  </p>
                  <Button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedQuotePlans(['F', 'G', 'N']);
                    }}
                    variant="outline"
                  >
                    Reset Filters
                  </Button>
                </div>
              ) : (
                /* Regular Product Grid for other categories - not used for advantage anymore */
                /* Regular Product Grid */
                <div className={`grid gap-6 ${
                  selectedQuotePlans.length === 1 
                    ? 'grid-cols-1 sm:grid-cols-2' 
                    : 'grid-cols-1'
                }`}>
                {displayData.type === 'grouped' ? (
                  // Grouped by carrier display (with plan type filtering)
                  displayData.data.map((carrierGroup: any) => {
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
                                      planType === 'F' ? 'bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800' :
                                      planType === 'G' ? 'bg-green-50/80 dark:bg-green-950/30 border border-green-200 dark:border-green-800' :
                                      planType === 'N' ? 'bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800' :
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
                                            {planType === 'F' ? 'Eligible Before 2020' :
                                             planType === 'G' ? 'Popular Choice' :
                                             planType === 'N' ? 'Lower Premium' :
                                             'Medicare Supplement'}
                                          </Badge>
                                        )}
                                      </div>
                                      
                                      {/* Plan type description */}
                                      <div className="text-sm text-muted-foreground mb-2">
                                        {planType === 'F' ? 'Only available if eligible for Medicare before Jan 1, 2020. Covers all gaps.' :
                                         planType === 'G' ? 'Covers all gaps except Part B deductible ($240/yr)' :
                                         planType === 'N' ? 'Lower cost with small copays for office visits & ER' :
                                         'Medicare Supplement coverage'}
                                      </div>
                                      
                                      {hasMultipleVersions && (
                                        <p className="text-sm text-muted-foreground">
                                          Multiple versions available
                                        </p>
                                      )}
                                      {bestQuote.discounts && bestQuote.discounts.length > 0 && (
                                        <p className="text-xs text-blue-600">
                                          Available discounts: {bestQuote.discounts.map((d: any) => {
                                            const name = d.name.charAt(0).toUpperCase() + d.name.slice(1);
                                            const value = d.type === 'percent' ? `${Math.round(d.value * 100)}%` : `$${d.value}`;
                                            return `${name} (${value})`;
                                          }).join(', ')}
                                        </p>
                                      )}
                                      {bestQuote.effective_date && (
                                        <p className="text-xs text-muted-foreground">
                                          Effective: {new Date(bestQuote.effective_date).toLocaleDateString()}
                                        </p>
                                      )}
                                    </div>
                                    
                                    {/* Action Button - always at bottom */}
                                    <div className="mt-auto">
                                      <Button size="default" className="w-full" onClick={() => openPlanModal(filteredCarrierGroup)}>
                                        Select Plan
                                      </Button>
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }).filter(Boolean)
                ) : (
                  // Use mock data display for individual plans (simplified)
                  displayData.data.map((plan: any) => (
                    <Card key={plan.id} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
                      <CardContent className="p-6">
                        <div className="flex flex-col space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                              <Image
                                src={getCachedLogoUrl(plan.name, plan.naic)}
                                alt={`${plan.name} logo`}
                                width={40}
                                height={40}
                                className="w-full h-full object-contain"
                                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                  const target = e.currentTarget;
                                  const parent = target.parentElement;
                                  if (parent) {
                                    target.style.display = 'none';
                                    const initials = plan.name
                                      .split(' ')
                                      .map((word: string) => word[0])
                                      .join('')
                                      .substring(0, 2)
                                      .toUpperCase();
                                    parent.innerHTML = `<span class="text-xs font-semibold text-gray-600">${initials}</span>`;
                                  }
                                }}
                              />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-primary">{plan.name}</h3>
                              <div className="text-sm text-muted-foreground">
                                Plan {plan.plan} • {plan.category}
                              </div>
                            </div>
                          </div>
                          <div className="text-xl font-bold text-primary">
                            ${Math.round(convertPriceByPaymentMode(calculateDiscountedPrice(plan)))}{getPaymentLabel()}
                          </div>
                          <Button
                            variant="default"
                            onClick={() => addToCart(plan, currentCategory.id)}
                            className="w-full"
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
              )}

              {/* Show empty state for other categories or when no data */}
              {(!isLoadingQuotes && displayData.data.length === 0 && selectedCategory !== 'medigap') && (
                <Card className="text-center py-12">
                  <CardContent>
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                        <MagnifyingGlassIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">No plans found</h3>
                        <p className="text-muted-foreground">
                          Try adjusting your filters or search terms
                        </p>
                      </div>
                      <Button variant="outline" onClick={() => {
                        setSearchQuery('');
                        setPriceRange([0, 500]);
                        setSelectedCoverageLevel('all');
                      }}>
                        Clear Filters
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Pagination Controls */}
              {paginationInfo.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t">
                  <div className="text-sm text-muted-foreground">
                    Page {paginationInfo.currentPage} of {paginationInfo.totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={!paginationInfo.hasPrevPage}
                    >
                      Previous
                    </Button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, paginationInfo.totalPages) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(
                          paginationInfo.totalPages - 4,
                          paginationInfo.currentPage - 2
                        )) + i;
                        
                        if (pageNum <= paginationInfo.totalPages) {
                          return (
                            <Button
                              key={pageNum}
                              variant={pageNum === paginationInfo.currentPage ? "default" : "outline"}
                              size="sm"
                              className="w-10 h-8"
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                        return null;
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(paginationInfo.totalPages, prev + 1))}
                      disabled={!paginationInfo.hasNextPage}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
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
                      <UserCheck className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Guided Experience</h3>
                    <p className="text-muted-foreground mb-6">
                     We'll recommend the best plan types for you.
                    </p>
                    <Button 
                      onClick={() => {
                        setMedicareFlowMode('guided');
                        setShowMedicareFlow(true);
                      }}
                      className="w-full"
                      size="lg"
                    >
                      Get Personalized Recommendations
                    </Button>
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
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setMedicareFlowMode('quick');
                        setShowMedicareFlow(true);
                      }}
                      className="w-full"
                      size="lg"
                    >
                      Get Quick Quotes
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
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
            {/* Plan Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border p-3 text-left font-semibold">Benefit</th>
                    {selectedQuotePlans.includes('F') && (
                      <th className="border border-border p-3 text-center font-semibold bg-blue-50/80 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300">Plan F</th>
                    )}
                    {selectedQuotePlans.includes('G') && (
                      <th className="border border-border p-3 text-center font-semibold bg-green-50/80 dark:bg-green-950/30 text-green-700 dark:text-green-300">Plan G</th>
                    )}
                    {selectedQuotePlans.includes('N') && (
                      <th className="border border-border p-3 text-center font-semibold bg-purple-50/80 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300">Plan N</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-3 font-medium">Part A Deductible</td>
                    {selectedQuotePlans.includes('F') && <td className="border border-border p-3 text-center bg-blue-50/50 dark:bg-blue-950/20">✓ Covered</td>}
                    {selectedQuotePlans.includes('G') && <td className="border border-border p-3 text-center bg-green-50/50 dark:bg-green-950/20">✓ Covered</td>}
                    {selectedQuotePlans.includes('N') && <td className="border border-border p-3 text-center bg-purple-50/50 dark:bg-purple-950/20">✓ Covered</td>}
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-medium">Part B Deductible ($240/yr)</td>
                    {selectedQuotePlans.includes('F') && <td className="border border-border p-3 text-center bg-blue-50/50 dark:bg-blue-950/20">✓ Covered</td>}
                    {selectedQuotePlans.includes('G') && <td className="border border-border p-3 text-center bg-green-50/50 dark:bg-green-950/20">✗ You Pay</td>}
                    {selectedQuotePlans.includes('N') && <td className="border border-border p-3 text-center bg-purple-50/50 dark:bg-purple-950/20">✗ You Pay</td>}
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-medium">Part B Coinsurance</td>
                    {selectedQuotePlans.includes('F') && <td className="border border-border p-3 text-center bg-blue-50/50 dark:bg-blue-950/20">✓ Covered</td>}
                    {selectedQuotePlans.includes('G') && <td className="border border-border p-3 text-center bg-green-50/50 dark:bg-green-950/20">✓ Covered</td>}
                    {selectedQuotePlans.includes('N') && <td className="border border-border p-3 text-center bg-purple-50/50 dark:bg-purple-950/20">✓ Covered</td>}
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-medium">Doctor Office Visits</td>
                    {selectedQuotePlans.includes('F') && <td className="border border-border p-3 text-center bg-blue-50/50 dark:bg-blue-950/20">✓ Covered</td>}
                    {selectedQuotePlans.includes('G') && <td className="border border-border p-3 text-center bg-green-50/50 dark:bg-green-950/20">✓ Covered</td>}
                    {selectedQuotePlans.includes('N') && <td className="border border-border p-3 text-center bg-purple-50/50 dark:bg-purple-950/20">$20 copay</td>}
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-medium">Emergency Room</td>
                    {selectedQuotePlans.includes('F') && <td className="border border-border p-3 text-center bg-blue-50/50 dark:bg-blue-950/20">✓ Covered</td>}
                    {selectedQuotePlans.includes('G') && <td className="border border-border p-3 text-center bg-green-50/50 dark:bg-green-950/20">✓ Covered</td>}
                    {selectedQuotePlans.includes('N') && <td className="border border-border p-3 text-center bg-purple-50/50 dark:bg-purple-950/20">$50 copay</td>}
                  </tr>
                  <tr>
                    <td className="border border-border p-3 font-medium">Part B Excess Charges</td>
                    {selectedQuotePlans.includes('F') && <td className="border border-border p-3 text-center bg-blue-50/50 dark:bg-blue-950/20">✓ Covered</td>}
                    {selectedQuotePlans.includes('G') && <td className="border border-border p-3 text-center bg-green-50/50 dark:bg-green-950/20">✓ Covered</td>}
                    {selectedQuotePlans.includes('N') && <td className="border border-border p-3 text-center bg-purple-50/50 dark:bg-purple-950/20">✗ You Pay</td>}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Key Differences Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {selectedQuotePlans.length === 1 ? "Plan Details" : "Key Differences"}
              </h3>
              <div className="grid gap-4 md:grid-cols-1">
                {selectedQuotePlans.includes('F') && (
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Plan F - Most Comprehensive</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                      <strong>Eligibility:</strong> Only available if you were eligible for Medicare before January 1, 2020.
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Covers all Medicare gaps including the Part B deductible. You'll have minimal out-of-pocket costs, 
                      but typically higher monthly premiums.
                    </p>
                  </div>
                )}
                {selectedQuotePlans.includes('G') && (
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Plan G - Popular Choice</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Similar to Plan F but you pay the annual Part B deductible ($240). 
                      Often the best value with lower premiums than Plan F while still providing excellent coverage.
                    </p>
                  </div>
                )}
                {selectedQuotePlans.includes('N') && (
                  <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Plan N - Lower Premium Option</h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Lower monthly premiums but includes small copays: $20 for doctor visits, $50 for ER visits. 
                      You also pay the Part B deductible and any excess charges. Good for those who don't visit doctors frequently.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Cost Comparison */}
            {selectedQuotePlans.length > 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Annual Cost Comparison Example</h3>
                <div className="text-sm text-muted-foreground mb-3">
                  This example assumes 4 doctor visits and 1 ER visit per year, based on average premiums shown.
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {selectedQuotePlans.includes('F') && (
                    <div className="p-3 rounded border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
                      <div className="font-semibold text-blue-800 dark:text-blue-200">Plan F</div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">Premium + minimal out-of-pocket costs</div>
                    </div>
                  )}
                  {selectedQuotePlans.includes('G') && (
                    <div className="p-3 rounded border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30">
                      <div className="font-semibold text-green-800 dark:text-green-200">Plan G</div>
                      <div className="text-sm text-green-700 dark:text-green-300">Premium + $240 Part B deductible</div>
                    </div>
                  )}
                  {selectedQuotePlans.includes('N') && (
                    <div className="p-3 rounded border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30">
                      <div className="font-semibold text-purple-800 dark:text-purple-200">Plan N</div>
                      <div className="text-sm text-purple-700 dark:text-purple-300">Premium + $240 deductible + $130 copays</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

          <MedicareDisclaimer />
        </>
      )}
    </div>
  );
}
