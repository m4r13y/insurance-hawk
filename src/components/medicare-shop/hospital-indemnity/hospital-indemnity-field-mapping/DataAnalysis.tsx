import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OptimizedHospitalIndemnityQuote } from '@/lib/hospital-indemnity-quote-optimizer';
import { analyzeHospitalIndemnityQuotes, formatCurrency } from './utils';

interface DataAnalysisProps {
  quote: OptimizedHospitalIndemnityQuote;
}

export function DataAnalysis({ quote }: DataAnalysisProps) {
  // Analyze the quote data
  const basePlanBenefits = quote.basePlans.reduce((total, plan) => total + plan.benefitOptions.length, 0);
  const riderBenefits = quote.riders.reduce((total, rider) => total + rider.benefitOptions.length, 0);
  const includedBasePlans = quote.basePlans.filter(plan => plan.included).length;
  const includedRiders = quote.riders.filter(rider => rider.included).length;
  
  // Calculate rate ranges for base plans and riders
  const basePlanRates = quote.basePlans.flatMap(plan => 
    plan.benefitOptions.map(option => option.rate).filter(rate => rate > 0)
  );
  const riderRates = quote.riders.flatMap(rider => 
    rider.benefitOptions.map(option => option.rate).filter(rate => rate > 0)
  );

  const baseRateRange = basePlanRates.length > 0 ? {
    min: Math.min(...basePlanRates),
    max: Math.max(...basePlanRates),
    avg: basePlanRates.reduce((sum, rate) => sum + rate, 0) / basePlanRates.length
  } : null;

  const riderRateRange = riderRates.length > 0 ? {
    min: Math.min(...riderRates),
    max: Math.max(...riderRates),
    avg: riderRates.reduce((sum, rate) => sum + rate, 0) / riderRates.length
  } : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Coverage Structure Analysis */}
        <div>
          <h4 className="font-medium text-sm text-gray-600 mb-3">Coverage Structure</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Base Plans:</span>
                <span className="font-medium">{quote.basePlans.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Included Base Plans:</span>
                <span className="font-medium">{includedBasePlans}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Base Plan Options:</span>
                <span className="font-medium">{basePlanBenefits}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Riders:</span>
                <span className="font-medium">{quote.riders.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Included Riders:</span>
                <span className="font-medium">{includedRiders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rider Options:</span>
                <span className="font-medium">{riderBenefits}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rate Analysis */}
        {(baseRateRange || riderRateRange) && (
          <div>
            <h4 className="font-medium text-sm text-gray-600 mb-3">Rate Analysis</h4>
            <div className="space-y-3">
              {baseRateRange && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <h5 className="font-medium text-sm mb-2">Base Plan Rates</h5>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600">Min:</span>
                      <span className="ml-1 font-medium">{formatCurrency(baseRateRange.min)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Max:</span>
                      <span className="ml-1 font-medium">{formatCurrency(baseRateRange.max)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Avg:</span>
                      <span className="ml-1 font-medium">{formatCurrency(baseRateRange.avg)}</span>
                    </div>
                  </div>
                </div>
              )}

              {riderRateRange && (
                <div className="bg-green-50 rounded-lg p-3">
                  <h5 className="font-medium text-sm mb-2">Rider Rates</h5>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600">Min:</span>
                      <span className="ml-1 font-medium">{formatCurrency(riderRateRange.min)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Max:</span>
                      <span className="ml-1 font-medium">{formatCurrency(riderRateRange.max)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Avg:</span>
                      <span className="ml-1 font-medium">{formatCurrency(riderRateRange.avg)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Benefit Types */}
        <div>
          <h4 className="font-medium text-sm text-gray-600 mb-3">Available Benefits</h4>
          <div className="space-y-3">
            <div>
              <h5 className="text-sm font-medium mb-2">Base Plans</h5>
              <div className="flex flex-wrap gap-1">
                {quote.basePlans.map((plan, index) => (
                  <Badge
                    key={index}
                    variant={plan.included ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {plan.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium mb-2">Riders</h5>
              <div className="flex flex-wrap gap-1">
                {quote.riders.slice(0, 10).map((rider, index) => (
                  <Badge
                    key={index}
                    variant={rider.included ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {rider.name}
                  </Badge>
                ))}
                {quote.riders.length > 10 && (
                  <Badge variant="outline" className="text-xs">
                    +{quote.riders.length - 10} more
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Data Quality Metrics */}
        <div>
          <h4 className="font-medium text-sm text-gray-600 mb-3">Data Quality</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Has Company Rating:</span>
                <Badge variant={quote.ambest.rating ? "default" : "secondary"} className="text-xs">
                  {quote.ambest.rating ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Has Application Options:</span>
                <Badge variant={
                  quote.hasApplications.brochure || quote.hasApplications.pdfApp || quote.hasApplications.eApp 
                    ? "default" : "secondary"
                } className="text-xs">
                  {quote.hasApplications.brochure || quote.hasApplications.pdfApp || quote.hasApplications.eApp 
                    ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Benefit Notes:</span>
                <span className="font-medium">
                  {quote.basePlans.filter(p => p.notes).length + quote.riders.filter(r => r.notes).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Zero-Cost Benefits:</span>
                <span className="font-medium">
                  {quote.basePlans.reduce((count, plan) => 
                    count + plan.benefitOptions.filter(opt => opt.rate === 0).length, 0
                  ) + quote.riders.reduce((count, rider) => 
                    count + rider.benefitOptions.filter(opt => opt.rate === 0).length, 0
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-2">Analysis Summary</h4>
          <p className="text-sm text-gray-600">
            This hospital indemnity quote contains <strong>{quote.basePlans.length} base plans</strong> and{' '}
            <strong>{quote.riders.length} riders</strong>, offering a total of{' '}
            <strong>{basePlanBenefits + riderBenefits} benefit options</strong>. 
            The monthly premium is <strong>{formatCurrency(quote.monthlyPremium)}</strong> with a{' '}
            <strong>{formatCurrency(quote.policyFee)} policy fee</strong>.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}