// Centralized plan badge definitions for Medigap plan letters
// Shared across sandbox variants & (future) production components.
export const planBadges: Record<string, { label: string; color: string }> = {
  F: { label: 'Plan F', color: 'badge-plan-brand' },
  G: { label: 'Plan G', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200' },
  N: { label: 'Plan N', color: 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-200' },
};

export type PlanBadges = typeof planBadges;
