import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OptimizedHospitalIndemnityQuote } from '@/lib/hospital-indemnity-quote-optimizer';
import { formatCurrency } from './utils';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedQuotes: OptimizedHospitalIndemnityQuote[];
  onRemoveQuote: (quote: OptimizedHospitalIndemnityQuote) => void;
  onClearAll: () => void;
}

export function ComparisonModal({
  isOpen,
  onClose,
  selectedQuotes,
  onRemoveQuote,
  onClearAll
}: ComparisonModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Hospital Indemnity Quote Comparison</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Comparing {selectedQuotes.length} hospital indemnity quotes
            </p>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={onClearAll}>
                Clear All
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left p-3 font-medium">Attribute</th>
                  {selectedQuotes.map((quote, index) => (
                    <th key={quote.id} className="text-left p-3 font-medium">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span>Quote {index + 1}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveQuote(quote)}
                            className="h-6 w-6 p-0"
                          >
                            ×
                          </Button>
                        </div>
                        <p className="text-xs text-gray-600 font-normal truncate max-w-32">
                          {quote.planName}
                        </p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Basic Information */}
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-medium">Plan Name</td>
                  {selectedQuotes.map(quote => (
                    <td key={quote.id} className="p-3">{quote.planName}</td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-medium">Company</td>
                  {selectedQuotes.map(quote => (
                    <td key={quote.id} className="p-3">{quote.companyName}</td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-medium">Monthly Premium</td>
                  {selectedQuotes.map(quote => (
                    <td key={quote.id} className="p-3 font-semibold text-green-600">
                      {formatCurrency(quote.monthlyPremium)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-medium">Policy Fee</td>
                  {selectedQuotes.map(quote => (
                    <td key={quote.id} className="p-3">{formatCurrency(quote.policyFee)}</td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-medium">A.M. Best Rating</td>
                  {selectedQuotes.map(quote => (
                    <td key={quote.id} className="p-3">
                      {quote.ambest.rating ? (
                        <Badge variant="outline">{quote.ambest.rating}</Badge>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-medium">Base Plans</td>
                  {selectedQuotes.map(quote => (
                    <td key={quote.id} className="p-3">{quote.basePlans.length}</td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-medium">Riders</td>
                  {selectedQuotes.map(quote => (
                    <td key={quote.id} className="p-3">{quote.riders.length}</td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-medium">Included Benefits</td>
                  {selectedQuotes.map(quote => (
                    <td key={quote.id} className="p-3">
                      {quote.basePlans.filter(p => p.included).length + 
                       quote.riders.filter(r => r.included).length}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3 font-medium">HH Discount</td>
                  {selectedQuotes.map(quote => (
                    <td key={quote.id} className="p-3">
                      {(quote.hhDiscount * 100).toFixed(1)}%
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Detailed Benefit Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedQuotes.map((quote, index) => (
              <Card key={quote.id}>
                <CardHeader>
                  <CardTitle className="text-sm">
                    Quote {index + 1}: {quote.planName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Base Plans */}
                  <div>
                    <h4 className="font-medium text-sm mb-2">Base Plans ({quote.basePlans.length})</h4>
                    <div className="space-y-1">
                      {quote.basePlans.slice(0, 3).map((plan, planIndex) => (
                        <div key={planIndex} className="text-xs">
                          <div className="flex justify-between items-center">
                            <span className="truncate">{plan.name}</span>
                            {plan.included && (
                              <Badge variant="outline" className="text-xs">Inc</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                      {quote.basePlans.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{quote.basePlans.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Riders */}
                  <div>
                    <h4 className="font-medium text-sm mb-2">Riders ({quote.riders.length})</h4>
                    <div className="space-y-1">
                      {quote.riders.slice(0, 3).map((rider, riderIndex) => (
                        <div key={riderIndex} className="text-xs">
                          <div className="flex justify-between items-center">
                            <span className="truncate">{rider.name}</span>
                            {rider.included && (
                              <Badge variant="outline" className="text-xs">Inc</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                      {quote.riders.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{quote.riders.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}