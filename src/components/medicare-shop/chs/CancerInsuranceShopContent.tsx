"use client";

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircledIcon, StarFilledIcon, PersonIcon, ClockIcon, FileTextIcon, GlobeIcon, CalendarIcon } from "@radix-ui/react-icons";
import { PlanCardsSkeleton } from "@/components/medicare-shop/shared";
import { CancerInsuranceEmptyState } from "./";
import { getEnhancedCarrierInfo, getCarrierDisplayName } from "@/lib/carrier-system";

interface CancerInsuranceQuote {
  monthly_premium: number;
  carrier: string;
  plan_name: string;
  benefit_amount: number;
}

interface CancerInsuranceShopContentProps {
  quotes: CancerInsuranceQuote[];
  isLoading?: boolean;
  onSelectPlan?: (quote: CancerInsuranceQuote) => void;
}

export default function CancerInsuranceShopContent({ 
  quotes, 
  isLoading = false, 
  onSelectPlan 
}: CancerInsuranceShopContentProps) {
  if (isLoading) {
    return <PlanCardsSkeleton count={4} title="Cancer Insurance Plans" />;
  }

  if (!quotes || quotes.length === 0) {
    return <CancerInsuranceEmptyState />;
  }

  // Helper function to format currency properly
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount).replace('$', '');
  };

  // Helper function to get carrier display name using the carrier system
  const getCarrierDisplayNameForQuote = (quote: CancerInsuranceQuote): string => {
    return getCarrierDisplayName(quote.carrier, 'cancer');
  };

  // Helper function for carrier logo
  const getCarrierLogoUrl = (quote: CancerInsuranceQuote): string => {
    const tempQuote = { carrier: quote.carrier };
    const enhancedInfo = getEnhancedCarrierInfo(tempQuote, 'cancer');
    return enhancedInfo.logoUrl || '/images/carrier-placeholder.svg';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {quotes.map((quote, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300">
            {/* Header with Logo and Company */}
            <div className="flex items-center justify-between p-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  <Image
                    src={getCarrierLogoUrl(quote)}
                    alt={`${getCarrierDisplayNameForQuote(quote)} logo`}
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
                    {getCarrierDisplayNameForQuote(quote)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Cancer Insurance Coverage
                  </p>
                </div>
              </div>
            </div>

            <div className="px-4 pb-4">
              {/* Price Display */}
              <div className="mb-4">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  ${formatCurrency(quote.monthly_premium)} <span className="text-base font-normal text-gray-600">/month</span>
                </div>
              </div>

              {/* Plan Description */}
              <div className="mb-4">
                <p className="text-lg font-bold text-gray-600">
                  ${quote.benefit_amount?.toLocaleString()} benefit amount
                </p>
              </div>

              {/* Benefits Preview */}
              <div className="mb-4">
                <div className="grid grid-cols-1 gap-2">
                  {[
                    'Lump sum payment upon diagnosis',
                    'No network restrictions', 
                    'Use benefits as you choose'
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircledIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Select Button */}
              <Button 
                onClick={() => onSelectPlan?.(quote)}
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
