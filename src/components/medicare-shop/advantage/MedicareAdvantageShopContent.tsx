"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import GenericQuoteLoading from "@/components/GenericQuoteLoading";
import MedicareAdvantageSidebar, { MedicareAdvantageFilters } from "./MedicareAdvantageSidebar";
import { getMedicareAdvantageQuotes } from "@/lib/actions/advantage-quotes";
import MedicareDisclaimer from "@/components/medicare-disclaimer";
import { 
  Star, 
  DollarSign, 
  MapPin, 
  Phone, 
  Globe, 
  Pill, 
  Heart, 
  Eye, 
  Stethoscope,
  Ambulance,
  Building2,
  Shield,
  Activity,
  Zap,
  Info,
  Check,
  ChevronDown,
  ChevronUp,
  GitCompare,
  X,
  RotateCcw
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Medicare Advantage Quote Interface
interface MedicareAdvantageQuote {
  key: string;
  plan_name: string;
  organization_name: string;
  plan_type: string;
  county: string;
  state: string;
  overall_star_rating: number;
  part_c_rate: number;
  part_d_rate: number;
  month_rate: number;
  in_network_moop: string;
  benefits: Array<{
    benefit_type: string;
    full_description: string;
    summary_description?: {
      in_network?: string;
      out_network?: string;
    };
    pd_view_display: boolean;
  }>;
  part_d_subsides?: {
    "25": number;
    "50": number;
    "75": number;
    "100": number;
  };
  contextual_data?: {
    has_eapp: boolean;
    carrier_resources: {
      "Formulary Website"?: string;
      "Pharmacy Website"?: string;
      "Physician Lookup"?: string;
    };
  };
  company_base?: {
    name: string;
    name_full: string;
    naic?: string;
  };
  drug_benefit_type?: string;
  drug_benefit_type_detail?: string;
  zero_premium_with_full_low_income_subsidy?: boolean;
  additional_coverage_offered_in_the_gap?: boolean;
  additional_drug_coverage_offered_in_the_gap?: boolean;
  contract_year: string;
  effective_date: string;
}

// Helper function to format currency from cents
const formatCurrency = (cents: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
};

// Helper function to render star rating
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
      <span className="text-sm text-gray-600 ml-1">{rating}/5</span>
    </div>
  );
};

// Benefit category icons
const getBenefitIcon = (benefitType: string) => {
  const type = benefitType.toLowerCase();
  if (type.includes("doctor") || type.includes("primary")) return <Stethoscope className="h-4 w-4" />;
  if (type.includes("prescription") || type.includes("drug")) return <Pill className="h-4 w-4" />;
  if (type.includes("dental")) return <Heart className="h-4 w-4" />;
  if (type.includes("vision") || type.includes("eye")) return <Eye className="h-4 w-4" />;
  if (type.includes("hospital") || type.includes("inpatient")) return <Building2 className="h-4 w-4" />;
  if (type.includes("ambulance") || type.includes("emergency")) return <Ambulance className="h-4 w-4" />;
  if (type.includes("mental") || type.includes("therapy")) return <Activity className="h-4 w-4" />;
  if (type.includes("wellness") || type.includes("preventive")) return <Shield className="h-4 w-4" />;
  return <Info className="h-4 w-4" />;
};

// Main plan card component
const PlanCard: React.FC<{ 
  plan: MedicareAdvantageQuote; 
  onCompare: (plan: MedicareAdvantageQuote) => void;
  onViewDetails: (plan: MedicareAdvantageQuote) => void;
  isComparing: boolean;
}> = ({ plan, onCompare, onViewDetails, isComparing }) => {
  const [showAllBenefits, setShowAllBenefits] = useState(false);
  
  // Group benefits by category for better organization
  const groupedBenefits = plan.benefits.reduce((acc, benefit) => {
    const category = benefit.benefit_type.includes("prescription") ? "Prescription" :
                    benefit.benefit_type.includes("dental") ? "Dental" :
                    benefit.benefit_type.includes("vision") ? "Vision" :
                    benefit.benefit_type.includes("hospital") || benefit.benefit_type.includes("inpatient") ? "Hospital" :
                    benefit.benefit_type.includes("doctor") || benefit.benefit_type.includes("office") ? "Medical" :
                    benefit.benefit_type.includes("mental") ? "Mental Health" :
                    "Other";
    
    if (!acc[category]) acc[category] = [];
    acc[category].push(benefit);
    return acc;
  }, {} as Record<string, typeof plan.benefits>);

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-blue-600">{plan.plan_name}</h3>
              <Badge variant="outline" className="text-xs">
                {plan.plan_type}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">{plan.organization_name}</p>
            <StarRating rating={plan.overall_star_rating} />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">FREE</div>
            <div className="text-sm text-gray-500">MOOP: {plan.in_network_moop}</div>
            {plan.zero_premium_with_full_low_income_subsidy && (
              <Badge variant="secondary" className="bg-green-50 text-green-700 mt-1">
                <Check className="h-3 w-3 mr-1" />
                Low Income Subsidy
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="drugs">Prescriptions</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{plan.county}, {plan.state}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Part C: {formatCurrency(plan.part_c_rate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Pill className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Part D: {formatCurrency(plan.part_d_rate)}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="font-medium">Plan Year:</span> {plan.contract_year}
                </div>
                {plan.additional_coverage_offered_in_the_gap && (
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                    <Shield className="h-3 w-3 mr-1" />
                    Gap Coverage
                  </Badge>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="benefits" className="mt-4">
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(groupedBenefits).map(([category, benefits]) => (
                  <Accordion key={category} type="single" collapsible>
                    <AccordionItem value={category}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          {getBenefitIcon(category)}
                          <span className="font-medium">{category} ({benefits.length})</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {benefits.slice(0, showAllBenefits ? benefits.length : 3).map((benefit, idx) => (
                            <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                              <div className="font-medium text-sm mb-1">{benefit.benefit_type}</div>
                              {benefit.summary_description ? (
                                <div className="text-xs space-y-1">
                                  {benefit.summary_description.in_network && (
                                    <div>
                                      <span className="font-medium text-green-700">In-Network:</span>{" "}
                                      <span dangerouslySetInnerHTML={{ __html: benefit.summary_description.in_network }} />
                                    </div>
                                  )}
                                  {benefit.summary_description.out_network && (
                                    <div>
                                      <span className="font-medium text-orange-700">Out-of-Network:</span>{" "}
                                      <span dangerouslySetInnerHTML={{ __html: benefit.summary_description.out_network }} />
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-xs text-gray-600" dangerouslySetInnerHTML={{ __html: benefit.full_description }} />
                              )}
                            </div>
                          ))}
                          {benefits.length > 3 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowAllBenefits(!showAllBenefits)}
                              className="w-full"
                            >
                              {showAllBenefits ? (
                                <>Show Less <ChevronUp className="ml-1 h-3 w-3" /></>
                              ) : (
                                <>Show {benefits.length - 3} More <ChevronDown className="ml-1 h-3 w-3" /></>
                              )}
                            </Button>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="drugs" className="mt-4">
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                Prescription drug coverage details
              </div>
              {plan.part_d_subsides && (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>25% Subsidy: {formatCurrency(plan.part_d_subsides["25"])}</div>
                  <div>50% Subsidy: {formatCurrency(plan.part_d_subsides["50"])}</div>
                  <div>75% Subsidy: {formatCurrency(plan.part_d_subsides["75"])}</div>
                  <div>100% Subsidy: {formatCurrency(plan.part_d_subsides["100"])}</div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="mt-4">
            <div className="space-y-3">
              {plan.contextual_data?.carrier_resources && (
                <div className="space-y-2">
                  {Object.entries(plan.contextual_data.carrier_resources).map(([key, url]) => (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                      <Globe className="h-3 w-3" />
                      {key}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 mt-6">
          <Button 
            onClick={() => onViewDetails(plan)}
            variant="outline"
            className="flex-1"
          >
            <Info className="h-4 w-4 mr-2" />
            View Full Details
          </Button>
          <Button 
            onClick={() => onCompare(plan)}
            className="flex-1"
            variant={isComparing ? "secondary" : "default"}
          >
            <GitCompare className="h-4 w-4 mr-2" />
            {isComparing ? "Remove from Compare" : "Add to Compare"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Medicare Advantage Shop Component
export default function MedicareAdvantageShopContent({ 
  isExternallyLoading = false,
  externalQuotes = null
}: { 
  isExternallyLoading?: boolean;
  externalQuotes?: any[] | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State management
  const [zipCode, setZipCode] = useState("");
  const [plans, setPlans] = useState<MedicareAdvantageQuote[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<MedicareAdvantageQuote[]>([]);
  const [filters, setFilters] = useState<MedicareAdvantageFilters>({
    searchQuery: '',
    planTypes: [],
    starRatings: [],
    premiumRange: [0, 200],
    counties: [],
    benefitCategories: [],
    hasLowIncomeSubsidy: false,
    hasGapCoverage: false,
    hasDentalCoverage: false,
    hasVisionCoverage: false,
    sortBy: 'rating'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparePlans, setComparePlans] = useState<MedicareAdvantageQuote[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MedicareAdvantageQuote | null>(null);
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedAdvantageTypes, setSelectedAdvantageTypes] = useState<string[]>(['HMO', 'HMOPOS', 'LOCAL PPO', 'REGIONAL PPO', 'PFFS', 'MSA']);

  // Helper functions
  const hasQuotes = () => {
    return plans?.length > 0;
  };

  // Load saved data on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedZipCode = localStorage.getItem('medicare_advantage_zipcode');
      const savedPlans = localStorage.getItem('medicare_advantage_quotes');
      const savedFilters = localStorage.getItem('medicare_advantage_filters');
      
      if (savedZipCode) {
        setZipCode(savedZipCode);
      }
      
      // Use external quotes if provided, otherwise fall back to localStorage
      if (externalQuotes && externalQuotes.length > 0) {
        console.log('🎯 Using external Medicare Advantage quotes:', externalQuotes.length);
        setPlans(externalQuotes);
      } else if (savedPlans) {
        try {
          const parsedPlans = JSON.parse(savedPlans);
          setPlans(parsedPlans);
        } catch (error) {
          console.error('Error parsing saved plans:', error);
        }
      }
      
      if (savedFilters) {
        try {
          const parsedFilters = JSON.parse(savedFilters);
          setFilters({ ...filters, ...parsedFilters });
        } catch (error) {
          console.error('Error parsing saved filters:', error);
        }
      }
    }
  }, [externalQuotes]);

  // Save data to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && zipCode) {
      localStorage.setItem('medicare_advantage_zipcode', zipCode);
    }
  }, [zipCode]);

  useEffect(() => {
    if (typeof window !== 'undefined' && plans.length > 0) {
      localStorage.setItem('medicare_advantage_quotes', JSON.stringify(plans));
    }
  }, [plans]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('medicare_advantage_filters', JSON.stringify(filters));
    }
  }, [filters]);

  // Apply filters whenever plans or filters change
  useEffect(() => {
    if (plans.length === 0) {
      setFilteredPlans([]);
      return;
    }

    let filtered = [...plans];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(plan =>
        plan.plan_name.toLowerCase().includes(query) ||
        plan.organization_name.toLowerCase().includes(query)
      );
    }

    // Plan type filter
    if (filters.planTypes.length > 0) {
      filtered = filtered.filter(plan =>
        filters.planTypes.includes(plan.plan_type)
      );
    }

    // Star rating filter
    if (filters.starRatings.length > 0) {
      filtered = filtered.filter(plan =>
        filters.starRatings.some(rating => plan.overall_star_rating >= rating)
      );
    }

    // Premium filter
    const monthlyPremium = (plan: MedicareAdvantageQuote) => 
      (plan.part_c_rate + plan.part_d_rate) / 100;
    
    filtered = filtered.filter(plan => {
      const premium = monthlyPremium(plan);
      return premium >= filters.premiumRange[0] && 
             (filters.premiumRange[1] >= 200 || premium <= filters.premiumRange[1]);
    });

    // County filter
    if (filters.counties.length > 0) {
      filtered = filtered.filter(plan =>
        filters.counties.includes(`${plan.county}, ${plan.state}`)
      );
    }

    // Special benefits filters
    if (filters.hasLowIncomeSubsidy) {
      filtered = filtered.filter(plan => plan.zero_premium_with_full_low_income_subsidy);
    }

    if (filters.hasGapCoverage) {
      filtered = filtered.filter(plan => plan.additional_coverage_offered_in_the_gap);
    }

    if (filters.hasDentalCoverage) {
      filtered = filtered.filter(plan =>
        plan.benefits.some(benefit => 
          benefit.benefit_type.toLowerCase().includes('dental')
        )
      );
    }

    if (filters.hasVisionCoverage) {
      filtered = filtered.filter(plan =>
        plan.benefits.some(benefit => 
          benefit.benefit_type.toLowerCase().includes('vision')
        )
      );
    }

    // Sort plans
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'premium':
          return monthlyPremium(a) - monthlyPremium(b);
        case 'rating':
          return b.overall_star_rating - a.overall_star_rating;
        case 'popularity':
          return b.overall_star_rating - a.overall_star_rating;
        default:
          return 0;
      }
    });

    setFilteredPlans(filtered);
  }, [plans, filters]);

  const handleFiltersChange = (newFilters: MedicareAdvantageFilters) => {
    setFilters(newFilters);
  };

  // Reset all data and clear localStorage
  const clearAllData = () => {
    // Clear state
    setZipCode("");
    setPlans([]);
    setFilteredPlans([]);
    setFilters({
      searchQuery: '',
      planTypes: [],
      starRatings: [],
      premiumRange: [0, 200],
      counties: [],
      benefitCategories: [],
      hasLowIncomeSubsidy: false,
      hasGapCoverage: false,
      hasDentalCoverage: false,
      hasVisionCoverage: false,
      sortBy: 'rating'
    });
    setLoading(false);
    setError(null);
    setComparePlans([]);
    setSelectedPlan(null);
    setShowCompareDialog(false);
    setShowDetailsDialog(false);

    // Clear localStorage
    if (typeof window !== 'undefined') {
      // Clear Medicare Advantage specific data
      localStorage.removeItem('medicare_advantage_quotes');
      localStorage.removeItem('medicare_advantage_filters');
      localStorage.removeItem('medicare_advantage_zipcode');
      
      // Clear shared Medicare data
      localStorage.removeItem('medicare_quote_form_data');
      localStorage.removeItem('medicare_quote_form_completed');
      localStorage.removeItem('medicare_real_quotes');
      localStorage.removeItem('medicare_filter_state');
      localStorage.removeItem('planDetailsData');
      
      // Clean up any other Medicare-related data
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('medicare_')) {
          localStorage.removeItem(key);
        }
      });
      
      console.log('✅ Cleared all Medicare Advantage data and localStorage');
    }

    // Navigate back to main Medicare flow page
    if (typeof window !== 'undefined') {
      window.location.href = '/medicare';
    }
  };

  const handleSearch = async (newZipCode: string) => {
    if (!newZipCode || newZipCode.length !== 5) {
      setError("Please enter a valid 5-digit ZIP code");
      return;
    }

    setZipCode(newZipCode);
    setLoading(true);
    setError(null);
    
    try {
      const response = await getMedicareAdvantageQuotes({ zipCode: newZipCode });
      if (response.error) {
        setError(response.error);
      } else {
        setPlans(response.quotes || []);
      }
    } catch (err) {
      setError("Failed to fetch Medicare Advantage plans");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = (plan: MedicareAdvantageQuote) => {
    const isAlreadyComparing = comparePlans.some(p => p.key === plan.key);
    if (isAlreadyComparing) {
      setComparePlans(comparePlans.filter(p => p.key !== plan.key));
    } else if (comparePlans.length < 3) {
      setComparePlans([...comparePlans, plan]);
    } else {
      alert("You can compare up to 3 plans at once");
    }
  };

  const handleViewDetails = (plan: MedicareAdvantageQuote) => {
    setSelectedPlan(plan);
    setShowDetailsDialog(true);
  };

  const displayPlans = React.useMemo(() => {
    const basePlans = filteredPlans.length > 0 ? filteredPlans : plans;
    
    // Filter by selected advantage types
    if (selectedAdvantageTypes.length > 0) {
      return basePlans.filter(plan => 
        selectedAdvantageTypes.includes(plan.plan_type)
      );
    }
    
    return basePlans;
  }, [filteredPlans, plans, selectedAdvantageTypes]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <MedicareAdvantageSidebar
            zipCode={zipCode}
            plans={plans}
            onFiltersChange={handleFiltersChange}
          />
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3">
          {/* Compare Bar */}
          {comparePlans.length > 0 && (
            <div className="mb-6">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GitCompare className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900">
                        Comparing {comparePlans.length} plan{comparePlans.length > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowCompareDialog(true)}
                        disabled={comparePlans.length < 2}
                      >
                        Compare Side-by-Side
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setComparePlans([])}
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <X className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {(loading || isExternallyLoading) && (
            <GenericQuoteLoading 
              title="Getting Your Medicare Advantage Quotes"
              message="Searching for Medicare Advantage plans in your area..."
            />
          )}

          {/* Plans List */}
          {!loading && !isExternallyLoading && displayPlans.length > 0 && (
            <div className="space-y-6">
              {/* Results Header with Plan Type Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold">Medicare Advantage</h2>
                    {zipCode && (
                      <div className="text-sm text-gray-600">
                        <MapPin className="h-4 w-4 inline mr-1" />
                        {displayPlans[0]?.county}, {displayPlans[0]?.state}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Showing 1-{displayPlans.length} of {displayPlans.length} plan{displayPlans.length !== 1 ? 's' : ''}
                    <span className="ml-2 text-xs">
                      ({plans.length} plan{plans.length !== 1 ? 's' : ''} loaded)
                    </span>
                  </p>
                </div>

                {/* Plan Type Controls */}
                <div className="space-y-3">
                  <div className="flex flex-col gap-3">
                    <span className="text-sm font-medium text-muted-foreground">Plan Types:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {/* HMO (includes HMO + HMOPOS) */}
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="header-plan-hmo-group"
                          checked={selectedAdvantageTypes.includes('HMO') || selectedAdvantageTypes.includes('HMOPOS')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              const newTypes = [...selectedAdvantageTypes];
                              if (!newTypes.includes('HMO')) newTypes.push('HMO');
                              if (!newTypes.includes('HMOPOS')) newTypes.push('HMOPOS');
                              setSelectedAdvantageTypes(newTypes);
                            } else {
                              setSelectedAdvantageTypes(selectedAdvantageTypes.filter(plan => plan !== 'HMO' && plan !== 'HMOPOS'));
                            }
                          }}
                        />
                        <label htmlFor="header-plan-hmo-group" className="text-sm font-medium">
                          HMO
                        </label>
                      </div>
                      
                      {/* PPO (includes Local PPO + Regional PPO) */}
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="header-plan-ppo-group"
                          checked={selectedAdvantageTypes.includes('LOCAL PPO') || selectedAdvantageTypes.includes('REGIONAL PPO')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              const newTypes = [...selectedAdvantageTypes];
                              if (!newTypes.includes('LOCAL PPO')) newTypes.push('LOCAL PPO');
                              if (!newTypes.includes('REGIONAL PPO')) newTypes.push('REGIONAL PPO');
                              setSelectedAdvantageTypes(newTypes);
                            } else {
                              setSelectedAdvantageTypes(selectedAdvantageTypes.filter(plan => plan !== 'LOCAL PPO' && plan !== 'REGIONAL PPO'));
                            }
                          }}
                        />
                        <label htmlFor="header-plan-ppo-group" className="text-sm font-medium">
                          PPO
                        </label>
                      </div>
                      
                      {/* PFFS */}
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="header-plan-pffs"
                          checked={selectedAdvantageTypes.includes('PFFS')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedAdvantageTypes([...selectedAdvantageTypes, 'PFFS']);
                            } else {
                              setSelectedAdvantageTypes(selectedAdvantageTypes.filter(plan => plan !== 'PFFS'));
                            }
                          }}
                        />
                        <label htmlFor="header-plan-pffs" className="text-sm font-medium">
                          PFFS
                        </label>
                      </div>
                      
                      {/* MSA */}
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="header-plan-msa"
                          checked={selectedAdvantageTypes.includes('MSA')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedAdvantageTypes([...selectedAdvantageTypes, 'MSA']);
                            } else {
                              setSelectedAdvantageTypes(selectedAdvantageTypes.filter(plan => plan !== 'MSA'));
                            }
                          }}
                        />
                        <label htmlFor="header-plan-msa" className="text-sm font-medium">
                          MSA
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid gap-6">
                {displayPlans.map((plan) => (
                  <PlanCard
                    key={plan.key}
                    plan={plan}
                    onCompare={handleCompare}
                    onViewDetails={handleViewDetails}
                    isComparing={comparePlans.some(p => p.key === plan.key)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* No Plans Message */}
          {!loading && !isExternallyLoading && !error && displayPlans.length === 0 && zipCode && (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Plans Found
              </h3>
              <p className="text-gray-600">
                We couldn't find any Medicare Advantage plans for ZIP code {zipCode}.
                Please try a different ZIP code or adjust your filters.
              </p>
            </div>
          )}

          {/* Getting Started Message */}
          {!loading && !isExternallyLoading && !error && displayPlans.length === 0 && !zipCode && (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Find Medicare Advantage Plans
              </h3>
              <p className="text-gray-600">
                Enter your ZIP code in the sidebar to see available Medicare Advantage plans in your area.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Plan Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPlan?.plan_name}</DialogTitle>
            <DialogDescription>
              Complete plan details and benefits information
            </DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-6">
              <div className="text-sm text-gray-600">
                Comprehensive plan details view coming soon...
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Compare Dialog */}
      <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Compare Medicare Advantage Plans</DialogTitle>
            <DialogDescription>
              Side-by-side comparison of selected plans
            </DialogDescription>
          </DialogHeader>
          {comparePlans.length >= 2 && (
            <div className="space-y-6">
              <div className="text-sm text-gray-600">
                Plan comparison view coming soon...
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <MedicareDisclaimer />
    </div>
  );
}
