"use client";

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Shield, Calendar, DollarSign, ChevronDown } from "lucide-react";
import { 
  OptimizedDentalQuote, 
  groupQuotesByPlan,
  sortQuotesByPremium
} from "@/lib/dental-quote-optimizer";
import { PlanCardsSkeleton } from "@/components/medicare-shop/shared";

interface DentalShopContentProps {
  quotes: OptimizedDentalQuote[];
  isLoading?: boolean;
  onSelectPlan?: (quote: OptimizedDentalQuote) => void;
}

export default function DentalShopContent({ 
  quotes, 
  isLoading = false, 
  onSelectPlan 
}: DentalShopContentProps) {
  // Group quotes by plan name
  const groupedQuotes = React.useMemo(() => {
    const groups = groupQuotesByPlan(quotes);
    // Sort quotes within each group by premium
    Object.keys(groups).forEach(planName => {
      groups[planName] = sortQuotesByPremium(groups[planName]);
    });
    return groups;
  }, [quotes]);
  
  // State to track selected quote for each plan
  const [selectedQuotes, setSelectedQuotes] = useState<{[planName: string]: string}>({});
  
  // Handle quote selection change within a plan
  const handleQuoteSelection = (planName: string, quoteId: string) => {
    setSelectedQuotes(prev => ({
      ...prev,
      [planName]: quoteId
    }));
  };
  
  // Get the selected quote for a plan (default to first/cheapest)
  const getSelectedQuote = (planName: string, planQuotes: OptimizedDentalQuote[]) => {
    const selectedId = selectedQuotes[planName] || planQuotes[0]?.id;
    return planQuotes.find(q => q.id === selectedId) || planQuotes[0];
  };

  if (isLoading) {
    return <PlanCardsSkeleton count={5} title="Dental Insurance Plans" />;
  }

  if (!quotes || quotes.length === 0) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No dental plans found</h3>
        <p className="text-gray-500">Please try adjusting your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Dental Insurance Plans ({quotes.length} found)
        </h2>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedQuotes).map(([planName, planQuotes]) => {
          const selectedQuote = getSelectedQuote(planName, planQuotes);
          
          return (
            <Card key={planName} className="border border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {selectedQuote.planName}
                      </h3>
                      {selectedQuote.ambestRating && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {selectedQuote.ambestRating}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-2">{selectedQuote.companyFullName}</p>
                    <p className="text-sm text-gray-500">NAIC: {selectedQuote.naic}</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      ${selectedQuote.monthlyPremium}/mo
                    </div>
                    <div className="text-sm text-gray-500">
                      ${selectedQuote.annualMaximum.toLocaleString()} annual max
                    </div>
                  </div>
                </div>

                {/* Annual Maximum Selection */}
                {planQuotes.length > 1 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Choose Annual Maximum:
                    </label>
                    <Select
                      value={selectedQuotes[planName] || planQuotes[0].id}
                      onValueChange={(value) => handleQuoteSelection(planName, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {planQuotes.map((quote) => (
                          <SelectItem key={quote.id} value={quote.id}>
                            ${quote.annualMaximum.toLocaleString()} - ${quote.monthlyPremium}/mo
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Plan Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700">
                      ${selectedQuote.annualMaximum.toLocaleString()} Annual Maximum
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-700">
                      {selectedQuote.ambestOutlook} Outlook
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-gray-700">
                      Age {selectedQuote.age}
                    </span>
                  </div>
                </div>

                {/* Benefits and Limitations */}
                <div className="mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedQuote.benefitNotes && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Benefits</h4>
                        <div 
                          className="text-sm text-gray-600 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: selectedQuote.benefitNotes }}
                        />
                      </div>
                    )}
                    {selectedQuote.limitationNotes && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Limitations</h4>
                        <div 
                          className="text-sm text-gray-600 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: selectedQuote.limitationNotes }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={() => onSelectPlan?.(selectedQuote)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                  >
                    Select This Plan
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
