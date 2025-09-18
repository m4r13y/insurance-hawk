"use client";
import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean; // disable if performance concerns
}

/**
 * Accessible, theme-aware skeleton placeholder.
 * - Gradient surface w/ optional shimmer (reduced motion respected)
 * - Border for contrast in both themes
 * - aria-hidden by default; caller should manage aria-busy at container level
 */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, shimmer = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn(
          "relative isolate overflow-hidden rounded-md bg-gradient-to-b from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700/80 border border-slate-200 dark:border-slate-700",
          shimmer && "ih-skeleton-shimmer",
          className
        )}
        {...props}
      />
    );
  }
);
Skeleton.displayName = "Skeleton";

// One-time client-side style injection for shimmer animation (kept local to avoid global CSS changes)
let ihSkeletonInjected = false;
function injectSkeletonStyles() {
  if (ihSkeletonInjected) return;
  if (typeof document === "undefined") return;
  const style = document.createElement("style");
  style.dataset.component = "skeleton";
  style.textContent = `@media (prefers-reduced-motion: no-preference){
    .ih-skeleton-shimmer::after{content:"";position:absolute;inset:0;transform:translateX(-100%);background:linear-gradient(90deg,transparent,rgba(255,255,255,0.45),transparent);animation:ih-skeleton-pan 1.4s linear infinite;}
    .dark .ih-skeleton-shimmer::after{background:linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent);} }
    @keyframes ih-skeleton-pan { to { transform:translateX(100%);} }
  `;
  document.head.appendChild(style);
  ihSkeletonInjected = true;
}

if (typeof window !== "undefined") {
  injectSkeletonStyles();
}

export default Skeleton;
