"use client";
import React from 'react';
import { useSavedPlans } from '@/contexts/SavedPlansContext';
import { Cross2Icon } from '@radix-ui/react-icons';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

/** Unified saved plans chip strip across all categories (medigap + drug-plan etc.) */
export const SavedPlanChips: React.FC<{ onOpen:(category:string, carrierName:string)=>void; className?:string; }> = ({ onOpen, className }) => {
  const { savedPlans, removeByCarrier } = useSavedPlans();
  if (!savedPlans.length) return null;
  // Group by carrier+category to aggregate plan types & price min/max
  const grouped = savedPlans.reduce<Record<string,{carrierId:string; carrierName:string; logo:string; category:string; planTypes:Set<string>; min?:number; max?:number;}>>((acc,p)=>{
    const key = `${p.carrierId}|${p.category}`;
    const entry = acc[key] || (acc[key] = { carrierId:p.carrierId, carrierName:p.carrierName, logo:p.logo, category:p.category, planTypes:new Set(), min: p.min, max: p.max });
    if (p.planType) entry.planTypes.add(p.planType);
    if (p.price!=null) {
      entry.min = entry.min==null? p.price : Math.min(entry.min, p.price);
      entry.max = entry.max==null? p.price : Math.max(entry.max, p.price);
    }
    return acc;
  },{});
  const items = Object.values(grouped).sort((a,b)=> a.carrierName.localeCompare(b.carrierName));
  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      {items.map(item => (
        <SavedPlanChip
          key={item.carrierId+item.category}
          item={item}
          onOpen={onOpen}
          onRemove={removeByCarrier}
        />
      ))}
    </div>
  );
};

interface ChipItemData {
  carrierId:string; carrierName:string; logo:string; category:string; planTypes:Set<string>; min?:number; max?:number;
}

const SavedPlanChip: React.FC<{ item:ChipItemData; onOpen:(category:string, carrierName:string)=>void; onRemove:(carrierId:string, category:string)=>void; }> = ({ item, onOpen, onRemove }) => {
  const planTypes = Array.from(item.planTypes);
  const [errored, setErrored] = React.useState(false);
  return (
    <div className="group flex items-center gap-3 rounded-full border px-3 py-1.5 bg-white dark:bg-slate-800 shadow-sm hover:shadow transition dark:border-slate-600 relative pr-8">
      <button type="button" onClick={()=>onOpen(item.category, item.carrierName)} className="flex items-center gap-2 outline-none">
        <div className="w-7 h-7 rounded-full bg-white border flex items-center justify-center overflow-hidden text-[11px] font-semibold text-slate-600 dark:text-slate-300">
          <span className="absolute select-none" aria-hidden={errored}>{item.carrierName.charAt(0)}</span>
          {!errored && (
            <Image
              src={item.logo}
              alt={item.carrierName}
              width={28}
              height={28}
              className="object-contain relative z-10"
              onError={()=>setErrored(true)}
            />
          )}
        </div>
        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.carrierName}</span>
      </button>
      <Separator orientation="vertical" className="h-5" />
      <div className="flex gap-1">
        {(planTypes.length? planTypes : ['any']).map(p => (
          <span key={p} className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-600/60 text-[10px] font-medium text-slate-700 dark:text-slate-200">{p}</span>
        ))}
      </div>
      <Separator orientation="vertical" className="h-5" />
      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.min!==undefined?`$${item.min.toFixed(0)}`:'—'}{item.max!==undefined && item.max!==item.min? <span className="text-xs text-slate-500 dark:text-slate-400">–${item.max.toFixed(0)}</span>: null}</div>
      <button
        type="button"
        onClick={() => onRemove(item.carrierId, item.category)}
        aria-label={`Remove saved carrier ${item.carrierName}`}
        className="absolute top-1/2 -translate-y-1/2 right-1 w-6 h-6 inline-flex items-center justify-center rounded-full text-slate-400 hover:text-white bg-slate-500/0 hover:bg-slate-700/60 transition opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
      >
        <Cross2Icon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
