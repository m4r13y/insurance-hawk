import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { QuoteData } from './types.js';

interface AllPlansTabProps {
  quoteData: QuoteData;
  carrierQuotes: QuoteData[];
  formatCurrency: (amount: number) => string;
  calculateDiscountedRate: (rate: number, discounts: any[]) => number;
}

export const AllPlansTab: React.FC<AllPlansTabProps> = ({
  quoteData,
  carrierQuotes,
  formatCurrency,
  calculateDiscountedRate
}) => {
  const [selectedQuote, setSelectedQuote] = React.useState<QuoteData>(quoteData);

  const handleSelectPlan = (quote: QuoteData) => {
    setSelectedQuote(quote);
    // Scroll to top to show the updated selection
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <TabsContent value="quotes" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>All Available Plans from {quoteData.company_base.name}</CardTitle>
          <p className="text-muted-foreground">
            Compare different options available for your location
            {carrierQuotes.length > 1 && " - differences highlighted below"}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {carrierQuotes.map((quote, index) => {
              const differences = [];
              
              // Find differences compared to the first quote
              if (index > 0) {
                const baseQuote = carrierQuotes[0];
                
                // Rate differences
                if (quote.rate.month !== baseQuote.rate.month) {
                  const diff = quote.rate.month - baseQuote.rate.month;
                  differences.push({
                    type: 'rate',
                    text: `${diff > 0 ? '+' : ''}${formatCurrency(diff)}/mo vs Plan ${baseQuote.plan}`,
                    positive: diff < 0
                  });
                }
                
                // Discount differences
                if (quote.discounts.length !== baseQuote.discounts.length) {
                  differences.push({
                    type: 'discount',
                    text: `${quote.discounts.length > baseQuote.discounts.length ? 'More' : 'Fewer'} discounts available`,
                    positive: quote.discounts.length > baseQuote.discounts.length
                  });
                }
                
                // Rating class differences
                if (quote.rating_class !== baseQuote.rating_class) {
                  differences.push({
                    type: 'underwriting',
                    text: `Different underwriting class: ${quote.rating_class || 'Standard'}`,
                    positive: false
                  });
                }
                
                // Discount category differences
                if (quote.discount_category !== baseQuote.discount_category) {
                  differences.push({
                    type: 'category',
                    text: `${quote.discount_category} category vs ${baseQuote.discount_category}`,
                    positive: false
                  });
                }
              }

              return (
                <div key={quote.key} className={`border rounded-lg p-4 transition-colors ${
                  index === 0 ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge variant={index === 0 ? "default" : "outline"}>
                          Plan {quote.plan}
                        </Badge>
                        {index === 0 && (
                          <Badge variant="secondary">Recommended</Badge>
                        )}
                        {quote.discounts.length > 0 && (
                          <Badge variant="secondary">
                            {quote.discounts.length} Discount{quote.discounts.length > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {quote.rate_type} • {quote.discount_category || 'Standard'} Category
                        {quote.rating_class && ` • ${quote.rating_class} Class`}
                      </p>
                      
                      {/* Show discounts */}
                      {quote.discounts.length > 0 && (
                        <div className="mb-2 space-y-1">
                          {quote.discounts.map((discount, dIndex) => (
                            <div key={dIndex} className="text-xs text-green-600">
                              • {discount.name}: {discount.type === 'percent' ? `${(discount.value * 100).toFixed(0)}%` : formatCurrency(discount.value)} off
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Show differences for non-primary plans */}
                      {differences.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Key Differences:</p>
                          {differences.map((diff, dIndex) => (
                            <div key={dIndex} className={`text-xs flex items-center space-x-1 ${
                              diff.positive ? 'text-green-600' : 'text-amber-600'
                            }`}>
                              <span className="w-1 h-1 rounded-full bg-current"></span>
                              <span>{diff.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">
                        {formatCurrency(calculateDiscountedRate(quote.rate.month, quote.discounts))}/mo
                      </div>
                      {quote.discounts.length > 0 && (
                        <div className="text-sm text-muted-foreground line-through">
                          {formatCurrency(quote.rate.month)}/mo
                        </div>
                      )}
                      <Button 
                        variant={index === 0 ? "default" : "outline"} 
                        size="sm" 
                        className="mt-2"
                        onClick={() => handleSelectPlan(quote)}
                      >
                        {index === 0 ? "Selected" : "Select This Plan"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Comparison table for multiple plans */}
          {carrierQuotes.length > 1 && (
            <>
              <Separator className="my-6" />
              <div>
                <h4 className="font-medium mb-4">Side-by-Side Comparison</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Feature</th>
                        {carrierQuotes.map((quote, index) => (
                          <th key={quote.key} className="text-center p-2">
                            Plan {quote.plan}
                            {index === 0 && <Badge variant="secondary" className="ml-2 text-xs">Recommended</Badge>}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2 font-medium">Monthly Premium</td>
                        {carrierQuotes.map(quote => (
                          <td key={quote.key} className="text-center p-2">
                            <div className="font-bold text-primary">
                              {formatCurrency(calculateDiscountedRate(quote.rate.month, quote.discounts))}
                            </div>
                            {quote.discounts.length > 0 && (
                              <div className="text-xs text-muted-foreground line-through">
                                {formatCurrency(quote.rate.month)}
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-medium">Rate Type</td>
                        {carrierQuotes.map(quote => (
                          <td key={quote.key} className="text-center p-2 capitalize">
                            {quote.rate_type}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-medium">Discount Category</td>
                        {carrierQuotes.map(quote => (
                          <td key={quote.key} className="text-center p-2">
                            {quote.discount_category || 'Standard'}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-medium">Available Discounts</td>
                        {carrierQuotes.map(quote => (
                          <td key={quote.key} className="text-center p-2">
                            <div className="space-y-1">
                              {quote.discounts.length > 0 ? (
                                quote.discounts.map((discount, index) => (
                                  <div key={index} className="text-xs text-green-600">
                                    {discount.name} ({discount.type === 'percent' ? `${(discount.value * 100).toFixed(0)}%` : formatCurrency(discount.value)})
                                  </div>
                                ))
                              ) : (
                                <span className="text-muted-foreground">None</span>
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-medium">Underwriting Class</td>
                        {carrierQuotes.map(quote => (
                          <td key={quote.key} className="text-center p-2">
                            {quote.rating_class || 'Standard'}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
};
