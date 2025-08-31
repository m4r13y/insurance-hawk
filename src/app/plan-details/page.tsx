"use client";

import React, { Suspense } from 'react';
import { PlanDetailsMain } from '@/components/plan-details';

// Disable static generation since this page uses dynamic search params
export const dynamic = 'force-dynamic';

export default function PlanDetailsPage() {
  return (
    <Suspense fallback={<div>Loading plan details...</div>}>
      <PlanDetailsMain />
    </Suspense>
  );
}
