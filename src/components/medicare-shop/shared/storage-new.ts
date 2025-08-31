// Storage keys - now using Firestore temp database as the ONLY storage
export const QUOTE_FORM_DATA_KEY = 'medicare_quote_form_data';
export const QUOTE_FORM_COMPLETED_KEY = 'medicare_quote_form_completed';
export const REAL_QUOTES_KEY = 'medicare_real_quotes';
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

// Firestore-only configuration
const MAX_QUOTE_SIZE = 1000; // Maximum number of quotes per category
const MAX_VISITOR_AGE_HOURS = 24; // Maximum visitor session length

// Storage helper functions - using ONLY Firestore temp database
export const loadFromStorage = async (key: string, defaultValue: any) => {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    console.log('🔥 Loading from Firestore temp database:', key);
    const data = await loadFromFirestore(key, defaultValue);
    
    if (data !== defaultValue) {
      console.log('✅ Successfully loaded from Firestore:', key);
      return data;
    } else {
      console.log('📭 No data found in Firestore for:', key);
      return defaultValue;
    }
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
  
  console.log('🔥 Saving to Firestore temp database:', key);
  
  try {
    let dataToSave = value;
    
    // Apply compression ONLY for very large quote arrays
    if (Array.isArray(value) && value.length > 50 && 
        (key.includes('quotes') || key.includes('QUOTES'))) {
      const original = JSON.stringify(value);
      dataToSave = compressQuoteData(value);
      const compressed = JSON.stringify(dataToSave);
      
      const reduction = Math.round((1 - compressed.length / original.length) * 100);
      console.log('🗜️ Compressed', value.length, 'quotes:', reduction + '% size reduction',
        `(${Math.round(original.length/1024)}KB → ${Math.round(compressed.length/1024)}KB)`);
    } else {
      console.log('💾 Saving data without compression:', key);
    }
    
    // Save to Firestore temp database
    await saveToFirestore(key, dataToSave);
    console.log('✅ Successfully saved to Firestore temp database:', key);
    
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

// Check if quotes exist (async version for Firestore)
export const hasQuotes = async (): Promise<boolean> => {
  try {
    const [
      realQuotes,
      advantageQuotes,
      drugPlanQuotes,
      dentalQuotes,
      hospitalIndemnityQuotes,
      finalExpenseQuotes,
      cancerInsuranceQuotes
    ] = await Promise.all([
      loadFromStorage(REAL_QUOTES_KEY, []),
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
    const [
      realQuotes,
      advantageQuotes,
      drugPlanQuotes,
      dentalQuotes,
      hospitalIndemnityQuotes,
      finalExpenseQuotes,
      cancerInsuranceQuotes
    ] = await Promise.all([
      loadFromStorage(REAL_QUOTES_KEY, []),
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

// Clear all quote data from Firestore
export const clearAllQuotes = async () => {
  console.log('🧹 Clearing all quotes from Firestore temp database...');
  
  try {
    await Promise.all([
      saveToStorage(REAL_QUOTES_KEY, []),
      saveToStorage(ADVANTAGE_QUOTES_KEY, []),
      saveToStorage(DRUG_PLAN_QUOTES_KEY, []),
      saveToStorage(DENTAL_QUOTES_KEY, []),
      saveToStorage(HOSPITAL_INDEMNITY_QUOTES_KEY, []),
      saveToStorage(FINAL_EXPENSE_QUOTES_KEY, []),
      saveToStorage(CANCER_INSURANCE_QUOTES_KEY, []),
      saveToStorage(FILTER_STATE_KEY, {}),
      saveToStorage(QUOTE_FORM_COMPLETED_KEY, false)
    ]);
    
    console.log('✅ All quotes cleared from Firestore');
  } catch (error) {
    console.error('❌ Error clearing quotes:', error);
  }
};

// Get Firestore storage info (estimates)
export const getFirestoreStorageInfo = async () => {
  try {
    console.log('📊 Checking Firestore storage usage...');
    
    const [
      formData,
      realQuotes,
      advantageQuotes,
      drugPlanQuotes,
      dentalQuotes,
      hospitalIndemnityQuotes,
      finalExpenseQuotes,
      cancerInsuranceQuotes,
      filterState
    ] = await Promise.all([
      loadFromStorage(QUOTE_FORM_DATA_KEY, {}),
      loadFromStorage(REAL_QUOTES_KEY, []),
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

// Legacy localStorage cleanup (for migration)
export const migrateLegacyStorage = async () => {
  if (typeof window === 'undefined') return;
  
  console.log('🔄 Checking for legacy localStorage data to migrate...');
  
  try {
    const legacyKeys = [
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

    let migratedCount = 0;
    
    for (const key of legacyKeys) {
      const localData = localStorage.getItem(key);
      if (localData) {
        try {
          const parsedData = JSON.parse(localData);
          await saveToStorage(key, parsedData);
          localStorage.removeItem(key); // Remove after successful migration
          migratedCount++;
          console.log('✅ Migrated legacy data:', key);
        } catch (error) {
          console.warn('Failed to migrate:', key, error);
        }
      }
    }
    
    if (migratedCount > 0) {
      console.log(`🎉 Successfully migrated ${migratedCount} items from localStorage to Firestore`);
    } else {
      console.log('ℹ️ No legacy localStorage data found to migrate');
    }
    
    return migratedCount;
  } catch (error) {
    console.error('Error during legacy storage migration:', error);
    return 0;
  }
};
