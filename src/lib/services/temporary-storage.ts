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

// Storage interface for visitors collection
export interface VisitorData {
  visitorId: string;
  createdAt: Timestamp;
  lastActivity: Timestamp;
  expiresAt: Timestamp;
  quoteData: {
    [key: string]: {
      data: any;
      savedAt: Timestamp;
    };
  };
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

// Save data to Firestore visitors collection with TTL
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
    
    // Reference to the visitor document
    const visitorDocRef = doc(db, COLLECTION_NAME, visitorId);
    
    // Get existing visitor data or create new
    const visitorDoc = await getDoc(visitorDocRef);
    let visitorData: VisitorData;
    
    if (visitorDoc.exists()) {
      visitorData = visitorDoc.data() as VisitorData;
      // Update last activity and extend expiration
      visitorData.lastActivity = now;
      visitorData.expiresAt = expiresAt;
    } else {
      // Create new visitor document
      visitorData = {
        visitorId,
        createdAt: now,
        lastActivity: now,
        expiresAt,
        quoteData: {}
      };
    }
    
    // Add/update the specific quote data
    visitorData.quoteData[key] = {
      data,
      savedAt: now
    };

    await setDoc(visitorDocRef, visitorData);
    console.log(`✅ Saved temporary data: ${key} for visitor: ${visitorId}`);
  } catch (error) {
    console.error(`❌ Error saving temporary data for ${key}:`, error);
    // Fallback to localStorage if Firestore fails
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }
};

// Load data from Firestore visitors collection with auto-cleanup
export const loadTemporaryData = async <T = any>(key: string, defaultValue: T): Promise<T> => {
  try {
    if (!db) {
      console.warn('Firestore not available, falling back to localStorage');
      if (typeof window !== 'undefined') {
        const fallbackData = localStorage.getItem(key);
        if (fallbackData) {
          try {
            return JSON.parse(fallbackData);
          } catch {
            return defaultValue;
          }
        }
      }
      return defaultValue;
    }
    
    const visitorId = getVisitorId();
    const visitorDocRef = doc(db, COLLECTION_NAME, visitorId);
    const visitorDoc = await getDoc(visitorDocRef);
    
    if (visitorDoc.exists()) {
      const visitorData = visitorDoc.data() as VisitorData;
      
      // Check if visitor data has expired
      if (visitorData.expiresAt.toDate() < new Date()) {
        console.log(`🗑️ Visitor data expired for ${visitorId}, cleaning up...`);
        await deleteDoc(visitorDocRef);
        return defaultValue;
      }
      
      // Check if the specific quote data exists
      if (visitorData.quoteData && visitorData.quoteData[key]) {
        console.log(`✅ Loaded temporary data: ${key} for visitor: ${visitorId}`);
        return visitorData.quoteData[key].data;
      }
    }
    
    console.log(`📭 No temporary data found for ${key}, using default`);
    return defaultValue;
  } catch (error) {
    console.error(`❌ Error loading temporary data for ${key}:`, error);
    // Fallback to localStorage if Firestore fails
    if (typeof window !== 'undefined') {
      const fallbackData = localStorage.getItem(key);
      if (fallbackData) {
        try {
          return JSON.parse(fallbackData);
        } catch {
          return defaultValue;
        }
      }
    }
    return defaultValue;
  }
};

// Delete specific data from visitor's quote data
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
    const visitorDocRef = doc(db, COLLECTION_NAME, visitorId);
    const visitorDoc = await getDoc(visitorDocRef);
    
    if (visitorDoc.exists()) {
      const visitorData = visitorDoc.data() as VisitorData;
      
      // Remove the specific quote data
      if (visitorData.quoteData && visitorData.quoteData[key]) {
        delete visitorData.quoteData[key];
        
        // Update the document
        await setDoc(visitorDocRef, visitorData);
        console.log(`🗑️ Deleted temporary data: ${key} for visitor: ${visitorId}`);
      }
    }
  } catch (error) {
    console.error(`❌ Error deleting temporary data for ${key}:`, error);
    // Fallback to localStorage cleanup
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  }
};

// Clean up all data for current visitor
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
