"use client";
import React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRightIcon, BookmarkIcon, BookmarkFilledIcon } from '@radix-ui/react-icons';
import { useSavedPlans } from '@/contexts/SavedPlansContext';
import { AmBestStarRating } from '@/components/ui/star-rating';

interface PlanBadges { [k:string]: { label: string; color: string } }
export interface CarrierSummaryLight { id:string; name:string; logo:string; rating:string; plans?: Record<string, number | undefined>; planRanges?: Record<string, { min:number; max:number; count:number } | undefined>; }
interface Props {
  carriers: CarrierSummaryLight[];
  loading: boolean;
  planBadges: PlanBadges;
  availablePlans: ('F'|'G'|'N')[];
  selectedPlan: 'F'|'G'|'N';
  onSelectPlan: (p:'F'|'G'|'N') => void;
  onOpenPlanDetails?: (carrier: CarrierSummaryLight) => void; // optional callback to open plan details via URL params
}

export const LightInverseCards: React.FC<Props> = ({ carriers, loading, planBadges, availablePlans, selectedPlan, onSelectPlan, onOpenPlanDetails }) => {
  // Track which carrier cards have entered the viewport
  const [visibleIds, setVisibleIds] = React.useState<Set<string>>(() => new Set());
  const observerRef = React.useRef<IntersectionObserver | null>(null);
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

  const registerObserver = React.useCallback((el: HTMLDivElement | null, id: string) => {
    if (!el) return;
    if (visibleIds.has(id)) return; // already visible, no need to observe
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver((entries) => {
        setVisibleIds(prev => {
          let changed = false;
          const next = new Set(prev);
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const targetId = (entry.target as HTMLElement).dataset.carrierId;
              if (targetId && !next.has(targetId)) {
                next.add(targetId);
                changed = true;
              }
              observerRef.current?.unobserve(entry.target);
            }
          });
          return changed ? next : prev;
        });
      }, { rootMargin: '80px 0px 160px 0px', threshold: 0.1 });
    }
    observerRef.current.observe(el);
  }, [visibleIds]);

  React.useEffect(() => () => { observerRef.current?.disconnect(); }, []);

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
        );
      })()}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {carriers.length === 0 && loading &&
          Array.from({length:6}).map((_,i)=>(
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        {carriers.map(carrier => {
          const isVisible = visibleIds.has(carrier.id) || !loading; // if loading false, show all immediately
          const activePrice = carrier.plans?.[selectedPlan];
          const range = carrier.planRanges?.[selectedPlan];
          const showRange = range && range.count > 1 && range.max !== range.min;
          const saved = isCarrierPlanSaved(carrier.id, selectedPlan);
          // Removed quote count display per design update
          return (
            <div
              key={carrier.id}
              data-carrier-id={carrier.id}
              ref={(el) => registerObserver(el, carrier.id)}
              className="relative rounded-xl bg-gradient-to-br from-[#0f172a] via-[#0f1d33] to-[#0f172a] dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 sm:p-5 border border-slate-700/60 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow overflow-hidden group"
            >
              {!isVisible ? (
                <div className="absolute inset-0 flex flex-col p-4 gap-4" aria-hidden="true">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <Skeleton className="h-4 w-40" />
                  <div className="mt-auto space-y-2">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-9 w-11 rounded-md" />
                  </div>
                </div>
              ) : null}
              {isVisible && (
              <>
              <div className="absolute inset-0 pointer-events-none opacity-60 bg-[radial-gradient(circle_at_85%_18%,rgba(56,189,248,0.18),transparent_65%)]" />
              {/* Header */}
              <div className="relative z-10 flex items-start gap-3 mb-3">
                <button
                  type="button"
                  aria-label={saved ? 'Unsave plan' : 'Save plan'}
                  onClick={() => handleToggleSave(carrier, selectedPlan, activePrice, range ? {min: range.min, max: range.max} : undefined)}
                  className={`absolute top-0 right-0 -mt-1 -mr-1 w-8 h-8 inline-flex items-center justify-center rounded-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60
                    ${saved ? 'text-amber-400 hover:text-amber-300 bg-slate-700/60' : 'text-slate-400 hover:text-white hover:bg-slate-700/60'}`}
                >
                  {saved ? <BookmarkFilledIcon className="w-4.5 h-4.5" aria-hidden="true" /> : <BookmarkIcon className="w-4.5 h-4.5" aria-hidden="true" />}
                </button>
                <div className="w-12 h-12 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden text-slate-700 dark:text-slate-200 font-semibold text-lg">
                  {/* Fallback initial (always render; image overlays if available) */}
                  <span className="absolute">{carrier.name.charAt(0)}</span>
                  <Image loading="lazy" src={carrier.logo} alt={carrier.name} width={48} height={48} className="object-contain relative z-10" onError={(e)=>{(e.currentTarget as HTMLImageElement).style.display='none';}} />
                </div>
                <div className="flex-1 min-w-0 pr-1">
                  <div className="font-semibold text-slate-100 leading-tight text-base flex items-center gap-2 flex-wrap">
                    {/* Allow wrapping to multiple rows (previously truncated) */}
                    <span className="max-w-full break-words whitespace-normal">{carrier.name}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    <AmBestStarRating amBestRating={carrier.rating} size="sm" showText={false} />
                    <span className="text-[11px] text-slate-400 tracking-wide font-medium">AM BEST {carrier.rating || 'N/A'}</span>
                  </div>
                </div>
              </div>
              {/* Plan pills */}
              <div className="relative z-10 flex gap-2 mb-4 flex-wrap">
                {(['F','G','N'] as const).filter(p => !!carrier.planRanges?.[p]?.count || (carrier.plans && carrier.plans[p] != null)).map(p => {
                  const active = selectedPlan === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => onSelectPlan(p)}
                      className={`px-4 py-1 rounded-full text-[12px] font-medium border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60
                        ${active ? 'bg-blue-500/30 text-white border-blue-400/60 shadow-sm backdrop-blur-[1px]' : 'bg-transparent text-slate-200 border-slate-500 hover:border-slate-300 hover:text-white'}`}
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
                  <div className="flex items-end gap-2">
                    <div className="text-4xl font-bold leading-none text-white">{activePrice !== undefined ? `$${activePrice.toFixed(0)}` : '—'}</div>
                    {showRange && range && (
                      <div className="text-sm text-slate-400 mb-1">to ${range.max.toFixed(0)}</div>
                    )}
                  </div>
                  {/* Quote count removed */}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => onOpenPlanDetails?.(carrier)}
                    className="w-11 h-11 inline-flex items-center justify-center rounded-md border border-slate-600 bg-slate-800/70 text-slate-200 hover:bg-slate-700 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 transition shadow-sm"
                    aria-label={`View plans for ${carrier.name}`}
                  >
                    <ArrowRightIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
