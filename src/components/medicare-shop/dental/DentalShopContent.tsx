"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Shield, Calendar, DollarSign } from "lucide-react";

interface DentalQuote {
  id: string;
  planName: string;
  carrierName: string;
  monthlyPremium: number;
  annualMaximum: number;
  deductible: number;
  preventiveCoverage: number;
  basicCoverage: number;
  majorCoverage: number;
  orthodonticCoverage?: number;
  waitingPeriods: {
    preventive: number;
    basic: number;
    major: number;
  };
  networkSize?: number;
  rating?: number;
}

interface DentalShopContentProps {
  quotes: DentalQuote[];
  isLoading?: boolean;
  onSelectPlan?: (quote: DentalQuote) => void;
}

export default function DentalShopContent({ 
  quotes, 
  isLoading = false, 
  onSelectPlan 
}: DentalShopContentProps) {
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
        <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Dental Plans Found</h3>
        <p className="text-gray-500">
          We couldn't find any dental insurance plans for your area. Please try adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Dental Insurance Plans ({quotes.length})
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
                  <div className="text-2xl font-bold text-blue-600">
                    ${quote.monthlyPremium}
                  </div>
                  <div className="text-sm text-gray-500">per month</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Annual Maximum</div>
                  <div className="font-semibold">${quote.annualMaximum.toLocaleString()}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Deductible</div>
                  <div className="font-semibold">${quote.deductible}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Preventive</div>
                  <div className="font-semibold">{quote.preventiveCoverage}%</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Basic</div>
                  <div className="font-semibold">{quote.basicCoverage}%</div>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  No waiting period for preventive
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  {quote.majorCoverage}% major coverage
                </Badge>
                {quote.orthodonticCoverage && (
                  <Badge variant="outline">
                    {quote.orthodonticCoverage}% orthodontic
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Basic waiting: {quote.waitingPeriods.basic} months</span>
                  <span>Major waiting: {quote.waitingPeriods.major} months</span>
                  {quote.networkSize && (
                    <span>{quote.networkSize.toLocaleString()} providers</span>
                  )}
                </div>
                <Button 
                  onClick={() => onSelectPlan?.(quote)}
                  className="bg-blue-600 hover:bg-blue-700"
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
