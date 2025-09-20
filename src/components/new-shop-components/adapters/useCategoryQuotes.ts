import React from 'react';
import { getAdapter, isAdaptersEnabled } from './registry';
import { NormalizedQuoteBase, NormalizeContext, PricingSummary } from './types';

export interface UseCategoryQuotesResult<N extends NormalizedQuoteBase = NormalizedQuoteBase> {
  normalized: N[];
  summaries: PricingSummary[];
  errors: { count: number; samples: any[] };
  timing: { ms: number; count: number };
}

interface UseCategoryQuotesOptions extends NormalizeContext {
  enabled?: boolean;              // override global
  shadow?: boolean;               // indicates shadow evaluation (unused here directly)
  onAfterNormalize?: (quotes: NormalizedQuoteBase[]) => void;
}

export function useCategoryQuotes<Raw, N extends NormalizedQuoteBase = NormalizedQuoteBase>(
  category: string,
  rawQuotes: Raw[] | undefined | null,
  opts: UseCategoryQuotesOptions = {}
): UseCategoryQuotesResult<N> {
  const { applyDiscounts, enabled, onAfterNormalize } = opts;
  const active = (enabled ?? isAdaptersEnabled()) && !!category && Array.isArray(rawQuotes);
  const adapter = React.useMemo(() => active ? getAdapter(category) : undefined, [active, category]);

  const result = React.useMemo<UseCategoryQuotesResult<N>>(() => {
    if (!active || !adapter || !rawQuotes) return { normalized: [], summaries: [], errors: { count:0, samples: [] }, timing: { ms:0, count:0 } };
    const t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    const errors: any[] = [];
    const normalized: N[] = [];
    for (const r of rawQuotes) {
      try {
        const q = adapter.normalize(r as any, { applyDiscounts });
        if (q) normalized.push(q as N);
      } catch (e:any) {
        if (errors.length < 5) errors.push({ error: e?.message, raw: r });
      }
    }
    // Derive summaries (carrier grouping etc.)
    let summaries: PricingSummary[] = [];
    try {
      if (adapter.derivePricingSummary) {
        summaries = adapter.derivePricingSummary(normalized as any) || [];
      }
    } catch (e:any) {
      if (errors.length < 5) errors.push({ error: 'derivePricingSummary failed', detail: e?.message });
    }
    const t1 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    if (rawQuotes.length > 0 && normalized.length === 0) {
      console.warn(`[useCategoryQuotes] Category '${category}' produced 0 normalized quotes out of ${rawQuotes.length} raw. Check adapter mappings.`);
    } else if (normalized.length > 0 && summaries.length === 0) {
      console.warn(`[useCategoryQuotes] Category '${category}' produced normalized quotes (${normalized.length}) but no summaries.`);
    }
    return {
      normalized,
      summaries,
      errors: { count: errors.length, samples: errors },
      timing: { ms: +(t1 - t0).toFixed(2), count: normalized.length }
    };
  }, [active, adapter, rawQuotes, applyDiscounts, category]);

  // Side effect after normalization (shadow diff hook can plug in here)
  React.useEffect(() => {
    if (result.normalized.length && onAfterNormalize) {
      try { onAfterNormalize(result.normalized); } catch {/* noop */}
    }
    // Cross-adapter collision audit (development only)
    if (process.env.NODE_ENV !== 'production' && result.normalized.length) {
      try {
        const byCarrier: Record<string, Set<string>> = {};
        result.normalized.forEach(q => {
          const orig = (q.metadata as any)?.originalCarrierRaw || q.carrier.name;
          (byCarrier[q.carrier.id] ||= new Set()).add(orig);
        });
        Object.entries(byCarrier).forEach(([carrierId,set]) => {
          if (set.size > 1) {
            // eslint-disable-next-line no-console
            console.warn('CARRIER_COLLISION_DETECTED_BATCH', { category, carrierId, distinctRawNames: Array.from(set.values()), count: result.normalized.length });
          }
        });
      } catch {/* ignore audit errors */}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.normalized]);

  return result;
}

export default useCategoryQuotes;
