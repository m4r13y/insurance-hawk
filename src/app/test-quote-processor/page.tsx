'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { consolidateQuoteVariations } from '@/lib/plan-consolidation'
import { getCarrierDisplayName, getCarrierLogoUrl } from '@/lib/carrier-system'

export default function QuoteProcessorTestPage() {
  const [rawData, setRawData] = useState<any[]>([])
  const [consolidatedData, setConsolidatedData] = useState<any[]>([])
  const [processingError, setProcessingError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [applyDiscounts, setApplyDiscounts] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        // Load JSON data dynamically to avoid build-time parsing issues
        const response = await fetch('/api/sample-quotes')
        if (!response.ok) {
          throw new Error('Failed to load sample quotes')
        }
        const sampleQuotes = await response.json()
        
        // Use first 10 quotes for testing
        const testQuotes = sampleQuotes.slice(0, 60)
        setRawData(testQuotes)
        
        console.log('Raw test quotes:', testQuotes)
        
        // Try to consolidate the data
        const consolidated = consolidateQuoteVariations(testQuotes)
        setConsolidatedData(consolidated)
        
        console.log('Consolidated data:', consolidated)
        
        // Debug discount structures
        console.log('=== DISCOUNT ANALYSIS ===')
        testQuotes.forEach((quote: any, i: number) => {
          if (quote.discounts && quote.discounts.length > 0) {
            console.log(`Quote ${i} discounts:`, quote.discounts)
          }
          if (quote.view_type && quote.view_type.includes('with_hhd')) {
            console.log(`Quote ${i} has household discount, view_type:`, quote.view_type)
          }
        })
        
        // New HHD View Type Analysis
        console.log('=== VIEW TYPE ANALYSIS ===')
        const carrierGroups = new Map();
        
        testQuotes.forEach((quote: any) => {
          const carrierName = quote.company_base?.name || 'Unknown';
          const plan = quote.plan;
          const key = `${carrierName}-${plan}`;
          
          if (!carrierGroups.has(key)) {
            carrierGroups.set(key, {
              carrier: carrierName,
              plan: plan,
              quotes: []
            });
          }
          
          carrierGroups.get(key).quotes.push({
            rating_class: quote.rating_class,
            view_type: quote.view_type,
            discounts: quote.discounts,
            rate: quote.rate?.month
          });
        });
        
        carrierGroups.forEach((group, key) => {
          console.log(`\n--- ${key} ---`);
          console.log(`Total quotes: ${group.quotes.length}`);
          
          const withHhd = group.quotes.filter((q: any) => q.view_type && q.view_type.includes('with_hhd'));
          const sansHhd = group.quotes.filter((q: any) => q.view_type && q.view_type.includes('sans_hhd'));
          const noViewType = group.quotes.filter((q: any) => !q.view_type || q.view_type.length === 0);
          
          console.log(`  with_hhd: ${withHhd.length}`);
          console.log(`  sans_hhd: ${sansHhd.length}`);
          console.log(`  no view_type: ${noViewType.length}`);
          
          // Show rating classes for each view type
          if (withHhd.length > 0) {
            console.log(`  with_hhd rating classes:`, withHhd.map((q: any) => q.rating_class));
          }
          if (sansHhd.length > 0) {
            console.log(`  sans_hhd rating classes:`, sansHhd.map((q: any) => q.rating_class));
          }
          if (noViewType.length > 0) {
            console.log(`  no view_type rating classes:`, noViewType.map((q: any) => q.rating_class));
          }
        });
        
        console.log('=========================')
      } catch (error) {
        console.error('Processing error:', error)
        setProcessingError(error instanceof Error ? error.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  const formatRate = (rate: any) => {
    if (typeof rate === 'number') {
      return rate >= 100 ? `$${(rate / 100).toFixed(2)}` : `$${rate.toFixed(2)}`
    }
    return 'N/A'
  }

  const getRateFromQuote = (quote: any) => {
    if (quote.rate?.month) return quote.rate.month
    if (quote.rate?.semi_annual) return quote.rate.semi_annual / 6
    return quote.monthly_premium || quote.premium || 0
  }

  // Function to process options based on discount toggle
  const processOptionsForDisplay = (plan: any) => {
    // Check if this plan has pre-calculated discounts
    const hasWithHHD = plan.options.some((opt: any) => opt.view_type?.includes('with_hhd'));
    const hasSansHHD = plan.options.some((opt: any) => opt.view_type?.includes('sans_hhd'));
    const hasPreCalculatedDiscounts = hasWithHHD && hasSansHHD;

    if (hasPreCalculatedDiscounts) {
      // For pre-calculated discounts, just filter based on toggle
      if (applyDiscounts) {
        // Show with_hhd options (discounted versions)
        return plan.options.filter((opt: any) => opt.view_type?.includes('with_hhd'));
      } else {
        // Show sans_hhd options (non-discounted versions)
        return plan.options.filter((opt: any) => opt.view_type?.includes('sans_hhd'));
      }
    } else {
      // For non-pre-calculated discounts, we need to calculate
      if (applyDiscounts) {
        // Apply discounts to base options
        return plan.options.map((opt: any) => {
          // Check if this option has discounts available
          const hasDiscounts = opt.discounts && opt.discounts.length > 0;
          
          if (hasDiscounts) {
            // Calculate discounted price
            let discountedRate = opt.rate.month;
            opt.discounts.forEach((discount: any) => {
              const discountPercent = discount.value ? (discount.value * 100) : (discount.percent || 0);
              discountedRate = discountedRate * (1 - discountPercent / 100);
            });
            
            return {
              ...opt,
              rate: {
                ...opt.rate,
                month: discountedRate,
                annual: discountedRate * 12,
                quarter: discountedRate * 3,
                semi_annual: discountedRate * 6
              },
              name: `${opt.name} (Calculated Discount)`,
              isCalculatedDiscount: true
            };
          }
          
          return opt;
        });
      } else {
        // Show base options without discounts
        return plan.options;
      }
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6 mt-16">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quote Processor Test Page</h1>
        <Badge variant="outline">
          {loading ? 'Loading...' : `${rawData.length} quotes loaded`}
        </Badge>
      </div>

      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-muted-foreground">Loading sample quotes...</div>
            </div>
          </CardContent>
        </Card>
      )}

      {processingError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="text-red-600 font-semibold">Processing Error:</div>
              <div className="text-red-800">{processingError}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && (
        <>
          <Tabs defaultValue="raw-data" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="raw-data">Raw Data</TabsTrigger>
          <TabsTrigger value="consolidated">Consolidated</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="raw-data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Raw Quote Data</CardTitle>
              <p className="text-sm text-muted-foreground">
                Direct from the API response - first 10 quotes
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rawData.map((quote, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">
                        Quote #{index + 1} - Plan {quote.plan || 'Unknown'}
                      </div>
                      <Badge variant="outline">
                        {formatRate(getRateFromQuote(quote))}/mo
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Carrier:</span> {quote.company_base?.name || 'Unknown'}
                      </div>
                      <div>
                        <span className="font-medium">Rating Class:</span> {quote.rating_class || 'Standard'}
                      </div>
                      <div>
                        <span className="font-medium">View Type:</span> {quote.view_type?.join(', ') || 'None'}
                      </div>
                      <div>
                        <span className="font-medium">Discount Category:</span> {quote.discount_category || 'None'}
                      </div>
                      <div>
                        <span className="font-medium">Rate Type:</span> {quote.rate_type || 'Unknown'}
                      </div>
                      <div>
                        <span className="font-medium">Discounts:</span> {quote.discounts?.length || 0}
                      </div>
                    </div>

                    {quote.rate && (
                      <div className="bg-muted p-2 rounded text-sm">
                        <span className="font-medium">Rate Object:</span> {JSON.stringify(quote.rate)}
                      </div>
                    )}

                    {quote.discounts && quote.discounts.length > 0 && (
                      <div className="bg-green-50 p-2 rounded text-sm">
                        <span className="font-medium">Discounts:</span> {JSON.stringify(quote.discounts)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consolidated" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Consolidated Data</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    After running through consolidateQuoteVariations()
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="apply-discounts" className="text-sm font-medium">
                    Apply Discounts
                  </Label>
                  <Switch
                    id="apply-discounts"
                    checked={applyDiscounts}
                    onCheckedChange={setApplyDiscounts}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {consolidatedData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No consolidated data available
                </div>
              ) : (
                <div className="space-y-6">
                  {consolidatedData
                    .sort((a, b) => {
                      // Get display options for both plans based on current toggle state
                      const aDisplayOptions = processOptionsForDisplay(a);
                      const bDisplayOptions = processOptionsForDisplay(b);
                      
                      // Get minimum rates for comparison
                      const aMinRate = Math.min(...aDisplayOptions.map((opt: any) => opt.rate.month));
                      const bMinRate = Math.min(...bDisplayOptions.map((opt: any) => opt.rate.month));
                      
                      // Sort by lowest rate first
                      return aMinRate - bMinRate;
                    })
                    .map((plan, index) => {
                    // Get the current display options based on toggle state
                    const displayOptions = processOptionsForDisplay(plan);
                    const rates = displayOptions.map((opt: any) => opt.rate.month);
                    const minRate = Math.min(...rates);
                    const maxRate = Math.max(...rates);
                    const priceRange = minRate === maxRate ? 
                      `${formatRate(minRate)}/mo` : 
                      `${formatRate(minRate)} - ${formatRate(maxRate)}/mo`;
                    
                    return (
                      <div key={index} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {/* Carrier Logo */}
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                              {(() => {
                                const originalCarrierName = plan.carrier.originalName || plan.carrier.name;
                                const logoUrl = getCarrierLogoUrl(originalCarrierName);
                                if (logoUrl) {
                                  return (
                                    <img 
                                      src={logoUrl} 
                                      alt={`${plan.carrier.displayName} logo`}
                                      className="w-8 h-8 object-contain"
                                      onError={(e) => {
                                        // Fallback to initials if logo fails to load
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        if (target.nextSibling) {
                                          (target.nextSibling as HTMLElement).style.display = 'flex';
                                        }
                                      }}
                                    />
                                  );
                                }
                                return null;
                              })()}
                              {/* Fallback initials */}
                              <div className="text-xs font-semibold text-gray-600" style={{ display: 'none' }}>
                                {(() => {
                                  const originalCarrierName = plan.carrier.originalName || plan.carrier.name;
                                  const displayName = getCarrierDisplayName(originalCarrierName);
                                  return displayName.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
                                })()}
                              </div>
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">
                                {(() => {
                                  const originalCarrierName = plan.carrier.originalName || plan.carrier.name;
                                  const displayName = getCarrierDisplayName(originalCarrierName);
                                  return `${displayName} - Plan ${plan.plan}`;
                                })()}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Price Range: {priceRange}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {displayOptions.length} options
                            </Badge>
                          {(() => {
                            // Check if this plan group has pre-calculated discounts
                            // Only show badge when there are BOTH 'with_hhd' AND 'sans_hhd' options
                            const hasWithHHD = plan.options.some((opt: any) => opt.view_type?.includes('with_hhd'));
                            const hasSansHHD = plan.options.some((opt: any) => opt.view_type?.includes('sans_hhd'));
                            
                            if (hasWithHHD && hasSansHHD) {
                              return (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  pre-calculated discounts
                                </Badge>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Rating Options ({plan.ratingOptions.length})</h4>
                          <div className="space-y-1">
                            {plan.ratingOptions.map((rating: any, i: number) => (
                              <div key={i} className="text-sm p-2 bg-blue-50 rounded">
                                {rating.name}: {formatRate(rating.rate.month)}/mo
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Discount Options ({plan.discountOptions.length})</h4>
                          <div className="space-y-1">
                            {plan.discountOptions.map((discount: any, i: number) => (
                              <div key={i} className="text-sm p-2 bg-green-50 rounded">
                                {discount.name}: {discount.discountPercent}% off
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        {(() => {
                          const displayOptions = processOptionsForDisplay(plan);
                          const hasPreCalculated = plan.options.some((opt: any) => opt.view_type?.includes('with_hhd')) && 
                                                   plan.options.some((opt: any) => opt.view_type?.includes('sans_hhd'));
                          
                          return (
                            <>
                              <h4 className="font-medium mb-2">
                                All Options ({displayOptions.length})
                                {hasPreCalculated && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    {applyDiscounts ? 'showing with_HHD' : 'showing sans_HHD'}
                                  </Badge>
                                )}
                                {!hasPreCalculated && applyDiscounts && (
                                  <Badge variant="secondary" className="ml-2 text-xs bg-orange-100 text-orange-800">
                                    calculated discounts
                                  </Badge>
                                )}
                              </h4>
                              <div className="grid gap-2">
                                {displayOptions.map((option: any, i: number) => {
                                  // Check for HHD view types
                                  const hasWithHHD = option.view_type?.includes('with_hhd');
                                  const hasSansHHD = option.view_type?.includes('sans_hhd');
                                  
                                  return (
                                    <div key={i} className="text-sm p-2 border rounded flex justify-between items-center">
                                      <div>
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-medium">{option.name}</span>
                                          {option.isRecommended && <Badge className="text-xs">Recommended</Badge>}
                                          {option.isCalculatedDiscount && (
                                            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                                              calculated
                                            </Badge>
                                          )}
                                          {hasWithHHD && (
                                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                              with_HHD
                                            </Badge>
                                          )}
                                          {hasSansHHD && (
                                            <Badge variant="outline" className="text-xs">
                                              sans_HHD
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="text-xs text-muted-foreground">{option.description}</div>
                                        {option.view_type && option.view_type.length > 0 && (
                                          <div className="text-xs text-gray-500 mt-1">
                                            View types: {option.view_type.join(', ')}
                                          </div>
                                        )}
                                      </div>
                                      <div className="text-right">
                                        <div className="font-medium">{formatRate(option.rate.month)}/mo</div>
                                        {option.savings && (
                                          <div className="text-xs text-green-600">
                                            Save {formatRate(option.savings)}/mo
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Structure Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">Raw Data Summary</h4>
                  <div className="text-sm space-y-1">
                    <div>Total Quotes: {rawData.length}</div>
                    <div>Unique Plans: {new Set(rawData.map(q => q.plan)).size}</div>
                    <div>Unique Carriers: {new Set(rawData.map(q => q.company_base?.name)).size}</div>
                    <div>Quotes with Rating Classes: {rawData.filter(q => q.rating_class && q.rating_class.trim()).length}</div>
                    <div>Quotes with Discounts: {rawData.filter(q => q.discounts && q.discounts.length > 0).length}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium">Rate Formats Found</h4>
                  <div className="text-sm space-y-1">
                    <div>Monthly Rates: {rawData.filter(q => q.rate?.month).length}</div>
                    <div>Semi-Annual Rates: {rawData.filter(q => q.rate?.semi_annual).length}</div>
                    <div>Other Rate Fields: {rawData.filter(q => q.monthly_premium || q.premium).length}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium">Household Discount (HHD) Analysis</h4>
                  <div className="text-sm space-y-1">
                    <div>Quotes with 'with_hhd': {rawData.filter(q => q.view_type?.includes('with_hhd')).length}</div>
                    <div>Quotes with 'sans_hhd': {rawData.filter(q => q.view_type?.includes('sans_hhd')).length}</div>
                    <div>Quotes with both HHD types: {rawData.filter(q => 
                      q.view_type?.includes('with_hhd') && q.view_type?.includes('sans_hhd')
                    ).length}</div>
                    <div>Quotes with discounts array: {rawData.filter(q => q.discounts && q.discounts.length > 0).length}</div>
                    <div>Quotes with household discount: {rawData.filter(q => 
                      q.discounts?.some((d: any) => d.name === 'household' || d.type === 'household')
                    ).length}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium">Unique Rating Classes</h4>
                  <div className="text-sm space-y-1">
                    {Array.from(new Set(rawData.map(q => q.rating_class).filter(Boolean))).map((rating: any, i: number) => (
                      <div key={i} className="bg-muted p-1 rounded">{rating}</div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Processing Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">Consolidation Results</h4>
                  <div className="text-sm space-y-1">
                    <div>Consolidated Plans: {consolidatedData.length}</div>
                    <div>Total Rating Options: {consolidatedData.reduce((sum, plan) => sum + plan.ratingOptions.length, 0)}</div>
                    <div>Total Discount Options: {consolidatedData.reduce((sum, plan) => sum + plan.discountOptions.length, 0)}</div>
                    <div>Total Plan Options: {consolidatedData.reduce((sum, plan) => sum + plan.options.length, 0)}</div>
                    <div>Plans with pre-calculated discounts: {consolidatedData.filter(plan => {
                      const hasWithHHD = plan.options.some((opt: any) => opt.view_type?.includes('with_hhd'));
                      const hasSansHHD = plan.options.some((opt: any) => opt.view_type?.includes('sans_hhd'));
                      return hasWithHHD && hasSansHHD;
                    }).length}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium">Rate Conversion Check</h4>
                  <div className="text-sm space-y-1">
                    {rawData.slice(0, 3).map((quote: any, i: number) => {
                      const rawRate = getRateFromQuote(quote)
                      const convertedRate = rawRate >= 100 ? rawRate / 100 : rawRate
                      return (
                        <div key={i} className="bg-muted p-2 rounded">
                          Quote {i + 1}: {rawRate} → {formatRate(convertedRate)}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Before vs After Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Before (Raw Quotes)</h4>
                  <div className="space-y-2 text-sm">
                    {rawData.slice(0, 5).map((quote: any, i: number) => (
                      <div key={i} className="border p-2 rounded">
                        Plan {quote.plan} - {quote.rating_class || 'Standard'} - {formatRate(getRateFromQuote(quote))}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">After (Consolidated)</h4>
                  <div className="space-y-2 text-sm">
                    {consolidatedData.length > 0 ? (
                      consolidatedData.map((plan: any, i: number) => (
                        <div key={i} className="border p-2 rounded">
                          <div className="font-medium">Plan {plan.plan}</div>
                          <div>{plan.options.length} options available</div>
                          <div>Price range: {formatRate(Math.min(...plan.options.map((o: any) => o.rate.month)))} - {formatRate(Math.max(...plan.options.map((o: any) => o.rate.month)))}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-muted-foreground">No consolidated data to show</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardContent className="pt-6">
          <Button 
            onClick={() => {
              console.log('=== COMPLETE DATA DUMP ===')
              console.log('Raw Data:', rawData)
              console.log('Consolidated Data:', consolidatedData)
              console.log('Processing Error:', processingError)
            }}
            className="w-full"
          >
            Log Complete Data to Console
          </Button>
        </CardContent>
      </Card>
        </>
      )}
    </div>
  )
}
