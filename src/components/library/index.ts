// Component Library Index
// Organized structure for reusable components in the Medicare education website

// Data Components
export { AdvancedTable } from './data/advanced-table';

// Form Components  
export { FormGroup, FormLabel, FormTextarea, FormCheckbox, FormRadio, InputGroup, InputAddon } from './forms/enhanced-form';

// Feedback Components
export { EnhancedModal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter, ModalCloseButton } from './feedback/enhanced-modal';
export { EnhancedBadge, StatusBadge, CountBadge, CategoryBadge, PriorityBadge } from './feedback/enhanced-badge';

// Layout Components
export { SimpleHeader } from './layout/simple-header';

// Library Page Components
export { HeroSection } from './HeroSection';
export { FeaturedResourcesSection } from './FeaturedResourcesSection';
export { SearchAndFilterSection } from './SearchAndFilterSection';
export { ResourcesGrid } from './ResourcesGrid';
export { libraryData } from './libraryData';

// Content Components (for Medicare-specific content)
export { ActionButtons } from '../ActionButtons';
// TODO: Add Medicare content components like:
// - ComparisonTable
// - EnrollmentTimeline  
// - PlanComparison
// - CalculatorCard
// - InfoCard

// Insurance Components (for Medicare-specific insurance features)
// TODO: Add insurance-specific components like:
// - PlanSelector
// - CoverageDetails
// - PremiumCalculator
// - NetworkProvider
// - BenefitsGrid
