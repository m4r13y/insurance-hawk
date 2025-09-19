"use client";
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';

// Lazy load builder (mirrors dental pattern) to keep details lightweight
const SimplifiedHospitalIndemnityPlanBuilder = dynamic(
  () => import('@/components/medicare-shop/hospital-indemnity/hospital-indemnity-field-mapping/SimplifiedHospitalIndemnityPlanBuilder')
    .then(m => m.SimplifiedHospitalIndemnityPlanBuilder),
  { ssr: false, loading: () => <div className="text-xs text-slate-500">Loading hospital builder...</div> }
);

interface HospitalIndemnityDetailsShowcaseProps { carrierName: string; quotes: any[]; onClose: () => void; }

const HospitalIndemnityDetailsShowcase: React.FC<HospitalIndemnityDetailsShowcaseProps> = ({ carrierName, quotes, onClose }) => {
  // Detect whether quotes are already optimized (builder expects OptimizedHospitalIndemnityQuote shape)
  const optimizedQuotes = useMemo(() => {
    if (!Array.isArray(quotes)) return [] as any[];
    if (!quotes.length) return [] as any[];
    const looksOptimized = 'basePlans' in (quotes[0] || {}) && 'riders' in (quotes[0] || {});
    if (looksOptimized) return quotes as any[];
    // Attempt lightweight optimization from normalized raw quote shape used in shop page (pricing/metadata fields)
    // Raw shape assumption: q.plan.display, q.pricing.monthly, q.carrier.name, q.metadata.dailyBenefit etc.
    try {
      const transformed = quotes.map((q: any, idx: number) => ({
        id: q.id || `raw-${idx}`,
        planName: q.plan?.display || 'Plan',
        companyName: q.carrier?.name || carrierName,
        companyFullName: q.carrier?.name || carrierName,
        age: q.form?.age || 0,
        gender: q.form?.gender || 'U',
        state: q.form?.state || q.form?.residentState || 'XX',
        monthlyPremium: q.pricing?.monthly ?? 0,
        policyFee: q.pricing?.policyFee ?? 0,
        hhDiscount: 0,
        tobacco: q.form?.tobacco || false,
        ambest: { rating: (q.carrier as any)?.ambestRating || 'NR', outlook: (q.carrier as any)?.ambestOutlook || '' },
        basePlans: [
          {
            name: q.plan?.display || 'Base',
            included: true,
            benefitOptions: [
              { amount: `$${q.metadata?.dailyBenefit ?? 0}`, rate: q.pricing?.monthly ?? 0, quantifier: `${q.metadata?.daysCovered ?? ''} days` }
            ],
            notes: null,
          }
        ],
        riders: [
          ...(q.metadata?.ambulance ? [{ name: 'Ambulance Services Rider', included: true, benefitOptions: [{ amount: `$${q.metadata.ambulance}`, rate: 0 }], notes: null }] : []),
          ...(q.metadata?.icuUpgrade ? [{ name: 'ICU Upgrade Rider', included: true, benefitOptions: [{ amount: 'Included', rate: 0 }], notes: null }] : []),
        ],
        lastModified: new Date().toISOString(),
        hasApplications: { brochure: false, pdfApp: false, eApp: false },
      }));
      try { console.debug('[hospital details] transformed raw quotes for builder', { carrierName, inputCount: quotes.length, transformedCount: transformed.length }); } catch {}
      return transformed;
    } catch (e) {
      console.warn('[hospital details] failed to transform raw hospital quotes', e);
      return [] as any[];
    }
  }, [quotes, carrierName]);

  // We still sort for consistent transformation ordering although we no longer render a variants table
  const sorted = useMemo(()=>[...quotes].sort((a,b)=> (a.pricing?.monthly ?? 0) - (b.pricing?.monthly ?? 0)), [quotes]);
  const [builderResult, setBuilderResult] = useState<any | null>(null);
  const handlePlanBuilt = useCallback((config: any) => {
    setBuilderResult(config);
    try { console.debug('[hospital builder] plan built', config); } catch {}
  }, []);

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

  // Shape quotes into simplified builder expected model where feasible (if builder needs original quotes we just passthrough)
  const optimizedLike = useMemo(() => sorted.map(q => ({
    id: q.plan?.key || q.id,
    planName: q.plan?.display || 'Plan',
    companyName: q.carrier?.name || carrierName,
    companyFullName: q.carrier?.name || carrierName,
    monthlyPremium: q.pricing?.monthly ?? 0,
    dailyHospitalBenefit: q.metadata?.dailyBenefit,
    daysCovered: q.metadata?.daysCovered,
    ambulanceBenefit: q.metadata?.ambulance,
    icuUpgrade: q.metadata?.icuUpgrade,
    raw: q,
  })), [sorted, carrierName]);

  const copyLastBuild = useCallback(() => {
    if(!builderResult) return;
    try { navigator.clipboard.writeText(JSON.stringify(builderResult, null, 2)); } catch {}
  }, [builderResult]);
  // Log sample optimized quote for diagnostics
  try { if (optimizedQuotes.length) console.debug('[hospital details] first optimizedQuote', optimizedQuotes[0]); } catch {}
  return (
  <div className="space-y-8 relative z-0">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight">{carrierName} Hospital Indemnity</h2>
        <Button size="sm" variant="outline" onClick={onClose}>Back</Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="bg-card/60 border-slate-200 dark:border-slate-700/60 order-last lg:order-first">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Builder Guide</CardTitle></CardHeader>
          <CardContent className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
            <p>Use the interactive builder to configure daily benefit, covered days and rider set. Variant rows are no longer listed separately—they're expressed as selectable options inside the builder itself.</p>
            <p className="text-[11px] opacity-70">Future enhancements: observation/surgical benefits & rate deltas.</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button size="sm" variant="outline" onClick={()=>{ try { window.open('/hospital-indemnity-field-mapping','_blank'); } catch { location.href='/hospital-indemnity-field-mapping'; } }}>Field Mapping</Button>
              <Button size="sm" variant="outline" onClick={()=>{ try { window.open('/hospital-indemnity-plan-builder','_blank'); } catch { location.href='/hospital-indemnity-plan-builder'; } }}>Standalone Page</Button>
              {builderResult && <Button size="sm" variant="outline" onClick={copyLastBuild}>Copy JSON</Button>}
            </div>
            {builderResult && (
              <div className="rounded-md border border-slate-200 dark:border-slate-700 p-2 bg-slate-50 dark:bg-slate-800/40 text-[10px] space-y-1">
                <div className="font-medium">Last Build Snapshot</div>
                <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all">{JSON.stringify(builderResult, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-card/60 border-slate-200 dark:border-slate-700/60 lg:col-span-2 overflow-visible">
          <CardHeader className="pb-2 flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">Interactive Plan Builder</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 overflow-visible">
            {!optimizedQuotes.length && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400">No quotes available to build from.</p>
            )}
            {optimizedQuotes.length > 0 && (
              <div className="space-y-6 overflow-visible [&_*]:overflow-visible">
                <SimplifiedHospitalIndemnityPlanBuilder quotes={optimizedQuotes as any} onPlanBuilt={handlePlanBuilt} />
                {builderResult && (
                  <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-3 text-[12px]">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold tracking-wide uppercase text-slate-600 dark:text-slate-300">Configuration Summary</h3>
                      <Button size="sm" variant="outline" onClick={copyLastBuild}>Copy JSON</Button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase font-medium text-slate-500">Company</div>
                        <div className="font-medium text-slate-800 dark:text-slate-100">{builderResult.quote?.companyName}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase font-medium text-slate-500">Plan</div>
                        <div className="font-medium text-slate-800 dark:text-slate-100">{builderResult.quote?.planName}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase font-medium text-slate-500">Daily Benefit</div>
                        <div className="font-medium">{builderResult.dailyBenefit ? `$${builderResult.dailyBenefit}` : '—'}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase font-medium text-slate-500">Benefit Days</div>
                        <div className="font-medium">{builderResult.benefitDays || '—'}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase font-medium text-slate-500">Automatic Benefit Increase</div>
                        <div className="font-medium">{builderResult.automaticBenefitIncrease ? 'Yes' : 'No'}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase font-medium text-slate-500">GPO Rider</div>
                        <div className="font-medium">{builderResult.gpoRider ? 'Included' : 'Not Included'}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase font-medium text-slate-500">Selected Plan Tier</div>
                        <div className="font-medium">{builderResult.planTier || '—'}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase font-medium text-slate-500">Total Monthly Premium</div>
                        <div className="font-semibold text-emerald-600 dark:text-emerald-400">{builderResult.totalPremium != null ? `$${builderResult.totalPremium.toFixed(2)}` : '—'}</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-medium text-slate-500">Riders</div>
                      {builderResult.riders && builderResult.riders.length > 0 ? (
                        <ul className="list-disc pl-4 space-y-0.5">
                          {builderResult.riders.map((r: any, i: number) => (
                            <li key={i} className="text-slate-700 dark:text-slate-200 flex items-center justify-between gap-2">
                              <span className="truncate" title={r.riderName}>{r.riderName}</span>
                              {r.selectedOption && r.selectedOption.amount && (
                                <span className="text-[11px] tabular-nums text-slate-500 dark:text-slate-400">{r.selectedOption.amount}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-slate-500 text-[11px]">No riders selected</div>
                      )}
                    </div>
                    <details className="group border-t border-slate-200 dark:border-slate-700 pt-2">
                      <summary className="cursor-pointer text-[11px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 select-none">Raw JSON (debug)</summary>
                      <pre className="mt-2 whitespace-pre-wrap break-all text-[10px] max-h-64 overflow-auto">{JSON.stringify(builderResult, null, 2)}</pre>
                    </details>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HospitalIndemnityDetailsShowcase;
