"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarIcon, HomeIcon, CalendarIcon, CheckCircledIcon, TokensIcon as DollarSign } from "@radix-ui/react-icons";
import { OptimizedHospitalIndemnityQuote } from "@/lib/hospital-indemnity-quote-optimizer";
import { PlanCardsSkeleton } from "@/components/medicare-shop/shared";

interface HospitalIndemnityShopContentProps {
  quotes: OptimizedHospitalIndemnityQuote[];
  isLoading?: boolean;
  onSelectPlan?: (quote: OptimizedHospitalIndemnityQuote) => void;
}

export default function HospitalIndemnityShopContent({ 
  quotes, 
  isLoading = false, 
  onSelectPlan 
}: HospitalIndemnityShopContentProps) {
  if (isLoading) {
    return <PlanCardsSkeleton count={4} title="Hospital Indemnity Plans" />;
  }

  if (!quotes || quotes.length === 0) {
    return (
      <div className="text-center py-12">
        <HomeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Hospital Indemnity Plans Found</h3>
        <p className="text-gray-500">
          We couldn't find any hospital indemnity insurance plans for your area. Please try adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {quotes.map((quote) => {
          // Get the main hospital confinement benefit from base plans
          const basePlans = quote.basePlans || [];
          const mainBasePlan = basePlans.find(plan => 
            plan?.name?.toLowerCase().includes('hospital confinement') && plan?.included
          );
          
          // Get the daily benefit amounts from the main base plan
          const dailyBenefitOptions = mainBasePlan?.benefitOptions || [];
          const lowestDailyBenefit = dailyBenefitOptions.length > 0 
            ? Math.min(...dailyBenefitOptions.map(opt => parseInt(opt.amount) || 0))
            : 0;
          const highestDailyBenefit = dailyBenefitOptions.length > 0 
            ? Math.max(...dailyBenefitOptions.map(opt => parseInt(opt.amount) || 0))
            : 0;

          // Count included riders for benefits display
          const riders = quote.riders || [];
          const includedRiders = riders.filter(rider => rider?.included);
          const additionalRiders = riders.filter(rider => !rider?.included);

          return (
            <Card key={quote.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-lg">{quote.planName}</h4>
                      {quote.ambest?.rating && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <StarIcon className="h-3 w-3" />
                          {quote.ambest.rating}
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600">{quote.companyName}</p>
                    <p className="text-sm text-gray-500">{quote.companyFullName}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      ${quote.monthlyPremium || 0}
                    </div>
                    <div className="text-sm text-gray-500">per month</div>
                    {(quote.policyFee || 0) > 0 && (
                      <div className="text-xs text-gray-400">
                        +${quote.policyFee} policy fee
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm text-green-700">Daily Benefit Range</div>
                    <div className="font-semibold text-green-800">
                      ${lowestDailyBenefit} - ${highestDailyBenefit}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-blue-700">Base Plans</div>
                    <div className="font-semibold text-blue-800">{basePlans.length}</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-sm text-purple-700">Available Riders</div>
                    <div className="font-semibold text-purple-800">{additionalRiders.length}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <h5 className="font-medium mb-2">Included Benefits</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {basePlans.filter(plan => plan?.included).slice(0, 3).map((plan, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircledIcon className="h-3 w-3 text-green-500" />
                        <span>{plan?.name}</span>
                      </div>
                    ))}
                    {includedRiders.slice(0, 3).map((rider, idx) => (
                      <div key={`rider-${idx}`} className="flex items-center gap-2 text-sm">
                        <CheckCircledIcon className="h-3 w-3 text-blue-500" />
                        <span>{rider.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <HomeIcon className="h-3 w-3" />
                    Age {quote.age}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    {quote.state}
                  </Badge>
                  {(quote.hhDiscount || 0) > 0 && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {((quote.hhDiscount || 0) * 100)}% HH Discount
                    </Badge>
                  )}
                  <Badge variant={quote.tobacco ? "destructive" : "outline"}>
                    {quote.tobacco ? "Tobacco" : "Non-Tobacco"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {quote.ambest?.rating ? (
                      `A.M. Best Rating: ${quote.ambest.rating}${quote.ambest.outlook ? ` (${quote.ambest.outlook})` : ''}`
                    ) : (
                      'Rating information not available'
                    )}
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
          );
        })}
      </div>
    </div>
  );
}
