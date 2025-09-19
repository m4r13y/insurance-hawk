"use client";
import React, { useState, useMemo, useCallback } from 'react';
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

  const sorted = [...quotes].sort((a,b)=> (a.pricing?.monthly ?? 0) - (b.pricing?.monthly ?? 0));
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderResult, setBuilderResult] = useState<any | null>(null);
  const handlePlanBuilt = useCallback((config: any) => {
    setBuilderResult(config);
    try { console.debug('[hospital builder] plan built', config); } catch {}
  }, []);

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
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight">{carrierName} Hospital Indemnity</h2>
        <Button size="sm" variant="outline" onClick={onClose}>Back</Button>
      </div>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Plan Variants</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="text-left text-slate-500 dark:text-slate-400">
                <th className="py-1 pr-4 font-medium">Plan</th>
                <th className="py-1 pr-4 font-medium">Monthly</th>
                <th className="py-1 pr-4 font-medium">Daily Benefit</th>
                <th className="py-1 pr-4 font-medium">Days</th>
                <th className="py-1 pr-4 font-medium">Ambulance</th>
                <th className="py-1 pr-4 font-medium">ICU Upgrade</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(q => (
                <tr key={q.id} className="border-t border-slate-200 dark:border-slate-700/50">
                  <td className="py-2 pr-4 font-medium text-slate-700 dark:text-slate-200 max-w-[14rem] truncate" title={q.plan?.display}>{q.plan?.display}</td>
                  <td className="py-2 pr-4 tabular-nums">{q.pricing?.monthly != null ? `$${q.pricing.monthly.toFixed(2)}` : '—'}</td>
                  <td className="py-2 pr-4 tabular-nums">{q.metadata?.dailyBenefit != null ? `$${q.metadata.dailyBenefit}` : '—'}</td>
                  <td className="py-2 pr-4 tabular-nums">{q.metadata?.daysCovered != null ? q.metadata.daysCovered : '—'}</td>
                  <td className="py-2 pr-4 tabular-nums">{q.metadata?.ambulance != null ? `$${q.metadata.ambulance}` : '—'}</td>
                  <td className="py-2 pr-4">{q.metadata?.icuUpgrade ? 'Yes' : 'No'}</td>
                </tr>
              ))}
              {!sorted.length && (<tr><td colSpan={6} className="py-4 text-center text-slate-500">No variants</td></tr>)}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card/60 border-slate-200 dark:border-slate-700/60">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Highlights</CardTitle></CardHeader>
          <CardContent className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
            <p>Daily benefit × covered days = core inpatient coverage. Ambulance & ICU indicators reflect common rider enhancements.</p>
            <p className="text-[11px] opacity-70">Future: add observation & surgical benefit parsing.</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button size="sm" variant="outline" onClick={()=>{ try { window.open('/hospital-indemnity-field-mapping','_blank'); } catch { location.href='/hospital-indemnity-field-mapping'; } }}>Field Mapping</Button>
              <Button size="sm" variant="outline" onClick={()=>{ try { window.open('/hospital-indemnity-plan-builder','_blank'); } catch { location.href='/hospital-indemnity-plan-builder'; } }}>Standalone Builder</Button>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/60 border-slate-200 dark:border-slate-700/60 col-span-full">
          <CardHeader className="pb-2 flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">Interactive Builder</CardTitle>
            <div className="flex items-center gap-2">
              {builderResult && <Button size="sm" variant="outline" onClick={copyLastBuild}>Copy JSON</Button>}
              <Button variant="outline" size="sm" onClick={()=> setBuilderOpen(o=>!o)} aria-expanded={builderOpen} aria-controls="hospital-builder-panel">
                {builderOpen ? 'Hide Builder' : 'Customize'}
              </Button>
            </div>
          </CardHeader>
          <CardContent id="hospital-builder-panel" className="pt-2">
            {builderOpen ? (
              <div className="space-y-4">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Configure variant mix & rider set. Uses simplified hospital indemnity builder.</p>
                <SimplifiedHospitalIndemnityPlanBuilder quotes={optimizedQuotes as any} onPlanBuilt={handlePlanBuilt} />
                {builderResult && (
                  <div className="rounded-md border border-slate-300 dark:border-slate-700 p-3 text-[11px] space-y-1 bg-slate-50 dark:bg-slate-800/40">
                    <div className="font-medium text-slate-700 dark:text-slate-200">Last Build Result</div>
                    <pre className="whitespace-pre-wrap break-all text-[10px] max-h-48 overflow-auto">{JSON.stringify(builderResult, null, 2)}</pre>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Open the builder to tailor a hospital indemnity configuration for {carrierName}.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HospitalIndemnityDetailsShowcase;
