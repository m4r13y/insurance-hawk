"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarIcon, PersonIcon, HeartIcon } from "@radix-ui/react-icons";
import { PlanCardsSkeleton } from "@/components/medicare-shop/shared";

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
    return (
      <div className="text-center py-12">
        <HeartIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Cancer Insurance Plans Found</h3>
        <p className="text-gray-500">
          We couldn't find any cancer insurance plans for your area. Please try adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Cancer Insurance Plans ({quotes.length})
        </h3>
      </div>

      <div className="space-y-4">
        {quotes.map((quote, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-lg">{quote.plan_name}</h4>
                  </div>
                  <p className="text-gray-600">{quote.carrier}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">
                    ${quote.monthly_premium}
                  </div>
                  <div className="text-sm text-gray-500">per month</div>
                </div>
              </div>

              {quote.benefit_amount && (
                <div className="bg-purple-50 p-3 rounded-lg mb-4">
                  <div className="text-sm text-purple-700">Maximum Benefit Amount</div>
                  <div className="font-semibold text-purple-800">
                    ${quote.benefit_amount.toLocaleString()}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <h5 className="font-medium mb-2">Key Benefits</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {/* Since API doesn't provide specific benefits, show standard cancer insurance benefits */}
                  {[
                    'Lump sum payment upon diagnosis',
                    'No network restrictions',
                    'Use benefits as you choose',
                    'Coverage for treatment costs',
                    'Additional living expenses',
                    'Peace of mind protection'
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <PersonIcon className="h-3 w-3 text-green-500" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <Badge variant="secondary">
                  Cancer Insurance Coverage
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <span className="text-xs">$</span>
                  ${quote.benefit_amount.toLocaleString()} benefit
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span>View plan details for limitations and exclusions</span>
                </div>
                <Button 
                  onClick={() => onSelectPlan?.(quote)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Select Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
