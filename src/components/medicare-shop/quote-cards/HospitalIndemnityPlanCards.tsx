"use client";
import React from 'react';
import { useSavedPlans } from '@/contexts/SavedPlansContext';
import { useRouter } from 'next/navigation';
import { CarrierLogoBlock, SaveToggleButton, DetailsButton } from './SharedCardParts';
import { CardShell, useCardVisibility } from './CardShell';
import { Skeleton } from '@/components/ui/skeleton';
import { abbreviateHospitalRider } from '@/utils/abbreviateHospitalRider';

export interface HospitalIndemnityCarrierSummary { id:string; name:string; logo:string; min?:number; max?:number; planRange?:{min:number;max:number;count:number}; planName?:string; dailyBenefit?:number; daysCovered?:number; ambulance?:number; icuUpgrade?:boolean; count:number; availableRiders?: string[]; }
interface Props { carriers: HospitalIndemnityCarrierSummary[]; loading:boolean; onOpenCarrierDetails?: (c:HospitalIndemnityCarrierSummary)=>void; }

const HospitalIndemnityPlanCards: React.FC<Props> = ({ carriers, loading, onOpenCarrierDetails }) => {
  const { isSaved, toggle } = useSavedPlans() as any; const router = useRouter();
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {carriers.length===0 && loading && Array.from({length:6}).map((_,i)=><Skeleton key={i} className="h-64 rounded-xl" />)}
      {carriers.map(c => {
        const saved = isSaved(c.id,'HOSP','hospital');
  const showRange = false; // price/premium hidden per new requirement
        // Derive a concise configuration summary emphasizing riders/base rather than price alone
  const riderBadgesRaw = (c.availableRiders || [])
    .map(r => abbreviateHospitalRider(r.trim()))
    .filter(Boolean);
  const riderBadges = Array.from(new Set(riderBadgesRaw));
  const riderDisplay = riderBadges.slice(0,6); // limit on-card for brevity
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
                  {riderBadges.length>0 && <div className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 font-medium">{riderBadges.length} rider{riderBadges.length!==1?'s':''} available</div>}
                </div>
              </div>
              <div className="relative z-10 flex flex-col gap-3 mt-auto">
                <div className="flex flex-wrap gap-1.5">
                  {riderDisplay.map(r => (
                    <span key={r} className="px-2 py-0.5 bg-indigo-50 dark:bg-slate-700/50 text-[10px] rounded-full text-indigo-700 dark:text-indigo-300">{r}</span>
                  ))}
                  {riderBadges.length > riderDisplay.length && (
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700/50 text-[10px] rounded-full text-slate-600 dark:text-slate-300">+{riderBadges.length - riderDisplay.length} more</span>
                  )}
                  {riderBadges.length===0 && <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700/50 text-[10px] rounded-full text-slate-500 dark:text-slate-300">No riders</span>}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">{c.count} plan{c.count>1?'s':''}</div>
                  <DetailsButton
                    onClick={()=>{
                      if(onOpenCarrierDetails) { onOpenCarrierDetails(c); return; }
                      // Inline activation: set ?company= param (builder listens for this)
                      try {
                        const url = new URL(window.location.href);
                        url.searchParams.set('company', c.name);
                        // Keep other params; remove legacy ones no longer used
                        url.searchParams.delete('view');
                        url.searchParams.delete('carrier');
                        window.history.pushState({}, '', url.toString());
                        // Dispatch a custom event in case builder relies on it later
                        window.dispatchEvent(new CustomEvent('company:changed', { detail: { company: c.name, category: 'hospital' } }));
                      } catch {
                        // Fallback minimal navigation
                        const sep = window.location.search ? '&' : '?';
                        window.history.pushState({}, '', window.location.pathname + window.location.search + sep + 'company=' + encodeURIComponent(c.name));
                        window.dispatchEvent(new CustomEvent('company:changed', { detail: { company: c.name, category: 'hospital' } }));
                      }
                    }}
                    carrierName={c.name}
                  />
                </div>
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
