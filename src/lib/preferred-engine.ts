import { ProductCategory, getCarrierById, getPreferredCarriers, findPreferredCarrier, getCarrierDisplayName } from './carrier-system';

/** Raw carrier name extraction consistent with carrier-system logic */
export function extractRawCarrierName(quote: any): string {
  return (typeof quote?.carrier === 'string' ? quote.carrier : quote?.carrier?.name)
    || quote?.company_base?.name
    || quote?.company?.name
    || quote?.carrier_name
    || quote?.companyName
    || quote?.company
    || '';
}

export interface ClassifiedCarrierResult {
  rawName: string;
  carrierId?: string;            // recognized carrier id (even if not preferred for this category)
  preferredCarrierId?: string;   // preferred id if matched for category
  isPreferred: boolean;
  priority?: number;             // preferred priority if any
  displayName: string;           // stable display name for aggregation
  logoUrl?: string;
  reason?: string;               // debug reason when not preferred
}

/**
 * Classify a single quote for preferred status & canonicalization without mutating it.
 */
export function classifyQuoteCarrier(quote: any, category: ProductCategory): ClassifiedCarrierResult {
  const rawName = extractRawCarrierName(quote);
  const preferred = findPreferredCarrier(quote, category);
  let carrierId: string | undefined; // recognized id if in global carriers list
  // If we got a preferred match we know the carrier id already.
  if (preferred) {
    carrierId = preferred.carrierId;
  } else {
    // Try to map to a known carrier so display is consistent even if not preferred for this category.
    const displayCandidate = getCarrierDisplayName(rawName, category); // may internally leverage pattern matching
    // Derive id from that display name indirectly by scanning preferred carriers across all categories (cheap pass)
    const allCats: ProductCategory[] = ['medicare-supplement','medicare-advantage','dental','final-expense','hospital-indemnity','cancer','drug-plan'];
    for (const cat of allCats) {
      const list = getPreferredCarriers(cat);
      for (const pc of list) {
        const info = getCarrierById(pc.carrierId);
        if (info && (info.displayName === displayCandidate || info.shortName === displayCandidate)) {
          carrierId = info.id;
          break;
        }
      }
      if (carrierId) break;
    }
  }
  const carrierInfo = carrierId ? getCarrierById(carrierId) : undefined;
  const displayName = preferred
    ? (getCarrierById(preferred.carrierId)?.displayName || rawName)
    : (carrierInfo?.displayName || carrierInfo?.shortName || rawName);
  const logoUrl = preferred
    ? (getCarrierById(preferred.carrierId)?.logoUrl || '/images/carrier-placeholder.svg')
    : (carrierInfo?.logoUrl || '/images/carrier-placeholder.svg');
  let reason: string | undefined;
  if (!preferred) {
    const preferredConfig = getPreferredCarriers(category);
    if (!preferredConfig.length) reason = 'no-preferred-config';
    else reason = 'no-pattern-match';
  }
  return {
    rawName,
    carrierId,
    preferredCarrierId: preferred?.carrierId,
    isPreferred: !!preferred,
    priority: preferred?.priority,
    displayName,
    logoUrl,
    reason,
  };
}

/**
 * Tag a list of normalized quotes with __preferred metadata. Does not mutate original array.
 */
export function tagQuotesWithPreferred(quotes: any[], category: ProductCategory) {
  return quotes.map(q => {
    const c = classifyQuoteCarrier(q, category);
    return {
      ...q,
      __carrierId: c.carrierId,
      __preferredCarrierId: c.preferredCarrierId,
      __preferred: c.isPreferred,
      __preferredPriority: c.priority ?? 999,
      __carrierDisplayName: c.displayName,
      __preferredReason: c.reason,
    };
  });
}

export interface PreferredDiagnostics {
  category: ProductCategory;
  total: number;
  preferredCount: number;
  sampleUnmatched: Array<{ rawName: string; reason?: string }>; // first few unmatched examples
}

export function buildPreferredDiagnostics(taggedQuotes: any[], category: ProductCategory): PreferredDiagnostics {
  const preferred = taggedQuotes.filter(q => q.__preferred);
  const unmatched = taggedQuotes.filter(q => !q.__preferred).slice(0, 8).map(q => ({ rawName: extractRawCarrierName(q), reason: q.__preferredReason }));
  return {
    category,
    total: taggedQuotes.length,
    preferredCount: preferred.length,
    sampleUnmatched: unmatched,
  };
}
