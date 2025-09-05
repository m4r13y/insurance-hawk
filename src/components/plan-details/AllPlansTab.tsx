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
  // Group quotes by plan
  const planGroups = useMemo(() => {
    const groups: Record<string, QuoteData[]> = {}
    carrierQuotes.forEach(quote => {
      const key = `${quote.company}-${quote.plan}`
      if (!groups[key]) groups[key] = []
      groups[key].push(quote)
    })
    console.log('Plan groups created:', groups)
    return groups
  }, [carrierQuotes])

  // State for each plan's configuration
  const [planConfigs, setPlanConfigs] = useState<Record<string, PlanConfiguration>>({})

  const updatePlanConfig = (planKey: string, update: Partial<PlanConfiguration>) => {
    setPlanConfigs(prev => ({
      ...prev,
      [planKey]: { ...prev[planKey], ...update }
    }))
  }

  const calculateFinalRate = (baseQuote: QuoteData, config: PlanConfiguration) => {
    let rate = baseQuote.rate?.month || 0
    
    // Convert from cents to dollars if needed
    if (rate > 1000) {
      rate = rate / 100
    }
    
    // Apply discounts
    config.discounts.forEach(discountName => {
      const discount = baseQuote.discounts?.find(d => d.name === discountName)
      if (discount && discount.type === 'percent') {
        rate = rate * (1 - discount.value)
      }
    })
    
    return rate
  }

  const getBaseRate = (quote: QuoteData) => {
    const rawRate = quote.rate?.month || 0
    const convertedRate = rawRate > 1000 ? rawRate / 100 : rawRate
    console.log('getBaseRate - Raw:', rawRate, 'Converted:', convertedRate)
    return convertedRate
  }

  const getAvailableOptions = (quotes: QuoteData[]) => {
    const ratingClasses = new Set<string>()
    const discounts = new Map<string, {name: string, value: number, type: string}>()
    
    quotes.forEach(quote => {
      if (quote.rating_class && quote.rating_class.trim()) {
        ratingClasses.add(quote.rating_class)
      }
      quote.discounts?.forEach(discount => {
        discounts.set(discount.name, discount)
      })
    })
    
    return {
      ratingClasses: Array.from(ratingClasses),
      discounts: Array.from(discounts.values())
    }
  }

  const getBaseQuote = (quotes: QuoteData[], ratingClass?: string) => {
    if (ratingClass) {
      const found = quotes.find(q => q.rating_class === ratingClass) || quotes[0]
      console.log('getBaseQuote with rating class:', ratingClass, 'found:', found)
      return found
    }
    // Find the quote with no rating class or the first one
    const found = quotes.find(q => !q.rating_class || q.rating_class.trim() === '') || quotes[0]
    console.log('getBaseQuote without rating class, found:', found)
    return found
  }

  if (Object.keys(planGroups).length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No plan variations found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Plan Options from {quoteData.company_base?.name || 'Insurance Provider'}</CardTitle>
          <p className="text-muted-foreground">
            Choose the best plan option for your needs. Different options may include discounts, rating classes, or special programs.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(planGroups).map(([planKey, planQuotes], planIndex) => {
            const [company, plan] = planKey.split('-')
            const options = getAvailableOptions(planQuotes)
            const config = planConfigs[planKey] || { ratingClass: '', discounts: [] }
            const baseQuote = getBaseQuote(planQuotes, config.ratingClass)
            const baseRate = getBaseRate(baseQuote)
            const finalRate = calculateFinalRate(baseQuote, config)
            const savings = baseRate - finalRate
            
            console.log('Plan calculations:', {
              planKey,
              baseQuoteRate: baseQuote.rate?.month,
              baseRate,
              finalRate,
              savings,
              config
            })

            return (
              <div key={planKey} className="border rounded-lg p-6 space-y-4">
                {/* Plan Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={planIndex === 0 ? "default" : "outline"} className="text-sm">
                      Plan {plan}
                    </Badge>
                    {planIndex === 0 && (
                      <Badge variant="secondary" className="text-xs">
                        ⭐ Best Value
                      </Badge>
                    )}
                    {savings > 0 && (
                      <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                        Save ${savings.toFixed(0)}/mo ({Math.round((savings/baseRate)*100)}%)
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(finalRate)}/mo
                    </div>
                    {savings > 0 && (
                      <div className="text-sm text-green-600">
                        Save {formatCurrency(savings)}/mo
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  {options.ratingClasses.length + 1} rating options • {options.discounts.length} discount options available • attained age
                </p>

                {/* Rating Class Selection */}
                {options.ratingClasses.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Choose Your Rating Class:</h4>
                    <RadioGroup
                      value={config.ratingClass}
                      onValueChange={(value) => updatePlanConfig(planKey, { ratingClass: value })}
                      className="space-y-3"
                    >
                      {/* Standard option */}
                      <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="" id={`${planKey}-standard`} />
                          <div>
                            <Label htmlFor={`${planKey}-standard`} className="font-medium cursor-pointer">
                              Standard
                            </Label>
                            <p className="text-sm text-gray-500">Standard plan option</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {formatCurrency(getBaseRate(getBaseQuote(planQuotes)))}/mo
                          </div>
                        </div>
                      </div>

                      {/* Other rating classes */}
                      {options.ratingClasses.map((ratingClass) => {
                        const quote = planQuotes.find(q => q.rating_class === ratingClass)
                        if (!quote || !quote.rate) return null
                        const rate = getBaseRate(quote)
                        const standardRate = getBaseRate(getBaseQuote(planQuotes))
                        const difference = rate - standardRate

                        return (
                          <div key={ratingClass} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                            <div className="flex items-center space-x-3">
                              <RadioGroupItem value={ratingClass} id={`${planKey}-${ratingClass}`} />
                              <div>
                                <Label htmlFor={`${planKey}-${ratingClass}`} className="font-medium cursor-pointer">
                                  {ratingClass}
                                </Label>
                                <p className="text-sm text-gray-500">
                                  {ratingClass.includes('Preferred') ? 'Better health rating' : 'Alternative rating option'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{formatCurrency(rate)}/mo</div>
                              {difference !== 0 && (
                                <div className={`text-sm ${difference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  {difference > 0 ? '+' : ''}{formatCurrency(Math.abs(difference))}/mo
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </RadioGroup>
                  </div>
                )}

                {/* Discount Options */}
                {options.discounts.length > 0 && (
                  <>
                    {options.ratingClasses.length > 0 && <Separator />}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Available Discounts:</h4>
                      <div className="space-y-3">
                        {options.discounts.map((discount) => {
                          const discountAmount = baseRate * discount.value
                          const isSelected = config.discounts.includes(discount.name)

                          return (
                            <div key={discount.name} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                              <div className="flex items-center space-x-3">
                                <Checkbox
                                  id={`${planKey}-${discount.name}`}
                                  checked={isSelected}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      updatePlanConfig(planKey, { 
                                        discounts: [...config.discounts, discount.name] 
                                      })
                                    } else {
                                      updatePlanConfig(planKey, { 
                                        discounts: config.discounts.filter(d => d !== discount.name) 
                                      })
                                    }
                                  }}
                                />
                                <div>
                                  <Label htmlFor={`${planKey}-${discount.name}`} className="font-medium cursor-pointer capitalize">
                                    {discount.name} Discount
                                  </Label>
                                  <p className="text-sm text-gray-500">
                                    {Math.round(discount.value * 100)}% discount available
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-green-600 font-medium">
                                  Save {formatCurrency(discountAmount)}/mo ({Math.round(discount.value * 100)}%)
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}

                {/* Final Price Summary */}
                {(options.ratingClasses.length > 0 || options.discounts.length > 0) && (
                  <>
                    <Separator />
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Base Rate:</span>
                        <span className="text-sm">{formatCurrency(baseRate)}/mo</span>
                      </div>
                      {config.discounts.length > 0 && (
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-green-600">Total Discounts:</span>
                          <span className="text-sm text-green-600">-{formatCurrency(savings)}/mo</span>
                        </div>
                      )}
                      <Separator className="my-2" />
                      <div className="flex justify-between items-center">
                        <span className="font-bold">Final Rate:</span>
                        <span className="font-bold text-lg">{formatCurrency(finalRate)}/mo</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Action Button */}
                <div className="pt-2">
                  <Button 
                    variant={planIndex === 0 ? "default" : "outline"} 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      console.log('Selected plan:', planKey, 'config:', config, 'finalRate:', finalRate)
                    }}
                  >
                    {planIndex === 0 ? "Select This Plan" : "Choose This Option"}
                  </Button>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
