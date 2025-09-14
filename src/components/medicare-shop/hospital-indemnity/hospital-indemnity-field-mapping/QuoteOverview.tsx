import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OptimizedHospitalIndemnityQuote } from '@/lib/hospital-indemnity-quote-optimizer';
import { formatCurrency } from './utils';

interface QuoteOverviewProps {
  quote: OptimizedHospitalIndemnityQuote;
}

export function QuoteOverview({ quote }: QuoteOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quote Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-sm text-gray-600 mb-1">Plan Name</h4>
            <p className="font-medium">{quote.planName}</p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-gray-600 mb-1">Monthly Premium</h4>
            <p className="font-medium text-green-600 text-lg">
              {formatCurrency(quote.monthlyPremium)}
            </p>
          </div>
        </div>

        {/* Company Information */}
        <div>
          <h4 className="font-medium text-sm text-gray-600 mb-2">Insurance Company</h4>
          <div className="space-y-1">
            <p className="font-medium">{quote.companyName}</p>
            <p className="text-sm text-gray-600">{quote.companyFullName}</p>
            {quote.ambest.rating && (
              <div className="flex space-x-2">
                <Badge variant="outline">
                  A.M. Best: {quote.ambest.rating}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Policy Details */}
        <div>
          <h4 className="font-medium text-sm text-gray-600 mb-2">Policy Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Age:</span>
              <span className="ml-2 font-medium">{quote.age}</span>
            </div>
            <div>
              <span className="text-gray-600">Gender:</span>
              <span className="ml-2 font-medium">{quote.gender === 'M' ? 'Male' : 'Female'}</span>
            </div>
            <div>
              <span className="text-gray-600">State:</span>
              <span className="ml-2 font-medium">{quote.state}</span>
            </div>
            <div>
              <span className="text-gray-600">Tobacco:</span>
              <span className="ml-2 font-medium">{quote.tobacco ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="text-gray-600">Policy Fee:</span>
              <span className="ml-2 font-medium">{formatCurrency(quote.policyFee)}</span>
            </div>
            <div>
              <span className="text-gray-600">HH Discount:</span>
              <span className="ml-2 font-medium">{(quote.hhDiscount * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Coverage Summary */}
        <div>
          <h4 className="font-medium text-sm text-gray-600 mb-2">Coverage Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Base Plans:</span>
              <span className="ml-2 font-medium">{quote.basePlans.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Available Riders:</span>
              <span className="ml-2 font-medium">{quote.riders.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Included Benefits:</span>
              <span className="ml-2 font-medium">
                {quote.basePlans.filter(plan => plan.included).length + 
                 quote.riders.filter(rider => rider.included).length}
              </span>
            </div>
          </div>
        </div>

        {/* Application Options */}
        <div>
          <h4 className="font-medium text-sm text-gray-600 mb-2">Application Options</h4>
          <div className="flex space-x-2">
            {quote.hasApplications.brochure && (
              <Badge variant="secondary">Brochure Available</Badge>
            )}
            {quote.hasApplications.pdfApp && (
              <Badge variant="secondary">PDF Application</Badge>
            )}
            {quote.hasApplications.eApp && (
              <Badge variant="secondary">Electronic Application</Badge>
            )}
            {!quote.hasApplications.brochure && 
             !quote.hasApplications.pdfApp && 
             !quote.hasApplications.eApp && (
              <span className="text-sm text-gray-500">No application options available</span>
            )}
          </div>
        </div>

        {/* Base Plans Preview */}
        {quote.basePlans.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-gray-600 mb-2">Base Plans</h4>
            <div className="space-y-2">
              {quote.basePlans.slice(0, 3).map((plan, index) => (
                <div key={index} className="flex justify-between items-center text-sm border rounded p-2">
                  <div>
                    <span className="font-medium">{plan.name}</span>
                    {plan.included && (
                      <Badge variant="outline" className="ml-2 text-xs">Included</Badge>
                    )}
                  </div>
                  <span className="text-gray-600">
                    {plan.benefitOptions.length} option{plan.benefitOptions.length !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
              {quote.basePlans.length > 3 && (
                <p className="text-xs text-gray-500 text-center">
                  +{quote.basePlans.length - 3} more base plans
                </p>
              )}
            </div>
          </div>
        )}

        {/* Last Modified */}
        <div className="pt-4 border-t">
          <p className="text-xs text-gray-500">
            Last Modified: {new Date(quote.lastModified).toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}