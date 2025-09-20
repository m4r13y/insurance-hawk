"use client";

import React, { Suspense } from 'react';
import PlanDetailsShowcase from '@/components/medicare-shop/plan-details/PlanDetailsShowcase';
import { useSearchParams } from 'next/navigation';

// Disable static generation since this page uses dynamic search params
export const dynamic = 'force-dynamic';

export default function PlanDetailsPage() {
  return (
    <Suspense fallback={<div>Loading plan details...</div>}>
      <InnerPlanDetailsPage />
    </Suspense>
  );
}

const InnerPlanDetailsPage: React.FC = () => {
  const params = useSearchParams();
  const carrier = params.get('carrier') || '';
  const plan = params.get('plan') || undefined;
  // PlanDetailsShowcase expects quotes passed in; legacy route previously let PlanDetailsMain load storage.
  // For now we let underlying PlanDetailsMain inside showcase still load from storage by passing empty quotes (it handles search params internally).
  // TODO: Consider prefetching carrier quotes server-side (when API route ready) and passing them to reduce layout shift.
  const quotes: any[] = [];
  return <PlanDetailsShowcase carrierId={carrier} quotes={quotes} plan={plan} />;
};
