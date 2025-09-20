"use client";
import React from 'react';
import { useSavedPlans } from '@/contexts/SavedPlansContext';
import { useRouter } from 'next/navigation';
import { CarrierLogoBlock, SaveToggleButton, DetailsButton, PlanPriceBlock } from './SharedCardParts';
import { CardShell, useCardVisibility } from './CardShell';
import { Skeleton } from '@/components/ui/skeleton';

export interface DentalCarrierSummary {
  id: string;
  name: string;
  logo: string;
  min?: number;
  max?: number;
  planRange?: { min:number; max:number; count:number };
  planName?: string;
  annualMax?: number;
  deductibleIndividual?: number;
  visionIncluded?: boolean;
  hearingIncluded?: boolean;
  count: number;
}

interface Props { carriers: DentalCarrierSummary[]; loading: boolean; onOpenCarrierDetails?: (c: DentalCarrierSummary) => void; }

const DentalPlanCards: React.FC<Props> = ({ carriers, loading, onOpenCarrierDetails }) => {
  const { isSaved, toggle } = useSavedPlans() as any;
  const router = useRouter();
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {carriers.length === 0 && loading && Array.from({length:6}).map((_,i)=>(<Skeleton key={i} className="h-64 rounded-xl"/>))}
      {carriers.map(c => {
        const saved = isSaved(c.id, 'DENTAL', 'dental');
        const showRange = c.planRange && c.planRange.count>1 && c.planRange.max !== c.planRange.min;
        const CardInner: React.FC = () => {
          const { ref, visible } = useCardVisibility(undefined, undefined, c.id);
          const showSkeleton = !visible && loading;
          return (
            <CardShell ref={ref as any} className="p-4 sm:p-5" key={c.id}>
              <div className={`absolute inset-0 flex flex-col p-4 gap-4 transition-opacity duration-300 ${showSkeleton ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} aria-hidden="true">
                <Skeleton className="h-10 w-10 rounded-md" />
                <Skeleton className="h-4 w-40" />
                <div className="mt-auto space-y-2">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-9 w-11 rounded-md" />
                </div>
              </div>
              <div className={`relative z-10 flex flex-col h-full transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="relative z-10 flex items-start gap-3 mb-3">
                    <SaveToggleButton
                      saved={saved}
                      onToggle={() => toggle({
                        carrierId: c.id,
                        carrierName: c.name,
                        logo: c.logo,
                        rating: 'N/A',
                        category: 'dental',
                        planType: 'DENTAL',
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
                        {c.planName && (
                          <span className="text-slate-500 dark:text-slate-400 truncate max-w-[12rem]" title={c.planName}>{c.planName}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="relative z-10 flex items-end justify-between mt-auto">
                    <div className="flex flex-col">
                      <PlanPriceBlock price={c.min} range={c.planRange as any} showRange={showRange} />
                      {c.annualMax != null && (
                        <div className="text-[11px] text-slate-400 mt-1">Annual Max ${c.annualMax}</div>
                      )}
                      {c.deductibleIndividual != null && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Deductible ${c.deductibleIndividual}</div>
                      )}
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        {c.visionIncluded && 'Vision · '}{c.hearingIncluded && 'Hearing · '}{c.count} plan{c.count>1?'s':''}
                      </div>
                    </div>
                    <DetailsButton
                      onClick={() => {
                        if (onOpenCarrierDetails) { onOpenCarrierDetails(c); return; }
                        // Inline activation pattern: set ?company= param for dental
                        try {
                          const url = new URL(window.location.href);
                          url.searchParams.set('company', c.name);
                          url.searchParams.delete('view');
                          url.searchParams.delete('carrier');
                          window.history.pushState({}, '', url.toString());
                          window.dispatchEvent(new CustomEvent('company:changed', { detail: { company: c.name, category: 'dental' } }));
                        } catch {
                          const sep = window.location.search ? '&' : '?';
                          window.history.pushState({}, '', window.location.pathname + window.location.search + sep + 'company=' + encodeURIComponent(c.name));
                          window.dispatchEvent(new CustomEvent('company:changed', { detail: { company: c.name, category: 'dental' } }));
                        }
                      }}
                      carrierName={c.name}
                    />
                  </div>
              </div>
            </CardShell>
          );
        };
        return <CardInner key={c.id} />;
      })}
    </div>
  );
};

export default DentalPlanCards;
