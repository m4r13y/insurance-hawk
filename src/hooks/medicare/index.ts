import { useQuoteManagement } from './useQuoteManagement';
import { useLoadingState } from './useLoadingState';
import { useCategoryManagement } from './useCategoryManagement';
import { useUIState } from './useUIState';

export const useMedicareState = () => {
  const quoteManagement = useQuoteManagement();
  const loadingState = useLoadingState();
  const categoryManagement = useCategoryManagement();
  const uiState = useUIState();

  return {
    // Quote Management
    ...quoteManagement,
    
    // Loading State
    ...loadingState,
    
    // Category Management
    ...categoryManagement,
    
    // UI State
    ...uiState,
  };
};

// Export individual hooks as well
export { useQuoteManagement } from './useQuoteManagement';
export { useLoadingState } from './useLoadingState';
export { useCategoryManagement } from './useCategoryManagement';
export { useUIState } from './useUIState';

// Export types
export type { QuoteState, QuoteActions } from './useQuoteManagement';
export type { LoadingState, LoadingActions } from './useLoadingState';
export type { CategoryState, CategoryActions, CategoryType } from './useCategoryManagement';
export type { UIState, UIActions } from './useUIState';
