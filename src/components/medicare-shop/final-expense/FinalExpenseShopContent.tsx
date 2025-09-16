"use client";

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircledIcon, StarFilledIcon, PersonIcon, ClockIcon, FileTextIcon, GlobeIcon, CalendarIcon } from "@radix-ui/react-icons";
import { PlanCardsSkeleton } from "@/components/medicare-shop/shared";
import { FinalExpenseEmptyState } from "./";
import { 
  FinalExpenseQuote, 
  FinalExpenseShopContentProps, 
  getFinalExpenseCarrierName, 
  getFinalExpenseCarrierFullName,
  groupFinalExpenseQuotesByCompany,
  GroupedFinalExpenseQuotes
} from "@/types/final-expense";
import { getEnhancedCarrierInfo, getCarrierDisplayName } from "@/lib/carrier-system";

export default function FinalExpenseShopContent({ 
  quotes, 
  isLoading = false, 
  onSelectPlan 
}: FinalExpenseShopContentProps) {
  if (isLoading) {
    return <PlanCardsSkeleton count={5} title="Final Expense Life Insurance" />;
  }

  if (!quotes || quotes.length === 0) {
    return <FinalExpenseEmptyState />;
  }

  // Helper function to format currency properly
  const formatCurrency = (amount: number): string => {
    // Handle edge case where monthly_rate might be in cents or incorrectly scaled
    // Final expense monthly premiums should typically be under $500/month
    let adjustedAmount = amount;
    
    // If amount is suspiciously large (>$1000), it might be annual or in cents
    if (amount > 1000) {
      // Check if dividing by 100 gives a reasonable monthly premium (cents to dollars)
      if (amount / 100 <= 500) {
        adjustedAmount = amount / 100;
      }
      // Check if dividing by 12 gives a reasonable monthly premium (annual to monthly)
      else if (amount / 12 <= 500) {
        adjustedAmount = amount / 12;
      }
      // If still large, cap at a reasonable maximum
      else {
        adjustedAmount = Math.min(amount, 500);
      }
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(adjustedAmount).replace('$', '');
  };

  // Helper function to format fees with consistent 2 decimal places
  const formatFee = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount).replace('$', '');
  };

  // Helper function to get carrier display name using the carrier system
  const getCarrierDisplayNameForQuote = (quote: FinalExpenseQuote): string => {
    const carrierName = getFinalExpenseCarrierName(quote);
    return getCarrierDisplayName(carrierName, 'final-expense');
  };

  // Helper function for carrier logo
  const getCarrierLogoUrl = (quote: FinalExpenseQuote): string => {
    const carrierName = getFinalExpenseCarrierName(quote);
    const tempQuote = { carrier: { name: carrierName } };
    const enhancedInfo = getEnhancedCarrierInfo(tempQuote, 'final-expense');
    return enhancedInfo.logoUrl || '/images/carrier-placeholder.svg';
  };

  // Group quotes by company for price range display
  const groupedQuotes = groupFinalExpenseQuotesByCompany(quotes);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {groupedQuotes.map((group, index) => (
          <Card key={group.company_key || index} className="hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300">
            {/* Header with Logo and Company */}
            <div className="flex items-center justify-between p-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  <Image
                    src={getCarrierLogoUrl(group.quotes[0])}
                    alt={`${getCarrierDisplayNameForQuote(group.quotes[0])} logo`}
                    width={40}
                    height={40}
                    className="w-full h-full object-contain"
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      const target = e.currentTarget;
                      const parent = target.parentElement;
                      if (parent) {
                        target.style.display = 'none';
                      }
                    }}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-base">
                    {getCarrierDisplayNameForQuote(group.quotes[0])}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {group.plan_count} option{group.plan_count !== 1 ? 's' : ''} available
                  </p>
                </div>
              </div>
            </div>

            <div className="px-4 pb-4">
              {/* Price Range */}
              <div className="mb-4">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {group.price_range.min === group.price_range.max 
                    ? `$${formatCurrency(group.price_range.min)}`
                    : `$${formatCurrency(group.price_range.min)} - $${formatCurrency(group.price_range.max)}`
                  } <span className="text-base font-normal text-gray-600">/month</span>
                </div>
              </div>

              {/* Plan Description */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900">Final Expense Life Insurance</h4>
                <p className="text-sm text-gray-600">
                  Multiple coverage amounts available
                </p>
              </div>

              {/* Fee Badges - Clear Display */}
              {(group.quotes.some(q => q.monthly_fee) || group.quotes.some(q => q.annual_fee)) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {group.quotes.some(q => q.monthly_fee) && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                      ${formatFee(group.quotes.find(q => q.monthly_fee)?.monthly_fee || 0)} monthly policy fee
                    </span>
                  )}
                  {group.quotes.some(q => q.annual_fee) && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                      ${formatFee(group.quotes.find(q => q.annual_fee)?.annual_fee || 0)} annual policy fee
                    </span>
                  )}
                </div>
              )}

              {/* Select Button */}
              <Button 
                onClick={() => onSelectPlan?.(group.quotes[0])}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-3"
                size="lg"
              >
                Select Plan
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
