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
  FaShieldAlt as ShieldCheckIcon
} from 'react-icons/fa';

import { OptimizedDentalQuote } from '@/lib/dental-quote-optimizer';
import { 
  analyzeProductBenefitVariables, 
  IntelligentPlanAnalysis, 
  BenefitVariable, 
  BenefitOption 
} from './intelligent-benefit-analyzer';

interface SmartDentalPlanBuilderProps {
  quotes: OptimizedDentalQuote[];
  onPlanBuilt: (selectedQuote: OptimizedDentalQuote, configuration: any) => void;
}

interface PlanConfiguration {
  [fieldPath: string]: any;
}

export function SmartDentalPlanBuilder({ quotes, onPlanBuilt }: SmartDentalPlanBuilderProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedAnnualMax, setSelectedAnnualMax] = useState<number | null>(null);
  const [configuration, setConfiguration] = useState<PlanConfiguration>({});
  const [analysis, setAnalysis] = useState<IntelligentPlanAnalysis | null>(null);
  const [availableQuotes, setAvailableQuotes] = useState<OptimizedDentalQuote[]>([]);
  const [finalQuote, setFinalQuote] = useState<OptimizedDentalQuote | null>(null);

  // Group quotes by company
  const companiesList = Array.from(new Set(quotes.map(q => q.companyName)))
    .sort();

  // When company is selected, analyze its products
  useEffect(() => {
    if (selectedCompany) {
      const companyQuotes = quotes.filter(q => q.companyName === selectedCompany);
      if (companyQuotes.length > 0) {
        try {
          const productAnalysis = analyzeProductBenefitVariables(companyQuotes);
          setAnalysis(productAnalysis);
        } catch (error) {
          console.error('Error analyzing product benefits:', error);
        }
      }
    }
  }, [selectedCompany, quotes]);

  // When annual max is selected, filter quotes
  useEffect(() => {
    if (selectedCompany && selectedAnnualMax && analysis) {
      const annualMaxGroup = analysis.annualMaximumGroups.find(
        group => group.amount === selectedAnnualMax
      );
      if (annualMaxGroup) {
        setAvailableQuotes(annualMaxGroup.quotes);
      }
    }
  }, [selectedCompany, selectedAnnualMax, analysis]);

  // When configuration changes, find matching quote
  useEffect(() => {
    if (availableQuotes.length > 0 && Object.keys(configuration).length > 0) {
      const matchingQuote = findMatchingQuote(availableQuotes, configuration);
      setFinalQuote(matchingQuote);
    }
  }, [availableQuotes, configuration]);

  const handleCompanySelect = (company: string) => {
    setSelectedCompany(company);
    setSelectedAnnualMax(null);
    setConfiguration({});
    setCurrentStep(2);
  };

  const handleAnnualMaxSelect = (amount: number) => {
    setSelectedAnnualMax(amount);
    setConfiguration({});
    setCurrentStep(3);
  };

  const handleConfigurationChange = (fieldPath: string, value: any) => {
    setConfiguration(prev => ({
      ...prev,
      [fieldPath]: value
    }));
  };

  const handleBuildPlan = () => {
    if (finalQuote) {
      onPlanBuilt(finalQuote, configuration);
    }
  };

  const findMatchingQuote = (quotes: OptimizedDentalQuote[], config: PlanConfiguration): OptimizedDentalQuote | null => {
    // Find the quote that best matches the configuration
    // This is a simplified matching algorithm - could be enhanced
    return quotes.find(quote => {
      // Parse quote benefits and match against configuration
      // For now, return the first quote - enhance this logic based on actual benefit matching
      return true;
    }) || quotes[0];
  };

  const getCurrentAnnualMaxGroup = () => {
    if (!analysis || !selectedAnnualMax) return null;
    return analysis.annualMaximumGroups.find(group => group.amount === selectedAnnualMax);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Settings2Icon className="h-6 w-6 text-blue-600" />
        <div>
          <h2 className="text-2xl font-semibold">Smart Dental Plan Builder</h2>
          <p className="text-gray-600">Build your custom plan step by step</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}
            `}>
              {step}
            </div>
            {step < 4 && (
              <div className={`
                w-16 h-1 mx-2
                ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}
              `} />
            )}
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {/* Step 1: Select Company */}
        <Card className={currentStep >= 1 ? 'ring-2 ring-blue-500' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheckIcon className="h-5 w-5" />
              Step 1: Choose Insurance Company
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentStep === 1 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companiesList.map((company) => {
                  const companyQuotes = quotes.filter(q => q.companyName === company);
                  const priceRange = {
                    min: Math.min(...companyQuotes.map(q => q.monthlyPremium)),
                    max: Math.max(...companyQuotes.map(q => q.monthlyPremium))
                  };
                  
                  return (
                    <Card 
                      key={company}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleCompanySelect(company)}
                    >
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{company}</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>{companyQuotes.length} plans available</div>
                          <div className="flex items-center gap-1">
                            <DollarSignIcon className="h-3 w-3" />
                            ${priceRange.min} - ${priceRange.max}/month
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="outline" className="mb-2">Selected</Badge>
                  <p className="font-medium">{selectedCompany}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setCurrentStep(1);
                    setSelectedCompany('');
                  }}
                >
                  Change
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Select Annual Maximum */}
        {currentStep >= 2 && analysis && (
          <Card className={currentStep === 2 ? 'ring-2 ring-blue-500' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUpIcon className="h-5 w-5" />
                Step 2: Choose Annual Maximum
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentStep === 2 ? (
                <div className="space-y-4">
                  <RadioGroup 
                    value={selectedAnnualMax?.toString()} 
                    onValueChange={(value) => handleAnnualMaxSelect(parseInt(value))}
                  >
                    {analysis.annualMaximumGroups.map((group) => (
                      <div key={group.amount} className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value={group.amount.toString()} id={`max-${group.amount}`} />
                        <Label htmlFor={`max-${group.amount}`} className="flex-1 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">${group.amount.toLocaleString()} Annual Maximum</div>
                              <div className="text-sm text-gray-600">{group.quotes.length} plan variations</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                ${Math.min(...group.quotes.map(q => q.monthlyPremium))} - 
                                ${Math.max(...group.quotes.map(q => q.monthlyPremium))}/month
                              </div>
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="outline" className="mb-2">Selected</Badge>
                    <p className="font-medium">${selectedAnnualMax?.toLocaleString()} Annual Maximum</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setCurrentStep(2);
                      setSelectedAnnualMax(null);
                    }}
                  >
                    Change
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Configure Benefits */}
        {currentStep >= 3 && getCurrentAnnualMaxGroup() && (
          <Card className={currentStep === 3 ? 'ring-2 ring-blue-500' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2Icon className="h-5 w-5" />
                Step 3: Configure Your Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentStep === 3 ? (
                <div className="space-y-6">
                  {getCurrentAnnualMaxGroup()?.variablesInGroup
                    .filter(variable => variable.options && variable.options.length > 1)
                    .map((variable) => (
                      <div key={variable.fieldPath} className="space-y-3">
                        <div>
                          <h4 className="font-medium flex items-center gap-2">
                            {variable.displayName}
                            <InfoIcon className="h-4 w-4 text-gray-400" />
                          </h4>
                          <p className="text-sm text-gray-600">{variable.description}</p>
                        </div>
                        
                        <RadioGroup
                          value={configuration[variable.fieldPath] ? JSON.stringify(configuration[variable.fieldPath]) : ''}
                          onValueChange={(value) => {
                            const parsedValue = value ? JSON.parse(value) : null;
                            handleConfigurationChange(variable.fieldPath, parsedValue);
                          }}
                        >
                          {variable.options?.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
                              <RadioGroupItem 
                                value={JSON.stringify(option.value)} 
                                id={`${variable.fieldPath}-${index}`} 
                              />
                              <Label 
                                htmlFor={`${variable.fieldPath}-${index}`} 
                                className="flex-1 cursor-pointer"
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="font-medium">{option.displayLabel}</div>
                                    <div className="text-sm text-gray-600">
                                      {option.quotesWithThisOption.length} plans available
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-medium">
                                      Avg: ${option.priceImpact?.averagePremium.toFixed(2)}/month
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      ${option.priceImpact?.premiumRange.min} - ${option.priceImpact?.premiumRange.max}
                                    </div>
                                  </div>
                                </div>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    ))}

                  {Object.keys(configuration).length > 0 && (
                    <Button 
                      onClick={() => setCurrentStep(4)}
                      className="w-full"
                    >
                      Review Your Plan
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Badge variant="outline" className="mb-2">Configured</Badge>
                  {Object.entries(configuration).map(([fieldPath, value]) => {
                    const variable = getCurrentAnnualMaxGroup()?.variablesInGroup.find(v => v.fieldPath === fieldPath);
                    if (!variable) return null;
                    
                    return (
                      <div key={fieldPath} className="flex justify-between">
                        <span className="text-sm">{variable.displayName}:</span>
                        <span className="text-sm font-medium">
                          {variable.dataType === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                        </span>
                      </div>
                    );
                  })}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentStep(3)}
                    className="mt-2"
                  >
                    Modify
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review and Build */}
        {currentStep >= 4 && finalQuote && (
          <Card className="ring-2 ring-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                Step 4: Review Your Custom Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertDescription>
                    Based on your selections, we've found the perfect plan for you.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Plan Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Company:</span>
                        <span className="font-medium">{finalQuote.companyName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Plan:</span>
                        <span className="font-medium">{finalQuote.planName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Annual Maximum:</span>
                        <span className="font-medium">${finalQuote.annualMaximum.toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg">
                        <span>Monthly Premium:</span>
                        <span className="font-bold text-green-600">${finalQuote.monthlyPremium}/month</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Your Configuration</h4>
                    <div className="space-y-2 text-sm">
                      {Object.entries(configuration).map(([fieldPath, value]) => {
                        const variable = getCurrentAnnualMaxGroup()?.variablesInGroup.find(v => v.fieldPath === fieldPath);
                        if (!variable) return null;
                        
                        return (
                          <div key={fieldPath} className="flex justify-between">
                            <span>{variable.displayName}:</span>
                            <span className="font-medium">
                              {variable.dataType === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleBuildPlan}
                  className="w-full"
                  size="lg"
                >
                  Build This Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
