"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Shield, Heart, DollarSign } from "lucide-react";

interface CancerInsuranceQuote {
  id: string;
  planName: string;
  carrierName: string;
  monthlyPremium: number;
  benefits: string[];
  limitations: string[];
  rating?: number;
  benefitAmount?: number;
  waitingPeriod?: number;
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
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!quotes || quotes.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
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
        {quotes.map((quote) => (
          <Card key={quote.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-lg">{quote.planName}</h4>
                    {quote.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">{quote.rating}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600">{quote.carrierName}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">
                    ${quote.monthlyPremium}
                  </div>
                  <div className="text-sm text-gray-500">per month</div>
                </div>
              </div>

              {quote.benefitAmount && (
                <div className="bg-purple-50 p-3 rounded-lg mb-4">
                  <div className="text-sm text-purple-700">Maximum Benefit Amount</div>
                  <div className="font-semibold text-purple-800">
                    ${quote.benefitAmount.toLocaleString()}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <h5 className="font-medium mb-2">Key Benefits</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {quote.benefits.slice(0, 6).map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <Shield className="h-3 w-3 text-green-500" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                {quote.waitingPeriod && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {quote.waitingPeriod} day waiting period
                  </Badge>
                )}
                <Badge variant="secondary">
                  {quote.benefits.length} total benefits
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {quote.limitations.length > 0 && (
                    <span>View plan details for limitations and exclusions</span>
                  )}
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
