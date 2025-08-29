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
import MedicareDisclaimer from "@/components/medicare-disclaimer";
import { getMedigapQuotes } from "@/lib/actions/medigap-quotes";
import { quoteService } from "@/lib/services/quote-service";
import { carrierService } from "@/lib/services/carrier-service-simple";
import { getCarrierByNaicCode, getProperLogoUrl } from "@/lib/naic-carriers";
import Image from "next/image";
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
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ProductCategory {
  id: string;
  name: string;
  description: string;
  isPopular?: boolean;
  plans: Plan[];
}

interface Plan {
  id: string;
  name: string;
  description: string;
  premiumRange: string;
  monthlyPremium: number; // For sorting/filtering
  deductible?: string;
  features: string[];
  pros: string[];
  cons?: string[];
  isPopular?: boolean;
  isBestValue?: boolean;
  isNew?: boolean;
  rating: number | null; // 1-5 star rating, null for real quotes
  reviewCount: number | null;
  coverageLevel: 'Basic' | 'Standard' | 'Premium' | 'Comprehensive';
  suitableFor: string[];
}

interface CartItem {
  planId: string;
  categoryId: string;
  planName: string;
  monthlyPremium: number;
}

interface QuoteFormData {
  age: number | '';
  zipCode: string;
  gender: 'male' | 'female' | '';
  tobaccoUse: boolean | null;
  email?: string;
  firstName?: string;
}

interface MedigapQuote {
  id?: string
  monthly_premium: number
  carrier?: { name: string; full_name?: string; logo_url?: string | null } | null
  plan_name?: string
  plan?: string
  naic?: string
  company?: string
  company_base?: { name?: string; full_name?: string; logo_url?: string | null }
  effective_date?: string
  discounts?: Array<{ name: string; amount: number }>
  fees?: Array<{ name: string; amount: number }>
  rate?: { month?: number }
  plan_type?: string
  am_best_rating?: string
  rate_type?: string
}

const productCategories: ProductCategory[] = [
  {
    id: "medigap",
    name: "Medigap (Supplement)",
    description: "Fill the gaps in Original Medicare",
    plans: [
      {
        id: "plan-f",
        name: "Plan F",
        description: "Most comprehensive Medigap coverage",
        premiumRange: "$150-400/mo",
        monthlyPremium: 275,
        deductible: "None after Original Medicare",
        features: ["Part A deductible", "Part B deductible", "Coinsurance", "Foreign travel"],
        pros: ["First-dollar coverage", "No deductibles or copays", "Foreign travel emergency"],
        cons: ["Higher premiums", "Not available to new Medicare beneficiaries"],
        rating: 4.6,
        reviewCount: 8420,
        coverageLevel: 'Comprehensive',
        suitableFor: ["Maximum coverage", "Frequent healthcare users", "International travelers"]
      },
      {
        id: "plan-g",
        name: "Plan G",
        description: "Comprehensive coverage, popular choice",
        isPopular: true,
        isBestValue: true,
        premiumRange: "$120-350/mo",
        monthlyPremium: 235,
        deductible: "Part B deductible only",
        features: ["Part A deductible", "Coinsurance", "Foreign travel", "Excess charges"],
        pros: ["Excellent coverage", "Popular choice", "Covers excess charges", "Lower premium than Plan F"],
        cons: ["Must pay Part B deductible"],
        rating: 4.7,
        reviewCount: 15680,
        coverageLevel: 'Premium',
        suitableFor: ["Comprehensive coverage", "Cost-conscious buyers", "Most popular choice"]
      },
      {
        id: "plan-n",
        name: "Plan N",
        description: "Good coverage with lower premiums",
        premiumRange: "$80-250/mo",
        monthlyPremium: 165,
        deductible: "Part B deductible",
        features: ["Part A deductible", "Coinsurance", "Foreign travel", "Small copays"],
        pros: ["Lower premiums", "Good coverage", "Foreign travel emergency"],
        cons: ["Copays for doctor visits", "Doesn't cover excess charges"],
        rating: 4.4,
        reviewCount: 9240,
        coverageLevel: 'Standard',
        suitableFor: ["Budget-conscious", "Infrequent healthcare users", "Balanced coverage"]
      }
    ]
  },
  {
    id: "advantage",
    name: "Medicare Advantage",
    description: "All-in-one Medicare alternative",
    plans: [
      {
        id: "hmo",
        name: "HMO Plans",
        description: "Network-based care with lower costs",
        premiumRange: "$0-100/mo",
        monthlyPremium: 50,
        deductible: "Varies by plan",
        features: ["Network providers", "Referrals required", "Lower costs", "Often includes extras"],
        pros: ["Often $0 premium", "Extra benefits included", "Prescription coverage", "Lower out-of-pocket costs"],
        cons: ["Network restrictions", "Referrals required", "Provider changes"],
        rating: 4.1,
        reviewCount: 22100,
        coverageLevel: 'Standard',
        suitableFor: ["Network-based care", "Cost-conscious", "Extra benefits"]
      },
      {
        id: "ppo",
        name: "PPO Plans",
        description: "More flexibility with higher costs",
        premiumRange: "$20-150/mo",
        monthlyPremium: 85,
        deductible: "Varies by plan",
        features: ["Out-of-network coverage", "No referrals", "Higher costs", "More flexibility"],
        pros: ["Provider flexibility", "No referrals needed", "Out-of-network coverage"],
        cons: ["Higher premiums", "Higher out-of-pocket costs"],
        rating: 4.0,
        reviewCount: 18750,
        coverageLevel: 'Premium',
        suitableFor: ["Provider flexibility", "Specialist access", "Out-of-network needs"]
      },
      {
        id: "special-needs",
        name: "Special Needs Plans",
        description: "Specialized care for specific conditions",
        premiumRange: "$0-50/mo",
        monthlyPremium: 25,
        deductible: "Low or none",
        features: ["Condition-specific", "Specialized providers", "Tailored benefits", "Care coordination"],
        pros: ["Specialized care", "Coordinated benefits", "Often low cost"],
        cons: ["Limited to specific conditions", "Restricted eligibility"],
        rating: 4.3,
        reviewCount: 5680,
        coverageLevel: 'Standard',
        suitableFor: ["Chronic conditions", "Dual eligible", "Institutional care"]
      }
    ]
  },
  {
    id: "prescription",
    name: "Drug Plan",
    description: "Prescription drug coverage",
    plans: [
      {
        id: "basic",
        name: "Basic Coverage",
        description: "Standard prescription drug coverage",
        premiumRange: "$7-80/mo",
        monthlyPremium: 43.50,
        deductible: "$505 annually",
        features: ["Standard formulary", "Generic drugs", "Brand drugs", "Mail order"],
        pros: ["Lower premiums", "Basic coverage", "Generic focus"],
        cons: ["Higher deductible", "Limited formulary", "Coverage gap"],
        rating: 3.8,
        reviewCount: 12200,
        coverageLevel: 'Basic',
        suitableFor: ["Basic drug needs", "Generic medications", "Cost-conscious"]
      },
      {
        id: "enhanced",
        name: "Enhanced Coverage",
        description: "Additional benefits and lower costs",
        premiumRange: "$15-120/mo",
        monthlyPremium: 67.50,
        deductible: "$200 annually",
        features: ["Expanded formulary", "Lower deductibles", "Gap coverage", "Preferred brands"],
        pros: ["Lower deductible", "Gap coverage", "Wider formulary", "Brand name coverage"],
        cons: ["Higher premiums"],
        rating: 4.2,
        reviewCount: 8950,
        coverageLevel: 'Premium',
        suitableFor: ["Multiple medications", "Brand name drugs", "Gap coverage needs"]
      }
    ]
  },
  {
    id: "dental",
    name: "Dental",
    description: "Comprehensive dental coverage",
    plans: [
      {
        id: "basic-dental",
        name: "Basic Dental",
        description: "Essential dental coverage",
        premiumRange: "$25-45/mo",
        monthlyPremium: 35.00,
        deductible: "$50 annually",
        features: ["Preventive care", "Basic procedures", "Cleanings", "X-rays"],
        pros: ["Lower premium", "Preventive focus", "No waiting periods", "Network coverage"],
        cons: ["Limited major procedures", "Annual maximums", "Basic coverage only"],
        rating: 3.9,
        reviewCount: 3200,
        coverageLevel: 'Basic',
        suitableFor: ["Basic dental needs", "Preventive care", "Budget-conscious"]
      },
      {
        id: "comprehensive-dental",
        name: "Comprehensive Dental",
        description: "Full dental coverage including major procedures",
        premiumRange: "$45-75/mo",
        monthlyPremium: 60.00,
        deductible: "$50 annually",
        features: ["Preventive care", "Basic procedures", "Major procedures", "Orthodontics"],
        pros: ["Comprehensive coverage", "Major procedures included", "Orthodontics coverage", "Nationwide network"],
        cons: ["Higher premium", "Annual maximums", "Orthodontics limited"],
        rating: 4.3,
        reviewCount: 5430,
        coverageLevel: 'Comprehensive',
        suitableFor: ["Complete dental care", "Major procedures", "Family coverage"]
      }
    ]
  },
  {
    id: "hospital-indemnity",
    name: "Hospital Indemnity",
    description: "Cash benefits for hospital stays",
    plans: [
      {
        id: "basic-hospital",
        name: "Basic Hospital Indemnity",
        description: "Essential hospital cash benefits",
        premiumRange: "$15-30/mo",
        monthlyPremium: 22.50,
        deductible: "None",
        features: ["Daily cash benefits", "Hospital admission", "Surgery benefits", "Emergency room"],
        pros: ["Low premium", "Cash payments", "No deductible", "Quick claims"],
        cons: ["Lower benefit amounts", "Limited coverage", "Hospital only"],
        rating: 4.0,
        reviewCount: 2100,
        coverageLevel: 'Basic',
        suitableFor: ["Basic hospital protection", "Budget coverage", "Gap insurance"]
      },
      {
        id: "enhanced-hospital",
        name: "Enhanced Hospital Indemnity",
        description: "Comprehensive hospital cash benefits",
        premiumRange: "$30-50/mo",
        monthlyPremium: 40.00,
        deductible: "None",
        features: ["Higher daily benefits", "ICU benefits", "Surgery benefits", "Emergency room coverage"],
        pros: ["Higher benefit amounts", "ICU coverage", "Flexible use", "Covers gaps"],
        cons: ["Higher premium", "Hospital-specific", "Benefit caps"],
        rating: 4.3,
        reviewCount: 3210,
        coverageLevel: 'Premium',
        suitableFor: ["Hospital coverage gaps", "Extra income protection", "Peace of mind"]
      }
    ]
  },
  {
    id: "cancer",
    name: "Cancer Insurance",
    description: "Specialized cancer insurance coverage",
    plans: [
      {
        id: "basic-cancer",
        name: "Basic Cancer Coverage",
        description: "Essential cancer insurance protection",
        premiumRange: "$20-35/mo",
        monthlyPremium: 27.50,
        deductible: "None",
        features: ["Diagnosis benefit", "Treatment benefits", "Chemotherapy", "Radiation"],
        pros: ["Lower premium", "Lump sum benefits", "Treatment flexibility", "No deductible"],
        cons: ["Lower benefit amounts", "Cancer-specific only", "Waiting periods"],
        rating: 4.1,
        reviewCount: 1800,
        coverageLevel: 'Basic',
        suitableFor: ["Basic cancer protection", "Family history", "Budget-conscious"]
      },
      {
        id: "comprehensive-cancer",
        name: "Comprehensive Cancer Coverage",
        description: "Complete cancer insurance with enhanced benefits",
        premiumRange: "$35-60/mo",
        monthlyPremium: 47.50,
        deductible: "None",
        features: ["Higher diagnosis benefit", "Treatment benefits", "Transportation", "Lodging assistance"],
        pros: ["Higher benefits", "Transportation coverage", "Lodging assistance", "No network restrictions"],
        cons: ["Higher premium", "Cancer-specific only", "Pre-existing exclusions"],
        rating: 4.4,
        reviewCount: 2840,
        coverageLevel: 'Premium',
        suitableFor: ["Comprehensive cancer protection", "Family history", "Peace of mind"]
      }
    ]
  },
  {
    id: "final-expense",
    name: "Final Expense Life",
    description: "Life insurance for final expenses",
    plans: [
      {
        id: "basic-final-expense",
        name: "Basic Final Expense",
        description: "Essential final expense life insurance",
        premiumRange: "$30-75/mo",
        monthlyPremium: 52.50,
        deductible: "None",
        features: ["Guaranteed acceptance", "No medical exam", "Fixed premiums", "$10,000 coverage"],
        pros: ["Easy qualification", "Fixed rates", "Immediate coverage", "Affordable"],
        cons: ["Lower coverage amount", "Two-year waiting period", "Higher cost per dollar"],
        rating: 4.0,
        reviewCount: 2400,
        coverageLevel: 'Basic',
        suitableFor: ["Basic final expenses", "Easy qualification", "Burial costs"]
      },
      {
        id: "enhanced-final-expense",
        name: "Enhanced Final Expense",
        description: "Comprehensive final expense life insurance",
        premiumRange: "$75-150/mo",
        monthlyPremium: 112.50,
        deductible: "None",
        features: ["Guaranteed acceptance", "No medical exam", "Fixed premiums", "$25,000 coverage"],
        pros: ["Higher coverage", "Easy qualification", "Fixed rates", "Complete protection"],
        cons: ["Higher premium", "Coverage limits", "Two-year waiting period"],
        rating: 4.2,
        reviewCount: 4120,
        coverageLevel: 'Standard',
        suitableFor: ["Complete final expense planning", "Higher coverage needs", "Family protection"]
      }
    ]
  }
];

const chartConfig = {
  plans: {
    label: "Available Plans",
  },
  "Medicare Advantage": {
    label: "Medicare Advantage", 
    color: "hsl(var(--chart-2))",
  },
  Medigap: {
    label: "Medigap",
    color: "hsl(var(--chart-3))",
  },
  "Part D": {
    label: "Drug Plan",
    color: "hsl(var(--chart-4))",
  },
  "Dental": {
    label: "Dental",
    color: "hsl(var(--chart-5))",
  },
  "Hospital Indemnity": {
    label: "Hospital Indemnity",
    color: "hsl(var(--chart-1))",
  },
  "Cancer Insurance": {
    label: "Cancer Insurance",
    color: "hsl(var(--chart-2))",
  },
  "Final Expense Life": {
    label: "Final Expense Life",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

const popularityData = [
  { name: "Plan G", value: 35, fill: "hsl(var(--chart-1))" },
  { name: "Medicare Advantage", value: 28, fill: "hsl(var(--chart-2))" },
  { name: "Plan F", value: 20, fill: "hsl(var(--chart-3))" },
  { name: "Plan N", value: 17, fill: "hsl(var(--chart-4))" },
];

export default function MedicareShopContent() {
  // Initialize hooks
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Extract URL parameters immediately after hook initialization
  const stepParam = searchParams.get('step');
  const categoryParam = searchParams.get('category');

  // Storage keys - using localStorage for quotes since it persists better during navigation
  const QUOTE_FORM_DATA_KEY = 'medicare_quote_form_data';
  const QUOTE_FORM_COMPLETED_KEY = 'medicare_quote_form_completed';
  const REAL_QUOTES_KEY = 'medicare_real_quotes'; // Now using localStorage instead of sessionStorage

  // Storage helper functions - using localStorage for better persistence
  const loadFromStorage = (key: string, defaultValue: any) => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return defaultValue;
    }
  };

  const saveToStorage = (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    console.log('💾 SAVING to localStorage:', key, '=', typeof value === 'object' ? `[${Array.isArray(value) ? value.length : 'object'}]` : value);
    try {
      const dataString = JSON.stringify(value);
      
      // Check size and clean up if necessary
      if (dataString.length > 1000000) { // ~1MB limit
        console.warn('Data too large for localStorage, attempting cleanup');
        cleanupOldStorage();
      }
      
      localStorage.setItem(key, dataString);
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('LocalStorage quota exceeded, cleaning up old data');
        cleanupOldStorage();
        // Retry after cleanup
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch (retryError) {
          console.error('Failed to save even after cleanup:', retryError);
        }
      } else {
        console.error('Error saving to localStorage:', error);
      }
    }
  };

  // Clean up old localStorage data
  const cleanupOldStorage = () => {
    try {
      // Remove old plan details data (older than 1 hour)
      const planDetailsStr = localStorage.getItem('planDetailsData');
      if (planDetailsStr) {
        const planDetails = JSON.parse(planDetailsStr);
        if (planDetails.timestamp && Date.now() - planDetails.timestamp > 3600000) {
          localStorage.removeItem('planDetailsData');
          console.log('🧹 Cleaned up old plan details data');
        }
      }
      
      // Remove backup if main quotes exist
      const mainQuotes = localStorage.getItem(REAL_QUOTES_KEY);
      const backupQuotes = localStorage.getItem('medicare_quotes_backup');
      if (mainQuotes && backupQuotes) {
        localStorage.removeItem('medicare_quotes_backup');
        console.log('🧹 Removed redundant backup quotes');
      }
      
      // Clean up any other old Medicare-related data
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('medicare_') && !key.includes('real_quotes') && !key.includes('form_data') && !key.includes('form_completed')) {
          localStorage.removeItem(key);
          console.log('🧹 Cleaned up old Medicare data:', key);
        }
      });
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };

  // State management
  const [selectedCategory, setSelectedCategory] = useState("medigap");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [savedPlans, setSavedPlans] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'popularity'>('popularity');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedCoverageLevel, setSelectedCoverageLevel] = useState<string>('all');
  
  // Medigap plan filters for mock plans
  const [selectedMedigapPlans, setSelectedMedigapPlans] = useState<string[]>(['plan-f', 'plan-g', 'plan-n']);
  
  // Real quote plan filters for results page
  const [selectedQuotePlans, setSelectedQuotePlans] = useState<string[]>(['F', 'G', 'N']);

  // Discount toggle state
  const [applyDiscounts, setApplyDiscounts] = useState(false);

  // Payment mode state
  const [paymentMode, setPaymentMode] = useState<'monthly' | 'quarterly' | 'annually'>('monthly');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Quote form state with session storage - initialize with saved values
  const [quoteFormCompleted, setQuoteFormCompleted] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const [quoteFormData, setQuoteFormData] = useState<QuoteFormData>({
    age: '',
    zipCode: '',
    gender: '',
    tobaccoUse: null,
    email: '',
    firstName: ''
  });
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const [realQuotes, setRealQuotes] = useState<MedigapQuote[]>([]);
  const [quotesError, setQuotesError] = useState<string | null>(null);
  
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
    if (!isInitializing && realQuotes.length > 0 && !quoteFormCompleted) {
      console.log('🔧 Found quotes but form not marked as completed - fixing state');
      setQuoteFormCompleted(true);
      saveToStorage(QUOTE_FORM_COMPLETED_KEY, true);
    }
  }, [isInitializing, realQuotes.length, quoteFormCompleted]);
  
  // Ensure URL shows step=results when we have completed quotes
  useEffect(() => {
    if (!isInitializing && quoteFormCompleted && realQuotes.length > 0 && stepParam !== 'results') {
      console.log('🔧 Form completed with quotes but URL missing step=results - updating URL');
      const newUrl = `${pathname}?step=results${selectedCategory ? `&category=${selectedCategory}` : ''}`;
      window.history.replaceState(null, '', newUrl);
    }
  }, [isInitializing, quoteFormCompleted, realQuotes.length, stepParam, pathname, selectedCategory]);
  
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

  const handleQuoteFormSubmit = async () => {
    // Validate form
    if (!quoteFormData.age || !quoteFormData.zipCode || !quoteFormData.gender || quoteFormData.tobaccoUse === null) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoadingQuotes(true);
    setQuotesError(null);
    setRealQuotes([]);
    
    try {
      // Only get quotes for Medigap category
      if (selectedCategory === 'medigap') {
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
        
        if (response.error) {
          setQuotesError(response.error);
        } else if (response.quotes && Array.isArray(response.quotes)) {
          setRealQuotes(response.quotes);
          console.log(`Received ${response.quotes.length} Medigap quotes`);
          
          // Preload carrier logos for better user experience
          preloadCarrierLogos(response.quotes);
        }
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
    
    // Update URL to remove step parameter
    const newUrl = pathname;
    window.history.replaceState(null, '', newUrl);
  };

  // Debug function to check storage state
  const debugStorageState = () => {
    console.log('🐛 Debug Storage State:');
    console.log('LocalStorage - Form Data:', localStorage.getItem(QUOTE_FORM_DATA_KEY));
    console.log('LocalStorage - Form Completed:', localStorage.getItem(QUOTE_FORM_COMPLETED_KEY));
    console.log('LocalStorage - Real Quotes:', localStorage.getItem(REAL_QUOTES_KEY));
    console.log('LocalStorage - Plan Details:', localStorage.getItem('planDetailsData'));
    console.log('LocalStorage - Quotes Backup:', localStorage.getItem('medicare_quotes_backup'));
    console.log('State - quoteFormCompleted:', quoteFormCompleted);
    console.log('State - realQuotes length:', realQuotes.length);
    console.log('State - isInitializing:', isInitializing);
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
    if (selectedCategory === 'medigap' && realQuotes.length > 0) {
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
    }
    
    // Fallback to filtered mock plans
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
    const basePremium = quote.monthly_premium || (quote.rate?.month ? quote.rate.month / 100 : 0);
    
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
      return null; // Use regular display for mock data or single plan
    }

    // Check if multiple plans are selected
    const selectedPlanCount = selectedQuotePlans.length;
    if (selectedPlanCount <= 1) {
      return null; // Use regular display for single plan
    }

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
  };  const handlePlanClick = (categoryId: string, planId: string) => {
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
    }
  }, [searchParams, categoryParam]);

  const displayData = getPaginatedDisplay();
  const paginationInfo = getPaginationInfo();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Show loading spinner while initializing */}
      {isInitializing ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading your Medicare plans...</p>
          </div>
        </div>
      ) : (
        <>
      {/* Show Shopping Header Only When Form is Completed */}
      {quoteFormCompleted && (
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Shop Medicare Plans
              </h1>
              <p className="text-muted-foreground mt-1">
                Compare plans, read reviews, and find the perfect Medicare coverage for your needs
              </p>
            </div>
            
            {/* Cart Summary & User Info */}
            <div className="flex items-center gap-4">
              {cart.length > 0 && (
                <Badge variant="outline" className="px-3 py-1">
                  {cart.length} plan{cart.length !== 1 ? 's' : ''} selected
                </Badge>
              )}
              
              {/* User Info Display */}
              <div className="flex items-center gap-3 px-3 py-2 bg-muted/50 rounded-lg border">
                <div className="flex items-center gap-2">
                  <PersonIcon className="w-4 h-4 text-muted-foreground" />
                  <div className="text-sm">
                    <div className="font-medium">
                      {quoteFormData.firstName || 'Member'}, {quoteFormData.age}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {quoteFormData.zipCode} • {quoteFormData.gender === 'male' ? 'Male' : 'Female'}
                      {quoteFormData.tobaccoUse && ' • Tobacco'}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Reset form to allow editing and clear localStorage
                    clearStorageAndReset();
                  }}
                  className="p-1 h-auto"
                >
                  <ActivityLogIcon className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show content based on quote form completion */}
      {quoteFormCompleted ? (
        /* Show Plans When Form is Completed */
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
                {/* Categories */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">Plan Categories</h4>
                  <div className="space-y-1">
                    {productCategories.map((category) => {
                      const isActive = selectedCategory === category.id;
                      
                      // For Medigap, show count of real quotes when available, otherwise show default plan count
                      let planCount = category.plans.length;
                      
                      if (category.id === 'medigap' && realQuotes.length > 0) {
                        // Filter quotes based on current filters (same logic as the main display)
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
                        <button
                          key={category.id}
                          onClick={() => handleCategorySelect(category.id)}
                          className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{category.name}</span>
                              {category.isPopular && (
                                <StarFilledIcon className="w-3 h-3 text-yellow-500" />
                              )}
                            </div>
                            <span className="text-xs opacity-70">{planCount}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {/* Filter Controls */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground">Refine Results</h4>
                  
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
                  {selectedCategory === 'medigap' && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {realQuotes.length > 0 ? 'Filter Plans' : 'Medigap Plans'}
                      </label>
                      <div className="space-y-2">
                        {realQuotes.length > 0 ? (
                          // Real quotes: use selectedQuotePlans state
                          <>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="quote-plan-f"
                                checked={selectedQuotePlans.includes('F')}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedQuotePlans([...selectedQuotePlans, 'F']);
                                  } else {
                                    setSelectedQuotePlans(selectedQuotePlans.filter(plan => plan !== 'F'));
                                  }
                                }}
                              />
                              <label htmlFor="quote-plan-f" className="text-sm">Plan F</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="quote-plan-g"
                                checked={selectedQuotePlans.includes('G')}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedQuotePlans([...selectedQuotePlans, 'G']);
                                  } else {
                                    setSelectedQuotePlans(selectedQuotePlans.filter(plan => plan !== 'G'));
                                  }
                                }}
                              />
                              <label htmlFor="quote-plan-g" className="text-sm">Plan G</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="quote-plan-n"
                                checked={selectedQuotePlans.includes('N')}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedQuotePlans([...selectedQuotePlans, 'N']);
                                  } else {
                                    setSelectedQuotePlans(selectedQuotePlans.filter(plan => plan !== 'N'));
                                  }
                                }}
                              />
                              <label htmlFor="quote-plan-n" className="text-sm">Plan N</label>
                            </div>
                          </>
                        ) : (
                          // Mock data: use selectedMedigapPlans state
                          <>
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
                              />
                              <label htmlFor="plan-n" className="text-sm">Plan N</label>
                            </div>
                          </>
                        )}
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
                {currentCategory.isPopular && (
                  <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                    <StarFilledIcon className="w-3 h-3" />
                    Popular Category
                  </Badge>
                )}
              </div>

              {/* Product Grid - Handles both individual plans and grouped carriers */}
              <div className="grid gap-6">
                {displayData.type === 'grouped' ? (
                  // Grouped by carrier display
                  displayData.data.map((carrierGroup: any) => (
                    <Card key={carrierGroup.carrierId} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
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
                                  {carrierGroup.quotes.length} plan{carrierGroup.quotes.length !== 1 ? 's' : ''} available
                                </p>
                              </div>
                            </div>
                            {(() => {
                              // Check if any quote in this carrier has discounts
                              const hasDiscounts = carrierGroup.quotes.some((quote: any) => quote.discounts && quote.discounts.length > 0);
                              
                              if (hasDiscounts) {
                                return (
                                  <Badge variant="default" className="bg-blue-500 text-white text-xs">
                                    <TokensIcon className="w-3 h-3 mr-1" />
                                    Discounts Available
                                  </Badge>
                                );
                              } else {
                                return (
                                  <Badge variant="outline" className="text-xs">
                                    From ${Math.round(convertPriceByPaymentMode(calculateDiscountedPrice(carrierGroup.quotes[0])))}{getPaymentLabel()}
                                  </Badge>
                                );
                              }
                            })()}
                          </div>
                        </div>

                        {/* Plans from this carrier */}
                        <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 md:gap-6">
                          {(() => {
                            // Group quotes by plan type within this carrier
                            const planGroups = carrierGroup.quotes.reduce((groups: Record<string, any[]>, quote: any) => {
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
                                <div key={planType} className="flex flex-col p-6 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors h-full">
                                  {/* Plan Header - Price only */}
                                  <div className="flex items-baseline gap-1 mb-4">
                                    <div className="text-xl md:text-2xl lg:text-3xl font-bold text-primary">
                                      {hasMultipleVersions ? 
                                        `$${Math.round(convertPriceByPaymentMode(minPremium))}-$${Math.round(convertPriceByPaymentMode(maxPremium))}` : 
                                        `$${Math.round(convertPriceByPaymentMode(minPremium))}`
                                      }
                                    </div>
                                    <div className="text-sm text-muted-foreground">{getPaymentLabel()}</div>
                                  </div>
                                  
                                  {/* Plan Details */}
                                  <div className="flex-1 space-y-2">
                                    <h4 className="font-semibold text-lg">
                                      {bestQuote.plan_name || `Plan ${planType}`}
                                    </h4>
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
                                  
                                  {/* Action Button */}
                                  <div className="mt-4">
                                    <Button size="default" className="w-full" onClick={() => openPlanModal(carrierGroup)}>
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
                  ))
                ) : (
                  // Individual plan display (original format)
                  displayData.data.map((plan: any) => (
                    <Card key={plan.id} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                          {/* Plan Info */}
                          <div className="flex-1 space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                {/* Carrier Logo */}
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
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-lg font-bold">{plan.name}</h3>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleSavedPlan(plan.id)}
                                      className="shrink-0"
                                    >
                                    {savedPlans.includes(plan.id) ? (
                                      <BookmarkFilledIcon className="w-4 h-4 text-blue-500" />
                                    ) : (
                                      <BookmarkIcon className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                  {plan.isPopular && (
                                    <Badge className="bg-blue-500 text-white text-xs">
                                      <StarFilledIcon className="w-3 h-3 mr-1" />
                                      Popular
                                    </Badge>
                                  )}
                                  {plan.isBestValue && (
                                    <Badge className="bg-green-500 text-white text-xs">
                                      <LightningBoltIcon className="w-3 h-3 mr-1" />
                                      Best Value
                                    </Badge>
                                  )}
                                  {plan.isNew && (
                                    <Badge className="bg-purple-500 text-white text-xs">
                                      <RocketIcon className="w-3 h-3 mr-1" />
                                      New
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-muted-foreground text-sm mb-3">{plan.description}</p>
                                
                                {/* Rating - only show for mock plans with rating data */}
                                {plan.rating !== null && plan.reviewCount !== null && (
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="flex items-center gap-1">
                                      {[...Array(5)].map((_, i) => (
                                        <StarFilledIcon
                                          key={i}
                                          className={`w-4 h-4 ${
                                            i < Math.floor(plan.rating!) 
                                              ? 'text-yellow-500' 
                                              : 'text-gray-300'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-sm font-medium">{plan.rating}</span>
                                    <span className="text-xs text-muted-foreground">
                                      ({plan.reviewCount.toLocaleString()} reviews)
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Pricing */}
                              <div className="text-right">
                                <div className="text-xl font-bold text-primary">
                                  ${Math.round(convertPriceByPaymentMode(calculateDiscountedPrice(plan)))}{getPaymentLabel()}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Age {plan.age || 65}
                                </div>
                              </div>
                            </div>

                            {/* Features */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {plan.features && plan.features.slice(0, 4).map((feature: string, index: number) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <CheckIcon className="w-4 h-4 text-green-600 shrink-0" />
                                  <span className="text-muted-foreground">{feature}</span>
                                </div>
                              ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-2 pt-4 border-t">
                              <Button
                                variant="default"
                                onClick={() => addToCart(plan, currentCategory.id)}
                                className="flex-1 min-w-[120px]"
                              >
                                Add to Cart
                              </Button>
                              <Button variant="outline" className="flex-1 min-w-[120px]">
                                View Details
                              </Button>
                              <Button variant="outline" className="flex-1 min-w-[120px]">
                                Compare
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {displayData.data.length === 0 && (
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
        /* Simplified Landing Page with Instant Form */
        <div className="min-h-screen -mt-6 -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-4xl mx-auto">
              
              {/* Simple Hero Header */}
              <div className="text-center mb-12">
                <h1 className="text-5xl font-bold text-foreground mb-4">
                  Find Your Medicare Plan
                </h1>
                <p className="text-xl text-muted-foreground">
                  Enter your details to see personalized plans and pricing
                </p>
              </div>

              {/* Centered Form Card */}
              <Card className="bg-card backdrop-blur-sm shadow-xl border border-border max-w-2xl mx-auto">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {/* Form Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Age */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Your Age</label>
                        <Input
                          type="number"
                          placeholder="65"
                          min="60"
                          max="100"
                          className="text-lg py-3"
                          value={quoteFormData.age}
                          onChange={(e) => setQuoteFormData(prev => ({ 
                            ...prev, 
                            age: e.target.value ? parseInt(e.target.value) : '' 
                          }))}
                        />
                      </div>

                      {/* ZIP Code */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">ZIP Code</label>
                        <Input
                          type="text"
                          placeholder="12345"
                          maxLength={5}
                          className="text-lg py-3"
                          value={quoteFormData.zipCode}
                          onChange={(e) => setQuoteFormData(prev => ({ 
                            ...prev, 
                            zipCode: e.target.value.replace(/\D/g, '') 
                          }))}
                        />
                      </div>

                      {/* Gender */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Gender</label>
                        <Select 
                          value={quoteFormData.gender} 
                          onValueChange={(value) => setQuoteFormData(prev => ({ 
                            ...prev, 
                            gender: value as 'male' | 'female' 
                          }))}
                        >
                          <SelectTrigger className="text-lg py-3">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Tobacco Use */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Tobacco Use</label>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={quoteFormData.tobaccoUse === false ? "default" : "outline"}
                            size="default"
                            onClick={() => setQuoteFormData(prev => ({ ...prev, tobaccoUse: false }))}
                            className="flex-1"
                          >
                            No
                          </Button>
                          <Button
                            type="button"
                            variant={quoteFormData.tobaccoUse === true ? "default" : "outline"}
                            size="default"
                            onClick={() => setQuoteFormData(prev => ({ ...prev, tobaccoUse: true }))}
                            className="flex-1"
                          >
                            Yes
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      <Button
                        onClick={handleQuoteFormSubmit}
                        className="w-full gap-2 text-lg font-semibold py-4"
                        disabled={!isQuoteFormValid() || isLoadingQuotes}
                        size="lg"
                      >
                        {isLoadingQuotes ? (
                          <>
                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <RocketIcon className="w-5 h-5" />
                            Show My Plans
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Simple Trust Line */}
                    <p className="text-center text-sm text-muted-foreground">
                      100% Free • No Obligation • Instant Results
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      <MedicareDisclaimer />
      </>
      )}
    </div>
  );
}
