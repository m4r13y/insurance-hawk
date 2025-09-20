"use client";
import React, { useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';

// Lazy load builder only (stripped version)
const SimplifiedHospitalIndemnityPlanBuilder = dynamic(
  () => import('@/components/medicare-shop/hospital-indemnity/hospital-indemnity-field-mapping/SimplifiedHospitalIndemnityPlanBuilder').then(m => m.SimplifiedHospitalIndemnityPlanBuilder),
  { ssr:false, loading: () => <div className="text-xs text-slate-500">Loading configuration...</div> }
);

interface HospitalIndemnityDetailsShowcaseProps { carrierName: string; quotes: any[]; onClose: () => void; }

const HospitalIndemnityDetailsShowcase: React.FC<HospitalIndemnityDetailsShowcaseProps> = ({ carrierName, quotes, onClose }) => {
  // Very simplified: pass quotes through (builder will internally normalize if needed)
  const optimizedQuotes = useMemo(()=> Array.isArray(quotes) ? quotes : [], [quotes]);

  // Ensure the embedded builder starts in configuration mode for this carrier by injecting ?company= param
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!carrierName) return;
    try {
      const current = new URL(window.location.href);
      const existingCompany = current.searchParams.get('company');
      // Only modify if different to avoid unnecessary history entries
      if (existingCompany !== carrierName) {
        current.searchParams.set('company', carrierName);
        // Use replaceState to avoid polluting history stack
        window.history.replaceState({}, '', current.toString());
      }
    } catch (e) {
      // Fallback: minimal mutation
      try {
        if (!window.location.search.includes('company=')) {
          const sep = window.location.search ? '&' : '?';
          window.history.replaceState({}, '', window.location.pathname + window.location.search + sep + 'company=' + encodeURIComponent(carrierName));
        }
      } catch {}
    }
  }, [carrierName]);

  return (
    <div className="space-y-6 relative z-0">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight">{carrierName} Hospital Indemnity</h2>
        <Button size="sm" variant="outline" onClick={onClose}>Back</Button>
      </div>
      <div className="rounded-lg border border-slate-200 dark:border-slate-700/60 bg-card/60 p-4">
        {optimizedQuotes.length === 0 && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400">No quotes available for configuration.</p>
        )}
        {optimizedQuotes.length > 0 && (
          <div className="space-y-4">
            <SimplifiedHospitalIndemnityPlanBuilder quotes={optimizedQuotes as any} onPlanBuilt={() => { /* intentionally no-op in stripped view */ }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalIndemnityDetailsShowcase;
