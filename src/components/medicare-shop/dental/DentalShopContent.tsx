"use client";

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Shield, Calendar, DollarSign, ChevronDown } from "lucide-react";
import { 
  OptimizedDentalQuote, 
  GroupedDentalQuote,
  groupQuotesByPlan,
  getMonthlyPremium, 
  getAnnualMaximum, 
  getCompanyName, 
  getCompanyRating,
  getCoveragePercentages,
  getWaitingPeriods,
  getDeductible
} from "@/lib/dental-quote-optimizer";

interface DentalShopContentProps {
  quotes: OptimizedDentalQuote[];
  isLoading?: boolean;
  onSelectPlan?: (quote: GroupedDentalQuote, selectedAnnualMaximum?: string) => void;
}

export default function DentalShopContent({ 
  quotes, 
  isLoading = false, 
  onSelectPlan 
}: DentalShopContentProps) {
  // Group quotes by plan
  const groupedQuotes = React.useMemo(() => groupQuotesByPlan(quotes), [quotes]);
  
  // State to track selected annual maximum for each grouped quote
  const [selectedAnnualMaximums, setSelectedAnnualMaximums] = useState<{[key: string]: string}>({});
  
  // Handle annual maximum selection change
  const handleAnnualMaximumChange = (quoteKey: string, annualMaximum: string) => {
    setSelectedAnnualMaximums(prev => ({
      ...prev,
      [quoteKey]: annualMaximum
    }));
  };
  
  // Get the selected annual maximum option for a quote
  const getSelectedOption = (groupedQuote: GroupedDentalQuote) => {
    const selectedAmount = selectedAnnualMaximums[groupedQuote.key] || groupedQuote.defaultAnnualMaximum;
    // Use displayAmount for comparison since that's what we're setting as default now
    return groupedQuote.annualMaximumOptions.find(option => option.displayAmount === selectedAmount) || groupedQuote.annualMaximumOptions[0];
  };

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
          Dental Insurance Plans ({groupedQuotes.length})
        </h3>
      </div>

      <div className="space-y-4">
        {groupedQuotes.map((groupedQuote) => {
          const selectedOption = getSelectedOption(groupedQuote);
          
          return (
            <Card key={groupedQuote.key} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-lg">{groupedQuote.planName}</h4>
                      {groupedQuote.companyRating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600">{groupedQuote.companyRating}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600">{groupedQuote.companyName}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      ${selectedOption.monthlyPremium}
                    </div>
                    <div className="text-sm text-gray-500">per month</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Annual Maximum</div>
                    {groupedQuote.annualMaximumOptions.length > 1 ? (
                      <Select 
                        value={selectedAnnualMaximums[groupedQuote.key] || groupedQuote.defaultAnnualMaximum}
                        onValueChange={(value) => handleAnnualMaximumChange(groupedQuote.key, value)}
                      >
                        <SelectTrigger className="w-full mt-1 font-semibold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {groupedQuote.annualMaximumOptions.map((option) => (
                            <SelectItem key={option.id} value={option.displayAmount}>
                              ${option.displayAmount} - ${option.monthlyPremium}/mo
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="font-semibold">${selectedOption.displayAmount}</div>
                    )}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Deductible</div>
                    <div className="font-semibold">${groupedQuote.deductible}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Preventive</div>
                    <div className="font-semibold">{groupedQuote.coveragePercentages.preventive}%</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Basic</div>
                    <div className="font-semibold">{groupedQuote.coveragePercentages.basic}%</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    No waiting period for preventive
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {groupedQuote.coveragePercentages.major}% major coverage
                  </Badge>
                  {groupedQuote.coveragePercentages.orthodontic && (
                    <Badge variant="outline">
                      {groupedQuote.coveragePercentages.orthodontic}% orthodontic
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Basic waiting: {groupedQuote.waitingPeriods.basic} months</span>
                    <span>Major waiting: {groupedQuote.waitingPeriods.major} months</span>
                  </div>
                  <Button 
                    onClick={() => onSelectPlan?.(groupedQuote, selectedAnnualMaximums[groupedQuote.key])}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Select Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
