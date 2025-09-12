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
  FaLayerGroup as LayerIcon
} from 'react-icons/fa';

import { OptimizedDentalQuote } from '@/lib/dental-quote-optimizer';
import { 
  analyzeProductPattern, 
  normalizeQuotes,
  ProductPattern,
  ProductPatternAnalysis,
  NormalizedQuote
} from './enhanced-pattern-analyzer';

interface AdaptiveDentalPlanBuilderProps {
  quotes: OptimizedDentalQuote[];
  onPlanBuilt: (selectedQuote: OptimizedDentalQuote, configuration: any) => void;
}

interface PlanConfiguration {
  annualMaximum?: number;
  benefitTier?: string;
  deductible?: string;
  preventiveOption?: boolean;
  disappearingDeductible?: boolean;
  [key: string]: any;
}

export function AdaptiveDentalPlanBuilder({ quotes, onPlanBuilt }: AdaptiveDentalPlanBuilderProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedAnnualMax, setSelectedAnnualMax] = useState<number | null>(null);
  const [patternAnalysis, setPatternAnalysis] = useState<ProductPatternAnalysis | null>(null);
  const [normalizedQuotes, setNormalizedQuotes] = useState<NormalizedQuote[]>([]);
  const [configuration, setConfiguration] = useState<PlanConfiguration>({});
  const [availableQuotes, setAvailableQuotes] = useState<OptimizedDentalQuote[]>([]);
  const [finalQuote, setFinalQuote] = useState<OptimizedDentalQuote | null>(null);

  // Group quotes by company
  const companiesList = Array.from(new Set(quotes.map(q => q.companyName)))
    .sort();

  // Analyze pattern when company is selected
  useEffect(() => {
    if (selectedCompany) {
      const companyQuotes = quotes.filter(q => q.companyName === selectedCompany);
      if (companyQuotes.length > 0) {
        try {
          const analysis = analyzeProductPattern(companyQuotes);
          const normalized = normalizeQuotes(companyQuotes);
          
          setPatternAnalysis(analysis);
          setNormalizedQuotes(normalized);
          setAvailableQuotes(companyQuotes);
        } catch (error) {
          console.error('Error analyzing product pattern:', error);
        }
      }
    }
  }, [selectedCompany, quotes]);

  // Find matching quote when configuration changes
  useEffect(() => {
    if (availableQuotes.length > 0 && Object.keys(configuration).length > 0) {
      const matchingQuote = findBestMatchingQuote(availableQuotes, configuration);
      setFinalQuote(matchingQuote);
      
      // For complex multi-variable pattern, only advance to step 3 when we have the key variables configured
      if (patternAnalysis?.pattern === ProductPattern.COMPLEX_MULTI_VARIABLE) {
        const hasRequiredSelections = configuration.annualMaximum && 
          (configuration.deductible || configuration.preventiveOption !== undefined || configuration.disappearingDeductible !== undefined);
        
        if (hasRequiredSelections && currentStep < 3) {
          setCurrentStep(3);
        }
      } else {
        // For other patterns, advance when we have any configuration
        if (currentStep < 3) {
          setCurrentStep(3);
        }
      }
    }
  }, [availableQuotes, configuration, patternAnalysis, currentStep]);

  const handleCompanySelect = (company: string) => {
    setSelectedCompany(company);
    setSelectedAnnualMax(null);
    setConfiguration({});
    setCurrentStep(2);
  };

  const handleConfigurationChange = (key: string, value: any) => {
    setConfiguration(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const findBestMatchingQuote = (quotes: OptimizedDentalQuote[], config: PlanConfiguration): OptimizedDentalQuote | null => {
    if (!patternAnalysis) return quotes[0];

    let candidateQuotes = [...quotes];

    // For complex multi-variable pattern, we need to match exact combinations
    if (patternAnalysis.pattern === ProductPattern.COMPLEX_MULTI_VARIABLE) {
      // Start with quotes for the selected annual maximum
      if (config.annualMaximum) {
        candidateQuotes = candidateQuotes.filter(q => q.annualMaximum === config.annualMaximum);
      }

      // Build a search pattern based on selected options
      const searchCriteria: string[] = [];
      
      if (config.deductible) {
        searchCriteria.push(config.deductible);
      }
      
      if (config.disappearingDeductible === true) {
        searchCriteria.push('disappearing');
      }
      
      if (config.preventiveOption === true) {
        searchCriteria.push('100% Preventive');
      }

      // Find quotes that match the combination of selected criteria
      if (searchCriteria.length > 0) {
        const matchingQuotes = candidateQuotes.filter(quote => {
          const searchText = `${quote.benefitNotes} ${quote.fullPlanName || ''}`.toLowerCase();
          
          // Check if this quote matches all selected criteria
          return searchCriteria.every(criteria => {
            return searchText.includes(criteria.toLowerCase());
          });
        });

        if (matchingQuotes.length > 0) {
          // Return the lowest premium quote that matches all criteria
          return matchingQuotes.reduce((best, current) => 
            current.monthlyPremium < best.monthlyPremium ? current : best
          );
        }
      }

      // If no exact match, try partial matching
      if (searchCriteria.length > 0) {
        const partialMatches = candidateQuotes.filter(quote => {
          const searchText = `${quote.benefitNotes} ${quote.fullPlanName || ''}`.toLowerCase();
          
          // Find quotes that match at least some criteria
          const matchCount = searchCriteria.reduce((count, criteria) => {
            return count + (searchText.includes(criteria.toLowerCase()) ? 1 : 0);
          }, 0);
          
          return matchCount > 0;
        });

        if (partialMatches.length > 0) {
          // Sort by match quality (more matches = better) then by price
          const sortedMatches = partialMatches.sort((a, b) => {
            const aText = `${a.benefitNotes} ${a.fullPlanName || ''}`.toLowerCase();
            const bText = `${b.benefitNotes} ${b.fullPlanName || ''}`.toLowerCase();
            
            const aMatches = searchCriteria.reduce((count, criteria) => {
              return count + (aText.includes(criteria.toLowerCase()) ? 1 : 0);
            }, 0);
            
            const bMatches = searchCriteria.reduce((count, criteria) => {
              return count + (bText.includes(criteria.toLowerCase()) ? 1 : 0);
            }, 0);
            
            if (aMatches !== bMatches) {
              return bMatches - aMatches; // More matches first
            }
            
            return a.monthlyPremium - b.monthlyPremium; // Then by price
          });
          
          return sortedMatches[0];
        }
      }
    } else {
      // Handle other patterns with existing logic
      if (config.annualMaximum) {
        candidateQuotes = candidateQuotes.filter(q => q.annualMaximum === config.annualMaximum);
      }

      if (config.benefitTier) {
        candidateQuotes = candidateQuotes.filter(q => 
          (q.fullPlanName || '').toLowerCase().includes(config.benefitTier!.toLowerCase())
        );
      }
    }

    // Fallback to lowest premium quote
    return candidateQuotes.length > 0 
      ? candidateQuotes.reduce((best, current) => 
          current.monthlyPremium < best.monthlyPremium ? current : best
        )
      : quotes[0];
  };

  const renderPatternSpecificUI = () => {
    if (!patternAnalysis || !normalizedQuotes.length) return null;

    switch (patternAnalysis.pattern) {
      case ProductPattern.SIMPLE_ANNUAL_MAX:
        return renderSimpleAnnualMaxUI();
      case ProductPattern.COMPLEX_MULTI_VARIABLE:
        return renderComplexMultiVariableUI();
      case ProductPattern.MIXED_ANNUAL_BENEFIT:
        return renderMixedAnnualBenefitUI();
      default:
        return renderFallbackUI();
    }
  };

  const renderSimpleAnnualMaxUI = () => {
    const annualMaxOptions = Array.from(new Set(availableQuotes.map(q => q.annualMaximum)))
      .sort((a, b) => a - b);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left side - Annual Maximum Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayerIcon className="h-5 w-5 text-blue-600" />
              Choose Your Coverage Level
            </CardTitle>
            <p className="text-gray-600">Select your preferred annual maximum benefit</p>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={configuration.annualMaximum?.toString()}
              onValueChange={(value) => handleConfigurationChange('annualMaximum', parseInt(value))}
            >
              <div className="space-y-3">
                {annualMaxOptions.map((annualMax) => {
                  const quotesForThisMax = availableQuotes.filter(q => q.annualMaximum === annualMax);
                  const priceRange = {
                    min: Math.min(...quotesForThisMax.map(q => q.monthlyPremium)),
                    max: Math.max(...quotesForThisMax.map(q => q.monthlyPremium))
                  };

                  return (
                    <div key={annualMax} className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value={annualMax.toString()} id={`max-${annualMax}`} />
                      <Label htmlFor={`max-${annualMax}`} className="flex-1 cursor-pointer">
                        <div className="font-medium">${annualMax.toLocaleString()} Annual Maximum</div>
                        <div className="text-sm text-gray-600">
                          {quotesForThisMax.length} plan{quotesForThisMax.length !== 1 ? 's' : ''} available
                        </div>
                      </Label>
                      <div className="text-right text-sm">
                        <div className="font-medium">
                          {priceRange.min === priceRange.max 
                            ? `$${priceRange.min}/month`
                            : `$${priceRange.min} - $${priceRange.max}/month`
                          }
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Right side - Constants and Variables */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Features Overview</CardTitle>
            <p className="text-gray-600">What stays the same vs what varies</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Constants */}
              <div>
                <h4 className="font-semibold text-green-700 mb-2">What Stays the Same</h4>
                <div className="bg-green-50 p-3 rounded-lg space-y-2">
                  {(() => {
                    // Extract common benefit details from the first quote
                    const sampleQuote = availableQuotes[0];
                    if (!sampleQuote) return (
                      <div className="text-sm">No plan details available</div>
                    );
                    
                    // Parse and clean benefit notes
                    const cleanBenefitText = sampleQuote.benefitNotes
                      .replace(/<[^>]*>/g, '') // Remove HTML tags
                      .replace(/&nbsp;/g, ' ') // Replace HTML entities
                      .replace(/\s+/g, ' ')    // Normalize whitespace
                      .trim();
                    
                    // Split into meaningful sections
                    const benefitSections = cleanBenefitText
                      .split(/(?=Lifetime Deductible|Preventive Services|Basic Services|Major Services|Orthodontic|Annual Maximum)/i)
                      .filter(section => 
                        section.trim() && 
                        !section.toLowerCase().includes('annual maximum') &&
                        !section.toLowerCase().includes('deductible')
                      )
                      .slice(0, 3);
                    
                    return benefitSections.map((section, index) => {
                      const trimmed = section.trim();
                      if (trimmed.length < 10) return null;
                      
                      // Extract title and content
                      const colonIndex = trimmed.indexOf(':');
                      const title = colonIndex > 0 && colonIndex < 30 ? trimmed.substring(0, colonIndex) : null;
                      const content = title ? trimmed.substring(colonIndex + 1).trim() : trimmed;
                      
                      return (
                        <div key={index} className="text-sm">
                          {title && (
                            <span className="font-medium text-green-800">{title}:</span>
                          )} {content.length > 100 ? content.substring(0, 100) + '...' : content}
                        </div>
                      );
                    }).filter(Boolean);
                  })()}
                </div>
              </div>

              {/* Limitations */}
              {(() => {
                const sampleQuote = availableQuotes[0];
                if (!sampleQuote?.limitationNotes) return null;
                
                return (
                  <div>
                    <h4 className="font-semibold text-orange-700 mb-2">Plan Limitations</h4>
                    <div className="bg-orange-50 p-3 rounded-lg space-y-2">
                      {sampleQuote.limitationNotes.split('\n').filter(line => line.trim()).slice(0, 3).map((line, index) => (
                        <div key={index} className="text-sm">
                          {line.trim()}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Variables */}
              <div>
                <h4 className="font-semibold text-blue-700 mb-2">What Varies by Coverage Level</h4>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-blue-200">
                          <th className="text-left p-2">Annual Max</th>
                          <th className="text-left p-2">Monthly Premium</th>
                          <th className="text-left p-2">Plan Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {annualMaxOptions.map((annualMax) => {
                          const quotesForThisMax = availableQuotes.filter(q => q.annualMaximum === annualMax);
                          const priceRange = {
                            min: Math.min(...quotesForThisMax.map(q => q.monthlyPremium)),
                            max: Math.max(...quotesForThisMax.map(q => q.monthlyPremium))
                          };

                          return (
                            <tr key={annualMax} className={`border-b border-blue-100 ${configuration.annualMaximum === annualMax ? 'bg-blue-100' : ''}`}>
                              <td className="p-2 font-medium">${annualMax.toLocaleString()}</td>
                              <td className="p-2">
                                {priceRange.min === priceRange.max 
                                  ? `$${priceRange.min}` 
                                  : `$${priceRange.min} - $${priceRange.max}`
                                }
                              </td>
                              <td className="p-2">{quotesForThisMax.length} option{quotesForThisMax.length !== 1 ? 's' : ''}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              * Simple plans have straightforward annual maximum selection
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderComplexMultiVariableUI = () => {
    // For complex multi-variable, we need to show this within a single annual max group
    if (!selectedAnnualMax) {
      // First show annual max selection
      const annualMaxOptions = Array.from(new Set(availableQuotes.map(q => q.annualMaximum)))
        .sort((a, b) => a - b);

      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left side - Annual Maximum Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayerIcon className="h-5 w-5 text-blue-600" />
                Choose Your Coverage Level First
              </CardTitle>
              <p className="text-gray-600">Select your preferred annual maximum</p>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={selectedAnnualMax?.toString()}
                onValueChange={(value) => {
                  const annualMax = parseInt(value);
                  setSelectedAnnualMax(annualMax);
                  // Note: Don't call handleConfigurationChange here for complex patterns
                  // as it auto-advances to next step. User needs to configure variables first.
                }}
              >
                <div className="space-y-3">
                  {annualMaxOptions.map((annualMax) => {
                    const quotesForThisMax = availableQuotes.filter(q => q.annualMaximum === annualMax);
                    const priceRange = {
                      min: Math.min(...quotesForThisMax.map(q => q.monthlyPremium)),
                      max: Math.max(...quotesForThisMax.map(q => q.monthlyPremium))
                    };

                    return (
                      <div key={annualMax} className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value={annualMax.toString()} id={`max-${annualMax}`} />
                        <Label htmlFor={`max-${annualMax}`} className="flex-1 cursor-pointer">
                          <div className="font-medium">${annualMax.toLocaleString()} Annual Maximum</div>
                          <div className="text-sm text-gray-600">
                            {quotesForThisMax.length} plan variations available
                          </div>
                        </Label>
                        <div className="text-right text-sm">
                          <div className="font-medium">
                            ${priceRange.min} - ${priceRange.max}/month
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Right side - Constants and Variables */}
          <Card>
            <CardHeader>
              <CardTitle>Plan Features Overview</CardTitle>
              <p className="text-gray-600">What stays the same vs what varies</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Constants */}
                <div>
                  <h4 className="font-semibold text-green-700 mb-2">What Stays the Same</h4>
                  <div className="bg-green-50 p-3 rounded-lg space-y-3">
                    {(() => {
                      // Extract common benefit details from the first quote
                      const sampleQuote = availableQuotes[0];
                      if (!sampleQuote) return (
                        <div className="text-sm">No plan details available</div>
                      );
                      
                      // Parse and clean benefit notes
                      const cleanBenefitText = sampleQuote.benefitNotes
                        .replace(/<[^>]*>/g, '') // Remove HTML tags
                        .replace(/&nbsp;/g, ' ') // Replace HTML entities
                        .replace(/\s+/g, ' ')    // Normalize whitespace
                        .trim();

                      // Extract specific benefit categories with more detailed parsing
                      const benefitCategories = [];

                      // Basic Services
                      const basicMatch = cleanBenefitText.match(/basic services[^a-z]*coinsurance levels?[^.]*(?:year 1[^.]*\.?[^.]*year 2[^.]*\.?[^.]*year 3[^.]*\.?[^.]*year 4[^.]*\.?)?/i);
                      if (basicMatch) {
                        // Parse and format the basic services text
                        let basicText = basicMatch[0].trim();
                        basicText = basicText
                          .replace(/year 1:/gi, '\n• Year 1:')
                          .replace(/year 2:/gi, '\n• Year 2:')
                          .replace(/year 3:/gi, '\n• Year 3:')
                          .replace(/year 4\+?:/gi, '\n• Year 4+:')
                          .replace(/basic services coinsurance levels?/gi, 'Coinsurance Levels');
                        
                        benefitCategories.push({
                          title: 'Basic Services',
                          content: basicText
                        });
                      }

                      // Major Services  
                      const majorMatch = cleanBenefitText.match(/major services[^a-z]*coinsurance levels?[^.]*(?:year 1[^.]*\.?[^.]*year 2[^.]*\.?)?/i);
                      if (majorMatch) {
                        let majorText = majorMatch[0].trim();
                        majorText = majorText
                          .replace(/year 1:/gi, '\n• Year 1:')
                          .replace(/year 2\+?:/gi, '\n• Year 2+:')
                          .replace(/major services coinsurance levels?/gi, 'Coinsurance Levels');
                        
                        benefitCategories.push({
                          title: 'Major Services', 
                          content: majorText
                        });
                      }

                      // Preventive Services
                      const preventiveMatch = cleanBenefitText.match(/preventive services[^.]*100%[^.]*/i);
                      if (preventiveMatch) {
                        benefitCategories.push({
                          title: 'Preventive',
                          content: preventiveMatch[0].trim().replace(/preventive services/gi, '100% covered')
                        });
                      }

                      // Vision
                      const visionMatch = cleanBenefitText.match(/vision[^a-z]*coinsurance[^$]*\$\d+[^.]*maximum[^.]*\$\d+[^.]*/i);
                      if (visionMatch) {
                        let visionText = visionMatch[0].trim();
                        visionText = visionText
                          .replace(/year 1:/gi, '\n• Year 1:')
                          .replace(/year 2:/gi, '\n• Year 2:')
                          .replace(/year 3:/gi, '\n• Year 3:')
                          .replace(/year 4\+?:/gi, '\n• Year 4+:')
                          .replace(/maximum:/gi, '\n• Maximum:')
                          .replace(/vision savings maximum/gi, '\nVision Savings Maximum');
                        
                        benefitCategories.push({
                          title: 'Vision',
                          content: visionText
                        });
                      }

                      // Hearing
                      const hearingMatch = cleanBenefitText.match(/hearing[^a-z]*coinsurance[^$]*\$\d+[^.]*maximum[^.]*\$\d+[^.]*/i);
                      if (hearingMatch) {
                        let hearingText = hearingMatch[0].trim();
                        hearingText = hearingText
                          .replace(/year 1:/gi, '\n• Year 1:')
                          .replace(/year 2:/gi, '\n• Year 2:')
                          .replace(/year 3:/gi, '\n• Year 3:')
                          .replace(/year 4\+?:/gi, '\n• Year 4+:')
                          .replace(/maximum:/gi, '\n• Maximum:')
                          .replace(/hearing savings maximum/gi, '\nHearing Savings Maximum');
                        
                        benefitCategories.push({
                          title: 'Hearing',
                          content: hearingText
                        });
                      }

                      return benefitCategories.slice(0, 4).map((benefit, index) => (
                        <div key={index} className="space-y-2">
                          <div className="font-semibold text-green-800 text-sm">{benefit.title}:</div>
                          <div className="text-gray-700 text-xs">
                            {benefit.title === 'Basic Services' ? (
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs border-collapse bg-white rounded border">
                                  <thead>
                                    <tr className="bg-gray-50 border-b">
                                      <th className="text-left py-2 px-3 font-medium text-gray-700">Year</th>
                                      <th className="text-left py-2 px-3 font-medium text-gray-700">You Pay</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="border-b border-gray-100">
                                      <td className="py-2 px-3">Year 1</td>
                                      <td className="py-2 px-3">40% (60% covered)</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                      <td className="py-2 px-3">Year 2</td>
                                      <td className="py-2 px-3">30% (70% covered)</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                      <td className="py-2 px-3">Year 3</td>
                                      <td className="py-2 px-3">20% (80% covered)</td>
                                    </tr>
                                    <tr>
                                      <td className="py-2 px-3">Year 4+</td>
                                      <td className="py-2 px-3">10% (90% covered)</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            ) : benefit.title === 'Major Services' ? (
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs border-collapse bg-white rounded border">
                                  <thead>
                                    <tr className="bg-gray-50 border-b">
                                      <th className="text-left py-2 px-3 font-medium text-gray-700">Year</th>
                                      <th className="text-left py-2 px-3 font-medium text-gray-700">You Pay</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="border-b border-gray-100">
                                      <td className="py-2 px-3">Year 1</td>
                                      <td className="py-2 px-3">100% (Not covered)</td>
                                    </tr>
                                    <tr>
                                      <td className="py-2 px-3">Year 2+</td>
                                      <td className="py-2 px-3">40% (60% covered)</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            ) : benefit.title === 'Vision' ? (
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs border-collapse bg-white rounded border">
                                  <thead>
                                    <tr className="bg-gray-50 border-b">
                                      <th className="text-left py-2 px-3 font-medium text-gray-700">Year</th>
                                      <th className="text-left py-2 px-3 font-medium text-gray-700">You Pay</th>
                                      <th className="text-left py-2 px-3 font-medium text-gray-700">Annual Max</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="border-b border-gray-100">
                                      <td className="py-2 px-3">Year 1</td>
                                      <td className="py-2 px-3">40% (60% covered)</td>
                                      <td className="py-2 px-3" rowSpan={4}>$200</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                      <td className="py-2 px-3">Year 2</td>
                                      <td className="py-2 px-3">30% (70% covered)</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                      <td className="py-2 px-3">Year 3</td>
                                      <td className="py-2 px-3">20% (80% covered)</td>
                                    </tr>
                                    <tr>
                                      <td className="py-2 px-3">Year 4+</td>
                                      <td className="py-2 px-3">10% (90% covered)</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            ) : benefit.title === 'Hearing' ? (
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs border-collapse bg-white rounded border">
                                  <thead>
                                    <tr className="bg-gray-50 border-b">
                                      <th className="text-left py-2 px-3 font-medium text-gray-700">Year</th>
                                      <th className="text-left py-2 px-3 font-medium text-gray-700">You Pay</th>
                                      <th className="text-left py-2 px-3 font-medium text-gray-700">Annual Max</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="border-b border-gray-100">
                                      <td className="py-2 px-3">Year 1</td>
                                      <td className="py-2 px-3">100% (Not covered)</td>
                                      <td className="py-2 px-3" rowSpan={4}>$500</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                      <td className="py-2 px-3">Year 2</td>
                                      <td className="py-2 px-3">30% (70% covered)</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                      <td className="py-2 px-3">Year 3</td>
                                      <td className="py-2 px-3">20% (80% covered)</td>
                                    </tr>
                                    <tr>
                                      <td className="py-2 px-3">Year 4+</td>
                                      <td className="py-2 px-3">10% (90% covered)</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            ) : benefit.title === 'Preventive' ? (
                              <div className="bg-green-100 border border-green-300 rounded p-3">
                                <div className="text-green-800 font-medium text-sm">
                                  ✓ 100% Covered - You Pay Nothing
                                </div>
                                <div className="text-green-700 text-xs mt-1">
                                  Cleanings, exams, X-rays, fluoride treatments
                                </div>
                              </div>
                            ) : (
                              <div className="pl-2 text-gray-600">
                                {benefit.content}
                              </div>
                            )}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Limitations */}
                {(() => {
                  const sampleQuote = availableQuotes[0];
                  if (!sampleQuote?.limitationNotes) return null;
                  
                  return (
                    <div>
                      <h4 className="font-semibold text-orange-700 mb-2">Plan Limitations</h4>
                      <div className="bg-orange-50 p-3 rounded-lg space-y-2">
                        {(() => {
                          // Parse and clean limitation notes
                          const cleanLimitationText = sampleQuote.limitationNotes
                            .replace(/<[^>]*>/g, '') // Remove HTML tags
                            .replace(/&nbsp;/g, ' ') // Replace HTML entities
                            .replace(/\s+/g, ' ')    // Normalize whitespace
                            .trim();
                          
                          // Extract specific limitation categories
                          const limitationCategories = [];

                          // Waiting Period
                          const waitingMatch = cleanLimitationText.match(/waiting period[^.]*(?:major services[^.]*12 month[^.]*|vision services[^.]*6 month[^.]*|hearing services[^.]*12 month[^.]*)/i);
                          if (waitingMatch) {
                            let waitingText = waitingMatch[0].trim();
                            waitingText = waitingText
                              .replace(/major services:/gi, '\n• Major Services:')
                              .replace(/vision services:/gi, '\n• Vision Services:')
                              .replace(/hearing services:/gi, '\n• Hearing Services:')
                              .replace(/\(may be waived with proof[^)]*\)/gi, '\n  (may be waived with proof of prior coverage)')
                              .replace(/\(cannot be waived\)/gi, '\n  (cannot be waived)');
                            
                            limitationCategories.push({
                              title: 'Waiting Period',
                              content: waitingText
                            });
                          }

                          // Service Limitations
                          const serviceMatch = cleanLimitationText.match(/(?:major services|vision services|hearing services)[^.]*(?:cannot be waived|may be waived with proof)[^.]*/gi);
                          if (serviceMatch && serviceMatch.length > 0) {
                            let serviceText = serviceMatch.join('. ');
                            serviceText = serviceText
                              .replace(/major services:/gi, '\n• Major Services:')
                              .replace(/vision services:/gi, '\n• Vision Services:')
                              .replace(/hearing services:/gi, '\n• Hearing Services:');
                            
                            limitationCategories.push({
                              title: 'Service Limitations', 
                              content: serviceText
                            });
                          }

                          // General Limitations
                          const generalMatch = cleanLimitationText.match(/limitations?:?\s*([^.]+\.?)/gi);
                          if (generalMatch && limitationCategories.length < 2) {
                            const cleaned = generalMatch[0].replace(/limitations?:?\s*/i, '').trim();
                            if (cleaned.length > 10) {
                              limitationCategories.push({
                                title: 'General Limitations',
                                content: cleaned
                              });
                            }
                          }

                          return limitationCategories.slice(0, 3).map((limitation, index) => (
                            <div key={index} className="space-y-2">
                              <div className="font-semibold text-orange-800 text-sm">{limitation.title}:</div>
                              <div className="text-gray-700 text-xs">
                                {limitation.title === 'Waiting Period' || limitation.title === 'Service Limitations' ? (
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-xs border-collapse bg-white rounded border">
                                      <thead>
                                        <tr className="bg-orange-50 border-b">
                                          <th className="text-left py-2 px-3 font-medium text-gray-700">Service</th>
                                          <th className="text-left py-2 px-3 font-medium text-gray-700">Waiting Period</th>
                                          <th className="text-left py-2 px-3 font-medium text-gray-700">Can Be Waived?</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr className="border-b border-gray-100">
                                          <td className="py-2 px-3 font-medium">Major Services</td>
                                          <td className="py-2 px-3">12 months</td>
                                          <td className="py-2 px-3 text-green-600">✓ With proof of coverage</td>
                                        </tr>
                                        <tr className="border-b border-gray-100">
                                          <td className="py-2 px-3 font-medium">Vision Services</td>
                                          <td className="py-2 px-3">6 months</td>
                                          <td className="py-2 px-3 text-red-600">✗ Cannot be waived</td>
                                        </tr>
                                        <tr>
                                          <td className="py-2 px-3 font-medium">Hearing Services</td>
                                          <td className="py-2 px-3">12 months</td>
                                          <td className="py-2 px-3 text-red-600">✗ Cannot be waived</td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <div className="bg-orange-50 border border-orange-200 rounded p-3">
                                    <div className="text-orange-800 text-xs">
                                      {limitation.content}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  );
                })()}

                {/* Variables */}
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">What Varies by Coverage Level</h4>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-blue-200">
                            <th className="text-left p-2">Annual Max</th>
                            <th className="text-left p-2">Monthly Premium</th>
                            <th className="text-left p-2">Configuration Options</th>
                          </tr>
                        </thead>
                        <tbody>
                          {annualMaxOptions.map((annualMax) => {
                            const quotesForThisMax = availableQuotes.filter(q => q.annualMaximum === annualMax);
                            const priceRange = {
                              min: Math.min(...quotesForThisMax.map(q => q.monthlyPremium)),
                              max: Math.max(...quotesForThisMax.map(q => q.monthlyPremium))
                            };

                            // Get unique configuration options for this annual max
                            const configOptions = Array.from(new Set(
                              quotesForThisMax.map(q => {
                                const deductibleMatch = q.benefitNotes.match(/Calendar-year Deductible: \$(\d+)/);
                                const hasDisappearing = q.benefitNotes.toLowerCase().includes('disappearing');
                                const hasPreventive = q.benefitNotes.toLowerCase().includes('preventive services 100% covered');
                                
                                let options = [];
                                if (deductibleMatch) options.push(`$${deductibleMatch[1]} deductible`);
                                if (hasDisappearing) options.push('Disappearing option');
                                if (hasPreventive) options.push('100% preventive');
                                
                                return options.length > 0 ? options.join(', ') : 'Standard';
                              })
                            ));

                            return (
                              <tr key={annualMax} className={`border-b border-blue-100 ${selectedAnnualMax === annualMax ? 'bg-blue-100' : ''}`}>
                                <td className="p-2 font-medium">${annualMax.toLocaleString()}</td>
                                <td className="p-2">
                                  {priceRange.min === priceRange.max 
                                    ? `$${priceRange.min}` 
                                    : `$${priceRange.min} - $${priceRange.max}`
                                  }
                                </td>
                                <td className="p-2">
                                  {configOptions.length > 4 
                                    ? 'Varies'
                                    : configOptions.slice(0, 4).join(' | ')
                                  }
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                * Select an annual maximum to see detailed configuration options
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Now show the variable options for the selected annual max
    const quotesForSelectedMax = availableQuotes.filter(q => q.annualMaximum === selectedAnnualMax);
    const normalizedForSelectedMax = normalizedQuotes.filter(q => q.annualMaximum === selectedAnnualMax);

    // Extract deductible options directly from benefitNotes using regex
    const deductibleOptions = Array.from(new Set(
      quotesForSelectedMax.map(q => {
        const match = q.benefitNotes.match(/Calendar-year Deductible: \$(\d+)/);
        return match ? `$${match[1]}` : null;
      }).filter((d): d is string => d !== null)
    )).sort((a, b) => {
      const aNum = parseInt(a.replace('$', ''));
      const bNum = parseInt(b.replace('$', ''));
      return aNum - bNum;
    });

    const hasPreventiveOptions = normalizedForSelectedMax.some(q => 
      q.benefitNotes.includes('100% Preventive') ||
      q.benefitNotes.includes('Preventive Services 100% covered') ||
      q.benefitNotes.includes('100% Covered') ||
      (q.fullPlanName || '').includes('100% Preventive Option')
    );

    const hasDisappearingDeductible = normalizedForSelectedMax.some(q => 
      q.normalizedBenefits.deductible.hasDisappearingFeature ||
      q.benefitNotes.includes('disappearing') || 
      (q.fullPlanName || '').includes('Disappearing')
    );

    // If deductible is selected, filter options based on what's available for that deductible
    const quotesForSelectedDeductible = configuration.deductible 
      ? quotesForSelectedMax.filter(q => 
          q.benefitNotes.includes(`Calendar-year Deductible: ${configuration.deductible}`)
        )
      : [];

    const hasDisappearingForSelectedDeductible = configuration.deductible 
      ? quotesForSelectedDeductible.some(q => 
          q.benefitNotes.includes('disappearing') || 
          (q.fullPlanName || '').includes('Disappearing')
        )
      : hasDisappearingDeductible;

    const hasPreventiveForSelectedDeductible = configuration.deductible
      ? quotesForSelectedDeductible.some(q => 
          q.benefitNotes.includes('100% Preventive') ||
          q.benefitNotes.includes('Preventive Services 100% covered') ||
          q.benefitNotes.includes('100% Covered') ||
          (q.fullPlanName || '').includes('100% Preventive Option')
        )
      : hasPreventiveOptions;

    // Calculate dynamic step numbers and determine current configuration step
    let currentStepNumber = 1;
    const deductibleStepNumber = currentStepNumber++;
    const disappearingStepNumber = hasDisappearingForSelectedDeductible ? currentStepNumber++ : null;
    const preventiveStepNumber = hasPreventiveForSelectedDeductible ? currentStepNumber++ : null;

    // Determine which step to show
    const getCurrentConfigurationStep = () => {
      if (!configuration.deductible) return 'deductible';
      if (hasDisappearingForSelectedDeductible && configuration.disappearingDeductible === undefined) return 'disappearing';
      if (hasPreventiveForSelectedDeductible && configuration.preventiveOption === undefined) return 'preventive';
      return 'complete';
    };

    const currentStep = getCurrentConfigurationStep();

    return (
      <div className="space-y-6">
        {/* Show selected annual max and progress */}
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            <div>
              <div>Selected: ${selectedAnnualMax?.toLocaleString()} Annual Maximum</div>
              <div className="text-sm text-gray-600 mt-1">
                Configuration Progress: 
                {configuration.deductible && <span className="text-green-600">✓ Deductible</span>}
                {configuration.disappearingDeductible !== undefined && <span className="text-green-600"> ✓ Disappearing Deductible</span>}
                {configuration.preventiveOption !== undefined && <span className="text-green-600"> ✓ Preventive Coverage</span>}
              </div>
              {/* Debug info - remove after testing */}
              {configuration.deductible && (
                <div className="text-xs text-blue-600 mt-1">
                  Debug: {quotesForSelectedDeductible.length} quotes for ${configuration.deductible} | 
                  Disappearing: {hasDisappearingForSelectedDeductible ? 'Yes' : 'No'} 
                  {configuration.disappearingDeductible !== undefined ? ` (Selected: ${configuration.disappearingDeductible ? 'Yes' : 'No'})` : ''} | 
                  Preventive: {hasPreventiveForSelectedDeductible ? 'Yes' : 'No'}
                  {configuration.preventiveOption !== undefined ? ` (Selected: ${configuration.preventiveOption ? 'Yes' : 'No'})` : ''}
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>

        {/* Single-step configuration with side-by-side layout */}
        {currentStep === 'deductible' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left side - Options */}
            <Card>
              <CardHeader>
                <CardTitle>{deductibleStepNumber}. Choose Your Deductible Amount</CardTitle>
                <p className="text-gray-600">Select your preferred deductible level</p>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={configuration.deductible}
                  onValueChange={(value) => handleConfigurationChange('deductible', value)}
                >
                  {deductibleOptions.map((deductible) => {
                    const quotesWithDeductible = quotesForSelectedMax.filter(q => 
                      q.benefitNotes.includes(`Calendar-year Deductible: ${deductible}`)
                    );
                    
                    if (quotesWithDeductible.length === 0) return null;

                    return (
                      <div key={deductible} className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value={deductible} id={`deductible-${deductible.replace('$', '')}`} />
                        <Label htmlFor={`deductible-${deductible.replace('$', '')}`} className="flex-1 cursor-pointer">
                          <div className="font-medium">{deductible} Annual Deductible</div>
                          <div className="text-sm text-gray-600">
                            Pay {deductible} before coverage begins
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Right side - Constants and Variables */}
            <Card>
              <CardHeader>
                <CardTitle>Plan Features by Deductible</CardTitle>
                <p className="text-gray-600">What stays the same vs what changes</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Constants */}
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">What Stays the Same</h4>
                    <div className="bg-green-50 p-3 rounded-lg space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Annual Maximum:</span> ${selectedAnnualMax.toLocaleString()}
                      </div>
                      {(() => {
                        // Extract common benefit details from the first quote
                        const sampleQuote = quotesForSelectedMax[0];
                        if (!sampleQuote) return null;
                        
                        // Parse and clean benefit notes
                        const cleanBenefitText = sampleQuote.benefitNotes
                          .replace(/<[^>]*>/g, '') // Remove HTML tags
                          .replace(/&nbsp;/g, ' ') // Replace HTML entities
                          .replace(/\s+/g, ' ')    // Normalize whitespace
                          .trim();

                        // Extract specific benefit categories with detailed parsing  
                        const benefitCategories = [];

                        // Basic Services
                        const basicMatch = cleanBenefitText.match(/basic services[^a-z]*coinsurance levels?[^.]*(?:year 1[^.]*\.?[^.]*year 2[^.]*\.?[^.]*year 3[^.]*\.?[^.]*year 4[^.]*\.?)?/i);
                        if (basicMatch) {
                          let basicText = basicMatch[0].trim();
                          basicText = basicText
                            .replace(/year 1:/gi, '\n• Year 1:')
                            .replace(/year 2:/gi, '\n• Year 2:')
                            .replace(/year 3:/gi, '\n• Year 3:')
                            .replace(/year 4\+?:/gi, '\n• Year 4+:')
                            .replace(/basic services coinsurance levels?/gi, 'Coinsurance Levels');
                          
                          benefitCategories.push({
                            title: 'Basic Services',
                            content: basicText
                          });
                        }

                        // Major Services  
                        const majorMatch = cleanBenefitText.match(/major services[^a-z]*coinsurance levels?[^.]*(?:year 1[^.]*\.?[^.]*year 2[^.]*\.?)?/i);
                        if (majorMatch) {
                          let majorText = majorMatch[0].trim();
                          majorText = majorText
                            .replace(/year 1:/gi, '\n• Year 1:')
                            .replace(/year 2\+?:/gi, '\n• Year 2+:')
                            .replace(/major services coinsurance levels?/gi, 'Coinsurance Levels');
                          
                          benefitCategories.push({
                            title: 'Major Services', 
                            content: majorText
                          });
                        }

                        // Preventive Services
                        const preventiveMatch = cleanBenefitText.match(/preventive services[^.]*100%[^.]*/i);
                        if (preventiveMatch) {
                          benefitCategories.push({
                            title: 'Preventive',
                            content: preventiveMatch[0].trim().replace(/preventive services/gi, '100% covered')
                          });
                        }

                        return benefitCategories.slice(0, 3).map((benefit, index) => (
                          <div key={index} className="space-y-2">
                            <div className="font-semibold text-green-800 text-sm">{benefit.title}:</div>
                            <div className="text-gray-700 text-xs">
                              {benefit.title === 'Basic Services' ? (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-xs border-collapse bg-white rounded border">
                                    <thead>
                                      <tr className="bg-gray-50 border-b">
                                        <th className="text-left py-2 px-3 font-medium text-gray-700">Year</th>
                                        <th className="text-left py-2 px-3 font-medium text-gray-700">You Pay</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr className="border-b border-gray-100">
                                        <td className="py-2 px-3">Year 1</td>
                                        <td className="py-2 px-3">40% (60% covered)</td>
                                      </tr>
                                      <tr className="border-b border-gray-100">
                                        <td className="py-2 px-3">Year 2</td>
                                        <td className="py-2 px-3">30% (70% covered)</td>
                                      </tr>
                                      <tr className="border-b border-gray-100">
                                        <td className="py-2 px-3">Year 3</td>
                                        <td className="py-2 px-3">20% (80% covered)</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 px-3">Year 4+</td>
                                        <td className="py-2 px-3">10% (90% covered)</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              ) : benefit.title === 'Major Services' ? (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-xs border-collapse bg-white rounded border">
                                    <thead>
                                      <tr className="bg-gray-50 border-b">
                                        <th className="text-left py-2 px-3 font-medium text-gray-700">Year</th>
                                        <th className="text-left py-2 px-3 font-medium text-gray-700">You Pay</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr className="border-b border-gray-100">
                                        <td className="py-2 px-3">Year 1</td>
                                        <td className="py-2 px-3">100% (Not covered)</td>
                                      </tr>
                                      <tr>
                                        <td className="py-2 px-3">Year 2+</td>
                                        <td className="py-2 px-3">40% (60% covered)</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              ) : benefit.title === 'Preventive' ? (
                                <div className="bg-green-100 border border-green-300 rounded p-3">
                                  <div className="text-green-800 font-medium text-sm">
                                    ✓ 100% Covered - You Pay Nothing
                                  </div>
                                  <div className="text-green-700 text-xs mt-1">
                                    Cleanings, exams, X-rays, fluoride treatments
                                  </div>
                                </div>
                              ) : (
                                <div className="pl-2 text-gray-600">
                                  {benefit.content}
                                </div>
                              )}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  {/* Limitations */}
                  {(() => {
                    const sampleQuote = quotesForSelectedMax[0];
                    if (!sampleQuote?.limitationNotes) return null;
                    
                    return (
                      <div>
                        <h4 className="font-semibold text-orange-700 mb-2">Plan Limitations</h4>
                        <div className="bg-orange-50 p-3 rounded-lg space-y-2">
                          {(() => {
                            // Parse and clean limitation notes
                            const cleanLimitationText = sampleQuote.limitationNotes
                              .replace(/<[^>]*>/g, '') // Remove HTML tags
                              .replace(/&nbsp;/g, ' ') // Replace HTML entities
                              .replace(/\s+/g, ' ')    // Normalize whitespace
                              .trim();
                            
                            // Split into meaningful limitation points
                            const limitationPoints = [];
                            
                            // Look for specific limitation patterns
                            const waitingPeriodMatch = cleanLimitationText.match(/waiting period[^.]*\.?/gi);
                            const serviceMatch = cleanLimitationText.match(/major services[^.]*\.?/gi);
                            const generalMatch = cleanLimitationText.match(/limitations?:?\s*([^.]+\.?)/gi);
                            
                            if (waitingPeriodMatch) {
                              limitationPoints.push({
                                category: 'Waiting Period',
                                text: waitingPeriodMatch[0].trim()
                              });
                            }
                            
                            if (serviceMatch) {
                              limitationPoints.push({
                                category: 'Service Limitations',
                                text: serviceMatch[0].trim()
                              });
                            }
                            
                            if (generalMatch && limitationPoints.length < 2) {
                              generalMatch.slice(0, 2).forEach(match => {
                                const cleaned = match.replace(/limitations?:?\s*/i, '').trim();
                                if (cleaned.length > 10) {
                                  limitationPoints.push({
                                    category: 'General Limitations',
                                    text: cleaned
                                  });
                                }
                              });
                            }
                            
                            // Fallback to sentence splitting if no patterns found
                            if (limitationPoints.length === 0) {
                              const sentences = cleanLimitationText
                                .split(/[.!]/)
                                .filter(sentence => sentence.trim().length > 15)
                                .slice(0, 3);
                              
                              sentences.forEach((sentence, index) => {
                                limitationPoints.push({
                                  category: index === 0 ? 'Key Limitations' : 'Additional Limitations',
                                  text: sentence.trim() + (sentence.trim().endsWith('.') ? '' : '.')
                                });
                              });
                            }
                            
                            return limitationPoints.slice(0, 3).map((limitation, index) => (
                              <div key={index} className="text-sm space-y-1">
                                <div className="font-medium text-orange-800">{limitation.category}:</div>
                                <div className="text-gray-700">
                                  • {limitation.text.length > 150 
                                      ? limitation.text.substring(0, 150) + '...' 
                                      : limitation.text
                                    }
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Variables */}
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-2">What Changes by Deductible</h4>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-blue-200">
                              <th className="text-left p-2">Deductible</th>
                              <th className="text-left p-2">Monthly Premium</th>
                              <th className="text-left p-2">Plan Options</th>
                            </tr>
                          </thead>
                          <tbody>
                            {deductibleOptions.map((deductible) => {
                              const quotesWithDeductible = quotesForSelectedMax.filter(q => 
                                q.benefitNotes.includes(`Calendar-year Deductible: ${deductible}`)
                              );
                              
                              if (quotesWithDeductible.length === 0) return null;
                              
                              const priceRange = {
                                min: Math.min(...quotesWithDeductible.map(q => q.monthlyPremium)),
                                max: Math.max(...quotesWithDeductible.map(q => q.monthlyPremium))
                              };

                              // Get unique plan variations for this deductible
                              const planVariations = Array.from(new Set(
                                quotesWithDeductible.map(q => {
                                  const hasDisappearing = q.benefitNotes.toLowerCase().includes('disappearing');
                                  const hasPreventive = q.benefitNotes.toLowerCase().includes('preventive services 100% covered');
                                  return `${hasDisappearing ? 'Disappearing' : 'Standard'}${hasPreventive ? ' + 100% Preventive' : ''}`;
                                })
                              ));

                              return (
                                <tr key={deductible} className={`border-b border-blue-100 ${configuration.deductible === deductible ? 'bg-blue-100' : ''}`}>
                                  <td className="p-2 font-medium">{deductible}</td>
                                  <td className="p-2">
                                    {priceRange.min === priceRange.max 
                                      ? `$${priceRange.min}` 
                                      : `$${priceRange.min} - $${priceRange.max}`
                                    }
                                  </td>
                                  <td className="p-2">
                                    {planVariations.length > 4 
                                      ? 'Varies'
                                      : planVariations.join(', ')
                                    }
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  * Select a deductible to see additional configuration options
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Disappearing Deductible Step */}
        {currentStep === 'disappearing' && (
          <div className="space-y-4">
            {/* Back button */}
            <div className="flex justify-start">
              <Button 
                variant="outline" 
                onClick={() => {
                  // Reset to company selection (Step 1)
                  setCurrentStep(1);
                  setSelectedCompany('');
                  setSelectedAnnualMax(null);
                  setPatternAnalysis(null);
                  setConfiguration({});
                  setFinalQuote(null);
                  setAvailableQuotes([]);
                  setNormalizedQuotes([]);
                }}
                className="text-sm"
              >
                ← Change Deductible
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left side - Options */}
            <Card>
              <CardHeader>
                <CardTitle>{disappearingStepNumber}. Disappearing Deductible Feature</CardTitle>
                <p className="text-gray-600">Choose if you want the disappearing deductible feature</p>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={configuration.disappearingDeductible?.toString() || ''}
                  onValueChange={(value) => handleConfigurationChange('disappearingDeductible', value === 'true')}
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="false" id="disappearing-no" />
                    <Label htmlFor="disappearing-no" className="flex-1 cursor-pointer">
                      <div className="font-medium">Standard Deductible</div>
                      <div className="text-sm text-gray-600">
                        Fixed {configuration.deductible} deductible each year
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="true" id="disappearing-yes" />
                    <Label htmlFor="disappearing-yes" className="flex-1 cursor-pointer">
                      <div className="font-medium">Disappearing Deductible</div>
                      <div className="text-sm text-gray-600">
                        Deductible reduces by 1/3 each year automatically
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Right side - Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle>Disappearing Deductible Comparison</CardTitle>
                <p className="text-gray-600">Compare standard vs disappearing deductible</p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Option</th>
                        <th className="text-left p-2">Monthly Premium</th>
                        <th className="text-left p-2">Year 1 Deductible</th>
                        <th className="text-left p-2">Year 2 Deductible</th>
                        <th className="text-left p-2">Year 3+ Deductible</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[false, true].map((hasDisappearing) => {
                        const matchingQuotes = quotesForSelectedDeductible.filter(q => {
                          const searchText = q.benefitNotes.toLowerCase();
                          const quotesHasDisappearing = searchText.includes('disappearing');
                          return hasDisappearing ? quotesHasDisappearing : !quotesHasDisappearing;
                        });

                        if (matchingQuotes.length === 0) return null;

                        const priceRange = {
                          min: Math.min(...matchingQuotes.map(q => q.monthlyPremium)),
                          max: Math.max(...matchingQuotes.map(q => q.monthlyPremium))
                        };

                        const deductibleAmount = parseInt((configuration.deductible || '$0').replace('$', ''));
                        const year1Deductible = deductibleAmount;
                        const year2Deductible = hasDisappearing ? Math.round(deductibleAmount * 2/3) : deductibleAmount;
                        const year3Deductible = hasDisappearing ? Math.round(deductibleAmount * 1/3) : deductibleAmount;

                        return (
                          <tr key={hasDisappearing.toString()} className={`border-b hover:bg-gray-50 ${configuration.disappearingDeductible === hasDisappearing ? 'bg-blue-50 border-blue-200' : ''}`}>
                            <td className="p-2 font-medium">{hasDisappearing ? 'Disappearing' : 'Standard'}</td>
                            <td className="p-2">${priceRange.min} - ${priceRange.max}</td>
                            <td className="p-2">${year1Deductible}</td>
                            <td className="p-2">${year2Deductible}</td>
                            <td className="p-2">${year3Deductible}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  * Disappearing deductible reduces by 1/3 each year (rounded)
                </div>
              </CardContent>
            </Card>
          </div>
            </div>
        )}

        {/* Preventive Coverage Step */}
        {currentStep === 'preventive' && (
          <div className="space-y-4">
            {/* Back button */}
            <div className="flex justify-start">
              <Button 
                variant="outline" 
                onClick={() => {
                  // Check if we should go back to company selection or just previous step
                  if (!hasDisappearingForSelectedDeductible) {
                    // No disappearing step, go back to company selection (Step 1)
                    setCurrentStep(1);
                    setSelectedCompany('');
                    setSelectedAnnualMax(null);
                    setPatternAnalysis(null);
                    setConfiguration({});
                    setFinalQuote(null);
                    setAvailableQuotes([]);
                    setNormalizedQuotes([]);
                  } else {
                    // Has disappearing step, just go back to that step
                    setConfiguration(prev => {
                      const newConfig = { ...prev };
                      delete newConfig.preventiveOption;
                      return newConfig;
                    });
                  }
                }}
                className="text-sm"
              >
                ← Back
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left side - Options */}
            <Card>
              <CardHeader>
                <CardTitle>{preventiveStepNumber}. Preventive Services Coverage</CardTitle>
                <p className="text-gray-600">Choose your preventive care coverage level</p>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={configuration.preventiveOption?.toString() || ''}
                  onValueChange={(value) => handleConfigurationChange('preventiveOption', value === 'true')}
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="false" id="preventive-standard" />
                    <Label htmlFor="preventive-standard" className="flex-1 cursor-pointer">
                      <div className="font-medium">Standard Preventive Coverage</div>
                      <div className="text-sm text-gray-600">
                        Preventive services follow regular coinsurance schedule
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="true" id="preventive-100" />
                    <Label htmlFor="preventive-100" className="flex-1 cursor-pointer">
                      <div className="font-medium">100% Preventive Coverage</div>
                      <div className="text-sm text-gray-600">
                        Preventive services covered at 100% with no deductible
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Right side - Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle>Preventive Coverage Comparison</CardTitle>
                <p className="text-gray-600">Compare standard vs 100% preventive coverage</p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Option</th>
                        <th className="text-left p-2">Monthly Premium</th>
                        <th className="text-left p-2">Cleanings</th>
                        <th className="text-left p-2">Exams</th>
                        <th className="text-left p-2">X-rays</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[false, true].map((hasPreventive) => {
                        const matchingQuotes = quotesForSelectedMax.filter(quote => {
                          const searchText = `${quote.benefitNotes} ${quote.fullPlanName || ''}`.toLowerCase();
                          
                          // Must match current configuration
                          if (configuration.deductible && !searchText.includes(`calendar-year deductible: ${configuration.deductible.toLowerCase()}`)) {
                            return false;
                          }
                          
                          if (configuration.disappearingDeductible !== undefined) {
                            const hasDisappearing = searchText.includes('disappearing');
                            if (configuration.disappearingDeductible !== hasDisappearing) {
                              return false;
                            }
                          }
                          
                          // Filter by preventive option
                          const quoteHasPreventive = searchText.includes('preventive services 100% covered') || 
                                                   searchText.includes('100% preventive');
                          return hasPreventive ? quoteHasPreventive : !quoteHasPreventive;
                        });

                        if (matchingQuotes.length === 0) return null;

                        const priceRange = {
                          min: Math.min(...matchingQuotes.map(q => q.monthlyPremium)),
                          max: Math.max(...matchingQuotes.map(q => q.monthlyPremium))
                        };

                        return (
                          <tr key={hasPreventive.toString()} className={`border-b hover:bg-gray-50 ${configuration.preventiveOption === hasPreventive ? 'bg-blue-50 border-blue-200' : ''}`}>
                            <td className="p-2 font-medium">{hasPreventive ? '100% Preventive' : 'Standard'}</td>
                            <td className="p-2">${priceRange.min} - ${priceRange.max}</td>
                            <td className="p-2">{hasPreventive ? '100%' : 'Varies'}</td>
                            <td className="p-2">{hasPreventive ? '100%' : 'Varies'}</td>
                            <td className="p-2">{hasPreventive ? '100%' : 'Varies'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  * 100% preventive means no deductible or coinsurance for cleanings, exams, and basic x-rays
                </div>
              </CardContent>
            </Card>
          </div>
            </div>
        )}

        {/* Real-time matching counter - only show when configuration is complete */}
        {currentStep === 'complete' && (
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              {(() => {
                const matchingQuotes = quotesForSelectedMax.filter(quote => {
                  const searchText = `${quote.benefitNotes} ${quote.fullPlanName || ''}`.toLowerCase();
                  
                  // Must match deductible
                  if (configuration.deductible && !searchText.includes(`calendar-year deductible: ${configuration.deductible.toLowerCase()}`)) {
                    return false;
                  }
                  
                  // Handle disappearing deductible selection
                  if (configuration.disappearingDeductible !== undefined) {
                    const hasDisappearing = searchText.includes('disappearing');
                    if (configuration.disappearingDeductible === true && !hasDisappearing) {
                      return false;
                    }
                    if (configuration.disappearingDeductible === false && hasDisappearing) {
                      return false;
                    }
                  }
                  
                  // Handle preventive option selection
                  if (configuration.preventiveOption !== undefined) {
                    const hasPreventive = searchText.includes('preventive services 100% covered') || 
                                         searchText.includes('100% preventive');
                    if (configuration.preventiveOption === true && !hasPreventive) {
                      return false;
                    }
                    if (configuration.preventiveOption === false && hasPreventive) {
                      return false;
                    }
                  }
                  
                  return true;
                });
                
                const priceRange = matchingQuotes.length > 0 ? {
                  min: Math.min(...matchingQuotes.map(q => q.monthlyPremium)),
                  max: Math.max(...matchingQuotes.map(q => q.monthlyPremium))
                } : null;
                
                return matchingQuotes.length > 0 
                  ? `Configuration complete! ${matchingQuotes.length} plan${matchingQuotes.length !== 1 ? 's' : ''} match your selections ($${priceRange?.min} - $${priceRange?.max}/month)`
                  : 'No plans match all selected criteria - we\'ll show you the closest option';
              })()}
            </AlertDescription>
          </Alert>
        )}

        {/* Continue Button - only show when configuration is complete */}
        {currentStep === 'complete' && (
          <div className="flex justify-end">
            <Button 
              onClick={() => {
                handleConfigurationChange('annualMaximum', selectedAnnualMax);
                setCurrentStep(3);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {(() => {
                const matchingQuotes = quotesForSelectedMax.filter(quote => {
                  const searchText = `${quote.benefitNotes} ${quote.fullPlanName || ''}`.toLowerCase();
                  
                  // Must match deductible
                  if (configuration.deductible && !searchText.includes(`calendar-year deductible: ${configuration.deductible.toLowerCase()}`)) {
                    return false;
                  }
                  
                  // Handle disappearing deductible selection
                  if (configuration.disappearingDeductible !== undefined) {
                    const hasDisappearing = searchText.includes('disappearing');
                    if (configuration.disappearingDeductible === true && !hasDisappearing) {
                      return false;
                    }
                    if (configuration.disappearingDeductible === false && hasDisappearing) {
                      return false;
                    }
                  }
                  
                  // Handle preventive option selection
                  if (configuration.preventiveOption !== undefined) {
                    const hasPreventive = searchText.includes('preventive services 100% covered') || 
                                         searchText.includes('100% preventive');
                    if (configuration.preventiveOption === true && !hasPreventive) {
                      return false;
                    }
                    if (configuration.preventiveOption === false && hasPreventive) {
                      return false;
                    }
                  }
                  
                  return true;
                });
                
                return `Continue to Review ${matchingQuotes.length} Plan${matchingQuotes.length !== 1 ? 's' : ''}`;
              })()}
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderMixedAnnualBenefitUI = () => {
    const annualMaxOptions = Array.from(new Set(availableQuotes.map(q => q.annualMaximum)))
      .sort((a, b) => a - b);
    
    const benefitTiers = Array.from(new Set(
      normalizedQuotes.map(q => q.benefitTier).filter(Boolean)
    ));

    return (
      <div className="space-y-6">
        {/* Annual Maximum Selection with side-by-side layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left side - Annual Maximum Options */}
          <Card>
            <CardHeader>
              <CardTitle>1. Choose Coverage Level</CardTitle>
              <p className="text-gray-600">Select your preferred annual maximum</p>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={configuration.annualMaximum?.toString()}
                onValueChange={(value) => handleConfigurationChange('annualMaximum', parseInt(value))}
              >
                <div className="space-y-3">
                  {annualMaxOptions.map((annualMax) => {
                    const quotesForThisMax = availableQuotes.filter(q => q.annualMaximum === annualMax);
                    const priceRange = {
                      min: Math.min(...quotesForThisMax.map(q => q.monthlyPremium)),
                      max: Math.max(...quotesForThisMax.map(q => q.monthlyPremium))
                    };

                    return (
                      <div key={annualMax} className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value={annualMax.toString()} id={`max-${annualMax}`} />
                        <Label htmlFor={`max-${annualMax}`} className="flex-1 cursor-pointer">
                          <div className="font-medium">${annualMax.toLocaleString()} Annual Maximum</div>
                          <div className="text-sm text-gray-600">
                            {quotesForThisMax.length} plan{quotesForThisMax.length !== 1 ? 's' : ''} available
                          </div>
                        </Label>
                        <div className="text-right text-sm">
                          <div className="font-medium">
                            {priceRange.min === priceRange.max 
                              ? `$${priceRange.min}/month`
                              : `$${priceRange.min} - $${priceRange.max}/month`
                            }
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Right side - Constants and Variables */}
          <Card>
            <CardHeader>
              <CardTitle>Plan Features Overview</CardTitle>
              <p className="text-gray-600">What stays the same vs what varies</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Constants */}
                <div>
                  <h4 className="font-semibold text-green-700 mb-2">What Stays the Same</h4>
                  <div className="bg-green-50 p-3 rounded-lg space-y-2">
                    {(() => {
                      // Extract common benefit details from the first quote
                      const sampleQuote = availableQuotes[0];
                      if (!sampleQuote) return (
                        <div className="text-sm">No plan details available</div>
                      );
                      
                      // Parse and clean benefit notes
                      const cleanBenefitText = sampleQuote.benefitNotes
                        .replace(/<[^>]*>/g, '') // Remove HTML tags
                        .replace(/&nbsp;/g, ' ') // Replace HTML entities
                        .replace(/\s+/g, ' ')    // Normalize whitespace
                        .trim();
                      
                      // Split into service categories for better organization
                      const serviceCategories = [
                        { pattern: /basic services[^:]*/i, title: 'Basic Services' },
                        { pattern: /major services[^:]*/i, title: 'Major Services' },
                        { pattern: /orthodontic[^:]*/i, title: 'Orthodontic' },
                        { pattern: /preventive[^:]*/i, title: 'Preventive' }
                      ];
                      
                      const organizedBenefits: Array<{title: string; content: string}> = [];
                      
                      // Extract specific service information
                      serviceCategories.forEach(category => {
                        const match = cleanBenefitText.match(category.pattern);
                        if (match) {
                          const text = match[0].trim();
                          if (text.length > 10) {
                            organizedBenefits.push({
                              title: category.title,
                              content: text
                            });
                          }
                        }
                      });
                      
                      // If no specific categories found, split by colon patterns
                      if (organizedBenefits.length === 0) {
                        const sections = cleanBenefitText
                          .split(/(?=\w+\s*:)/g)
                          .filter(section => 
                            section.trim() && 
                            section.length > 15 &&
                            !section.toLowerCase().includes('annual maximum') &&
                            !section.toLowerCase().includes('tier') &&
                            !section.toLowerCase().includes('benefit level')
                          )
                          .slice(0, 3);
                        
                        sections.forEach(section => {
                          const colonIndex = section.indexOf(':');
                          if (colonIndex > 0 && colonIndex < 40) {
                            organizedBenefits.push({
                              title: section.substring(0, colonIndex).trim(),
                              content: section.substring(colonIndex + 1).trim()
                            });
                          } else {
                            organizedBenefits.push({
                              title: 'Coverage Details',
                              content: section.trim()
                            });
                          }
                        });
                      }
                      
                      return organizedBenefits.slice(0, 3).map((benefit, index) => (
                        <div key={index} className="text-sm space-y-1">
                          <div className="font-medium text-green-800">{benefit.title}:</div>
                          <div className="text-gray-700 leading-relaxed">
                            {benefit.content.length > 200 
                              ? benefit.content.substring(0, 200) + '...' 
                              : benefit.content
                            }
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Limitations */}
                {(() => {
                  const sampleQuote = availableQuotes[0];
                  if (!sampleQuote?.limitationNotes) return null;
                  
                  return (
                    <div>
                      <h4 className="font-semibold text-orange-700 mb-2">Plan Limitations</h4>
                      <div className="bg-orange-50 p-3 rounded-lg space-y-2">
                        {(() => {
                          // Parse and clean limitation notes
                          const cleanLimitationText = sampleQuote.limitationNotes
                            .replace(/<[^>]*>/g, '') // Remove HTML tags
                            .replace(/&nbsp;/g, ' ') // Replace HTML entities
                            .replace(/\s+/g, ' ')    // Normalize whitespace
                            .trim();
                          
                          // Split into meaningful bullet points
                          const limitationPoints = cleanLimitationText
                            .split(/[•·]|\d+\./)
                            .map(point => point.trim())
                            .filter(point => point.length > 10 && !point.toLowerCase().includes('benefit level'))
                            .slice(0, 3);
                          
                          return limitationPoints.map((point, index) => (
                            <div key={index} className="text-sm">
                              • {point.length > 80 ? point.substring(0, 80) + '...' : point}
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  );
                })()}

                {/* Variables */}
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">What Varies by Selection</h4>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-blue-200">
                            <th className="text-left p-2">Annual Max</th>
                            <th className="text-left p-2">Monthly Premium</th>
                            <th className="text-left p-2">Benefit Options</th>
                          </tr>
                        </thead>
                        <tbody>
                          {annualMaxOptions.map((annualMax) => {
                            const quotesForThisMax = availableQuotes.filter(q => q.annualMaximum === annualMax);
                            const priceRange = {
                              min: Math.min(...quotesForThisMax.map(q => q.monthlyPremium)),
                              max: Math.max(...quotesForThisMax.map(q => q.monthlyPremium))
                            };

                            // Get unique benefit tiers for this annual max
                            const tiersForMax = Array.from(new Set(
                              quotesForThisMax.map(q => {
                                const normalized = normalizedQuotes.find(n => n.monthlyPremium === q.monthlyPremium);
                                return normalized?.benefitTier;
                              }).filter(Boolean)
                            ));

                            return (
                              <tr key={annualMax} className={`border-b border-blue-100 ${configuration.annualMaximum === annualMax ? 'bg-blue-100' : ''}`}>
                                <td className="p-2 font-medium">${annualMax.toLocaleString()}</td>
                                <td className="p-2">
                                  {priceRange.min === priceRange.max 
                                    ? `$${priceRange.min}` 
                                    : `$${priceRange.min} - $${priceRange.max}`
                                  }
                                </td>
                                <td className="p-2">
                                  {tiersForMax.length > 4 
                                    ? 'Varies'
                                    : tiersForMax.join(', ')
                                  }
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                * Mixed plans have both annual maximum and benefit tier selections
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Benefit Tier Selection - only show if multiple tiers exist and annual max is selected */}
        {benefitTiers.length > 1 && configuration.annualMaximum && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left side - Benefit Tier Options */}
            <Card>
              <CardHeader>
                <CardTitle>2. Choose Benefit Level</CardTitle>
                <p className="text-gray-600">Select your preferred benefit tier</p>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={configuration.benefitTier}
                  onValueChange={(value) => handleConfigurationChange('benefitTier', value)}
                >
                  <div className="space-y-3">
                    {benefitTiers.map((tier) => {
                      if (!tier) return null;
                      
                      const tierQuotes = normalizedQuotes.filter(q => 
                        q.benefitTier === tier && 
                        q.annualMaximum === configuration.annualMaximum
                      );
                      
                      if (tierQuotes.length === 0) return null;
                      
                      const priceRange = {
                        min: Math.min(...tierQuotes.map(q => q.monthlyPremium)),
                        max: Math.max(...tierQuotes.map(q => q.monthlyPremium))
                      };

                      return (
                        <div key={tier} className="flex items-center space-x-2 p-3 border rounded-lg">
                          <RadioGroupItem value={tier} id={`tier-${tier}`} />
                          <Label htmlFor={`tier-${tier}`} className="flex-1 cursor-pointer">
                            <div className="font-medium">{tier} Plan</div>
                            <div className="text-sm text-gray-600">
                              {tierQuotes.length} option{tierQuotes.length !== 1 ? 's' : ''} available
                            </div>
                          </Label>
                          <div className="text-right text-sm">
                            <div className="font-medium">
                              {priceRange.min === priceRange.max 
                                ? `$${priceRange.min}/month`
                                : `$${priceRange.min} - $${priceRange.max}/month`
                              }
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Right side - Benefit Tier Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Benefit Tier Comparison</CardTitle>
                <p className="text-gray-600">Compare benefit levels</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Constants */}
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">What Stays the Same</h4>
                    <div className="bg-green-50 p-3 rounded-lg space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Annual Maximum:</span> ${configuration.annualMaximum?.toLocaleString()}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Network Access:</span> Same provider network
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Coverage Areas:</span> All service categories covered
                      </div>
                    </div>
                  </div>

                  {/* Variables */}
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-2">What Changes by Tier</h4>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-blue-200">
                              <th className="text-left p-2">Tier</th>
                              <th className="text-left p-2">Monthly Premium</th>
                              <th className="text-left p-2">Coverage Level</th>
                            </tr>
                          </thead>
                          <tbody>
                            {benefitTiers.map((tier) => {
                              if (!tier) return null;
                              
                              const tierQuotes = normalizedQuotes.filter(q => 
                                q.benefitTier === tier && 
                                q.annualMaximum === configuration.annualMaximum
                              );
                              
                              if (tierQuotes.length === 0) return null;
                              
                              const priceRange = {
                                min: Math.min(...tierQuotes.map(q => q.monthlyPremium)),
                                max: Math.max(...tierQuotes.map(q => q.monthlyPremium))
                              };

                              return (
                                <tr key={tier} className={`border-b border-blue-100 ${configuration.benefitTier === tier ? 'bg-blue-100' : ''}`}>
                                  <td className="p-2 font-medium">{tier}</td>
                                  <td className="p-2">
                                    {priceRange.min === priceRange.max 
                                      ? `$${priceRange.min}` 
                                      : `$${priceRange.min} - $${priceRange.max}`
                                    }
                                  </td>
                                  <td className="p-2">
                                    {tier === 'Standard' ? 'Basic coverage' : 
                                     tier === 'Enhanced' ? 'Better benefits' : 
                                     tier === 'Premium' ? 'Highest benefits' : 'Varies'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  };

  const renderFallbackUI = () => {
    const annualMaxOptions = Array.from(new Set(availableQuotes.map(q => q.annualMaximum)))
      .sort((a, b) => a - b);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left side - Plan Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <InfoIcon className="h-5 w-5 text-orange-600" />
              Available Plan Options
            </CardTitle>
            <p className="text-gray-600">This product has a unique structure - review all options</p>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={configuration.annualMaximum?.toString()}
              onValueChange={(value) => handleConfigurationChange('annualMaximum', parseInt(value))}
            >
              <div className="space-y-3">
                {annualMaxOptions.map((annualMax) => {
                  const quotesForThisMax = availableQuotes.filter(q => q.annualMaximum === annualMax);
                  const priceRange = {
                    min: Math.min(...quotesForThisMax.map(q => q.monthlyPremium)),
                    max: Math.max(...quotesForThisMax.map(q => q.monthlyPremium))
                  };

                  return (
                    <div key={annualMax} className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value={annualMax.toString()} id={`fallback-max-${annualMax}`} />
                      <Label htmlFor={`fallback-max-${annualMax}`} className="flex-1 cursor-pointer">
                        <div className="font-medium">${annualMax.toLocaleString()} Annual Maximum</div>
                        <div className="text-sm text-gray-600">
                          {quotesForThisMax.length} unique plan{quotesForThisMax.length !== 1 ? 's' : ''} available
                        </div>
                      </Label>
                      <div className="text-right text-sm">
                        <div className="font-medium">
                          {priceRange.min === priceRange.max 
                            ? `$${priceRange.min}/month`
                            : `$${priceRange.min} - $${priceRange.max}/month`
                          }
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Right side - Plan Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Structure Analysis</CardTitle>
            <p className="text-gray-600">What we know about these plans</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Constants */}
              <div>
                <h4 className="font-semibold text-green-700 mb-2">What Stays the Same</h4>
                <div className="bg-green-50 p-3 rounded-lg space-y-2">
                  {(() => {
                    // Extract common benefit details from the first quote
                    const sampleQuote = availableQuotes[0];
                    if (!sampleQuote) return (
                      <div className="text-sm">No plan details available</div>
                    );
                    
                    // Parse and clean benefit notes
                    const cleanBenefitText = sampleQuote.benefitNotes
                      .replace(/<[^>]*>/g, '') // Remove HTML tags
                      .replace(/&nbsp;/g, ' ') // Replace HTML entities
                      .replace(/\s+/g, ' ')    // Normalize whitespace
                      .trim();
                    
                    // Split into meaningful sections
                    const benefitSections = cleanBenefitText
                      .split(/(?=Lifetime Deductible|Preventive Services|Basic Services|Major Services|Orthodontic|Annual Maximum)/i)
                      .filter(section => 
                        section.trim() && 
                        !section.toLowerCase().includes('annual maximum') &&
                        !section.toLowerCase().includes('tier') &&
                        !section.toLowerCase().includes('benefit level')
                      )
                      .slice(0, 3);
                    
                    return benefitSections.map((section, index) => {
                      const trimmed = section.trim();
                      if (trimmed.length < 10) return null;
                      
                      // Extract title and content
                      const colonIndex = trimmed.indexOf(':');
                      const title = colonIndex > 0 && colonIndex < 30 ? trimmed.substring(0, colonIndex) : null;
                      const content = title ? trimmed.substring(colonIndex + 1).trim() : trimmed;
                      
                      return (
                        <div key={index} className="text-sm">
                          {title && (
                            <span className="font-medium text-green-800">{title}:</span>
                          )} {content.length > 100 ? content.substring(0, 100) + '...' : content}
                        </div>
                      );
                    }).filter(Boolean);
                  })()}
                </div>
              </div>

              {/* Limitations */}
              {(() => {
                const sampleQuote = availableQuotes[0];
                if (!sampleQuote?.limitationNotes) return null;
                
                return (
                  <div>
                    <h4 className="font-semibold text-orange-700 mb-2">Plan Limitations</h4>
                    <div className="bg-orange-50 p-3 rounded-lg space-y-2">
                      {(() => {
                        // Parse and clean limitation notes
                        const cleanLimitationText = sampleQuote.limitationNotes
                          .replace(/<[^>]*>/g, '') // Remove HTML tags
                          .replace(/&nbsp;/g, ' ') // Replace HTML entities
                          .replace(/\s+/g, ' ')    // Normalize whitespace
                          .trim();
                        
                        // Split into meaningful bullet points
                        const limitationPoints = cleanLimitationText
                          .split(/[•·]|\d+\./)
                          .map(point => point.trim())
                          .filter(point => point.length > 10 && !point.toLowerCase().includes('benefit level'))
                          .slice(0, 3);
                        
                        return limitationPoints.map((point, index) => (
                          <div key={index} className="text-sm">
                            • {point.length > 80 ? point.substring(0, 80) + '...' : point}
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                );
              })()}

              {/* Variables */}
              <div>
                <h4 className="font-semibold text-orange-700 mb-2">Plan Variations</h4>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-orange-200">
                          <th className="text-left p-2">Annual Max</th>
                          <th className="text-left p-2">Monthly Premium</th>
                          <th className="text-left p-2">Variations</th>
                        </tr>
                      </thead>
                      <tbody>
                        {annualMaxOptions.map((annualMax) => {
                          const quotesForThisMax = availableQuotes.filter(q => q.annualMaximum === annualMax);
                          const priceRange = {
                            min: Math.min(...quotesForThisMax.map(q => q.monthlyPremium)),
                            max: Math.max(...quotesForThisMax.map(q => q.monthlyPremium))
                          };

                          // Try to identify unique features
                          const features = Array.from(new Set(
                            quotesForThisMax.map(q => {
                              const notes = q.benefitNotes.toLowerCase();
                              const features = [];
                              if (notes.includes('deductible')) features.push('Deductible options');
                              if (notes.includes('preventive')) features.push('Preventive coverage');
                              if (notes.includes('orthodontic')) features.push('Orthodontic');
                              if (notes.includes('waiting')) features.push('Waiting periods');
                              return features.join(', ') || 'Standard features';
                            })
                          ));

                          return (
                            <tr key={annualMax} className={`border-b border-orange-100 ${configuration.annualMaximum === annualMax ? 'bg-orange-100' : ''}`}>
                              <td className="p-2 font-medium">${annualMax.toLocaleString()}</td>
                              <td className="p-2">
                                {priceRange.min === priceRange.max 
                                  ? `$${priceRange.min}` 
                                  : `$${priceRange.min} - $${priceRange.max}`
                                }
                              </td>
                              <td className="p-2">
                                {features.length > 4 ? 'Varies' : features.slice(0, 2).join(' | ')}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Alert */}
              <Alert className="border-orange-200 bg-orange-50">
                <InfoIcon className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  This product has a unique structure that doesn't fit standard patterns. 
                  All available options are shown for manual review.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <BrainIcon className="h-6 w-6 text-purple-600" />
        <div>
          <h2 className="text-2xl font-semibold">Adaptive Dental Plan Builder</h2>
          <p className="text-gray-600">Intelligently adapts to each carrier's unique plan structure</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${currentStep >= step ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}
            `}>
              {step}
            </div>
            {step < 3 && (
              <div className={`
                w-16 h-1 mx-2
                ${currentStep > step ? 'bg-purple-600' : 'bg-gray-200'}
              `} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Company Selection */}
      <Card className={currentStep >= 1 ? 'ring-2 ring-purple-500' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5" />
            Step 1: Choose Insurance Company
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 1 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {patternAnalysis && (
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {patternAnalysis.pattern.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {patternAnalysis.recommendedUIFlow} flow
                    </Badge>
                  </div>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setCurrentStep(1);
                  setSelectedCompany('');
                  setSelectedAnnualMax(null);
                  setPatternAnalysis(null);
                  setConfiguration({});
                  setFinalQuote(null);
                  setAvailableQuotes([]);
                  setNormalizedQuotes([]);
                }}
              >
                Change
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Pattern-Specific Configuration */}
      {currentStep >= 2 && patternAnalysis && (
        <Card className={currentStep === 2 ? 'ring-2 ring-purple-500' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2Icon className="h-5 w-5" />
              Step 2: Configure Your Plan
              <Badge variant="outline" className="ml-2">
                {patternAnalysis.pattern.replace('_', ' ')} Pattern
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentStep === 2 ? (
              <div>
                {renderPatternSpecificUI()}
                {Object.keys(configuration).length > 0 && (
                  <Button 
                    onClick={() => setCurrentStep(3)}
                    className="w-full mt-6"
                  >
                    Review Your Selection
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Badge variant="outline" className="mb-2">Configured</Badge>
                {Object.entries(configuration).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                    <span className="font-medium">
                      {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                    </span>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentStep(2)}
                  className="mt-2"
                >
                  Modify
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Final Review */}
      {currentStep >= 3 && finalQuote && (
        <Card className="ring-2 ring-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              Step 3: Review Your Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  Based on your selections, we found the perfect plan match.
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
                      <span className="font-medium">{finalQuote.fullPlanName}</span>
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
                    {Object.entries(configuration).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="font-medium">
                          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => onPlanBuilt(finalQuote, configuration)}
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
  );
}
