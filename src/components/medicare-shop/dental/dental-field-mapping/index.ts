// Main components
export { default as QuoteSelector } from './QuoteSelector';
export { default as ComparisonModal } from './ComparisonModal';
export { default as QuoteOverview } from './QuoteOverview';
export { default as FieldMappingTable } from './FieldMappingTable';
export { default as ProductVariationAnalysis } from './ProductVariationAnalysis';
export { default as DataAnalysis } from './DataAnalysis';
export { default as RawDataInspector } from './RawDataInspector';
export { default as ComparisonControls } from './ComparisonControls';
export { default as ProductVariationParser } from './ProductVariationParser';
export { default as DentalPlanBuilder } from './DentalPlanBuilder';
export { default as LoyalAmericanPlanBuilder } from './LoyalAmericanPlanBuilder';
export { SmartDentalPlanBuilder } from './SmartDentalPlanBuilder';
export { SmartAnalysisDemo } from './SmartAnalysisDemo';

// Types and utilities
export * from './types';
export * from './utils';
export * from './benefit-parser';
export * from './plan-builder-parser';
export { 
  analyzeProductBenefitVariables, 
  type IntelligentPlanAnalysis,
  type BenefitOption
} from './intelligent-benefit-analyzer';
