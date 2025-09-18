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
    const carrierName = chooseCarrierName(raw);
    const planId = raw.plan_id || 'unknown';
    const contract = raw.contract_id || 'X';
    const segment = raw.segment_id || '000';
    const planKey = `${contract}-${planId}-${segment}`;
    // The full_description HTML is not present on this trimmed RawDrugPlanQuote interface yet.
    // If upstream expands RawDrugPlanQuote to include benefits, we can parse tiers here; for now attempt ctx.extra?.benefitHtml.
    const benefitHtml = (ctx as any)?.extra?.benefitHtml as string | undefined;
    const drugTiers = extractDrugTiers(benefitHtml);
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
        drugTiers,
      },
    };
  },
  derivePricingSummary(quotes) {
    if (!quotes.length) return [];
    // Group by carrier; track all plan premiums + capture lowest-premium plan name/deductible/star rating for display.
    const map = new Map<string, { carrierName: string; prices: number[]; minPlanName?: string; minDeductible?: number; star?: number }>();
    quotes.forEach(q => {
      const id = q.carrier.id;
      let bucket = map.get(id);
      if (!bucket) { bucket = { carrierName: q.carrier.name, prices: [] }; map.set(id, bucket); }
      bucket.prices.push(q.pricing.monthly);
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
    return summaries;
  }
};

export default drugPlanAdapter;
