"use client";
import React from 'react';
import { useSavedPlans } from '@/contexts/SavedPlansContext';
import { useRouter } from 'next/navigation';
import { CarrierLogoBlock, SaveToggleButton, DetailsButton, PlanPriceBlock } from './SharedCardParts';
import { CardShell, useCardVisibility } from './CardShell';
import { Skeleton } from '@/components/ui/skeleton';

export interface HospitalIndemnityCarrierSummary { id:string; name:string; logo:string; min?:number; max?:number; planRange?:{min:number;max:number;count:number}; planName?:string; dailyBenefit?:number; daysCovered?:number; ambulance?:number; icuUpgrade?:boolean; count:number; }
interface Props { carriers: HospitalIndemnityCarrierSummary[]; loading:boolean; onOpenCarrierDetails?: (c:HospitalIndemnityCarrierSummary)=>void; }

const HospitalIndemnityPlanCards: React.FC<Props> = ({ carriers, loading, onOpenCarrierDetails }) => {
  const { isSaved, toggle } = useSavedPlans() as any; const router = useRouter();
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {carriers.length===0 && loading && Array.from({length:6}).map((_,i)=><Skeleton key={i} className="h-64 rounded-xl" />)}
      {carriers.map(c => {
        const saved = isSaved(c.id,'HOSP','hospital');
        const showRange = c.planRange && c.planRange.count>1 && c.planRange.min!==c.planRange.max;
        const CardInner: React.FC = () => { const { ref, visible } = useCardVisibility(); const showSkeleton = !visible && loading; return (
          <CardShell ref={ref as any} className="p-4 sm:p-5">
            {showSkeleton && (<div className="absolute inset-0 flex flex-col p-4 gap-4" aria-hidden="true"><Skeleton className="h-10 w-10 rounded-md"/><Skeleton className="h-4 w-40"/><div className="mt-auto space-y-2"><Skeleton className="h-8 w-32"/><Skeleton className="h-9 w-11 rounded-md"/></div></div>)}
            {visible && (<>
              <div className="relative z-10 flex items-start gap-3 mb-3">
                <SaveToggleButton saved={saved} onToggle={()=> toggle({ carrierId:c.id, carrierName:c.name, logo:c.logo, rating:'N/A', category:'hospital', planType:'HOSP', price:c.min, min:c.planRange?.min, max:c.planRange?.max })} />
                <CarrierLogoBlock name={c.name} logo={c.logo} />
                <div className="flex-1 min-w-0 pr-1">
                  <div className="font-semibold text-slate-900 dark:text-slate-100 leading-tight text-base flex items-center gap-2 flex-wrap"><span>{c.name}</span></div>
                  <div className="mt-1 flex items-center gap-3 flex-wrap text-[11px] text-slate-500 dark:text-slate-400 tracking-wide font-medium">{c.planName && <span className="truncate max-w-[12rem]" title={c.planName}>{c.planName}</span>}</div>
                </div>
              </div>
              <div className="relative z-10 flex items-end justify-between mt-auto">
                <div className="flex flex-col">
                  <PlanPriceBlock price={c.min} range={c.planRange as any} showRange={showRange} />
                  {c.dailyBenefit != null && <div className="text-[11px] text-slate-400 mt-1">Daily ${c.dailyBenefit}{c.daysCovered?` x ${c.daysCovered}d`:''}</div>}
                  {c.ambulance != null && <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Ambulance ${c.ambulance}</div>}
                  {c.icuUpgrade && <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">ICU Upgrade</div>}
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{c.count} plan{c.count>1?'s':''}</div>
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

export default HospitalIndemnityPlanCards;
