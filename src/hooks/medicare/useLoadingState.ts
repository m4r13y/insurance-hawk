import { useState, useCallback } from 'react';

export interface LoadingState {
  isInitializing: boolean;
  isLoadingQuotes: boolean;
  showQuoteLoading: boolean;
  quotesReady: boolean;
  loadingItems: string[];
  loadingPlanButton: string | null;
  expectedQuoteTypes: string[];
  startedQuoteTypes: string[];
  completedQuoteTypes: string[];
  currentQuoteType: string | null;
  totalExpectedQuotes: number;
  hasAutoSwitched: boolean;
  isSwitchingCategory: boolean;
}

export interface LoadingActions {
  setIsInitializing: React.Dispatch<React.SetStateAction<boolean>>;
  setIsLoadingQuotes: React.Dispatch<React.SetStateAction<boolean>>;
  setShowQuoteLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setQuotesReady: React.Dispatch<React.SetStateAction<boolean>>;
  setLoadingItems: React.Dispatch<React.SetStateAction<string[]>>;
  setLoadingPlanButton: React.Dispatch<React.SetStateAction<string | null>>;
  setExpectedQuoteTypes: React.Dispatch<React.SetStateAction<string[]>>;
  setStartedQuoteTypes: React.Dispatch<React.SetStateAction<string[]>>;
  setCompletedQuoteTypes: React.Dispatch<React.SetStateAction<string[]>>;
  setCurrentQuoteType: React.Dispatch<React.SetStateAction<string | null>>;
  setTotalExpectedQuotes: React.Dispatch<React.SetStateAction<number>>;
  setHasAutoSwitched: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSwitchingCategory: React.Dispatch<React.SetStateAction<boolean>>;
  resetLoadingState: () => void;
  isCategoryLoading: (category: string) => boolean;
}

export const useLoadingState = () => {
  // Loading state
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const [showQuoteLoading, setShowQuoteLoading] = useState(false);
  const [quotesReady, setQuotesReady] = useState(false);
  const [loadingItems, setLoadingItems] = useState<string[]>([]);
  const [loadingPlanButton, setLoadingPlanButton] = useState<string | null>(null);
  const [expectedQuoteTypes, setExpectedQuoteTypes] = useState<string[]>([]);
  const [startedQuoteTypes, setStartedQuoteTypes] = useState<string[]>([]);
  const [completedQuoteTypes, setCompletedQuoteTypes] = useState<string[]>([]);
  const [currentQuoteType, setCurrentQuoteType] = useState<string | null>(null);
  const [totalExpectedQuotes, setTotalExpectedQuotes] = useState(0);
  const [hasAutoSwitched, setHasAutoSwitched] = useState(false);
  const [isSwitchingCategory, setIsSwitchingCategory] = useState(false);

  // Helper functions
  const resetLoadingState = useCallback(() => {
    setIsLoadingQuotes(false);
    setShowQuoteLoading(false);
    setQuotesReady(false);
    setLoadingItems([]);
    setLoadingPlanButton(null);
    setExpectedQuoteTypes([]);
    setStartedQuoteTypes([]);
    setCompletedQuoteTypes([]);
    setCurrentQuoteType(null);
    setTotalExpectedQuotes(0);
    setHasAutoSwitched(false);
  }, []);

  const isCategoryLoading = useCallback((category: string) => {
    const categoryMapping: Record<string, string> = {
      'medigap': 'medigap',
      'advantage': 'advantage', 
      'drug-plan': 'drug-plan',
      'dental': 'dental',
      'cancer': 'cancer',
      'hospital-indemnity': 'hospital-indemnity',
      'final-expense': 'final-expense'
    };

    const mappedCategory = categoryMapping[category];
    if (!mappedCategory) return false;

    // Check if this category is expected but not yet completed
    const isExpected = expectedQuoteTypes.some(type => {
      if (mappedCategory === 'medigap') return ['Supplement Plans', 'Plan F', 'Plan G', 'Plan N'].includes(type);
      if (mappedCategory === 'advantage') return type === 'Medicare Advantage Plans';
      if (mappedCategory === 'drug-plan') return type === 'Drug Plans';
      if (mappedCategory === 'dental') return type === 'Dental Insurance';
      if (mappedCategory === 'cancer') return type === 'Cancer Insurance';
      if (mappedCategory === 'hospital-indemnity') return type === 'Hospital Indemnity';
      if (mappedCategory === 'final-expense') return type === 'Final Expense Life';
      return false;
    });

    const isCompleted = completedQuoteTypes.some(type => {
      if (mappedCategory === 'medigap') return ['Supplement Plans', 'Plan F', 'Plan G', 'Plan N'].includes(type);
      if (mappedCategory === 'advantage') return type === 'Medicare Advantage Plans';
      if (mappedCategory === 'drug-plan') return type === 'Drug Plans';
      if (mappedCategory === 'dental') return type === 'Dental Insurance';
      if (mappedCategory === 'cancer') return type === 'Cancer Insurance';
      if (mappedCategory === 'hospital-indemnity') return type === 'Hospital Indemnity';
      if (mappedCategory === 'final-expense') return type === 'Final Expense Life';
      return false;
    });

    return isExpected && !isCompleted;
  }, [expectedQuoteTypes, completedQuoteTypes]);

  const loadingState: LoadingState = {
    isInitializing,
    isLoadingQuotes,
    showQuoteLoading,
    quotesReady,
    loadingItems,
    loadingPlanButton,
    expectedQuoteTypes,
    startedQuoteTypes,
    completedQuoteTypes,
    currentQuoteType,
    totalExpectedQuotes,
    hasAutoSwitched,
    isSwitchingCategory,
  };

  const loadingActions: LoadingActions = {
    setIsInitializing,
    setIsLoadingQuotes,
    setShowQuoteLoading,
    setQuotesReady,
    setLoadingItems,
    setLoadingPlanButton,
    setExpectedQuoteTypes,
    setStartedQuoteTypes,
    setCompletedQuoteTypes,
    setCurrentQuoteType,
    setTotalExpectedQuotes,
    setHasAutoSwitched,
    resetLoadingState,
    isCategoryLoading,
  };

  return {
    ...loadingState,
    ...loadingActions,
  };
};
