import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckIcon, StarIcon, GearIcon, DiscIcon } from '@radix-ui/react-icons';
import { QuoteData } from './types.js';
import { 
  consolidateQuoteVariations, 
  getRecommendedOption, 
  calculateMaxSavings, 
  type ConsolidatedPlan, 
  type PlanOption,
  type RatingOption,
  type DiscountOption 
} from '@/lib/plan-consolidation';

interface ImprovedAllPlansTabProps {
  quoteData: QuoteData;
  carrierQuotes: QuoteData[];
  formatCurrency: (amount: number) => string;
  calculateDiscountedRate: (rate: number, discounts: any[]) => number;
}

export const ImprovedAllPlansTab: React.FC<ImprovedAllPlansTabProps> = ({
  quoteData,
  carrierQuotes,
  formatCurrency,
  calculateDiscountedRate
}) => {
  const [consolidatedPlans, setConsolidatedPlans] = React.useState<ConsolidatedPlan[]>([]);
  const [selectedRatings, setSelectedRatings] = React.useState<Record<string, string>>({});
  const [selectedDiscounts, setSelectedDiscounts] = React.useState<Record<string, string>>({});

  // Consolidate quotes on mount and when carrierQuotes change
  React.useEffect(() => {
    const plans = consolidateQuoteVariations(carrierQuotes);
    setConsolidatedPlans(plans);
    
    // Set default selected ratings and discounts
    const defaultRatings: Record<string, string> = {};
    const defaultDiscounts: Record<string, string> = {};
    
    plans.forEach(plan => {
      if (plan.recommendedRatingId) {
        defaultRatings[plan.id] = plan.recommendedRatingId;
      }
      if (plan.recommendedDiscountId) {
        defaultDiscounts[plan.id] = plan.recommendedDiscountId;
      }
    });
    
    setSelectedRatings(defaultRatings);
    setSelectedDiscounts(defaultDiscounts);
  }, [carrierQuotes]);

  const handleRatingChange = (planId: string, ratingId: string) => {
    setSelectedRatings(prev => ({
      ...prev,
      [planId]: ratingId
    }));
  };

  const handleDiscountChange = (planId: string, discountId: string) => {
    setSelectedDiscounts(prev => ({
      ...prev,
      [planId]: discountId
    }));
  };

  const getCalculatedRate = (plan: ConsolidatedPlan): {
    monthlyRate: number;
    savings: number;
    savingsPercent: number;
  } => {
    const selectedRatingId = selectedRatings[plan.id];
    const selectedDiscountId = selectedDiscounts[plan.id];
    
    // Find selected rating option
    const selectedRating = plan.ratingOptions.find(r => r.id === selectedRatingId);
    const baseRate = selectedRating?.rate.month || plan.baseRate.month;
    
    // Apply discount if selected
    let finalRate = baseRate;
    let savings = 0;
    let savingsPercent = 0;
    
    if (selectedDiscountId) {
      const selectedDiscount = plan.discountOptions.find(d => d.id === selectedDiscountId);
      if (selectedDiscount) {
        savings = selectedDiscount.savings;
        savingsPercent = selectedDiscount.savingsPercent;
        finalRate = baseRate - savings;
      }
    }
    
    return {
      monthlyRate: finalRate,
      savings: savings,
      savingsPercent: savingsPercent
    };
  };

  if (consolidatedPlans.length === 0) {
    return (
      <TabsContent value="quotes" className="space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No plan variations found.</p>
          </CardContent>
        </Card>
      </TabsContent>
    );
  }

  return (
    <TabsContent value="quotes" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Plan Options from {quoteData.company_base.name}</CardTitle>
          <p className="text-muted-foreground">
            Configure your plan by selecting rating class and available discounts separately.
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          {consolidatedPlans.map((plan, planIndex) => {
            const calculatedRate = getCalculatedRate(plan);
            const maxSavings = calculateMaxSavings(plan);
            
            return (
              <div key={plan.id} className="border rounded-lg p-6 space-y-6">
                {/* Plan Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant={planIndex === 0 ? "default" : "outline"} className="text-sm">
                        Plan {plan.plan}
                      </Badge>
                      {planIndex === 0 && (
                        <Badge variant="secondary" className="text-xs">
                          <StarIcon className="h-3 w-3 mr-1" />
                          Best Value
                        </Badge>
                      )}
                      {maxSavings.amount > 0 && (
                        <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                          Save up to {formatCurrency(maxSavings.amount)}/mo
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {plan.ratingOptions.length} rating option{plan.ratingOptions.length !== 1 ? 's' : ''} • {plan.discountOptions.length} discount{plan.discountOptions.length !== 1 ? 's' : ''} available • {plan.rate_type}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(calculatedRate.monthlyRate)}/mo
                    </div>
                    {calculatedRate.savings > 0 && (
                      <div className="text-sm text-green-600">
                        Save {formatCurrency(calculatedRate.savings)}/mo ({calculatedRate.savingsPercent.toFixed(0)}%)
                      </div>
                    )}
                  </div>
                </div>

                {/* Configuration Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Rating Class Selection */}
                  {plan.ratingOptions.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <GearIcon className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-medium text-sm">Rating Class</h4>
                      </div>
                      
                      {plan.ratingOptions.length > 1 ? (
                        <RadioGroup 
                          value={selectedRatings[plan.id] || ''} 
                          onValueChange={(value) => handleRatingChange(plan.id, value)}
                          className="space-y-2"
                        >
                          {plan.ratingOptions.map((rating) => (
                            <div key={rating.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                              <RadioGroupItem value={rating.id} id={rating.id} />
                              <Label htmlFor={rating.id} className="flex-1 cursor-pointer">
                                <div className="flex items-center justify-between">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{rating.name}</span>
                                      {rating.isRecommended && (
                                        <Badge variant="secondary" className="text-xs px-2 py-0.5">
                                          <CheckIcon className="h-3 w-3 mr-1" />
                                          Recommended
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{rating.description}</p>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-semibold">{formatCurrency(rating.rate.month)}/mo</div>
                                  </div>
                                </div>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      ) : (
                        <div className="p-3 border rounded-lg bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">{plan.ratingOptions[0].name}</span>
                              <p className="text-xs text-muted-foreground mt-1">{plan.ratingOptions[0].description}</p>
                            </div>
                            <div className="font-semibold">{formatCurrency(plan.ratingOptions[0].rate.month)}/mo</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Discount Options */}
                  {plan.discountOptions.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <DiscIcon className="h-4 w-4 text-green-600" />
                        <h4 className="font-medium text-sm">Available Discounts</h4>
                      </div>
                      
                      <RadioGroup 
                        value={selectedDiscounts[plan.id] || ''} 
                        onValueChange={(value) => handleDiscountChange(plan.id, value)}
                        className="space-y-2"
                      >
                        {/* No discount option */}
                        <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value="" id={`no-discount-${plan.id}`} />
                          <Label htmlFor={`no-discount-${plan.id}`} className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <span className="font-medium">No Discount</span>
                                <p className="text-xs text-muted-foreground">Standard pricing</p>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">$0/mo savings</div>
                              </div>
                            </div>
                          </Label>
                        </div>
                        
                        {plan.discountOptions.map((discount) => (
                          <div key={discount.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                            <RadioGroupItem value={discount.id} id={discount.id} />
                            <Label htmlFor={discount.id} className="flex-1 cursor-pointer">
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{discount.name}</span>
                                    <Badge variant="outline" className="text-xs px-2 py-0.5 bg-green-50 text-green-700 border-green-200">
                                      {discount.discountPercent}% off
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground">{discount.description}</p>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-green-600">
                                    Save {formatCurrency(discount.savings)}/mo
                                  </div>
                                  <div className="text-xs text-green-600">
                                    ({discount.savingsPercent.toFixed(0)}% savings)
                                  </div>
                                </div>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}
                </div>

                {/* Final Rate Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-blue-900">Your Configuration</h5>
                      <p className="text-sm text-blue-700 mt-1">
                        {plan.ratingOptions.find(r => r.id === selectedRatings[plan.id])?.name || 'Standard'} 
                        {selectedDiscounts[plan.id] && plan.discountOptions.find(d => d.id === selectedDiscounts[plan.id]) && 
                          ` with ${plan.discountOptions.find(d => d.id === selectedDiscounts[plan.id])?.name}`
                        }
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-blue-900">
                        {formatCurrency(calculatedRate.monthlyRate)}/mo
                      </div>
                      {calculatedRate.savings > 0 && (
                        <div className="text-sm text-green-600">
                          Total savings: {formatCurrency(calculatedRate.savings)}/mo
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  <Button 
                    variant={planIndex === 0 ? "default" : "outline"} 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      console.log('Selected plan:', {
                        planId: plan.id,
                        ratingId: selectedRatings[plan.id],
                        discountId: selectedDiscounts[plan.id],
                        finalRate: calculatedRate.monthlyRate
                      });
                    }}
                  >
                    {planIndex === 0 ? "Select This Plan" : "Choose This Option"}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Detailed Comparison Table */}
      {consolidatedPlans.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Plan Comparison</CardTitle>
            <p className="text-muted-foreground text-sm">
              Compare your configured options across all available plans.
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Feature</th>
                    {consolidatedPlans.map((plan, index) => (
                      <th key={plan.id} className="text-center p-3">
                        Plan {plan.plan}
                        {index === 0 && (
                          <Badge variant="secondary" className="ml-2 text-xs">Best Value</Badge>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Selected Rating</td>
                    {consolidatedPlans.map(plan => {
                      const selectedRating = plan.ratingOptions.find(r => r.id === selectedRatings[plan.id]);
                      return (
                        <td key={plan.id} className="text-center p-3">
                          <div className="font-medium text-sm">{selectedRating?.name || 'Standard'}</div>
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Selected Discount</td>
                    {consolidatedPlans.map(plan => {
                      const selectedDiscount = plan.discountOptions.find(d => d.id === selectedDiscounts[plan.id]);
                      return (
                        <td key={plan.id} className="text-center p-3">
                          <div className="font-medium text-sm">
                            {selectedDiscount?.name || 'None'}
                          </div>
                          {selectedDiscount && (
                            <div className="text-xs text-green-600">
                              {selectedDiscount.discountPercent}% off
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Final Premium</td>
                    {consolidatedPlans.map(plan => {
                      const calculatedRate = getCalculatedRate(plan);
                      return (
                        <td key={plan.id} className="text-center p-3">
                          <div className="font-bold text-primary">
                            {formatCurrency(calculatedRate.monthlyRate)}/mo
                          </div>
                          {calculatedRate.savings > 0 && (
                            <div className="text-xs text-green-600">
                              {formatCurrency(calculatedRate.savings)} savings
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Rating Options</td>
                    {consolidatedPlans.map(plan => (
                      <td key={plan.id} className="text-center p-3">
                        {plan.ratingOptions.length} option{plan.ratingOptions.length !== 1 ? 's' : ''}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Discounts Available</td>
                    {consolidatedPlans.map(plan => (
                      <td key={plan.id} className="text-center p-3">
                        {plan.discountOptions.length} discount{plan.discountOptions.length !== 1 ? 's' : ''}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </TabsContent>
  );
};
