"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CancerDetailsShowcaseProps {
  carrierName: string;
  quotes: any[]; // underlying raw grouped quotes for this carrier (CancerInsuranceQuote[])
  onClose: () => void;
}

// Enriched inline details showcase for Cancer Insurance (mirrors structure of FinalExpenseDetailsShowcase)
const CancerDetailsShowcase: React.FC<CancerDetailsShowcaseProps> = ({ carrierName, quotes, onClose }) => {
  const sorted = React.useMemo(() => [...quotes].sort((a,b)=> (a.monthly_premium ?? 0) - (b.monthly_premium ?? 0)), [quotes]);
  const currency = (v: number | undefined | null) => v == null ? '—' : `$${new Intl.NumberFormat('en-US',{minimumFractionDigits:2, maximumFractionDigits:2}).format(v)}`;
  const premiums = sorted.map(q => q.monthly_premium).filter((v:any)=> typeof v === 'number');
  const benefits = sorted.map(q => q.benefit_amount).filter((v:any)=> typeof v === 'number');
  const minPrem = premiums.length ? Math.min(...premiums) : undefined;
  const maxPrem = premiums.length ? Math.max(...premiums) : undefined;
  const minBenefit = benefits.length ? Math.min(...benefits) : undefined;
  const maxBenefit = benefits.length ? Math.max(...benefits) : undefined;

  return (
    <div className="space-y-8" data-cancer-details>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight flex items-center gap-3">{carrierName} Cancer Insurance</h2>
        <Button size="sm" variant="outline" onClick={onClose}>Back</Button>
      </div>

      <Card>
        <CardHeader className="pb-2 flex items-center justify-between">
          <CardTitle className="text-sm">Plan Variants</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="text-left text-slate-500 dark:text-slate-400">
                <th className="py-1 pr-4 font-medium">Plan</th>
                <th className="py-1 pr-4 font-medium">Monthly Premium</th>
                <th className="py-1 pr-4 font-medium">Benefit Amount</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(q => (
                <tr key={q.plan_name + q.monthly_premium} className="border-t border-slate-200 dark:border-slate-700/50">
                  <td className="py-2 pr-4 font-medium text-slate-700 dark:text-slate-200 max-w-[14rem] truncate" title={q.plan_name}>{q.plan_name}</td>
                  <td className="py-2 pr-4 tabular-nums">{currency(q.monthly_premium)}</td>
                  <td className="py-2 pr-4 tabular-nums">{q.benefit_amount ? `$${q.benefit_amount.toLocaleString()}` : '—'}</td>
                </tr>
              ))}
              {!sorted.length && (<tr><td colSpan={3} className="py-4 text-center text-slate-500">No variants</td></tr>)}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card/60 border-slate-200 dark:border-slate-700/60">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Highlights</CardTitle></CardHeader>
          <CardContent className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
            <p>Lump sum benefits can help cover treatment, travel, or household expenses after a cancer diagnosis.</p>
            <p className="text-[11px] opacity-70">Future sections: recurrence benefits, wellness screening payouts, rider options.</p>
          </CardContent>
        </Card>

        {sorted.length > 0 && (
          <Card className="bg-card/60 border-slate-200 dark:border-slate-700/60">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Ranges & Distribution</CardTitle></CardHeader>
            <CardContent className="text-[11px] space-y-2 text-slate-600 dark:text-slate-300">
              <div>Monthly Premium Range: {minPrem!=null ? currency(minPrem) : '—'} to {maxPrem!=null ? currency(maxPrem) : '—'}</div>
              <div>Benefit Amount Range: {minBenefit!=null ? `$${minBenefit.toLocaleString()}` : '—'} to {maxBenefit!=null ? `$${maxBenefit.toLocaleString()}` : '—'}</div>
              <div>Total Variants: {sorted.length}</div>
              {minPrem!=null && maxPrem!=null && minPrem!==maxPrem && (
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Showing spread between lowest and highest monthly premium.</div>
              )}
            </CardContent>
          </Card>
        )}

        {sorted.length > 0 && (
          <Card className="bg-card/60 border-slate-200 dark:border-slate-700/60">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Sample Premiums</CardTitle></CardHeader>
            <CardContent className="text-[11px] space-y-3 text-slate-600 dark:text-slate-300">
              {sorted.slice(0,3).map(q => (
                <div key={q.plan_name + q.monthly_premium} className="flex items-center justify-between gap-3">
                  <span className="truncate max-w-[9rem]" title={q.plan_name}>{q.plan_name}</span>
                  <div className="text-right leading-tight">
                    <div className="font-medium">{currency(q.monthly_premium)}</div>
                    <div className="text-xs opacity-70">Benefit: {q.benefit_amount ? `$${q.benefit_amount.toLocaleString()}` : '—'}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Placeholder for future request context (age, state, tobacco) */}
      </div>
    </div>
  );
};

export default CancerDetailsShowcase;
