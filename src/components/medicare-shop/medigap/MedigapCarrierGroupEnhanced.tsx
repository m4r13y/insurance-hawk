"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { consolidateQuoteVariations, ConsolidatedPlan } from "@/lib/plan-consolidation";
import { getCarrierDisplayName, getCarrierLogoUrl } from "@/lib/carrier-system";

interface MedigapCarrierGroupEnhancedProps {
  carrierGroup: any;
  selectedQuotePlans: string[];
  paymentMode: 'monthly' | 'quarterly' | 'annually';
  applyDiscounts?: boolean;
  onSelectPlan: (carrierGroup: any, plan: ConsolidatedPlan) => void;
  onShowPlanDifferences: () => void;
}

export default function MedigapCarrierGroupEnhanced({
  carrierGroup,
  selectedQuotePlans,
  paymentMode,
  applyDiscounts = false,
  onSelectPlan,
  onShowPlanDifferences
}: MedigapCarrierGroupEnhancedProps) {
  
  // Use pre-consolidated plans if available, otherwise consolidate
  const consolidatedPlans = React.useMemo(() => {
    // If carrier group already has consolidated plans, use those
    if (carrierGroup.consolidatedPlans && carrierGroup.consolidatedPlans.length > 0) {
      return carrierGroup.consolidatedPlans.filter((plan: ConsolidatedPlan) => 
        selectedQuotePlans.includes(plan.plan)
      );
    }
    
    // Fallback: consolidate the quotes ourselves
    const plans = consolidateQuoteVariations(carrierGroup.quotes || []);
    return plans.filter(plan => selectedQuotePlans.includes(plan.plan));
  }, [carrierGroup.consolidatedPlans, carrierGroup.quotes, selectedQuotePlans]);
  
  // Skip carrier if no plans match selected types
  if (consolidatedPlans.length === 0) return null;
  
  // Get carrier display info
  const originalCarrierName = carrierGroup.originalCarrierName || carrierGroup.carrierName;
  const displayName = getCarrierDisplayName(originalCarrierName);
  const logoUrl = getCarrierLogoUrl(originalCarrierName);
  
  // Helper functions for display
  const convertPriceByPaymentMode = (monthlyPrice: number): number => {
    switch (paymentMode) {
      case 'annually': return monthlyPrice * 12;
      case 'quarterly': return monthlyPrice * 3;
      default: return monthlyPrice;
    }
  };
  
  const getPaymentLabel = (): string => {
    switch (paymentMode) {
      case 'annually': return '/year';
      case 'quarterly': return '/quarter';
      default: return '/month';
    }
  };
  
  // Calculate displayed options based on discount toggle
  const getDisplayOptions = (plan: ConsolidatedPlan) => {
    if (!applyDiscounts) {
      // Show base options without discounts
      return plan.options.filter(opt => 
        opt.type === 'standard' || opt.type === 'rating_class'
      );
    } else {
      // Show options with discounts applied
      return plan.options.filter(opt => 
        opt.type === 'household_discount' || opt.type === 'discount' || 
        (opt.type === 'rating_class' && opt.discounts.length > 0) ||
        (opt.type === 'standard' && plan.options.length === 1)
      );
    }
  };
  
  // Calculate price range for a plan
  const getPriceRange = (plan: ConsolidatedPlan) => {
    const displayOptions = getDisplayOptions(plan);
    if (displayOptions.length === 0) return { min: plan.baseRate.month, max: plan.baseRate.month };
    
    const rates = displayOptions.map(opt => opt.rate.month);
    return {
      min: Math.min(...rates),
      max: Math.max(...rates)
    };
  };
  
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:border-primary/20">
      <CardContent className="p-6">
        {/* Carrier Header */}
        <div className="mb-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Carrier Logo with fallback */}
              <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={`${displayName} logo`}
                    width={48}
                    height={48}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      if (target.nextSibling) {
                        (target.nextSibling as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                {/* Fallback initials */}
                <div className="text-sm font-semibold text-gray-600" style={{ display: logoUrl ? 'none' : 'flex' }}>
                  {displayName.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-primary">{displayName}</h3>
                <p className="text-sm text-muted-foreground">
                  {(() => {
                    const totalRatingOptions = consolidatedPlans.reduce((total: number, plan: ConsolidatedPlan) => {
                      return total + plan.ratingOptions.length;
                    }, 0);
                    return `${totalRatingOptions} rating class${totalRatingOptions !== 1 ? 'es' : ''} available`;
                  })()}
                </p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={onShowPlanDifferences}
              className="text-xs px-3 py-1"
            >
              {selectedQuotePlans.length === 1 ? "What's covered?" : "What's the difference?"}
            </Button>
          </div>
        </div>

        {/* Plans Grid - responsive layout */}
        <div className={`space-y-6 md:space-y-0 ${
          consolidatedPlans.length === 1 
            ? 'md:grid md:grid-cols-1'
            : consolidatedPlans.length === 2
            ? 'md:grid md:grid-cols-2 md:gap-6' 
            : 'md:grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
        } md:gap-4`}>
          {consolidatedPlans.map((plan: ConsolidatedPlan) => {
            const displayOptions = getDisplayOptions(plan);
            const priceRange = getPriceRange(plan);
            const hasRange = priceRange.min !== priceRange.max;
            
            // Check for pre-calculated discounts
            const hasPreCalculatedDiscounts = plan.options.some((opt: any) => 
              opt.type === 'household_discount' && opt.name.includes('Household')
            );
            
            return (
              <div 
                key={plan.id}
                className={`flex flex-col p-6 rounded-lg bg-card/50 transition-colors h-full min-h-[300px] ${
                  consolidatedPlans.length > 1 ? (
                    plan.plan === 'F' ? 'border border-blue-200 dark:border-blue-800' :
                    plan.plan === 'G' ? 'border border-green-200 dark:border-green-800' :
                    plan.plan === 'N' ? 'border border-purple-200 dark:border-purple-800' :
                    'bg-card'
                  ) : 'bg-card'
                }`}
              >
                {/* Plan Header - Price */}
                <div className="flex items-baseline gap-1 mb-4">
                  <div className={`font-bold text-primary ${
                    consolidatedPlans.length === 2 
                      ? 'text-2xl md:text-3xl' 
                      : 'text-2xl md:text-2xl lg:text-3xl'
                  }`}>
                    {hasRange ? 
                      `$${Math.round(convertPriceByPaymentMode(priceRange.min))}-$${Math.round(convertPriceByPaymentMode(priceRange.max))}` : 
                      `$${Math.round(convertPriceByPaymentMode(priceRange.min))}`
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">{getPaymentLabel()}</div>
                </div>
                
                {/* Plan Details */}
                <div className="flex-grow space-y-2 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-lg">Plan {plan.plan}</h4>
                    {consolidatedPlans.length > 1 && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs font-semibold ${
                          plan.plan === 'F' ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' :
                          plan.plan === 'G' ? 'bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' :
                          plan.plan === 'N' ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' :
                          'bg-muted text-muted-foreground border-border'
                        }`}
                      >
                        {plan.plan === 'F' ? 'Eligible Before 2020' :
                         plan.plan === 'G' ? 'Popular Choice' :
                         plan.plan === 'N' ? 'Lower Premium' :
                         'Medicare Supplement'}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Plan Description */}
                  <div className="text-sm text-muted-foreground mb-2">
                    {plan.plan === 'F' ? 'Only available if eligible for Medicare before Jan 1, 2020. Covers all gaps.' :
                     plan.plan === 'G' ? 'Covers all gaps except Part B deductible ($257/yr)' :
                     plan.plan === 'N' ? 'Lower cost with small copays for office visits & ER' :
                     'Medicare Supplement coverage'}
                  </div>
                  
                  {/* Option count and discount info */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {displayOptions.length} option{displayOptions.length !== 1 ? 's' : ''}
                    </Badge>
                    
                    {hasPreCalculatedDiscounts && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                        pre-calculated discounts
                      </Badge>
                    )}
                    
                    {plan.ratingOptions.length > 1 && (
                      <Badge variant="outline" className="text-xs">
                        {plan.ratingOptions.length} rating classes
                      </Badge>
                    )}
                  </div>
                  
                  {/* Effective date */}
                  <p className="text-xs text-muted-foreground">
                    Effective: {new Date(plan.effective_date).toLocaleDateString()}
                  </p>
                </div>
                
                {/* Action Button */}
                <div className="mt-auto">
                  <Button 
                    size="default" 
                    className="w-full" 
                    onClick={() => onSelectPlan(carrierGroup, plan)}
                  >
                    Select Plan {plan.plan}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
