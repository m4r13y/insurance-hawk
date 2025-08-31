import { useState, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

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

  const handleCategoryToggle = useCallback(async (
    category: CategoryType, 
    loadQuotesCallback?: (category: string) => Promise<void>
  ) => {
    // Only update state if category actually changed
    if (category === activeCategory) {
      return;
    }

    // Set the new category immediately for UI responsiveness
    setActiveCategory(category);
    setSelectedCategory(category);
    
    // Save UI state to localStorage immediately
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeCategory', category);
    }
    
    // Update URL without waiting (non-blocking)
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', category);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    
    // Load quotes in background without blocking UI
    if (loadQuotesCallback) {
      // Use setTimeout to allow UI to update first
      setTimeout(() => {
        loadQuotesCallback(category).catch(error => {
          console.error(`Error loading quotes for category ${category}:`, error);
        });
      }, 0);
    }
  }, [router, pathname, searchParams, activeCategory]);

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
    handleCategorySelect,
  };

  return {
    ...categoryState,
    ...categoryActions,
  };
};
