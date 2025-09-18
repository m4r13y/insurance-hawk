# Plan Details Components

This directory contains the refactored plan-details page components, broken down for better maintainability and reusability.

## Files Structure

### Main Components
- `PlanDetailsMain.tsx` - Main component that orchestrates all tabs and state
- `PlanDetailsHeader.tsx` - Sticky header with back button and plan info
- `index.ts` - Export all components for easy importing

### Tab Components
- `PlanBuilderTab.tsx` - Plan customization and coverage selection (Overview tab)
- `AllPlansTab.tsx` - Comparison of all available plans (Quotes tab)
- `CompanyTab.tsx` - Company information and financial ratings (Company tab)
- `PlanDetailsTab.tsx` - Plan coverage details and rate information (Plan Details tab)
- `UnderwritingTab.tsx` - Underwriting information and important notes (Underwriting tab)

### Utility Components
- `LoadingState.tsx` - Loading spinner component
- `ErrorState.tsx` - Error state with go back button
- `types.ts` - TypeScript interface definitions

## Usage

The original plan-details page (1188 lines) has been refactored into:
- 1 main orchestrating component
- 5 focused tab components  
- 2 utility components
- 1 types file
- 1 simplified page file (8 lines)

### In the page file:
```tsx
import { PlanDetailsMain } from '@/components/plan-details';

export default function PlanDetailsPage() {
  return <PlanDetailsMain />;
}
```

## Benefits

1. **Maintainability** - Each tab is a separate component, easier to modify
2. **Reusability** - Components can be reused in other parts of the application
3. **Testing** - Individual components can be tested in isolation
4. **Code Organization** - Clear separation of concerns
5. **Performance** - Potential for lazy loading individual tabs
6. **Collaboration** - Multiple developers can work on different tabs simultaneously

## Original File

The original implementation is preserved as `page-backup.tsx` for reference.
