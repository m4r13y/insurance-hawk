// Drug Plan (PDP) Adapter (Draft v1)
// -----------------------------------
// Normalizes raw Part D (Prescription Drug Plan) quotes into the shared NormalizedQuote shape.
// Scope: Lightweight pass focusing on carrier + monthly premium + deductible + star rating.

import { CategoryAdapter, NormalizeContext, NormalizedQuoteBase, PricingSummary } from './types';

// Minimal raw interface (only fields we touch). Extend as needed.
export interface RawDrugPlanQuote {
  plan_id?: string;
  plan_name?: string;         // e.g. 'SilverScript SmartRx (PDP)'
  contract_id?: string;       // e.g. 'S5601'
  segment_id?: string;        // e.g. '000'
  name?: string;              // carrier brand fallback
  name_full?: string;         // carrier brand
  organization_name?: string; // carrier name alt
  month_rate?: number;        // sometimes cents
  part_d_rate?: number;       // alternate for monthly premium
  annual_drug_deductible?: number; // cents
  overall_star_rating?: number;    // 0-5
  effective_date?: string;
  state?: string;
  // Full benefits array (subset). We only care about outpatient prescription drugs for tiers.
  benefits?: Array<{
    benefit_type?: string;
    full_description?: string; // HTML-ish string with tier tables
    pd_view_display?: boolean;
    summary_description?: string | null;
  }>;
}

// Attempt to extract tier cost sharing from an HTML-ish benefit full_description that contains
// repeated segments like: <p><b>Tier 1 (Preferred Generic)</b></p><table> ... rows ... </table>
// Rows often look like:
// <tr><td>Preferred Retail:</td><td>$1</td><td>$3</td><td>$5</td></tr>
// We only capture a summarized single preferred/standard/mailOrder value per tier for now:
// preferred -> first non-empty cell from a row containing 'Preferred'
// standard  -> first non-empty cell from a row containing 'Standard'
// mailOrder -> first non-empty cell from a row containing 'Mail'
function extractDrugTiers(benefitHtml?: string) {
  if (!benefitHtml || typeof benefitHtml !== 'string') return undefined;
  const tierBlocks = Array.from(benefitHtml.matchAll(/<p><b>Tier\s+(\d+)\s*\(([^)]+)\)<\/b><\/p><table>[\s\S]*?<\/table>/gi));
  if (!tierBlocks.length) return undefined;
  const tiers: Array<{ tier: string; preferred?: string; standard?: string; mailOrder?: string; notes?: string }> = [];
  tierBlocks.forEach(tb => {
    const tierNum = tb[1];
    const tierLabel = tb[2];
    const blockHtml = tb[0];
    const rows = Array.from(blockHtml.matchAll(/<tr>([\s\S]*?)<\/tr>/gi));
    const summary: { tier: string; preferred?: string; standard?: string; mailOrder?: string; notes?: string } = { tier: `Tier ${tierNum} (${tierLabel})` };
    for (const r of rows) {
      const cells = Array.from(r[1].matchAll(/<td>([\s\S]*?)<\/td>/gi)).map(c => c[1].replace(/<[^>]+>/g,'').trim());
      if (!cells.length) continue;
      const label = cells[0].toLowerCase();
      const valueCells = cells.slice(1).filter(v => v && v !== '&nbsp;');
      const firstVal = valueCells[0];
      if (!firstVal) continue;
      if (label.includes('preferred') && !summary.preferred) summary.preferred = firstVal;
      else if (label.includes('standard') && !summary.standard) summary.standard = firstVal;
      else if (label.includes('mail') && !summary.mailOrder) summary.mailOrder = firstVal;
    }
    tiers.push(summary);
  });
  return tiers.length ? tiers : undefined;
}

// Rich extraction capturing each pharmacy row for 30/60/90 day supplies so we can build the carousel UI.
// Returns an array of objects: { tier: 'Tier 1', tierType: 'Preferred Generic', rows: [{ pharmacyType, thirty, sixty, ninety }] }
function extractFullTierRows(benefitHtml?: string) {
  if (!benefitHtml || typeof benefitHtml !== 'string') return undefined;
  // Basic memo cache to avoid re-parsing identical HTML across multiple quotes (shared carriers)
  const cache = (globalThis as any).__drugTierParseCache || ((globalThis as any).__drugTierParseCache = new Map<string, any>());
  if (cache.has(benefitHtml)) return cache.get(benefitHtml);
  const blocks = Array.from(benefitHtml.matchAll(/<p><b>Tier\s+(\d+)\s*\(([^)]+)\)<\/b><\/p><table>([\s\S]*?)<\/table>/gi));
  if (!blocks.length) return undefined;
  const result: Array<{ tier: string; tierType: string; rows: Array<{ pharmacyType: string; thirty: string; sixty: string; ninety: string }> }> = [];
  blocks.forEach(b => {
    const tierNum = b[1];
    const tierType = b[2];
    const tableHtml = b[3];
    const rows: Array<{ pharmacyType: string; thirty: string; sixty: string; ninety: string }> = [];
    const trMatches = Array.from(tableHtml.matchAll(/<tr>([\s\S]*?)<\/tr>/gi));
    trMatches.forEach(tr => {
      const tds = Array.from(tr[1].matchAll(/<td>([\s\S]*?)<\/td>/gi)).map(td => td[1].replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ').trim());
      if (tds.length >= 4 && /:/.test(tds[0])) {
        const label = tds[0].replace(/:/,'').trim();
        rows.push({
          pharmacyType: label,
          thirty: tds[1] || '—',
            sixty: tds[2] || '—',
            ninety: tds[3] || '—'
        });
      }
    });
    if (rows.length) {
      result.push({ tier: `Tier ${tierNum}`, tierType, rows });
    }
  });
  const finalVal = result.length ? result : undefined;
  cache.set(benefitHtml, finalVal);
  return finalVal;
}

function chooseCarrierName(raw: RawDrugPlanQuote): string {
  return raw.organization_name || raw.name_full || raw.name || 'Unknown Carrier';
}

function normalizeMonthly(raw: RawDrugPlanQuote): { monthly: number; rawBase?: number } | null {
  // Accept 0 as a valid premium (zero-premium PDP). Reject only negatives or NaN.
  let val: number | undefined;
  if (typeof raw.part_d_rate === 'number') val = raw.part_d_rate;
  else if (typeof raw.month_rate === 'number') val = raw.month_rate;
  if (typeof val !== 'number' || isNaN(val) || val < 0) return null;
  const monthly = val >= 1000 ? val / 100 : val; // cents heuristic
  return { monthly, rawBase: val };
}

function normalizeDeductible(raw: RawDrugPlanQuote): number | undefined {
  const v = raw.annual_drug_deductible;
  if (typeof v !== 'number' || v <= 0) return undefined;
  return v >= 1000 ? v / 100 : v;
}

export const drugPlanAdapter: CategoryAdapter<RawDrugPlanQuote, NormalizedQuoteBase> = {
  category: 'drug-plan',
  version: 1,
  normalize(raw: RawDrugPlanQuote, ctx: NormalizeContext) {
    const rate = normalizeMonthly(raw);
    if (!rate) return null;
    const originalCarrierRaw = chooseCarrierName(raw);
    const carrierName = originalCarrierRaw; // no canonicalization here
    const planId = raw.plan_id || 'unknown';
    const contract = raw.contract_id || 'X';
    const segment = raw.segment_id || '000';
    const planKey = `${contract}-${planId}-${segment}`;
  // Attempt to find the outpatient prescription drugs benefit entry for tier extraction.
  const benefitHtml = raw.benefits?.find(b => (b.benefit_type || '').toLowerCase().includes('outpatient prescription drugs'))?.full_description;
  const drugTiers = extractDrugTiers(benefitHtml);
  const tierCarousel = extractFullTierRows(benefitHtml);
    return {
      id: `drug-plan:${planKey}`,
      category: 'drug-plan',
      carrier: {
        id: carrierName, // using name as id for now
        name: carrierName,
      },
      pricing: {
        monthly: rate.monthly,
        rawBase: rate.rawBase,
      },
      plan: {
        key: planKey,
        display: raw.plan_name || planKey,
      },
      adapter: { category: 'drug-plan', version: 1 },
      metadata: {
        deductible: normalizeDeductible(raw),
        starRating: raw.overall_star_rating,
        effectiveDate: raw.effective_date,
        state: raw.state,
        originalCarrierRaw,
        drugTiers,
        // Rich rows for carousel UI (optional)
        // @ts-ignore
        tierCarousel,
      },
    };
  },
  derivePricingSummary(quotes) {
    if (!quotes.length) return [];
    // Group by carrier; track all plan premiums + capture lowest-premium plan name/deductible/star rating for display.
    const map = new Map<string, { carrierName: string; prices: number[]; minPlanName?: string; minDeductible?: number; star?: number }>();
    const collisionMap: Record<string, Set<string>> = {};
    quotes.forEach(q => {
      const id = q.carrier.id;
      let bucket = map.get(id);
      if (!bucket) { bucket = { carrierName: q.carrier.name, prices: [] }; map.set(id, bucket); }
      bucket.prices.push(q.pricing.monthly);
      const orig = (q.metadata as any)?.originalCarrierRaw || q.carrier.name;
      (collisionMap[id] ||= new Set()).add(orig);
      const ded = typeof q.metadata?.deductible === 'number' ? q.metadata?.deductible : undefined;
      const star = typeof q.metadata?.starRating === 'number' ? q.metadata?.starRating : undefined;
      const price = q.pricing.monthly;
      if (bucket.minPlanName == null || price < (bucket.prices.length === 1 ? price : Math.min(...bucket.prices))) {
        bucket.minPlanName = q.plan.display;
        bucket.minDeductible = ded;
        if (star != null) bucket.star = star;
      }
    });
    const summaries: PricingSummary[] = Array.from(map.entries()).map(([carrierId, agg]) => {
      const min = Math.min(...agg.prices);
      const max = Math.max(...agg.prices);
      return {
        carrierId,
        carrierName: agg.carrierName,
        plans: { PDP: min },
        planRanges: { PDP: { min, max, count: agg.prices.length } },
        // Extra fields (non-standard) can be read via casting in UI if needed
        // @ts-ignore
        _planName: agg.minPlanName,
        // @ts-ignore
        _deductible: agg.minDeductible,
        // @ts-ignore
        _star: agg.star,
      } as any;
    });
    summaries.sort((a,b) => (a.plans.PDP ?? Infinity) - (b.plans.PDP ?? Infinity));
    if (process.env.NODE_ENV !== 'production') {
      Object.entries(collisionMap).forEach(([carrierId, set]) => { if (set.size > 1) {
        // eslint-disable-next-line no-console
        console.warn('CARRIER_COLLISION_DETECTED', { adapter: 'drug-plan', carrierId, distinctRawNames: Array.from(set.values()) });
      }});
    }
    return summaries;
  }
};

export default drugPlanAdapter;
