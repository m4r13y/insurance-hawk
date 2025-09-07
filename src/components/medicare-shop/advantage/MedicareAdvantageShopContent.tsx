"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import MedicareAdvantageSidebar, { MedicareAdvantageFilters } from "./MedicareAdvantageSidebar";
import { getMedicareAdvantageQuotes } from "@/lib/actions/advantage-quotes";
import MedicareDisclaimer from "@/components/medicare-disclaimer";
import { PlanCardsSkeleton } from "@/components/medicare-shop/shared";
import { loadFromStorage, saveToStorage, ADVANTAGE_QUOTES_KEY } from '@/lib/services/storage-bridge';
import { 
  StarFilledIcon as Star, 
  PersonIcon,
  GlobeIcon as Globe, 
  ComponentInstanceIcon, 
  HeartIcon as Heart, 
  EyeOpenIcon as Eye, 
  ActivityLogIcon as Activity,
  ExclamationTriangleIcon,
  CheckCircledIcon as Shield,
  LightningBoltIcon,
  InfoCircledIcon as Info,
  CheckIcon as Check,
  Cross1Icon as X,
  ResetIcon,
  ReaderIcon as Stethoscope,
  ArchiveIcon as Pill,
  ArchiveIcon as Building2,
  RocketIcon as Ambulance,
  TokensIcon as DollarSign,
  GlobeIcon as MapPin,
  Component2Icon as Compare,
  ViewGridIcon as GridView,
  ListBulletIcon as ListView,
  MagnifyingGlassIcon as SearchIcon,
  GearIcon as ColumnOptions,
  GridIcon as Grid,
  ListBulletIcon as List,
  GearIcon as Settings
} from "@radix-ui/react-icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  annual_drug_deductible: number; // Missing field from API
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

// Helper function to extract benefit data
const extractBenefitData = (plan: MedicareAdvantageQuote, benefitType: string): string => {
  const benefit = plan.benefits?.find(b => 
    b.benefit_type.toLowerCase().includes(benefitType.toLowerCase())
  );
  
  if (!benefit) return 'N/A';
  
  if (typeof benefit.summary_description === 'string') {
    return benefit.summary_description;
  } else if (benefit.summary_description?.in_network) {
    return benefit.summary_description.in_network;
  } else {
    return benefit.full_description || 'Details available';
  }
};

// Improved helper functions for specific data extraction based on API analysis
const getMedicalDeductible = (plan: MedicareAdvantageQuote): string => {
  const deductibleBenefit = plan.benefits.find(b => 
    b.benefit_type.toLowerCase().includes('health plan deductible') ||
    b.benefit_type.toLowerCase().includes('medical deductible')
  );
  
  if (deductibleBenefit) {
    if (deductibleBenefit.summary_description?.in_network) {
      return deductibleBenefit.summary_description.in_network;
    }
    // Clean HTML tags and extract value
    const cleanText = deductibleBenefit.full_description.replace(/<[^>]*>/g, '').trim();
    return cleanText || '$0';
  }
  return 'Contact Plan';
};

const getDrugDeductible = (plan: MedicareAdvantageQuote): string => {
  // Use the direct API field if available
  if (plan.annual_drug_deductible !== undefined) {
    return plan.annual_drug_deductible === 0 ? '$0' : `$${plan.annual_drug_deductible}`;
  }
  
  // Fallback to benefits search
  const drugDeductibleBenefit = plan.benefits.find(b => 
    b.benefit_type.toLowerCase().includes('drug deductible') ||
    b.benefit_type.toLowerCase().includes('prescription deductible')
  );
  
  if (drugDeductibleBenefit) {
    return extractBenefitData(plan, 'drug deductible') || 'Contact Plan';
  }
  return 'Contact Plan';
};

const getPrimaryCareData = (plan: MedicareAdvantageQuote): string => {
  const doctorVisitBenefit = plan.benefits.find(b => 
    b.benefit_type.toLowerCase().includes("doctor's office visits") ||
    b.benefit_type.toLowerCase().includes("primary care")
  );
  
  if (doctorVisitBenefit?.summary_description?.in_network) {
    const summary = doctorVisitBenefit.summary_description.in_network;
    // Extract primary care copay from text like "$0 copay for Primary. $35 copay per visit for Specialist"
    const primaryMatch = summary.match(/\$\d+\s+copay\s+for\s+Primary/i);
    return primaryMatch ? primaryMatch[0] : summary;
  }
  return 'Contact Plan';
};

const getSpecialistCareData = (plan: MedicareAdvantageQuote): string => {
  const doctorVisitBenefit = plan.benefits.find(b => 
    b.benefit_type.toLowerCase().includes("doctor's office visits") ||
    b.benefit_type.toLowerCase().includes("specialist")
  );
  
  if (doctorVisitBenefit?.summary_description?.in_network) {
    const summary = doctorVisitBenefit.summary_description.in_network;
    // Extract specialist copay from text
    const specialistMatch = summary.match(/\$\d+\s+copay.*specialist/i);
    return specialistMatch ? specialistMatch[0] : summary;
  }
  return 'Contact Plan';
};

const getOTCBenefit = (plan: MedicareAdvantageQuote): string => {
  const otcBenefit = plan.benefits.find(b => 
    b.benefit_type.toLowerCase() === 'otc items' ||
    b.benefit_type.toLowerCase().includes('over-the-counter') ||
    b.benefit_type.toLowerCase().includes('over the counter')
  );
  
  if (otcBenefit) {
    if (otcBenefit.summary_description?.in_network) {
      return otcBenefit.summary_description.in_network;
    }
    // Extract benefit amount from full description
    const amountMatch = otcBenefit.full_description.match(/\$\d+/);
    if (amountMatch) {
      return amountMatch[0];
    }
    // Check if it mentions "Some Coverage"
    if (otcBenefit.full_description.toLowerCase().includes('some coverage')) {
      return 'Some Coverage';
    }
  }
  return 'Not Covered';
};

const hasBenefitType = (plan: MedicareAdvantageQuote, benefitType: string): boolean => {
  const benefit = plan.benefits.find(b => 
    b.benefit_type.toLowerCase() === benefitType.toLowerCase() ||
    b.benefit_type.toLowerCase().includes(benefitType.toLowerCase())
  );
  
  if (!benefit) return false;
  
  // Get all text content and clean HTML
  const fullDesc = (benefit.full_description || '').replace(/<[^>]*>/g, ' ').toLowerCase().trim();
  const inNetwork = (benefit.summary_description?.in_network || '').toLowerCase().trim();
  const outNetwork = (benefit.summary_description?.out_network || '').toLowerCase().trim();
  const allText = `${fullDesc} ${inNetwork} ${outNetwork}`.replace(/\s+/g, ' ').trim();
  
  // If no content at all, assume no benefit
  if (!allText || allText === '') return false;
  
  // Strong positive indicators first (these override negatives)
  const positiveIndicators = [
    '$0',
    '$', // Any dollar amount
    'copay',
    'coinsurance', 
    'covered',
    'some coverage',
    'per visit',
    'per day',
    'per year',
    'included',
    'available',
    'deductible',
    'maximum',
    'limit',
    'allowance',
    'in-network',
    'days 1',
    'tier 1'
  ];
  
  // Check for positive indicators first
  const hasPositive = positiveIndicators.some(indicator => 
    allText.includes(indicator)
  );
  
  // Strong negative indicators - only applies if NO positive indicators found
  const strongNegativeIndicators = [
    'not covered',
    'no coverage',
    'not available',
    'excluded',
    'not included',
    'no benefit'
  ];
  
  // If we have positive indicators, it's positive (mixed benefits favor positive)
  if (hasPositive) return true;
  
  // Only check for negatives if no positives found
  const hasStrongNegative = strongNegativeIndicators.some(indicator => 
    allText.includes(indicator)
  );
  
  if (hasStrongNegative) return false;
  
  // Check for simple "covered" or "yes" responses
  const simplePositives = ['covered', 'yes', 'some coverage'];
  const hasSimplePositive = simplePositives.some(indicator => 
    allText.includes(indicator)
  );
  
  if (hasSimplePositive) return true;
  
  return false;
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
  const [planSearch, setPlanSearch] = useState('');
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="drugs">Prescriptions</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="search" className="px-2">
              <SearchIcon className="h-4 w-4" />
            </TabsTrigger>
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
                                <>Show Less</>
                              ) : (
                                <>Show {benefits.length - 3} More</>
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

          <TabsContent value="search" className="mt-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search plan details, benefits, or coverage..."
                  value={planSearch}
                  onChange={(e) => setPlanSearch(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" size="sm">
                  <SearchIcon className="h-4 w-4" />
                </Button>
              </div>
              
              {planSearch && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Search Results:</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {plan.benefits
                      ?.filter(benefit => {
                        const query = planSearch.toLowerCase();
                        const matchesBenefitType = benefit.benefit_type.toLowerCase().includes(query);
                        const matchesFullDescription = benefit.full_description.toLowerCase().includes(query);
                        
                        let matchesSummary = false;
                        const summaryDesc = benefit.summary_description;
                        if (summaryDesc) {
                          try {
                            // Handle as object type (which is what it's defined as)
                            if (typeof summaryDesc === 'object' && summaryDesc !== null) {
                              const obj = summaryDesc;
                              matchesSummary = !!(
                                (obj.in_network && obj.in_network.toLowerCase().includes(query)) ||
                                (obj.out_network && obj.out_network.toLowerCase().includes(query))
                              );
                            }
                          } catch (e) {
                            // Ignore type errors and continue
                          }
                        }
                        
                        return matchesBenefitType || matchesFullDescription || matchesSummary;
                      })
                      .map((benefit, index) => (
                        <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                          <div className="font-medium">{benefit.benefit_type}</div>
                          <div className="text-gray-600 text-xs mt-1">
                            {typeof benefit.summary_description === 'string' 
                              ? benefit.summary_description 
                              : benefit.summary_description?.in_network || benefit.full_description}
                          </div>
                        </div>
                      )) || <div className="text-sm text-gray-500">No matching benefits found.</div>
                    }
                  </div>
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
            <Compare className="h-4 w-4 mr-2" />
            {isComparing ? "Remove from Compare" : "Add to Compare"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Expanded Row Search Component
const ExpandedRowSearch: React.FC<{ plan: MedicareAdvantageQuote }> = ({ plan }) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search plan details, benefits, or coverage..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button variant="outline" size="sm">
          <SearchIcon className="h-4 w-4" />
        </Button>
      </div>
      
      {searchQuery && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Search Results:</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {plan.benefits
              ?.filter(benefit => {
                const query = searchQuery.toLowerCase();
                const matchesBenefitType = benefit.benefit_type.toLowerCase().includes(query);
                const matchesFullDescription = benefit.full_description.toLowerCase().includes(query);
                
                let matchesSummary = false;
                try {
                  const summary = benefit.summary_description;
                  if (summary && typeof summary === 'object') {
                    matchesSummary = !!(
                      (summary.in_network && summary.in_network.toLowerCase().includes(query)) ||
                      (summary.out_network && summary.out_network.toLowerCase().includes(query))
                    );
                  }
                } catch (e) {
                  // Ignore errors
                }
                
                return matchesBenefitType || matchesFullDescription || matchesSummary;
              })
              .map((benefit, index) => (
                <div key={index} className="p-2 bg-white rounded text-sm border">
                  <div className="font-medium">{benefit.benefit_type}</div>
                  <div className="text-gray-600 text-xs mt-1">
                    {typeof benefit.summary_description === 'string' 
                      ? benefit.summary_description 
                      : benefit.summary_description?.in_network || benefit.full_description}
                  </div>
                </div>
              )) || <div className="text-sm text-gray-500">No matching benefits found.</div>
            }
          </div>
        </div>
      )}
    </div>
  );
};

// Plan List View Component for table display
const PlanListView: React.FC<{
  plans: MedicareAdvantageQuote[];
  visibleColumns: string[];
  expandedRows: Set<string>;
  onRowClick: (planKey: string) => void;
  onCompare: (plan: MedicareAdvantageQuote) => void;
  onViewDetails: (plan: MedicareAdvantageQuote) => void;
  comparePlans: MedicareAdvantageQuote[];
  availableColumns: Array<{ id: string; label: string; required: boolean; default: boolean; }>;
  setComparePlans: React.Dispatch<React.SetStateAction<MedicareAdvantageQuote[]>>;
  compareMode: boolean;
}> = ({ plans, visibleColumns, expandedRows, onRowClick, onCompare, onViewDetails, comparePlans, availableColumns, setComparePlans, compareMode }) => {
  
  const renderCellContent = (plan: MedicareAdvantageQuote, columnId: string) => {
    switch (columnId) {
      case 'plan_name':
        return (
          <div className="flex items-center gap-3">
            <div>
              <div className="font-medium">{plan.plan_name}</div>
              <div className="flex items-center gap-2 my-1">
                <StarRating rating={plan.overall_star_rating} />
              </div>
              <div className="text-sm text-gray-500">{plan.organization_name}</div>
            </div>
          </div>
        );
      case 'monthly_premium':
        return <span className="font-medium">{formatCurrency(plan.month_rate)}</span>;
      case 'annual_cost':
        // Calculate annual cost (monthly premium * 12)
        return <span className="font-medium">{formatCurrency(plan.month_rate * 12)}</span>;
      case 'max_out_of_pocket':
        return <span className="text-sm">{plan.in_network_moop}</span>;
      case 'drug_deductible':
        return <span className="text-sm">{getDrugDeductible(plan)}</span>;
      case 'dental':
        const hasDental = hasBenefitType(plan, 'Comprehensive Dental Service');
        return hasDental ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />;
      case 'medical_deductible':
        return <span className="text-sm">{getMedicalDeductible(plan)}</span>;
      case 'primary_care_copay':
        return <span className="text-sm">{getPrimaryCareData(plan)}</span>;
      case 'specialist_copay':
        return <span className="text-sm">{getSpecialistCareData(plan)}</span>;
      case 'otc_benefit':
        return <span className="text-sm">{getOTCBenefit(plan)}</span>;
      case 'vision':
        const hasVision = hasBenefitType(plan, 'Vision');
        return hasVision ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />;
      case 'hearing':
        const hasHearing = hasBenefitType(plan, 'Hearing services');
        return hasHearing ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />;
      case 'transport':
        const hasTransport = hasBenefitType(plan, 'Transportation');
        return hasTransport ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />;
      default:
        return <span>-</span>;
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {compareMode && (
              <TableHead className="w-12">
                <Checkbox
                  checked={comparePlans.length === plans.length && plans.length > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      // Add all plans to compare (up to 3)
                      setComparePlans(plans.slice(0, 3));
                    } else {
                      // Clear all compare selections
                      setComparePlans([]);
                    }
                  }}
                />
              </TableHead>
            )}
            {visibleColumns.map((columnId) => {
              const column = availableColumns.find(col => col.id === columnId);
              return (
                <TableHead key={columnId} className="font-semibold">
                  {column?.label}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <React.Fragment key={plan.key}>
              {/* Main Row */}
              <TableRow 
                className={`cursor-pointer hover:bg-gray-50 ${comparePlans.some(p => p.key === plan.key) ? 'bg-blue-50' : ''}`}
                onClick={() => onRowClick(plan.key)}
              >
                {compareMode && (
                  <TableCell>
                    <Checkbox
                      checked={comparePlans.some(p => p.key === plan.key)}
                      onCheckedChange={(checked) => {
                        const event = new Event('stopPropagation');
                        event.stopPropagation();
                        onCompare(plan);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                )}
                {visibleColumns.map((columnId) => (
                  <TableCell key={columnId}>
                    {renderCellContent(plan, columnId)}
                  </TableCell>
                ))}
              </TableRow>
              
              {/* Expanded Row */}
              {expandedRows.has(plan.key) && (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length + (compareMode ? 1 : 0)} className="p-0">
                    <div className="bg-gray-50 p-6 border-t">
                      <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-5">
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="benefits">Benefits</TabsTrigger>
                          <TabsTrigger value="drugs">Prescriptions</TabsTrigger>
                          <TabsTrigger value="resources">Resources</TabsTrigger>
                          <TabsTrigger value="search" className="px-2">
                            <SearchIcon className="h-4 w-4" />
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Plan Summary */}
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Info className="h-4 w-4" />
                                Plan Summary
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Plan Key:</span>
                                  <span className="font-medium">{plan.key}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Organization:</span>
                                  <span className="font-medium">{plan.organization_name}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Plan Type:</span>
                                  <span className="font-medium">{plan.plan_type}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Service Area:</span>
                                  <span className="font-medium">{plan.county}, {plan.state}</span>
                                </div>
                              </div>
                            </div>

                            {/* Cost Summary */}
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Cost Details
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Monthly Premium:</span>
                                  <span className="font-medium">{formatCurrency(plan.month_rate)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Part C Rate:</span>
                                  <span className="font-medium">{formatCurrency(plan.part_c_rate)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Max Out-of-Pocket:</span>
                                  <span className="font-medium">{plan.in_network_moop}</span>
                                </div>
                              </div>
                            </div>

                            {/* Key Benefits */}
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Key Benefits
                              </h4>
                              <div className="space-y-2 text-sm">
                                {plan.benefits && plan.benefits.slice(0, 4).map((benefit, index) => (
                                  <div key={index} className="flex items-start gap-2">
                                    {getBenefitIcon(benefit.benefit_type)}
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium truncate">{benefit.benefit_type}</div>
                                      <div className="text-gray-600 text-xs truncate">
                                        {typeof benefit.summary_description === 'string' 
                                          ? benefit.summary_description 
                                          : benefit.summary_description?.in_network || 'Details available'}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="benefits" className="mt-4">
                          <div className="grid gap-4">
                            {plan.benefits && plan.benefits.map((benefit, index) => (
                              <div key={index} className="p-3 border rounded-lg">
                                <div className="flex items-start gap-3">
                                  {getBenefitIcon(benefit.benefit_type)}
                                  <div className="flex-1">
                                    <h4 className="font-medium text-sm">{benefit.benefit_type}</h4>
                                    <p className="text-xs text-gray-600 mt-1">
                                      {typeof benefit.summary_description === 'string' 
                                        ? benefit.summary_description 
                                        : benefit.summary_description?.in_network || benefit.full_description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </TabsContent>

                        <TabsContent value="drugs" className="mt-4">
                          <div className="space-y-4">
                            <h4 className="font-medium">Prescription Drug Coverage</h4>
                            {plan.drug_benefit_type ? (
                              <div className="p-3 border rounded-lg">
                                <div className="font-medium text-sm">Coverage Type: {plan.drug_benefit_type}</div>
                                {plan.drug_benefit_type_detail && (
                                  <div className="text-xs text-gray-600 mt-1">{plan.drug_benefit_type_detail}</div>
                                )}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">No prescription drug coverage information available.</div>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="resources" className="mt-4">
                          <div className="space-y-4">
                            <h4 className="font-medium">Plan Resources</h4>
                            {plan.contextual_data?.carrier_resources && Object.keys(plan.contextual_data.carrier_resources).length > 0 ? (
                              <div className="grid gap-2">
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
                            ) : (
                              <div className="text-sm text-gray-500">No additional resources available.</div>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="search" className="mt-4">
                          <ExpandedRowSearch plan={plan} />
                        </TabsContent>
                      </Tabs>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
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

  // View mode and column management
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list'); // Default to list view
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['plan_name', 'max_out_of_pocket', 'drug_deductible', 'monthly_premium', 'annual_cost']); // Default active columns per instructions
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [compareMode, setCompareMode] = useState(false); // Track if we're in compare selection mode

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const plansPerPage = 10;

  // Available columns for the dropdown
  const availableColumns = [
    // Required Columns (always visible)
    { id: 'plan_name', label: 'Plan Info', required: true, default: true },
    { id: 'monthly_premium', label: 'Monthly Premium', required: true, default: true },
    { id: 'annual_cost', label: 'Annual Cost', required: true, default: true },
    
    // Default Active Columns
    { id: 'max_out_of_pocket', label: 'Max Out-of-Pocket', required: false, default: true },
    { id: 'drug_deductible', label: 'Drug Deductible', required: false, default: true },
    
    // Other Column Options
    { id: 'dental', label: 'Dental', required: false, default: false },
    { id: 'medical_deductible', label: 'Medical Deductible', required: false, default: false },
    { id: 'primary_care_copay', label: 'Primary Care Co-pay', required: false, default: false },
    { id: 'specialist_copay', label: 'Specialist Co-pay', required: false, default: false },
    { id: 'otc_benefit', label: 'OTC Benefit', required: false, default: false },
    { id: 'vision', label: 'Vision', required: false, default: false },
    { id: 'hearing', label: 'Hearing', required: false, default: false },
    { id: 'transport', label: 'Transport', required: false, default: false },
  ];

  // Helper functions
  const hasQuotes = () => {
    return plans?.length > 0;
  };

  // Handle row expansion
  const handleRowClick = (planKey: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (expandedRows.has(planKey)) {
      newExpandedRows.delete(planKey);
    } else {
      newExpandedRows.add(planKey);
    }
    setExpandedRows(newExpandedRows);
  };

  // Load saved data on component mount
  useEffect(() => {
    const loadData = async () => {
      if (typeof window !== 'undefined') {
        // Use external quotes if provided, otherwise load from Firestore
        if (externalQuotes && externalQuotes.length > 0) {
          console.log('🎯 Using external Medicare Advantage quotes:', externalQuotes.length);
          setPlans(externalQuotes);
        } else {
          try {
            console.log('📥 Loading Medicare Advantage quotes from Firestore...');
            const savedPlans = await loadFromStorage(ADVANTAGE_QUOTES_KEY, []);
            if (savedPlans && savedPlans.length > 0) {
              console.log('✅ Loaded Medicare Advantage quotes from Firestore:', savedPlans.length);
              setPlans(savedPlans);
            }
          } catch (error) {
            console.error('Error loading plans from Firestore:', error);
          }
        }

        // Still load zipcode and filters from localStorage for UI state
        const savedZipCode = localStorage.getItem('medicare_advantage_zipcode');
        const savedFilters = localStorage.getItem('medicare_advantage_filters');
        
        if (savedZipCode) {
          setZipCode(savedZipCode);
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
    };

    loadData();
  }, [externalQuotes]);

  // Save data when it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && zipCode) {
      localStorage.setItem('medicare_advantage_zipcode', zipCode);
    }
  }, [zipCode]);

  useEffect(() => {
    // Save plans to Firestore instead of localStorage
    if (plans.length > 0) {
      saveToStorage(ADVANTAGE_QUOTES_KEY, plans).catch(error => {
        console.error('Error saving plans to Firestore:', error);
      });
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

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
    setExpandedRows(new Set()); // Clear expanded rows when pagination changes
  }, [filteredPlans]);

  // Clear expanded rows when page changes
  useEffect(() => {
    setExpandedRows(new Set());
  }, [currentPage]);

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

    // Clear localStorage and Firestore
    if (typeof window !== 'undefined') {
      // Clear localStorage UI state data only
      localStorage.removeItem('medicare_advantage_filters');
      localStorage.removeItem('medicare_advantage_zipcode');
      
      // Clear shared Medicare UI data
      localStorage.removeItem('medicare_quote_form_data');
      localStorage.removeItem('medicare_quote_form_completed');
      localStorage.removeItem('medicare_filter_state');
      localStorage.removeItem('planDetailsData');
      
      // Clean up any other Medicare-related UI data
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('medicare_') && !key.includes('quotes')) {
          localStorage.removeItem(key);
        }
      });
    }

    // Clear quotes from Firestore
    saveToStorage(ADVANTAGE_QUOTES_KEY, []).catch(error => {
      console.error('Error clearing quotes from Firestore:', error);
    });
      
    console.log('✅ Cleared all Medicare Advantage data and localStorage');

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
    // Get filtered plans
    const allFilteredPlans = filteredPlans.length > 0 ? filteredPlans : plans;
    
    // Apply pagination
    const startIndex = (currentPage - 1) * plansPerPage;
    const endIndex = startIndex + plansPerPage;
    
    return allFilteredPlans.slice(startIndex, endIndex);
  }, [filteredPlans, plans, currentPage, plansPerPage]);

  // Calculate total pages and pagination info
  const totalPlans = filteredPlans.length > 0 ? filteredPlans.length : plans.length;
  const totalPages = Math.ceil(totalPlans / plansPerPage);
  const startPlan = totalPlans > 0 ? (currentPage - 1) * plansPerPage + 1 : 0;
  const endPlan = Math.min(currentPage * plansPerPage, totalPlans);

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
            <PlanCardsSkeleton 
              count={6}
              title="Getting Your Medicare Advantage Quotes"
            />
          )}

          {/* Plans List */}
          {!loading && !isExternallyLoading && displayPlans.length > 0 && (
            <div className="space-y-6">
              {/* Results Header with Compare and View Controls */}
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
                    Showing {startPlan}-{endPlan} of {totalPlans} plan{totalPlans !== 1 ? 's' : ''}
                    <span className="ml-2 text-xs">
                      (Page {currentPage} of {totalPages})
                    </span>
                  </p>
                </div>

                {/* Compare Button and View Controls */}
                <div className="flex items-center gap-4">
                  {/* Compare Mode Indicator */}
                  {compareMode && (
                    <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      Select plans to compare
                    </div>
                  )}
                  
                  {/* Compare Button */}
                  <Button 
                    variant={compareMode ? "secondary" : comparePlans.length > 0 ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (compareMode) {
                        // Exit compare mode
                        setCompareMode(false);
                        if (comparePlans.length >= 2) {
                          setShowCompareDialog(true);
                        }
                      } else {
                        // Enter compare mode
                        setCompareMode(true);
                      }
                    }}
                    className="h-8"
                  >
                    <Compare className="h-4 w-4 mr-1" />
                    {compareMode ? `Done (${comparePlans.length})` : `Compare (${comparePlans.length})`}
                  </Button>

                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="px-3 py-1 text-xs h-8"
                    >
                      <List className="h-4 w-4 mr-1" />
                      List
                    </Button>
                    <Button
                      variant={viewMode === 'card' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('card')}
                      className="px-3 py-1 text-xs h-8"
                    >
                      <Grid className="h-4 w-4 mr-1" />
                      Cards
                    </Button>
                  </div>

                  {/* Column Options for List View */}
                  {viewMode === 'list' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                          <Settings className="h-4 w-4 mr-1" />
                          Columns
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Visible Columns</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {availableColumns.filter(column => !column.required).map((column) => (
                          <DropdownMenuCheckboxItem
                            key={column.id}
                            checked={visibleColumns.includes(column.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setVisibleColumns([...visibleColumns, column.id]);
                              } else {
                                setVisibleColumns(visibleColumns.filter(col => col !== column.id));
                              }
                            }}
                          >
                            {column.label}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
              
              {/* Conditional View Rendering */}
              {viewMode === 'list' ? (
                <PlanListView 
                  plans={displayPlans}
                  visibleColumns={visibleColumns}
                  expandedRows={expandedRows}
                  onRowClick={handleRowClick}
                  onCompare={handleCompare}
                  onViewDetails={handleViewDetails}
                  comparePlans={comparePlans}
                  availableColumns={availableColumns}
                  setComparePlans={setComparePlans}
                  compareMode={compareMode}
                />
              ) : (
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
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 p-4 border-t">
                  <div className="text-sm text-gray-600">
                    Showing {startPlan}-{endPlan} of {totalPlans} plans
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = index + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = index + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + index;
                        } else {
                          pageNumber = currentPage - 2 + index;
                        }
                        
                        return (
                          <Button
                            key={pageNumber}
                            variant={currentPage === pageNumber ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNumber)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNumber}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No Plans Message */}
          {!loading && !isExternallyLoading && !error && displayPlans.length === 0 && zipCode && (
            <PlanCardsSkeleton 
              count={3}
              title="No plans available in your area"
            />
          )}

          {/* Getting Started Message */}
          {!loading && !isExternallyLoading && !error && displayPlans.length === 0 && !zipCode && (
            <PlanCardsSkeleton 
              count={3}
              title="Enter your ZIP code to view plans"
            />
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
