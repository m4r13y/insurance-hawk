import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, PersonIcon, StarIcon } from "@radix-ui/react-icons";
import { QuoteOverviewProps } from './types';

export default function QuoteOverview({ quote }: QuoteOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PersonIcon className="h-5 w-5" />
          Quote Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Carrier</label>
            <p className="text-lg font-semibold">{quote.companyName}</p>
            <p className="text-sm text-gray-500">{quote.companyFullName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Plan</label>
            <p className="text-lg font-semibold">{quote.planName}</p>
            <p className="text-sm text-gray-500">{quote.fullPlanName}</p>
          </div>
        </div>
        
        <Separator />
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Monthly Premium</label>
            <p className="text-2xl font-bold text-green-600">${quote.monthlyPremium.toFixed(2)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Annual Maximum</label>
            <p className="text-2xl font-bold text-blue-600">${quote.annualMaximum.toLocaleString()}</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <StarIcon className="h-4 w-4 text-green-600" />
            <span className="text-sm">
              <strong>AM Best Rating:</strong> {quote.ambestRating} ({quote.ambestOutlook})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-blue-600" />
            <span className="text-sm">
              <strong>Age:</strong> {quote.age} | <strong>State:</strong> {quote.state}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
