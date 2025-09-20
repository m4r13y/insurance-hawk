"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FinalExpenseDetailsShowcaseProps { carrierName: string; quotes: any[]; onClose: () => void; }

const FinalExpenseDetailsShowcase: React.FC<FinalExpenseDetailsShowcaseProps> = ({ carrierName, quotes, onClose }) => {
  // Build normalized display list (raw toggle removed; always show normalized pricing now)
  const sorted = [...quotes].sort((a,b)=> (a.pricing?.monthly ?? 0) - (b.pricing?.monthly ?? 0));
  const getMoney = (q:any, key:'monthly'|'fee'|'totalMonthly') => q.pricing?.[key];
  // Attempt to load request context (final expense form) for quote mode display
  let requestContext: { age?: string|number; gender?: string; tobaccoUse?: any; desiredFaceValue?: string; desiredRate?: string; finalExpenseQuoteMode?: 'face'|'rate' } = {};
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('medicare_form_state') || localStorage.getItem('medicare_quote_form_data');
      if (raw) {
        const obj = JSON.parse(raw);
        requestContext = {
          age: obj.age,
            gender: obj.gender,
            tobaccoUse: obj.tobaccoUse,
            desiredFaceValue: obj.desiredFaceValue,
            desiredRate: obj.desiredRate,
            finalExpenseQuoteMode: obj.finalExpenseQuoteMode
        };
      }
    }
  } catch {}
  // Collect a merged field map of interesting raw attributes across quotes for quick visual diff
  const interestingKeys = [
    'face_amount_max','annual_rate','monthly_fee','monthly_rate','face_value','benefit_rate','annual_rate_max','annual_fee','riders','hh_discount','annual_rate_min','monthly_modal_factor','face_amount_min','gender','monthly_single_pay_face','underwriting_data','is_down_payment_plan','has_pdf_app','semi_annual_fee','semi_annual_rate','quarterly_single_pay_face','semi_annual_modal_factor','single_pay_annual_rate','quarterly_pay_face','full_underwriting','monthly_pay_face','quarterly_fee','semi_annual_single_pay_face','single_pay_quarterly_rate','quarterly_modal_factor','single_pay_monthly_rate','single_pay_semi_annual_rate','semi_annual_pay_face','annual_single_pay_face','underwriting_type','annual_pay_face','quarterly_rate','down_payment_value'
  ];
  const rawDebug: Array<{ id: any; plan: any; [key: string]: any }> = sorted.map(q => {
    const src = (q as any)?.raw || (q as any)?.original || q; // attempt to find original object reference
    const obj: Record<string, any> = {};
    interestingKeys.forEach(k => { if (src && Object.prototype.hasOwnProperty.call(src, k)) obj[k] = (src as any)[k]; });
    return { id: (q as any).id, plan: (q as any).plan?.display, ...obj };
  });
  const hasRaw = rawDebug.some(r => Object.keys(r).length > 2);
  const [showRaw, setShowRaw] = React.useState(false);
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight flex items-center gap-3">{carrierName} Final Expense</h2>
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
                <th className="py-1 pr-4 font-medium">Monthly</th>
                <th className="py-1 pr-4 font-medium">Total (w/ Fee)</th>
                <th className="py-1 pr-4 font-medium">Face Amount</th>
                <th className="py-1 pr-4 font-medium">Graded</th>
                <th className="py-1 pr-4 font-medium">Immediate</th>
                <th className="py-1 pr-4 font-medium">Accidental</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(q => (
                <tr key={q.id} className="border-t border-slate-200 dark:border-slate-700/50">
                  <td className="py-2 pr-4 font-medium text-slate-700 dark:text-slate-200 max-w-[14rem] truncate" title={q.plan?.display}>{q.plan?.display}</td>
                  <td className="py-2 pr-4 tabular-nums">{(() => { const v = getMoney(q,'monthly'); if(v==null) return '—'; return `$${(+v).toFixed(2)}`; })()}</td>
                  <td className="py-2 pr-4 tabular-nums">{(() => { const v = getMoney(q,'totalMonthly'); if(v==null) return '—'; return `$${(+v).toFixed(2)}`; })()}</td>
                  <td className="py-2 pr-4 tabular-nums">{(() => {
                    const fa = q.metadata?.faceAmount ?? q.metadata?.faceValue; // fallback to requested face value if variant face amount absent
                    return fa != null ? `$${fa}` : '—';
                  })()}</td>
                  <td className="py-2 pr-4">{q.metadata?.graded ? 'Yes' : 'No'}</td>
                  <td className="py-2 pr-4">{q.metadata?.immediate ? 'Yes' : 'No'}</td>
                  <td className="py-2 pr-4">{q.metadata?.accidental ? 'Yes' : 'No'}</td>
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
            <p>Face amount and graded/immediate status indicate underwriting tier. Accidental rider adds extra payout on qualifying events.</p>
            <p className="text-[11px] opacity-70">Future: add premium mode breakdown or smoker status variants.</p>
          </CardContent>
        </Card>
        {/* Pricing Breakdown Panel */}
        {sorted.length > 0 && (
          <Card className="bg-card/60 border-slate-200 dark:border-slate-700/60">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Pricing Breakdown</CardTitle></CardHeader>
            <CardContent className="text-[11px] space-y-2 text-slate-600 dark:text-slate-300">
              {sorted.slice(0,3).map(q => (
                <div key={q.id} className="flex items-center justify-between gap-3">
                  <span className="truncate max-w-[9rem]" title={q.plan?.display}>{q.plan?.display}</span>
                  <div className="text-right leading-tight">
                    <div>Base: {(() => { const v = getMoney(q,'monthly'); if(v==null) return '—'; return `$${(+v).toFixed(2)}`; })()}</div>
                    {(() => { const fee = getMoney(q,'fee'); if(fee==null) return null; return <div className="text-xs opacity-70">Fee: ${(+fee).toFixed(2)}{(+fee)===0? ' (none)': ''}</div>; })()}
                    <div className="font-medium">Total: {(() => { const tv=getMoney(q,'totalMonthly'); if(tv==null) return '—'; return `$${(+tv).toFixed(2)}`; })()}</div>
                  </div>
                </div>
              ))}
              {sorted.every(q=> (q.pricing?.fee ?? 0) === 0) && (
                <div className="text-[10px] text-slate-500 dark:text-slate-400">All displayed plan totals equal base premium because no policy fees were returned for these variants.</div>
              )}
            </CardContent>
          </Card>
        )}
        {/* Coverage & Underwriting */}
        {sorted.length > 0 && (
          <Card className="bg-card/60 border-slate-200 dark:border-slate-700/60">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Coverage & Underwriting</CardTitle></CardHeader>
            <CardContent className="text-[11px] space-y-2 text-slate-600 dark:text-slate-300">
              {(() => {
                const first = sorted[0];
                const min = first.metadata?.faceAmountMin;
                const max = first.metadata?.faceAmountMax;
                const requested = requestContext.finalExpenseQuoteMode==='rate' ? undefined : requestContext.desiredFaceValue ? parseInt(requestContext.desiredFaceValue as string,10) : undefined;
                const outOfRange = requested!=null && ((min!=null && requested < min) || (max!=null && requested > max));
                return (
                  <>
                    <div>Range: {min || max ? `${min?`$${min}`:'—'} to ${max?`$${max}`:'—'}` : '—'}</div>
                    {requested!=null && <div>Requested: ${requested}{outOfRange && <span className="text-red-500 ml-1">(outside range)</span>}</div>}
                    <div>Graded: {first.metadata?.graded ? 'Yes' : 'No'} | Immediate: {first.metadata?.immediate ? 'Yes':'No'}</div>
                    <div>Accidental Rider: {first.metadata?.accidental ? 'Yes':'No'}</div>
                    {first.metadata?.rating && <div>A.M. Best: {first.metadata.rating}</div>}
                  </>
                );
              })()}
            </CardContent>
          </Card>
        )}
        {/* Request Context */}
        {(requestContext.finalExpenseQuoteMode || requestContext.desiredFaceValue || requestContext.desiredRate) && (
          <Card className="bg-card/60 border-slate-200 dark:border-slate-700/60">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Request Context</CardTitle></CardHeader>
            <CardContent className="text-[11px] space-y-1 text-slate-600 dark:text-slate-300">
              {requestContext.finalExpenseQuoteMode && <div>Mode: {requestContext.finalExpenseQuoteMode==='rate' ? 'Target Monthly Rate' : 'Face Value'}</div>}
              {requestContext.finalExpenseQuoteMode==='rate' && requestContext.desiredRate && <div>Target Rate: ${requestContext.desiredRate}</div>}
              {requestContext.finalExpenseQuoteMode!=='rate' && requestContext.desiredFaceValue && <div>Requested Face: ${requestContext.desiredFaceValue}</div>}
              {requestContext.age && <div>Age: {requestContext.age}</div>}
              {requestContext.gender && <div>Gender: {String(requestContext.gender).charAt(0).toUpperCase()}</div>}
              {requestContext.tobaccoUse!=null && <div>Tobacco: {requestContext.tobaccoUse ? 'Yes':'No'}</div>}
            </CardContent>
          </Card>
        )}
        {hasRaw && (
          <Card className="bg-card/60 border-slate-200 dark:border-slate-700/60 col-span-full">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Raw Plan Data (Debug)</CardTitle>
              <Button size="sm" variant="outline" onClick={()=> setShowRaw(s=>!s)}>{showRaw ? 'Hide' : 'Show'}</Button>
            </CardHeader>
            {showRaw && (
              <CardContent className="text-[11px] font-mono overflow-x-auto max-h-80 whitespace-pre leading-snug">
                {rawDebug.map(entry => (
                  <div key={entry.id} className="mb-3">
                    <div className="font-semibold text-slate-700 dark:text-slate-200">{entry.plan || entry.id}</div>
                    <table className="text-[10px] mt-1 w-full border-collapse">
                      <tbody>
                        {interestingKeys.filter(k => entry[k] !== undefined).map(k => (
                          <tr key={k} className="border-t border-slate-200 dark:border-slate-700/50">
                            <td className="pr-2 py-0.5 align-top text-slate-500 dark:text-slate-400">{k}</td>
                            <td className="py-0.5 align-top text-slate-700 dark:text-slate-200">{formatValue(entry[k])}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

function formatValue(v: any){
  if (v === null || v === undefined || v==='') return '—';
  if (Array.isArray(v)) return v.length ? `[${v.map(x=> typeof x==='object'? JSON.stringify(x): String(x)).join(', ')}]` : '[]';
  if (typeof v === 'object') return JSON.stringify(v);
  if (typeof v === 'number') return isFinite(v) ? v.toString() : '—';
  return String(v);
}

export default FinalExpenseDetailsShowcase;
