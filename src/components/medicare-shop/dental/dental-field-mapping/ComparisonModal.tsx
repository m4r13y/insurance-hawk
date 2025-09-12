import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { ComparisonModalProps } from './types';

export default function ComparisonModal({
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
          <DialogTitle className="flex items-center justify-between">
            <span>Plan Comparison ({selectedQuotes.length} plans)</span>
            <Button variant="outline" size="sm" onClick={onClearAll}>
              <Cross2Icon className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Overview Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedQuotes.map((quote, index) => (
              <Card key={`comparison-${quote.id}-${index}`} className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => onRemoveQuote(quote)}
                >
                  <Cross2Icon className="h-4 w-4" />
                </Button>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{quote.companyName}</CardTitle>
                  <p className="text-sm text-gray-600">{quote.planName}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Monthly Premium</span>
                      <span className="font-bold text-green-600">${quote.monthlyPremium.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Annual Maximum</span>
                      <span className="font-bold text-blue-600">${quote.annualMaximum.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Annual Cost</span>
                      <span className="font-medium">${(quote.monthlyPremium * 12).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Cost vs. Max Ratio</span>
                      <span className="font-medium">{((quote.monthlyPremium * 12 / quote.annualMaximum) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500">
                      <strong>Product:</strong> {quote.productKey}
                    </div>
                    <div className="text-xs text-gray-500">
                      <strong>ID:</strong> {quote.id}
                    </div>
                    <div className="text-xs text-gray-500">
                      <strong>Rating:</strong> {quote.ambestRating} ({quote.ambestOutlook})
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Field Comparison */}
          {selectedQuotes.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Detailed Field Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-3 font-medium">Field</th>
                        {selectedQuotes.map((quote, index) => (
                          <th key={`header-${quote.id}-${index}`} className="text-left p-3 font-medium">
                            {quote.companyName}
                            <br />
                            <span className="text-xs font-normal text-gray-500">{quote.planName}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { field: 'monthlyPremium', label: 'Monthly Premium', format: (val: any) => `$${val.toFixed(2)}` },
                        { field: 'annualMaximum', label: 'Annual Maximum', format: (val: any) => `$${val.toLocaleString()}` },
                        { field: 'companyFullName', label: 'Full Company Name', format: (val: any) => val },
                        { field: 'fullPlanName', label: 'Full Plan Name', format: (val: any) => val },
                        { field: 'ambestRating', label: 'AM Best Rating', format: (val: any) => val },
                        { field: 'ambestOutlook', label: 'AM Best Outlook', format: (val: any) => val },
                        { field: 'age', label: 'Age', format: (val: any) => val.toString() },
                        { field: 'state', label: 'State', format: (val: any) => val },
                        { field: 'productKey', label: 'Product Key', format: (val: any) => val },
                        { field: 'id', label: 'ID', format: (val: any) => val }
                      ].map((fieldInfo, rowIndex) => (
                        <tr key={fieldInfo.field} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="p-3 font-medium text-gray-700">{fieldInfo.label}</td>
                          {selectedQuotes.map((quote, colIndex) => (
                            <td key={`${fieldInfo.field}-${quote.id}-${colIndex}`} className="p-3">
                              {fieldInfo.format((quote as any)[fieldInfo.field])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Benefits & Limitations Comparison */}
          {selectedQuotes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Benefits & Limitations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedQuotes.map((quote, index) => (
                    <div key={`benefits-${quote.id}-${index}`} className="space-y-3">
                      <h4 className="font-medium">{quote.companyName} - {quote.planName}</h4>
                      
                      <div>
                        <h5 className="text-sm font-medium text-green-700 mb-1">Benefits</h5>
                        <div className="text-xs bg-green-50 p-2 rounded max-h-32 overflow-y-auto">
                          {quote.benefitNotes || 'No benefit notes available'}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium text-red-700 mb-1">Limitations</h5>
                        <div className="text-xs bg-red-50 p-2 rounded max-h-32 overflow-y-auto">
                          {quote.limitationNotes || 'No limitation notes available'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
