import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { QuoteData } from './types.js';
import { AgeBasedRateChart } from './AgeBasedRateChart';

interface UnderwritingTabProps {
  quoteData: QuoteData;
}

export const UnderwritingTab: React.FC<UnderwritingTabProps> = ({
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
    <TabsContent value="underwriting" className="space-y-6">
  <Card className="h-fit bg-white/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 backdrop-blur">
        <CardHeader>
          <CardTitle>Underwriting Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Application Process</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Online Application</span>
                  <Badge variant={quoteData.e_app_link ? "default" : "secondary"}>
                    {quoteData.e_app_link ? "Available" : "Paper Only"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Medical Underwriting</span>
                  <Badge variant="default">Required</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Rating Class</span>
                  <span className="text-sm font-medium">
                    {quoteData.rating_class || 'Standard'}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Coverage Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Effective Date</span>
                  <span className="font-medium">
                    {new Date(quoteData.effective_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Coverage Expires</span>
                  <span className="font-medium">
                    {new Date(quoteData.expires_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Renewable</span>
                  <span className="font-medium">Guaranteed</span>
                </div>
              </div>
            </div>
          </div>

          {quoteData.age_increases && quoteData.age_increases.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-3">Age-Based Rate Increases</h4>
                <div className="text-sm text-muted-foreground mb-4">
                  Projected annual rate increases based on age progression
                </div>
                
                {/* Visual Chart */}
                <div>
                  <AgeBasedRateChart 
                    ageIncreases={quoteData.age_increases} 
                    currentAge={quoteData.age || 0}
                  />
                </div>
              </div>
            </>
          )}

          {/* Riders */}
          {quoteData.riders && quoteData.riders.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-3">Available Riders</h4>
                <div className="space-y-2">
                  {quoteData.riders.map((rider: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{rider.name}</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(rider.premium)}/mo
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Important Notes */}
  <Card className="h-fit bg-white/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <InfoCircledIcon className="w-5 h-5" />
            <span>Important Notes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>Medicare Supplement insurance requires medical underwriting. Your health status may affect approval and premium rates.</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>Rates shown are for the age and location specified. Actual rates may vary based on final underwriting.</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>This policy does not cover prescription drugs. A separate Medicare Part D plan may be needed.</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <p>Coverage begins the first day of the month following approval and payment of first premium.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};
