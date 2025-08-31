"use client";

import { collection, doc, setDoc, getDoc, deleteDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Key used for storing visitor ID in localStorage
const VISITOR_ID_KEY = 'visitor_id';

// Generate unique visitor ID and store i

const getVisitorId = (): string => {
  if (typeof window === 'undefined') {
    // Server-side: generate temporary ID
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    // Generate new UUID-like ID with timestamp and random string
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substr(2, 9);
    visitorId = `visitor_${timestamp}_${randomStr}`;
    
    // Validate format before storing
    if (!/^visitor_\d+_[a-zA-Z0-9]+$/.test(visitorId)) {
      console.error('Generated invalid visitor ID format');
      return `visitor_${Date.now()}_fallback`;
    }
    
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  
  return visitorId;
};

// Map storage keys to subcollection names
const getSubcollectionName = (key: string): string => {
  const keyMapping: { [key: string]: string } = {
    'medicare_real_quotes': 'medigap_quotes',
    'medicare_quotes': 'medigap_quotes', // Alternative key for real quotes
    'medicare_advantage_quotes': 'advantage_quotes', 
    'medicare_drug_plan_quotes': 'drug_plan_quotes',
    'medicare_dental_quotes': 'dental_quotes',
    'dental_quotes_optimized': 'dental_quotes_optimized',
    'dental_quotes_meta': 'dental_quotes_meta',
    'dental_search_history': 'dental_search_history',
    'medicare_hospital_indemnity_quotes': 'hospital_indemnity_quotes',
    'medicare_final_expense_quotes': 'final_expense_quotes',
    'medicare_cancer_insurance_quotes': 'cancer_insurance_quotes',
    'medicare_quote_form_data': 'form_data',
    'medicare_quote_form_completed': 'form_status',
    'medicare_filter_state': 'filter_state',
    'planDetailsData': 'plan_details'
  };
  
  return keyMapping[key] || 'misc_data';
};

// Storage interface for visitor metadata
export interface VisitorMetadata {
  visitorId: string;
  createdAt: Timestamp;
  lastActivity: Timestamp;
  expiresAt: Timestamp;
}

// Interface for quote data documents within subcollections
export interface QuoteDataDocument {
  key: string;
  data: any;
  savedAt: Timestamp;
  expiresAt: Timestamp;
  // Optional fields for chunked data
  chunkIndex?: number;
  totalChunks?: number;
  originalKey?: string;
}

// Legacy interface for backward compatibility
export interface TemporaryStorageData {
  id: string;
  visitorId: string;
  data: any;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  dataType: string;
}

// Configuration
const TTL_HOURS = 24; // Data expires after 24 hours
const DATABASE_NAME = 'temp'; // Using the temp database
const COLLECTION_NAME = 'visitors'; // Using the visitors collection
const MAX_RETRIES = 3; // Maximum retry attempts for failed operations
const BASE_DELAY = 1000; // Base delay for exponential backoff (1 second)

// Queue management for concurrent operations
class OperationQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private maxConcurrent = 1; // Maximum concurrent operations (reduced to 1 for Firebase limits)
  private activeOperations = 0;
  private lastOperationTime = 0;
  private minDelay = 500; // Minimum delay between operations (increased to 500ms)
  private consecutiveErrors = 0; // Track consecutive errors for backoff
  private maxConsecutiveErrors = 3; // Max errors before increasing delay

  async add<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.activeOperations >= this.maxConcurrent) {
      return;
    }

    const operation = this.queue.shift();
    if (!operation) {
      return;
    }

    this.processing = true;
    this.activeOperations++;

    try {
      // Ensure minimum delay between operations
      const now = Date.now();
      const timeSinceLastOp = now - this.lastOperationTime;
      if (timeSinceLastOp < this.minDelay) {
        await new Promise(resolve => setTimeout(resolve, this.minDelay - timeSinceLastOp));
      }

      await operation();
      this.consecutiveErrors = 0; // Reset error count on success
      this.lastOperationTime = Date.now();
    } catch (error: any) {
      this.consecutiveErrors++;
      
      // Check for resource exhaustion and apply adaptive backoff
      if (error?.code === 'resource-exhausted' || 
          error?.message?.includes('exhausted') ||
          error?.message?.includes('overloading')) {
        const backoffDelay = Math.min(5000, 1000 * Math.pow(2, this.consecutiveErrors));
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
      
      throw error; // Re-throw to let the caller handle it
    } finally {
      this.activeOperations--;
      this.processing = false;
      
      // Process next operation in queue
      setTimeout(() => this.processQueue(), 50);
    }
  }
}

// Global operation queue
const operationQueue = new OperationQueue();

// Helper function for exponential backoff retry
const retryWithBackoff = async (fn: () => Promise<any>, retries = MAX_RETRIES): Promise<any> => {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (
      error?.code === 'deadline-exceeded' || 
      error?.code === 'unavailable' ||
      error?.message?.includes('deadline') ||
      error?.message?.includes('timeout')
    )) {
      const delay = BASE_DELAY * (MAX_RETRIES - retries + 1); // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1);
    }
    throw error;
  }
};

// Helper to create expiration timestamp
const getExpirationTimestamp = (): Timestamp => {
  const expirationTime = new Date();
  expirationTime.setHours(expirationTime.getHours() + TTL_HOURS);
  return Timestamp.fromDate(expirationTime);
};

// Save data to Firestore with subcollections for each quote category
export const saveTemporaryData = async (key: string, data: any): Promise<void> => {
  return operationQueue.add(async () => {
    try {
    if (!db) {
      console.warn('Firestore not available, falling back to localStorage');
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(data));
      }
      return;
    }
    
      const visitorId = getVisitorId();
      const now = Timestamp.now();
      const expiresAt = getExpirationTimestamp();
      const subcollectionName = getSubcollectionName(key);
      
      // Only update visitor metadata for actual quote data from API responses or quote submissions
      // NOT for UI state changes like activeCategory, selectedCategory, filters, etc.
      // Form data and form status should also be local-only for better privacy and performance
      const isUIState = key.includes('activeCategory') || key.includes('selectedCategory') || 
                       key.includes('selected_categories') || key.includes('current_flow_step') ||
                       key.includes('filter_state') || key.includes('ui_state') ||
                       key.includes('quote_form_completed') || key.includes('quote_form_data') ||
                       key.includes('form_status') || key.includes('form_data');
      
      // For UI state, only save to localStorage - don't save to Firestore at all
      if (isUIState) {
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(key, JSON.stringify(data));
          } catch (localError) {
            console.error(`❌ Failed to save UI state to localStorage:`, localError);
          }
        }
        return; // Exit early - don't save UI state to Firestore
      }
      
      // Check what kind of data this is to determine if we should update visitor metadata
      // Only quote data from APIs should trigger visitor metadata updates
      const isNewQuoteSubmission = key.includes('quotes') && Array.isArray(data) && data.length > 0;
      const isImportantEvent = isNewQuoteSubmission;
      const visitorDocRef = doc(db, COLLECTION_NAME, visitorId);
      
      // Check if visitor document already exists to avoid unnecessary createdAt updates
      let shouldUpdateMetadata = false;
      if (isImportantEvent) {
        try {
          const existingDoc = await getDoc(visitorDocRef);
          if (!existingDoc.exists()) {
            // First time creating visitor document
            shouldUpdateMetadata = true;
          } else {
            // Document exists - only update lastActivity, not createdAt
            const existingData = existingDoc.data();
            const lastUpdate = existingData.lastActivity?.toDate();
            const now = new Date();
            const timeSinceLastUpdate = now.getTime() - (lastUpdate?.getTime() || 0);
            
            // Only update if it's been more than 5 minutes since last update (avoid constant updates)
            if (timeSinceLastUpdate > 5 * 60 * 1000) {
              shouldUpdateMetadata = true;
            }
          }
        } catch (error) {
          // Fallback to update on error
          shouldUpdateMetadata = true;
        }
      }
      
      if (shouldUpdateMetadata) {
        const visitorMetadata: VisitorMetadata = {
          visitorId,
          createdAt: now,
          lastActivity: now,
          expiresAt
        };
        
        // Create/update visitor metadata document with retry
        await retryWithBackoff(() => setDoc(visitorDocRef, visitorMetadata, { merge: true }));
      }
      
      // Handle large quote arrays by splitting them into chunks
      if (Array.isArray(data) && key.includes('quotes') && data.length > 10) {
      
      // Use smaller chunks (25 quotes) to reduce Firebase load and prevent resource exhaustion
      const chunkSize = 25;
      const chunks = [];
      for (let i = 0; i < data.length; i += chunkSize) {
        chunks.push(data.slice(i, i + chunkSize));
      }
      
      // Instead of deleting and recreating, update existing chunks where possible
      const subcollectionRef = collection(visitorDocRef, subcollectionName);
      try {
        const existingQuery = query(
          subcollectionRef,
          where('originalKey', '==', key)
        );
        const existingDocs = await getDocs(existingQuery);
        
        // Delete existing chunks in smaller batches to avoid timeout
        if (!existingDocs.empty) {
          const deletePromises = existingDocs.docs.map(doc => deleteDoc(doc.ref));
          // Process deletes in batches of 10 to avoid overwhelming Firestore
          for (let i = 0; i < deletePromises.length; i += 10) {
            const batch = deletePromises.slice(i, i + 10);
            await Promise.all(batch);
            // Small delay between batches to prevent hot-spotting
            if (i + 10 < deletePromises.length) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }
        }
      } catch (error) {
        // Continue with save operation even if cleanup fails
      }
      
      // Save chunks sequentially to avoid DEADLINE_EXCEEDED
      for (let index = 0; index < chunks.length; index++) {
        const chunk = chunks[index];
        const chunkDocRef = doc(subcollectionRef, `${key}_chunk_${index}`);
        const chunkDocument: QuoteDataDocument = {
          key: `${key}_chunk_${index}`,
          data: chunk,
          savedAt: now,
          expiresAt,
          chunkIndex: index,
          totalChunks: chunks.length,
          originalKey: key
        };
        
        try {
          await retryWithBackoff(() => setDoc(chunkDocRef, chunkDocument));
          
          // Longer delay between chunks to prevent Firebase resource exhaustion
          if (index < chunks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Increased to 1 second
          }
        } catch (chunkError) {
          // Don't throw immediately, try to save remaining chunks
        }
      }
      
    } else {
      // Handle non-array data or small arrays normally
      const subcollectionRef = collection(visitorDocRef, subcollectionName);
      const dataDocRef = doc(subcollectionRef, key);
      
      const quoteDocument: QuoteDataDocument = {
        key,
        data,
        savedAt: now,
        expiresAt
      };
      
      await retryWithBackoff(() => setDoc(dataDocRef, quoteDocument));
    }
    
  } catch (error) {
    console.error(`❌ Error saving data for ${key}:`, error);
    // Enhanced fallback with better error handling
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (localError) {
        console.error(`❌ Failed to save to localStorage as well:`, localError);
      }
    }
  }
  });
};

// Load data from Firestore subcollections with auto-cleanup and timeout handling
export const loadTemporaryData = async <T = any>(key: string, defaultValue: T): Promise<T> => {
  return operationQueue.add(async () => {
    
    // Check if this is UI state - if so, load from localStorage only
    const isUIState = key.includes('activeCategory') || key.includes('selectedCategory') || 
                     key.includes('selected_categories') || key.includes('current_flow_step') ||
                     key.includes('filter_state') || key.includes('ui_state') ||
                     key.includes('quote_form_completed') || key.includes('quote_form_data') ||
                     key.includes('form_status') || key.includes('form_data');
    
    if (isUIState) {
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            return JSON.parse(stored);
          }
        } catch (localError) {
          console.warn(`Failed to parse UI state from localStorage for ${key}:`, localError);
        }
      }
      return defaultValue;
    }
    
    try {
    if (!db) {
      console.warn('Firestore not available, falling back to localStorage');
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
      }
      return defaultValue;
    }

    const visitorId = getVisitorId();
    const subcollectionName = getSubcollectionName(key);
    
    // Reference to the subcollection
    const visitorDocRef = doc(db, COLLECTION_NAME, visitorId);
    const subcollectionRef = collection(visitorDocRef, subcollectionName);
    
    // First try to load as a single document with timeout
    const dataDocRef = doc(subcollectionRef, key);
    
    try {
      const dataDoc = await Promise.race([
        getDoc(dataDocRef),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 10000) // 10 second timeout
        )
      ]) as any;
      
      if (dataDoc.exists()) {
        const documentData = dataDoc.data() as QuoteDataDocument;
        
        // Check if data has expired
        const now = new Date();
        const expiresAt = documentData.expiresAt.toDate();
        
        if (now > expiresAt) {
          await deleteDoc(dataDocRef);
          return defaultValue;
        }
        
        
        return documentData.data as T;
      }
    } catch (timeoutError) {
      // Try chunked approach if single document times out
    }
    
    // If single document doesn't exist or timed out, try to load chunked data
    if (key.includes('quotes')) {
      
      try {
        // Query for chunk documents with timeout
        const chunkedQuery = query(
          subcollectionRef,
          where('originalKey', '==', key)
        );
        
        const querySnapshot = await Promise.race([
          getDocs(chunkedQuery),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Query timeout')), 15000) // 15 second timeout
          )
        ]) as any;
        
        if (!querySnapshot.empty) {
          
          // Sort chunks by index and combine them
          const chunks: { index: number; data: any[] }[] = [];
          let expired = false;
          
          for (const doc of querySnapshot.docs) {
            const chunkData = doc.data() as QuoteDataDocument;
            
            // Check if chunk has expired
            const now = new Date();
            const expiresAt = chunkData.expiresAt.toDate();
            
            if (now > expiresAt) {
              // Clean up expired chunks in background (don't await to avoid blocking)
              deleteDoc(doc.ref).catch(() => {
                // Silently handle cleanup errors
              });
              expired = true;
              continue;
            }
            
            if (chunkData.chunkIndex !== undefined) {
              chunks.push({
                index: chunkData.chunkIndex,
                data: chunkData.data
              });
            }
          }
          
          if (expired && chunks.length === 0) {
            return defaultValue;
          }
          
          // Sort chunks by index and combine data
          chunks.sort((a, b) => a.index - b.index);
          const combinedData: any[] = [];
          chunks.forEach(chunk => {
            combinedData.push(...chunk.data);
          });
          
          
          return combinedData as T;
        }
      } catch (queryError) {
        // Fallback to localStorage if available
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem(key);
          if (stored) {
            return JSON.parse(stored);
          }
        }
      }
    }
    
    return defaultValue;
    
  } catch (error) {
    console.error(`❌ Error loading data for ${key}:`, error);
    // Enhanced fallback to localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (localError) {
        // Silently handle localStorage parsing errors
      }
    }
    return defaultValue;
  }
  });
};

// Delete specific data from visitor's quote data (subcollection approach)
export const deleteTemporaryData = async (key: string): Promise<void> => {
  // Check if this is UI state - if so, only delete from localStorage
  const isUIState = key.includes('activeCategory') || key.includes('selectedCategory') || 
                   key.includes('selected_categories') || key.includes('current_flow_step') ||
                   key.includes('filter_state') || key.includes('ui_state') ||
                   key.includes('quote_form_completed') || key.includes('quote_form_data') ||
                   key.includes('form_status') || key.includes('form_data');
  
  if (isUIState) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
    return; // Exit early - UI state is only in localStorage
  }
  
  try {
    if (!db) {
      console.warn('Firestore not available, falling back to localStorage');
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
      return;
    }
    
    const visitorId = getVisitorId();
    const subcollectionName = getSubcollectionName(key);
    
    // Reference to the subcollection
    const visitorDocRef = doc(db, COLLECTION_NAME, visitorId);
    const subcollectionRef = collection(visitorDocRef, subcollectionName);
    
    // Try to delete single document first
    const dataDocRef = doc(subcollectionRef, key);
    try {
      await deleteDoc(dataDocRef);
    } catch (error) {
      // Document might not exist, continue to check for chunks
    }
    
    // Also delete any chunked documents
    if (key.includes('quotes')) {
      try {
        const chunkedQuery = query(
          subcollectionRef,
          where('originalKey', '==', key)
        );
        
        const querySnapshot = await getDocs(chunkedQuery);
        
        if (!querySnapshot.empty) {
          const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
          await Promise.all(deletePromises);
        }
      } catch (error) {
        // Silently handle chunk deletion errors
      }
    }
    
  } catch (error) {
    console.error(`❌ Error deleting data for ${key}:`, error);
    // Fallback to localStorage cleanup
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  }
};

// Clean up all data for current visitor (including all subcollections)
export const cleanupVisitorData = async (): Promise<void> => {
  try {
    if (!db) {
      console.warn('Firestore not available, falling back to localStorage');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('visitor_id');
      }
      return;
    }
    
    const visitorId = getVisitorId();
    const visitorDocRef = doc(db, COLLECTION_NAME, visitorId);
    
    // Delete the entire visitor document (this will cascade delete all subcollections)
    await deleteDoc(visitorDocRef);
    
    // Also clean localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('visitor_id');
    }
  } catch (error) {
    console.error('❌ Error cleaning up visitor data:', error);
  }
};

// Clean up expired visitors (call this periodically)
export const cleanupExpiredData = async (): Promise<void> => {
  try {
    if (!db) {
      console.warn('Firestore not available, skipping expired data cleanup');
      return;
    }
    
    const now = Timestamp.now();
    
    const q = query(
      collection(db, COLLECTION_NAME),
      where('expiresAt', '<', now)
    );
    
    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('❌ Error cleaning up expired data:', error);
  }
};

// Hook to get current visitor ID
export const useVisitorId = (): string => {
  return getVisitorId();
};

// Extended save function with compression for large data
export const saveTemporaryDataCompressed = async (key: string, data: any): Promise<void> => {
  try {
    // Use the compression logic from your existing storage.ts
    const compressedData = key.includes('quotes') ? compressQuoteData(data) : data;
    await saveTemporaryData(key, compressedData);
  } catch (error) {
    console.error(`❌ Error saving compressed temporary data for ${key}:`, error);
  }
};

// Simple compression function (you can import from your existing storage.ts)
const compressQuoteData = (quotes: any[]): any[] => {
  if (!Array.isArray(quotes)) return quotes;
  
  return quotes.map(quote => {
    if (!quote || typeof quote !== 'object') return quote;
    
    const compressed = { ...quote };
    
    // Remove large text fields that aren't displayed
    const fieldsToRemove = [
      'description', 'long_description', 'detailed_description',
      'terms', 'conditions', 'legal_text', 'disclaimer',
      'benefits_description', 'coverage_details', 'exclusions',
      'limitations', 'rider_description', 'plan_description'
    ];
    
    fieldsToRemove.forEach(field => {
      if (compressed[field]) {
        delete compressed[field];
      }
    });
    
    return compressed;
  });
};
