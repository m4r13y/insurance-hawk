"use client";
import React from 'react';
import PlanDetailsMain from './PlanDetailsMain';

interface PlanDetailsShowcaseProps {
  carrierId: string;
  quotes: any[];
  plan?: string;
  onClose?: () => void;
}

// Wrapper kept for sandbox usage; colocated in core for structural clarity
const PlanDetailsShowcase: React.FC<PlanDetailsShowcaseProps> = ({ carrierId, quotes, plan, onClose }) => {
  return <PlanDetailsMain carrierId={carrierId} initialQuotes={quotes} plan={plan} onClose={onClose} />;
};

export default PlanDetailsShowcase;
