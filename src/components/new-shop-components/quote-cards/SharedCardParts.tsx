"use client";
import React from 'react';
import Image from 'next/image';
import { BookmarkFilledIcon, BookmarkIcon, ArrowRightIcon } from '@radix-ui/react-icons';
import { AmBestStarRating } from '@/components/ui/star-rating';
import { cn } from '@/lib/utils';

export interface CarrierLogoBlockProps { name: string; logo: string; size?: number; className?: string; }
export const CarrierLogoBlock: React.FC<CarrierLogoBlockProps> = ({ name, logo, size = 48, className }) => {
  const [errored, setErrored] = React.useState(false);
  return (
    <div className={cn("relative flex items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 overflow-hidden text-slate-700 dark:text-slate-200 font-semibold", className)} style={{ width: size, height: size }}>
      <span className="absolute select-none" aria-hidden={errored}>{name.charAt(0)}</span>
      {!errored && (
        <Image
          src={logo}
          alt={name}
            width={size}
            height={size}
            className="object-contain relative z-10"
            onError={() => setErrored(true)}
            loading="lazy"
          />
      )}
    </div>
  );
};

export interface SaveToggleButtonProps { saved: boolean; onToggle: () => void; variant?: 'overlay'|'inline'; ariaLabelSave?: string; ariaLabelUnsave?: string; }
export const SaveToggleButton: React.FC<SaveToggleButtonProps> = ({ saved, onToggle, variant = 'overlay', ariaLabelSave = 'Save plan', ariaLabelUnsave = 'Unsave plan' }) => {
  const base = "w-8 h-8 inline-flex items-center justify-center rounded-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60";
  const style = variant === 'overlay'
    ? saved ? 'absolute top-0 right-0 -mt-1 -mr-1 text-amber-400 hover:text-amber-300 bg-slate-700/60' : 'absolute top-0 right-0 -mt-1 -mr-1 text-slate-400 hover:text-white hover:bg-slate-700/60'
    : saved ? 'text-amber-500 hover:text-amber-400 bg-slate-700/40' : 'text-slate-500 hover:text-slate-200';
  return (
    <button type="button" aria-label={saved ? ariaLabelUnsave : ariaLabelSave} onClick={onToggle} className={cn(base, style)} aria-pressed={saved}>
      {saved ? <BookmarkFilledIcon className="w-4.5 h-4.5" aria-hidden="true"/> : <BookmarkIcon className="w-4.5 h-4.5" aria-hidden="true"/>}
    </button>
  );
};

export interface PlanTypeToggleGroupProps { planBadges: Record<string,{label:string;color?:string}>; activePlan: string; availablePlans: string[]; onSelect:(p:string)=>void; size?:'sm'|'md'; hideIfSingle?: boolean; className?: string; }
export const PlanTypeToggleGroup: React.FC<PlanTypeToggleGroupProps> = ({ planBadges, activePlan, availablePlans, onSelect, size='md', hideIfSingle=true, className }) => {
  const filtered = availablePlans.filter(p => !!planBadges[p]);
  if (hideIfSingle && filtered.length <= 1) return null;
  const px = size === 'sm' ? 'px-3 py-1 text-[11px]' : 'px-3.5 py-1.5 text-[13px]';
  return (
    <div className={cn('inline-flex gap-2 rounded-full bg-white/80 dark:bg-slate-800/60 p-1 border border-slate-200 dark:border-slate-700 shadow-sm', className)}>
      {filtered.map(p => {
        const active = activePlan === p;
        return (
          <button
            key={p}
            type="button"
            onClick={() => onSelect(p)}
            className={cn(px, 'font-medium rounded-full transition tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 focus-visible:ring-offset-1 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-800',
              active ? 'btn-brand shadow-inner' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700/60 dark:text-slate-200 dark:hover:bg-slate-600/60'
            )}
            aria-pressed={active}
          >
            {planBadges[p].label}
          </button>
        );
      })}
    </div>
  );
};

export interface PlanPriceBlockProps { price?: number; range?: {min:number; max:number; count:number}; showRange?: boolean; emphasize?: boolean; className?: string; }
export const PlanPriceBlock: React.FC<PlanPriceBlockProps> = ({ price, range, showRange, emphasize=true, className }) => {
  const showR = showRange && range && range.count > 1 && range.max !== range.min;
  return (
    <div className={cn('flex items-end gap-2', className)}>
      <div className={cn(emphasize ? 'text-4xl font-bold leading-none' : 'text-2xl font-semibold', 'text-white')}>{price !== undefined ? `$${price.toFixed(0)}` : '—'}</div>
      {showR && range && (
        <div className="text-sm text-slate-400 mb-1">to ${range.max.toFixed(0)}</div>
      )}
    </div>
  );
};

export interface DetailsButtonProps { onClick?: () => void; carrierName: string; }
export const DetailsButton: React.FC<DetailsButtonProps> = ({ onClick, carrierName }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-11 h-11 inline-flex items-center justify-center rounded-md border border-slate-600 bg-slate-800/70 text-slate-200 hover:bg-slate-700 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 transition shadow-sm"
    aria-label={`View plans for ${carrierName}`}
  >
    <ArrowRightIcon className="w-5 h-5" />
  </button>
);
