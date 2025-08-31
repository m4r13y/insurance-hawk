// Storage keys - using localStorage for quotes since it persists better during navigation
export const QUOTE_FORM_DATA_KEY = 'medicare_quote_form_data';
export const QUOTE_FORM_COMPLETED_KEY = 'medicare_quote_form_completed';
export const REAL_QUOTES_KEY = 'medicare_real_quotes'; // Now using localStorage instead of sessionStorage
export const ADVANTAGE_QUOTES_KEY = 'medicare_advantage_quotes';
export const DRUG_PLAN_QUOTES_KEY = 'medicare_drug_plan_quotes';
export const DENTAL_QUOTES_KEY = 'medicare_dental_quotes';
export const HOSPITAL_INDEMNITY_QUOTES_KEY = 'medicare_hospital_indemnity_quotes';
export const FINAL_EXPENSE_QUOTES_KEY = 'medicare_final_expense_quotes';
export const CANCER_INSURANCE_QUOTES_KEY = 'medicare_cancer_insurance_quotes';
export const FILTER_STATE_KEY = 'medicare_filter_state';

// Import Firestore storage functions
import { 
  saveToStorage as saveToFirestore, 
  loadFromStorage as loadFromFirestore,
  saveToStorageSync as saveToFirestoreSync
} from '@/lib/services/storage-bridge';

// Enhanced storage option - can use Firestore + localStorage hybrid
const USE_FIRESTORE = true; // Set to false to disable Firestore
const MAX_QUOTE_SIZE = 1000; // Maximum number of quotes per category
const MAX_VISITOR_AGE_HOURS = 24; // Maximum visitor session length

// Storage helper functions - using localStorage with Firestore backup
export const loadFromStorage = (key: string, defaultValue: any) => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    // Try localStorage first
    let saved = localStorage.getItem(key);
    
    // If not found in localStorage, try sessionStorage as fallback
    if (!saved && typeof sessionStorage !== 'undefined') {
      saved = sessionStorage.getItem(key);
      if (saved) {
        console.log('📥 Loaded from sessionStorage fallback:', key);
      }
    }
    
    if (saved) {
      return JSON.parse(saved);
    }
    
    // If not found locally and Firestore is enabled, try loading from there
    if (USE_FIRESTORE) {
      console.log('🔄 Attempting to load from Firestore backup:', key);
      // Note: This is async, so we return the default and load in background
      loadFromFirestore(key, defaultValue).then(data => {
        if (data !== defaultValue) {
          console.log('✅ Loaded from Firestore backup:', key);
          // Update localStorage with the data from Firestore
          try {
            localStorage.setItem(key, JSON.stringify(data));
          } catch (error) {
            console.warn('Failed to cache Firestore data to localStorage:', error);
          }
        }
      }).catch(error => {
        console.warn('Firestore load failed for', key, ':', error);
      });
    }
    
    return defaultValue;
  } catch (error) {
    console.error('Error loading from storage:', error);
    return defaultValue;
  }
};

// Async version for when you can wait for Firestore
export const loadFromStorageAsync = async (key: string, defaultValue: any) => {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    // Try localStorage first
    let saved = localStorage.getItem(key);
    
    if (saved) {
      console.log('📥 Loaded from localStorage:', key);
      return JSON.parse(saved);
    }
    
    // Try sessionStorage
    if (typeof sessionStorage !== 'undefined') {
      saved = sessionStorage.getItem(key);
      if (saved) {
        console.log('📥 Loaded from sessionStorage:', key);
        return JSON.parse(saved);
      }
    }
    
    // Try Firestore if enabled
    if (USE_FIRESTORE) {
      const data = await loadFromFirestore(key, defaultValue);
      if (data !== defaultValue) {
        console.log('✅ Loaded from Firestore:', key);
        // Cache in localStorage
        try {
          localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
          console.warn('Failed to cache Firestore data to localStorage:', error);
        }
        return data;
      }
    }
    
    return defaultValue;
  } catch (error) {
    console.error('Error loading from storage:', error);
    return defaultValue;
  }
};

// Calculate storage usage
export const getStorageUsage = () => {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total;
};

// Conservative quote compression - remove only large unnecessary fields
export const compressQuoteData = (quotes: any[]): any[] => {
  if (!Array.isArray(quotes)) return quotes;
  
  return quotes.map(quote => {
    // Start with the full quote and remove only problematic large fields
    const compressed = { ...quote };
    
    // Remove large text fields that aren't displayed
    delete compressed.fullDescription;
    delete compressed.detailedBenefits;
    delete compressed.termsAndConditions;
    delete compressed.brochureUrl;
    delete compressed.applicationUrl;
    delete compressed.marketingMaterials;
    delete compressed.disclosures;
    delete compressed.legalDisclaimer;
    delete compressed.benefitDetails;
    delete compressed.exclusions;
    delete compressed.limitations;
    delete compressed.underwritingGuidelines;
    
    // Truncate very long string fields but keep the structure
    Object.keys(compressed).forEach(key => {
      if (typeof compressed[key] === 'string' && compressed[key].length > 500) {
        compressed[key] = compressed[key].substring(0, 500) + '...';
      }
    });
    
    // Compress large arrays but keep essential structure
    if (compressed.benefits && Array.isArray(compressed.benefits) && compressed.benefits.length > 10) {
      compressed.benefits = compressed.benefits.slice(0, 10); // Keep first 10 benefits
    }
    
    if (compressed.features && Array.isArray(compressed.features) && compressed.features.length > 10) {
      compressed.features = compressed.features.slice(0, 10); // Keep first 10 features
    }
    
    // Keep essential arrays for hospital indemnity
    if (compressed.basePlans && Array.isArray(compressed.basePlans)) {
      // Don't compress basePlans as they're essential for hospital indemnity
      // Just ensure they have the right structure
      compressed.basePlans = compressed.basePlans.map((plan: any) => ({
        ...plan,
        // Ensure benefitOptions exist
        benefitOptions: plan.benefitOptions || []
      }));
    }
    
    // Keep essential arrays for final expense and drug plans
    if (compressed.plans && Array.isArray(compressed.plans)) {
      // Don't compress plans array as it's essential for some quote types
    }
    
    // Keep essential arrays for hospital indemnity
    if (compressed.riders && Array.isArray(compressed.riders)) {
      // Keep riders array for hospital indemnity quotes
    }
    
    // Keep essential objects with nested properties
    if (compressed.ambest && typeof compressed.ambest === 'object') {
      // Keep A.M. Best rating info for insurance quotes
      compressed.ambest = {
        rating: compressed.ambest.rating,
        outlook: compressed.ambest.outlook
      };
    }
    
    // Ensure all numeric fields that use toLocaleString are properly converted
    const numericFields = ['benefit_amount', 'face_value', 'monthly_rate', 'annual_rate', 'annualMaximum', 'dailyBenefit', 'maxDays', 'reviewCount', 'monthlyPremium', 'premium', 'policyFee', 'hhDiscount'];
    numericFields.forEach(field => {
      if (compressed[field] !== undefined && compressed[field] !== null && compressed[field] !== '') {
        compressed[field] = Number(compressed[field]) || 0;
      }
    });
    
    return compressed;
  });
};

export const saveToStorage = (key: string, value: any) => {
  if (typeof window === 'undefined') return;
  
  console.log('💾 Efficiently saving to storage:', key);
  
  try {
    let dataToSave = value;
    
    // Apply efficient compression ONLY for quote arrays
    if (Array.isArray(value) && value.length > 0 && 
        (key.includes('quotes') || key.includes('QUOTES'))) {
      const original = JSON.stringify(value);
      dataToSave = compressQuoteData(value);
      const compressed = JSON.stringify(dataToSave);
      
      const reduction = Math.round((1 - compressed.length / original.length) * 100);
      console.log('🗜️ Compressed', value.length, 'quotes:', reduction + '% size reduction',
        `(${Math.round(original.length/1024)}KB → ${Math.round(compressed.length/1024)}KB)`);
    } else {
      // For non-quote data (like selectedFlowCategories), save as-is
      console.log('💾 Saving non-quote data without compression:', key);
    }
    
    localStorage.setItem(key, JSON.stringify(dataToSave));
    console.log('✅ Successfully saved to localStorage:', key);
    
    // Also save to Firestore asynchronously if enabled
    if (USE_FIRESTORE) {
      saveToFirestoreSync(key, dataToSave);
    }
    
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('🚨 Storage quota exceeded, trying Firestore backup for:', key);
      
      // Try Firestore first for quota exceeded errors
      if (USE_FIRESTORE) {
        try {
          saveToFirestore(key, value).then(() => {
            console.log('✅ Saved to Firestore backup:', key);
          }).catch(firestoreError => {
            console.error('❌ Firestore backup failed:', firestoreError);
            // Fall back to sessionStorage
            trySessionStorageFallback(key, value);
          });
        } catch (firestoreError) {
          console.error('❌ Firestore backup failed:', firestoreError);
          trySessionStorageFallback(key, value);
        }
      } else {
        trySessionStorageFallback(key, value);
      }
    } else {
      console.error('❌ Storage error:', error);
      // Try Firestore for other errors too
      if (USE_FIRESTORE) {
        saveToFirestoreSync(key, value);
      }
    }
  }
};

// Helper function for sessionStorage fallback
const trySessionStorageFallback = (key: string, value: any) => {
  try {
    let fallbackData = value;
    if (Array.isArray(value) && value.length > 0 && 
        (key.includes('quotes') || key.includes('QUOTES'))) {
      // Keep only top 10 most essential quotes
      fallbackData = value.slice(0, 10).map(quote => ({
        id: quote.id || Math.random().toString(36).substr(2, 9),
        planName: quote.planName || quote.plan_name || 'Plan',
        carrierName: quote.carrierName || quote.carrier?.name || 'Carrier',
        monthlyPremium: quote.monthlyPremium || quote.monthly_premium || quote.premium || 0
      }));
    }
    
    sessionStorage.setItem(key, JSON.stringify(fallbackData));
    console.log('✅ Saved to sessionStorage fallback:', key);
    
  } catch (sessionError) {
    console.error('❌ Complete storage failure:', sessionError);
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

// Aggressive cleanup when approaching storage limit
export const aggressiveCleanup = () => {
  try {
    console.log('🧹 Starting aggressive cleanup...');
    
    // Remove all non-essential Medicare data
    const keysToRemove: string[] = [];
    Object.keys(localStorage).forEach(key => {
      // Keep only the most essential keys
      const essential = [
        QUOTE_FORM_DATA_KEY,
        REAL_QUOTES_KEY,
        ADVANTAGE_QUOTES_KEY,
        DRUG_PLAN_QUOTES_KEY,
        DENTAL_QUOTES_KEY,
        HOSPITAL_INDEMNITY_QUOTES_KEY,
        FINAL_EXPENSE_QUOTES_KEY,
        CANCER_INSURANCE_QUOTES_KEY
      ];
      
      if (!essential.includes(key) && key.startsWith('medicare_')) {
        keysToRemove.push(key);
      }
    });
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log('🧹 Removed non-essential data:', key);
    });
    
    console.log('🧹 Aggressive cleanup completed, removed', keysToRemove.length, 'items');
  } catch (error) {
    console.error('Error during aggressive cleanup:', error);
  }
};

// Simple storage size check
export const getStorageSizeInfo = () => {
  if (typeof window === 'undefined') return { size: 0, readable: '0KB' };
  
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  
  return {
    size: total,
    readable: Math.round(total / 1024) + 'KB'
  };
};
