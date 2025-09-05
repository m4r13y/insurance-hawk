import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import { getProperLogoUrl } from "@/lib/carrier-system";
import { QuoteData } from './types.js';

interface PlanBuilderTabProps {
  quoteData: QuoteData;
  formatCurrency: (amount: number) => string;
  calculateDiscountedRate: (rate: number, discounts: any[]) => number;
}

export const PlanBuilderTab: React.FC<PlanBuilderTabProps> = ({
  quoteData,
  formatCurrency,
  calculateDiscountedRate
}) => {
  const getRatingColor = (rating: string) => {
    switch (rating.toUpperCase()) {
      case 'A++':
      case 'A+':
        return 'text-green-600';
      case 'A':
      case 'A-':
        return 'text-green-500';
      case 'B++':
      case 'B+':
        return 'text-yellow-600';
      case 'B':
      case 'B-':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <TabsContent value="overview" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan Builder */}
        <div className="lg:col-span-2 space-y-6">
          {/* Coverage Selection */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckIcon className="w-5 h-5 text-green-600" />
                <span>Customize Your Coverage</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Medicare Supplement Plan {quoteData.plan} - Build your perfect coverage package
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Base Plan Selection */}
              <div>
                <h4 className="font-medium mb-3">Base Plan Coverage</h4>
                <div className="border border-primary/20 bg-primary/5 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">Medicare Supplement Plan {quoteData.plan}</h5>
                      <p className="text-sm text-muted-foreground">Standard Medicare supplement coverage</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-primary">
                        {formatCurrency(quoteData.rate.month)}/mo
                      </div>
                      <Badge variant="outline">Included</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Available Add-ons */}
              <div>
                <h4 className="font-medium mb-3">Optional Add-on Coverage</h4>
                <div className="space-y-3">
                  {/* Prescription Drug Coverage */}
                  <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input 
                          type="checkbox" 
                          id="prescription-drug"
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <div>
                          <label htmlFor="prescription-drug" className="font-medium cursor-pointer">
                            Prescription Drug Coverage
                          </label>
                          <p className="text-sm text-muted-foreground">Enhanced prescription drug benefits</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">+$45/mo</div>
                        <Badge variant="secondary">Popular</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Dental Coverage */}
                  <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input 
                          type="checkbox" 
                          id="dental-coverage"
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <div>
                          <label htmlFor="dental-coverage" className="font-medium cursor-pointer">
                            Dental Coverage
                          </label>
                          <p className="text-sm text-muted-foreground">Basic dental care and cleanings</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">+$25/mo</div>
                      </div>
                    </div>
                  </div>

                  {/* Vision Coverage */}
                  <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input 
                          type="checkbox" 
                          id="vision-coverage"
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <div>
                          <label htmlFor="vision-coverage" className="font-medium cursor-pointer">
                            Vision Coverage
                          </label>
                          <p className="text-sm text-muted-foreground">Eye exams and eyewear allowance</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">+$18/mo</div>
                      </div>
                    </div>
                  </div>

                  {/* Wellness Benefits */}
                  <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input 
                          type="checkbox" 
                          id="wellness-benefits"
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <div>
                          <label htmlFor="wellness-benefits" className="font-medium cursor-pointer">
                            Wellness Benefits
                          </label>
                          <p className="text-sm text-muted-foreground">Gym membership and health programs</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">+$12/mo</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Frequency */}
              <div>
                <h4 className="font-medium mb-3">Payment Frequency</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors border-primary bg-primary/5">
                    <div className="flex items-center space-x-2">
                      <input type="radio" name="payment" id="monthly" defaultChecked className="text-primary" />
                      <label htmlFor="monthly" className="cursor-pointer">
                        <div className="font-medium">Monthly</div>
                        <div className="text-sm text-muted-foreground">No discount</div>
                      </label>
                    </div>
                  </div>
                  <div className="border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-2">
                      <input type="radio" name="payment" id="annual" className="text-primary" />
                      <label htmlFor="annual" className="cursor-pointer">
                        <div className="font-medium">Annual</div>
                        <div className="text-sm text-green-600">Save 5%</div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cart Summary */}
        <div className="space-y-6">
          {/* Plan Summary */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-lg">Your Plan Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Plan {quoteData.plan} Base</span>
                  <span>{formatCurrency(quoteData.rate.month)}</span>
                </div>
                
                {/* This will be updated dynamically as user selects add-ons */}
                <div className="flex justify-between text-muted-foreground">
                  <span>Add-ons</span>
                  <span>$0</span>
                </div>
                
                {/* Applied Discounts */}
                {quoteData.discounts.map((discount, index) => (
                  <div key={index} className="flex justify-between text-green-600">
                    <span className="text-sm">
                      {discount.name.charAt(0).toUpperCase() + discount.name.slice(1)} Discount
                    </span>
                    <span className="text-sm">
                      -{formatCurrency(
                        discount.type === 'percent' 
                          ? quoteData.rate.month * discount.value
                          : discount.value
                      )}
                    </span>
                  </div>
                ))}
                
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Monthly</span>
                  <span className="text-primary">
                    {formatCurrency(calculateDiscountedRate(quoteData.rate.month, quoteData.discounts))}
                  </span>
                </div>
              </div>
              
              <Button className="w-full" size="lg">
                Add to Cart
              </Button>
              
              <div className="text-center">
                <Button variant="outline" size="sm" className="text-xs">
                  Save for Later
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Company Info */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                <div className="w-6 h-6 relative">
                  <Image
                    src={getProperLogoUrl(quoteData.company_base.naic, quoteData.company_base.name)}
                    alt={quoteData.company_base.name}
                    fill
                    className="object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
                <span>{quoteData.company_base.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">A.M. Best Rating</span>
                <Badge variant="outline" className={getRatingColor(quoteData.company_base.ambest_rating)}>
                  {quoteData.company_base.ambest_rating !== 'n/a' ? quoteData.company_base.ambest_rating : 'Not Rated'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Established</span>
                <span className="text-sm">{quoteData.company_base.established_year}</span>
              </div>
              <Button variant="ghost" size="sm" className="w-full">
                View Company Details
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </TabsContent>
  );
};
