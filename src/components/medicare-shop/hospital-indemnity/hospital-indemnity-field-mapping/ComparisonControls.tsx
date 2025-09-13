import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OptimizedHospitalIndemnityQuote } from '@/lib/hospital-indemnity-quote-optimizer';

interface ComparisonControlsProps {
  selectedForComparison: OptimizedHospitalIndemnityQuote[];
  onShowComparison: () => void;
  onClearSelection: () => void;
}

export function ComparisonControls({
  selectedForComparison,
  onShowComparison,
  onClearSelection
}: ComparisonControlsProps) {
  if (selectedForComparison.length === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant="default" className="text-sm">
            {selectedForComparison.length} selected for comparison
          </Badge>
          <span className="text-sm text-gray-600">
            {selectedForComparison.map(q => q.planName).join(', ')}
          </span>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearSelection}
          >
            Clear
          </Button>
          <Button
            size="sm"
            onClick={onShowComparison}
          >
            Compare Quotes
          </Button>
        </div>
      </div>
    </div>
  );
}