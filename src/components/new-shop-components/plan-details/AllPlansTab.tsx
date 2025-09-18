'use client'

import React, { useState, useMemo } from 'react'
import { TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { QuoteData } from './types.js'

interface AllPlansTabProps {
  quoteData: QuoteData
  carrierQuotes: QuoteData[]
  formatCurrency: (amount: number) => string
  calculateDiscountedRate: (rate: number, discounts: any[]) => number
}

interface PlanConfiguration {
  ratingClass: string
  discounts: string[]
}

export const AllPlansTab: React.FC<AllPlansTabProps> = ({
  quoteData,
  carrierQuotes,
  formatCurrency,
  calculateDiscountedRate
}) => {
  console.log('AllPlansTab Debug:', {
    quoteData,
    carrierQuotes,
    carrierQuotesLength: carrierQuotes?.length
  });

  // Simple fallback if no data
  if (!carrierQuotes || carrierQuotes.length === 0) {
    return (
      <TabsContent value="all-plans" className="space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">No plan options available for comparison.</p>
        </div>
      </TabsContent>
    );
  }

  // Group quotes by plan type
  const planGroups = useMemo(() => {
    const groups: Record<string, QuoteData[]> = {}
    carrierQuotes.forEach(quote => {
      const planType = quote.plan || 'Unknown'
      if (!groups[planType]) groups[planType] = []
      groups[planType].push(quote)
    })
    return groups
  }, [carrierQuotes])

  // State for configurations
  const [planConfigs, setPlanConfigs] = useState<Record<string, PlanConfiguration>>({})

  const updatePlanConfig = (planKey: string, update: Partial<PlanConfiguration>) => {
    setPlanConfigs(prev => ({
      ...prev,
      [planKey]: { ...prev[planKey], ...update }
    }))
  }

  // Helper to get rate from quote (handle different formats)
  const getQuoteRate = (quote: QuoteData) => {
    if (quote.rate?.month) return quote.rate.month
    if (quote.rate?.semi_annual) return quote.rate.semi_annual / 6
    return 0
  }

  const getCurrentRate = (planKey: string, quotes: QuoteData[]) => {
    const config = planConfigs[planKey] || { ratingClass: '', discounts: [] }
    
    // Find quote matching the configuration
    const matchingQuote = quotes.find(quote => {
      const ratingMatch = (quote.rating_class || '') === config.ratingClass
      return ratingMatch
    })

    if (matchingQuote) {
      let rate = getQuoteRate(matchingQuote)
      // Apply discounts
      if (config.discounts.length > 0 && matchingQuote.discounts) {
        config.discounts.forEach(discountName => {
          const discount = matchingQuote.discounts?.find((d: any) => d.name === discountName)
          if (discount) {
            if (discount.type === 'percent') {
              rate = rate * (1 - discount.value)
            } else {
              rate = Math.max(0, rate - discount.value)
            }
          }
        })
      }
      return rate
    }

    // Fallback to first quote
    return getQuoteRate(quotes[0])
  }

  return (
    <TabsContent value="all-plans" className="space-y-6">
      <div className="space-y-6">
        {/* Debug info */}
  <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-400/30 rounded-md">
          <p className="text-sm">
            <strong>Debug Info:</strong> Found {carrierQuotes.length} quotes for {quoteData.company_base?.name || 'Unknown Carrier'}
          </p>
          <p className="text-sm">
            Plan types: {Object.keys(planGroups).join(', ')}
          </p>
        </div>

        {/* Plan Options */}
        {Object.entries(planGroups).map(([planType, quotes]) => {
          const planKey = `${quoteData.company}-${planType}`
          const config = planConfigs[planKey] || { ratingClass: '', discounts: [] }
          const currentRate = getCurrentRate(planKey, quotes)
          const baseRate = getQuoteRate(quotes[0])
          const savings = baseRate - currentRate

          // Get available rating classes
          const ratingClasses = Array.from(new Set(
            quotes.map(q => q.rating_class || '').filter(Boolean)
          )).sort()

          // Get available discounts
          const allDiscounts = new Set<string>()
          quotes.forEach(quote => {
            quote.discounts?.forEach((d: any) => allDiscounts.add(d.name))
          })
          const availableDiscounts = Array.from(allDiscounts).sort()

          return (
            <Card key={planKey} className="overflow-hidden bg-white/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 backdrop-blur">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-xl">
                      Plan {planType}
                    </CardTitle>
                    <Badge variant="outline">
                      {quotes.length} option{quotes.length !== 1 ? 's' : ''} available
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency((currentRate >= 100 ? currentRate / 100 : currentRate))}/mo
                    </div>
                    {savings > 0 && (
                      <div className="text-sm text-green-600">
                        Save {formatCurrency((savings >= 100 ? savings / 100 : savings))}/mo
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {quoteData.company_base?.name || 'Unknown Carrier'} • {
                    planType === 'G' ? 'Covers all gaps except Part B deductible ($257/yr)' :
                    planType === 'F' ? 'Covers all gaps (only available if eligible before 2020)' :
                    planType === 'N' ? 'Lower cost with small copays for office visits & ER' :
                    'Medicare Supplement coverage'
                  }
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Rating Class Selection */}
                {ratingClasses.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Rating Class Options</h4>
                    <RadioGroup
                      value={config.ratingClass}
                      onValueChange={(value) => updatePlanConfig(planKey, { ratingClass: value })}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="" id={`${planKey}-standard`} />
                        <Label htmlFor={`${planKey}-standard`} className="cursor-pointer">
                          Standard
                        </Label>
                      </div>
                      {ratingClasses.map(ratingClass => (
                        <div key={ratingClass} className="flex items-center space-x-2">
                          <RadioGroupItem value={ratingClass} id={`${planKey}-${ratingClass}`} />
                          <Label htmlFor={`${planKey}-${ratingClass}`} className="cursor-pointer">
                            {ratingClass}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {/* Discount Selection */}
                {availableDiscounts.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Available Discounts</h4>
                    <div className="space-y-2">
                      {availableDiscounts.map(discountName => {
                        const discount = quotes.find(q => 
                          q.discounts?.some((d: any) => d.name === discountName)
                        )?.discounts?.find((d: any) => d.name === discountName)
                        
                        return (
                          <div key={discountName} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`${planKey}-${discountName}`}
                                checked={config.discounts.includes(discountName)}
                                onCheckedChange={(checked) => {
                                  const newDiscounts = checked
                                    ? [...config.discounts, discountName]
                                    : config.discounts.filter(d => d !== discountName)
                                  updatePlanConfig(planKey, { discounts: newDiscounts })
                                }}
                              />
                              <Label htmlFor={`${planKey}-${discountName}`} className="cursor-pointer font-medium">
                                {discountName}
                              </Label>
                            </div>
                            {discount && (
                              <Badge variant="outline" className="text-green-600">
                                {discount.type === 'percent' 
                                  ? `${Math.round(discount.value * 100)}% off`
                                  : `$${discount.value} off`
                                }
                              </Badge>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Rate Summary */}
                <div className="flex items-center justify-between p-4 bg-muted/70 dark:bg-slate-700/40 rounded-lg border border-slate-200 dark:border-slate-600/60">
                  <div>
                    <div className="font-semibold">Base Rate:</div>
                    <div className="font-semibold">Your Rate:</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono">
                      {formatCurrency((baseRate >= 100 ? baseRate / 100 : baseRate))}/mo
                    </div>
                    <div className="font-mono text-lg font-bold text-primary">
                      {formatCurrency((currentRate >= 100 ? currentRate / 100 : currentRate))}/mo
                    </div>
                  </div>
                </div>

                <Button className="w-full" size="lg">
                  Select This Plan Configuration
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </TabsContent>
  )
}
