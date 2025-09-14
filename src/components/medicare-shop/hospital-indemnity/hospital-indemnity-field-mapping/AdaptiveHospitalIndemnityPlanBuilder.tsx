/**
 * Hospital Indemnity Adaptive Plan Builder
 * Handles real API data with comprehensive rider configuration system
 */
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { amBestToStars } from '@/utils/amBestRating';
import { AmBestStarRating } from '@/components/ui/star-rating';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { 
  FaInfoCircle as InfoIcon, 
  FaDollarSign as DollarSignIcon, 
  FaCheckCircle as CheckCircleIcon, 
  FaCog as Settings2Icon,
  FaChartLine as TrendingUpIcon,
  FaShieldAlt as ShieldCheckIcon,
  FaBrain as BrainIcon,
  FaLayerGroup as LayerIcon,
  FaCalendarAlt as CalendarIcon,
  FaHospital as HospitalIcon,
  FaStar as Star
} from 'react-icons/fa';

import { OptimizedHospitalIndemnityQuote } from '@/lib/hospital-indemnity-quote-optimizer';
import { extractBenefitDays, analyzeBenefitDayConfigurations } from './analysis-utilities';
import { 
  getEnhancedCarrierInfo,
  getCarrierDisplayName as getCarrierDisplayNameFromSystem,
  getSubsidiaryName
} from '@/lib/carrier-system';

interface AdaptiveHospitalIndemnityPlanBuilderProps {
  quotes: OptimizedHospitalIndemnityQuote[];
  onPlanBuilt: (selectedQuote: OptimizedHospitalIndemnityQuote, configuration: any) => void;
}

interface PlanConfiguration {
  benefitDays?: number;
  dailyBenefit?: number;
  selectedRiders?: RiderConfiguration[];
  totalPremium?: number;
  company?: string;
  planType?: string;
  [key: string]: any;
}

interface RiderConfiguration {
  name: string;
  selectedBenefitOption?: {
    amount: string;
    quantifier: string;
    rate: number;
  };
}

interface DayConfiguration {
  days: number;
  available: boolean;
  quoteCount: number;
  minPremium: number;
  maxPremium: number;
}

// Helper functions for carrier display
const getCachedLogoUrl = (carrierName: string, carrierId: string): string => {
  // Use the enhanced carrier info system for hospital indemnity
  const tempQuoteForCarrierInfo = { carrier: { name: carrierName } };
  const enhancedInfo = getEnhancedCarrierInfo(tempQuoteForCarrierInfo, 'hospital-indemnity');
  return enhancedInfo.logoUrl;
};

const getCarrierDisplayName = (carrierName: string, carrierId: string): string => {
  return getCarrierDisplayNameFromSystem(carrierName, 'hospital-indemnity');
};

// Convert A.M. Best rating to star rating (1-5 stars)
// REMOVED: Now using centralized utility function from @/utils/amBestRating

// Create abbreviated names for rider badges
const abbreviateRiderName = (riderName: string): string => {
  // Define comprehensive mapping for consistent badge names
  const abbreviations: { [key: string]: string } = {
    // Ambulance services - all variations map to same
    'Ambulance Services Rider': 'Ambulance',
    'Ambulance Ben': 'Ambulance',
    'Ambulance -': 'Ambulance',
    'Ambulance': 'Ambulance',
    'Ambulance Air/Ground Services': 'Ambulance',
    'Ambulance Air': 'Ambulance',
    'Ambulance Ground': 'Ambulance',
    'Ambulance Ai': 'Ambulance',
    
    // Combined Ambulance and Emergency
    'Ambulance /Emergency': 'Ambulance / ER',
    'Ambulance Emergency': 'Ambulance / ER',
    'Ambulance & Emergency': 'Ambulance / ER',
    'Ambulance and Emergency': 'Ambulance / ER',
    
    // Dental and Vision - all variations
    'Dental, Vision & Hearing Rider': 'Dental & Vision',
    'Dental and Vision': 'Dental & Vision',
    'Dental/Vision': 'Dental & Vision',
    
    // Emergency and Urgent Care
    'ER & Urgent Care Benefit Rider': 'Emergency Care',
    'ER/Urgent Care': 'Emergency Care',
    'Emergency Room Visit due to accident or injury': 'Emergency Care',
    'Emergency Care': 'Emergency Care',
    
    // Diagnostics and Exams
    'OP Dx Svcs & Wellness Rider': 'Diagnostics',
    'OP Dx Exam': 'Diagnostics',
    'OP Diagnostics': 'Diagnostics',
    'Diagnostics': 'Diagnostics',
    
    // Therapy and Medical Devices - consolidate all variations
    'OP Therapy & Medical Devices Rider': 'Therapy',
    'OP Therapy 1': 'Therapy',
    'OP Therapy 2': 'Therapy',
    'OP Therapy': 'Therapy',
    'Physical Therapy Rider': 'Therapy',
    'Therapy/Devices': 'Therapy',
    'Therapy': 'Therapy',
    
    // Surgery - all variations
    'Outpatient Surgery Rider': 'Surgery',
    'OP Surgery': 'Surgery',
    'Outpatient Surgical Benefits': 'Surgery',
    'Surgery': 'Surgery',
    
    // Hospital Stay and related
    'Hospital Confinement Benefits': 'Hospital Stay',
    'Hospital Admission': 'Hospital Stay',
    'Hospital Stay': 'Hospital Stay',
    'Intensive Care': 'Intensive Care',
    'Primary Care': 'Primary Care',
    
    // Lump Sum benefits
    'Lump Sum Hospital Confinement Rider': 'Lump Sum',
    'Lump Sum Cancer': 'Cancer Benefit',
    'Lump Sum': 'Lump Sum',
    
    // Skilled Nursing - all variations
    'Skilled Nurse & Hospice Care Facility Rider 1': 'Skilled Nursing',
    'Skilled Nurse & Hospice Care Facility Rider 2': 'Skilled Nursing',
    'Skilled Nurse w/EP & Hospice Care Facility Rider': 'Skilled Nursing',
    'Skilled Nursing': 'Skilled Nursing',
    
    // Rehabilitation
    'OP Rehabilitation': 'Rehabilitation',
    'OP Rehabilit': 'Rehabilitation',
    'Rehabilitation': 'Rehabilitation',
    
    // Wellness and Preventive
    'Wellness & Preventive Care Rider': 'Wellness',
    'Wellness': 'Wellness',
    
    // Other specific riders
    'Critical Accident': 'Critical Care',
    'Critical Care': 'Critical Care',
    'Chiropractic Services Rider': 'Chiropractic',
    'Medical Equipment Rider': 'Equipment',
    'Home Health Care Rider': 'Home Care',
    'Prescription Drug Rider': 'Prescription'
  };

  // First, check for exact match
  if (abbreviations[riderName]) {
    return abbreviations[riderName];
  }

  // Remove trailing numbers and check again (handles numbered variations)
  const baseNameWithoutNumbers = riderName.replace(/\s+\d+\s*$/, '').trim();
  if (abbreviations[baseNameWithoutNumbers]) {
    return abbreviations[baseNameWithoutNumbers];
  }

  // Remove "Rider" suffix and check
  const withoutRider = riderName.replace(/\s+Rider\s*$/, '').trim();
  if (abbreviations[withoutRider]) {
    return abbreviations[withoutRider];
  }

  // Apply intelligent abbreviation rules
  let abbreviated = riderName
    .replace(/\s+Rider\s*$/gi, '') // Remove "Rider" suffix
    .replace(/\s+\d+\s*$/g, '') // Remove trailing numbers
    .replace(/\bServices?\b/gi, '') // Remove "Service(s)"
    .replace(/\bBenefit(s)?\b/gi, '') // Remove "Benefit(s)"
    .replace(/\bOutpatient\b/gi, 'OP')
    .replace(/\bEmergency Room\b/gi, 'Emergency')
    .replace(/\bUrgent Care\b/gi, 'Urgent')
    .replace(/\bDiagnostic(s)?\b/gi, 'Diagnostics')
    .replace(/\bMedical Equipment\b/gi, 'Equipment')
    .replace(/\bSkilled Nurse\b/gi, 'Skilled Nursing')
    .replace(/\bHospice Care\b/gi, 'Hospice')
    .replace(/\bFacility\b/gi, '')
    .replace(/\bConfinement\b/gi, 'Stay')
    .replace(/\s+&\s+/g, ' & ') // Standardize ampersands
    .replace(/\s*-\s*/g, ' ') // Remove dashes
    .replace(/\s+/g, ' ') // Clean up extra spaces
    .trim();

  // Ensure reasonable length (no truncation with ...)
  if (abbreviated.length > 15) {
    const words = abbreviated.split(' ');
    if (words.length > 2) {
      abbreviated = words.slice(0, 2).join(' ');
    } else if (abbreviated.length > 15) {
      abbreviated = abbreviated.substring(0, 12);
    }
  }

  return abbreviated;
};

// StarRating component for Hospital Indemnity - REMOVED
// Now using centralized AmBestStarRating component from @/components/ui/star-rating

export function AdaptiveHospitalIndemnityPlanBuilder({ quotes, onPlanBuilt }: AdaptiveHospitalIndemnityPlanBuilderProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedBenefitDays, setSelectedBenefitDays] = useState<number | null>(null);
  const [selectedDailyBenefit, setSelectedDailyBenefit] = useState<number | null>(null);
  const [selectedRiders, setSelectedRiders] = useState<RiderConfiguration[]>([]);
  const [configuration, setConfiguration] = useState<PlanConfiguration>({});
  const [availableQuotes, setAvailableQuotes] = useState<OptimizedHospitalIndemnityQuote[]>([]);
  const [finalQuote, setFinalQuote] = useState<OptimizedHospitalIndemnityQuote | null>(null);
  const [dayConfigurations, setDayConfigurations] = useState<DayConfiguration[]>([]);

  // Group quotes by company
  const companiesList = Array.from(new Set(quotes.map(q => q.companyName)))
    .sort();

  // Analyze benefit day configurations
  useEffect(() => {
    if (quotes.length > 0) {
      const dayAnalysis = analyzeBenefitDayConfigurations(quotes.map(q => ({ plan_name: q.planName })));
      
      const dayConfigs = dayAnalysis.availableDayOptions.map(days => {
        const quotesForDays = quotes.filter(q => {
          const dayInfo = extractBenefitDays(q.planName);
          return dayInfo.days === days;
        });

        const premiums = quotesForDays.map(q => {
          return q.basePlans?.[0]?.benefitOptions?.[0]?.rate || 0;
        }).filter(rate => rate > 0);

        return {
          days,
          available: quotesForDays.length > 0,
          quoteCount: quotesForDays.length,
          minPremium: Math.min(...premiums),
          maxPremium: Math.max(...premiums)
        };
      });

      setDayConfigurations(dayConfigs);
    }
  }, [quotes]);

  // Filter quotes when company is selected
  useEffect(() => {
    if (selectedCompany) {
      const companyQuotes = quotes.filter(q => q.companyName === selectedCompany);
      setAvailableQuotes(companyQuotes);
      
      if (currentStep === 1) {
        setCurrentStep(2);
      }
    }
  }, [selectedCompany, quotes, currentStep]);

  // Update configuration when selections change
  useEffect(() => {
    const newConfig: PlanConfiguration = {
      company: selectedCompany,
      benefitDays: selectedBenefitDays ?? undefined,
      dailyBenefit: selectedDailyBenefit ?? undefined,
      selectedRiders: selectedRiders,
    };

    // Find matching quote
    if (selectedCompany && selectedBenefitDays && selectedDailyBenefit) {
      const matchingQuote = findBestMatchingQuote(availableQuotes, newConfig);
      if (matchingQuote) {
        setFinalQuote(matchingQuote);
        newConfig.totalPremium = calculateTotalPremium(matchingQuote, selectedRiders);
        
        if (currentStep < 4) {
          setCurrentStep(4);
        }
      }
    }

    setConfiguration(newConfig);
  }, [selectedCompany, selectedBenefitDays, selectedDailyBenefit, selectedRiders, availableQuotes, currentStep]);

  const handleCompanySelect = (company: string) => {
    setSelectedCompany(company);
    setSelectedBenefitDays(null);
    setSelectedDailyBenefit(null);
    setSelectedRiders([]);
    setFinalQuote(null);
  };

  const handleRiderToggle = (riderName: string, checked: boolean, selectedOption?: any) => {
    setSelectedRiders(prev => {
      if (checked) {
        // Add or update rider configuration
        const existing = prev.find(r => r.name === riderName);
        if (existing) {
          return prev.map(r => 
            r.name === riderName 
              ? { ...r, selectedBenefitOption: selectedOption }
              : r
          );
        } else {
          return [...prev, { 
            name: riderName, 
            selectedBenefitOption: selectedOption 
          }];
        }
      } else {
        // Remove rider
        return prev.filter(r => r.name !== riderName);
      }
    });
  };

  const findBestMatchingQuote = (quotes: OptimizedHospitalIndemnityQuote[], config: PlanConfiguration): OptimizedHospitalIndemnityQuote | null => {
    if (!config.benefitDays || !config.dailyBenefit) return null;

    return quotes.find(quote => {
      const dayInfo = extractBenefitDays(quote.planName);
      const hasMatchingBenefit = quote.basePlans?.some(plan => 
        plan.benefitOptions?.some(option => parseInt(option.amount) === config.dailyBenefit)
      );
      
      return dayInfo.days === config.benefitDays && hasMatchingBenefit;
    }) || null;
  };

  const calculateTotalPremium = (quote: OptimizedHospitalIndemnityQuote, riders: RiderConfiguration[]): number => {
    // Get base premium from the selected daily benefit
    const basePlan = quote.basePlans?.[0];
    const basePremium = basePlan?.benefitOptions?.find(option => 
      parseInt(option.amount) === selectedDailyBenefit
    )?.rate || 0;

    const riderPremium = riders.reduce((total, riderConfig) => {
      if (riderConfig.selectedBenefitOption) {
        return total + riderConfig.selectedBenefitOption.rate;
      }
      return total;
    }, 0);

    return basePremium + riderPremium;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const validateRiderConfiguration = (riderConfigs: RiderConfiguration[]): {
    isValid: boolean;
    warnings: string[];
  } => {
    const warnings: string[] = [];
    
    // Group riders by category for better validation
    const emergencyRiders = riderConfigs.filter(r => 
      r.name.includes('Ambulance') || r.name.includes('ER') || r.name.includes('Urgent Care')
    );
    const surgicalRiders = riderConfigs.filter(r => 
      r.name.includes('Surgery') || r.name.includes('Lump Sum')
    );
    const nursingRiders = riderConfigs.filter(r => 
      r.name.includes('Skilled Nurse')
    );

    // Check for complementary coverage recommendations
    if (emergencyRiders.length > 0 && surgicalRiders.length === 0) {
      warnings.push('Consider adding surgical coverage to complement emergency services');
    }

    if (surgicalRiders.length > 0 && emergencyRiders.length === 0) {
      warnings.push('Consider adding emergency coverage to complement surgical benefits');
    }

    // Check for skilled nursing conflicts
    if (nursingRiders.length > 1) {
      const riderNames = nursingRiders.map(r => r.name);
      warnings.push(`Multiple skilled nursing riders selected: ${riderNames.join(', ')}. Consider selecting one that best fits your needs.`);
    }

    // Check for short-term plan recommendations
    if (selectedBenefitDays && selectedBenefitDays <= 7 && riderConfigs.length > 5) {
      warnings.push('Short-term plans (7 days) may not benefit from extensive rider coverage. Consider focusing on essential riders.');
    }

    return {
      isValid: true,
      warnings
    };
  };

  const getAvailableDailyBenefits = (): number[] => {
    if (!availableQuotes.length || !selectedBenefitDays) return [];

    const dayFilteredQuotes = availableQuotes.filter(q => {
      const dayInfo = extractBenefitDays(q.planName);
      return dayInfo.days === selectedBenefitDays;
    });

    const amounts = new Set<number>();
    dayFilteredQuotes.forEach(quote => {
      quote.basePlans?.forEach(plan => {
        plan.benefitOptions?.forEach(option => {
          const amount = parseInt(option.amount);
          if (!isNaN(amount)) amounts.add(amount);
        });
      });
    });

    return Array.from(amounts).sort((a, b) => a - b);
  };

  const getAvailableRiders = (): any[] => {
    // Try to get riders from finalQuote first
    if (finalQuote && finalQuote.riders) {
      return finalQuote.riders.filter(rider => !rider.included) || [];
    }
    
    // Fallback: get riders from any quote with the selected company
    if (selectedCompany) {
      const companyQuote = availableQuotes.find(q => q.companyName === selectedCompany);
      if (companyQuote && companyQuote.riders) {
        return companyQuote.riders.filter(rider => !rider.included) || [];
      }
    }
    
    // Final fallback: get riders from the first available quote
    if (quotes.length > 0 && quotes[0].riders) {
      return quotes[0].riders.filter(rider => !rider.included) || [];
    }
    
    return [];
  };

  const categorizeRiders = (riders: any[]) => {
    const categories = {
      'Emergency Services': riders.filter(r => 
        r.name.includes('Ambulance') || r.name.includes('ER') || r.name.includes('Urgent Care')
      ),
      'Surgical & Procedures': riders.filter(r => 
        r.name.includes('Surgery') || r.name.includes('Lump Sum')
      ),
      'Skilled Nursing Care': riders.filter(r => 
        r.name.includes('Skilled Nurse')
      ),
      'Outpatient Services': riders.filter(r => 
        r.name.includes('Therapy') || r.name.includes('Dx') || r.name.includes('Wellness')
      ),
      'Additional Benefits': riders.filter(r => 
        r.name.includes('Dental') || r.name.includes('Vision') || r.name.includes('Hearing')
      )
    };

    // Remove empty categories
    return Object.fromEntries(
      Object.entries(categories).filter(([_, riders]) => riders.length > 0)
    );
  };

  return (
    <div className="max-w-7xl mt-8 mx-auto">{/* Wider container for single-page layout */}
      <Card>
        <CardContent>
          <Tabs value={selectedCompany ? "2" : "1"} onValueChange={() => {}}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="1" className="flex items-center gap-2">
                <BrainIcon className="h-4 w-4" />
                Select Company
              </TabsTrigger>
              <TabsTrigger value="2" className="flex items-center gap-2" disabled={!selectedCompany}>
                <Settings2Icon className="h-4 w-4" />
                Configure Plan
              </TabsTrigger>
            </TabsList>

            {/* Step 1: Company Selection */}
            <TabsContent value="1" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Select Insurance Company</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {companiesList.map((company) => {
                    // Get company quotes for rider analysis
                    const companyQuotes = quotes.filter(q => q.companyName === company);
                    
                    // Get unique riders from all quotes for this company
                    const allRiders = new Set<string>();
                    companyQuotes.forEach(quote => {
                      if (quote.riders) {
                        quote.riders.forEach(rider => {
                            allRiders.add(rider.name);
                          }
                        );
                      }
                    });
                    
                    // Get company rating from first quote (all quotes from same company should have same rating)
                    const companyRating = companyQuotes[0]?.ambest;
                    const starRating = companyRating ? amBestToStars(companyRating.rating) : 0;
                    
                    const displayName = getCarrierDisplayName(company, company);
                    const subsidiaryName = getSubsidiaryName(company, 'hospital-indemnity');
                    
                    return (
                      <Card 
                        key={company} 
                        className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-primary/20 ${
                          selectedCompany === company ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : 'hover:border-gray-300'
                        }`}
                        onClick={() => handleCompanySelect(company)}
                      >
                        <CardContent className="p-6">
                          {/* Carrier Header */}
                          <div className="mb-4 pb-4 border-b">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {/* Carrier Logo */}
                                <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                  <Image
                                    src={getCachedLogoUrl(company, company)}
                                    alt={`${displayName} logo`}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-contain"
                                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                      const target = e.currentTarget;
                                      const parent = target.parentElement;
                                      if (parent) {
                                        target.style.display = 'none';
                                        const initials = displayName
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
                                  <h4 className="text-xl font-bold text-primary">{displayName}</h4>
                                  <div className="flex items-center gap-2 my-1">
                                    <AmBestStarRating 
                                      amBestRating={companyRating?.rating}
                                      size="sm"
                                    />
                                  </div>
                                  {subsidiaryName && (
                                    <p className="text-sm text-muted-foreground">{subsidiaryName}</p>
                                  )}
                                </div>
                              </div>
                              {selectedCompany === company && (
                                <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                              )}
                            </div>
                          </div>
                          
                          {/* Rider Badges */}
                          {allRiders.size > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-muted-foreground">
                                Available Riders ({allRiders.size}):
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {Array.from(new Set(Array.from(allRiders).map(riderName => abbreviateRiderName(riderName)))).slice(0, 20).map((abbreviatedName, index) => (
                                  <Badge 
                                    key={`${abbreviatedName}-${index}`} 
                                    variant="outline" 
                                    className="text-xs"
                                  >
                                    {abbreviatedName}
                                  </Badge>
                                ))}
                                {allRiders.size > 20 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{allRiders.size - 20} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            {/* Step 2: All Configuration Options on One Page */}
            <TabsContent value="2" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Benefits Configuration */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-6">Configure Your Plan</h3>
                    
                    {/* Basic Plan Configuration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <h4 className="font-medium mb-2">Benefit Days Coverage</h4>
                        <Select
                          value={selectedBenefitDays?.toString() || ""}
                          onValueChange={(value) => setSelectedBenefitDays(parseInt(value))}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select benefit days coverage" />
                          </SelectTrigger>
                          <SelectContent>
                            {dayConfigurations.map((config) => (
                              <SelectItem key={config.days} value={config.days.toString()}>
                                {config.days} days
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedBenefitDays && (
                        <div>
                          <h4 className="font-medium mb-2">Daily Benefit Amount</h4>
                          <Select
                            value={selectedDailyBenefit?.toString() || ""}
                            onValueChange={(value) => setSelectedDailyBenefit(parseInt(value))}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select daily benefit amount" />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailableDailyBenefits().map((amount) => (
                                <SelectItem key={amount} value={amount.toString()}>
                                  ${amount} per day
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    {/* Riders Section */}
                    {selectedBenefitDays && selectedDailyBenefit && (
                      <div className="space-y-4">
                        <h4 className="font-medium">Optional Riders</h4>
                        
                        {(() => {
                          const validation = validateRiderConfiguration(selectedRiders);
                          return validation.warnings.length > 0 && (
                            <Alert>
                              <InfoIcon className="h-4 w-4" />
                              <AlertDescription>
                                <div className="space-y-1">
                                  {validation.warnings.map((warning, index) => (
                                    <div key={index} className="text-sm">{warning}</div>
                                  ))}
                                </div>
                              </AlertDescription>
                            </Alert>
                          );
                        })()}
                        
                        <div className="space-y-6">
                          {(() => {
                            const availableRiders = getAvailableRiders();
                            const categorizedRiders = categorizeRiders(availableRiders);
                            
                            if (availableRiders.length === 0) {
                              return (
                                <div className="text-center py-4 text-gray-500">
                                  <p>No rider options available for this configuration.</p>
                                </div>
                              );
                            }
                            
                            return Object.entries(categorizedRiders).map(([category, riders]) => (
                              <div key={category} className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <h5 className="text-sm font-semibold text-gray-900">{category}</h5>
                                  <Badge variant="secondary" className="text-xs">
                                    {riders.length} option{riders.length !== 1 ? 's' : ''}
                                  </Badge>
                                </div>
                                
                                <div className="space-y-3">
                                  {riders.map((rider: any) => {
                                    const isSelected = selectedRiders.some(r => r.name === rider.name);
                                    const selectedConfig = selectedRiders.find(r => r.name === rider.name);

                                    return (
                                      <Card key={rider.name} className={`border transition-colors ${
                                        isSelected ? 'border-blue-100 bg-blue-50' : 'border-gray-200'
                                      }`}>
                                        <CardContent className="p-3">
                                          <div className="space-y-3">
                                            {/* Rider Header */}
                                            <div className="flex items-start justify-between">
                                              <div className="flex-1">
                                                <h6 className="text-sm font-medium">{rider.name}</h6>
                                                {rider.notes && (
                                                  <p className="text-xs text-gray-600 mt-1">{rider.notes}</p>
                                                )}
                                              </div>
                                              {isSelected && selectedConfig?.selectedBenefitOption && (
                                                <div className="text-sm font-medium text-green-600">
                                                  +{formatCurrency(selectedConfig.selectedBenefitOption.rate)}/mo
                                                </div>
                                              )}
                                            </div>

                                            {/* Benefit Options */}
                                            {rider.benefitOptions && rider.benefitOptions.length > 0 && (
                                              <div>
                                                <RadioGroup
                                                  value={selectedConfig?.selectedBenefitOption ? 
                                                    `${selectedConfig.selectedBenefitOption.amount}-${selectedConfig.selectedBenefitOption.rate}` : 
                                                    ''
                                                  }
                                                  onValueChange={(value) => {
                                                    if (value) {
                                                      const [amount, rate] = value.split('-');
                                                      const option = rider.benefitOptions?.find(
                                                        (opt: any) => opt.amount === amount && opt.rate.toString() === rate
                                                      );
                                                      if (option) {
                                                        handleRiderToggle(rider.name, true, option);
                                                      }
                                                    } else {
                                                      handleRiderToggle(rider.name, false);
                                                    }
                                                  }}
                                                >
                                                  <div className="space-y-2">
                                                    {/* Group options by quantifier to reduce redundancy */}
                                                    {(() => {
                                                      // Group benefit options by their quantifier
                                                      const groupedOptions = rider.benefitOptions?.reduce((acc: any, option: any) => {
                                                        const key = option.quantifier || 'per occurrence';
                                                        if (!acc[key]) acc[key] = [];
                                                        acc[key].push(option);
                                                        return acc;
                                                      }, {}) || {};

                                                      return Object.entries(groupedOptions).map(([quantifier, options]: [string, any]) => (
                                                        <div key={quantifier}>
                                                          {Object.keys(groupedOptions).length > 1 && (
                                                            <div className="text-xs font-medium text-gray-600 mb-1">{quantifier}</div>
                                                          )}
                                                          <div className="grid grid-cols-1 gap-1">
                                                            {options.map((option: any, optIndex: number) => (
                                                              <div key={optIndex} className="flex items-center space-x-2">
                                                                <RadioGroupItem 
                                                                  value={`${option.amount}-${option.rate}`} 
                                                                  id={`${rider.name}-${quantifier}-${optIndex}`}
                                                                />
                                                                <Label 
                                                                  htmlFor={`${rider.name}-${quantifier}-${optIndex}`}
                                                                  className="flex-1 cursor-pointer text-xs"
                                                                >
                                                                  <div className="flex justify-between items-center">
                                                                    <span>${option.amount}</span>
                                                                    <span className="font-medium text-blue-600">
                                                                      +${option.rate}/mo
                                                                    </span>
                                                                  </div>
                                                                </Label>
                                                              </div>
                                                            ))}
                                                          </div>
                                                        </div>
                                                      ));
                                                    })()}
                                                  </div>
                                                </RadioGroup>
                                              </div>
                                            )}
                                          </div>
                                        </CardContent>
                                      </Card>
                                    );
                                  })}
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Plan Summary */}
                <div className="lg:col-span-1">
                  <div className="sticky top-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircleIcon className="h-5 w-5" />
                          Plan Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {finalQuote && (
                          <>
                            <div className="space-y-3">
                              <div>
                                <span className="text-sm text-gray-600">Company:</span>
                                <div className="font-medium">{finalQuote.companyName}</div>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">Plan:</span>
                                <div className="font-medium">{finalQuote.planName}</div>
                              </div>
                              {selectedBenefitDays && (
                                <div>
                                  <span className="text-sm text-gray-600">Benefit Days:</span>
                                  <div className="font-medium">{selectedBenefitDays} days</div>
                                </div>
                              )}
                              {selectedDailyBenefit && (
                                <div>
                                  <span className="text-sm text-gray-600">Daily Benefit:</span>
                                  <div className="font-medium">${selectedDailyBenefit}/day</div>
                                </div>
                              )}
                              {selectedBenefitDays && selectedDailyBenefit && (
                                <div>
                                  <span className="text-sm text-gray-600">Maximum Benefit:</span>
                                  <div className="font-medium">
                                    ${(selectedDailyBenefit || 0) * (selectedBenefitDays || 0)}
                                  </div>
                                </div>
                              )}
                            </div>

                            {selectedRiders.length > 0 && (
                              <div>
                                <h6 className="text-sm font-medium mb-2">Selected Riders:</h6>
                                <div className="space-y-1">
                                  {selectedRiders.map(riderConfig => (
                                    <div key={riderConfig.name} className="flex justify-between text-xs">
                                      <span className="text-gray-600">{riderConfig.name}</span>
                                      {riderConfig.selectedBenefitOption && (
                                        <span className="text-green-600">
                                          +{formatCurrency(riderConfig.selectedBenefitOption.rate)}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <Separator />

                            <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold">Total Monthly:</span>
                              <span className="text-lg font-bold text-blue-600">
                                {formatCurrency(configuration.totalPremium || 0)}
                              </span>
                            </div>

                            <Button 
                              onClick={() => onPlanBuilt(finalQuote, configuration)}
                              className="w-full"
                              size="sm"
                              disabled={!selectedBenefitDays || !selectedDailyBenefit}
                            >
                              <ShieldCheckIcon className="h-4 w-4 mr-2" />
                              Build This Plan
                            </Button>
                          </>
                        )}
                        
                        {selectedCompany && !finalQuote && (
                          <div className="text-center py-4 text-gray-500">
                            <HospitalIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">Select benefit options to see your plan summary</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}