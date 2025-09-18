"use client";
import React from 'react';
import { PlanDetailsMain } from './index';

/*
  PlanDetailsShowcase
  -------------------
  Lightweight wrapper to present the Plan Details experience inside the shop-components
  sandbox with consistent container styling (light/dark parity, spacing, scroll isolation).
  You can wire real props later; for now it just renders PlanDetailsMain with placeholder context.
*/

interface PlanDetailsShowcaseProps {
  carrierId: string;
  quotes: any[]; // already filtered by carrier (optional: could be all quotes)
  plan?: string; // selected plan letter
  onClose?: () => void;
}

// Now accepts explicit data passed from shop page to avoid re-hydration flicker.
const PlanDetailsShowcase: React.FC<PlanDetailsShowcaseProps> = ({ carrierId, quotes, plan, onClose }) => {
  return <PlanDetailsMain carrierId={carrierId} initialQuotes={quotes} plan={plan} onClose={onClose} />;
};

export default PlanDetailsShowcase;
