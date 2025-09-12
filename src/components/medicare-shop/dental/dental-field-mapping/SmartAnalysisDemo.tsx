'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FaInfoCircle, FaBrain, FaEye } from 'react-icons/fa';

import { OptimizedDentalQuote } from '@/lib/dental-quote-optimizer';
import { 
  analyzeProductBenefitVariables, 
  IntelligentPlanAnalysis 
} from './intelligent-benefit-analyzer';

interface SmartAnalysisDemoProps {
  quotes: OptimizedDentalQuote[];
}

export function SmartAnalysisDemo({ quotes }: SmartAnalysisDemoProps) {
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [analysis, setAnalysis] = useState<IntelligentPlanAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  // Get unique products
  const productGroups = quotes.reduce((acc, quote) => {
    const key = `${quote.companyName} - ${quote.productKey}`;
    if (!acc[key]) {
      acc[key] = {
        key: quote.productKey,
        company: quote.companyName,
        quotes: []
      };
    }
    acc[key].quotes.push(quote);
    return acc;
  }, {} as Record<string, { key: string; company: string; quotes: OptimizedDentalQuote[] }>);

  const products = Object.values(productGroups);

  const handleAnalyzeProduct = async (productKey: string) => {
    setLoading(true);
    setSelectedProduct(productKey);
    
    try {
      const productQuotes = quotes.filter(q => q.productKey === productKey);
      const result = analyzeProductBenefitVariables(productQuotes);
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FaBrain className="h-5 w-5 text-purple-600" />
          Smart Benefit Analysis Demo
        </CardTitle>
        <p className="text-gray-600">
          Intelligent analysis of real dental quote data to identify benefit variables vs constants
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Product Selector */}
          <div>
            <h3 className="font-medium mb-3">Select a Product to Analyze</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {products.map((product) => (
                <Card 
                  key={product.key}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedProduct === product.key ? 'ring-2 ring-purple-500' : ''
                  }`}
                  onClick={() => handleAnalyzeProduct(product.key)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{product.company}</h4>
                        <p className="text-sm text-gray-600 truncate">{product.key}</p>
                      </div>
                      <Badge variant="outline">
                        {product.quotes.length} quotes
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <Alert>
              <FaBrain className="h-4 w-4 animate-pulse" />
              <AlertDescription>
                Analyzing benefit structures and identifying variables...
              </AlertDescription>
            </Alert>
          )}

          {/* Analysis Results */}
          {analysis && !loading && (
            <div className="space-y-6">
              <Alert>
                <FaInfoCircle className="h-4 w-4" />
                <AlertDescription>
                  Analysis complete for <strong>{analysis.companyName}</strong> - 
                  Found {analysis.variables.length} variables and {analysis.constants.length} constants 
                  across {analysis.totalQuotes} quotes
                </AlertDescription>
              </Alert>

              <Tabs defaultValue="variables" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="variables">Variables ({analysis.variables.length})</TabsTrigger>
                  <TabsTrigger value="constants">Constants ({analysis.constants.length})</TabsTrigger>
                  <TabsTrigger value="groups">Annual Max Groups ({analysis.annualMaximumGroups.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="variables" className="space-y-4">
                  <h3 className="font-medium">Benefit Variables (Options that affect pricing)</h3>
                  {analysis.variables.length === 0 ? (
                    <p className="text-gray-600">No variables detected - all benefits are constant for this product.</p>
                  ) : (
                    <div className="space-y-4">
                      {analysis.variables.map((variable, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">{variable.displayName}</h4>
                                  <p className="text-sm text-gray-600">{variable.description}</p>
                                  <Badge variant="outline" className="mt-1">
                                    {variable.category} • {variable.dataType}
                                  </Badge>
                                </div>
                                <Badge variant="secondary">
                                  {variable.options?.length} options
                                </Badge>
                              </div>

                              {variable.options && (
                                <div className="space-y-2">
                                  <h5 className="text-sm font-medium">Available Options:</h5>
                                  {variable.options.map((option, optionIndex) => (
                                    <div key={optionIndex} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                      <div>
                                        <span className="font-medium">{option.displayLabel}</span>
                                        <span className="text-sm text-gray-600 ml-2">
                                          ({option.quotesWithThisOption.length} quotes)
                                        </span>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-sm font-medium">
                                          Avg: ${option.priceImpact?.averagePremium.toFixed(2)}/month
                                        </div>
                                        <div className="text-xs text-gray-600">
                                          Range: ${option.priceImpact?.premiumRange.min} - ${option.priceImpact?.premiumRange.max}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="constants" className="space-y-4">
                  <h3 className="font-medium">Benefit Constants (Same across all plans)</h3>
                  {analysis.constants.length === 0 ? (
                    <p className="text-gray-600">No constants detected - all benefits vary across plans.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysis.constants.map((constant, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <h4 className="font-medium">{constant.displayName}</h4>
                              <p className="text-sm text-gray-600">{constant.description}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{constant.category}</Badge>
                                <span className="text-sm font-medium">
                                  {constant.dataType === 'boolean' 
                                    ? (constant.constantValue ? 'Yes' : 'No')
                                    : String(constant.constantValue || 'Not available')
                                  }
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="groups" className="space-y-4">
                  <h3 className="font-medium">Annual Maximum Groups</h3>
                  <div className="space-y-4">
                    {analysis.annualMaximumGroups.map((group, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">
                                ${group.amount.toLocaleString()} Annual Maximum
                              </h4>
                              <Badge variant="outline">
                                {group.quotes.length} quotes
                              </Badge>
                            </div>
                            
                            <div>
                              <h5 className="text-sm font-medium mb-2">Variables in this group:</h5>
                              {group.variablesInGroup.length === 0 ? (
                                <p className="text-sm text-gray-600">No variables - all plans in this group are identical</p>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  {group.variablesInGroup.map((variable, varIndex) => (
                                    <Badge key={varIndex} variant="secondary" className="text-xs">
                                      {variable.displayName} ({variable.options?.length} options)
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="pt-2 border-t">
                              <div className="text-sm text-gray-600">
                                Premium range: ${Math.min(...group.quotes.map(q => q.monthlyPremium))} - 
                                ${Math.max(...group.quotes.map(q => q.monthlyPremium))}/month
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
