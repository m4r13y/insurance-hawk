/**
 * Simplified Hospital Indemnity Plan Builder Component
 * Uses dropdown-based UI similar to Protection Series example
 */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FaArrowLeft, FaInfoCircle } from 'react-icons/fa';
import Image from 'next/image';
import { 
  FaDollarSign as DollarSignIcon, 
  FaCheckCircle as CheckCircleIcon, 
  FaHospital as HospitalIcon,
  FaStar as Star
} from 'react-icons/fa';

import { OptimizedHospitalIndemnityQuote } from '@/lib/hospital-indemnity-quote-optimizer';
import { amBestToStars } from '@/utils/amBestRating';
import { AmBestStarRating } from '@/components/ui/star-rating';
import { 
  getEnhancedCarrierInfo,
  getCarrierDisplayName as getCarrierDisplayNameFromSystem,
  getSubsidiaryName
} from '@/lib/carrier-system';
import {
  getAllBenefits,
  getMainBenefit,
  getAdditionalRiders,
  getAvailableDailyBenefits as getAvailableDailyBenefitsFromQuote,
  getMainBenefitType,
  shouldShowMainBenefitSelection,
  getPremiumForDailyBenefit,
  getAvailableRiderOptions,
  getIncludedBenefits,
  hasValidBenefitStructure,
  calculateTotalPremium as calculateTotalPremiumSimplified
} from '@/utils/simplifiedHospitalIndemnityBenefits';
import { CarrierSelectionView } from './CarrierSelectionView';

// Helper functions for carrier display
const getCachedLogoUrl = (carrierName: string, carrierId: string): string => {
  const tempQuoteForCarrierInfo = { carrier: { name: carrierName } };
  const enhancedInfo = getEnhancedCarrierInfo(tempQuoteForCarrierInfo, 'hospital-indemnity');
  return enhancedInfo.logoUrl;
};

const getCarrierDisplayName = (carrierName: string, carrierId: string): string => {
  return getCarrierDisplayNameFromSystem(carrierName, 'hospital-indemnity');
};

// Create abbreviated names for rider badges
const abbreviateRiderName = (riderName: string): string => {
  const abbreviations: { [key: string]: string } = {
    // Ambulance services
    'Ambulance Services Rider': 'Ambulance',
    'Ambulance Ben': 'Ambulance',
    'Ambulance -': 'Ambulance',
    'Ambulance': 'Ambulance',
    
    // Emergency and Urgent Care
    'ER & Urgent Care Benefit Rider': 'Emergency Care',
    'ER/Urgent Care': 'Emergency Care',
    'Emergency Room Visit due to accident or injury': 'Emergency Care',
    
    // Therapy and Medical Devices
    'OP Therapy & Medical Devices Rider': 'Therapy',
    'OP Therapy 1': 'Therapy',
    'OP Therapy 2': 'Therapy',
    'Physical Therapy Rider': 'Therapy',
    
    // Surgery
    'Outpatient Surgery Rider': 'Surgery',
    'OP Surgery': 'Surgery',
    
    // Hospital Stay
    'Hospital Confinement Benefits': 'Hospital Stay',
    'Hospital Admission': 'Hospital Stay',
    
    // Skilled Nursing
    'Skilled Nursing Facility Benefits 1': 'Skilled Nursing',
    'Skilled Nursing Facility Benefits 2': 'Skilled Nursing',
    
    // Other benefits
    'Dental, Vision & Hearing Rider': 'Dental & Vision',
    'Lump Sum Hospital Benefit': 'Lump Sum',
    'Wellness Benefit': 'Wellness'
  };

  if (abbreviations[riderName]) {
    return abbreviations[riderName];
  }

  // Apply intelligent abbreviation rules
  let abbreviated = riderName
    .replace(/\s+Rider\s*$/gi, '')
    .replace(/\s+\d+\s*$/g, '')
    .replace(/\bServices?\b/gi, '')
    .replace(/\bBenefit(s)?\b/gi, '')
    .replace(/\bOutpatient\b/gi, 'OP')
    .replace(/\bEmergency Room\b/gi, 'Emergency')
    .replace(/\bSkilled Nurse\b/gi, 'Skilled Nursing')
    .replace(/\s+/g, ' ')
    .trim();

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

interface SimplifiedHospitalIndemnityPlanBuilderProps {
  quotes: OptimizedHospitalIndemnityQuote[];
  onPlanBuilt: (config: any) => void;
}

interface RiderSelection {
  riderName: string;
  selectedOption: any;
  // For grouped riders
  isGrouped?: boolean;
  selectedVariant?: string; // The variant name (e.g., "Skilled Nursing Facility Benefits 1")
}

export function SimplifiedHospitalIndemnityPlanBuilder({ 
  quotes, 
  onPlanBuilt 
}: SimplifiedHospitalIndemnityPlanBuilderProps) {
  // URL parameter handling
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get company from URL params
  const urlCompany = searchParams.get('company');
  
  // View management
  const [currentView, setCurrentView] = useState<'carriers' | 'configuration'>(
    urlCompany ? 'configuration' : 'carriers'
  );
  
  const [selectedCompany, setSelectedCompany] = useState<string>(urlCompany || '');
  const [selectedPlanOption, setSelectedPlanOption] = useState<string>('');
  const [selectedBenefitDays, setSelectedBenefitDays] = useState<number | null>(null);
  const [selectedDailyBenefit, setSelectedDailyBenefit] = useState<number | null>(null);
  const [selectedRiders, setSelectedRiders] = useState<RiderSelection[]>([]);
  const [groupedRiderSelections, setGroupedRiderSelections] = useState<{ [key: string]: { variant: string; option: any } }>({});
  const [finalQuote, setFinalQuote] = useState<OptimizedHospitalIndemnityQuote | null>(null);

  // Effect to handle URL parameter changes
  useEffect(() => {
    const company = searchParams.get('company');
    if (company && company !== selectedCompany) {
      setSelectedCompany(company);
      setCurrentView('configuration');
      // Reset other selections when company changes
      setSelectedPlanOption('');
      setSelectedBenefitDays(null);
      setSelectedDailyBenefit(null);
      setSelectedRiders([]);
      setGroupedRiderSelections({});
      setFinalQuote(null);
    } else if (!company && selectedCompany) {
      // Company was removed from URL, go back to carriers
      setSelectedCompany('');
      setCurrentView('carriers');
      setSelectedPlanOption('');
      setSelectedBenefitDays(null);
      setSelectedDailyBenefit(null);
      setSelectedRiders([]);
      setGroupedRiderSelections({});
      setFinalQuote(null);
    }
  }, [searchParams, selectedCompany]);

  // Filter valid quotes
  const availableQuotes = useMemo(() => {
    return quotes.filter(quote => hasValidBenefitStructure(quote));
  }, [quotes]);

  // Get available companies
  const availableCompanies = useMemo(() => {
    const companies = new Map<string, OptimizedHospitalIndemnityQuote[]>();
    availableQuotes.forEach(quote => {
      const company = quote.companyFullName || quote.companyName;
      if (!companies.has(company)) {
        companies.set(company, []);
      }
      companies.get(company)!.push(quote);
    });
    return Array.from(companies.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [availableQuotes]);

  // Get quotes for selected company
  const companyQuotes = useMemo(() => {
    if (!selectedCompany) return [];
    return availableQuotes.filter(q => 
      (q.companyFullName || q.companyName) === selectedCompany
    );
  }, [availableQuotes, selectedCompany]);

  // Get available plan options (plan names)
  const availablePlanOptions = useMemo(() => {
    if (!selectedCompany) return [];
    const planNames = [...new Set(companyQuotes.map(q => q.planName))];
    return planNames.sort();
  }, [companyQuotes]);

  // Get available benefit days for selected plan
  const availableBenefitDays = useMemo(() => {
    if (!selectedPlanOption) return [];
    const filteredQuotes = companyQuotes.filter(q => q.planName === selectedPlanOption);
    const daysSet = new Set<number>();
    
    filteredQuotes.forEach(quote => {
      // Extract days from plan name
      const dayMatch = quote.planName.match(/(\d+)\s*(?:benefit\s*)?days?/i);
      if (dayMatch) {
        daysSet.add(parseInt(dayMatch[1]));
      }
    });
    
    return Array.from(daysSet).sort((a, b) => a - b);
  }, [companyQuotes, selectedPlanOption]);

  // Get available daily benefits for current selection
  const availableDailyBenefits = useMemo(() => {
    if (!selectedCompany || !selectedPlanOption) return [];
    
    let filteredQuotes = companyQuotes.filter(q => q.planName === selectedPlanOption);
    
    if (selectedBenefitDays) {
      filteredQuotes = filteredQuotes.filter(q => {
        const dayMatch = q.planName.match(/(\d+)\s*(?:benefit\s*)?days?/i);
        return dayMatch && parseInt(dayMatch[1]) === selectedBenefitDays;
      });
    }

    if (filteredQuotes.length === 0) return [];
    
    // Get all available daily benefits from the first matching quote
    const quote = filteredQuotes[0];
    return getAvailableDailyBenefitsFromQuote(quote);
  }, [companyQuotes, selectedPlanOption, selectedBenefitDays]);

  // Get current quote for configuration
  const currentQuote = useMemo(() => {
    if (!selectedCompany || !selectedPlanOption || !selectedDailyBenefit) return null;
    
    let filteredQuotes = companyQuotes.filter(q => q.planName === selectedPlanOption);
    
    if (selectedBenefitDays) {
      filteredQuotes = filteredQuotes.filter(q => {
        const dayMatch = q.planName.match(/(\d+)\s*(?:benefit\s*)?days?/i);
        return dayMatch && parseInt(dayMatch[1]) === selectedBenefitDays;
      });
    }

    if (filteredQuotes.length === 0) return null;
    
    // Find quote with matching daily benefit
    return filteredQuotes.find(q => {
      const availableBenefits = getAvailableDailyBenefitsFromQuote(q);
      return availableBenefits.includes(selectedDailyBenefit);
    }) || filteredQuotes[0];
  }, [companyQuotes, selectedPlanOption, selectedBenefitDays, selectedDailyBenefit]);

  // Get available riders for current quote
  const availableRiders = useMemo(() => {
    if (!currentQuote) return [];
    return getAvailableRiderOptions(currentQuote);
  }, [currentQuote]);

  // Get included benefits for informational display
  const includedBenefits = useMemo(() => {
    if (!currentQuote) return [];
    return getIncludedBenefits(currentQuote);
  }, [currentQuote]);

  // Get benefit type for dynamic labeling (based on company quotes)
  const benefitType = useMemo(() => {
    if (!selectedCompany || companyQuotes.length === 0) return 'daily';
    
    // Check the first available quote to determine benefit type
    const sampleQuote = companyQuotes[0];
    return getMainBenefitType(sampleQuote);
  }, [selectedCompany, companyQuotes]);

  // Get dynamic labels based on benefit type
  const benefitLabels = useMemo(() => {
    switch (benefitType) {
      case 'admission':
        return {
          label: 'Hospital Admission Benefit',
          placeholder: 'Choose admission benefit...',
          format: (amount: number) => `$${amount}/admission`
        };
      case 'daily':
      default:
        return {
          label: 'Daily Benefit Amount',
          placeholder: 'Choose daily benefit...',
          format: (amount: number) => `$${amount}/day`
        };
    }
  }, [benefitType]);

  // Determine if we should show the main benefit selection dropdown
  const showMainBenefitSelection = useMemo(() => {
    // Use currentQuote if available, otherwise use first available quote from company
    const quoteToCheck = currentQuote || (companyQuotes.length > 0 ? companyQuotes[0] : null);
    if (!quoteToCheck) return true;
    return shouldShowMainBenefitSelection(quoteToCheck);
  }, [currentQuote, companyQuotes]);

  // Auto-select daily benefit when dropdown is hidden (only one option available)
  useEffect(() => {
    if (!showMainBenefitSelection && availableDailyBenefits.length === 1 && !selectedDailyBenefit) {
      setSelectedDailyBenefit(availableDailyBenefits[0]);
    }
  }, [showMainBenefitSelection, availableDailyBenefits, selectedDailyBenefit]);

  // Calculate total premium
  const totalPremium = useMemo(() => {
    if (!currentQuote || !selectedDailyBenefit) return 0;
    
    let basePremium = getPremiumForDailyBenefit(currentQuote, selectedDailyBenefit);
    
    // Add ungrouped riders
    selectedRiders.forEach(riderSelection => {
      if (riderSelection.selectedOption) {
        basePremium += riderSelection.selectedOption.rate;
      }
    });
    
    // Add grouped riders
    Object.values(groupedRiderSelections).forEach(selection => {
      if (selection.option) {
        basePremium += selection.option.rate;
      }
    });
    
    return basePremium;
  }, [currentQuote, selectedDailyBenefit, selectedRiders, groupedRiderSelections]);

  // Reset selections when company changes
  const handleCompanyChange = (company: string) => {
    setSelectedCompany(company);
    setSelectedPlanOption('');
    setSelectedBenefitDays(null);
    setSelectedDailyBenefit(null);
    setSelectedRiders([]);
    setGroupedRiderSelections({});
    setFinalQuote(null);
  };

  // Reset subsequent selections when plan option changes
  const handlePlanOptionChange = (planOption: string) => {
    setSelectedPlanOption(planOption);
    setSelectedBenefitDays(null);
    setSelectedDailyBenefit(null);
    setSelectedRiders([]);
    setGroupedRiderSelections({});
    setFinalQuote(null);
  };

  // Handle rider selection
  const handleRiderToggle = (riderName: string, checked: boolean, selectedOption?: any) => {
    setSelectedRiders(prev => {
      if (checked && selectedOption) {
        const existing = prev.find(r => r.riderName === riderName);
        if (existing) {
          return prev.map(r => 
            r.riderName === riderName 
              ? { ...r, selectedOption }
              : r
          );
        } else {
          return [...prev, { riderName, selectedOption }];
        }
      } else {
        return prev.filter(r => r.riderName !== riderName);
      }
    });
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Get the relevant benefit option for included benefits based on current selection
  const getRelevantBenefitOption = (benefit: any, selectedDailyBenefit: number | null) => {
    if (!benefit.benefitOptions || benefit.benefitOptions.length === 0) {
      return null;
    }

    // If we have a selected daily benefit, try to find a matching option
    if (selectedDailyBenefit) {
      // For benefits that scale with the base benefit (like "25% of Base Benefit Day")
      const scaledOption = benefit.benefitOptions.find((option: any) => {
        // Look for patterns like "25% of Base Benefit Day" or similar scaling
        const amount = option.amount?.toString().toLowerCase();
        return amount?.includes('base benefit') || amount?.includes('%');
      });
      
      if (scaledOption) {
        return scaledOption;
      }

      // For fixed amount benefits, try to find one that matches our selection level
      const matchingOption = benefit.benefitOptions.find((option: any) => {
        const optionAmount = parseInt(option.amount?.toString().replace(/[^0-9]/g, '') || '0');
        return optionAmount > 0;
      });
      
      if (matchingOption) {
        return matchingOption;
      }
    }

    // Fallback: return the first option
    return benefit.benefitOptions[0];
  };

  // Group related riders (like "Skilled Nursing Facility Benefits 1" and "Skilled Nursing Facility Benefits 2")
  const groupRelatedRiders = (riders: any[]) => {
    const groupedRiders: { [key: string]: any } = {};
    const ungroupedRiders: any[] = [];

    riders.forEach(rider => {
      // Look for patterns like "Name 1", "Name 2", "Name Rider 1", "Name Rider 2"
      const match = rider.name.match(/^(.+?)\s+(?:Rider\s+)?(\d+)$/i);
      
      if (match) {
        const baseName = match[1].trim();
        const number = match[2];
        
        if (!groupedRiders[baseName]) {
          groupedRiders[baseName] = {
            baseName,
            variants: [],
            isGrouped: true
          };
        }
        
        groupedRiders[baseName].variants.push({
          ...rider,
          variantNumber: number,
          variantLabel: rider.notes || `Option ${number}`
        });
      } else {
        ungroupedRiders.push({
          ...rider,
          isGrouped: false
        });
      }
    });

    // Sort variants within each group by number
    Object.values(groupedRiders).forEach((group: any) => {
      group.variants.sort((a: any, b: any) => parseInt(a.variantNumber) - parseInt(b.variantNumber));
    });

    return {
      groupedRiders: Object.values(groupedRiders),
      ungroupedRiders
    };
  };

  // Get grouped riders for current quote
  const { groupedRiders, ungroupedRiders } = useMemo(() => {
    if (!currentQuote || availableRiders.length === 0) {
      return { groupedRiders: [], ungroupedRiders: [] };
    }
    return groupRelatedRiders(availableRiders);
  }, [currentQuote, availableRiders]);

  // Get carrier display name with fallback
  const getCarrierDisplayName = (company: string): string => {
    try {
      return getCarrierDisplayNameFromSystem(company, 'hospital-indemnity');
    } catch {
      return company;
    }
  };

  // Get cached logo URL with fallback
  const getCachedLogoUrl = (company: string): string => {
    try {
      const enhancedInfo = getEnhancedCarrierInfo(company, 'hospital-indemnity');
      return enhancedInfo.logoUrl || '/images/carrier-placeholder.svg';
    } catch {
      return '/images/carrier-placeholder.svg';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {currentView === 'carriers' ? (
        // Carrier Selection View
        <CarrierSelectionView
          quotes={quotes}
          selectedCompany={selectedCompany}
          onCompanySelect={(companyName) => {
            // Update URL with company parameter
            const params = new URLSearchParams(searchParams);
            params.set('company', companyName);
            router.push(`?${params.toString()}`);
          }}
        />
      ) : (
        // Configuration View
        <div>
          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => {
                // Remove company parameter from URL to go back to carriers
                const params = new URLSearchParams(searchParams);
                params.delete('company');
                router.push(`?${params.toString()}`);
              }}
              className="mb-4"
            >
              <FaArrowLeft className="w-4 h-4 mr-2" />
              Back to Carriers
            </Button>
            <h2 className="text-2xl font-bold">
              Configure Your {selectedCompany} Plan
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Configuration Panel */}
            <div className="lg:col-span-2">
              <Card>
            <CardContent className="space-y-6">
              {/* Plan Option Selection */}
              {selectedCompany && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Plan Option</label>
                  <Select value={selectedPlanOption} onValueChange={handlePlanOptionChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose plan type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePlanOptions.map(planName => (
                        <SelectItem key={planName} value={planName}>
                          {planName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Benefit Days Coverage (if applicable) */}
              {selectedPlanOption && availableBenefitDays.length > 1 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Benefit Days Coverage</label>
                  <Select 
                    value={selectedBenefitDays?.toString() || ''} 
                    onValueChange={(value) => setSelectedBenefitDays(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose coverage period..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBenefitDays.map(days => (
                        <SelectItem key={days} value={days.toString()}>
                          {days} days
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Benefit Amount */}
              {selectedPlanOption && availableDailyBenefits.length > 0 && showMainBenefitSelection && (
                <div>
                  <label className="text-sm font-medium mb-2 block">{benefitLabels.label}</label>
                  <Select 
                    value={selectedDailyBenefit?.toString() || ''} 
                    onValueChange={(value) => setSelectedDailyBenefit(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={benefitLabels.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDailyBenefits.map(amount => (
                        <SelectItem key={amount} value={amount.toString()}>
                          {benefitLabels.format(amount)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Included Benefits */}
              {currentQuote && includedBenefits.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium mb-2 text-gray-700">Included Benefits</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {includedBenefits.map((benefit) => {
                      const relevantOption = getRelevantBenefitOption(benefit, selectedDailyBenefit);
                      
                      return (
                        <div key={benefit.name} className="border border-green-200 rounded p-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-medium mb-2">{benefit.name}</h5>
                              {relevantOption && (
                                <div className="text-xs text-gray-700">
                                  <span className="font-bold">${relevantOption.amount}</span> {relevantOption.quantifier}
                                </div>
                              )}
                              {benefit.notes && (
                                <p className="text-xs text-gray-700 mt-1 line-clamp-2">
                                  {benefit.notes.split(/(\$\d+(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d+)?%)/g).map((part, index) => {
                                    if (part.match(/^\$\d+(?:,\d{3})*(?:\.\d{2})?$/) || part.match(/^\d+(?:\.\d+)?%$/)) {
                                      return <span key={index} className="font-bold">{part}</span>;
                                    }
                                    return part;
                                  })}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center text-green-600 ml-2 flex-shrink-0">
                              <CheckCircleIcon className="h-3 w-3" />
                              <span className="text-xs ml-1">Included</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Optional Riders */}
              {currentQuote && (groupedRiders.length > 0 || ungroupedRiders.length > 0) && (
                <div>
                  <h4 className="text-xs font-medium mb-2 text-gray-700">Optional Riders</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    
                    {/* Grouped Riders */}
                    {groupedRiders.map((group: any) => {
                      const selection = groupedRiderSelections[group.baseName];
                      const selectedVariant = selection ? group.variants.find((v: any) => v.name === selection.variant) : null;
                      
                      return (
                        <div key={group.baseName} className="border rounded p-3">
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium">{group.baseName}</h5>

                            {/* Variant Selection */}
                            <div>
                              <Select
                                value={selection?.variant || ''}
                                onValueChange={(value) => {
                                  if (value) {
                                    setGroupedRiderSelections(prev => ({
                                      ...prev,
                                      [group.baseName]: { variant: value, option: null }
                                    }));
                                  } else {
                                    setGroupedRiderSelections(prev => {
                                      const newState = { ...prev };
                                      delete newState[group.baseName];
                                      return newState;
                                    });
                                  }
                                }}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue placeholder="Choose coverage..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {group.variants.map((variant: any) => (
                                    <SelectItem key={variant.name} value={variant.name}>
                                      {variant.variantLabel}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Benefit Amount Selection */}
                            {selectedVariant && selectedVariant.benefitOptions && selectedVariant.benefitOptions.length > 0 && (
                              <div>
                                <RadioGroup
                                  value={selection?.option ? `${selection.option.amount}-${selection.option.rate}` : ''}
                                  onValueChange={(value) => {
                                    if (value) {
                                      const [amount, rate] = value.split('-');
                                      const option = selectedVariant.benefitOptions?.find(
                                        (opt: any) => opt.amount === amount && opt.rate.toString() === rate
                                      );
                                      if (option) {
                                        setGroupedRiderSelections(prev => ({
                                          ...prev,
                                          [group.baseName]: { variant: selection.variant, option }
                                        }));
                                      }
                                      }
                                    }}
                                  >
                                    <div className="space-y-2">
                                      {selectedVariant.benefitOptions.slice(0, 3).map((option: any, index: number) => (
                                        <div key={index} className="flex items-center space-x-1.5">
                                          <RadioGroupItem 
                                            value={`${option.amount}-${option.rate}`} 
                                            id={`${group.baseName}-${index}`}
                                            className="w-3 h-3"
                                          />
                                          <Label htmlFor={`${group.baseName}-${index}`} className="flex-1 cursor-pointer text-xs">
                                            <div className="flex justify-between items-center">
                                              <span>
                                                ${option.amount} {option.quantifier || 'per occurrence'}
                                              </span>
                                              <span className="font-medium text-blue-600">
                                                +{formatCurrency(option.rate)}/mo
                                              </span>
                                            </div>
                                          </Label>
                                        </div>
                                      ))}
                                    </div>
                                  </RadioGroup>
                                </div>
                              )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Ungrouped Riders */}
                    {ungroupedRiders.map((rider) => {
                      const isSelected = selectedRiders.some(r => r.riderName === rider.name);
                      const selectedConfig = selectedRiders.find(r => r.riderName === rider.name);

                      return (
                        <div key={rider.name} className="border rounded p-3">
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium">{rider.name}</h5>
                              {rider.notes && (
                                <p className="text-xs text-gray-600">{rider.notes}</p>
                              )}

                              {rider.benefitOptions && rider.benefitOptions.length > 0 && (
                                <div>
                                  <RadioGroup
                                    value={selectedConfig?.selectedOption ? 
                                      `${selectedConfig.selectedOption.amount}-${selectedConfig.selectedOption.rate}` : 
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
                                      {rider.benefitOptions.slice(0, 3).map((option: any, index: number) => (
                                        <div key={index} className="flex items-center space-x-1.5">
                                          <RadioGroupItem 
                                            value={`${option.amount}-${option.rate}`} 
                                            id={`${rider.name}-${index}`}
                                            className="w-3 h-3"
                                          />
                                          <Label htmlFor={`${rider.name}-${index}`} className="flex-1 cursor-pointer text-xs">
                                            <div className="flex justify-between items-center">
                                              <span>
                                                ${option.amount} {option.quantifier || 'per occurrence'}
                                              </span>
                                              <span className="font-medium text-blue-600">
                                                +{formatCurrency(option.rate)}/mo
                                              </span>
                                            </div>
                                          </Label>
                                        </div>
                                      ))}
                                    </div>
                                  </RadioGroup>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Plan Summary Panel */}
        <div>
          <Card>
            <CardContent className="space-y-3">
              {selectedCompany && (
                <div>
                <h3 className="text-sm font-semibold mb-2">Plan Summary</h3>
                  <h4 className="text-xs font-medium text-gray-600">Company:</h4>
                  <p className="text-sm font-medium">{getCarrierDisplayName(selectedCompany)}</p>
                </div>
              )}

              {selectedPlanOption && (
                <div>
                  <h4 className="text-xs font-medium text-gray-600">Plan:</h4>
                  <p className="text-sm font-medium">{selectedPlanOption}</p>
                </div>
              )}

              {selectedBenefitDays && (
                <div>
                  <h4 className="text-xs font-medium text-gray-600">Benefit Days:</h4>
                  <p className="text-sm font-medium">{selectedBenefitDays} days</p>
                </div>
              )}

              {selectedDailyBenefit && (
                <div>
                  <h4 className="text-xs font-medium text-gray-600">{benefitType === 'admission' ? 'Admission Benefit:' : 'Daily Benefit:'}</h4>
                  <p className="text-sm font-medium">{benefitLabels.format(selectedDailyBenefit)}</p>
                </div>
              )}

              {selectedRiders.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-600">Selected Riders:</h4>
                  <div className="space-y-1">
                    {selectedRiders.map((rider, index) => (
                      <div key={index} className="text-xs">
                        {rider.riderName}: ${rider.selectedOption.amount} 
                        (+{formatCurrency(rider.selectedOption.rate)}/mo)
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {totalPremium > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-semibold">Total Monthly:</h4>
                    <p className="text-lg font-bold text-blue-600">
                      {formatCurrency(totalPremium)}
                    </p>
                  </div>
                </>
              )}

              {currentQuote && totalPremium > 0 && (
                <Button 
                  className="w-full"
                  onClick={() => onPlanBuilt({
                    quote: currentQuote,
                    selectedDailyBenefit,
                    selectedRiders,
                    totalPremium
                  })}
                >
                  <HospitalIcon className="h-4 w-4 mr-2" />
                  Build This Plan
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
      )}
    </div>
  );
}