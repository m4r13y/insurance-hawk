'use client';

import React from 'react';
import { AdaptiveDentalPlanBuilder } from './dental-field-mapping/AdaptiveDentalPlanBuilder';
import { OptimizedDentalQuote } from '@/lib/dental-quote-optimizer';

interface AdaptiveDentalShopContentProps {
  quotes: OptimizedDentalQuote[];
  isLoading?: boolean;
  onPlanSelect: (selectedQuote: OptimizedDentalQuote) => void;
}

function AdaptiveDentalShopContent({ 
  quotes, 
  isLoading = false, 
  onPlanSelect 
}: AdaptiveDentalShopContentProps) {
  const handlePlanBuilt = (selectedQuote: OptimizedDentalQuote, configuration: any) => {
    onPlanSelect(selectedQuote);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading dental plans...</div>;
  }

  if (!quotes || quotes.length === 0) {
    return <div className="text-center py-8">No dental plans available.</div>;
  }

  return (
    <AdaptiveDentalPlanBuilder
      quotes={quotes}
      onPlanBuilt={handlePlanBuilt}
    />
  );
}

export default AdaptiveDentalShopContent;
