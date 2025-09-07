// Storage keys - Firestore for quotes, localStorage for UI state
export const QUOTE_FORM_DATA_KEY = 'medicare_quote_form_data';
export const QUOTE_FORM_COMPLETED_KEY = 'medicare_quote_form_completed';
export const REAL_QUOTES_KEY = 'medicare_real_quotes';

// Individual plan storage keys for better separation
export const REAL_QUOTES_PLAN_F_KEY = 'medicare_real_quotes_plan_f';
export const REAL_QUOTES_PLAN_G_KEY = 'medicare_real_quotes_plan_g';
export const REAL_QUOTES_PLAN_N_KEY = 'medicare_real_quotes_plan_n';

export const ADVANTAGE_QUOTES_KEY = 'medicare_advantage_quotes';
export const DRUG_PLAN_QUOTES_KEY = 'medicare_drug_plan_quotes';
export const DENTAL_QUOTES_KEY = 'medicare_dental_quotes';
export const HOSPITAL_INDEMNITY_QUOTES_KEY = 'medicare_hospital_indemnity_quotes';
export const FINAL_EXPENSE_QUOTES_KEY = 'medicare_final_expense_quotes';
export const CANCER_INSURANCE_QUOTES_KEY = 'medicare_cancer_insurance_quotes';
export const FILTER_STATE_KEY = 'medicare_filter_state';

// Helper functions for plan-specific storage
export const getMedigapStorageKey = (planType: string): string => {
  const normalizedPlan = planType.toLowerCase().replace(/[^a-z]/g, '');
  switch (normalizedPlan) {
    case 'f':
    case 'planf':
      return REAL_QUOTES_PLAN_F_KEY;
    case 'g':
    case 'plang':
      return REAL_QUOTES_PLAN_G_KEY;
    case 'n':
    case 'plann':
      return REAL_QUOTES_PLAN_N_KEY;
    default:
      return `medicare_real_quotes_${normalizedPlan}`;
  }
};

export const getAllMedigapStorageKeys = (): string[] => {
  return [REAL_QUOTES_PLAN_F_KEY, REAL_QUOTES_PLAN_G_KEY, REAL_QUOTES_PLAN_N_KEY];
};

// UI state keys - stored in localStorage for instant access
export const SELECTED_CATEGORIES_KEY = 'medicare_selected_categories';
export const CURRENT_FLOW_STEP_KEY = 'medicare_current_flow_step';
export const UI_STATE_KEY = 'medicare_ui_state';

// Import Firestore storage functions
import { 
  saveToStorage as saveToFirestore, 
  loadFromStorage as loadFromFirestore,
  saveToStorageSync as saveToFirestoreSync
} from '@/lib/services/storage-bridge';

// Firestore-only configuration for quote data
const MAX_QUOTE_SIZE = 1000; // Maximum number of quotes per category
const MAX_VISITOR_AGE_HOURS = 24; // Maximum visitor session length

// === UI STATE FUNCTIONS (localStorage for instant access) ===

// Save UI state to localStorage (categories, flow state, etc.)
export const saveUIState = (key: string, value: any) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to save UI state:', key, error);
  }
};

// Load UI state from localStorage 
export const loadUIState = (key: string, defaultValue: any) => {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
    return defaultValue;
  } catch (error) {
    console.warn('Failed to load UI state:', key, error);
    return defaultValue;
  }
};

// Save selected categories to localStorage for instant UI updates
export const saveSelectedCategories = (categories: string[]) => {
  saveUIState(SELECTED_CATEGORIES_KEY, categories);
};

// Load selected categories from localStorage
export const loadSelectedCategories = (): string[] => {
  return loadUIState(SELECTED_CATEGORIES_KEY, []);
};

// Save current flow step for navigation persistence
export const saveCurrentFlowStep = (step: string) => {
  saveUIState(CURRENT_FLOW_STEP_KEY, step);
};

// Load current flow step
export const loadCurrentFlowStep = (): string => {
  return loadUIState(CURRENT_FLOW_STEP_KEY, 'category-selection');
};

// === QUOTE DATA FUNCTIONS (Firestore for reliable persistence) ===

// Storage helper functions - using ONLY Firestore temp database
export const loadFromStorage = async (key: string, defaultValue: any) => {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const data = await loadFromFirestore(key, defaultValue);
    return data !== defaultValue ? data : defaultValue;
  } catch (error) {
    console.error('❌ Error loading from Firestore:', key, error);
    return defaultValue;
  }
};

// Synchronous version for immediate access (returns Promise)
export const loadFromStorageSync = (key: string, defaultValue: any): Promise<any> => {
  return loadFromStorage(key, defaultValue);
};

// Async version for when you can wait for Firestore (this is now the main function)
export const loadFromStorageAsync = async (key: string, defaultValue: any) => {
  return await loadFromStorage(key, defaultValue);
};

// Conservative quote compression - only for very large datasets
export const compressQuoteData = (quotes: any[]): any[] => {
  if (!Array.isArray(quotes)) return quotes;
  
  // Only compress if we have more than 50 quotes to avoid unnecessary processing
  if (quotes.length <= 50) return quotes;
  
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
    
    // Keep essential arrays but limit size
    if (compressed.benefits && Array.isArray(compressed.benefits) && compressed.benefits.length > 10) {
      compressed.benefits = compressed.benefits.slice(0, 10);
    }
    
    if (compressed.features && Array.isArray(compressed.features) && compressed.features.length > 10) {
      compressed.features = compressed.features.slice(0, 10);
    }
    
    // Keep essential objects
    if (compressed.basePlans && Array.isArray(compressed.basePlans)) {
      compressed.basePlans = compressed.basePlans.map((plan: any) => ({
        ...plan,
        benefitOptions: plan.benefitOptions || []
      }));
    }
    
    // Keep essential numeric fields
    const numericFields = ['benefit_amount', 'face_value', 'monthly_rate', 'annual_rate', 'annualMaximum', 'dailyBenefit', 'maxDays', 'reviewCount', 'monthlyPremium', 'premium', 'policyFee', 'hhDiscount'];
    numericFields.forEach(field => {
      if (compressed[field] !== undefined && compressed[field] !== null && compressed[field] !== '') {
        compressed[field] = Number(compressed[field]) || 0;
      }
    });
    
    return compressed;
  });
};

export const saveToStorage = async (key: string, value: any) => {
  if (typeof window === 'undefined') return;
  
  try {
    let dataToSave = value;
    
    // Apply compression ONLY for very large quote arrays
    if (Array.isArray(value) && value.length > 50 && 
        (key.includes('quotes') || key.includes('QUOTES'))) {
      const original = JSON.stringify(value);
      dataToSave = compressQuoteData(value);
      const compressed = JSON.stringify(dataToSave);
      
      const reduction = Math.round((1 - compressed.length / original.length) * 100);
      console.log('🗜️ Compressed', value.length, 'quotes:', reduction + '% size reduction');
    }
    
    // Save to Firestore temp database
    await saveToFirestore(key, dataToSave);
    
  } catch (error) {
    console.error('❌ Firestore save error:', key, error);
    if (error instanceof Error && error.message.includes('permission')) {
      console.error('🚨 Firebase permissions error - check security rules');
    }
    throw error; // Re-throw to let calling code handle the error
  }
};

// Synchronous save function (returns Promise)
export const saveToStorageSync = (key: string, value: any): Promise<void> => {
  return saveToStorage(key, value);
};

// Check if quotes exist by checking for visitor_id presence
// visitor_id is only created when quotes are generated, so it's a reliable indicator
export const hasQuotes = (): boolean => {
  try {
    // Check for visitor_id in localStorage - this is only set when quotes are created
    const visitorId = localStorage.getItem('visitor_id');
    return !!visitorId;
  } catch (error) {
    console.error('Error checking quotes:', error);
    return false;
  }
};

// Async version that actually checks Firestore (use sparingly)
export const hasQuotesAsync = async (): Promise<boolean> => {
  try {
    // Check medigap quotes from plan-specific collections
    const planStorageKeys = getAllMedigapStorageKeys();
    const medigapLoadPromises = planStorageKeys.map(key => loadFromStorage(key, []));
    const medigapQuotesArrays = await Promise.all(medigapLoadPromises);
    const realQuotes = medigapQuotesArrays.flat();
    
    const [
      advantageQuotes,
      drugPlanQuotes,
      dentalQuotes,
      hospitalIndemnityQuotes,
      finalExpenseQuotes,
      cancerInsuranceQuotes
    ] = await Promise.all([
      loadFromStorage(ADVANTAGE_QUOTES_KEY, []),
      loadFromStorage(DRUG_PLAN_QUOTES_KEY, []),
      loadFromStorage(DENTAL_QUOTES_KEY, []),
      loadFromStorage(HOSPITAL_INDEMNITY_QUOTES_KEY, []),
      loadFromStorage(FINAL_EXPENSE_QUOTES_KEY, []),
      loadFromStorage(CANCER_INSURANCE_QUOTES_KEY, [])
    ]);

    return realQuotes.length > 0 || 
           advantageQuotes.length > 0 ||
           drugPlanQuotes.length > 0 ||
           dentalQuotes.length > 0 ||
           hospitalIndemnityQuotes.length > 0 ||
           finalExpenseQuotes.length > 0 ||
           cancerInsuranceQuotes.length > 0;
  } catch (error) {
    console.error('Error checking quotes:', error);
    return false;
  }
};

// Get all quotes count (async)
export const getAllQuotesCount = async (): Promise<number> => {
  try {
    // Load medigap quotes from plan-specific collections
    const planStorageKeys = getAllMedigapStorageKeys();
    const medigapLoadPromises = planStorageKeys.map(key => loadFromStorage(key, []));
    const medigapQuotesArrays = await Promise.all(medigapLoadPromises);
    const realQuotes = medigapQuotesArrays.flat();
    
    const [
      advantageQuotes,
      drugPlanQuotes,
      dentalQuotes,
      hospitalIndemnityQuotes,
      finalExpenseQuotes,
      cancerInsuranceQuotes
    ] = await Promise.all([
      loadFromStorage(ADVANTAGE_QUOTES_KEY, []),
      loadFromStorage(DRUG_PLAN_QUOTES_KEY, []),
      loadFromStorage(DENTAL_QUOTES_KEY, []),
      loadFromStorage(HOSPITAL_INDEMNITY_QUOTES_KEY, []),
      loadFromStorage(FINAL_EXPENSE_QUOTES_KEY, []),
      loadFromStorage(CANCER_INSURANCE_QUOTES_KEY, [])
    ]);

    return realQuotes.length + 
           advantageQuotes.length +
           drugPlanQuotes.length +
           dentalQuotes.length +
           hospitalIndemnityQuotes.length +
           finalExpenseQuotes.length +
           cancerInsuranceQuotes.length;
  } catch (error) {
    console.error('Error getting quotes count:', error);
    return 0;
  }
};

// Clear all quote data from Firestore AND UI state from localStorage
export const clearAllQuotes = async () => {
  try {
    // Clear quote data from Firestore - Use sequential operations instead of Promise.all to prevent overwhelming Firestore
    
    await saveToStorage(REAL_QUOTES_KEY, []);
    await saveToStorage(ADVANTAGE_QUOTES_KEY, []);
    await saveToStorage(DRUG_PLAN_QUOTES_KEY, []);
    await saveToStorage(DENTAL_QUOTES_KEY, []);
    await saveToStorage(HOSPITAL_INDEMNITY_QUOTES_KEY, []);
    await saveToStorage(FINAL_EXPENSE_QUOTES_KEY, []);
    await saveToStorage(CANCER_INSURANCE_QUOTES_KEY, []);
    await saveToStorage(FILTER_STATE_KEY, {});
    await saveToStorage(QUOTE_FORM_COMPLETED_KEY, false);
    
    // Clear UI state from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SELECTED_CATEGORIES_KEY);
      localStorage.removeItem(CURRENT_FLOW_STEP_KEY);
      localStorage.removeItem(UI_STATE_KEY);
      
      // Clear session indicators
      localStorage.removeItem('medicare_quote_form_completed');
      localStorage.removeItem('medicare_quote_session_active');
    }
    
  } catch (error) {
    console.error('❌ Error clearing quotes and UI state:', error);
  }
};

// Get Firestore storage info (estimates)
export const getFirestoreStorageInfo = async () => {
  try {
    // Load medigap quotes from plan-specific collections
    const planStorageKeys = getAllMedigapStorageKeys();
    const medigapLoadPromises = planStorageKeys.map(key => loadFromStorage(key, []));
    const medigapQuotesArrays = await Promise.all(medigapLoadPromises);
    const realQuotes = medigapQuotesArrays.flat();
    
    const [
      formData,
      advantageQuotes,
      drugPlanQuotes,
      dentalQuotes,
      hospitalIndemnityQuotes,
      finalExpenseQuotes,
      cancerInsuranceQuotes,
      filterState
    ] = await Promise.all([
      loadFromStorage(QUOTE_FORM_DATA_KEY, {}),
      loadFromStorage(ADVANTAGE_QUOTES_KEY, []),
      loadFromStorage(DRUG_PLAN_QUOTES_KEY, []),
      loadFromStorage(DENTAL_QUOTES_KEY, []),
      loadFromStorage(HOSPITAL_INDEMNITY_QUOTES_KEY, []),
      loadFromStorage(FINAL_EXPENSE_QUOTES_KEY, []),
      loadFromStorage(CANCER_INSURANCE_QUOTES_KEY, []),
      loadFromStorage(FILTER_STATE_KEY, {})
    ]);

    const totalQuotes = realQuotes.length + advantageQuotes.length + drugPlanQuotes.length + 
                       dentalQuotes.length + hospitalIndemnityQuotes.length + 
                       finalExpenseQuotes.length + cancerInsuranceQuotes.length;

    // Estimate storage size
    const estimatedSize = JSON.stringify({
      formData,
      realQuotes,
      advantageQuotes,
      drugPlanQuotes,
      dentalQuotes,
      hospitalIndemnityQuotes,
      finalExpenseQuotes,
      cancerInsuranceQuotes,
      filterState
    }).length;

    return {
      totalQuotes,
      categories: {
        medigap: realQuotes.length,
        advantage: advantageQuotes.length,
        drugPlan: drugPlanQuotes.length,
        dental: dentalQuotes.length,
        hospitalIndemnity: hospitalIndemnityQuotes.length,
        finalExpense: finalExpenseQuotes.length,
        cancerInsurance: cancerInsuranceQuotes.length
      },
      estimatedSize,
      readable: Math.round(estimatedSize / 1024) + 'KB',
      hasData: totalQuotes > 0 || Object.keys(formData).length > 0
    };
  } catch (error) {
    console.error('Error getting Firestore storage info:', error);
    return {
      totalQuotes: 0,
      categories: {},
      estimatedSize: 0,
      readable: '0KB',
      hasData: false,
      error: (error as Error).message
    };
  }
};

// Legacy localStorage migration (quotes to Firestore, UI state remains local)
export const migrateLegacyStorage = async () => {
  if (typeof window === 'undefined') return;
  
  // Check if migration has already been completed for this visitor
  const migrationCompleted = localStorage.getItem('migration_completed');
  if (migrationCompleted === 'true') {
    return; // Skip migration if already completed
  }
  
  try {
    // Quote data keys - migrate to Firestore
    const quoteKeys = [
      QUOTE_FORM_DATA_KEY,
      REAL_QUOTES_KEY,
      ADVANTAGE_QUOTES_KEY,
      DRUG_PLAN_QUOTES_KEY,
      DENTAL_QUOTES_KEY,
      HOSPITAL_INDEMNITY_QUOTES_KEY,
      FINAL_EXPENSE_QUOTES_KEY,
      CANCER_INSURANCE_QUOTES_KEY,
      FILTER_STATE_KEY,
      QUOTE_FORM_COMPLETED_KEY
    ];

    // UI state keys - keep in localStorage (just clean up old formats)
    const uiKeys = [
      'medicare_flow_categories', // old key
      'medicare_selected_flow_categories', // old key  
      'selectedFlowCategories' // very old key
    ];

    let migratedCount = 0;
    
    // Migrate quote data to Firestore
    for (const key of quoteKeys) {
      const localData = localStorage.getItem(key);
      if (localData) {
        try {
          const parsedData = JSON.parse(localData);
          await saveToStorage(key, parsedData);
          localStorage.removeItem(key); // Remove after successful migration
          migratedCount++;
        } catch (error) {
          console.warn('Failed to migrate quote data:', key, error);
        }
      }
    }
    
    // Clean up old UI state keys and consolidate
    let hasUIData = false;
    for (const oldKey of uiKeys) {
      const localData = localStorage.getItem(oldKey);
      if (localData) {
        try {
          const parsedData = JSON.parse(localData);
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            saveSelectedCategories(parsedData);
            hasUIData = true;
          }
          localStorage.removeItem(oldKey); // Clean up old key
        } catch (error) {
          console.warn('Failed to migrate UI state:', oldKey, error);
        }
      }
    }
    
    // Mark migration as completed to prevent repeated migrations
    localStorage.setItem('migration_completed', 'true');
    
    return { quotesMigrated: migratedCount, uiMigrated: hasUIData };
  } catch (error) {
    console.error('Error during legacy storage migration:', error);
    return { quotesMigrated: 0, uiMigrated: false };
  }
};

// === PLAN-SPECIFIC STORAGE FUNCTIONS ===

// Get storage key for specific plan type
export const getPlanStorageKey = (planType: string): string => {
  switch (planType.toUpperCase()) {
    case 'F': return REAL_QUOTES_PLAN_F_KEY;
    case 'G': return REAL_QUOTES_PLAN_G_KEY;
    case 'N': return REAL_QUOTES_PLAN_N_KEY;
    default: return REAL_QUOTES_KEY; // Fallback to general key
  }
};

// Save quotes for a specific plan type
export const savePlanQuotes = async (planType: string, quotes: any[]) => {
  const storageKey = getPlanStorageKey(planType);
  await saveToStorage(storageKey, quotes);
  console.log(`💾 Saved ${quotes.length} quotes for Plan ${planType} to ${storageKey}`);
};

// Load quotes for a specific plan type
export const loadPlanQuotes = async (planType: string): Promise<any[]> => {
  const storageKey = getPlanStorageKey(planType);
  const quotes = await loadFromStorage(storageKey, []);
  console.log(`📄 Loaded ${quotes.length} quotes for Plan ${planType} from ${storageKey}`);
  return quotes;
};

// Load all plan quotes and combine them
export const loadAllPlanQuotes = async (): Promise<{ all: any[], byPlan: Record<string, any[]> }> => {
  const planF = await loadPlanQuotes('F');
  const planG = await loadPlanQuotes('G');
  const planN = await loadPlanQuotes('N');
  
  const byPlan = { F: planF, G: planG, N: planN };
  const all = [...planF, ...planG, ...planN];
  
  console.log(`📊 Loaded quotes - F: ${planF.length}, G: ${planG.length}, N: ${planN.length}, Total: ${all.length}`);
  return { all, byPlan };
};

// Clear quotes for a specific plan type
export const clearPlanQuotes = async (planType: string) => {
  const storageKey = getPlanStorageKey(planType);
  await saveToStorage(storageKey, []);
  console.log(`🧹 Cleared quotes for Plan ${planType}`);
};
