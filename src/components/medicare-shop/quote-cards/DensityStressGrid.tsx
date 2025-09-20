"use client";
import React from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export interface CarrierSummaryDensity { id: string; name: string; logo: string; rating: string; min?: number; max?: number; plans?: Record<string, number | undefined>; }
interface Props { carriers: CarrierSummaryDensity[]; loading: boolean; }

export const DensityStressGrid: React.FC<Props> = ({ carriers, loading }) => {
  return (
    <section className="space-y-6">
  <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {carriers.length === 0 && loading && (
          Array.from({length:24}).map((_,i)=>(
            <Skeleton
              key={i}
              className="py-3 px-3 h-32 rounded-md flex flex-col justify-between"
            />
          ))
        )}
        {carriers.length > 0 && Array.from({ length: Math.min(24, carriers.length * 4) }).map((_, i) => {
          const c = carriers[i % carriers.length];
          if (!c) return null;
          return (
            <Card key={i} className="border py-3 px-3 hover:shadow-sm transition flex flex-col justify-between bg-white dark:bg-slate-800 dark:border-slate-600">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-md bg-white border flex items-center justify-center overflow-hidden">
                  <Image src={c.logo} alt={c.name} width={32} height={32} className="object-contain" />
                </div>
                <div className="flex-1">
                  <div className="text-[11px] font-semibold truncate text-slate-900 dark:text-slate-100">{c.name}</div>
                  <div className="text-[9px] text-muted-foreground dark:text-slate-400">Medigap</div>
                </div>
              </div>
              <div className="text-sm font-semibold leading-none text-slate-900 dark:text-slate-100">{c.min !== undefined ? `$${c.min.toFixed(0)}` : '—'}<span className="text-[10px] text-muted-foreground dark:text-slate-400">/mo</span></div>
              <div className="mt-2 flex gap-1 flex-wrap">
                {(['F','G','N'] as const).filter(p=>c.plans?.[p] !== undefined).map(p => (
                  <span key={p} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-600/60 font-medium text-slate-700 dark:text-slate-200">{p}</span>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
};
