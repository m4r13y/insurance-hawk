# Quote Cards System (New Shop Components)

This directory contains card components for displaying carrier summaries across product categories with a unified visual style (gradient / inverse design).

## Components
- `PrimaryCards.tsx` (LightInverseCards): Medigap-focused cards supporting plan type toggles (F/G/N) and AM Best rating display.
- `DrugPlanCards.tsx`: Prescription Drug Plan (PDP) cards using CMS star ratings, deductible, and representative plan name.

## Shared Parts
`SharedCardParts.tsx` provides:
- `CarrierLogoBlock`
- `SaveToggleButton`
- `DetailsButton`
- `PlanPriceBlock`

## Display Standardization
All categories should:
1. Use enhanced carrier info (display name + logo) via `getEnhancedCarrierInfo` when possible.
2. Provide a rating component suitable for the product:
   - Medigap: `AmBestStarRating` (AM BEST)
   - Drug Plan: `CMSStarRating`
   - Others: add new specialized rating component or reuse existing.
3. Persist a return URL before navigating to `/plan-details` for back navigation.
4. Supply normalized min/max pricing and plan counts via adapter summaries.

## Adding a New Category
1. Ensure adapter returns `summaries` with `carrierId`, `carrierName`, `plans`, `planRanges`, `logoUrl`, and `rating` if applicable.
2. Create a `<Category>Cards.tsx` following the pattern:
   - Accept `carriers` + `loading` props.
   - Map summaries to carrier shape in the page (or move mapping to a hook later).
   - Use `SaveToggleButton` and `DetailsButton`.
   - Route Details to `/plan-details?category=<slug>&carrier=<encoded>`.
3. Add a rating component if the category rating scale differs.
4. Update `PlanDetailsShell` registry with a `<Category>PlanDetails` component.
5. (Optional) Abstract common grid + card shell if 3+ categories share identical structure.

## TODO
- Abstract common card shell wrapper (animation, gradients) to `BaseCarrierCard`.
- Add accessible aria-label improvements for rating components.
- Consolidate price range logic into a shared utility.
- Add tests (snapshot + a11y) for card components.

---
Generated as part of the multi-category detail page and card unification refactor.
