export interface SavedPlanRecord {
  key: string; // unique key carrierId|planType|category
  carrierId: string;
  carrierName: string;
  logo: string;
  rating?: string;
  category: string; // e.g., 'medigap'
  planType?: string; // F/G/N etc
  price?: number; // selected plan quote if available
  min?: number;
  max?: number;
  savedAt: number;
}

const LS_KEY = 'saved_plans_v1';

export function loadSavedPlans(): SavedPlanRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return [];
}

export function persistSavedPlans(plans: SavedPlanRecord[]) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(LS_KEY, JSON.stringify(plans)); } catch {}
}

export function toggleSavedPlan(record: Omit<SavedPlanRecord, 'savedAt'>): SavedPlanRecord[] {
  const existing = loadSavedPlans();
  const idx = existing.findIndex(p => p.key === record.key);
  if (idx >= 0) {
    const next = [...existing.slice(0, idx), ...existing.slice(idx+1)];
    persistSavedPlans(next);
    return next;
  } else {
    const next = [...existing, { ...record, savedAt: Date.now() }];
    persistSavedPlans(next);
    return next;
  }
}

export function isPlanSaved(key: string): boolean {
  return loadSavedPlans().some(p => p.key === key);
}
