import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { QuoteData } from './types.js';

interface CompanyTabProps {
  quoteData: QuoteData;
  getRatingColor: (rating: string) => string;
}

export const CompanyTab: React.FC<CompanyTabProps> = ({
  quoteData,
  getRatingColor
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount / 100);
  };

  return (
    <TabsContent value="company" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Full Name</h4>
                <p className="font-semibold">{quoteData.company_base.name_full}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">NAIC Code</h4>
                <p className="font-semibold">{quoteData.company_base.naic}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Company Type</h4>
                <p className="font-semibold">{quoteData.company_base.type}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Established</h4>
                <p className="font-semibold">{quoteData.company_base.established_year}</p>
              </div>
            </div>
            
            {quoteData.company_base.parent_company_base && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Parent Company</h4>
                  <p className="text-sm">{quoteData.company_base.parent_company_base.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Est. {quoteData.company_base.parent_company_base.established_year}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Financial Ratings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>A.M. Best Rating</span>
                <span className={`font-bold ${getRatingColor(quoteData.company_base.ambest_rating)}`}>
                  {quoteData.company_base.ambest_rating !== 'n/a' ? quoteData.company_base.ambest_rating : 'Not Rated'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>A.M. Best Outlook</span>
                <span className="font-medium">
                  {quoteData.company_base.ambest_outlook !== 'n/a' ? quoteData.company_base.ambest_outlook : 'Not Available'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>S&P Rating</span>
                <span className="font-medium">
                  {quoteData.company_base.sp_rating !== 'n/a' ? quoteData.company_base.sp_rating : 'Not Rated'}
                </span>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Customer Complaints</span>
                <span className="text-sm font-medium">
                  {quoteData.company_base.customer_complaint_ratio !== null 
                    ? `${quoteData.company_base.customer_complaint_ratio}%`
                    : 'Not Available'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Customer Satisfaction</span>
                <span className="text-sm font-medium">
                  {quoteData.company_base.customer_satisfaction_ratio > 0 
                    ? `${quoteData.company_base.customer_satisfaction_ratio}%`
                    : 'Not Available'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Data */}
      {quoteData.company_base.med_supp_market_data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Medicare Supplement Market Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quoteData.company_base.med_supp_market_data.slice(0, 3).map((data, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Year {data.year}</h4>
                    <Badge variant="outline">
                      {(data.med_supp_national_market_data.market_share * 100).toFixed(4)}% Market Share
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Lives Covered</span>
                      <p className="font-medium">{data.med_supp_national_market_data.lives.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Claims</span>
                      <p className="font-medium">{formatCurrency(data.med_supp_national_market_data.claims)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Premiums</span>
                      <p className="font-medium">{formatCurrency(data.med_supp_national_market_data.premiums)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </TabsContent>
  );
};
