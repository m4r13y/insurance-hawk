import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OptimizedHospitalIndemnityQuote } from '@/lib/hospital-indemnity-quote-optimizer';
import { analyzeHospitalIndemnityQuotes, formatCurrency, groupQuotesByCompany } from './utils';

interface ProductVariationAnalysisProps {
  quotes: OptimizedHospitalIndemnityQuote[];
}

export function ProductVariationAnalysis({ quotes }: ProductVariationAnalysisProps) {
  const analysis = analyzeHospitalIndemnityQuotes(quotes);
  const groupedByCompany = groupQuotesByCompany(quotes);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Variation Analysis</CardTitle>
        <p className="text-sm text-gray-600">
          Analysis of variations across {quotes.length} hospital indemnity quotes
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{analysis.totalQuotes}</div>
            <div className="text-sm text-gray-600">Total Quotes</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{analysis.uniqueCompanies}</div>
            <div className="text-sm text-gray-600">Unique Companies</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{analysis.benefitTypes.length}</div>
            <div className="text-sm text-gray-600">Benefit Types</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{analysis.riderTypes.length}</div>
            <div className="text-sm text-gray-600">Rider Types</div>
          </div>
        </div>

        {/* Price Range Analysis */}
        <div>
          <h4 className="font-medium mb-3">Premium Range Analysis</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Minimum:</span>
                <span className="ml-2 font-medium text-green-600">
                  {formatCurrency(analysis.priceRange.min)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Maximum:</span>
                <span className="ml-2 font-medium text-red-600">
                  {formatCurrency(analysis.priceRange.max)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Average:</span>
                <span className="ml-2 font-medium text-blue-600">
                  {formatCurrency(analysis.priceRange.average)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Company Distribution */}
        <div>
          <h4 className="font-medium mb-3">Company Distribution</h4>
          <div className="space-y-2">
            {Object.entries(groupedByCompany).map(([company, companyQuotes]) => (
              <div key={company} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium">{company}</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {companyQuotes.length} quote{companyQuotes.length !== 1 ? 's' : ''}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {((companyQuotes.length / quotes.length) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefit Types Analysis */}
        <div>
          <h4 className="font-medium mb-3">Available Benefit Types</h4>
          <div className="space-y-4">
            <div>
              <h5 className="text-sm font-medium text-gray-600 mb-2">Base Plans</h5>
              <div className="flex flex-wrap gap-2">
                {analysis.benefitTypes.slice(0, 10).map((benefit, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {benefit}
                  </Badge>
                ))}
                {analysis.benefitTypes.length > 10 && (
                  <Badge variant="outline" className="text-xs">
                    +{analysis.benefitTypes.length - 10} more
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-600 mb-2">Riders</h5>
              <div className="flex flex-wrap gap-2">
                {analysis.riderTypes.slice(0, 10).map((rider, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {rider}
                  </Badge>
                ))}
                {analysis.riderTypes.length > 10 && (
                  <Badge variant="outline" className="text-xs">
                    +{analysis.riderTypes.length - 10} more
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}