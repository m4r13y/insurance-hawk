"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface MedigapCarrierGroupProps {
  carrierGroup: any;
  selectedQuotePlans: string[];
  paymentMode: 'monthly' | 'quarterly' | 'annually';
  getCachedLogoUrl: (carrierName: string, carrierId: string) => string;
  calculateDiscountedPrice: (quote: any) => number;
  convertPriceByPaymentMode: (price: number) => number;
  getPaymentLabel: () => string;
  setShowPlanDifferencesModal: (show: boolean) => void;
  openPlanModal: (carrierGroup: any) => void;
}

export default function MedigapCarrierGroup({
  carrierGroup,
  selectedQuotePlans,
  paymentMode,
  getCachedLogoUrl,
  calculateDiscountedPrice,
  convertPriceByPaymentMode,
  getPaymentLabel,
  setShowPlanDifferencesModal,
  openPlanModal
}: MedigapCarrierGroupProps) {
  // Filter plans based on selected plan types
  const filteredQuotes = carrierGroup.quotes.filter((quote: any) => 
    selectedQuotePlans.includes(quote.plan)
  );
  
  // Skip carrier if no plans match selected types
  if (filteredQuotes.length === 0) return null;
  
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
                  alt={`${carrierGroup.carrierName} logo`}
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    const target = e.currentTarget;
                    const parent = target.parentElement;
                    if (parent) {
                      target.style.display = 'none';
                      const initials = carrierGroup.carrierName
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
                <h3 className="text-xl font-bold text-primary">{carrierGroup.carrierName}</h3>
                <p className="text-sm text-muted-foreground">
                  {filteredQuotes.length} plan{filteredQuotes.length !== 1 ? 's' : ''} available
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
              // Calculate price range for this plan type
              const premiums = quotesArray.map((q: any) => calculateDiscountedPrice(q));
              const minPremium = Math.min(...premiums);
              const maxPremium = Math.max(...premiums);
              const hasMultipleVersions = quotesArray.length > 1;
              
              // Get the best quote for this plan type (lowest premium)
              const bestQuote = quotesArray.find((q: any) => {
                const premium = calculateDiscountedPrice(q);
                return premium === minPremium;
              }) || quotesArray[0];

              return (
                <div key={planType} className={`flex flex-col p-6 rounded-lg bg-card/50 transition-colors h-full min-h-[300px] ${
                  selectedQuotePlans.length > 1 ? (
                    planType === 'F' ? 'bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800' :
                    planType === 'G' ? 'bg-green-50/80 dark:bg-green-950/30 border border-green-200 dark:border-green-800' :
                    planType === 'N' ? 'bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800' :
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
                      {hasMultipleVersions ? 
                        `$${Math.round(convertPriceByPaymentMode(minPremium))}-$${Math.round(convertPriceByPaymentMode(maxPremium))}` : 
                        `$${Math.round(convertPriceByPaymentMode(minPremium))}`
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
                       planType === 'G' ? 'Covers all gaps except Part B deductible ($240/yr)' :
                       planType === 'N' ? 'Lower cost with small copays for office visits & ER' :
                       'Medicare Supplement coverage'}
                    </div>
                    
                    {hasMultipleVersions && (
                      <p className="text-sm text-muted-foreground">
                        Multiple versions available
                      </p>
                    )}
                    {bestQuote.discounts && bestQuote.discounts.length > 0 && (
                      <p className="text-xs text-blue-600">
                        Available discounts: {bestQuote.discounts.map((d: any) => {
                          const name = d.name.charAt(0).toUpperCase() + d.name.slice(1);
                          const value = d.type === 'percent' ? `${Math.round(d.value * 100)}%` : `$${d.value}`;
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
