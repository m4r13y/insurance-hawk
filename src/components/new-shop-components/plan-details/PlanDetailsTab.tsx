import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckIcon, InfoCircledIcon } from '@radix-ui/react-icons';
import { QuoteData } from './types.js';

interface PlanDetailsTabProps {
  quoteData: QuoteData;
}

export const PlanDetailsTab: React.FC<PlanDetailsTabProps> = ({
  quoteData
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount / 100);
  };

  return (
    <TabsContent value="plan" className="space-y-6">
  <Card className="h-fit bg-white/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 backdrop-blur">
        <CardHeader>
          <CardTitle>Medicare Supplement Plan {quoteData.plan} Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Covered Benefits</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm">Medicare Part A Hospital Deductible</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm">Medicare Part A Hospital Coinsurance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm">Medicare Part B Medical Coinsurance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm">First 3 Pints of Blood</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm">Hospice Care Coinsurance</span>
                </div>
                {quoteData.plan === 'F' || quoteData.plan === 'G' ? (
                  <div className="flex items-center space-x-2">
                    <CheckIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">Medicare Part B Deductible</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <InfoCircledIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Medicare Part B Deductible (Not Covered)</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Additional Features</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <InfoCircledIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm">Works with any Medicare-accepting doctor</span>
                </div>
                <div className="flex items-center space-x-2">
                  <InfoCircledIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm">No network restrictions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <InfoCircledIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm">No referrals needed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <InfoCircledIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm">Guaranteed renewable</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate Information */}
  <Card className="h-fit bg-white/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 backdrop-blur">
        <CardHeader>
          <CardTitle>Rate Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Payment Options</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Monthly</span>
                  <span className="font-medium">{formatCurrency(quoteData.rate.month)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quarterly</span>
                  <span className="font-medium">{formatCurrency(quoteData.rate.quarter)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Semi-Annual</span>
                  <span className="font-medium">{formatCurrency(quoteData.rate.semi_annual)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Annual</span>
                  <span className="font-medium">{formatCurrency(quoteData.rate.annual)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Rate Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Rate Type</span>
                  <span className="font-medium capitalize">{quoteData.rate_type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Age at Quote</span>
                  <span className="font-medium">{quoteData.age}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tobacco User</span>
                  <span className="font-medium">{quoteData.tobacco ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gender</span>
                  <span className="font-medium">{quoteData.gender === 'M' ? 'Male' : 'Female'}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};
