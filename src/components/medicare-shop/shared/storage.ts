// Storage keys - using localStorage for quotes since it persists better during navigation
export const QUOTE_FORM_DATA_KEY = 'medicare_quote_form_data';
export const QUOTE_FORM_COMPLETED_KEY = 'medicare_quote_form_completed';
export const REAL_QUOTES_KEY = 'medicare_real_quotes'; // Now using localStorage instead of sessionStorage
export const ADVANTAGE_QUOTES_KEY = 'medicare_advantage_quotes';
export const FILTER_STATE_KEY = 'medicare_filter_state';

// Storage helper functions - using localStorage for better persistence
export const loadFromStorage = (key: string, defaultValue: any) => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

export const saveToStorage = (key: string, value: any) => {
  if (typeof window === 'undefined') return;
  
  // Handle undefined/null values
  const safeValue = value ?? null;
  const displayValue = typeof safeValue === 'object' ? 
    (Array.isArray(safeValue) ? `[${safeValue.length}]` : 'object') : 
    safeValue;
  
  console.log('💾 SAVING to localStorage:', key, '=', displayValue);
  try {
    const dataString = JSON.stringify(safeValue);
    
    // Check size and clean up if necessary
    if (dataString.length > 1000000) { // ~1MB limit
      console.warn('Data too large for localStorage, attempting cleanup');
      cleanupOldStorage();
    }
    
    localStorage.setItem(key, dataString);
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('LocalStorage quota exceeded, cleaning up old data');
      cleanupOldStorage();
      // Retry after cleanup
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (retryError) {
        console.error('Failed to save even after cleanup:', retryError);
      }
    } else {
      console.error('Error saving to localStorage:', error);
    }
  }
};

// Clean up old localStorage data
export const cleanupOldStorage = () => {
  try {
    // Remove old plan details data (older than 1 hour)
    const planDetailsStr = localStorage.getItem('planDetailsData');
    if (planDetailsStr) {
      const planDetails = JSON.parse(planDetailsStr);
      if (planDetails.timestamp && Date.now() - planDetails.timestamp > 3600000) {
        localStorage.removeItem('planDetailsData');
        console.log('🧹 Cleaned up old plan details data');
      }
    }
    
    // Remove backup if main quotes exist
    const mainQuotes = localStorage.getItem(REAL_QUOTES_KEY);
    const backupQuotes = localStorage.getItem('medicare_quotes_backup');
    if (mainQuotes && backupQuotes) {
      localStorage.removeItem('medicare_quotes_backup');
      console.log('🧹 Removed redundant backup quotes');
    }
    
    // Clean up any other old Medicare-related data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('medicare_') && !key.includes('real_quotes') && !key.includes('advantage_quotes') && !key.includes('form_data') && !key.includes('form_completed')) {
        localStorage.removeItem(key);
        console.log('🧹 Cleaned up old Medicare data:', key);
      }
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
};
