import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuoteOverviewProps } from './types';

export default function RawDataInspector({ quote }: QuoteOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Raw Data Structure</CardTitle>
        <p className="text-sm text-gray-600">
          Complete JSON representation of the selected dental quote
        </p>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96">
          <pre className="text-sm whitespace-pre-wrap break-words">
            {JSON.stringify(quote, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
