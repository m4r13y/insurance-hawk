"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { consolidateQuoteVariations, ConsolidatedPlan } from "@/lib/plan-consolidation";

interface PlanOptionsTableProps {
  carrierGroup: any;
  selectedQuotePlans: string[];
  paymentMode: 'monthly' | 'quarterly' | 'annually';
  convertPriceByPaymentMode: (price: number) => number;
  getPaymentLabel: () => string;
  onSelectOption: (carrierGroup: any, option: any) => void;
}

export default function PlanOptionsTable({
  carrierGroup,
  selectedQuotePlans,
  paymentMode,
  convertPriceByPaymentMode,
  getPaymentLabel,
  onSelectOption
}: PlanOptionsTableProps) {
  console.log('PlanOptionsTable Debug:', {
    carrierGroup,
    selectedQuotePlans,
    quotesLength: carrierGroup?.quotes?.length
  });

  const [selectedRatingClass, setSelectedRatingClass] = useState<string>('');
  const [selectedDiscounts, setSelectedDiscounts] = useState<Set<string>>(new Set());
  const [currentPrice, setCurrentPrice] = useState<number>(0);

  // Filter quotes based on selected plan types
  const filteredQuotes = carrierGroup.quotes.filter((quote: any) => 
    selectedQuotePlans.includes(quote.plan)
  );

  console.log('PlanOptionsTable Filtered:', {
    filteredQuotesLength: filteredQuotes.length,
    filteredQuotes
  });

  // Consolidate the quote variations
  const consolidatedPlans = consolidateQuoteVariations(filteredQuotes);

  console.log('PlanOptionsTable Consolidated:', {
    consolidatedPlansLength: consolidatedPlans.length,
    consolidatedPlans
  });

  if (consolidatedPlans.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No plan options available</p>
        <p className="text-sm text-muted-foreground mt-2">
          Debug: {filteredQuotes.length} filtered quotes, {consolidatedPlans.length} consolidated plans
        </p>
      </div>
    );
  }

  // Get all unique rating classes and discounts across all plans
  const allRatingClasses = new Set<string>();
  const allDiscountTypes = new Set<string>();
  const allOptions = new Map<string, any>();

  consolidatedPlans.forEach(plan => {
    plan.ratingOptions.forEach(rating => {
      allRatingClasses.add(rating.ratingClass);
    });
    plan.discountOptions.forEach(discount => {
      allDiscountTypes.add(discount.name);
    });
    plan.options.forEach(option => {
      const key = `${option.rating_class || 'Standard'}-${option.discounts.map(d => d.name).join(',')}`;
      allOptions.set(key, option);
    });
  });

  // Convert sets to sorted arrays
  const ratingClasses = Array.from(allRatingClasses).sort();
  const discountTypes = Array.from(allDiscountTypes).sort();

  // Calculate current price based on selections
  React.useEffect(() => {
    const rating = selectedRatingClass || 'Standard';
    const discountsList = Array.from(selectedDiscounts).join(',');
    const key = `${rating}-${discountsList}`;
    const option = allOptions.get(key);
    
    if (option) {
      setCurrentPrice(option.rate.month);
    } else {
      // Find base option if exact match not found
      const baseOption = Array.from(allOptions.values()).find(opt => 
        (opt.rating_class || 'Standard') === rating
      );
      if (baseOption) {
        let price = baseOption.rate.month;
        // Apply selected discounts manually
        selectedDiscounts.forEach(discountName => {
          const discount = consolidatedPlans[0]?.discountOptions.find(d => d.name === discountName);
          if (discount) {
            price = price * (1 - discount.discountPercent / 100);
          }
        });
        setCurrentPrice(price);
      }
    }
  }, [selectedRatingClass, selectedDiscounts, allOptions, consolidatedPlans]);

  return (
    <div className="space-y-6">
      {/* Plan Selection Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Configure Your Plan Options</CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose your rating class and available discounts to see your personalized rate.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rating Class Selection */}
          <div>
            <h4 className="font-semibold mb-3">Rating Class</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="ratingClass"
                  value=""
                  checked={selectedRatingClass === ''}
                  onChange={(e) => setSelectedRatingClass('')}
                  className="text-primary"
                />
                <span>Standard</span>
              </label>
              {ratingClasses.map(rating => (
                <label key={rating} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="ratingClass"
                    value={rating}
                    checked={selectedRatingClass === rating}
                    onChange={(e) => setSelectedRatingClass(rating)}
                    className="text-primary"
                  />
                  <span>{rating}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Discount Selection */}
          {discountTypes.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Available Discounts</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {discountTypes.map(discount => {
                  const discountInfo = consolidatedPlans[0]?.discountOptions.find(d => d.name === discount);
                  return (
                    <label key={discount} className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={selectedDiscounts.has(discount)}
                        onCheckedChange={(checked) => {
                          const newSelected = new Set(selectedDiscounts);
                          if (checked) {
                            newSelected.add(discount);
                          } else {
                            newSelected.delete(discount);
                          }
                          setSelectedDiscounts(newSelected);
                        }}
                      />
                      <span>{discount}</span>
                      {discountInfo && (
                        <Badge variant="outline" className="text-green-600">
                          Save {discountInfo.discountPercent}%
                        </Badge>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Current Selection Summary */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h5 className="font-semibold">Your Configuration:</h5>
                <p className="text-sm text-muted-foreground">
                  {selectedRatingClass || 'Standard'} rating class
                  {selectedDiscounts.size > 0 && (
                    <span> with {Array.from(selectedDiscounts).join(', ')} discount{selectedDiscounts.size > 1 ? 's' : ''}</span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  ${Math.round(convertPriceByPaymentMode(currentPrice))}
                </div>
                <div className="text-sm text-muted-foreground">{getPaymentLabel()}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Options Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Available Options Comparison</CardTitle>
          <p className="text-sm text-muted-foreground">
            Compare all rating classes and discount combinations to find the best option for you.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Rating Class</th>
                  <th className="text-left p-3 font-semibold">Discounts</th>
                  <th className="text-right p-3 font-semibold">Base Rate</th>
                  <th className="text-right p-3 font-semibold">Discounted Rate</th>
                  <th className="text-right p-3 font-semibold">Savings</th>
                  <th className="text-center p-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(allOptions.values())
                  .sort((a, b) => a.rate.month - b.rate.month)
                  .map((option, index) => {
                    const baseRate = convertPriceByPaymentMode(option.rate.month);
                    const hasDiscounts = option.discounts && option.discounts.length > 0;
                    const savings = option.savings ? convertPriceByPaymentMode(option.savings) : 0;
                    const savingsPercent = option.savingsPercent || 0;
                    
                    return (
                      <tr key={option.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span>{option.rating_class || 'Standard'}</span>
                            {option.isRecommended && (
                              <Badge variant="default" className="text-xs">Recommended</Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          {hasDiscounts ? (
                            <div className="space-y-1">
                              {option.discounts.map((discount: any, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs mr-1">
                                  {discount.name} ({discount.type === 'percent' ? `${Math.round(discount.value * 100)}%` : `$${discount.value}`})
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </td>
                        <td className="p-3 text-right font-mono">
                          ${Math.round(baseRate)}
                        </td>
                        <td className="p-3 text-right font-mono font-semibold">
                          ${Math.round(baseRate)}
                        </td>
                        <td className="p-3 text-right">
                          {savings > 0 ? (
                            <div className="text-green-600">
                              <div className="font-semibold">${Math.round(savings)}</div>
                              <div className="text-xs">({Math.round(savingsPercent)}%)</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <Button
                            size="sm"
                            variant={option.isRecommended ? "default" : "outline"}
                            onClick={() => onSelectOption(carrierGroup, option)}
                          >
                            Select
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
