"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { consolidateQuoteVariations } from "@/lib/plan-consolidation";

interface MedigapCarrierGroupProps {
  carrierGroup: any;
  selectedQuotePlans: string[];
  paymentMode: 'monthly' | 'quarterly' | 'annually';
  getCachedLogoUrl: (carrierName: string, carrierId: string) => string;
  getCarrierDisplayName: (carrierName: string, carrierId: string) => string;
  calculateDiscountedPrice: (quote: any) => number;
  convertPriceByPaymentMode: (price: number) => number;
  getPaymentLabel: () => string;
  setShowPlanDifferencesModal: (show: boolean) => void;
  openPlanModal: (carrierGroup: any) => void;
  applyDiscounts?: boolean;
}

export default function MedigapCarrierGroup({
  carrierGroup,
  selectedQuotePlans,
  paymentMode,
  getCachedLogoUrl,
  getCarrierDisplayName,
  calculateDiscountedPrice,
  convertPriceByPaymentMode,
  getPaymentLabel,
  setShowPlanDifferencesModal,
  openPlanModal,
  applyDiscounts = false
}: MedigapCarrierGroupProps) {
  // Filter plans based on selected plan types
  const filteredQuotes = carrierGroup.quotes.filter((quote: any) => 
    selectedQuotePlans.includes(quote.plan)
  );
  
  // Skip carrier if no plans match selected types
  if (filteredQuotes.length === 0) return null;

  // Function to process options based on discount toggle - copied from test-quote-processor
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
  };
  
  // Helper function to get base rate without discounts
  const getBaseRate = (quote: any) => {
    // Handle different rate formats - some have monthly, others have semi_annual
    let rate = 0;
    if (quote.rate?.month) {
      rate = quote.rate.month;
    } else if (quote.rate?.semi_annual) {
      rate = quote.rate.semi_annual / 6; // Convert semi-annual to monthly
    } else {
      rate = quote.monthly_premium || quote.premium || 0;
    }
    
    // Convert from cents to dollars (rates are stored in cents)
    return rate >= 100 ? rate / 100 : rate;
  };
  
  // Helper function to calculate price range based on rating classes only
  const calculateRatingClassRange = (quotes: any[]) => {
    const baseRates = quotes.map(getBaseRate);
    return {
      min: Math.min(...baseRates),
      max: Math.max(...baseRates)
    };
  };
  
  // Helper function to calculate price range including discounts
  const calculateDiscountedRange = (quotes: any[]) => {
    const discountedRates = quotes.map(calculateDiscountedPrice);
    return {
      min: Math.min(...discountedRates),
      max: Math.max(...discountedRates)
    };
  };
  
  // Helper function to get rating class information
  const getRatingClassInfo = (quotes: any[]) => {
    const ratingClasses = new Set<string>();
    quotes.forEach(quote => {
      if (quote.rating_class && quote.rating_class.trim()) {
        ratingClasses.add(quote.rating_class);
      }
    });
    return {
      count: ratingClasses.size + 1, // +1 for standard
      classes: Array.from(ratingClasses)
    };
  };
  
  // Add formatRate function to match test-quote-processor precision
  const formatRate = (rate: any) => {
    if (typeof rate === 'number') {
      const actualRate = rate >= 100 ? rate / 100 : rate;
      // Round to whole numbers when 2-3 plans are selected for cleaner display
      if (selectedQuotePlans.length >= 2) {
        return `$${Math.round(actualRate)}`;
      }
      return `$${actualRate.toFixed(2)}`;
    }
    return 'N/A';
  };

  // Get the proper display name from NAIC data
  const displayName = getCarrierDisplayName(carrierGroup.carrierName, carrierGroup.carrierId);
  
  // Create filtered carrier group
  const filteredCarrierGroup = {
    ...carrierGroup,
    quotes: filteredQuotes
  };
  
  return (
    <Card key={`${carrierGroup.carrierId}-${selectedQuotePlans.join('-')}`} className="group hover:shadow-xl transition-all duration-300 hover:border-primary/20">
      <CardContent className="p-6">
        {/* Carrier Header */}
        <div className="mb-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Carrier Logo */}
              <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                <Image
                  src={getCachedLogoUrl(carrierGroup.carrierName, carrierGroup.carrierId)}
                  alt={`${displayName} logo`}
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    const target = e.currentTarget;
                    const parent = target.parentElement;
                    if (parent) {
                      target.style.display = 'none';
                      const initials = displayName
                        .split(' ')
                        .map((word: string) => word[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase();
                      parent.innerHTML = `<span class="text-sm font-semibold text-gray-600">${initials}</span>`;
                    }
                  }}
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary">{displayName}</h3>
                <p className="text-sm text-muted-foreground">
                  {(() => {
                    // Use the consolidation logic to get accurate rating class count
                    const consolidated = consolidateQuoteVariations(filteredQuotes);
                    if (consolidated.length === 0) return "No plans available";
                    
                    // Get the total number of processed options across all plans
                    const totalProcessedOptions = consolidated.reduce((total, plan) => {
                      const processedOptions = processOptionsForDisplay(plan);
                      return total + processedOptions.length;
                    }, 0);
                    
                    // If no processed options, show 0
                    if (totalProcessedOptions === 0) {
                      return "No options available";
                    }
                    
                    return `${totalProcessedOptions} option${totalProcessedOptions !== 1 ? 's' : ''} available`;
                  })()}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowPlanDifferencesModal(true)}
              className="text-xs px-3 py-1"
            >
              {selectedQuotePlans.length === 1 ? "What's covered?" : "What's the difference?"}
            </Button>
          </div>
        </div>

        {/* Plans from this carrier - flexible layout that adjusts to content */}
        <div className={`space-y-6 md:space-y-0 ${
          selectedQuotePlans.length === 1 
            ? 'md:grid md:grid-cols-1'
            : selectedQuotePlans.length === 2
            ? 'md:grid md:grid-cols-2 md:gap-6' 
            : 'md:grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
        } md:gap-4`}>
          {(() => {
            console.log('MedigapCarrierGroup layout debug:', {
              carrierName: carrierGroup.carrierName,
              selectedQuotePlans,
              selectedPlansLength: selectedQuotePlans.length,
              layoutClass: selectedQuotePlans.length === 1 
                ? 'md:grid md:grid-cols-1'
                : selectedQuotePlans.length === 2
                ? 'md:grid md:grid-cols-2 md:gap-6' 
                : 'md:grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
            });
            return null;
          })()}
          {(() => {
            // Group quotes by plan type within this carrier (only for selected plan types)
            const planGroups = filteredQuotes.reduce((groups: Record<string, any[]>, quote: any) => {
              const planType = quote.plan || 'Unknown';
              if (!groups[planType]) {
                groups[planType] = [];
              }
              groups[planType].push(quote);
              return groups;
            }, {} as Record<string, any[]>);

            return Object.entries(planGroups).map(([planType, quotes], index: number) => {
              const quotesArray = quotes as any[];
              
              // Get consolidated plan for this plan type
              const consolidatedPlans = consolidateQuoteVariations(quotesArray);
              const plan = consolidatedPlans[0]; // Should only be one plan per plan type
              
              // Process options using our discount filtering logic
              const displayOptions = plan ? processOptionsForDisplay(plan) : [];
              
              // Calculate price range from processed options
              const rates = displayOptions.map((opt: any) => opt.rate?.month || 0);
              const minRate = rates.length > 0 ? Math.min(...rates) : 0;
              const maxRate = rates.length > 0 ? Math.max(...rates) : 0;
              
              // Rates are already in dollars, no conversion needed
              const displayMinRate = minRate;
              const displayMaxRate = maxRate;
              
              const priceRange = { min: displayMinRate, max: displayMaxRate };
              const hasRange = priceRange.min !== priceRange.max && rates.length > 1;
              
              const ratingInfo = {
                count: displayOptions.length,
                classes: displayOptions.map((opt: any) => opt.rating_class || 'Standard')
              };
              
              // Get the best quote for this plan type (lowest rate from processed options)
              const bestOption = displayOptions.find((opt: any) => {
                const optRate = opt.rate?.month || 0;
                const displayRate = optRate >= 100 ? optRate / 100 : optRate;
                return Math.abs(displayRate - priceRange.min) < 0.01; // Small tolerance for floating point comparison
              });
              
              // Find the corresponding quote for the best option
              const bestQuote = bestOption ? quotesArray.find((q: any) => 
                q.id === bestOption.id || 
                (q.rating_class === bestOption.rating_class && q.view_type === bestOption.view_type)
              ) || quotesArray[0] : quotesArray[0];

              return (
                <div key={planType} className={`flex flex-col p-6 rounded-lg bg-card/50 transition-colors h-full min-h-[300px] ${
                  selectedQuotePlans.length > 1 ? (
                    planType === 'F' ? 'border border-blue-200 dark:border-blue-800' :
                    planType === 'G' ? 'border border-green-200 dark:border-green-800' :
                    planType === 'N' ? 'border border-purple-200 dark:border-purple-800' :
                    'bg-card'
                  ) : 'bg-card'
                }`}>
                  {/* Plan Header - Price with type indicator */}
                  <div className="flex items-baseline gap-1 mb-4">
                    <div className={`font-bold text-primary ${
                      selectedQuotePlans.length === 2 
                        ? 'text-2xl md:text-3xl' 
                        : 'text-2xl md:text-2xl lg:text-3xl'
                    }`}>
                      {hasRange ? 
                        `${formatRate(convertPriceByPaymentMode(priceRange.min))}-${formatRate(convertPriceByPaymentMode(priceRange.max))}` : 
                        `${formatRate(convertPriceByPaymentMode(priceRange.min))}`
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">{getPaymentLabel()}</div>
                  </div>
                  
                  {/* Plan Details - flex-grow to push button to bottom */}
                  <div className="flex-grow space-y-2 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-lg">
                        Plan {planType}
                      </h4>
                      {selectedQuotePlans.length > 1 && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs font-semibold ${
                            selectedQuotePlans.length > 1 ? (
                              planType === 'F' ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' :
                              planType === 'G' ? 'bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' :
                              planType === 'N' ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' :
                              'bg-muted text-muted-foreground border-border'
                            ) : 'bg-muted text-muted-foreground border-border'
                          }`}
                        >
                          {planType === 'F' ? 'Eligible Before 2020' :
                           planType === 'G' ? 'Popular Choice' :
                           planType === 'N' ? 'Lower Premium' :
                           'Medicare Supplement'}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Plan type description */}
                    <div className="text-sm text-muted-foreground mb-2">
                      {planType === 'F' ? 'Only available if eligible for Medicare before Jan 1, 2020. Covers all gaps.' :
                       planType === 'G' ? 'Covers all gaps except Part B deductible ($257/yr)' :
                       planType === 'N' ? 'Lower cost with small copays for office visits & ER' :
                       'Medicare Supplement coverage'}
                    </div>
                    
                    {ratingInfo.count > 1 && (
                      <p className="text-sm text-muted-foreground">
                        {ratingInfo.count} rating classes available
                      </p>
                    )}
                    {applyDiscounts && bestQuote.discounts && bestQuote.discounts.length > 0 && (
                      <p className="text-xs text-green-600">
                        {applyDiscounts ? 'Discounts applied: ' : 'Available discounts: '}{bestQuote.discounts.map((d: any) => {
                          const name = d.name.charAt(0).toUpperCase() + d.name.slice(1);
                          const discountPercent = d.value ? (d.value * 100) : (d.percent || 0);
                          const value = d.type === 'percent' ? `${Math.round(discountPercent)}%` : `$${d.value}`;
                          return `${name} (${value})`;
                        }).join(', ')}
                      </p>
                    )}
                    {!applyDiscounts && bestQuote.discounts && bestQuote.discounts.length > 0 && (
                      <p className="text-xs text-blue-600">
                        Available discounts: {bestQuote.discounts.map((d: any) => {
                          const name = d.name.charAt(0).toUpperCase() + d.name.slice(1);
                          const discountPercent = d.value ? (d.value * 100) : (d.percent || 0);
                          const value = d.type === 'percent' ? `${Math.round(discountPercent)}%` : `$${d.value}`;
                          return `${name} (${value})`;
                        }).join(', ')}
                      </p>
                    )}
                    {bestQuote.effective_date && (
                      <p className="text-xs text-muted-foreground">
                        Effective: {new Date(bestQuote.effective_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  
                  {/* Action Button - always at bottom */}
                  <div className="mt-auto">
                    <Button size="default" className="w-full" onClick={() => openPlanModal(filteredCarrierGroup)}>
                      Select Plan
                    </Button>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </CardContent>
    </Card>
  );
}
