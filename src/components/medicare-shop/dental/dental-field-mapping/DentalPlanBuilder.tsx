import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ChevronDownIcon, 
  ChevronRightIcon, 
  LayersIcon, 
  CheckIcon,
  Cross2Icon 
} from "@radix-ui/react-icons";
import { OptimizedDentalQuote } from '@/lib/dental-quote-optimizer';
import { getProductVariationAnalysis } from './utils';

interface DentalPlanBuilderProps {
  quotes: OptimizedDentalQuote[];
  onPlanSelect?: (quote: OptimizedDentalQuote) => void;
}

export default function DentalPlanBuilder({ quotes, onPlanSelect }: DentalPlanBuilderProps) {
  const [selectedProductKey, setSelectedProductKey] = useState<string>('');
  const [selectedAnnualMax, setSelectedAnnualMax] = useState<number | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<OptimizedDentalQuote | null>(null);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

  // Get product variation analysis
  const analysisData = getProductVariationAnalysis(quotes);

  // Group quotes by product key and annual maximum
  const groupedData = useMemo(() => {
    const groups = new Map<string, Map<number, OptimizedDentalQuote[]>>();

    quotes.forEach(quote => {
      if (!groups.has(quote.productKey)) {
        groups.set(quote.productKey, new Map());
      }
      
      const productGroup = groups.get(quote.productKey)!;
      if (!productGroup.has(quote.annualMaximum)) {
        productGroup.set(quote.annualMaximum, []);
      }
      
      productGroup.get(quote.annualMaximum)!.push(quote);
    });

    return groups;
  }, [quotes]);

  // Get available annual maximums for selected product
  const availableAnnualMaximums = useMemo(() => {
    if (!selectedProductKey || !groupedData.has(selectedProductKey)) {
      return [];
    }
    
    return Array.from(groupedData.get(selectedProductKey)!.keys()).sort((a, b) => a - b);
  }, [selectedProductKey, groupedData]);

  // Get available quotes for selected product and annual maximum
  const availableQuotes = useMemo(() => {
    if (!selectedProductKey || selectedAnnualMax === null || !groupedData.has(selectedProductKey)) {
      return [];
    }
    
    const productGroup = groupedData.get(selectedProductKey)!;
    return productGroup.get(selectedAnnualMax) || [];
  }, [selectedProductKey, selectedAnnualMax, groupedData]);

  const toggleProductExpansion = (productKey: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productKey)) {
      newExpanded.delete(productKey);
    } else {
      newExpanded.add(productKey);
    }
    setExpandedProducts(newExpanded);
  };

  const handleProductSelect = (productKey: string) => {
    setSelectedProductKey(productKey);
    setSelectedAnnualMax(null);
    setSelectedQuote(null);
    
    // Auto-expand the selected product
    const newExpanded = new Set(expandedProducts);
    newExpanded.add(productKey);
    setExpandedProducts(newExpanded);
  };

  const handleAnnualMaxSelect = (annualMax: string) => {
    const numValue = parseInt(annualMax);
    setSelectedAnnualMax(numValue);
    setSelectedQuote(null);
  };

  const handleQuoteSelect = (quoteId: string) => {
    const quote = availableQuotes.find(q => q.id === quoteId);
    if (quote) {
      setSelectedQuote(quote);
      if (onPlanSelect) {
        onPlanSelect(quote);
      }
    }
  };

  const resetBuilder = () => {
    setSelectedProductKey('');
    setSelectedAnnualMax(null);
    setSelectedQuote(null);
    setExpandedProducts(new Set());
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayersIcon className="h-5 w-5" />
            <CardTitle>Dental Plan Builder</CardTitle>
          </div>
          {selectedQuote && (
            <Button variant="outline" onClick={resetBuilder}>
              Start Over
            </Button>
          )}
        </div>
        <p className="text-sm text-gray-600">
          Build your plan by selecting carrier, coverage level, and specific options
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Step 1: Product Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              selectedProductKey ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
            }`}>
              1
            </div>
            <h3 className="text-lg font-semibold">Choose Your Insurance Carrier</h3>
          </div>

          <div className="space-y-2">
            {analysisData.map((analysis) => (
              <div key={analysis.productKey} className="border rounded-lg">
                <div 
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedProductKey === analysis.productKey ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => handleProductSelect(analysis.productKey)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedProductKey === analysis.productKey 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'border-gray-300'
                      }`}>
                        {selectedProductKey === analysis.productKey && (
                          <CheckIcon className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{analysis.productKey}</h4>
                        <p className="text-sm text-gray-600">
                          {analysis.variationCount} plan option{analysis.variationCount > 1 ? 's' : ''} available
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <div className="text-gray-600">Premium Range</div>
                        <div className="font-semibold">
                          {analysis.premiumRange.min === analysis.premiumRange.max 
                            ? `$${analysis.premiumRange.min.toFixed(2)}/mo`
                            : `$${analysis.premiumRange.min.toFixed(2)} - $${analysis.premiumRange.max.toFixed(2)}/mo`
                          }
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-gray-600">Coverage Range</div>
                        <div className="font-semibold">
                          {analysis.maxBenefitRange.min === analysis.maxBenefitRange.max 
                            ? `$${analysis.maxBenefitRange.min.toLocaleString()}`
                            : `$${analysis.maxBenefitRange.min.toLocaleString()} - $${analysis.maxBenefitRange.max.toLocaleString()}`
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Annual Maximum Selection */}
        {selectedProductKey && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  selectedAnnualMax !== null ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                }`}>
                  2
                </div>
                <h3 className="text-lg font-semibold">Select Coverage Level</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableAnnualMaximums.map((annualMax) => {
                  const quotesForMax = groupedData.get(selectedProductKey)?.get(annualMax) || [];
                  const minPremium = Math.min(...quotesForMax.map(q => q.monthlyPremium));
                  const maxPremium = Math.max(...quotesForMax.map(q => q.monthlyPremium));
                  
                  return (
                    <div
                      key={annualMax}
                      className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        selectedAnnualMax === annualMax ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => handleAnnualMaxSelect(annualMax.toString())}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedAnnualMax === annualMax 
                            ? 'bg-blue-500 border-blue-500' 
                            : 'border-gray-300'
                        }`}>
                          {selectedAnnualMax === annualMax && (
                            <CheckIcon className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <Badge variant="secondary">
                          {quotesForMax.length} option{quotesForMax.length > 1 ? 's' : ''}
                        </Badge>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          ${annualMax.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">Annual Maximum</div>
                        <div className="text-sm">
                          <span className="text-gray-600">From </span>
                          <span className="font-semibold">
                            ${minPremium.toFixed(2)}/mo
                          </span>
                          {minPremium !== maxPremium && (
                            <>
                              <span className="text-gray-600"> to </span>
                              <span className="font-semibold">
                                ${maxPremium.toFixed(2)}/mo
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Step 3: Specific Plan Selection */}
        {selectedAnnualMax !== null && availableQuotes.length > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  selectedQuote ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                }`}>
                  3
                </div>
                <h3 className="text-lg font-semibold">Choose Your Plan Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableQuotes.map((quote) => (
                  <div
                    key={quote.id}
                    className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      selectedQuote?.id === quote.id ? 'bg-green-50 border-green-200' : ''
                    }`}
                    onClick={() => handleQuoteSelect(quote.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-4 h-4 rounded-full border-2 mt-1 ${
                        selectedQuote?.id === quote.id 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-gray-300'
                      }`}>
                        {selectedQuote?.id === quote.id && (
                          <CheckIcon className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        ${quote.monthlyPremium.toFixed(2)}
                        <span className="text-sm font-normal text-gray-600">/month</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-gray-600">Plan:</span>
                        <span className="ml-2 font-medium">{quote.planName}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Rating:</span>
                        <span className="ml-2">{quote.ambestRating} ({quote.ambestOutlook})</span>
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        ID: {quote.id}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Selected Plan Summary */}
        {selectedQuote && (
          <>
            <Separator />
            <div className="bg-green-50 p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <CheckIcon className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-green-900">Your Selected Plan</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ${selectedQuote.monthlyPremium.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Monthly Premium</div>
                  <div className="text-xs text-gray-500">
                    ${(selectedQuote.monthlyPremium * 12).toFixed(2)} annually
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    ${selectedQuote.annualMaximum.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Annual Maximum</div>
                  <div className="text-xs text-gray-500">
                    Maximum yearly benefit
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {(selectedQuote.annualMaximum / (selectedQuote.monthlyPremium * 12)).toFixed(1)}:1
                  </div>
                  <div className="text-sm text-gray-600">Value Ratio</div>
                  <div className="text-xs text-gray-500">
                    Benefit per premium dollar
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-green-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Carrier:</span>
                    <span className="ml-2 font-medium">{selectedQuote.companyName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Plan Name:</span>
                    <span className="ml-2 font-medium">{selectedQuote.planName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">AM Best Rating:</span>
                    <span className="ml-2">{selectedQuote.ambestRating} ({selectedQuote.ambestOutlook})</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Product Key:</span>
                    <span className="ml-2 font-mono text-xs">{selectedQuote.productKey}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
