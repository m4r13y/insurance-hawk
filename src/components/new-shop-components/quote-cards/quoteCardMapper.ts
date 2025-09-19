// Unified Quote Card Mapping Utilities (Phase 1)
// ---------------------------------------------
// Goal: Provide a single transformation layer between adapter-level normalized
// quotes (and their PricingSummary aggregates) and the UI card components.
// This first phase implements Medicare Advantage carrier card mapping and
// documents the emerging unified shape we can extend to other categories.
//
// Design Notes:
// 1. We work from adapter "summaries" (carrier-level aggregates) plus the full
//    normalized quote list to derive representative metadata (deductibles, MOOP, etc.).
// 2. Preferred carrier ordering + enhanced naming/logos are handled through
//    the existing carrier-system helpers (injected so this module stays UI/framework agnostic).
// 3. We intentionally keep the returned shape compatible with the current
//    AdvantagePlanCards component to minimize immediate refactor scope. Later
//    we can introduce a generic <UnifiedPlanCards /> that consumes QuoteCardData.
// 4. The public API returns plain objects with only serializable fields; no
//    functions or class instances so that future persistence / caching is easy.
//
// Future Extension (Planned):
// - Add map functions for: drug-plan, dental, cancer, hospital, final-expense, medigap.
// - Introduce a generic QuoteCardData interface capturing common fields:
//     { id, category, carrier: { id, name, logo }, pricing: { min, max, range },
//       plan?: { key, name }, rating?, highlights?: Array<{ key,label,value }>, count }
// - Add badge derivation (plan letters, preferred flags) centrally.

import { NormalizedQuoteBase, PricingSummary } from '../adapters/types';

// Lightweight type describing the subset AdvantagePlanCards currently expects.
export interface AdvantageCarrierCardShape {
  id: string;
  name: string;
  logo: string;
  rating?: number | string;
  min?: number;
  max?: number;
  planRange?: { min: number; max: number; count: number };
  planName?: string;
  medicalDeductible?: string;
  drugDeductible?: string;
  moop?: string;
  count: number;
  __preferred?: boolean;
  __preferredPriority?: number;
}

export interface BuildAdvantageOptions {
  summaries: PricingSummary[];
  normalized: NormalizedQuoteBase[];
  productCategory: string; // e.g. 'medicare-advantage'
  getEnhancedCarrierInfo: (quote: any, category: string) => { displayName?: string; logoUrl?: string; isPreferred?: boolean; priority?: number };
}

/**
 * Build Medicare Advantage carrier-level card data from adapter summaries + normalized quotes.
 */
export function buildAdvantageCarrierCards(opts: BuildAdvantageOptions): AdvantageCarrierCardShape[] {
  const { summaries, normalized, productCategory, getEnhancedCarrierInfo } = opts;
  if (!Array.isArray(summaries) || !summaries.length) return [];

  const byCarrierId = new Map<string, NormalizedQuoteBase[]>();
  normalized.forEach(q => {
    if (!q?.carrier?.id) return;
    let arr = byCarrierId.get(q.carrier.id);
    if (!arr) { arr = []; byCarrierId.set(q.carrier.id, arr); }
    arr.push(q);
  });

  const cards: AdvantageCarrierCardShape[] = summaries.map(s => {
    const range = s.planRanges?.MA;
    const related = byCarrierId.get(s.carrierId) || [];
    let medDed: string | undefined;
    let drugDed: string | undefined;
    let star: number | undefined;
    let moop: string | undefined;
    let planName: string | undefined;
    related.forEach(r => {
      if (!medDed && r.metadata?.medicalDeductible) medDed = r.metadata.medicalDeductible;
      if (!drugDed && r.metadata?.drugDeductible) drugDed = r.metadata.drugDeductible;
      if (!moop && r.metadata?.moop) moop = r.metadata.moop;
      if (!planName) planName = r.plan.display;
      if (typeof r.metadata?.starRating === 'number' && star == null) star = r.metadata.starRating;
    });
    const representativeQuote = related[0];
    const enhancedInfo = representativeQuote
      ? getEnhancedCarrierInfo(representativeQuote, productCategory)
      : { displayName: s.carrierName, logoUrl: (s as any).logoUrl || '/images/carrier-placeholder.svg', isPreferred: false, priority: undefined };

    return {
      id: s.carrierId,
      name: enhancedInfo.displayName || s.carrierName,
      logo: (enhancedInfo.logoUrl || (s as any).logoUrl || '/images/carrier-placeholder.svg'),
      rating: star,
      min: range?.min,
      max: range?.max,
      planRange: range,
      planName,
      medicalDeductible: medDed,
      drugDeductible: drugDed,
      moop,
      count: related.length || (range?.count ?? 1),
      __preferred: !!enhancedInfo.isPreferred,
      __preferredPriority: (enhancedInfo as any).priority ?? 999,
    } as AdvantageCarrierCardShape;
  });

  // Sorting: preferred first (by priority), then lowest min premium, then name.
  cards.sort((a, b) => {
    if (a.__preferred && !b.__preferred) return -1;
    if (!a.__preferred && b.__preferred) return 1;
    if (a.__preferred && b.__preferred && a.__preferredPriority !== b.__preferredPriority) {
      return (a.__preferredPriority || 999) - (b.__preferredPriority || 999);
    }
    const aMin = typeof a.min === 'number' ? a.min : Number.POSITIVE_INFINITY;
    const bMin = typeof b.min === 'number' ? b.min : Number.POSITIVE_INFINITY;
    if (aMin === bMin) return (a.name || '').localeCompare(b.name || '');
    return aMin - bMin;
  });

  return cards;
}

// Placeholder exports for future category mappings (avoid unused var lint noise when imported later)
export const quoteCardMapperVersion = 1;
