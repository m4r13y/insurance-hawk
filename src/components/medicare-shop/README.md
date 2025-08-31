# Medicare Shop Components

This directory contains all Medicare-related insurance shopping components, organized by product type.

## 📁 Folder Structure

### Core Medicare Products
- **`advantage/`** - Medicare Advantage (Part C) plans
- **`medigap/`** - Medicare Supplement (Medigap) plans  
- **`drug-plan/`** - Medicare Part D and Medicare Advantage + Part D plans

### Supplemental Insurance Products
- **`dental/`** - Dental insurance plans for Medicare beneficiaries
- **`hospital-indemnity/`** - Hospital indemnity insurance plans
- **`final-expense/`** - Final expense/burial insurance plans
- **`chs/`** - Critical Health Services (cancer, heart attack, stroke) insurance

### Shared Components
- **`shared/`** - Common components used across all Medicare product types
  - Layout components
  - Navigation
  - Utilities
  - Type definitions

## 🏗️ Component Structure Pattern

Each product folder follows a consistent structure:

```
product-folder/
├── ProductShopContent.tsx    # Main shopping interface
├── ProductSidebar.tsx        # Filtering and search sidebar
├── ProductDetails.tsx        # Detailed product view
├── ProductEmptyState.tsx     # Empty states and error handling
└── index.ts                  # Clean exports
```

## 📦 Import Pattern

All components can be imported from the main index:

```typescript
import { 
  DrugPlanShopContent,
  MedicareAdvantageShopContent,
  MedigapShopContent,
  // ... other components
} from '@/components/medicare-shop';
```

## 🚀 Development Status

| Product | Status | Components Available |
|---------|---------|---------------------|
| **Advantage** | ✅ Complete | All core components |
| **Medigap** | ✅ Complete | All core components |
| **Drug Plan** | ✅ Complete | All core components |
| **Dental** | 🚧 Planned | Folder structure ready |
| **Hospital Indemnity** | 🚧 Planned | Folder structure ready |
| **Final Expense** | 🚧 Planned | Folder structure ready |
| **CHS** | 🚧 Planned | Folder structure ready |

## 📝 Adding New Components

When adding components to any product folder:

1. Follow the naming convention: `Product[ComponentType].tsx`
2. Update the folder's `index.ts` to export the new component
3. Ensure TypeScript interfaces are properly defined
4. Follow the established UI patterns from existing components
5. Include proper error handling and loading states

## 🔄 Component Integration

Components integrate with the main Medicare shopping flow through:

- **MedicareShopContent.tsx** - Main orchestrator
- **Category-based routing** - URL-based navigation between products
- **Shared state management** - Quote data and user preferences
- **Sequential quote fetching** - API calls for multiple product types

## 🎯 Future Enhancements

- [ ] Implement dental insurance components
- [ ] Add hospital indemnity shopping flow
- [ ] Create final expense quote system
- [ ] Build CHS insurance components
- [ ] Add cross-product comparison tools
- [ ] Implement bundle recommendations
