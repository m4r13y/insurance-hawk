"use client";
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { BookmarkFilledIcon, BookmarkIcon } from '@radix-ui/react-icons';
import { useSavedPlans } from '@/contexts/SavedPlansContext';
import { AmBestStarRating } from '@/components/ui/star-rating';
import { CarrierLogoBlock, SaveToggleButton, DetailsButton, PlanPriceBlock } from './SharedCardParts';
import { CardShell, useCardVisibility } from './CardShell';

interface PlanBadges { [k:string]: { label: string; color: string } }
export interface CarrierSummaryLight { id:string; name:string; logo:string; rating:string; plans?: Record<string, number | undefined>; planRanges?: Record<string, { min:number; max:number; count:number } | undefined>; }
interface Props {
  carriers: CarrierSummaryLight[];
  loading: boolean;
  planBadges: PlanBadges;
  availablePlans: ('F'|'G'|'N')[];
  selectedPlans: ('F'|'G'|'N')[]; // multi-select support
  onTogglePlan: (p:'F'|'G'|'N') => void; // toggles inclusion/exclusion
  onOpenPlanDetails?: (carrier: CarrierSummaryLight) => void; // optional callback to open plan details via URL params
}

export const LightInverseCards: React.FC<Props> = ({ carriers, loading, planBadges, availablePlans, selectedPlans, onTogglePlan, onOpenPlanDetails }) => {
  // (Replaced custom multi-element observer with per-card hook via CardShell)
  const { isSaved: isCarrierPlanSaved, toggle: toggleSaved } = useSavedPlans();
  const handleToggleSave = (carrier: CarrierSummaryLight, planType: string | undefined, activePrice?: number, range?: {min:number; max:number}) => {
    toggleSaved({
      carrierId: carrier.id,
      carrierName: carrier.name,
      logo: carrier.logo,
      rating: carrier.rating,
      category: 'medigap',
      planType,
      price: activePrice,
      min: range?.min,
      max: range?.max
    });
  };

  // legacy observer removed

  return (
    <section className="space-y-6">
      {(() => {
        // Determine which plan types actually have quotes/ranges
        const activePlanTypes = availablePlans.filter(p => {
          return carriers.some(c => c.planRanges?.[p]?.count || (c.plans && c.plans[p] != null));
        });
        if (activePlanTypes.length <= 1) return null; // Hide toggle when only one plan type present
        return (
          <div>
            <div className="mt-3 inline-flex gap-2 rounded-full bg-white/80 dark:bg-slate-800/60 p-1 border border-slate-200 dark:border-slate-700 shadow-sm">
              {activePlanTypes.map(p => {
                const active = selectedPlans.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onTogglePlan(p)}
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
        );
      })()}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {carriers.length === 0 && loading &&
          Array.from({length:6}).map((_,i)=>(
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        {carriers.map(carrier => {
          // For multi-select, show the lowest price among selected plans (or among all available if none selected)
          const plansToConsider = selectedPlans.length ? selectedPlans : availablePlans;
          let activePrice: number | undefined = undefined;
          let aggregateRange: {min:number; max:number; count:number} | undefined = undefined;
          plansToConsider.forEach(pl => {
            const pVal = carrier.plans?.[pl];
            const pr = carrier.planRanges?.[pl] as {min:number; max:number; count:number} | undefined;
            if (pVal != null) {
              if (activePrice == null || pVal < activePrice) activePrice = pVal;
            }
            if (pr) {
              if (!aggregateRange) aggregateRange = { ...pr };
              else {
                aggregateRange.min = Math.min(aggregateRange.min, pr.min);
                aggregateRange.max = Math.max(aggregateRange.max, pr.max);
                aggregateRange.count += pr.count;
              }
            }
          });
          const range = aggregateRange as {min:number; max:number; count:number} | undefined;
          const showRange = !!(range && range.count > 1 && range.max !== range.min);
          const saved = plansToConsider.some(pl => isCarrierPlanSaved(carrier.id, pl));
          // Removed quote count display per design update
          const CardInner: React.FC = () => {
            const { ref, visible } = useCardVisibility(undefined, undefined, carrier.id);
            // Always reserve layout space (CardShell has min-h). Show lightweight shimmer until visible.
            const showSkeleton = loading && !visible;
            return (
              <CardShell ref={ref as any} highlight={saved} className="p-4 sm:p-5" minHeight={loading ? 250 : undefined}>
                {/* Skeleton overlay fades out; does not collapse height */}
                <div className={`absolute inset-0 flex flex-col p-4 gap-4 transition-opacity duration-300 ${showSkeleton ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} aria-hidden="true">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <Skeleton className="h-4 w-40" />
                  <div className="mt-auto space-y-2">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-9 w-11 rounded-md" />
                  </div>
                </div>
                {/* Content mounted immediately to eliminate mount-time layout shift; opacity handles reveal */}
                <div className={`relative z-10 flex flex-col h-full transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
              {/* Header */}
              <div className="relative z-10 flex items-start gap-3 mb-3">
                <SaveToggleButton
                  saved={saved}
                  onToggle={() => handleToggleSave(carrier, selectedPlans[0], activePrice, range ? {min: range!.min, max: range!.max} : undefined)}
                />
                <CarrierLogoBlock name={carrier.name} logo={carrier.logo} />
                <div className="flex-1 min-w-0 pr-1">
                  <div className="font-semibold text-slate-900 dark:text-slate-100 leading-tight text-base flex items-center gap-2 flex-wrap">
                    {/* Allow wrapping to multiple rows (previously truncated) */}
                    <span className="max-w-full break-words whitespace-normal">{carrier.name}</span>
                    {/* savings badge removed per request */}
                  </div>
                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    <AmBestStarRating amBestRating={carrier.rating} size="sm" showText={false} />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 tracking-wide font-medium">AM BEST {carrier.rating || 'N/A'}</span>
                  </div>
                </div>
              </div>
              {/* Plan pills */}
              <div className="relative z-10 flex gap-2 mb-4 flex-wrap">
                {(['F','G','N'] as const).filter(p => !!carrier.planRanges?.[p]?.count || (carrier.plans && carrier.plans[p] != null)).map(p => {
                  const active = selectedPlans.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => onTogglePlan(p)}
                      className={`px-4 py-1 rounded-full text-[12px] font-medium border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60
                        ${active ? 'bg-blue-600/10 text-blue-700 dark:text-white border-blue-300 dark:border-blue-400 shadow-sm' : 'bg-white/60 dark:bg-transparent text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-500 hover:bg-blue-50 dark:hover:border-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
                      aria-pressed={active}
                    >
                      {planBadges[p].label}
                    </button>
                  );
                })}
              </div>
              {/* Price + CTA row */}
              <div className="relative z-10 flex items-end justify-between mt-auto">
                <div className="flex flex-col">
                  <PlanPriceBlock price={activePrice} range={range as any} showRange={showRange} />
                </div>
                <DetailsButton onClick={() => onOpenPlanDetails?.(carrier)} carrierName={carrier.name} />
              </div>
                </div>
              </CardShell>
            );
          };
          return <CardInner key={carrier.id} />;
        })}
      </div>
    </section>
  );
};
