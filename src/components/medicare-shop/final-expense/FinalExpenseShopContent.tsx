"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Umbrella, Calendar, DollarSign } from "lucide-react";

interface FinalExpenseQuote {
  id: string;
  planName: string;
  carrierName: string;
  monthlyPremium: number;
  coverageAmount: number;
  ageRange: string;
  guaranteed?: boolean;
  waitingPeriod?: number;
  features: string[];
  rating?: number;
}

interface FinalExpenseShopContentProps {
  quotes: FinalExpenseQuote[];
  isLoading?: boolean;
  onSelectPlan?: (quote: FinalExpenseQuote) => void;
}

export default function FinalExpenseShopContent({ 
  quotes, 
  isLoading = false, 
  onSelectPlan 
}: FinalExpenseShopContentProps) {
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
        <Umbrella className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Final Expense Plans Found</h3>
        <p className="text-gray-500">
          We couldn't find any final expense life insurance plans for your area. Please try adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Final Expense Life Insurance Plans ({quotes.length})
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
                    {quote.guaranteed && (
                      <Badge variant="default" className="bg-orange-100 text-orange-800">
                        Guaranteed Acceptance
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600">{quote.carrierName}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600">
                    ${quote.monthlyPremium}
                  </div>
                  <div className="text-sm text-gray-500">per month</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="text-sm text-orange-700">Coverage Amount</div>
                  <div className="font-semibold text-orange-800">
                    ${quote.coverageAmount.toLocaleString()}
                  </div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="text-sm text-orange-700">Age Range</div>
                  <div className="font-semibold text-orange-800">{quote.ageRange}</div>
                </div>
              </div>

              <div className="mb-4">
                <h5 className="font-medium mb-2">Plan Features</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {quote.features.slice(0, 6).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <Umbrella className="h-3 w-3 text-orange-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                {quote.waitingPeriod ? (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {quote.waitingPeriod} year waiting period
                  </Badge>
                ) : (
                  <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700">
                    <Calendar className="h-3 w-3" />
                    No waiting period
                  </Badge>
                )}
                {quote.guaranteed && (
                  <Badge variant="secondary">
                    No medical exam required
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Coverage for final expenses and burial costs
                </div>
                <Button 
                  onClick={() => onSelectPlan?.(quote)}
                  className="bg-orange-600 hover:bg-orange-700"
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
