/**
 * Simplified Hospital Indemnity Plan Builder Component
 * Uses dropdown-based UI similar to Protection Series example
 */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
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

interface SimplifiedHospitalIndemnityPlanBuilderProps {
  quotes: OptimizedHospitalIndemnityQuote[];
  onPlanBuilt: (config: any) => void;
}

interface RiderSelection {
  riderName: string;
  selectedOption: any;
}

export function SimplifiedHospitalIndemnityPlanBuilder({ 
  quotes, 
  onPlanBuilt 
}: SimplifiedHospitalIndemnityPlanBuilderProps) {
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedPlanOption, setSelectedPlanOption] = useState<string>('');
  const [selectedBenefitDays, setSelectedBenefitDays] = useState<number | null>(null);
  const [selectedDailyBenefit, setSelectedDailyBenefit] = useState<number | null>(null);
  const [selectedRiders, setSelectedRiders] = useState<RiderSelection[]>([]);
  const [finalQuote, setFinalQuote] = useState<OptimizedHospitalIndemnityQuote | null>(null);

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
    
    selectedRiders.forEach(riderSelection => {
      if (riderSelection.selectedOption) {
        basePremium += riderSelection.selectedOption.rate;
      }
    });
    
    return basePremium;
  }, [currentQuote, selectedDailyBenefit, selectedRiders]);

  // Reset selections when company changes
  const handleCompanyChange = (company: string) => {
    setSelectedCompany(company);
    setSelectedPlanOption('');
    setSelectedBenefitDays(null);
    setSelectedDailyBenefit(null);
    setSelectedRiders([]);
    setFinalQuote(null);
  };

  // Reset subsequent selections when plan option changes
  const handlePlanOptionChange = (planOption: string) => {
    setSelectedPlanOption(planOption);
    setSelectedBenefitDays(null);
    setSelectedDailyBenefit(null);
    setSelectedRiders([]);
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Configure Your Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Company Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Select Company</label>
                <Select value={selectedCompany} onValueChange={handleCompanyChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose insurance company..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCompanies.map(([company, quotes]) => (
                      <SelectItem key={company} value={company}>
                        <div className="flex items-center gap-2">
                          <span>{getCarrierDisplayName(company)}</span>
                          <Badge variant="secondary" className="text-xs">
                            {quotes.length} options
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                  <h4 className="text-sm font-medium mb-4">Included Benefits</h4>
                  <div className="space-y-3">
                    {includedBenefits.map((benefit) => {
                      const relevantOption = getRelevantBenefitOption(benefit, selectedDailyBenefit);
                      
                      return (
                        <Card key={benefit.name} className="border border-green-200 bg-green-50/50">
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="font-medium text-green-800">{benefit.name}</h5>
                                {benefit.notes && (
                                  <p className="text-sm text-green-600 mt-1">{benefit.notes}</p>
                                )}
                                {relevantOption && (
                                  <div className="mt-2">
                                    <div className="text-sm text-green-700">
                                      ${relevantOption.amount} {relevantOption.quantifier}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center text-green-600 ml-3">
                                <CheckCircleIcon className="h-4 w-4" />
                                <span className="text-xs ml-1">Included</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Optional Riders */}
              {currentQuote && availableRiders.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-4">Optional Riders</h4>
                  <div className="space-y-4">
                    {availableRiders.map((rider) => {
                      const isSelected = selectedRiders.some(r => r.riderName === rider.name);
                      const selectedConfig = selectedRiders.find(r => r.riderName === rider.name);

                      return (
                        <Card key={rider.name} className="border">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div>
                                <h5 className="font-medium">{rider.name}</h5>
                                {rider.notes && (
                                  <p className="text-sm text-gray-600 mt-1">{rider.notes}</p>
                                )}
                              </div>

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
                                        <div key={index} className="flex items-center space-x-2">
                                          <RadioGroupItem 
                                            value={`${option.amount}-${option.rate}`} 
                                            id={`${rider.name}-${index}`}
                                          />
                                          <Label htmlFor={`${rider.name}-${index}`} className="flex-1 cursor-pointer">
                                            <div className="flex justify-between items-center">
                                              <span className="text-sm">
                                                ${option.amount} {option.quantifier || 'per occurrence'}
                                              </span>
                                              <span className="text-sm font-medium text-blue-600">
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
                          </CardContent>
                        </Card>
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
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5" />
                Plan Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedCompany && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600">Company:</h4>
                  <p className="font-medium">{getCarrierDisplayName(selectedCompany)}</p>
                </div>
              )}

              {selectedPlanOption && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600">Plan:</h4>
                  <p className="font-medium">{selectedPlanOption}</p>
                </div>
              )}

              {selectedBenefitDays && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600">Benefit Days:</h4>
                  <p className="font-medium">{selectedBenefitDays} days</p>
                </div>
              )}

              {selectedDailyBenefit && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600">{benefitType === 'admission' ? 'Admission Benefit:' : 'Daily Benefit:'}</h4>
                  <p className="font-medium">{benefitLabels.format(selectedDailyBenefit)}</p>
                </div>
              )}

              {selectedRiders.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600">Selected Riders:</h4>
                  <div className="space-y-1">
                    {selectedRiders.map((rider, index) => (
                      <div key={index} className="text-sm">
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
                    <h4 className="text-lg font-semibold">Total Monthly:</h4>
                    <p className="text-2xl font-bold text-blue-600">
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
  );
}