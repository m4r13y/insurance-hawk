"use client";
import React from 'react';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useSavedPlans } from '@/contexts/SavedPlansContext';

interface PlanBadges { [k:string]: { label: string; color: string } }
export interface CarrierSummaryMinimal { id: string; name: string; logo: string; rating: string; min?: number; max?: number; savedPlanTypes?: string[]; }
interface Props { carriers: CarrierSummaryMinimal[]; loading: boolean; onRemoveCarrier?: (carrierId: string) => void; }

export const MinimalRateChips: React.FC<Props> = ({ carriers, loading, onRemoveCarrier }) => {
  const { savedPlans, removeByCarrier } = useSavedPlans();
  const unsaveCarrier = (carrierId: string) => {
    removeByCarrier(carrierId, 'medigap');
    onRemoveCarrier?.(carrierId);
  };
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap gap-3">
        {carriers.length === 0 && loading && (
          <div className="flex flex-wrap gap-3">
            {Array.from({length:6}).map((_,i)=>(
              <Skeleton key={i} className="h-10 w-56 rounded-full" />
            ))}
          </div>
        )}
        {carriers.map(carrier => (
          <div key={carrier.id} className="group flex items-center gap-3 rounded-full border px-3 py-1.5 bg-white dark:bg-slate-800 shadow-sm hover:shadow transition dark:border-slate-600 relative pr-8">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white border flex items-center justify-center overflow-hidden">
                <Image src={carrier.logo} alt={carrier.name} width={28} height={28} className="object-contain" />
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{carrier.name}</span>
            </div>
            <Separator orientation="vertical" className="h-5" />
            <div className="flex gap-1">
              {(carrier.savedPlanTypes && carrier.savedPlanTypes.length ? carrier.savedPlanTypes : (['F','G','N'] as const)).map(p => (
                <span key={p} className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-600/60 text-[10px] font-medium text-slate-700 dark:text-slate-200">{p}</span>
              ))}
            </div>
            <Separator orientation="vertical" className="h-5" />
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{carrier.min !== undefined ? `$${carrier.min.toFixed(0)}` : '—'}<span className="text-xs text-muted-foreground dark:text-slate-400">{carrier.max !== undefined ? `–$${carrier.max.toFixed(0)}` : ''}</span></div>
            <button
              type="button"
              onClick={() => unsaveCarrier(carrier.id)}
              aria-label={`Remove saved carrier ${carrier.name}`}
              className="absolute top-1/2 -translate-y-1/2 right-1 w-6 h-6 inline-flex items-center justify-center rounded-full text-slate-400 hover:text-white bg-slate-500/0 hover:bg-slate-700/60 transition opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
            >
              <Cross2Icon className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
