import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OptimizedHospitalIndemnityQuote } from '@/lib/hospital-indemnity-quote-optimizer';

interface SmartAnalysisDemoProps {
  quotes: OptimizedHospitalIndemnityQuote[];
}

export function SmartAnalysisDemo({ quotes }: SmartAnalysisDemoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Smart Analysis Demo</CardTitle>
        <p className="text-sm text-gray-600">
          Intelligent analysis and insights for hospital indemnity quotes
        </p>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          <p>Smart analysis features coming soon...</p>
          <p className="text-sm mt-2">
            Will provide AI-powered insights from {quotes.length} quotes
          </p>
        </div>
      </CardContent>
    </Card>
  );
}