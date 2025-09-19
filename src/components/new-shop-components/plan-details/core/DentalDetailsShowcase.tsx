"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';

// Lazy-load legacy adaptive builder to keep initial details lightweight
const AdaptiveDentalPlanBuilder = dynamic(() => import('@/components/medicare-shop/dental/dental-field-mapping/AdaptiveDentalPlanBuilder').then(m => m.AdaptiveDentalPlanBuilder), { ssr:false, loading: () => <div className="text-xs text-slate-500">Loading dental plan builder...</div> });

interface DentalDetailsShowcaseProps { carrierName: string; quotes: any[]; onClose: () => void; }

const DentalDetailsShowcase: React.FC<DentalDetailsShowcaseProps> = ({ carrierName, quotes, onClose }) => {
  const sorted = [...quotes].sort((a,b)=> (a.pricing?.monthly ?? 0) - (b.pricing?.monthly ?? 0));
  // The adaptive builder expects an OptimizedDentalQuote shape (monthlyPremium, annualMaximum, planName, companyName, etc.).
  const optimizedLike = React.useMemo(() => sorted.map(q => ({
    id: q.plan?.key || q.id || q.plan?.display || 'unknown',
    planName: q.plan?.display || '',
    fullPlanName: q.metadata?.basePlanName || q.plan?.display || '',
    companyName: q.carrier?.name || q.carrier?.id || carrierName,
    companyFullName: q.carrier?.name || carrierName,
    annualMaximum: q.metadata?.annualMax ?? 0,
    monthlyPremium: q.pricing?.monthly ?? 0,
    state: '',
    benefitNotes: q.metadata?.benefitNotes || '',
    limitationNotes: q.metadata?.limitationNotes || '',
    ambestRating: (q.metadata?.ambestRating as any) || '',
    ambestOutlook: (q.metadata?.ambestOutlook as any) || '',
    productKey: q.plan?.key || q.id || '',
    age: (q.metadata?.age as any) || 0,
    gender: (q.metadata?.gender as any) || null,
    tobacco: (q.metadata?.tobacco as any) || null,
  })), [sorted, carrierName]);
  const [builderOpen, setBuilderOpen] = React.useState(false);
  const firstQuote = sorted[0];
  const handlePlanBuilt = React.useCallback((selected: any, config: any) => {
    try { console.debug('[dental builder] plan built', { plan: selected?.plan?.display, config }); } catch {}
  }, []);
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight">{carrierName} Dental Plans</h2>
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
                <th className="py-1 pr-4 font-medium">Annual Max</th>
                <th className="py-1 pr-4 font-medium">Deductible</th>
                <th className="py-1 pr-4 font-medium">Vision</th>
                <th className="py-1 pr-4 font-medium">Hearing</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(q => {
                const rowKey = q.id || q.plan?.key || `${q.carrier?.id||q.carrier?.name||'carrier'}:${q.plan?.display||'plan'}`;
                return (
                <tr key={rowKey} className="border-t border-slate-200 dark:border-slate-700/50">
                  <td className="py-2 pr-4 font-medium text-slate-700 dark:text-slate-200 max-w-[14rem] truncate" title={q.plan?.display}>{q.plan?.display}</td>
                  <td className="py-2 pr-4 tabular-nums">{q.pricing?.monthly != null ? `$${q.pricing.monthly.toFixed(2)}` : '—'}</td>
                  <td className="py-2 pr-4 tabular-nums">{q.metadata?.annualMax != null ? `$${q.metadata.annualMax}` : '—'}</td>
                  <td className="py-2 pr-4 tabular-nums">{q.metadata?.deductibleIndividual != null ? `$${q.metadata.deductibleIndividual}` : '—'}</td>
                  <td className="py-2 pr-4">{q.metadata?.visionIncluded ? 'Yes' : 'No'}</td>
                  <td className="py-2 pr-4">{q.metadata?.hearingIncluded ? 'Yes' : 'No'}</td>
                </tr>
              )})}
              {!sorted.length && (
                <tr><td colSpan={6} className="py-4 text-center text-slate-500">No variants</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card/60 border-slate-200 dark:border-slate-700/60">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Highlights</CardTitle></CardHeader>
          <CardContent className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
            <p>Annual Maximum and deductible shown per plan. Vision/Hearing flags indicate embedded ancillary benefits.</p>
            <p className="text-[11px] opacity-70">Future: add procedure category coverage breakdown (Preventive / Basic / Major).</p>
          </CardContent>
        </Card>
        <Card className="bg-card/60 border-slate-200 dark:border-slate-700/60 col-span-full">
          <CardHeader className="pb-2 flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">Interactive Builder</CardTitle>
            <Button variant="outline" size="sm" onClick={()=> setBuilderOpen(o=>!o)} aria-expanded={builderOpen} aria-controls="dental-builder-panel">
              {builderOpen ? 'Hide Builder' : 'Customize'}
            </Button>
          </CardHeader>
          <CardContent id="dental-builder-panel" className="pt-2">
            {builderOpen ? (
              <div className="space-y-4">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Configure benefit mix and compare dynamic monthly estimate. Uses legacy adaptive builder model.</p>
                <AdaptiveDentalPlanBuilder quotes={optimizedLike as any} onPlanBuilt={handlePlanBuilt} />
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Open the builder to tailor a plan configuration for {carrierName}. </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DentalDetailsShowcase;
