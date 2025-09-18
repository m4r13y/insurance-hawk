# Quote Adapter Architecture (Draft)

Status: DRAFT (Medigap normalization in progress)
Owner: TBD
Last Updated: 2025-09-18

## Goals
Provide a unified, type-safe abstraction for rendering, persisting, and composing quotes across multiple Medicare-related product categories (Medigap, Part D drug plans, Medicare Advantage, Hospital Indemnity, Dental/Vision/Hearing, Cancer, Final Expense – deferred) while:

- Preserving category‑specific pricing/discount logic (no forced homogenization)
- Enabling shared UI primitives (CardShell, FieldBlocks, PricingBadge, PlanBuilder chips)
- Enabling future cross-product auto‑configuration (Advantage ↔ Hospital Indemnity mapping)
- Allowing incremental rollout without breaking existing local storage schemas
- Supporting streaming / partial hydration / optimistic local cache

## High-Level Shape
```
Raw API Response --> CategoryAdapter.normalize(raw) --> NormalizedQuote
                                                      \-> AdapterMeta (e.g. data freshness, source, discount flags)
NormalizedQuote --> UI Layer (cards, list rows, plan details, builder)
                 --> Persistence (local cache / Firestore) via stable schemaVersion
```

## Core Types (summary)
- DomainQuote<T>: Raw or lightly massaged API object (category specific)
- NormalizedQuoteBase: Minimal cross-category fields (id, category, carrier, pricing summary, flags)
- NormalizedQuote[Category Extension]: Adds category facets (e.g. medigap.planLetter, drugPlan.deductible)
- FieldDescriptor: Declarative metadata for plan-details rendering blocks.
- CategoryAdapter: Implements normalize(), buildFieldDescriptors(), derivePricingSummary(), optional helpers (mapBuilderConfig, computeDiscountVariants, crossProductMap())

## Medigap Normalized Contract (Initial)
See section below for full field list.

## Non-Goals (Phase 1)
- Full virtualized list implementation
- Complex rate simulation / premium mode conversions beyond existing utilities
- Mutation APIs (enrollment) – view-only for now

## Versioning & Compatibility
- Each adapter outputs `schemaVersion` (initial `1`).
- Future additive fields require minor version bump; breaking renames require major + migration helper.
- Persisted cache objects include `adapter: { category: 'medigap', version: 1 }`.

---
## Medigap NormalizedQuote (Draft v1)

```
interface NormalizedQuoteMedigap extends NormalizedQuoteBase {
  category: 'medigap';
  carrier: {
    id: string;            // stable slug (carrier.name)
    name: string;          // display name
    logoUrl?: string;      // derived or placeholder
    amBestRating?: string; // mode of provided
  };
  plan: {
    letter: 'F' | 'G' | 'N' | string; // fallback for edge plans
    viewTypeTags: string[];           // original view_type array
    discountApplied: boolean;        // whether active pricing reflects discount toggle
    discountType?: 'household' | 'spousal' | 'other'; // best-effort inference
  };
  pricing: {
    monthly: number;                 // normalized active rate (dollars)
    range?: { min: number; max: number; count: number }; // across all quotes for letter & carrier
    rawBase: number;                 // raw value from quote prior to cents normalization
    rateSource: 'with_hhd' | 'sans_hhd' | 'calculated' | 'unknown';
  };
  metadata: {
    planId?: string;                 // quote.plan || quote.plan_name
    state?: string;
    effectiveDate?: string;          // if present in quote
    issuanceType?: string;           // open enrollment / guaranteed issue markers
  };
  // Raw pointer for troubleshooting (omitted from serialized cache if size large)
  __raw?: any;
}
```

### Required Inputs Observed in Current UI
Cards need:
- carrier.name, logoUrl, amBestRating
- plan.letter (for pill & toggle groups)
- pricing.monthly (activePrice) + range (min/max) per plan letter
- discountApplied (for future indicator)

List / Comparison rows share same pricing + plan letter set.

Plan Details (existing Medigap page) additionally consumes (to be added later if needed in Phase 1 extraction): underwriting notes, household discount %, application fees, modal details – deferred until integration.

### Derivations
- `carrier.id` = slugify(carrier.name) or original name (current cards use raw name index).
- `pricing.monthly` normalization rule reused from sandbox: treat values >= 1000 as cents (divide by 100).
- `pricing.range` computed per (carrier, plan.letter) group pre-normalization then applied.
- `plan.discountApplied` determined by UI toggle selection + view_type tag chosen.

### Omitted (for now)
- Historical rate trends
- Multi-state variants
- Premium mode (monthly vs annual) – always monthly display baseline

---
## FieldDescriptor Draft
(Will expand after PDP spec so we can align cross-category semantics.)

```
interface FieldDescriptor {
  id: string;
  label: string;
  valuePath?: string;        // dot path in NormalizedQuote
  render?: (q: NormalizedQuote) => React.ReactNode; // overrides valuePath
  group?: string;            // logical section grouping
  importance?: 'primary' | 'secondary' | 'tertiary';
  visibleOnCard?: boolean;   // card-level summary
  visibleOnDetails?: boolean;// plan-details expanded view
  icon?: string;             // optional icon ref key
}
```

Medigap (initial minimal card usage): price handled separately; rating & plan letter via dedicated UI elements, so no immediate descriptors required for card. Future descriptors for details page: deductible N/A, standard benefits all 100%; customizing later.

---
## CategoryAdapter Draft Shape
```
interface CategoryAdapter<QRaw, QNorm extends NormalizedQuoteBase> {
  category: QNorm['category'];
  version: number; // schema version
  normalize(raw: QRaw, ctx: NormalizeContext): QNorm | null; // return null to drop
  aggregate?(quotes: QRaw[], ctx: AggregateContext): AggregatedArtifacts | void; // e.g., range stats
  buildFieldDescriptors?(options?: any): FieldDescriptor[];
  derivePricingSummary?(quotes: QNorm[]): PricingSummary[]; // per carrier grouping (one per carrier)
  // Optional cross-product mapping hooks (Advantage ↔ Hospital Indemnity) – reserved for later
}
```

`derivePricingSummary` will feed the carrier-level grouping currently implemented ad-hoc in `shop-components/page.tsx`.

---
## Next Steps
1. Implement TypeScript types + Medigap adapter skeleton under `src/components/new-shop-components/adapters/`.
2. Replace ad-hoc grouping logic in sandbox with adapter output (flagged, no visual change).
3. Draft PDP (drug plan) spec referencing screenshot (card vs details separation).
4. Extend adapter registry & incremental migration (feature flag `NEXT_PUBLIC_ENABLE_ADAPTERS`).
5. Add cross-product mapping placeholder methods (empty) for Advantage ↔ Hospital Indemnity spec.

## Open Questions
- Do we need to surface household discount percentage explicitly on card? (Not yet – will revisit.)
- Should we persist full raw quote payloads or a pruned subset? (Proposal: omit large nested arrays; keep minimal `_rawKeys` diagnostic array.)

---
## Appendix: Event Hooks Integration
Adapters will not emit events directly; higher-level orchestration will dispatch existing custom events (`planBuilder:updated`, `quoteViewMode:changed`).

---
## Part D (Prescription Drug Plan) Specification (Draft v1)

### Objectives
Create a NormalizedQuote extension for Part D drug plans (PDP) that:
- Supplies concise card data (carrier, plan name, monthly premium, annual drug deductible, star rating, gap coverage flag)
- Defers heavy tier/benefit table HTML to plan-details view only
- Supports tier navigation (1..N) with pre-parsed cost structures for 30/60/90 day fills by pharmacy type

### Raw Fields Observed
Key fields from sample (`docs/drug-plan-data.md`):
`plan_name`, `name_full` (carrier display), `organization_name` / `name`, `month_rate`, `part_d_rate`, `annual_drug_deductible`, `overall_star_rating`, `additional_drug_coverage_offered_in_the_gap`, `additional_coverage_offered_in_the_gap`, `benefits[0].full_description` (HTML with tier tables), `contract_id`, `segment_id`, `plan_id`, `state`, `effective_date`.

Rates appear in cents (`month_rate=730 => $7.30`). Deductible appears in cents (`annual_drug_deductible=44500 => $445.00`).

### Normalized Structure (Increment over Base)
```
interface NormalizedQuoteDrugPlan extends NormalizedQuoteBase {
  category: 'drug-plan';
  plan: NormalizedQuoteBase['plan'] & {
    key: string;            // PDP internal key (plan_id or contract+segment)
    display: string;        // e.g. 'SilverScript SmartRx (PDP)'
  };
  drug: {
    monthlyPremium: number; // dollars
    annualDeductible: number; // dollars
    gapCoverage: boolean;   // derived from additional_drug_coverage_offered_in_the_gap OR additional_coverage_offered_in_the_gap
    starRating?: number;    // overall_star_rating numeric
    tierCount: number;      // parsed from benefits HTML (tiers discovered)
    tiers?: DrugTier[];     // optional lazy-parsed detail (omitted in card fetch pass)
    contractId?: string;
    segmentId?: string;
    planId?: string;
    effectiveDate?: string;
  };
  metadata: NormalizedQuoteBase['metadata'] & {
    rawTierHtml?: string;   // only if we defer parsing until detail view
  };
}

interface DrugTier {
  index: number; // 1-based
  label: string; // 'Tier 1 (Preferred Generic)'
  rows: Array<{
    pharmacyType: string; // 'Preferred Retail'
    cost30?: string;      // '$1' or '25%' (keep as string for now to avoid schema sprawl)
    cost60?: string;      // may be 'Not Supported'
    cost90?: string;
  }>
}
```

### Card vs Plan-Details Field Mapping
| UI Surface | Fields |
|------------|--------|
| Card (left panel in screenshot) | carrier.name/logo, plan.plan.display, pricing.monthly (from month_rate or part_d_rate), drug.annualDeductible, drug.starRating, drug.gapCoverage, (optional) planId short code |
| Plan Details (right panel) | All Card fields + tier carousel (drug.tiers), contractId, segmentId, planId, effectiveDate, raw tier table parsed, LIS subsidy info (future), pharmacy resource links |

### Normalization Rules
1. `monthlyPremium = (part_d_rate || month_rate)/100` if >= 100 else raw
2. `annualDeductible = annual_drug_deductible / 100` when >= 1000 (cents heuristic)
3. `gapCoverage = additional_drug_coverage_offered_in_the_gap || additional_coverage_offered_in_the_gap`
4. `plan.key` = `${contract_id}-${segment_id}` if both present else `plan_id`
5. `pricing.monthly` mirrors `drug.monthlyPremium` so shared pricing UI works.

### Tier Parsing Strategy
The `benefits[0].full_description` HTML embeds sequential tier sections separated by `<p><b>Tier X ...</b></p><table>...</table>` blocks.

Parsing approach (lazy):
1. In adapter `normalize`, store raw HTML string in `metadata.rawTierHtml` (omit tiers for lightweight list fetch).
2. When entering plan-details view, run a parser utility that:
   - Splits on `<p><b>Tier` boundaries.
   - Extracts tier header text (`Tier 1 (Preferred Generic)` → label, derive index with regex).
   - Parses following `<table>` rows mapping the four pharmacy type columns to a consistent shape.
   - Normalizes 'Not Supported' to undefined.
   - Keeps cost cells as strings (currency or percentage). Future enhancement: classify into `{ type:'$'|'%'|'text', value:number|null, raw:string }`.

### FieldDescriptor Draft (Drug Plan)
Proposed plan-details groups:
- Pricing Overview: monthlyPremium, annualDeductible, gapCoverage, starRating
- Identification: contractId, segmentId, planId, effectiveDate
- Coverage Tiers: tier carousel using `drug.tiers`
- Resources: formulary / pharmacy websites (from `contextual_data.carrier_resources` if exposed via raw)

Example descriptors (conceptual):
```
[
  { id:'monthlyPremium', label:'Monthly Premium', valuePath:'drug.monthlyPremium', group:'pricing', importance:'primary', visibleOnCard:true },
  { id:'annualDeductible', label:'Annual Deductible', valuePath:'drug.annualDeductible', group:'pricing', importance:'primary', visibleOnCard:true },
  { id:'gapCoverage', label:'Gap Coverage', valuePath:'drug.gapCoverage', group:'pricing', importance:'secondary', visibleOnCard:true },
  { id:'starRating', label:'Star Rating', valuePath:'drug.starRating', group:'pricing', importance:'secondary', visibleOnCard:true },
  { id:'contractId', label:'Contract', valuePath:'drug.contractId', group:'identification', visibleOnDetails:true },
  { id:'segmentId', label:'Segment', valuePath:'drug.segmentId', group:'identification', visibleOnDetails:true },
  { id:'planId', label:'Plan ID', valuePath:'drug.planId', group:'identification', visibleOnCard:false, visibleOnDetails:true },
  { id:'effectiveDate', label:'Effective', valuePath:'drug.effectiveDate', group:'identification', visibleOnDetails:true },
]
```

### Adapter Outline (to implement next)
```
normalize(raw, ctx):
  - derive carrier name/logo
  - compute monthlyPremium + annualDeductible
  - set pricing.monthly = monthlyPremium
  - build plan.key/display
  - capture starRating & gapCoverage
  - store raw tier HTML in metadata (omit parsing)

lazyParseTiers(rawHtml): DrugTier[]
  - executed in plan-details component
```

### Performance Considerations
- Avoid parsing large HTML strings during list render; only parse on demand when details view opened.
- Potential caching: memoize parsed tiers keyed by hash of raw HTML length + first 64 chars.

### Open Questions (Drug Plan)
- Do we ever need to show Tier 1 costs directly on the card? (Current guidance: No – keep minimal.)
- Should LIS subsidy adjusted premium be displayed when available? (Future enhancement.)

---
## Category Survey Appendix (Draft)

Purpose: Capture distinctive parsing, pricing, and structural nuances for each remaining category to ensure adapter base covers required extension points and to inform future cross-product mapping (especially Advantage ↔ Hospital Indemnity auto-config).

### Summary Matrix
| Category | Pricing Input Pattern | Key Structural Fields | Existing Utility Methods (reference) | Normalization Additions Needed | Plan Builder Relevance |
|----------|----------------------|-----------------------|--------------------------------------|-------------------------------|------------------------|
| Medicare Advantage | `part_c_rate` (medical), `part_d_rate`, `month_rate` (combo); MOOP; drug + medical deductibles | Benefits array with `benefit_type`, `full_description` (HTML), optional `summary_description` (in/out network); star rating; gap coverage flags | `getMedicalDeductible`, `getDrugDeductible`, `hasDrugCoverage`, `getPrimaryCareData`, `getSpecialistCareData`, `getOTCBenefit`, `getMOOPData` | Add `advantage.medicalDeductible`, `advantage.drugDeductible`, `advantage.moop`, `advantage.hasDrugCoverage`, benefit quick-look map (primary care, specialist, inpatient, outpatient surgery, ambulance) | Primary in Advantage builder (source for auto-config to HIP) |
| Hospital Indemnity | Base plan + riders with option arrays; rates already in dollars; different quantifiers (per Day, per Confinement, per Occurrence) | Base plan detection (`detectBasePlanType`), variant/series detection, riders (optional vs included), benefit options w/ quantifiers | `detectBasePlanType`, `getPrimaryBenefitSource`, `getAvailableDailyBenefits`, `getPremiumForDailyBenefit`, plan structure utilities (`detectPlanStructure`, `getRoutingSummary`), simplified benefits | Add `hip.mainBenefit { type, amountSelected, availableAmounts[] }`, `hip.riders[]`, `hip.structureType`, `hip.benefitStructureType`, `hip.series`, `hip.variant`, mapping-friendly fields: inpatientDaily, outpatientSurgeryOptions[], ambulanceOptions[] | Secondary (paired with Advantage auto-config) & standalone HIP builder |
| Dental / DVH | `base_plans[0].benefits[0].rate` (already dollars); notes embed deductibles / coinsurance levels in HTML; included base plan only (often minimal variation) | Base plans list, `benefit_notes`, `limitation_notes`, `benefits` with amount & quantifier, company rating | Raw dental quotes doc (HTML). No current util wrappers; rely on simple extraction. | Add `dental.deductible` (parse from notes), `dental.preventiveCoinsurance`, `dental.basicCoinsurance`, coverage feature flags (cleaningsPerYear, xrayCycle) – can stay optional initially | Optional component in Original Medicare builder (chip summary only) |
| Cancer | (Not fully sourced in repo sample) Typical: lump-sum benefit amount tiers, optional riders (recurrence, ICU, etc.) | Primary benefit (face amount), rider options, benefit schedule disclaimers | N/A (no utilities yet) | `cancer.faceAmount`, `cancer.availableFaceAmounts[]`, `cancer.riders[]` with cost, `cancer.recurrenceBenefit?` | Ancillary builder component (Original Medicare) |
| Final Expense (Deferred from builders) | `monthly_rate` (dollars), `annual_rate`, `face_value` (+ min/max), fees (monthly_fee, annual_fee) | Underwriting type, face amount bands, carrier rating, application methods | Grouping logic in `groupFinalExpenseQuotesByCompany` | Add `finalExpense.faceValue`, `finalExpense.faceRange`, `finalExpense.underwritingType`, `finalExpense.monthlyFee?` | Excluded Phase 1 (no builder) |

### Medicare Advantage – Adapter Considerations
Key benefit types to pre-compute for fast card rendering:
- Inpatient Hospital (derive per-day copay & day range from `full_description` or `summary_description`)
- Outpatient Surgery (flat copay or tiered range)
- Ambulance (ground vs air if present)
- Primary Care & Specialist (already parsed via utilities)
- Drug Deductible & MOOP values

Store a compact `advantage.quickBenefits` object:
```
{
  inpatient: { perDay: number | null, days: number | null },
  outpatientSurgery: { copay: number | null },
  ambulance: { ground: number | null, air: number | null },
  primaryCare: string, // retain textual form for display
  specialist: string,
  otcAllowance?: string
}
```
This facilitates Advantage ↔ HIP mapping heuristics (see Hospital Indemnity section below).

### Hospital Indemnity – Mapping Focus Fields
For auto-config from Advantage plan we need to map:
- Advantage inpatient per-day copay & day span → HIP daily benefit selection (closest amount * days vs per confinement option)
- Advantage outpatient surgery copay → HIP outpatient surgery rider amount
- Advantage ambulance copay(s) → HIP ambulance rider amount(s)

Therefore include on HIP normalized quote:
```
hip.mappable = {
  dailyBenefitAmounts: number[],          // from main benefit options
  perConfinementBenefitAmounts: number[], // if lump sum style present
  outpatientSurgeryAmounts: number[],
  ambulanceAmounts: number[],
  therapyVisitOptions?: number[],
}
```

### Dental – Minimal Phase 1 Parsing
Phase 1 adapter can expose only `monthlyPremium`, `deductible` (regex `$<num>` in first header), and coin level strings. Further granular limits (cleanings/year) can wait until card differentiation needed.

### Cancer – Placeholder
Until raw sample integrated, keep adapter minimal: face amount + premium + recurrence rider boolean. The adapter interface allows later expansion without card changes if we mark fields optional.

### Final Expense – Defer
Only ensure base supports range pricing (already covered by `pricing.range`). Additional life-insurance specific descriptors (face value vs rate) can plug into FieldDescriptors later.

### Cross-Category Shared Facet Candidates
| Facet | Categories | Rationale |
|-------|------------|-----------|
| `quickBenefits` | advantage | Speeds card & mapping |
| `mappable` | hospital-indemnity | Enables auto-config engine |
| `faceAmount` | final-expense, cancer | Amount-driven selection |
| `deductible` | drug-plan (annual), dental (lifetime/annual), advantage (medical/drug) | Consistent label strategy |

### Risks Identified
- HTML parsing fragility (Advantage & PDP tiers, Dental notes) → mitigate with regex guards & lazy parse
- Hospital Indemnity structural variance (series, pre-config, hybrid) → rely on existing detection utilities; adapter should expose a flattened `variants[]` only if needed by UI
- Performance: large dental & hospital JSON payloads – avoid embedding full raw in cache (strip heavy arrays)

### Adapter Extension Point Decisions
- Add optional `facets?: Record<string, any>` bucket to `NormalizedQuoteBase`? Instead we’ll keep category-specific nested objects (advantage, hip, dental, etc.) for type safety. No generic catch-all needed yet.

---

## Component Architecture Refactor Plan (Draft)

Objective: Replace ad-hoc, category-specific rendering paths with a composable, adapter-driven UI layer while minimizing regression risk.

### Target Reusable Primitives
1. CardShell
  - Responsibilities: layout frame, header (carrier logo/name), pricing badge area, action bar (bookmark, compare), optional facets row.
  - Props (initial):
    ```ts
    interface CardShellProps {
     quote: NormalizedQuoteBase;
     viewMode: 'card' | 'list';
     fieldGroups?: FieldDescriptor[]; // pre-filtered for card visibility
     onBookmark?: (q: NormalizedQuoteBase) => void;
     isBookmarked?: boolean;
     children?: React.ReactNode; // category facet injection
    }
    ```
  - Extension: category facet components (e.g. `<MedigapFacet />`, `<DrugPlanFacet />`).

2. PricingBadge
  - Displays primary monthly price + optional range (hover / subtext) + discount indicator.
  - Smart formatting (cents vs full dollars) using normalized `pricing.monthly` and `pricing.range`.

3. FieldBlocks
  - Renders compact grid or list of descriptor-driven values (for plan-details & expanded card mode).
  - Accepts `group` filter to show only certain descriptor clusters.

4. ActionsBar
  - Bookmark, Compare toggle, Add to Builder, Expand Details.
  - Avoids category logic; receives callbacks / state externally.

5. QuoteList (List Mode Wrapper)
  - Virtualization ready (Phase 2) – abstracted row renderer delegating to CardShell with `viewMode='list'`.

6. PlanDetailsDrawer / Panel
  - Accepts a single `NormalizedQuoteBase` + resolved full descriptor set + lazily parsed heavy data (e.g. drug tiers).

### Data Flow With Adapters
```
rawDocs (Firestore/API) -> map/flatten -> adapter.normalize -> normalized[]
normalized[] -> (optional) adapter.aggregate -> enriched pricing (ranges)
normalized[] -> derivePricingSummary? (carrier grouping) -> UI store
UI store -> CardShell / ListRow components
```

### Hook Layer
Introduce hook `useCategoryQuotes(category, raws, ctx)`:
```ts
function useCategoryQuotes<T, N extends NormalizedQuoteBase>(category: string, raw: T[], ctx: NormalizeContext) {
  const adapter = getAdapter(category);
  const normalized = React.useMemo(() => raw.map(r => adapter?.normalize(r, ctx)).filter(Boolean) as N[], [raw, ctx, adapter]);
  const summaries = React.useMemo(() => adapter?.derivePricingSummary ? adapter.derivePricingSummary(normalized) : [], [normalized, adapter]);
  return { normalized, summaries };
}
```

### Incremental Refactor Steps
1. Shadow Mode (Medigap only): implement `useCategoryQuotes` and compare its grouped pricing to existing logic (log diffs in dev).
2. Replace Medigap card rendering with CardShell + PricingBadge + MedigapFacet.
3. Add PDP adapter + facet component; enable behind feature flag.
4. Move legacy grouping code behind conditional (`if (!isAdaptersEnabled()) legacyRender();`).
5. Implement PlanDetailsDrawer consuming FieldDescriptors for PDP (includes lazy tier parsing utility).
6. Extract list mode row to reuse CardShell with condensed layout classes.
7. Add skeleton facets for Advantage & HIP (just pricing + placeholder chips) to validate multi-category wiring before real data mapping.

### Styling Strategy
Reuse existing Tailwind tokens; encapsulate cross-category styling in utility classes (e.g., `carrier-badge`, `price-primary`). Keep category-specific colors minimal; prefer neutral shells with small accent badges.

### Performance Considerations
- Memoize normalized quotes per (category + discount toggle + preferred filter).
- Defer heavy HTML parsing (PDP tiers, Advantage benefits extraction) until details open; cache results in a WeakMap keyed by raw HTML reference or hash.
- Consider batching normalization in a `requestIdleCallback` (non-blocking) for very large quote sets; not Phase 1.

### Testing Hooks
- Add a Jest (or Vitest) test that feeds a small Medigap raw sample array and asserts normalization invariants:
  - All ids unique
  - Monthly price > 0
  - Plan key matches /[A-Z]/
- Snapshot test for CardShell with mock normalized quote.

### Open Items for Discussion
- Compare vs Bookmark persistence ownership (central context vs individual CardShell state).
- Whether to surface aggregated pricing summaries (min/max) at carrier group header or inline each plan letter pill.

---

## Migration & Rollout Strategy (Draft)

Goal: Introduce the adapter + component refactor with zero regression risk using shadow evaluation, phased category enablement, and automated diff checks.

### Environments / Flags
- `NEXT_PUBLIC_ENABLE_ADAPTERS` (boolean | 'shadow')
  - `false` (default in prod until stable): legacy rendering only.
  - `shadow`: Run adapters + normalization + diff logging; UI still uses legacy data.
  - `true`: UI consumes adapter output for enabled categories.
- `NEXT_PUBLIC_ADAPTER_CATEGORIES` (comma list): subset to activate (e.g. `medigap,drug-plan`).

### Phases
1. Phase 0 (Local Dev Only)
  - Implement `useCategoryQuotes` hook.
  - Shadow mode for Medigap: compute normalized quotes & pricing summaries; compare with legacy grouping; log structured diffs (carrier id, plan key, legacyPrice, normalizedPrice).
2. Phase 1 (Internal Staging)
  - Enable Medigap adapter in true mode behind flag.
  - Add PDP adapter in shadow mode.
  - Introduce automated Jest snapshot test for normalization invariants.
3. Phase 2
  - Turn on PDP true mode; Advantage + HIP adapters shadow.
  - Introduce perf measurement (time to first render for normalization path).
4. Phase 3
  - Enable Advantage + HIP true mode.
  - Launch auto-config prototype (feature flagged) using normalized quickBenefits / mappable facets.
5. Phase 4
  - Dental, Cancer, Final Expense adapters (shadow then true). Final Expense may remain off until business greenlight.

### Diff Logging Format (Shadow Mode)
```
ADAPTER_DIFF medigap {
  carrier:"Aetna", plan:"G", field:"monthly", legacy:121.34, normalized:121.34, status:"match"
}
```
Only log mismatches or structural drops (legacy present / adapter null) in production shadow to reduce noise.

### Regression Safeguards
| Safeguard | Description |
|-----------|-------------|
| Unit Tests | Adapter-specific tests assert normalization invariants. |
| Shadow Diff | Live comparison of key price & grouping metrics. |
| Feature Flags | Rapid rollback by flipping `ENABLE_ADAPTERS` to `false`. |
| Schema Version Check | Ignore cached normalized objects with mismatched `adapter.version`. |
| Performance Budget | Warn if normalization time > 50ms for 500 quotes (median). |

### Data Integrity Checks
- Duplicate ID detection: log warning if multiple normalized quotes share `id`.
- Null pricing filter: count and log dropped quotes due to missing rate.
- Range recompute validation: assert `range.min <= monthly <= range.max` when range present.

### Rollback Plan
1. Flip flag to `false` (immediate disable).
2. Invalidate cached normalized objects (optional: increment global schemaVersion in local storage key).
3. Re-run legacy aggregation; monitor logs for any lingering adapter calls (should be suppressed by gating).

### Instrumentation
- Wrap normalization pass in `performance.mark('normalize:start')` / `performance.measure` (dev & staging only) and log summary stats.
- Count adapter errors (try/catch around per-quote normalize) and send metric (future observability hook).

### Deployment Checklist
1. Flags default to shadow in staging but false in prod.
2. All adapter tests green.
3. No diff mismatches for Medigap over a full day sample.
4. Manual spot check PDP shadow logs show expected field extraction.
5. Add brief internal release notes referencing rollback flag.

### Out of Scope (Migration Phase)
- Real-time streaming adapter updates (batch only for now).
- Cross-tab normalized cache sharing (consider later with BroadcastChannel).

---

## Risk & Validation Plan (Draft)

### Top Risks
| Risk | Impact | Mitigation | Validation Signal |
|------|--------|------------|-------------------|
| Hook order regressions (complex sidebar / future card refactors) | Runtime errors, blank UI | Centralize hooks in stable components, lint review | No React hook order warnings in console CI log |
| Data mismatch (pricing, plan letter) between legacy & adapter | Incorrect pricing display | Shadow diff & automated comparison test | 0 diff mismatches over 24h sample |
| Performance slowdown for large quote sets | Perceived sluggish UI | Memoization, lazy parsing, perf marks | Normalize < 50ms / 500 quotes median |
| HTML parsing fragility (PDP tiers, Advantage benefits) | Missing detail data | Robust regex guards + fallback messages | Parser test coverage (happy + malformed) |
| Stale cached normalized objects after version bump | Inconsistent UI | Version check & discard outdated cache entries | Cache migration test passes (old version dropped) |
| Over-logging in production shadow mode | Noise, cost | Filter logs to mismatches only | Log sampling stats show < 0.1% of renders emit diff |
| Discount toggle selecting wrong rate | User confusion, quoting errors | Explicit view_type token preference logic | Unit test: with & sans tokens present scenarios |

### Validation Layers
1. Type-Level: Strict adapter interfaces + discriminated `adapter.version`.
2. Unit Tests: Per adapter (normalize edge cases) & parser utilities.
3. Snapshot Tests: CardShell visual (Storybook or Jest DOM) for representative quotes.
4. Shadow Diff Runner: Compares legacy vs adapter pricing & grouping.
5. Performance Bench: micro-benchmark normalization pass using synthetic N quotes.
6. Runtime Guards: Warnings when duplicate IDs detected or monthly price <= 0.

### Proposed Test Files (Illustrative)
```
__tests__/adapters/medigapAdapter.normalize.test.ts
__tests__/adapters/drugPlanAdapter.normalize.test.ts
__tests__/parsers/drugTiers.parser.test.ts
__tests__/hooks/useCategoryQuotes.test.ts
__tests__/integration/medigap.shadowDiff.test.ts
```

### Key Unit Test Cases (Medigap)
- Plan letter extraction variants: 'Plan G', 'PLAN g', 'G'.
- Rate cents vs already-dollars heuristic: 12750 -> 127.5; 118.42 -> 118.42.
- Discount toggle logic when both with_hhd & sans_hhd tokens exist.
- Missing rate (adapter returns null) filtered out.

### Shadow Diff Algorithm (Pseudo)
```
legacyGroups = groupLegacy(quotes)
adapterQuotes = quotes.map(normalize).filter(Boolean)
adapterGroups = groupByCarrierPlan(adapterQuotes)
for each (carrier, plan) in unionKeys(legacyGroups, adapterGroups):
  legacyPrice = legacyGroups[carrier][plan]?.price
  adapterPrice = adapterGroups[carrier][plan]?.price
  if (legacyPrice !== adapterPrice) logDiff({carrier, plan, legacyPrice, adapterPrice})
```

### Performance Measurement
- Wrap normalization in `performance.mark` / `measure` (dev + staging only).
- Emit a dev console summary: `ADAPTER_PERF medigap { count: 512, totalMs: 38, p95: 4.1 }`.
- Track p95 normalization time; raise warning if > 10ms per 100 quotes.

### HTML Parsing Resilience
- Guard regex searches with fallback: if tier table not found return empty array and set `metadata.parsingWarning`.
- Add test for malformed tier header (e.g., missing `<b>` tag) verifying graceful degrade.

### Caching Strategy Validation
- Store normalized quotes in memory keyed by `category+discountToggle+preferredFilterHash`.
- Invalidate on: adapter.version change, discount toggle change, preferred filter change.
- Unit test ensures cache returns same reference for identical inputs.

### Smoke Validation Checklist (Per Deploy)
1. Medigap shadow diff: 0 mismatches (or documented expected exceptions < 3).
2. CardShell renders first 10 quotes with correct monthly price & plan pills.
3. Discount toggle updates pricing without unmount flicker (React DevTools trace stable).
4. PDP adapter (shadow) successfully extracts monthly premium & deductible for sample plan.
5. No console warnings (hooks, act(), hydration) in critical pages.

### Failure Handling
- On diff spikes: auto-disable adapter category via internal admin flag (future) or revert flag env.
- On performance spike: log top 5 slow normalization raw objects (size & keys) for inspection.

---

## Implementation Roadmap (Draft)

### Timeline Overview (Indicative)
| Week | Focus | Key Deliverables |
|------|-------|------------------|
| 1 | Medigap Shadow Integration | `useCategoryQuotes`, shadow diff logger, unit tests (medigap) |
| 2 | Medigap Live + PDP Adapter Dev | PDP adapter skeleton, tier parser util (lazy), CardShell integration |
| 3 | PDP Live (Shadow → True) | PDP normalization tests, PlanDetailsDrawer (PDP), perf metrics wiring |
| 4 | Advantage & HIP Adapters (Shadow) | Advantage quickBenefits extraction, HIP mappable facet, auto-config spec draft |
| 5 | Auto-Config Prototype + Advantage Live | Mapping engine, HIP suggestion UI (behind flag), expanded tests |
| 6 | Dental + Cancer Adapters (Shadow) | Minimal parsing, validation tests, risk review |
| 7 | Final Expense Adapter (Optional) | Range pricing validation, gating decision |
| 8 | Hardening & Cleanup | Storybook stories, docs finalization, deprecate legacy paths |

### Work Breakdown
1. Medigap Shadow (Week 1)
  - Implement `useCategoryQuotes` + registry fetch.
  - Legacy vs adapter pricing diff logger.
  - Unit tests (normalize, duplicate ID detection).
  - Perf measurement scaffolding.
2. CardShell + Shared Components (Weeks 1–2)
  - CardShell MVP (carrier, price, actions bar).
  - PricingBadge + discount indicator.
  - ActionsBar with bookmark stub.
3. PDP Adapter (Week 2)
  - Normalize monthly premium, deductible, coverage flags.
  - Store raw tier HTML.
  - Unit tests + malformed HTML test.
4. PlanDetailsDrawer (Week 3)
  - Generic descriptor render + PDP tier parser lazy invoke.
  - Snapshot test.
5. Advantage Adapter (Week 4)
  - Extract quickBenefits via existing util functions.
  - Normalize MOOP, deductibles, star rating.
6. HIP Adapter (Week 4)
  - Normalize base plan + rider options.
  - Build `hip.mappable` facet.
7. Auto-Config Engine (Week 5)
  - Mapping heuristics (inpatient perDay/days → HIP daily benefit; outpatient surgery copay → HIP rider amount; ambulance mapping).
  - Score + suggestion output (structure: { targetAmount, rationale[] }).
8. Dental & Cancer (Week 6)
  - Minimal fields (premium, deductible or faceAmount, optional riders).
  - Shadow tests & perf impact check.
9. Final Expense (Week 7) [Optional]
  - Normalize face value, underwriting type, monthly fee.
  - Range pricing validation.
10. Hardening (Week 8)
  - Storybook stories for each adapter category.
  - Replace legacy grouping path entirely.
  - Documentation pass & final schemaVersion review.

### Dependencies & Sequencing Notes
- PDP adapter depends on CardShell to avoid rework.
- Auto-config engine depends on Advantage & HIP adapters facets.
- Final Expense can be deferred indefinitely without blocking others.

### Resourcing / Ownership (Placeholder)
| Area | Primary | Backup |
|------|---------|--------|
| Medigap Adapter & Hook | Dev A | Dev B |
| PDP Adapter & Parser | Dev B | Dev C |
| Advantage Adapter | Dev C | Dev A |
| HIP Adapter | Dev A | Dev C |
| Auto-Config Engine | Dev C | Dev B |
| Dental/Cancer/Final Expense | Dev B | Dev A |
| QA & Validation Harness | QA Lead | Dev A |

### Success Criteria
- 0 pricing mismatches (material) in production after Medigap + PDP live for 7 days.
- Normalization p95 < 10ms / 100 quotes on mid-tier hardware.
- No open high-severity parsing errors logged during shadow phases.
- Auto-config suggestions accepted ≥30% of the time in internal testing (baseline adoption metric).

### Post-Roadmap (Future Opportunities)
- Streaming normalization (Web Worker offload).
- Cross-tab normalized cache sharing (BroadcastChannel).
- A/B test CardShell density layouts.

---

## Advantage ↔ Hospital Indemnity Auto-Config Spec (Draft)

Objective: Suggest a HIP (Hospital Indemnity) configuration derived from a selected Medicare Advantage plan’s cost-sharing profile to reduce manual configuration friction and highlight coverage gaps.

### Inputs
From Advantage normalized quote (`advantage.quickBenefits` + additional fields):
```
advantage.quickBenefits = {
  inpatient: { perDay: number | null, days: number | null },
  outpatientSurgery: { copay: number | null },
  ambulance: { ground: number | null, air: number | null },
  primaryCare: string, // textual cost e.g. '$0' or '$10'
  specialist: string,
  otcAllowance?: string
}
advantage.moop: number | null
advantage.medicalDeductible: number | null
```

From HIP normalized quote facet (`hip.mappable`):
```
hip.mappable = {
  dailyBenefitAmounts: number[],          // e.g. [100, 150, 200, 250, 300]
  perConfinementBenefitAmounts: number[], // optional alternative model
  outpatientSurgeryAmounts: number[],
  ambulanceAmounts: number[],             // amounts that would pay per ambulance event
  therapyVisitOptions?: number[]          // reserved future
}
```

### Core Mapping Heuristics
1. Inpatient Daily Benefit Selection
   - Target: approximate Advantage inpatient per-day liability * days.
   - If Advantage inpatient perDay & days present:
     - Compute totalExposure = perDay * days.
     - Strategy A (daily model): choose dailyBenefit = nearest(dailyBenefitAmounts, perDay).
     - Strategy B (confinement model, if perConfinementBenefitAmounts not empty): choose confinementBenefit = nearest(perConfinementBenefitAmounts, totalExposure).
     - Prefer Strategy A if dailyBenefitAmounts available; fall back to confinement.
   - Score = 1 - |selected - perDay| / perDay (clamped 0..1) for daily model.

2. Outpatient Surgery Rider
   - If outpatientSurgery copay present and outpatientSurgeryAmounts available:
     - Select amount = nearest(outpatientSurgeryAmounts, copay).
   - Score = 1 - |selected - copay| / max(copay, selected).

3. Ambulance Rider
   - For each of ground, air (if present): pick nearest(ambulanceAmounts, copay).
   - If both ground & air exist but only one amount chosen repeatedly, tag rationale with "Limited rider granularity".

4. Gap Emphasis Adjustment
   - If Advantage moop is high (> $5000) and inpatient perDay * days sum > 50% of moop, bump inpatient selection to next higher bracket if available (unless that overshoots by >30%).

5. Conservative Guardrails
   - Do not recommend any amount > 1.5 * underlying liability unless user opts into "Max Coverage" mode.
   - If no liability figure present for a facet, omit suggestion for that facet.

### Output Structure
```
interface AutoConfigSuggestion {
  category: 'hospital-indemnity';
  sourceAdvantageId: string;
  mappings: Array<{
    facet: 'inpatient-daily' | 'inpatient-confinement' | 'outpatient-surgery' | 'ambulance-ground' | 'ambulance-air';
    suggestedAmount: number;
    targetLiability?: number;        // Advantage cost reference
    score: number;                   // 0..1 confidence/fit
    rationale: string[];             // human-readable explanations
    alternatives?: number[];         // top 2 other close matches
  }>;
  summary: {
    coverageApproximation: number;   // sum suggested amounts (normalized) vs aggregate liability
    confidence: number;              // mean(score) weighted by facet importance
    notes?: string[];
  };
}
```

### Facet Importance Weights (Initial)
| Facet | Weight |
|-------|--------|
| inpatient-daily | 0.40 |
| inpatient-confinement | 0.40 (mutually exclusive with inpatient-daily for weighting) |
| outpatient-surgery | 0.20 |
| ambulance-ground | 0.10 |
| ambulance-air | 0.10 (combine with ground if both) |

### Algorithm Outline
```
function buildHipSuggestion(adv, hip): AutoConfigSuggestion {
  extract liabilities from adv.quickBenefits
  pick daily or confinement strategy
  map surgery & ambulance
  compute scores & rationale strings
  derive confidence = weighted average
  compute coverageApproximation = sum(selected facet amounts) / sum(liability facets used)
  return suggestion
}
```

### Rationale Message Examples
- "Selected $200 daily benefit to approximate $190 per-day inpatient cost (match 95%)."
- "$250 outpatient surgery rider chosen; nearest to $240 Advantage copay."
- "Ground ambulance copay $300 approximated by $300 rider (exact match)."
- "Up-leveled daily benefit from $180 to $200 due to high MOOP ($6500) to improve gap coverage." 

### UI Integration Points
1. In Advantage plan details: "Add Hospital Indemnity Recommendation" button (async compute suggestion → preview modal).
2. Preview Modal: show table of facets with suggested amount, score, alternative dropdown.
3. "Apply to Builder" action posts selected configuration into HIP builder state.

### Validation Tests
- Scenario with complete Advantage data returns 3–4 facet suggestions, confidence > 0.6.
- Missing outpatientSurgery yields no surgery facet mapping.
- High MOOP triggers up-level rationale.
- Score calculation clamps within [0,1].

### Future Enhancements
- Incorporate frequency modeling (e.g., expected admissions/year) to suggest coverage stacking.
- Machine-learned scoring once enough accepted vs edited suggestions collected.
- Add partial-benefit rider bundling recommendations.

---

