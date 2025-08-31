"use client";

import { 
  saveTemporaryData, 
  loadTemporaryData, 
  deleteTemporaryData,
  saveTemporaryDataCompressed 
} from './temporary-storage';

// Existing storage keys
export const QUOTE_FORM_DATA_KEY = 'medicare_quote_form_data';
export const QUOTE_FORM_COMPLETED_KEY = 'medicare_quote_form_completed';
export const SELECTED_CATEGORIES_KEY = 'medicare_selected_categories';
export const REALQUOTES_KEY = 'medicare_quotes';
export const ADVANTAGE_QUOTES_KEY = 'medicare_advantage_quotes';
export const DRUG_PLAN_QUOTES_KEY = 'medicare_drug_plan_quotes';
export const DENTAL_QUOTES_KEY = 'medicare_dental_quotes';
export const HOSPITAL_INDEMNITY_QUOTES_KEY = 'medicare_hospital_indemnity_quotes';
export const FINAL_EXPENSE_QUOTES_KEY = 'medicare_final_expense_quotes';
export const CANCER_INSURANCE_QUOTES_KEY = 'medicare_cancer_insurance_quotes';

// Enhanced storage functions that use Firestore with localStorage fallback
export const saveToStorage = async (key: string, data: any): Promise<void> => {
  // Use compressed storage for large quote data
  if (key.includes('quotes') || key.includes('quote_form_data')) {
    await saveTemporaryDataCompressed(key, data);
  } else {
    await saveTemporaryData(key, data);
  }
};

export const loadFromStorage = async <T = any>(key: string, defaultValue: T): Promise<T> => {
  return await loadTemporaryData(key, defaultValue);
};

export const removeFromStorage = async (key: string): Promise<void> => {
  await deleteTemporaryData(key);
};

// Synchronous versions for immediate use (fallback to localStorage only)
export const saveToStorageSync = (key: string, data: any): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`📱 Saved to localStorage: ${key}`);
      // Also save to Firestore asynchronously
      saveToStorage(key, data).catch(error => {
        console.warn(`Failed to save ${key} to Firestore:`, error);
      });
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);
    }
  }
};

export const loadFromStorageSync = <T = any>(key: string, defaultValue: T): T => {
  if (typeof window !== 'undefined') {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        console.log(`📱 Loaded from localStorage: ${key}`);
        return parsed;
      }
    } catch (error) {
      console.error(`Failed to load ${key} from localStorage:`, error);
    }
  }
  return defaultValue;
};

// Migration helper: Load from Firestore and update localStorage
export const migrateStorageData = async (): Promise<void> => {
  const storageKeys = [
    QUOTE_FORM_DATA_KEY,
    QUOTE_FORM_COMPLETED_KEY,
    SELECTED_CATEGORIES_KEY,
    REALQUOTES_KEY,
    ADVANTAGE_QUOTES_KEY,
    DRUG_PLAN_QUOTES_KEY,
    DENTAL_QUOTES_KEY,
    HOSPITAL_INDEMNITY_QUOTES_KEY,
    FINAL_EXPENSE_QUOTES_KEY,
    CANCER_INSURANCE_QUOTES_KEY
  ];

  console.log('🔄 Starting storage migration from Firestore to localStorage...');
  
  for (const key of storageKeys) {
    try {
      const data = await loadFromStorage(key, null);
      if (data !== null) {
        localStorage.setItem(key, JSON.stringify(data));
        console.log(`✅ Migrated ${key} from Firestore to localStorage`);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to migrate ${key}:`, error);
    }
  }
  
  console.log('✅ Storage migration completed');
};
