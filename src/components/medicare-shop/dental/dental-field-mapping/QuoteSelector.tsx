import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileTextIcon, LayersIcon, ViewGridIcon, CheckIcon } from "@radix-ui/react-icons";
import { QuoteSelectorProps } from './types';
import { groupQuotesByProductKey, isSelectedForComparison } from './utils';

export default function QuoteSelector({
  quotes,
  selectedQuote,
  onSelectQuote,
  groupByPlan,
  onToggleGrouping,
  selectedForComparison,
  onToggleComparison,
  maxComparisons = 3
}: QuoteSelectorProps) {
  const groupedQuotes = groupQuotesByProductKey(quotes);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileTextIcon className="h-5 w-5" />
            Dental Quotes ({quotes.length} total, {Object.keys(groupedQuotes).length} products)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={groupByPlan ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleGrouping(true)}
            >
              <LayersIcon className="h-4 w-4 mr-1" />
              Group by Product
            </Button>
            <Button
              variant={!groupByPlan ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleGrouping(false)}
            >
              <ViewGridIcon className="h-4 w-4 mr-1" />
              Show All
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {groupByPlan ? (
          /* Grouped View */
          <div className="space-y-6">
            {Object.entries(groupedQuotes).map(([productKey, variations], groupIndex) => (
              <div key={`${productKey}-${groupIndex}`} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-lg">Product: {productKey}</h3>
                    <p className="text-sm text-gray-600">{variations.length} variation(s)</p>
                  </div>
                  <Badge variant="outline">
                    {variations[0].companyName}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {variations.map((quote, variationIndex) => (
                    <Card 
                      key={`${quote.id}-${variationIndex}`} 
                      className={`cursor-pointer transition-all hover:shadow-md relative ${
                        selectedQuote?.id === quote.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white'
                      } ${isSelectedForComparison(quote, selectedForComparison) ? 'ring-2 ring-green-500' : ''}`}
                      onClick={() => onSelectQuote(quote)}
                    >
                      {/* Comparison Checkbox */}
                      <Button
                        variant={isSelectedForComparison(quote, selectedForComparison) ? "default" : "outline"}
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleComparison(quote);
                        }}
                        disabled={!isSelectedForComparison(quote, selectedForComparison) && selectedForComparison.length >= maxComparisons}
                      >
                        {isSelectedForComparison(quote, selectedForComparison) ? 
                          <CheckIcon className="h-3 w-3" /> : 
                          <span className="text-xs">{selectedForComparison.length + 1 > maxComparisons ? maxComparisons : selectedForComparison.length + 1}</span>
                        }
                      </Button>
                      
                      <CardContent className="p-3 pr-10">
                        <div className="space-y-2">
                          <div className="text-xs font-mono text-blue-600">
                            ID: {quote.id}
                          </div>
                          <div className="text-sm font-medium">{quote.planName}</div>
                          <div className="flex justify-between items-center">
                            <Badge variant="secondary">${quote.monthlyPremium.toFixed(2)}/mo</Badge>
                            <span className="text-xs text-gray-500">${quote.annualMaximum.toLocaleString()} max</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Flat View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quotes.map((quote, quoteIndex) => (
              <Card 
                key={`${quote.id}-${quote.productKey}-${quoteIndex}`} 
                className={`cursor-pointer transition-all hover:shadow-md relative ${
                  selectedQuote?.id === quote.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                } ${isSelectedForComparison(quote, selectedForComparison) ? 'ring-2 ring-green-500' : ''}`}
                onClick={() => onSelectQuote(quote)}
              >
                {/* Comparison Checkbox */}
                <Button
                  variant={isSelectedForComparison(quote, selectedForComparison) ? "default" : "outline"}
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleComparison(quote);
                  }}
                  disabled={!isSelectedForComparison(quote, selectedForComparison) && selectedForComparison.length >= maxComparisons}
                >
                  {isSelectedForComparison(quote, selectedForComparison) ? 
                    <CheckIcon className="h-3 w-3" /> : 
                    <span className="text-xs">{selectedForComparison.length + 1 > maxComparisons ? maxComparisons : selectedForComparison.length + 1}</span>
                  }
                </Button>
                
                <CardContent className="p-4 pr-10">
                  <div className="space-y-2">
                    <div className="font-medium text-sm">{quote.companyName}</div>
                    <div className="text-xs text-gray-600">{quote.planName}</div>
                    <div className="text-xs font-mono text-blue-600">
                      Product: {quote.productKey} | ID: {quote.id}
                    </div>
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary">${quote.monthlyPremium.toFixed(2)}/mo</Badge>
                      <span className="text-xs text-gray-500">${quote.annualMaximum.toLocaleString()} max</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
