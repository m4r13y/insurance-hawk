"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DentalDetailsShowcaseProps { carrierName: string; quotes: any[]; onClose: () => void; }

const DentalDetailsShowcase: React.FC<DentalDetailsShowcaseProps> = ({ carrierName, quotes, onClose }) => {
  const sorted = [...quotes].sort((a,b)=> (a.pricing?.monthly ?? 0) - (b.pricing?.monthly ?? 0));
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
              {sorted.map(q => (
                <tr key={q.id} className="border-t border-slate-200 dark:border-slate-700/50">
                  <td className="py-2 pr-4 font-medium text-slate-700 dark:text-slate-200 max-w-[14rem] truncate" title={q.plan?.display}>{q.plan?.display}</td>
                  <td className="py-2 pr-4 tabular-nums">{q.pricing?.monthly != null ? `$${q.pricing.monthly.toFixed(2)}` : '—'}</td>
                  <td className="py-2 pr-4 tabular-nums">{q.metadata?.annualMax != null ? `$${q.metadata.annualMax}` : '—'}</td>
                  <td className="py-2 pr-4 tabular-nums">{q.metadata?.deductibleIndividual != null ? `$${q.metadata.deductibleIndividual}` : '—'}</td>
                  <td className="py-2 pr-4">{q.metadata?.visionIncluded ? 'Yes' : 'No'}</td>
                  <td className="py-2 pr-4">{q.metadata?.hearingIncluded ? 'Yes' : 'No'}</td>
                </tr>
              ))}
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
      </div>
    </div>
  );
};

export default DentalDetailsShowcase;
