"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SimplifiedHospitalIndemnityPlanBuilder } from '@/components/medicare-shop/hospital-indemnity/hospital-indemnity-field-mapping/SimplifiedHospitalIndemnityPlanBuilder';

interface HospitalIndemnityDetailsShowcaseProps { carrierName: string; quotes: any[]; onClose: () => void; }

const HospitalIndemnityDetailsShowcase: React.FC<HospitalIndemnityDetailsShowcaseProps> = ({ carrierName, quotes, onClose }) => {
  const sorted = [...quotes].sort((a,b)=> (a.pricing?.monthly ?? 0) - (b.pricing?.monthly ?? 0));
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderResult, setBuilderResult] = useState<any | null>(null);

  const handlePlanBuilt = (config: any) => {
    setBuilderResult(config);
  };
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
            <p>Daily benefit multiplied by covered days provides core inpatient coverage; ambulance & ICU upgrade indicate enhanced riders.</p>
            <p className="text-[11px] opacity-70">Future: add surgical / observation benefits if available.</p>
          </CardContent>
        </Card>
        <Card className="bg-card/60 border-slate-200 dark:border-slate-700/60 col-span-full lg:col-span-2">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Customize Plan</CardTitle>
            <Button size="sm" variant="outline" onClick={() => setShowBuilder(v=>!v)}>{showBuilder ? 'Hide Builder' : 'Show Builder'}</Button>
          </CardHeader>
          <CardContent className="pt-2">
            {showBuilder ? (
              <div className="space-y-4">
                <SimplifiedHospitalIndemnityPlanBuilder quotes={quotes as any} onPlanBuilt={handlePlanBuilt} />
                {builderResult && (
                  <div className="rounded-md border border-slate-300 dark:border-slate-700 p-3 text-[11px] space-y-1 bg-slate-50 dark:bg-slate-800/40">
                    <div className="font-medium text-slate-700 dark:text-slate-200">Last Build Result</div>
                    <pre className="whitespace-pre-wrap break-all text-[10px] max-h-48 overflow-auto">{JSON.stringify(builderResult, null, 2)}</pre>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Open the builder to configure a custom hospital indemnity package using the available variants.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HospitalIndemnityDetailsShowcase;
