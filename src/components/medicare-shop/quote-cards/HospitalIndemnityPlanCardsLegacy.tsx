"use client";
import React from 'react';
import { useSavedPlans } from '@/contexts/SavedPlansContext';
import { useRouter } from 'next/navigation';
import { CarrierLogoBlock, SaveToggleButton, DetailsButton, PlanPriceBlock } from './SharedCardParts';
import { CardShell, useCardVisibility } from './CardShell';
import { Skeleton } from '@/components/ui/skeleton';
import type { HospitalIndemnityCarrierSummary } from './HospitalIndemnityPlanCards';

interface Props { carriers: HospitalIndemnityCarrierSummary[]; loading:boolean; onOpenCarrierDetails?: (c:HospitalIndemnityCarrierSummary)=>void; }

// Legacy (price-focused) hospital indemnity card grid
const HospitalIndemnityPlanCardsLegacy: React.FC<Props> = ({ carriers, loading, onOpenCarrierDetails }) => {
  const { isSaved, toggle } = useSavedPlans() as any; const router = useRouter();
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {carriers.length===0 && loading && Array.from({length:6}).map((_,i)=><Skeleton key={i} className="h-64 rounded-xl" />)}
      {carriers.map(c => {
        const saved = isSaved(c.id,'HOSP','hospital');
        const showRange = c.planRange && c.planRange.count>1 && c.planRange.min!==c.planRange.max;
        const CardInner: React.FC = () => { const { ref, visible } = useCardVisibility(); const showSkeleton = !visible && loading; return (
          <CardShell ref={ref as any} className="p-4 sm:p-5 flex flex-col">
            {showSkeleton && (
              <div className="absolute inset-0 flex flex-col p-4 gap-4" aria-hidden="true">
                <Skeleton className="h-10 w-10 rounded-md"/>
                <Skeleton className="h-4 w-44"/>
                <Skeleton className="h-3 w-64"/>
                <div className="mt-auto space-y-2">
                  <Skeleton className="h-8 w-40"/>
                  <Skeleton className="h-9 w-11 rounded-md"/>
                </div>
              </div>
            )}
            {visible && (<>
              <div className="relative z-10 flex items-start gap-3 mb-3">
                <SaveToggleButton saved={saved} onToggle={()=> toggle({ carrierId:c.id, carrierName:c.name, logo:c.logo, rating:'N/A', category:'hospital', planType:'HOSP', price:c.min, min:c.planRange?.min, max:c.planRange?.max })} />
                <CarrierLogoBlock name={c.name} logo={c.logo} />
                <div className="flex-1 min-w-0 pr-1">
                  <div className="font-semibold text-slate-900 dark:text-slate-100 leading-tight text-base flex items-center gap-2 flex-wrap">
                    <span>{c.name}</span>
                  </div>
                  {c.planName && <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[14rem]" title={c.planName}>{c.planName}</div>}
                </div>
              </div>
              <div className="relative z-10 grid grid-cols-[auto_56px] gap-4 items-end mt-auto">
                <div className="flex flex-col justify-end">
                  <div className="flex items-end gap-3">
                    <PlanPriceBlock price={c.min} range={c.planRange as any} showRange={showRange} emphasize={true} />
                    {showRange && c.planRange && <span className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">{c.planRange.count} configs</span>}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">{c.count} plan{c.count>1?'s':''} captured</div>
                </div>
                <DetailsButton onClick={()=>{ if(onOpenCarrierDetails) onOpenCarrierDetails(c); else { const params=new URLSearchParams({carrier:c.name, view:'plan-details', category:'hospital'}); router.push(`/shop-components?${params.toString()}`); } }} carrierName={c.name} />
              </div>
            </>)}
          </CardShell>
        ); };
        return <CardInner key={c.id} />;
      })}
    </div>
  );
};

export default HospitalIndemnityPlanCardsLegacy;