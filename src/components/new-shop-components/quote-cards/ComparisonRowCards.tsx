"use client";
import React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface PlanBadges { [k:string]: { label: string; color: string } }
export interface CarrierSummary {
  id: string; name: string; logo: string; rating: string; min?: number; max?: number;
  plans?: Record<string, number | undefined>;
}
interface Props {
  carriers: CarrierSummary[];
  loading: boolean;
  planBadges: PlanBadges;
}

export const ComparisonRowCards: React.FC<Props> = ({ carriers, loading, planBadges }) => {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        {carriers.length === 0 && loading && (
          <div className="space-y-3">
            {Array.from({length:3}).map((_,i)=>(
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        )}
        {carriers.map(carrier => (
          <div
            key={carrier.id}
            className="group relative rounded-lg border bg-white/95 dark:bg-slate-800/70 p-4 flex flex-col sm:flex-row sm:items-center gap-4 dark:border-slate-700/70 backdrop-blur-sm shadow-sm hover:shadow-md transition
            hover:bg-white dark:hover:bg-slate-700/70 focus-within:ring-2 focus-within:ring-blue-400/50"
          >
            <div className="absolute inset-0 pointer-events-none rounded-lg opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_85%_30%,hsl(var(--blue-primary)/0.18),transparent_60%)] dark:bg-[radial-gradient(circle_at_85%_30%,hsl(var(--blue-primary)/0.15),transparent_65%)]" />
            <div className="absolute -inset-px rounded-lg border border-transparent group-hover:border-blue-300/40 dark:group-hover:border-blue-400/30 transition-colors" />
            <div className="absolute left-0 top-0 h-full w-1 rounded-l-lg bg-gradient-to-b from-blue-400 via-sky-400 to-blue-500 opacity-0 group-hover:opacity-80 dark:opacity-60 transition-opacity" />
            <div className="flex items-center gap-4 min-w-[220px]">
              <div className="w-12 h-12 rounded-md bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-600 flex items-center justify-center overflow-hidden shadow-sm">
                <Image src={carrier.logo} alt={carrier.name} width={48} height={48} className="object-contain transition-transform group-hover:scale-105" />
              </div>
              <div>
                <div className="font-semibold leading-tight text-slate-900 dark:text-slate-100 tracking-tight">{carrier.name}</div>
                <div className="text-[11px] text-muted-foreground dark:text-slate-400">AM Best {carrier.rating}</div>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {(['F','G','N'] as const).map(p => (
                <div
                  key={p}
                  className="relative rounded-md border p-3 bg-white/70 dark:bg-slate-700/40 flex items-center justify-between dark:border-slate-600/60 hover:border-blue-300/50 dark:hover:border-blue-400/40 transition-colors shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="text-[11px] text-muted-foreground dark:text-slate-400 flex items-center gap-1">
                      {planBadges[p as string]?.label || p}
                    </div>
                    <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                      {carrier.plans?.[p] !== undefined ? `$${carrier.plans[p]?.toFixed(0)}` : '—'}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-normal bg-slate-50/60 dark:bg-slate-800/50 border-slate-200 dark:border-slate-600/70">
                    Base
                  </Badge>
                  <div className="absolute inset-0 rounded-md ring-0 focus-within:ring-2 focus-within:ring-blue-400/60" />
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2 min-w-[150px]">
              <Button size="sm" className="h-8 text-xs w-full btn-brand shadow-sm hover:shadow focus-visible:ring-2 focus-visible:ring-blue-400/60">Select</Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs w-full border-slate-300 dark:border-slate-600/70 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 focus-visible:ring-2 focus-visible:ring-blue-400/60"
              >
                Compare
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
