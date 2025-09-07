"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getMedicareAdvantageQuotes } from "@/lib/actions/advantage-quotes";
import GenericQuoteLoading from "@/components/GenericQuoteLoading";
import MedicareAdvantageSidebar, { MedicareAdvantageFilters } from "@/components/medicare-shop/advantage/MedicareAdvantageSidebar";
import { 
  StarFilledIcon as Star, 
  TokensIcon as DollarSign, 
  GlobeIcon as MapPin, 
  MobileIcon as Phone, 
  GlobeIcon as Globe, 
  ArchiveIcon as Pill, 
  HeartIcon as Heart, 
  EyeOpenIcon as Eye, 
  ReaderIcon as Stethoscope,
  RocketIcon as Ambulance,
  ArchiveIcon as Building2,
  CheckCircledIcon as Shield,
  ActivityLogIcon as Activity,
  LightningBoltIcon as Zap,
  MagnifyingGlassIcon as Search,
  MixerHorizontalIcon as Filter,
  Component2Icon as Compare,
  DownloadIcon as Download,
  ExternalLinkIcon as ExternalLink,
  InfoCircledIcon as Info,
  CheckIcon as Check,
  CrossCircledIcon as X,
  ChevronDownIcon as ChevronDown,
  ChevronUpIcon as ChevronUp,
  UpdateIcon as Loader2
} from "@radix-ui/react-icons";
import Image from "next/image";

interface MedicareAdvantageQuote {
  organization_name: string;
  plan_name: string;
  plan_id: string;
  contract_id: string;
  plan_type: string;
  month_rate: number;
  part_c_rate: number;
  part_d_rate: number;
  overall_star_rating: number;
  in_network_moop: string;
  in_network_moop_sort: number;
  annual_drug_deductible: number;
  county: string;
  state: string;
  key: string;
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
                    benefit.benefit_type.includes("emergency") || benefit.benefit_type.includes("ambulance") ? "Emergency" :
                    "Other";
    
    if (!acc[category]) acc[category] = [];
    acc[category].push(benefit);
    return acc;
  }, {} as Record<string, typeof plan.benefits>);

  const displayBenefits = showAllBenefits ? plan.benefits : plan.benefits.slice(0, 6);

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl text-blue-700 mb-2">{plan.plan_name}</CardTitle>
            <CardDescription className="text-lg font-semibold text-gray-800">
              {plan.organization_name}
            </CardDescription>
            <div className="flex items-center gap-3 mt-3">
              <Badge variant="outline" className="bg-blue-50">
                {plan.plan_type}
              </Badge>
              <Badge variant="outline">
                Contract: {plan.contract_id}
              </Badge>
              <StarRating rating={plan.overall_star_rating} />
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600">
              {plan.month_rate === 0 ? "FREE" : formatCurrency(plan.month_rate)}
              {plan.month_rate > 0 && <span className="text-sm font-normal text-gray-500">/month</span>}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              MOOP: {plan.in_network_moop}
            </div>
            {plan.annual_drug_deductible >= 0 && (
              <div className="text-sm text-gray-600">
                Drug Deductible: {plan.annual_drug_deductible === 0 ? "$0" : formatCurrency(plan.annual_drug_deductible * 100)}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
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
                {plan.zero_premium_with_full_low_income_subsidy && (
                  <Badge variant="secondary" className="bg-green-50 text-green-700">
                    <Check className="h-3 w-3 mr-1" />
                    Low Income Subsidy
                  </Badge>
                )}
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
            <div className="space-y-4">
              {plan.drug_benefit_type && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-sm">Drug Benefit Type:</span>
                    <p className="text-sm text-gray-600">{plan.drug_benefit_type}</p>
                  </div>
                  <div>
                    <span className="font-medium text-sm">Benefit Detail:</span>
                    <p className="text-sm text-gray-600">{plan.drug_benefit_type_detail}</p>
                  </div>
                </div>
              )}
              
              {plan.part_d_subsides && (
                <div>
                  <span className="font-medium text-sm mb-2 block">Part D Subsidies by Income Level</span>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between bg-gray-50 p-2 rounded">
                      <span>100% Subsidy:</span>
                      <span className="font-medium">{formatCurrency(plan.part_d_subsides["100"])}</span>
                    </div>
                    <div className="flex justify-between bg-gray-50 p-2 rounded">
                      <span>75% Subsidy:</span>
                      <span className="font-medium">{formatCurrency(plan.part_d_subsides["75"])}</span>
                    </div>
                    <div className="flex justify-between bg-gray-50 p-2 rounded">
                      <span>50% Subsidy:</span>
                      <span className="font-medium">{formatCurrency(plan.part_d_subsides["50"])}</span>
                    </div>
                    <div className="flex justify-between bg-gray-50 p-2 rounded">
                      <span>25% Subsidy:</span>
                      <span className="font-medium">{formatCurrency(plan.part_d_subsides["25"])}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Find and display prescription drug details from benefits */}
              {plan.benefits.find(b => b.benefit_type.includes("prescription"))?.full_description && (
                <div>
                  <span className="font-medium text-sm mb-2 block">Prescription Drug Tiers</span>
                  <div className="text-xs bg-gray-50 p-3 rounded-lg overflow-auto">
                    <div dangerouslySetInnerHTML={{ 
                      __html: plan.benefits.find(b => b.benefit_type.includes("prescription"))?.full_description || "" 
                    }} />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="mt-4">
            <div className="space-y-4">
              {plan.contextual_data?.carrier_resources && (
                <div>
                  <span className="font-medium text-sm mb-3 block">Carrier Resources</span>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(plan.contextual_data.carrier_resources).map(([resourceType, url]) => (
                      url && (
                        <a
                          key={resourceType}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span className="text-sm">{resourceType}</span>
                        </a>
                      )
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <span className="font-medium text-sm mb-2 block">Plan Information</span>
                <div className="text-sm space-y-1 text-gray-600">
                  <div>Company: {plan.company_base?.name_full || plan.organization_name}</div>
                  {plan.company_base?.naic && <div>NAIC Code: {plan.company_base.naic}</div>}
                  <div>Effective Date: {new Date(plan.effective_date).toLocaleDateString()}</div>
                  <div>Electronic Application: {plan.contextual_data?.has_eapp ? "Available" : "Not Available"}</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 mt-6 pt-4 border-t">
          <Button 
            onClick={() => onViewDetails(plan)}
            className="flex-1"
            variant="outline"
          >
            <Info className="h-4 w-4 mr-2" />
            View Full Details
          </Button>
          <Button 
            onClick={() => onCompare(plan)}
            className="flex-1"
            variant={isComparing ? "secondary" : "default"}
          >
            <Compare className="h-4 w-4 mr-2" />
            {isComparing ? "Remove from Compare" : "Add to Compare"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Medicare Advantage Content Component
interface ComprehensiveMedicareAdvantageContentProps {
  quotes?: MedicareAdvantageQuote[];
  isLoading?: boolean;
  error?: string | null;
}

export default function ComprehensiveMedicareAdvantageContent({ 
  quotes: externalQuotes, 
  isLoading: externalLoading, 
  error: externalError 
}: ComprehensiveMedicareAdvantageContentProps = {}) {
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

  // Use external data if provided, otherwise use internal state
  const displayPlans = filteredPlans.length > 0 ? filteredPlans : (externalQuotes || plans);
  const displayLoading = externalLoading !== undefined ? externalLoading : loading;
  const displayError = externalError !== undefined ? externalError : error;

  // Update internal state when external quotes change
  useEffect(() => {
    if (externalQuotes) {
      setPlans(externalQuotes);
    }
  }, [externalQuotes]);

  // Apply filters whenever plans or filters change
  useEffect(() => {
    const currentPlans = externalQuotes || plans;
    if (currentPlans.length === 0) {
      setFilteredPlans([]);
      return;
    }

    let filtered = [...currentPlans];

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
          // For now, sort by star rating as proxy for popularity
          return b.overall_star_rating - a.overall_star_rating;
        default:
          return 0;
      }
    });

    setFilteredPlans(filtered);
  }, [plans, externalQuotes, filters]);

  useEffect(() => {
    if (externalError) {
      setError(externalError);
    }
  }, [externalError]);

  const handleFiltersChange = (newFilters: MedicareAdvantageFilters) => {
    setFilters(newFilters);
  };

  const handleSearch = async (newZipCode?: string) => {
    const searchZip = newZipCode || zipCode;
    if (!searchZip || searchZip.length !== 5) {
      setError("Please enter a valid 5-digit ZIP code");
      return;
    }

    setZipCode(searchZip);
    setLoading(true);
    setError(null);
    
    try {
      const response = await getMedicareAdvantageQuotes({ zipCode: searchZip });
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

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <MedicareAdvantageSidebar
            zipCode={zipCode}
            plans={externalQuotes || plans}
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
                  <Compare className="h-5 w-5 text-blue-600" />
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
      {displayError && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <X className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {displayError}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {displayLoading && (
        <GenericQuoteLoading 
          title="Getting Your Medicare Advantage Quotes"
          message="Searching for Medicare Advantage plans in your area..."
        />
      )}

      {/* Plans List */}
      {displayPlans.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">
              Available Plans ({displayPlans.length} found)
            </h2>
            <div className="text-sm text-gray-600">
              <MapPin className="h-4 w-4 inline mr-1" />
              {displayPlans[0]?.county}, {displayPlans[0]?.state}
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
      {!displayLoading && !displayError && displayPlans.length === 0 && zipCode && (
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Plans Found
          </h3>
          <p className="text-gray-600">
            We couldn't find any Medicare Advantage plans for ZIP code {zipCode}.
            Please try a different ZIP code.
          </p>
        </div>
      )}

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
              {/* Detailed plan information would go here */}
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
              {/* Side-by-side comparison would go here */}
              <div className="text-sm text-gray-600">
                Plan comparison view coming soon...
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
        </main>
      </div>
    </div>
  );
}
