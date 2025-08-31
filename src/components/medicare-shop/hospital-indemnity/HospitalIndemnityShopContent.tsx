"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Building2, Calendar, DollarSign } from "lucide-react";

interface HospitalIndemnityQuote {
  id: string;
  planName: string;
  carrierName: string;
  monthlyPremium: number;
  dailyBenefit: number;
  maxDays: number;
  waitingPeriod?: number;
  benefits: string[];
  exclusions?: string[];
  rating?: number;
}

interface HospitalIndemnityShopContentProps {
  quotes: HospitalIndemnityQuote[];
  isLoading?: boolean;
  onSelectPlan?: (quote: HospitalIndemnityQuote) => void;
}

export default function HospitalIndemnityShopContent({ 
  quotes, 
  isLoading = false, 
  onSelectPlan 
}: HospitalIndemnityShopContentProps) {
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
        <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Hospital Indemnity Plans Found</h3>
        <p className="text-gray-500">
          We couldn't find any hospital indemnity insurance plans for your area. Please try adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Hospital Indemnity Plans ({quotes.length})
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
                  <div className="text-2xl font-bold text-green-600">
                    ${quote.monthlyPremium}
                  </div>
                  <div className="text-sm text-gray-500">per month</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm text-green-700">Daily Benefit</div>
                  <div className="font-semibold text-green-800">${quote.dailyBenefit}</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm text-green-700">Maximum Days</div>
                  <div className="font-semibold text-green-800">{quote.maxDays} days</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm text-green-700">Max Annual Benefit</div>
                  <div className="font-semibold text-green-800">
                    ${(quote.dailyBenefit * quote.maxDays).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h5 className="font-medium mb-2">Covered Benefits</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {quote.benefits.slice(0, 6).map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <Building2 className="h-3 w-3 text-green-500" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                {quote.waitingPeriod && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {quote.waitingPeriod} day waiting period
                  </Badge>
                )}
                <Badge variant="secondary">
                  ${quote.dailyBenefit}/day benefit
                </Badge>
                <Badge variant="outline">
                  Up to {quote.maxDays} days
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Pays cash benefits for hospital stays
                </div>
                <Button 
                  onClick={() => onSelectPlan?.(quote)}
                  className="bg-green-600 hover:bg-green-700"
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
