import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuoteOverviewProps } from './types';

export default function DataAnalysis({ quote }: QuoteOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Premium Analysis */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Premium Analysis</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-green-700 font-medium">Annual Cost</div>
              <div className="text-lg font-bold text-green-900">
                ${(quote.monthlyPremium * 12).toFixed(2)}
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-blue-700 font-medium">Cost vs. Maximum</div>
              <div className="text-lg font-bold text-blue-900">
                {((quote.monthlyPremium * 12 / quote.annualMaximum) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Benefit Analysis */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Benefit Analysis</h4>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-purple-700 font-medium">Maximum Benefit Ratio</div>
              <div className="text-lg font-bold text-purple-900">
                {(quote.annualMaximum / (quote.monthlyPremium * 12)).toFixed(1)}:1
              </div>
              <div className="text-xs text-purple-600">Maximum benefit per $1 premium</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
