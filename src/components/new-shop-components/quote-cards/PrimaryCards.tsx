"use client";
import React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface PlanBadges { [k:string]: { label: string; color: string } }
export interface CarrierSummaryLight { id:string; name:string; logo:string; rating:string; plans?: Record<string, number | undefined>; planRanges?: Record<string, { min:number; max:number; count:number } | undefined>; }
interface Props {
  carriers: CarrierSummaryLight[];
  loading: boolean;
  planBadges: PlanBadges;
  availablePlans: ('F'|'G'|'N')[];
  selectedPlan: 'F'|'G'|'N';
  onSelectPlan: (p:'F'|'G'|'N') => void;
}

export const LightInverseCards: React.FC<Props> = ({ carriers, loading, planBadges, availablePlans, selectedPlan, onSelectPlan }) => {
  return (
    <section className="space-y-6">
      <div>
        <div className="mt-3 inline-flex gap-2 rounded-full bg-white/80 dark:bg-slate-800/60 p-1 border border-slate-200 dark:border-slate-700 shadow-sm">
          {availablePlans.map(p => {
            const active = selectedPlan === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onSelectPlan(p)}
                className={`px-3.5 py-1.5 text-[13px] font-medium rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 focus-visible:ring-offset-1 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-800 tracking-wide
                  ${active ? 'btn-brand shadow-inner' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700/60 dark:text-slate-200 dark:hover:bg-slate-600/60'}`}
                aria-pressed={active}
              >
                {planBadges[p].label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {carriers.length === 0 && loading &&
          Array.from({length:6}).map((_,i)=>(
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        {carriers.map(carrier => (
          <div key={carrier.id} className="relative rounded-xl bg-gradient-to-br from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 sm:p-5 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow overflow-hidden group">
            <div className="absolute inset-0 pointer-events-none opacity-60 bg-[radial-gradient(circle_at_75%_20%,rgba(56,189,248,0.15),transparent_65%)] dark:opacity-30" />
            <div className="flex items-start justify-between mb-4 sm:mb-6 relative z-10">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-600 flex items-center justify-center overflow-hidden">
                  <Image src={carrier.logo} alt={carrier.name} width={48} height={48} className="object-contain scale-90 sm:scale-100" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 leading-tight text-sm sm:text-base">{carrier.name}</div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">AM Best {carrier.rating}</div>
                </div>
              </div>
              <div className="flex items-start justify-end">
                <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 px-2 py-0.5 text-[10px] sm:text-xs">Medigap</Badge>
              </div>
            </div>
            <div className="space-y-4 sm:space-y-5 relative z-10">
              <div className="flex items-end gap-2.5 sm:gap-3">
                {(() => {
                  const activePrice = carrier.plans?.[selectedPlan];
                  const range = carrier.planRanges?.[selectedPlan];
                  const showRange = range && range.count > 1 && range.max !== range.min;
                  return (
                    <>
                      <div className="flex items-end gap-1.5 sm:gap-2">
                        <div className="text-[2.1rem] sm:text-4xl font-bold leading-none text-slate-900 dark:text-white">{activePrice !== undefined ? `$${activePrice.toFixed(0)}` : '—'}</div>
                        {showRange && (
                          <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-1">{`to $${range.max.toFixed(0)}`}</div>
                        )}
                      </div>
                      {showRange && range && <div className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500">({range.count} quotes)</div>}
                    </>
                  );
                })()}
              </div>
              <div className="flex gap-1 flex-wrap" aria-label="Available plans for this carrier">
                {(['F','G','N'] as const).filter(p => !!carrier.planRanges?.[p]?.count || (carrier.plans && carrier.plans[p] != null)).map(p => {
                  const active = selectedPlan === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => onSelectPlan(p)}
                      className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-medium backdrop-blur focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 focus-visible:ring-offset-1 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 transition
                        ${active ? 'btn-brand shadow ring-1 ring-blue-300/40' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700/60 dark:text-slate-200 dark:hover:bg-slate-600/60'}
                        ${planBadges[p].color.includes('purple') && !active ? 'ring-1 ring-purple-300/40 dark:ring-purple-400/40' : ''}`}
                      aria-pressed={active}
                    >
                      {planBadges[p].label}
                    </button>
                  );
                })}
              </div>
              <Button size="sm" variant="secondary" className="h-7 sm:h-8 text-[11px] sm:text-xs w-full btn-brand-outline dark:bg-white/10 dark:hover:bg-white/20">Explore Plans</Button>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>
    </section>
  );
};
