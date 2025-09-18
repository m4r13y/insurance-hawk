"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useSavedPlans } from '@/contexts/SavedPlansContext';
import { CarrierLogoBlock, SaveToggleButton, DetailsButton, PlanPriceBlock } from './SharedCardParts';
import { CardShell, useCardVisibility } from './CardShell';
import { CMSStarRating } from '@/components/ui/cms-star-rating';
import { Skeleton } from '@/components/ui/skeleton';

export interface DrugPlanCarrierSummary {
  id: string;
  name: string;
  logo: string;
  rating?: number | string; // CMS star rating (0-5) or string fallback
  min?: number;              // representative lowest premium
  max?: number;              // optional max (if multiple plans)
  planRange?: { min:number; max:number; count:number };
  planName?: string;
  deductible?: number;
  count: number;             // number of plans for this carrier
}

interface Props {
  carriers: DrugPlanCarrierSummary[];
  loading: boolean;
  onOpenCarrierDetails?: (carrier: DrugPlanCarrierSummary) => void;
}

export const DrugPlanCards: React.FC<Props> = ({ carriers, loading, onOpenCarrierDetails }) => {
  const { isSaved, toggle } = useSavedPlans() as any;
  const router = useRouter();

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {carriers.length === 0 && loading && Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-64 rounded-xl" />
      ))}
      {carriers.map(c => {
        const saved = isSaved(c.id, 'PDP', 'drug-plan');
        const showRange = c.planRange && c.planRange.count > 1 && c.planRange.max !== c.planRange.min;
        const CardInner: React.FC = () => {
          const { ref, visible } = useCardVisibility();
          const showSkeleton = !visible && loading;
          return (
            <CardShell ref={ref as any} highlight={false} className="p-4 sm:p-5" key={c.id}>
              {showSkeleton && (
                <div className="absolute inset-0 flex flex-col p-4 gap-4" aria-hidden="true">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <Skeleton className="h-4 w-40" />
                  <div className="mt-auto space-y-2">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-9 w-11 rounded-md" />
                  </div>
                </div>
              )}
              {visible && (
              <>
              <div className="relative z-10 flex items-start gap-3 mb-3">
                <SaveToggleButton
                  saved={saved}
                  onToggle={() => toggle({
                    carrierId: c.id,
                    carrierName: c.name,
                    logo: c.logo,
                    rating: String(c.rating ?? 'N/A'),
                    category: 'drug-plan',
                    planType: 'PDP',
                    price: c.min,
                    min: c.planRange?.min,
                    max: c.planRange?.max,
                  })}
                />
                <CarrierLogoBlock name={c.name} logo={c.logo} />
                <div className="flex-1 min-w-0 pr-1">
                  <div className="font-semibold text-slate-900 dark:text-slate-100 leading-tight text-base flex items-center gap-2 flex-wrap">
                    <span className="max-w-full break-words whitespace-normal">{c.name}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 flex-wrap text-[11px] text-slate-500 dark:text-slate-400 tracking-wide font-medium">
                    <CMSStarRating rating={c.rating} showText={true} />
                    {c.planName && (
                      <span className="text-slate-500 dark:text-slate-400 truncate max-w-[12rem]" title={c.planName}>{c.planName}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="relative z-10 flex items-end justify-between mt-auto">
                <div className="flex flex-col">
                  <PlanPriceBlock price={c.min} range={c.planRange as any} showRange={showRange} />
                  {c.deductible != null && (
                    <div className="text-[11px] text-slate-400 mt-1">Deductible ${c.deductible.toFixed(0)}</div>
                  )}
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{c.count} plan{c.count>1?'s':''}</div>
                </div>
                <DetailsButton
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      try { localStorage.setItem('planDetailsReturnUrl', window.location.href); } catch {}
                    }
                    if (onOpenCarrierDetails) {
                      onOpenCarrierDetails(c);
                    } else {
                      const params = new URLSearchParams({ carrier: c.name, view: 'plan-details', category: 'drug-plan' });
                      router.push(`/shop-components?${params.toString()}`);
                    }
                  }}
                  carrierName={c.name}
                />
              </div>
              </>
              )}
            </CardShell>
          );
        };
        return <CardInner key={c.id} />;
      })}
    </div>
  );
};

export default DrugPlanCards;
