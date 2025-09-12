import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LayersIcon } from "@radix-ui/react-icons";
import { ProductVariationAnalysisProps } from './types';
import { getProductVariationAnalysis } from './utils';

export default function ProductVariationAnalysis({ quotes }: ProductVariationAnalysisProps) {
  const analysisData = getProductVariationAnalysis(quotes);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LayersIcon className="h-5 w-5" />
          Product Variation Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3 font-medium">Product Key</th>
                <th className="text-left p-3 font-medium">Variations</th>
                <th className="text-left p-3 font-medium">Premium Range</th>
                <th className="text-left p-3 font-medium">Max Benefit Range</th>
                <th className="text-left p-3 font-medium">Variation IDs</th>
              </tr>
            </thead>
            <tbody>
              {analysisData.map((analysis, index) => (
                <tr key={`${analysis.productKey}-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-3 font-mono text-sm text-blue-600">
                    {analysis.productKey}
                  </td>
                  <td className="p-3">
                    <Badge variant={analysis.variationCount > 1 ? "default" : "secondary"}>
                      {analysis.variationCount}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm">
                    {analysis.premiumRange.min === analysis.premiumRange.max 
                      ? `$${analysis.premiumRange.min.toFixed(2)}`
                      : `$${analysis.premiumRange.min.toFixed(2)} - $${analysis.premiumRange.max.toFixed(2)}`
                    }
                  </td>
                  <td className="p-3 text-sm">
                    {analysis.maxBenefitRange.min === analysis.maxBenefitRange.max 
                      ? `$${analysis.maxBenefitRange.min.toLocaleString()}`
                      : `$${analysis.maxBenefitRange.min.toLocaleString()} - $${analysis.maxBenefitRange.max.toLocaleString()}`
                    }
                  </td>
                  <td className="p-3 text-xs font-mono max-w-xs">
                    <div className="truncate" title={analysis.ids.join(', ')}>
                      {analysis.ids.join(', ')}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
