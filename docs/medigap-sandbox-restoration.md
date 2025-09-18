# Medigap Sandbox Restoration Strategy

This document outlines how to extract or restore the Medigap Cards Design Sandbox into a production-ready modular feature (or remove it cleanly) without impacting other application areas.

## Current Sandbox Location
- Page: `src/app/shop-components/page.tsx`
- Related experimental components: `src/components/new-shop-components/*`
  - Quote cards variants (MinimalRateChips, LightInverseCards, DensityStressGrid, ComparisonRowCards)
  - Plan details showcase
  - Sidebar showcase (navigation rail + slide-out)
  - Streaming helper: `src/lib/streaming/medigapStreaming.ts`
  - Reusable skeleton: `src/components/ui/skeleton.tsx`

## Goals of the Sandbox
1. Allow rapid iteration on visual + interaction patterns isolated from production flows.
2. Provide a controlled environment for performance experimentation (streaming, timing metrics).
3. Enable A/B style comparison of density, layout, and theming variants.

## Extraction Paths
### Option A: Promote to Feature Module
1. Move `new-shop-components` under `src/features/medigap-cards/`.
2. Rename page route from `/shop-components` to a feature-scoped route (e.g., `/medigap/lab`).
3. Introduce a feature flag (`NEXT_PUBLIC_SHOW_MEDIGAP_LAB`) to hide in production unless enabled.
4. Export a stable `<MedigapQuoteBoard />` component that wraps one chosen variant + plan details.
5. Remove unused variants once a baseline layout is selected.

### Option B: Archive After Adoption
1. Decide primary card layout (e.g., LightInverseCards or ComparisonRow stack).
2. Relocate chosen layout into `src/features/medigap/quotes/`.
3. Delete remaining experimental variants & sandbox page.
4. Retain streaming helper + skeleton component (they are generic) elsewhere:
   - `src/lib/streaming/medigapStreaming.ts` → `src/lib/streaming/generic.ts`
   - `src/components/ui/skeleton.tsx` stays global.

### Option C: Split by Concern
- Visual components → `src/components/medigap/`
- Data shaping (carrier summaries, plan range logic) → `src/lib/medigap/`
- Streaming + metrics → `src/lib/perf/`
- Page glue remains a small route file.

## Safe Removal Checklist
If sandbox is no longer needed:
- Remove `/shop-components` route file.
- Delete `src/components/new-shop-components/` directory.
- Keep only reused assets (skeleton, streaming helper if generalized).
- Confirm no imports remain via grep: `new-shop-components`.

## Metrics & Streaming Integration Notes
- Feature flag: `NEXT_PUBLIC_ENABLE_MEDIGAP_STREAMING` gates streaming logic.
- Metrics captured:
  - `fetchDuration` (network + parse time)
  - `TTFCP` (time to first carrier processed)
  - `firstPlanVisibleMs` (user-perceived first render milestone)
  - `allPlansCompleteMs` (full list stabilized)
- Future: send these to an analytics endpoint when promoted.

## Recommended Next Steps Before Promotion
1. Abstract price/plan badge cluster into `<PlanPriceBlock />`.
2. Add virtualization to DensityStressGrid (react-virtualized or windowed list) for large sets.
3. Consolidate button + badge styles into design tokens.
4. Introduce test coverage for carrier summary aggregation logic.
5. Implement accessibility audit (tab order, ARIA roles for streaming updates).

## Environment Variables
Add to `.env.local` as needed:
```
# Enable incremental streaming demo (optional)
NEXT_PUBLIC_ENABLE_MEDIGAP_STREAMING=1
# Show experimental medigap lab page (future flag)
NEXT_PUBLIC_SHOW_MEDIGAP_LAB=1
```

## Decision Log Template
Maintain decisions in `docs/decision-log.md`:
```
Date | Decision | Rationale | Status
-----|----------|-----------|-------
YYYY-MM-DD | Adopt LightInverseCards as baseline | Best contrast and clarity | Active
```

---
This doc can evolve into a full ADR (Architecture Decision Record) once a path is chosen.
