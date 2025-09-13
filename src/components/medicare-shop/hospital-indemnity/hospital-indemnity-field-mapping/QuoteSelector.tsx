import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { OptimizedHospitalIndemnityQuote } from '@/lib/hospital-indemnity-quote-optimizer';
import { groupQuotesByCompany, formatCurrency } from './utils';

interface QuoteSelectorProps {
  quotes: OptimizedHospitalIndemnityQuote[];
  selectedQuote: OptimizedHospitalIndemnityQuote | null;
  onSelectQuote: (quote: OptimizedHospitalIndemnityQuote) => void;
  groupByPlan: boolean;
  onToggleGrouping: (groupByPlan: boolean) => void;
  selectedForComparison: OptimizedHospitalIndemnityQuote[];
  onToggleComparison: (quote: OptimizedHospitalIndemnityQuote) => void;
  maxComparisons: number;
}

export function QuoteSelector({
  quotes,
  selectedQuote,
  onSelectQuote,
  groupByPlan,
  onToggleGrouping,
  selectedForComparison,
  onToggleComparison,
  maxComparisons
}: QuoteSelectorProps) {
  const groupedQuotes = groupByPlan ? groupQuotesByCompany(quotes) : { 'All Quotes': quotes };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Hospital Indemnity Quotes ({quotes.length})</CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm">Group by Company</span>
            <Switch
              checked={groupByPlan}
              onCheckedChange={onToggleGrouping}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(groupedQuotes).map(([groupName, groupQuotes]) => (
          <div key={groupName} className="space-y-2">
            {groupByPlan && (
              <h4 className="font-medium text-lg border-b pb-1">
                {groupName} ({groupQuotes.length})
              </h4>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {groupQuotes.map((quote) => {
                const isSelected = selectedQuote?.id === quote.id;
                const isInComparison = selectedForComparison.some(q => q.id === quote.id);
                const canAddToComparison = selectedForComparison.length < maxComparisons;

                return (
                  <div
                    key={quote.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => onSelectQuote(quote)}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h5 className="font-medium text-sm truncate">
                          {quote.planName}
                        </h5>
                        <div className="flex space-x-1">
                          {isInComparison && (
                            <Badge variant="secondary" className="text-xs">
                              Compare
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant={isInComparison ? "destructive" : "outline"}
                            className="text-xs px-2 py-1 h-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isInComparison || canAddToComparison) {
                                onToggleComparison(quote);
                              }
                            }}
                            disabled={!isInComparison && !canAddToComparison}
                          >
                            {isInComparison ? 'Remove' : 'Compare'}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <div className="truncate">{quote.companyName}</div>
                        <div className="flex justify-between">
                          <span>Age: {quote.age}</span>
                          <span>{quote.gender === 'M' ? 'Male' : 'Female'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>State: {quote.state}</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(quote.monthlyPremium)}/mo
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Base Plans: {quote.basePlans.length}</span>
                        <span>Riders: {quote.riders.length}</span>
                      </div>
                      
                      {quote.ambest.rating && (
                        <Badge variant="outline" className="text-xs">
                          A.M. Best: {quote.ambest.rating}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {quotes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hospital indemnity quotes available
          </div>
        )}
      </CardContent>
    </Card>
  );
}