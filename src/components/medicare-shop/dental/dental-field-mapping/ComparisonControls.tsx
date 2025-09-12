import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OptimizedDentalQuote } from '@/lib/dental-quote-optimizer';

interface ComparisonControlsProps {
  selectedForComparison: OptimizedDentalQuote[];
  onShowComparison: () => void;
  onClearSelection: () => void;
}

export default function ComparisonControls({
  selectedForComparison,
  onShowComparison,
  onClearSelection
}: ComparisonControlsProps) {
  if (selectedForComparison.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 flex justify-center">
      <Card className="inline-block">
        <CardContent className="p-4 flex items-center gap-4">
          <span className="text-sm font-medium">
            {selectedForComparison.length} plan{selectedForComparison.length > 1 ? 's' : ''} selected for comparison
          </span>
          <div className="flex gap-2">
            <Button 
              variant="default" 
              size="sm"
              onClick={onShowComparison}
              disabled={selectedForComparison.length < 1}
            >
              Compare Plans
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onClearSelection}
            >
              Clear Selection
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
