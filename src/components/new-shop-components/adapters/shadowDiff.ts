import { NormalizedQuoteBase } from './types';

export interface LegacyMedigapGroupPlan { monthly: number }
export interface LegacyMedigapGroup {
  carrier: string;
  plans: Record<string, LegacyMedigapGroupPlan>; // planLetter -> { monthly }
}

export interface ShadowDiffOptions {
  category: string;
  legacyGroups: LegacyMedigapGroup[];
  normalized: NormalizedQuoteBase[];
  verbose?: boolean;
}

interface DiffRecord {
  carrier: string;
  plan: string;
  legacy?: number;
  adapter?: number;
  status: 'match' | 'mismatch' | 'legacy-only' | 'adapter-only';
}

export function logShadowDiff(opts: ShadowDiffOptions) {
  const { category, legacyGroups, normalized, verbose } = opts;
  if (category !== 'medigap') return; // current implementation focuses on medigap pricing
  const table: DiffRecord[] = [];
  const legacyMap: Record<string, Record<string, number>> = {};
  legacyGroups.forEach(g => {
    const mapped: Record<string, number> = {};
    Object.entries(g.plans).forEach(([plan, obj]) => { mapped[plan] = obj.monthly; });
    legacyMap[g.carrier] = mapped;
  });

  const adapterMap: Record<string, Record<string, number>> = {};
  normalized.forEach(q => {
    const planKey = q.plan.key;
    const carrier = q.carrier.name;
    (adapterMap[carrier] ||= {})[planKey] = q.pricing.monthly;
  });

  const carriers = Array.from(new Set([...Object.keys(legacyMap), ...Object.keys(adapterMap)])).sort();
  carriers.forEach(carrier => {
    const lPlans = legacyMap[carrier] || {};
    const aPlans = adapterMap[carrier] || {};
    const planKeys = Array.from(new Set([...Object.keys(lPlans), ...Object.keys(aPlans)])).sort();
    planKeys.forEach(plan => {
      const legacyVal = lPlans[plan];
      const adapterVal = aPlans[plan];
      let status: DiffRecord['status'];
      if (legacyVal != null && adapterVal != null) {
        status = Math.abs(legacyVal - adapterVal) < 0.005 ? 'match' : 'mismatch';
      } else if (legacyVal != null) status = 'legacy-only';
      else status = 'adapter-only';
      if (status !== 'match' || verbose) {
        table.push({ carrier, plan, legacy: legacyVal, adapter: adapterVal, status });
      }
    });
  });

  if (!table.length) return; // perfect match
  // eslint-disable-next-line no-console
  console.groupCollapsed?.(`ADAPTER_DIFF medigap (${table.length} records)`);
  // eslint-disable-next-line no-console
  console.table?.(table);
  // eslint-disable-next-line no-console
  console.groupEnd?.();
}
