"use client";
import React from 'react';
import { useSavedPlans } from '@/contexts/SavedPlansContext';
import { useRouter } from 'next/navigation';
import { CarrierLogoBlock, SaveToggleButton, DetailsButton, PlanPriceBlock } from './SharedCardParts';
import { CardShell, useCardVisibility } from './CardShell';
import { Skeleton } from '@/components/ui/skeleton';

export interface FinalExpenseCarrierSummary { id:string; name:string; logo:string; min?:number; max?:number; fullMin?:number; fullMax?:number; requestedFace?:number; planRange?:{min:number;max:number;count:number}; planName?:string; faceAmount?:number; faceAmountMin?:number; faceAmountMax?:number; graded?:boolean; immediate?:boolean; accidental?:boolean; underwritingType?:string; count:number; }
interface Props { carriers: FinalExpenseCarrierSummary[]; loading:boolean; onOpenCarrierDetails?: (c:FinalExpenseCarrierSummary)=>void; }

const FinalExpensePlanCardsLegacy: React.FC<Props> = ({ carriers, loading, onOpenCarrierDetails }) => {
  // Defensive: legacy view might be rendered outside provider during experimentation
  let isSaved: (id:string, planType:string, category:string)=>boolean = () => false;
  let toggle: (args:any)=>void = () => {};
  try {
    const ctx = useSavedPlans() as any;
    if (ctx) { isSaved = ctx.isSaved || isSaved; toggle = ctx.toggle || toggle; }
  } catch {/* swallow missing provider */}
  const router = useRouter();
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {carriers.length===0 && loading && Array.from({length:6}).map((_,i)=><Skeleton key={i} className="h-64 rounded-xl" />)}
      {(() => {
        const usedKeys = new Set<string>();
        const makeKey = (id: string, name: string) => {
          const base = `${id}::${name}`;
          if (!usedKeys.has(base)) { usedKeys.add(base); return base; }
          let i = 1; let candidate = `${base}::${i}`;
          while (usedKeys.has(candidate)) { i++; candidate = `${base}::${i}`; }
          usedKeys.add(candidate); return candidate;
        };
        return carriers.map(raw => {
        let safeName: string;
        if (typeof raw.name === 'string') safeName = raw.name; else safeName = String((raw as any).name?.displayName || (raw as any).carrierName || raw.name || 'Unknown Carrier');
        if (/^\[object Object\]$/.test(safeName)) safeName = 'Unknown Carrier';
        if (safeName === '[' || safeName === ']') safeName = 'Unknown Carrier';
        safeName = safeName.trim();
        if (!safeName) safeName = 'Unknown Carrier';
        const c: FinalExpenseCarrierSummary = {
          ...raw,
          id: typeof raw.id === 'string' ? raw.id : String(raw.id ?? `fe-${Math.random().toString(36).slice(2)}`),
            name: safeName,
          logo: typeof raw.logo === 'string' && raw.logo ? raw.logo : '/images/carrier-placeholder.svg'
        };
        const saved = isSaved(c.id,'FE','final-expense');
        const showRange = c.planRange && c.planRange.count>1 && c.planRange.min!==c.planRange.max;
        let displayPlanName = c.planName || '';
        let derivedMin: number | undefined; let derivedMax: number | undefined;
        if (displayPlanName) {
          const upToMatch = /-\s*Up to \$(\d{1,3}(?:,\d{3})*)$/i.exec(displayPlanName);
          const rangeMatch = /-\s*\$(\d{1,3}(?:,\d{3})*)\s*-\s*\$(\d{1,3}(?:,\d{3})*)$/i.exec(displayPlanName);
          if (upToMatch) {
            derivedMax = parseInt(upToMatch[1].replace(/,/g,''),10);
            displayPlanName = displayPlanName.replace(upToMatch[0],'').trim();
          } else if (rangeMatch) {
            derivedMin = parseInt(rangeMatch[1].replace(/,/g,''),10);
            derivedMax = parseInt(rangeMatch[2].replace(/,/g,''),10);
            displayPlanName = displayPlanName.replace(rangeMatch[0],'').trim();
          }
        }
        const effectiveFaceMin = c.faceAmountMin ?? derivedMin ?? c.faceAmount;
        const effectiveFaceMax = c.faceAmountMax ?? derivedMax ?? c.faceAmount;
        const CardInner: React.FC = () => { const { ref, visible } = useCardVisibility(); const showSkeleton = !visible && loading; return (
          <CardShell ref={ref as any} className="p-4 sm:p-5">
            {showSkeleton && (<div className="absolute inset-0 flex flex-col p-4 gap-4" aria-hidden="true"><Skeleton className="h-10 w-10 rounded-md"/><Skeleton className="h-4 w-40"/><div className="mt-auto space-y-2"><Skeleton className="h-8 w-32"/><Skeleton className="h-9 w-11 rounded-md"/></div></div>)}
            {visible && (<>
              <div className="relative z-10 flex items-start gap-3 mb-3">
                <SaveToggleButton saved={saved} onToggle={()=> toggle({ carrierId:c.id, carrierName:c.name, logo:c.logo, rating:'N/A', category:'final-expense', planType:'FE', price:c.min, min:c.planRange?.min, max:c.planRange?.max })} />
                <CarrierLogoBlock name={c.name} logo={c.logo} />
                <div className="flex-1 min-w-0 pr-6">
                  <div className="font-semibold text-slate-900 dark:text-slate-100 leading-snug text-base flex gap-2 flex-wrap">
                    <span className="break-words whitespace-normal max-w-full" style={{wordBreak:'break-word'}}>{c.name}</span>
                  </div>
                  <div className="mt-1 flex flex-col gap-1 text-[11px] text-slate-500 dark:text-slate-400 tracking-wide font-medium">
                    {displayPlanName && <span className="truncate max-w-[14rem]" title={c.planName}>{displayPlanName}</span>}
                    {(effectiveFaceMin!=null||effectiveFaceMax!=null) && (
                      <span className="text-[10px] text-slate-400">Face ${effectiveFaceMin?.toLocaleString() || '—'}{effectiveFaceMax && effectiveFaceMax!==effectiveFaceMin ? ` – $${effectiveFaceMax.toLocaleString()}`:''}</span>
                    )}
                    {c.underwritingType && <span className="text-[10px] text-slate-400">{c.underwritingType}</span>}
                  </div>
                </div>
              </div>
              <div className="relative z-10 flex items-end justify-between mt-auto">
                <div className="flex flex-col">
                  <PlanPriceBlock price={c.min} range={c.planRange as any} showRange={showRange} />
                  {typeof c.fullMin==='number' && typeof c.fullMax==='number' && ( (c.fullMin!==c.min) || (c.fullMax!==c.max) ) && (
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      Other coverage: ${c.fullMin.toFixed(2)} - ${c.fullMax.toFixed(2)}
                    </div>
                  )}
                  {c.graded && <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Graded</div>}
                  {c.immediate && <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Immediate</div>}
                  {c.accidental && <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Accidental Rider</div>}
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{c.count} plan{c.count>1?'s':''}</div>
                </div>
                <DetailsButton onClick={()=>{ if(onOpenCarrierDetails) onOpenCarrierDetails(c); else { const params=new URLSearchParams({carrier:c.name, view:'plan-details', category:'final-expense'}); router.push(`/shop-components?${params.toString()}`); } }} carrierName={c.name} />
              </div>
            </>)}
          </CardShell>
        ); };
          const key = makeKey(c.id, c.name);
          return <CardInner key={key} />;
        });
      })()}
    </div>
  );
};

export default FinalExpensePlanCardsLegacy;
