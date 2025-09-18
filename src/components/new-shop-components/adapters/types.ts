// Unified Quote Adapter Types (Draft v1)
// --------------------------------------
// These types describe the normalization layer that sits between raw API
// category responses and the shared UI components (cards, list rows,
// plan-details, plan builder snapshot chips).

export interface NormalizeContext {
  applyDiscounts?: boolean; // mirrors UI toggle to pick with_hhd vs sans_hhd vs derived
}

export interface AggregateContext extends NormalizeContext {}

export interface NormalizedQuoteBase {
  id: string;                 // globally unique id (category + carrier + plan + maybe hash)
  category: string;           // e.g. 'medigap', 'drug-plan'
  carrier: {
    id: string;
    name: string;
    logoUrl?: string;
    amBestRating?: string;
  };
  pricing: {
    monthly: number;          // active monthly figure (display baseline)
    rawBase?: number;         // underlying raw number before normalization (debug)
    rateSource?: string;      // e.g. with_hhd | sans_hhd | calculated | unknown
    range?: { min: number; max: number; count: number };
  };
  plan: {
    key: string;              // plan letter or internal identifier
    display: string;          // label for UI toggles (e.g. 'Plan G')
    discountApplied?: boolean;
    discountType?: string;
  };
  adapter: {
    category: string;         // duplicate for quick filtering
    version: number;          // schema version for this adapter
  };
  metadata?: Record<string, any>; // category specific small scalar fields
  __raw?: any;                // optional raw (avoid persisting huge objects)
}

export interface FieldDescriptor {
  id: string;
  label: string;
  valuePath?: string; // dot path into normalized object
  render?: (q: NormalizedQuoteBase) => any;
  group?: string;
  importance?: 'primary' | 'secondary' | 'tertiary';
  visibleOnCard?: boolean;
  visibleOnDetails?: boolean;
  icon?: string;
}

export interface PricingSummary {
  carrierId: string;
  carrierName: string;
  logoUrl?: string;
  rating?: string;
  plans: Record<string, number | undefined>; // active price per plan key
  planRanges: Record<string, { min: number; max: number; count: number } | undefined>;
  __preferred?: boolean;
}

export interface CategoryAdapter<QRaw, QNorm extends NormalizedQuoteBase = NormalizedQuoteBase> {
  category: QNorm['category'];
  version: number;
  normalize(raw: QRaw, ctx: NormalizeContext): QNorm | null;
  aggregate?(raws: QRaw[], ctx: AggregateContext): { pricingRanges?: PricingSummary['planRanges'] } | void;
  buildFieldDescriptors?(options?: any): FieldDescriptor[];
  /**
   * Produce one PricingSummary per carrier from an array of already-normalized quotes.
   * Implementations should be pure and avoid mutating the provided quotes.
   * Returning an empty array indicates summaries are not supported (UI can fallback).
   */
  derivePricingSummary?(quotes: QNorm[]): PricingSummary[];
}

export type AdapterRegistry = Record<string, CategoryAdapter<any, any>>;
