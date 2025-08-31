/**
 * LocalStorage integration for optimized dental quotes
 * Stores only essential data to prevent storage bloat
 */

import { OptimizedDentalQuote, optimizeDentalQuotes } from './dental-quote-optimizer';

const STORAGE_KEYS = {
  DENTAL_QUOTES: 'dental_quotes_optimized',
  DENTAL_QUOTES_META: 'dental_quotes_meta',
  DENTAL_SEARCH_HISTORY: 'dental_search_history'
} as const;

export interface StoredDentalQuotes {
  quotes: OptimizedDentalQuote[];
  timestamp: number;
  searchParams: {
    age: number;
    zipCode: string;
    gender: string;
    tobacco: boolean;
  };
  optimizationStats: {
    originalSize: number;
    optimizedSize: number;
    compressionRatio: string;
    quotesCount: number;
  };
}

export interface SearchHistoryEntry {
  timestamp: number;
  params: {
    age: number;
    zipCode: string;
    gender: string;
    tobacco: boolean;
  };
  resultsCount: number;
  compressionRatio: string;
}

/**
 * Saves optimized dental quotes to localStorage
 */
export function saveDentalQuotesToStorage(
  quotes: OptimizedDentalQuote[],
  searchParams: any,
  optimizationStats: any
): boolean {
  try {
    const storageData: StoredDentalQuotes = {
      quotes,
      timestamp: Date.now(),
      searchParams: {
        age: parseInt(searchParams.age.toString()),
        zipCode: searchParams.zipCode,
        gender: searchParams.gender,
        tobacco: searchParams.tobaccoUse || false
      },
      optimizationStats: {
        originalSize: optimizationStats.originalSize || 0,
        optimizedSize: optimizationStats.optimizedSize || 0,
        compressionRatio: optimizationStats.compressionRatio || '0%',
        quotesCount: quotes.length
      }
    };

    // Save quotes data
    localStorage.setItem(STORAGE_KEYS.DENTAL_QUOTES, JSON.stringify(storageData));
    
    // Update search history
    updateSearchHistory(storageData.searchParams, quotes.length, storageData.optimizationStats.compressionRatio);
    
    console.log(`💾 Saved ${quotes.length} optimized dental quotes to localStorage`);
    console.log(`🎯 Storage compression: ${storageData.optimizationStats.compressionRatio}`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to save dental quotes to localStorage:', error);
    return false;
  }
}

/**
 * Loads dental quotes from localStorage
 */
export function loadDentalQuotesFromStorage(): StoredDentalQuotes | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DENTAL_QUOTES);
    if (!stored) return null;
    
    const data: StoredDentalQuotes = JSON.parse(stored);
    
    // Check if data is recent (less than 1 hour old)
    const isRecent = Date.now() - data.timestamp < 60 * 60 * 1000; // 1 hour
    
    if (!isRecent) {
      console.log('🕒 Stored dental quotes are older than 1 hour, fetching fresh data');
      return null;
    }
    
    console.log(`📦 Loaded ${data.quotes.length} dental quotes from localStorage`);
    console.log(`🎯 Data compression: ${data.optimizationStats.compressionRatio}`);
    
    return data;
  } catch (error) {
    console.error('❌ Failed to load dental quotes from localStorage:', error);
    return null;
  }
}

/**
 * Updates search history in localStorage
 */
function updateSearchHistory(params: any, resultsCount: number, compressionRatio: string) {
  try {
    const existing = localStorage.getItem(STORAGE_KEYS.DENTAL_SEARCH_HISTORY);
    let history: SearchHistoryEntry[] = existing ? JSON.parse(existing) : [];
    
    // Add new entry
    history.unshift({
      timestamp: Date.now(),
      params,
      resultsCount,
      compressionRatio
    });
    
    // Keep only last 10 searches
    history = history.slice(0, 10);
    
    localStorage.setItem(STORAGE_KEYS.DENTAL_SEARCH_HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error('❌ Failed to update search history:', error);
  }
}

/**
 * Gets search history from localStorage
 */
export function getDentalSearchHistory(): SearchHistoryEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DENTAL_SEARCH_HISTORY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('❌ Failed to load search history:', error);
    return [];
  }
}

/**
 * Clears all dental quote data from localStorage
 */
export function clearDentalQuotesStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.DENTAL_QUOTES);
    localStorage.removeItem(STORAGE_KEYS.DENTAL_QUOTES_META);
    console.log('🗑️ Cleared dental quotes from localStorage');
  } catch (error) {
    console.error('❌ Failed to clear dental quotes storage:', error);
  }
}

/**
 * Gets storage usage statistics
 */
export function getStorageStats() {
  try {
    const quotesData = localStorage.getItem(STORAGE_KEYS.DENTAL_QUOTES);
    const historyData = localStorage.getItem(STORAGE_KEYS.DENTAL_SEARCH_HISTORY);
    
    const stats = {
      quotesSize: quotesData ? quotesData.length : 0,
      historySize: historyData ? historyData.length : 0,
      totalSize: (quotesData?.length || 0) + (historyData?.length || 0),
      quotesCount: 0,
      lastUpdated: null as Date | null
    };
    
    if (quotesData) {
      const parsed: StoredDentalQuotes = JSON.parse(quotesData);
      stats.quotesCount = parsed.quotes.length;
      stats.lastUpdated = new Date(parsed.timestamp);
    }
    
    return stats;
  } catch (error) {
    console.error('❌ Failed to get storage stats:', error);
    return {
      quotesSize: 0,
      historySize: 0,
      totalSize: 0,
      quotesCount: 0,
      lastUpdated: null
    };
  }
}

/**
 * Checks if localStorage has enough space (rough estimate)
 */
export function checkStorageSpace(): { hasSpace: boolean; usedBytes: number; estimatedLimit: number } {
  try {
    // Rough estimate of localStorage limit (usually 5-10MB)
    const estimatedLimit = 5 * 1024 * 1024; // 5MB
    
    // Calculate current usage
    let usedBytes = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        usedBytes += localStorage[key].length + key.length;
      }
    }
    
    return {
      hasSpace: usedBytes < estimatedLimit * 0.8, // Use 80% as threshold
      usedBytes,
      estimatedLimit
    };
  } catch (error) {
    console.error('❌ Failed to check storage space:', error);
    return {
      hasSpace: true, // Assume we have space if check fails
      usedBytes: 0,
      estimatedLimit: 5 * 1024 * 1024
    };
  }
}
