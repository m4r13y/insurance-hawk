'use client'

import React, { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'

interface Quote {
  company: string
  plan: string
  rating_class: string
  discounts: Array<{name: string, value: number, type: string}>
  rate: { month: number }
  view_type: string[]
}

interface AllPlansTabImprovedProps {
  quotes: Quote[]
  onPlanSelect?: (selectedQuote: Quote, finalRate: number) => void
}

interface PlanConfiguration {
  ratingClass: string
  discounts: string[]
}

export function AllPlansTabImproved({ quotes, onPlanSelect }: AllPlansTabImprovedProps) {
  // Group quotes by plan
  const planGroups = useMemo(() => {
    const groups: Record<string, Quote[]> = {}
    quotes.forEach(quote => {
      const key = `${quote.company}-${quote.plan}`
      if (!groups[key]) groups[key] = []
      groups[key].push(quote)
    })
    return groups
  }, [quotes])

  // State for each plan's configuration
  const [planConfigs, setPlanConfigs] = useState<Record<string, PlanConfiguration>>({})

  const updatePlanConfig = (planKey: string, update: Partial<PlanConfiguration>) => {
    setPlanConfigs(prev => ({
      ...prev,
      [planKey]: { ...prev[planKey], ...update }
    }))
  }

  const calculateFinalRate = (baseQuote: Quote, config: PlanConfiguration) => {
    let rate = baseQuote.rate.month / 100 // Convert from cents to dollars
    
    // Apply discounts
    config.discounts.forEach(discountName => {
      const discount = baseQuote.discounts?.find(d => d.name === discountName)
      if (discount && discount.type === 'percent') {
        rate = rate * (1 - discount.value)
      }
    })
    
    return rate
  }

  const getAvailableOptions = (quotes: Quote[]) => {
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

  const getBaseQuote = (quotes: Quote[], ratingClass?: string) => {
    if (ratingClass) {
      return quotes.find(q => q.rating_class === ratingClass) || quotes[0]
    }
    // Find the quote with no rating class or the first one
    return quotes.find(q => !q.rating_class || q.rating_class.trim() === '') || quotes[0]
  }

  return (
    <div className="space-y-6">
      {Object.entries(planGroups).map(([planKey, planQuotes]) => {
        const [company, plan] = planKey.split('-')
        const options = getAvailableOptions(planQuotes)
        const config = planConfigs[planKey] || { ratingClass: '', discounts: [] }
        const baseQuote = getBaseQuote(planQuotes, config.ratingClass)
        const finalRate = calculateFinalRate(baseQuote, config)
        const baseRate = baseQuote.rate.month / 100
        const savings = baseRate - finalRate

        return (
          <Card key={planKey} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-slate-900 text-white font-medium px-3 py-1">
                    Plan {plan}
                  </Badge>
                  {savings > 0 && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      ⭐ Best Value
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    ${finalRate.toFixed(0)}/mo
                  </div>
                  {savings > 0 && (
                    <div className="text-sm text-green-600 font-medium">
                      Save ${savings.toFixed(0)}/mo ({Math.round((savings/baseRate)*100)}%)
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Choose the best plan option for your needs. Different options may include discounts, rating classes, or special programs.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Rating Class Selection */}
              {options.ratingClasses.length > 0 && (
                <div>
                  <Label className="text-base font-medium mb-3 block">Rating Class:</Label>
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
                          ${(getBaseQuote(planQuotes).rate.month / 100).toFixed(0)}/mo
                        </div>
                      </div>
                    </div>

                    {/* Other rating classes */}
                    {options.ratingClasses.map((ratingClass) => {
                      const quote = planQuotes.find(q => q.rating_class === ratingClass)
                      if (!quote) return null
                      const rate = quote.rate.month / 100
                      const standardRate = getBaseQuote(planQuotes).rate.month / 100
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
                            <div className="font-semibold">${rate.toFixed(0)}/mo</div>
                            {difference !== 0 && (
                              <div className={`text-sm ${difference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {difference > 0 ? '+' : ''}${difference.toFixed(0)}/mo
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
                  <div>
                    <Label className="text-base font-medium mb-3 block">Available Discounts:</Label>
                    <div className="space-y-3">
                      {options.discounts.map((discount) => {
                        const discountAmount = (baseQuote.rate.month / 100) * discount.value
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
                                  {discount.value * 100}% discount available
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-green-600 font-medium">
                                Save ${discountAmount.toFixed(0)}/mo ({Math.round(discount.value * 100)}%)
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}

              <Separator />
              
              {/* Final Price Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Base Rate:</span>
                  <span className="text-sm">${baseRate.toFixed(2)}/mo</span>
                </div>
                {config.discounts.length > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-green-600">Total Discounts:</span>
                    <span className="text-sm text-green-600">-${savings.toFixed(2)}/mo</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="font-bold">Final Rate:</span>
                  <span className="font-bold text-lg">${finalRate.toFixed(2)}/mo</span>
                </div>
              </div>
              
              <Button 
                onClick={() => onPlanSelect?.(baseQuote, finalRate)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                size="lg"
              >
                Select This Plan
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
