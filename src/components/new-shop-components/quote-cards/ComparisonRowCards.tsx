"use client";
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useSavedPlans } from '@/contexts/SavedPlansContext';
import { AmBestStarRating } from '@/components/ui/star-rating';
import { CarrierLogoBlock, SaveToggleButton, DetailsButton } from './SharedCardParts';

interface PlanBadges { [k:string]: { label: string; color: string } }
// __preferred is injected upstream for medigap carriers; mark optional so component stays generic-safe.
export interface CarrierSummary { id: string; name: string; logo: string; rating?: string; min?: number; max?: number; plans?: Record<string, number | undefined>; planRanges?: Record<string, {min:number; max:number; count:number} | undefined>; __preferred?: boolean }

interface Props {
  carriers: CarrierSummary[];
  loading: boolean;
  planBadges: PlanBadges;
  selectedPlan?: 'F'|'G'|'N';
  onSelectPlan?: (p:'F'|'G'|'N') => void;
  onOpenPlanDetails?: (carrier: CarrierSummary) => void;
  enableSave?: boolean;
}

export const ComparisonRowCards: React.FC<Props> = ({ carriers, loading, planBadges, selectedPlan='G', onSelectPlan, onOpenPlanDetails, enableSave=true }) => {
  const { isSaved: isCarrierPlanSaved, toggle: toggleSaved } = useSavedPlans();
  const planTypes = ['F','G','N'] as const;

  return (
    <section className="space-y-6">
      <div className="space-y-4">
        {carriers.length === 0 && loading && (
          <div className="grid gap-4">
            {Array.from({length:3}).map((_,i)=>(
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        )}
        {carriers.map(carrier => {
          // Determine active plan to display; fallback to first available
          const available = planTypes.filter(p => carrier.plans && carrier.plans[p] != null);
            const activePlan = available.includes(selectedPlan) ? selectedPlan : (available[0] || 'G');
          const price = carrier.plans?.[activePlan];
          const saved = enableSave ? isCarrierPlanSaved(carrier.id, activePlan) : false;
          const hasMultiple = available.length > 1;
          return (
            <div
              key={carrier.id}
              className="relative rounded-xl bg-gradient-to-br from-[#0f172a] via-[#142033] to-[#0f172a] dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 sm:p-5 border border-slate-700/60 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow overflow-hidden group"
            >
              <div className="absolute inset-0 pointer-events-none opacity-50 bg-[radial-gradient(circle_at_85%_22%,rgba(56,189,248,0.18),transparent_65%)]" />
              <div className="relative z-10 flex items-start justify-between gap-4 mb-2">
                <div className="flex items-start gap-3 min-w-0">
                  {enableSave && (
                    <SaveToggleButton
                      saved={saved}
                      onToggle={() => toggleSaved({ carrierId: carrier.id, carrierName: carrier.name, logo: carrier.logo, rating: carrier.rating, category: 'medigap', planType: activePlan, price })}
                      variant="inline"
                    />
                  )}
                  <CarrierLogoBlock name={carrier.name} logo={carrier.logo} />
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="font-semibold text-slate-100 leading-tight text-base flex items-center gap-2 flex-wrap">
                      <span className="max-w-full break-words whitespace-normal">{carrier.name}</span>
                      {carrier.__preferred && (
                        <Badge variant="outline" className="text-[10px] px-2 py-0 h-5 font-medium border-sky-400/60 text-sky-300 bg-sky-400/10">Preferred</Badge>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      <AmBestStarRating amBestRating={carrier.rating} size="sm" showText={false} />
                      <span className="text-[11px] text-slate-400 tracking-wide font-medium">AM BEST {carrier.rating || 'N/A'}</span>
                    </div>
                     <div className="text-[11px] text-slate-400 tracking-wide mb-1">Plan {activePlan}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end text-right">
                  <div className="text-3xl font-bold leading-none text-white">{price !== undefined ? `$${price.toFixed(0)}` : '—'}</div>
                  {hasMultiple && (
                    <div className="flex gap-1 mt-2 flex-wrap justify-end">
                      {available.map(p => {
                        const active = activePlan === p;
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => onSelectPlan?.(p)}
                            className={`px-3 py-0.5 rounded-full text-[11px] font-medium border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60
                              ${active ? 'bg-blue-500/30 text-white border-blue-400/60 shadow-sm' : 'bg-transparent text-slate-300 border-slate-600 hover:border-slate-400 hover:text-white'}`}
                            aria-pressed={active}
                          >
                            {planBadges[p].label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className="relative z-10 flex items-center justify-end mt-3">
                <DetailsButton onClick={() => onOpenPlanDetails?.(carrier)} carrierName={carrier.name} />
              </div>
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          );
        })}
      </div>
    </section>
  );
};
