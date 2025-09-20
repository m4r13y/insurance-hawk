"use client";
import React from 'react';
import Image from 'next/image';
import { BookmarkFilledIcon, BookmarkIcon, ArrowRightIcon } from '@radix-ui/react-icons';
import { AmBestStarRating } from '@/components/ui/star-rating';
import { cn } from '@/lib/utils';

export interface CarrierLogoBlockProps { name: string; logo: string; size?: number; className?: string; }
export const CarrierLogoBlock: React.FC<CarrierLogoBlockProps> = ({ name, logo, size = 48, className }) => {
  const [errored, setErrored] = React.useState(false);
  // Defensive: coerce any non-string name to string early (some upstream enrichers may pass objects)
  const safeName = typeof name === 'string' ? name : (name == null ? '' : String((name as any).displayName || (name as any).name || name));
  const initial = safeName.trim().charAt(0) || '?';
  // CLS: reserve exact box with aspect-square & shrink prevention so surrounding text doesn't shift
  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 overflow-hidden text-slate-700 dark:text-slate-200 font-semibold aspect-square flex-shrink-0',
        className
      )}
      style={{ width: size, height: size }}
    >
      <span className="absolute select-none" aria-hidden={errored}>{initial}</span>
      {!errored && (
        <Image
          src={logo}
          alt={safeName || 'Carrier Logo'}
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
    ? saved
      ? 'absolute top-0 right-0 -mt-1 -mr-1 text-amber-500 hover:text-amber-400 bg-white/70 dark:bg-slate-700/60 shadow'
      : 'absolute top-0 right-0 -mt-1 -mr-1 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-white bg-white/60 dark:bg-slate-700/60 shadow'
    : saved
      ? 'text-amber-600 hover:text-amber-500 bg-white/70 dark:bg-slate-700/40'
      : 'text-slate-600 hover:text-blue-600 dark:text-slate-500 dark:hover:text-slate-200';
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

export interface PlanPriceBlockProps { price?: number; range?: {min:number; max:number; count:number}; showRange?: boolean; emphasize?: boolean; className?: string; disableAnimation?: boolean; }
export const PlanPriceBlock: React.FC<PlanPriceBlockProps> = ({ price, range, showRange, emphasize=true, className, disableAnimation=false }) => {
  const showR = showRange && range && range.count > 1 && range.max !== range.min;
  const prevRef = React.useRef<number | undefined>(price);
  const [animating, setAnimating] = React.useState(false);
  const [displayPrev, setDisplayPrev] = React.useState<number | undefined>(undefined);

  React.useEffect(() => {
    if (disableAnimation) {
      prevRef.current = price;
      setAnimating(false);
      setDisplayPrev(undefined);
      return;
    }
    if (price !== prevRef.current) {
      setDisplayPrev(prevRef.current);
      setAnimating(true);
      const t = setTimeout(() => {
        setAnimating(false);
        setDisplayPrev(undefined);
      }, 240);
      prevRef.current = price;
      return () => clearTimeout(t);
    }
  }, [price, disableAnimation]);

  const PriceSpan = ({ value, fadingOut=false }: { value: number | undefined; fadingOut?: boolean }) => (
    <span
      className={cn(
        'inline-flex items-end',
        emphasize ? 'text-4xl font-bold leading-none' : 'text-2xl font-semibold',
        'text-slate-900 dark:text-white',
        disableAnimation ? '' : 'transition-all duration-200 ease-out',
        fadingOut ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
      )}
      aria-hidden={fadingOut}
    >
      {value !== undefined ? `$${value.toFixed(0)}` : '—'}
    </span>
  );

  return (
    <div className={cn('flex flex-col', className)} aria-live="polite" aria-atomic="true">
      <div className="flex items-end gap-2">
        <div className={cn('relative flex items-end', emphasize ? 'min-w-[3.4ch]' : 'min-w-[2.8ch]')}>
          {displayPrev !== undefined && animating && !disableAnimation && <PriceSpan value={displayPrev} fadingOut />}
          <PriceSpan value={price} />
        </div>
        {/* Inline range only if plenty of horizontal space and short value */}
        {showR && range && (
          <div className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 mb-1 whitespace-nowrap">to ${range.max.toFixed(0)}</div>
        )}
      </div>
      {showR && range && (
        <div className="sm:hidden text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">to ${range.max.toFixed(0)}</div>
      )}
    </div>
  );
};

export interface DetailsButtonProps { onClick?: () => void; carrierName: string; }
export const DetailsButton: React.FC<DetailsButtonProps> = ({ onClick, carrierName }) => (
  <button
    type="button"
    onClick={onClick}
  className="w-11 h-11 inline-flex items-center justify-center rounded-md border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 transition shadow-sm"
    aria-label={`View plans for ${carrierName}`}
  >
    <ArrowRightIcon className="w-5 h-5" />
  </button>
);
