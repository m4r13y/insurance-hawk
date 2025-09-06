/**
 * Unified discount state management for Medicare shop and plan details
 */
import React from 'react';

const DISCOUNTS_APPLIED_KEY = 'discounts_applied';

export interface DiscountState {
  applied: boolean;
  types: string[];
}

/**
 * Get the current discount state from localStorage
 */
export const getDiscountState = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const stored = localStorage.getItem(DISCOUNTS_APPLIED_KEY);
    return stored ? JSON.parse(stored) : false;
  } catch (error) {
    console.error('Error loading discount state:', error);
    return false;
  }
};

/**
 * Set the discount state in localStorage
 */
export const setDiscountState = (applied: boolean): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DISCOUNTS_APPLIED_KEY, JSON.stringify(applied));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('discountStateChanged', {
      detail: { applied }
    }));
  } catch (error) {
    console.error('Error saving discount state:', error);
  }
};

/**
 * Hook to listen for discount state changes across components
 */
export const useDiscountState = () => {
  const [applied, setApplied] = React.useState(getDiscountState);

  React.useEffect(() => {
    const handleDiscountStateChange = (event: CustomEvent) => {
      setApplied(event.detail.applied);
    };

    window.addEventListener('discountStateChanged', handleDiscountStateChange as EventListener);
    
    return () => {
      window.removeEventListener('discountStateChanged', handleDiscountStateChange as EventListener);
    };
  }, []);

  const updateDiscountState = (newApplied: boolean) => {
    setDiscountState(newApplied);
    setApplied(newApplied);
  };

  return [applied, updateDiscountState] as const;
};
