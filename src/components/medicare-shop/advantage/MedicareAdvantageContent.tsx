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
import MedicareDisclaimer from "@/components/medicare-disclaimer";
import MedicareQuoteFlow from "@/components/MedicareQuoteFlow";
import { getMedicareAdvantageQuotes } from "@/lib/actions/advantage-quotes";
import { quoteService } from "@/lib/services/quote-service";
import { carrierService } from "@/lib/services/carrier-service-simple";
import { getCarrierByNaicCode, getProperLogoUrl } from "@/lib/naic-carriers";
import Image from "next/image";
import { CheckIcon, ReloadIcon } from "@radix-ui/react-icons";
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
  networkSize?: string;
  extraBenefits?: string[];
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

// Medicare Advantage specific product categories and plans
const productCategories: ProductCategory[] = [
  {
    id: "hmo",
    name: "HMO Plans",
    description: "Health Maintenance Organization plans with network providers",
    isPopular: true,
    plans: [
      {
        id: "hmo-basic",
        name: "HMO Essential",
        description: "Basic HMO coverage with $0 premium",
        premiumRange: "$0/mo",
        monthlyPremium: 0,
        deductible: "$0 for most services",
        features: ["Network providers only", "Primary care physician required", "Referrals for specialists", "Prescription drug coverage"],
        pros: ["$0 monthly premium", "Low copays for primary care", "Prescription coverage included", "Preventive care covered"],
        cons: ["Must stay in network", "Need referrals for specialists", "Limited to service area"],
        isPopular: true,
        rating: 4.2,
        reviewCount: 18500,
        coverageLevel: 'Basic',
        suitableFor: ["Budget-conscious", "Comfortable with network restrictions", "Primary care focused"],
        networkSize: "Large regional network",
        extraBenefits: ["Prescription drugs", "Preventive care", "Wellness programs"]
      },
      {
        id: "hmo-enhanced",
        name: "HMO Plus",
        description: "Enhanced HMO with extra benefits",
        premiumRange: "$25-45/mo",
        monthlyPremium: 35,
        deductible: "$0 for most services",
        features: ["Network providers", "PCP coordination", "Extra benefits included", "Lower out-of-pocket maximum"],
        pros: ["Low premium", "Dental and vision included", "Transportation benefits", "Over-the-counter allowance"],
        cons: ["Network restrictions", "Referral requirements", "Geographic limitations"],
        rating: 4.5,
        reviewCount: 12400,
        coverageLevel: 'Standard',
        suitableFor: ["Want extra benefits", "Network-based care", "Additional services"],
        networkSize: "Large regional network",
        extraBenefits: ["Dental", "Vision", "Transportation", "OTC allowance", "Gym membership"]
      }
    ]
  },
  {
    id: "ppo",
    name: "PPO Plans",
    description: "Preferred Provider Organization plans with more flexibility",
    plans: [
      {
        id: "ppo-standard",
        name: "PPO Freedom",
        description: "Flexible PPO with in and out-of-network benefits",
        premiumRange: "$45-85/mo",
        monthlyPremium: 65,
        deductible: "$250 in-network, $500 out-of-network",
        features: ["In and out-of-network coverage", "No referrals needed", "National network", "Prescription coverage"],
        pros: ["Provider flexibility", "No referrals required", "Out-of-network coverage", "Travel coverage"],
        cons: ["Higher premiums", "Higher out-of-network costs", "Deductibles apply"],
        rating: 4.3,
        reviewCount: 9800,
        coverageLevel: 'Standard',
        suitableFor: ["Want provider choice", "Travel frequently", "Specialist access"],
        networkSize: "Large national network",
        extraBenefits: ["Prescription drugs", "Emergency coverage", "Urgent care"]
      },
      {
        id: "ppo-premium",
        name: "PPO Elite",
        description: "Premium PPO with comprehensive benefits",
        premiumRange: "$85-150/mo",
        monthlyPremium: 118,
        deductible: "$150 in-network, $300 out-of-network",
        features: ["Comprehensive coverage", "Low cost-sharing", "Extra benefits", "Nationwide access"],
        pros: ["Low deductibles", "Comprehensive benefits", "Dental and vision", "Worldwide emergency"],
        cons: ["Higher monthly premium", "Still have network tiers"],
        isBestValue: true,
        rating: 4.7,
        reviewCount: 7200,
        coverageLevel: 'Premium',
        suitableFor: ["Want comprehensive coverage", "Low out-of-pocket costs", "Premium benefits"],
        networkSize: "Large national network",
        extraBenefits: ["Dental", "Vision", "Hearing aids", "Transportation", "Meal delivery"]
      }
    ]
  },
  {
    id: "special-needs",
    name: "Special Needs Plans",
    description: "Specialized plans for specific conditions or circumstances",
    plans: [
      {
        id: "snp-diabetes",
        name: "Diabetes Care Plan",
        description: "Specialized plan for diabetes management",
        premiumRange: "$0-35/mo",
        monthlyPremium: 15,
        deductible: "$0",
        features: ["Diabetes-focused care", "Specialized providers", "Care coordination", "Tailored benefits"],
        pros: ["Disease-specific focus", "Coordinated care team", "Specialized benefits", "Low costs"],
        cons: ["Must qualify", "Limited to condition", "Fewer plan options"],
        rating: 4.6,
        reviewCount: 3400,
        coverageLevel: 'Comprehensive',
        suitableFor: ["Diabetes management", "Coordinated care", "Specialized needs"],
        networkSize: "Specialized network",
        extraBenefits: ["Diabetes supplies", "Nutrition counseling", "Care coordination", "Foot care"]
      },
      {
        id: "snp-chronic",
        name: "Chronic Care Plan",
        description: "For multiple chronic conditions",
        premiumRange: "$0-25/mo",
        monthlyPremium: 10,
        deductible: "$0",
        features: ["Multiple condition focus", "Care team", "Integrated services", "Medication management"],
        pros: ["Comprehensive chronic care", "Integrated approach", "Care coordination", "Medication focus"],
        cons: ["Must qualify with conditions", "Limited availability"],
        rating: 4.4,
        reviewCount: 2100,
        coverageLevel: 'Comprehensive',
        suitableFor: ["Multiple chronic conditions", "Complex care needs", "Medication management"],
        networkSize: "Specialized network",
        extraBenefits: ["Care coordination", "Medication management", "Home health", "Medical equipment"]
      }
    ]
  }
];

const chartConfig = {
  hmo: {
    label: "HMO Plans",
    color: "hsl(var(--chart-1))",
  },
  ppo: {
    label: "PPO Plans", 
    color: "hsl(var(--chart-2))",
  },
  snp: {
    label: "Special Needs",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

const popularityData = [
  { name: "HMO Plans", value: 45, fill: "hsl(var(--chart-1))" },
  { name: "PPO Plans", value: 35, fill: "hsl(var(--chart-2))" },
  { name: "Special Needs", value: 20, fill: "hsl(var(--chart-3))" },
];

export default function MedicareAdvantageContent() {
  // Initialize hooks
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Extract URL parameters immediately after hook initialization
  const stepParam = searchParams.get('step');
  const categoryParam = searchParams.get('category');

  // Storage keys - using localStorage for quotes since it persists better during navigation
  const QUOTE_FORM_DATA_KEY = 'medicare_advantage_quote_form_data';
  const QUOTE_FORM_COMPLETED_KEY = 'medicare_advantage_quote_form_completed';
  const REAL_QUOTES_KEY = 'medicare_advantage_real_quotes';
  const FILTER_STATE_KEY = 'medicare_advantage_filter_state';

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
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  // Initialize state
  const [quoteFormData, setQuoteFormData] = useState<QuoteFormData | null>(() => 
    loadFromStorage(QUOTE_FORM_DATA_KEY, null)
  );
  const [quoteFormCompleted, setQuoteFormCompleted] = useState<boolean>(() =>
    loadFromStorage(QUOTE_FORM_COMPLETED_KEY, false)
  );
  const [realQuotes, setRealQuotes] = useState<any[]>(() => 
    loadFromStorage(REAL_QUOTES_KEY, [])
  );
  const [currentStep, setCurrentStep] = useState<'welcome' | 'quote-form' | 'shopping'>(() => {
    // Check for real quotes first
    const savedQuotes = loadFromStorage(REAL_QUOTES_KEY, []);
    const hasRealQuotes = savedQuotes && savedQuotes.length > 0;
    
    if (hasRealQuotes) {
      return 'shopping';
    }
    
    // Check for completed quote form
    const formCompleted = loadFromStorage(QUOTE_FORM_COMPLETED_KEY, false);
    if (formCompleted) {
      return 'shopping';
    }
    
    // Check URL parameter
    if (stepParam === 'quotes' || stepParam === 'shopping') {
      return 'shopping';
    } else if (stepParam === 'form') {
      return 'quote-form';
    }
    
    return 'welcome';
  });

  // Shopping state
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'hmo');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'popularity'>('price');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [showOnlyPopular, setShowOnlyPopular] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Load filter state from storage
  useEffect(() => {
    const savedFilters = loadFromStorage(FILTER_STATE_KEY, {});
    if (savedFilters.sortBy) setSortBy(savedFilters.sortBy);
    if (savedFilters.searchQuery) setSearchQuery(savedFilters.searchQuery);
    if (savedFilters.priceRange) setPriceRange(savedFilters.priceRange);
    if (savedFilters.selectedFeatures) setSelectedFeatures(savedFilters.selectedFeatures);
    if (savedFilters.showOnlyPopular !== undefined) setShowOnlyPopular(savedFilters.showOnlyPopular);
  }, []);

  // Save filter state to storage
  useEffect(() => {
    const filterState = {
      sortBy,
      searchQuery,
      priceRange,
      selectedFeatures,
      showOnlyPopular
    };
    saveToStorage(FILTER_STATE_KEY, filterState);
  }, [sortBy, searchQuery, priceRange, selectedFeatures, showOnlyPopular]);

  // Persist state changes
  useEffect(() => {
    saveToStorage(QUOTE_FORM_DATA_KEY, quoteFormData);
  }, [quoteFormData]);

  useEffect(() => {
    saveToStorage(QUOTE_FORM_COMPLETED_KEY, quoteFormCompleted);
  }, [quoteFormCompleted]);

  useEffect(() => {
    saveToStorage(REAL_QUOTES_KEY, realQuotes);
  }, [realQuotes]);

  // URL management - update URL when step changes
  useEffect(() => {
    const currentParams = new URLSearchParams(searchParams);
    
    if (currentStep === 'shopping') {
      currentParams.set('step', 'shopping');
      if (selectedCategory) {
        currentParams.set('category', selectedCategory);
      }
    } else if (currentStep === 'quote-form') {
      currentParams.set('step', 'form');
      currentParams.delete('category');
    } else {
      currentParams.delete('step');
      currentParams.delete('category');
    }
    
    const newUrl = `${pathname}?${currentParams.toString()}`;
    router.replace(newUrl, { scroll: false });
  }, [currentStep, selectedCategory, pathname, router, searchParams]);

  // Handle quote form completion
  const handleQuoteFormComplete = async (data: QuoteFormData) => {
    console.log('Quote form completed with data:', data);
    
    setQuoteFormData(data);
    setQuoteFormCompleted(true);
    setIsLoadingQuotes(true);
    
    try {
      // Fetch real Medicare Advantage quotes
      const result = await getMedicareAdvantageQuotes({
        zipCode: data.zipCode
      });
      
      console.log('Received Medicare Advantage quotes:', result);
      
      if (result.quotes && result.quotes.length > 0) {
        setRealQuotes(result.quotes);
        console.log('Real quotes saved:', result.quotes);
      } else if (result.error) {
        console.error('Quote API error:', result.error);
        setRealQuotes([]);
      } else {
        console.log('No quotes received, using sample data');
        setRealQuotes([]);
      }
    } catch (error) {
      console.error('Error fetching Medicare Advantage quotes:', error);
      setRealQuotes([]);
    } finally {
      setIsLoadingQuotes(false);
      setCurrentStep('shopping');
    }
  };

  // Get all available features for filtering
  const getAllFeatures = () => {
    const features = new Set<string>();
    productCategories.forEach(category => {
      category.plans.forEach(plan => {
        plan.features.forEach(feature => features.add(feature));
        if (plan.extraBenefits) {
          plan.extraBenefits.forEach(benefit => features.add(benefit));
        }
      });
    });
    return Array.from(features).sort();
  };

  // Filter and sort plans
  const getFilteredPlans = () => {
    const category = productCategories.find(cat => cat.id === selectedCategory);
    if (!category) return [];

    let plans = [...category.plans];

    // Apply search filter
    if (searchQuery) {
      plans = plans.filter(plan => 
        plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.features.some(feature => feature.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply price filter
    plans = plans.filter(plan => 
      plan.monthlyPremium >= priceRange[0] && plan.monthlyPremium <= priceRange[1]
    );

    // Apply feature filter
    if (selectedFeatures.length > 0) {
      plans = plans.filter(plan => 
        selectedFeatures.some(feature => 
          plan.features.includes(feature) || 
          (plan.extraBenefits && plan.extraBenefits.includes(feature))
        )
      );
    }

    // Apply popularity filter
    if (showOnlyPopular) {
      plans = plans.filter(plan => plan.isPopular || plan.isBestValue);
    }

    // Apply sorting
    plans.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.monthlyPremium - b.monthlyPremium;
        case 'rating':
          if (a.rating === null && b.rating === null) return 0;
          if (a.rating === null) return 1;
          if (b.rating === null) return -1;
          return b.rating - a.rating;
        case 'popularity':
          if (a.isPopular && !b.isPopular) return -1;
          if (!a.isPopular && b.isPopular) return 1;
          if (a.isBestValue && !b.isBestValue) return -1;
          if (!a.isBestValue && b.isBestValue) return 1;
          return a.monthlyPremium - b.monthlyPremium;
        default:
          return 0;
      }
    });

    return plans;
  };

  // Add to cart
  const addToCart = (plan: Plan) => {
    const category = productCategories.find(cat => cat.id === selectedCategory);
    if (!category) return;

    const cartItem: CartItem = {
      planId: plan.id,
      categoryId: selectedCategory,
      planName: plan.name,
      monthlyPremium: plan.monthlyPremium
    };

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.planId === plan.id && item.categoryId === selectedCategory);
      if (existingIndex >= 0) {
        return prev; // Already in cart
      }
      return [...prev, cartItem];
    });
  };

  // Remove from cart
  const removeFromCart = (planId: string, categoryId: string) => {
    setCart(prev => prev.filter(item => !(item.planId === planId && item.categoryId === categoryId)));
  };

  // Check if plan is in cart
  const isInCart = (planId: string, categoryId: string) => {
    return cart.some(item => item.planId === planId && item.categoryId === categoryId);
  };

  // Start over function
  const startOver = () => {
    // Clear all stored data
    localStorage.removeItem(QUOTE_FORM_DATA_KEY);
    localStorage.removeItem(QUOTE_FORM_COMPLETED_KEY);
    localStorage.removeItem(REAL_QUOTES_KEY);
    localStorage.removeItem(FILTER_STATE_KEY);
    
    // Reset state
    setQuoteFormData(null);
    setQuoteFormCompleted(false);
    setRealQuotes([]);
    setCurrentStep('welcome');
    setCart([]);
    
    // Reset URL
    router.replace(pathname, { scroll: false });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate total cart value
  const cartTotal = cart.reduce((sum, item) => sum + item.monthlyPremium, 0);

  // Welcome Step Component
  const WelcomeStep = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
            <RocketIcon className="w-4 h-4 mr-2" />
            Medicare Advantage Plans 2025
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Find Your Perfect
            <span className="text-blue-600 block">Medicare Advantage Plan</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Compare HMO, PPO, and Special Needs plans from top-rated carriers. Get comprehensive coverage 
            with extra benefits like dental, vision, and prescription drugs - often at $0 premium.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              onClick={() => setCurrentStep('quote-form')}
              className="px-8 py-4 text-lg"
            >
              <CheckIcon className="w-5 h-5 mr-2" />
              Get My Free Quotes
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setCurrentStep('shopping')}
              className="px-8 py-4 text-lg"
            >
              <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
              Browse Plans
            </Button>
          </div>

          {/* Key Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeartIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">All-in-One Coverage</h3>
              <p className="text-gray-600">Medicare Parts A, B, and usually D combined with extra benefits</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TokensIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Extra Benefits</h3>
              <p className="text-gray-600">Dental, vision, hearing aids, and wellness programs often included</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LightningBoltIcon className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Lower Costs</h3>
              <p className="text-gray-600">Many plans have $0 premium with reduced out-of-pocket costs</p>
            </div>
          </div>
        </div>

        {/* Plan Type Overview */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Choose Your Plan Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {productCategories.map((category) => (
              <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer group" 
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setCurrentStep('shopping');
                    }}>
                <CardHeader className="text-center">
                  {category.isPopular && (
                    <Badge className="mb-2 mx-auto w-fit">Most Popular</Badge>
                  )}
                  <CardTitle className="group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <strong>Plans Available:</strong> {category.plans.length}
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Premium Range:</strong> {category.plans[0]?.premiumRange}
                    </div>
                    <Button className="w-full" variant="outline">
                      View Plans
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-blue-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-center mb-8">Medicare Advantage Popularity</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[300px]"
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
                    innerRadius={60}
                    strokeWidth={5}
                  />
                </PieChart>
              </ChartContainer>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Why Choose Medicare Advantage?</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                    Often $0 monthly premium
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                    Extra benefits included
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                    Annual out-of-pocket maximum
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                    Prescription drug coverage
                  </li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg">
                <h4 className="font-semibold mb-2">Did you know?</h4>
                <p className="text-gray-600 text-sm">
                  Over 26 million Americans choose Medicare Advantage for its convenience and 
                  comprehensive benefits. Most plans include services not covered by Original Medicare.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Quote Form Step Component
  const QuoteFormStep = () => (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Get Your Medicare Advantage Quotes
            </h1>
            <p className="text-gray-600">
              Tell us a bit about yourself to see personalized Medicare Advantage plan options in your area.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <MedicareQuoteFlow onComplete={handleQuoteFormComplete} />
          </div>
          
          <div className="text-center mt-6">
            <Button variant="outline" onClick={() => setCurrentStep('welcome')}>
              ← Back to Overview
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Shopping Step Component
  const ShoppingStep = () => {
    const filteredPlans = getFilteredPlans();
    const category = productCategories.find(cat => cat.id === selectedCategory);
    
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="container mx-auto py-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Medicare Advantage Plans</h1>
                {quoteFormData && (
                  <p className="text-gray-600 mt-1">
                    Plans for {quoteFormData.gender === 'male' ? 'Male' : 'Female'}, Age {quoteFormData.age}, 
                    ZIP {quoteFormData.zipCode}
                  </p>
                )}
              </div>
              
              <div className="flex flex-wrap gap-3">
                {quoteFormData && (
                  <Button variant="outline" size="sm" onClick={() => setCurrentStep('quote-form')}>
                    <FileTextIcon className="w-4 h-4 mr-2" />
                    Edit Info
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={startOver}>
                  <TriangleUpIcon className="w-4 h-4 mr-2" />
                  Start Over
                </Button>
                {cart.length > 0 && (
                  <Button size="sm">
                    <BookmarkIcon className="w-4 h-4 mr-2" />
                    Cart ({cart.length})
                  </Button>
                )}
              </div>
            </div>

            {/* Real quotes notification */}
            {realQuotes.length > 0 && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircledIcon className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm text-green-800">
                    Showing {realQuotes.length} real quotes from carriers in your area
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Plan Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Plan Types</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {productCategories.map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        {category.name}
                        {category.isPopular && (
                          <Badge variant="secondary" className="ml-auto">Popular</Badge>
                        )}
                      </Button>
                    ))}
                  </CardContent>
                </Card>

                {/* Filters */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <MixerHorizontalIcon className="w-4 h-4 mr-2" />
                      Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Search */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Search Plans</label>
                      <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search by name, features..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Sort */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Sort By</label>
                      <Select value={sortBy} onValueChange={(value: 'price' | 'rating' | 'popularity') => setSortBy(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="price">Price (Low to High)</SelectItem>
                          <SelectItem value="rating">Rating (High to Low)</SelectItem>
                          <SelectItem value="popularity">Popularity</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Monthly Premium: {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}
                      </label>
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={200}
                        step={5}
                        className="mt-2"
                      />
                    </div>

                    {/* Popular Only */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="popular"
                        checked={showOnlyPopular}
                        onCheckedChange={(checked) => setShowOnlyPopular(checked === true)}
                      />
                      <label htmlFor="popular" className="text-sm">Show popular plans only</label>
                    </div>

                    {/* Advanced Filters Toggle */}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    >
                      {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
                    </Button>

                    {/* Advanced Filters */}
                    {showAdvancedFilters && (
                      <div className="space-y-4 border-t pt-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Features & Benefits</label>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {getAllFeatures().map((feature) => (
                              <div key={feature} className="flex items-center space-x-2">
                                <Checkbox
                                  id={feature}
                                  checked={selectedFeatures.includes(feature)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedFeatures(prev => [...prev, feature]);
                                    } else {
                                      setSelectedFeatures(prev => prev.filter(f => f !== feature));
                                    }
                                  }}
                                />
                                <label htmlFor={feature} className="text-xs">{feature}</label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">
                    {category?.name} ({filteredPlans.length} plan{filteredPlans.length !== 1 ? 's' : ''})
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">{category?.description}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'card' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('card')}
                  >
                    <SizeIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <ActivityLogIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Plans Grid/List */}
              {isLoadingQuotes ? (
                <div className="text-center py-12">
                  <ReloadIcon className="w-8 h-8 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading your Medicare Advantage quotes...</p>
                </div>
              ) : filteredPlans.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No plans match your current filters.</p>
                  <Button variant="outline" onClick={() => {
                    setSearchQuery('');
                    setPriceRange([0, 200]);
                    setSelectedFeatures([]);
                    setShowOnlyPopular(false);
                  }}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className={viewMode === 'card' ? 'grid grid-cols-1 xl:grid-cols-2 gap-6' : 'space-y-4'}>
                  {filteredPlans.map((plan) => {
                    const inCart = isInCart(plan.id, selectedCategory);
                    
                    return (
                      <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CardTitle className="text-lg">{plan.name}</CardTitle>
                                {plan.isPopular && <Badge variant="secondary">Popular</Badge>}
                                {plan.isBestValue && <Badge className="bg-green-100 text-green-800">Best Value</Badge>}
                                {plan.isNew && <Badge className="bg-blue-100 text-blue-800">New</Badge>}
                              </div>
                              <CardDescription className="text-sm">{plan.description}</CardDescription>
                              
                              {/* Coverage Level & Network */}
                              <div className="flex items-center gap-4 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {plan.coverageLevel}
                                </Badge>
                                {plan.networkSize && (
                                  <span className="text-xs text-gray-500">{plan.networkSize}</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right ml-4">
                              <div className="text-2xl font-bold text-green-600">
                                {plan.monthlyPremium === 0 ? 'FREE' : formatCurrency(plan.monthlyPremium)}
                              </div>
                              <div className="text-sm text-gray-500">per month</div>
                              {plan.rating && (
                                <div className="flex items-center mt-1">
                                  <StarFilledIcon className="w-4 h-4 text-yellow-400 mr-1" />
                                  <span className="text-sm font-medium">{plan.rating}</span>
                                  <span className="text-xs text-gray-500 ml-1">
                                    ({plan.reviewCount?.toLocaleString()})
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          {/* Key Features */}
                          <div>
                            <h4 className="font-medium text-sm mb-2">Key Features</h4>
                            <div className="grid grid-cols-1 gap-1">
                              {plan.features.slice(0, 4).map((feature, index) => (
                                <div key={index} className="flex items-center text-sm text-gray-600">
                                  <CheckIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                  {feature}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Extra Benefits */}
                          {plan.extraBenefits && plan.extraBenefits.length > 0 && (
                            <div>
                              <h4 className="font-medium text-sm mb-2">Extra Benefits</h4>
                              <div className="flex flex-wrap gap-1">
                                {plan.extraBenefits.slice(0, 3).map((benefit, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {benefit}
                                  </Badge>
                                ))}
                                {plan.extraBenefits.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{plan.extraBenefits.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Deductible */}
                          {plan.deductible && (
                            <div className="text-sm">
                              <span className="font-medium">Deductible:</span> {plan.deductible}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-3 pt-2">
                            <Button
                              className="flex-1"
                              onClick={() => {
                                setSelectedPlan(plan);
                                setShowPlanModal(true);
                              }}
                            >
                              View Details
                            </Button>
                            <Button
                              variant={inCart ? "secondary" : "outline"}
                              onClick={() => inCart ? removeFromCart(plan.id, selectedCategory) : addToCart(plan)}
                            >
                              {inCart ? (
                                <>
                                  <BookmarkFilledIcon className="w-4 h-4 mr-2" />
                                  Saved
                                </>
                              ) : (
                                <>
                                  <BookmarkIcon className="w-4 h-4 mr-2" />
                                  Save
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Plan Details Modal
  const PlanDetailsModal = () => {
    if (!selectedPlan) return null;

    return (
      <Dialog open={showPlanModal} onOpenChange={setShowPlanModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedPlan.name}
              {selectedPlan.isPopular && <Badge variant="secondary">Popular</Badge>}
              {selectedPlan.isBestValue && <Badge className="bg-green-100 text-green-800">Best Value</Badge>}
            </DialogTitle>
            <DialogDescription>{selectedPlan.description}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Cost Summary */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-4">Cost Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Monthly Premium</span>
                  <div className="text-2xl font-bold text-green-600">
                    {selectedPlan.monthlyPremium === 0 ? 'FREE' : formatCurrency(selectedPlan.monthlyPremium)}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Deductible</span>
                  <div className="text-lg font-medium">{selectedPlan.deductible || 'Varies'}</div>
                </div>
              </div>
            </div>

            {/* All Features */}
            <div>
              <h3 className="font-semibold mb-4">All Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {selectedPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <CheckIcon className="w-4 h-4 text-green-500 mr-2" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Extra Benefits */}
            {selectedPlan.extraBenefits && selectedPlan.extraBenefits.length > 0 && (
              <div>
                <h3 className="font-semibold mb-4">Extra Benefits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedPlan.extraBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <TokensIcon className="w-4 h-4 text-blue-500 mr-2" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pros and Cons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-4 text-green-700">Pros</h3>
                <ul className="space-y-2">
                  {selectedPlan.pros.map((pro, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <CheckCircledIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              
              {selectedPlan.cons && selectedPlan.cons.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4 text-red-700">Considerations</h3>
                  <ul className="space-y-2">
                    {selectedPlan.cons.map((con, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <InfoCircledIcon className="w-4 h-4 text-amber-500 mr-2 mt-0.5" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Suitable For */}
            <div>
              <h3 className="font-semibold mb-4">This plan is suitable for:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedPlan.suitableFor.map((item, index) => (
                  <Badge key={index} variant="outline">{item}</Badge>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                className="flex-1"
                onClick={() => {
                  addToCart(selectedPlan);
                  setShowPlanModal(false);
                }}
              >
                <BookmarkIcon className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              <Button variant="outline" onClick={() => setShowPlanModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Main render logic
  return (
    <div className="min-h-screen">
      {currentStep === 'welcome' && <WelcomeStep />}
      {currentStep === 'quote-form' && <QuoteFormStep />}
      {currentStep === 'shopping' && <ShoppingStep />}
      
      <PlanDetailsModal />
      <MedicareDisclaimer />
    </div>
  );
}
