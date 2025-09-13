/**
 * Hospital Indemnity Adaptive Plan Builder
 * Handles real API data with comprehensive rider configuration system
 */
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
  FaHospital as HospitalIcon
} from 'react-icons/fa';

import { OptimizedHospitalIndemnityQuote } from '@/lib/hospital-indemnity-quote-optimizer';
import { extractBenefitDays, analyzeBenefitDayConfigurations } from './analysis-utilities';

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
                <div className="grid gap-3">
                  {companiesList.map((company) => (
                    <Card 
                      key={company} 
                      className={`cursor-pointer transition-colors ${
                        selectedCompany === company ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
                      }`}
                      onClick={() => handleCompanySelect(company)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{company}</h4>
                            <p className="text-sm text-gray-600">
                              {quotes.filter(q => q.companyName === company).length} plan options
                            </p>
                          </div>
                          {selectedCompany === company && (
                            <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Step 2: All Configuration Options on One Page */}
            <TabsContent value="2" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Benefits Configuration */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Configure Your Plan</h3>
                    
                    {/* Benefit Days Selection */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Benefit Days Coverage</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {dayConfigurations.map((config) => (
                          <Card 
                            key={config.days}
                            className={`cursor-pointer transition-colors ${
                              selectedBenefitDays === config.days ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedBenefitDays(config.days)}
                          >
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl font-bold">{config.days}</div>
                              <div className="text-sm text-gray-600">days</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {formatCurrency(config.minPremium)} - {formatCurrency(config.maxPremium)}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Daily Benefit Amount Selection */}
                    {selectedBenefitDays && (
                      <div className="space-y-4">
                        <h4 className="font-medium">Daily Benefit Amount</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {getAvailableDailyBenefits().map((amount) => (
                            <Card 
                              key={amount}
                              className={`cursor-pointer transition-colors ${
                                selectedDailyBenefit === amount ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
                              }`}
                              onClick={() => setSelectedDailyBenefit(amount)}
                            >
                              <CardContent className="p-4 text-center">
                                <div className="text-lg font-bold">${amount}</div>
                                <div className="text-xs text-gray-600">per day</div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

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
                                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
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
                                                  <div className="grid gap-1">
                                                    {rider.benefitOptions.map((option: any, optIndex: number) => (
                                                      <div key={optIndex} className="flex items-center space-x-2">
                                                        <RadioGroupItem 
                                                          value={`${option.amount}-${option.rate}`} 
                                                          id={`${rider.name}-${optIndex}`}
                                                        />
                                                        <Label 
                                                          htmlFor={`${rider.name}-${optIndex}`}
                                                          className="flex-1 cursor-pointer text-xs"
                                                        >
                                                          <div className="flex justify-between items-center">
                                                            <span>${option.amount} {option.quantifier || 'per occurrence'}</span>
                                                            <span className="font-medium text-blue-600">
                                                              +${option.rate}/mo
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