import { useState, useCallback, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { cancelCategoryRequests } from '@/lib/services/temporary-storage';

export type CategoryType = 'medigap' | 'advantage' | 'drug-plan' | 'dental' | 'cancer' | 'hospital-indemnity' | 'final-expense';

export interface CategoryState {
  selectedCategory: string;
  activeCategory: string;
  selectedFlowCategories: string[];
}

export interface CategoryActions {
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  setActiveCategory: React.Dispatch<React.SetStateAction<string>>;
  setSelectedFlowCategories: React.Dispatch<React.SetStateAction<string[]>>;
  handleCategoryToggle: (category: CategoryType, loadQuotesCallback?: (category: string) => Promise<void>) => Promise<void>;
  handleCategoryToggleAutomatic: (category: CategoryType, loadQuotesCallback?: (category: string) => Promise<void>) => Promise<void>;
  handleCategorySelect: (categoryId: string) => void;
}

export const useCategoryManagement = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Category state
  const [selectedCategory, setSelectedCategory] = useState('medigap');
  const [activeCategory, setActiveCategory] = useState('medigap');
  const [selectedFlowCategories, setSelectedFlowCategories] = useState<string[]>([]);

  // Timeout refs to prevent delayed category switching
  const manualTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const automaticTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Safety flag to prevent automatic category switching
  const manualSelectionMade = useRef<boolean>(false);

  const handleCategoryToggle = useCallback(async (
    category: CategoryType, 
    loadQuotesCallback?: (category: string) => Promise<void>
  ) => {
    // Only update state if category actually changed
    if (category === activeCategory) {
      return;
    }

    // Mark that a manual selection has been made
    manualSelectionMade.current = true;

    // Cancel any pending manual category operations
    if (manualTimeoutRef.current) {
      clearTimeout(manualTimeoutRef.current);
      manualTimeoutRef.current = null;
    }

    // Cancel all pending Firestore requests for any categories
    // This prevents race conditions when user switches tabs quickly
    const allCategories = ['medigap', 'advantage', 'drug-plan', 'dental', 'cancer', 'hospital-indemnity', 'final-expense'];
    allCategories.forEach(cat => cancelCategoryRequests(cat));

    // Set the new category immediately for UI responsiveness
    setActiveCategory(category);
    setSelectedCategory(category);
    
    // Save UI state to localStorage immediately
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeCategory', category);
    }
    
    // Update URL without waiting (non-blocking) - ONLY for manual selections
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', category);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    
    // Load quotes in background without blocking UI
    if (loadQuotesCallback) {
      // Use setTimeout to allow UI to update first, but store ref to cancel if needed
      manualTimeoutRef.current = setTimeout(() => {
        manualTimeoutRef.current = null;
        loadQuotesCallback(category).catch(error => {
          console.error(`Error loading quotes for category ${category}:`, error);
        });
      }, 0);
    }
  }, [router, pathname, searchParams, activeCategory]);

  // New function for automatic category updates (when quotes load) - doesn't update URL
  const handleCategoryToggleAutomatic = useCallback(async (
    category: CategoryType, 
    loadQuotesCallback?: (category: string) => Promise<void>
  ) => {
    // COMPLETELY DISABLED - no automatic category switching allowed after manual selection
    if (manualSelectionMade.current) {
      console.log('🚫 Auto-switching disabled - manual selection already made');
      return;
    }

    // Only update state if category actually changed
    if (category === activeCategory) {
      return;
    }

    // Cancel any pending automatic category operations
    if (automaticTimeoutRef.current) {
      clearTimeout(automaticTimeoutRef.current);
      automaticTimeoutRef.current = null;
    }

    // Cancel requests for OTHER categories, but not the one we're switching to
    const allCategories = ['medigap', 'advantage', 'drug-plan', 'dental', 'cancer', 'hospital-indemnity', 'final-expense'];
    allCategories.filter(cat => cat !== category).forEach(cat => cancelCategoryRequests(cat));

    // Set the new category immediately for UI responsiveness
    setActiveCategory(category);
    setSelectedCategory(category);
    
    // Save UI state to localStorage immediately
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeCategory', category);
    }
    
    // DO NOT update URL for automatic category changes
    
    // Load quotes in background without blocking UI
    if (loadQuotesCallback) {
      // Use setTimeout to allow UI to update first, but store ref to cancel if needed
      automaticTimeoutRef.current = setTimeout(() => {
        automaticTimeoutRef.current = null;
        loadQuotesCallback(category).catch(error => {
          console.error(`Error loading quotes for category ${category}:`, error);
        });
      }, 0);
    }
  }, [activeCategory]);

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
  }, []);

  const categoryState: CategoryState = {
    selectedCategory,
    activeCategory,
    selectedFlowCategories,
  };

  const categoryActions: CategoryActions = {
    setSelectedCategory,
    setActiveCategory,
    setSelectedFlowCategories,
    handleCategoryToggle,
    handleCategoryToggleAutomatic,
    handleCategorySelect,
  };

  return {
    ...categoryState,
    ...categoryActions,
  };
};
