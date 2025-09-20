"use client";
import React from 'react';
import { cn } from '@/lib/utils';

/**
 * CardShell
 * Reusable structural wrapper for quote cards (Medigap, PDP, etc.)
 * Handles: gradient background, border, hover shadow, subtle bottom accent line, and fade-in via data-visible.
 */
export interface CardShellProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean; // reserved for future intersection-based styling
  as?: keyof JSX.IntrinsicElements;
  highlight?: boolean; // saved/active visual cue
  minHeight?: number | string; // optional height reservation (overrides default). Pass 0/undefined to disable.
}

export const CardShell = React.forwardRef<HTMLElement, CardShellProps>(
  ({ children, className, as = 'div', highlight=false, minHeight }, ref) => {
    const Comp: any = as;
    // Default reservation was too tall for compact variants; use opt-in or a gentle clamp fallback
    const reservation = typeof minHeight !== 'undefined'
      ? (minHeight === 0 ? undefined : minHeight)
      : undefined; // no forced min-height by default now
    return (
      <Comp
        ref={ref}
        className={cn(
          'relative rounded-xl p-4 sm:p-5 border shadow-md transition-shadow overflow-hidden group',
          // Light + dark adaptive gradient (previously dark bias only)
          'bg-gradient-to-br from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900',
          highlight ? 'border-blue-300 dark:border-slate-500 shadow-lg' : 'border-slate-200 dark:border-slate-700 hover:shadow-lg',
          // CLS: remove translate-y entrance to avoid vertical layout shift; rely on opacity only
          'data-[visible=false]:opacity-0 data-[visible=true]:opacity-100 transition-opacity duration-400 ease-out',
          'flex flex-col',
          className
        )}
        data-visible={true}
        style={reservation ? { minHeight: reservation } : undefined}
      >
        <div className="absolute inset-0 pointer-events-none opacity-60 bg-[radial-gradient(circle_at_85%_18%,rgba(56,189,248,0.14),transparent_65%)] dark:opacity-60" />
        {children}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Comp>
    );
  }
);
CardShell.displayName = 'CardShell';

/** useCardVisibility
 * Hook returning a ref and visibility boolean using IntersectionObserver.
 * Fires once per element when entering viewport.
 */
const seenKeys = new Set<string>();
export function useCardVisibility(rootMargin: string = '80px 0px 160px 0px', threshold: number = 0.1, stableKey?: string) {
  const initialVisible = stableKey ? seenKeys.has(stableKey) : false;
  const [visible, setVisible] = React.useState(initialVisible);
  const ref = React.useRef<HTMLElement | null>(null);
  React.useEffect(() => {
    if (visible) return; // already visible, skip observer
    if (!ref.current) return;
    const el = ref.current;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (stableKey) seenKeys.add(stableKey);
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin, threshold });
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, threshold, stableKey, visible]);
  return { ref, visible } as const;
}
