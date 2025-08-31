"use client";

import { collection, doc, setDoc, getDoc, deleteDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Generate unique visitor ID and store in localStorage
const getVisitorId = (): string => {
  const VISITOR_ID_KEY = 'visitor_id';
  
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
    console.log('🆔 Generated new visitor ID:', visitorId);
  }
  
  return visitorId;
};

// Map storage keys to subcollection names
const getSubcollectionName = (key: string): string => {
  const keyMapping: { [key: string]: string } = {
    'medicare_real_quotes': 'medigap_quotes',
    'medicare_advantage_quotes': 'advantage_quotes', 
    'medicare_drug_plan_quotes': 'drug_plan_quotes',
    'medicare_dental_quotes': 'dental_quotes',
    'medicare_hospital_indemnity_quotes': 'hospital_indemnity_quotes',
    'medicare_final_expense_quotes': 'final_expense_quotes',
    'medicare_cancer_insurance_quotes': 'cancer_insurance_quotes',
    'medicare_quote_form_data': 'form_data',
    'medicare_quote_form_completed': 'form_status',
    'medicare_filter_state': 'filter_state'
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

// Helper to create expiration timestamp
const getExpirationTimestamp = (): Timestamp => {
  const expirationTime = new Date();
  expirationTime.setHours(expirationTime.getHours() + TTL_HOURS);
  return Timestamp.fromDate(expirationTime);
};

// Save data to Firestore with subcollections for each quote category
export const saveTemporaryData = async (key: string, data: any): Promise<void> => {
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
    
    // Update visitor metadata (lightweight document)
    const visitorDocRef = doc(db, COLLECTION_NAME, visitorId);
    const visitorMetadata: VisitorMetadata = {
      visitorId,
      createdAt: now,
      lastActivity: now,
      expiresAt
    };
    
    // Create/update visitor metadata document
    await setDoc(visitorDocRef, visitorMetadata, { merge: true });
    
    // Handle large quote arrays by splitting them into chunks
    if (Array.isArray(data) && key.includes('quotes')) {
      console.log(`💾 Splitting ${data.length} quotes into smaller documents for ${key}`);
      
      // Clear existing documents in this subcollection first
      const subcollectionRef = collection(visitorDocRef, subcollectionName);
      
      // Split quotes into chunks of 25 quotes each (roughly 400KB per document)
      const chunkSize = 25;
      const chunks = [];
      for (let i = 0; i < data.length; i += chunkSize) {
        chunks.push(data.slice(i, i + chunkSize));
      }
      
      console.log(`📦 Created ${chunks.length} chunks for ${key}`);
      
      // Save each chunk as a separate document
      const savePromises = chunks.map(async (chunk, index) => {
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
        
        await setDoc(chunkDocRef, chunkDocument);
        console.log(`✅ Saved chunk ${index + 1}/${chunks.length} for ${key} (${chunk.length} quotes)`);
      });
      
      await Promise.all(savePromises);
      console.log(`✅ Successfully saved all ${chunks.length} chunks for ${key}`);
      
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
      
      await setDoc(dataDocRef, quoteDocument);
      console.log(`✅ Saved data to subcollection: ${subcollectionName}/${key} for visitor: ${visitorId}`);
    }
    
  } catch (error) {
    console.error(`❌ Error saving data for ${key}:`, error);
    // Fallback to localStorage if Firestore fails
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }
};

// Load data from Firestore subcollections with auto-cleanup
export const loadTemporaryData = async <T = any>(key: string, defaultValue: T): Promise<T> => {
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
    
    // First try to load as a single document
    const dataDocRef = doc(subcollectionRef, key);
    const dataDoc = await getDoc(dataDocRef);
    
    if (dataDoc.exists()) {
      const documentData = dataDoc.data() as QuoteDataDocument;
      
      // Check if data has expired
      const now = new Date();
      const expiresAt = documentData.expiresAt.toDate();
      
      if (now > expiresAt) {
        console.log(`⏰ Data expired for ${key}, cleaning up...`);
        await deleteDoc(dataDocRef);
        return defaultValue;
      }
      
      console.log(`✅ Loaded data from subcollection: ${subcollectionName}/${key}`);
      return documentData.data as T;
    }
    
    // If single document doesn't exist, try to load chunked data
    if (key.includes('quotes')) {
      console.log(`🔍 Looking for chunked data for ${key}...`);
      
      // Query for chunk documents
      const chunkedQuery = query(
        subcollectionRef,
        where('originalKey', '==', key)
      );
      
      try {
        const querySnapshot = await getDocs(chunkedQuery);
        
        if (!querySnapshot.empty) {
          console.log(`📦 Found ${querySnapshot.docs.length} chunks for ${key}`);
          
          // Sort chunks by index and combine them
          const chunks: { index: number; data: any[] }[] = [];
          let expired = false;
          
          for (const doc of querySnapshot.docs) {
            const chunkData = doc.data() as QuoteDataDocument;
            
            // Check if chunk has expired
            const now = new Date();
            const expiresAt = chunkData.expiresAt.toDate();
            
            if (now > expiresAt) {
              console.log(`⏰ Chunk expired for ${key}, cleaning up...`);
              await deleteDoc(doc.ref);
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
          
          console.log(`✅ Loaded ${combinedData.length} items from ${chunks.length} chunks for ${key}`);
          return combinedData as T;
        }
      } catch (error) {
        console.warn(`Failed to query chunked data for ${key}:`, error);
      }
    }
    
    console.log(`📭 No data found for ${key} in subcollection: ${subcollectionName}`);
    return defaultValue;
    
  } catch (error) {
    console.error(`❌ Error loading data for ${key}:`, error);
    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    }
    return defaultValue;
  }
};

// Delete specific data from visitor's quote data (subcollection approach)
export const deleteTemporaryData = async (key: string): Promise<void> => {
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
      console.log(`🗑️ Deleted single document from subcollection: ${subcollectionName}/${key}`);
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
          console.log(`🗑️ Deleted ${querySnapshot.docs.length} chunks for ${key}`);
        }
      } catch (error) {
        console.warn(`Failed to delete chunks for ${key}:`, error);
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
    console.log(`🗑️ Cleaned up all temporary data for visitor: ${visitorId}`);
    
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
    console.log(`🗑️ Cleaned up ${querySnapshot.docs.length} expired visitor documents`);
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
