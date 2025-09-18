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

// TODO: Accept props once real data flows in; keeping minimal for showcase.
const PlanDetailsShowcase: React.FC = () => {
  return <PlanDetailsMain />;
};

export default PlanDetailsShowcase;
