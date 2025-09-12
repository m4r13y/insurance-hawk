import { OptimizedDentalQuote } from '@/lib/dental-quote-optimizer';

export interface FieldMapping {
  field: string;
  rawValue: any;
  type: string;
  formattedValue: string;
  notes: string;
}

export interface ProductVariationAnalysis {
  productKey: string;
  variationCount: number;
  ids: string[];
  premiumRange: {
    min: number;
    max: number;
  };
  maxBenefitRange: {
    min: number;
    max: number;
  };
}

export interface DentalFieldMappingProps {
  quotes: OptimizedDentalQuote[];
  loading?: boolean;
}

export interface QuoteSelectorProps {
  quotes: OptimizedDentalQuote[];
  selectedQuote: OptimizedDentalQuote | null;
  onSelectQuote: (quote: OptimizedDentalQuote) => void;
  groupByPlan: boolean;
  onToggleGrouping: (grouped: boolean) => void;
  selectedForComparison: OptimizedDentalQuote[];
  onToggleComparison: (quote: OptimizedDentalQuote) => void;
  maxComparisons?: number;
}

export interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedQuotes: OptimizedDentalQuote[];
  onRemoveQuote: (quote: OptimizedDentalQuote) => void;
  onClearAll: () => void;
}

export interface FieldMappingTableProps {
  quote: OptimizedDentalQuote;
  quotes: OptimizedDentalQuote[];
}

export interface ProductVariationAnalysisProps {
  quotes: OptimizedDentalQuote[];
}

export interface QuoteOverviewProps {
  quote: OptimizedDentalQuote;
}
