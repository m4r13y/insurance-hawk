import { useCallback } from 'react';
import { 
  REAL_QUOTES_KEY,
  ADVANTAGE_QUOTES_KEY,
  DRUG_PLAN_QUOTES_KEY,
  DENTAL_QUOTES_KEY,
  HOSPITAL_INDEMNITY_QUOTES_KEY,
  FINAL_EXPENSE_QUOTES_KEY,
  CANCER_INSURANCE_QUOTES_KEY
} from '@/components/medicare-shop/shared';
import { cancelCategoryRequests, loadTemporaryData } from '@/lib/services/temporary-storage';
import { optimizeHospitalIndemnityQuotes } from '@/lib/hospital-indemnity-quote-optimizer';
import type { QuoteActions } from './useQuoteManagement';

export const useLazyQuoteLoading = (quoteActions: QuoteActions) => {
  const {
    setRealQuotes,
    setAdvantageQuotes,
    setDrugPlanQuotes,
    setDentalQuotes,
    setHospitalIndemnityQuotes,
    setFinalExpenseQuotes,
    setCancerInsuranceQuotes,
  } = quoteActions;

  const loadQuotesForCategory = useCallback(async (category: string) => {
    try {
      
      // Cancel requests for OTHER categories to prevent race conditions
      const allCategories = ['medigap', 'advantage', 'drug-plan', 'dental', 'cancer', 'hospital-indemnity', 'final-expense'];
      allCategories.filter(cat => cat !== category).forEach(cat => {
        cancelCategoryRequests(cat);
      });
      
      switch (category) {
        case 'medigap':
          const savedQuotes = await loadTemporaryData(REAL_QUOTES_KEY, []);
          console.log('🔍 Raw Firestore data for medigap:', {
            type: typeof savedQuotes,
            isArray: Array.isArray(savedQuotes),
            length: savedQuotes?.length,
            firstItem: savedQuotes?.[0],
            keys: savedQuotes?.[0] ? Object.keys(savedQuotes[0]) : 'no first item'
          });
          if (savedQuotes && Array.isArray(savedQuotes) && savedQuotes.length > 0) {
            console.log('✅ Setting realQuotes with', savedQuotes.length, 'quotes');
            setRealQuotes(savedQuotes);
          } else {
            console.log('❌ No valid quotes to set - savedQuotes:', savedQuotes);
          }
          break;
        case 'advantage':
          const savedAdvantageQuotes = await loadTemporaryData(ADVANTAGE_QUOTES_KEY, []);
          if (savedAdvantageQuotes && Array.isArray(savedAdvantageQuotes) && savedAdvantageQuotes.length > 0) {
            setAdvantageQuotes(savedAdvantageQuotes);
          }
          break;
        case 'drug-plan':
          const savedDrugPlanQuotes = await loadTemporaryData(DRUG_PLAN_QUOTES_KEY, []);
          if (savedDrugPlanQuotes && Array.isArray(savedDrugPlanQuotes) && savedDrugPlanQuotes.length > 0) {
            setDrugPlanQuotes(savedDrugPlanQuotes);
          }
          break;
        case 'dental':
          const savedDentalQuotes = await loadTemporaryData(DENTAL_QUOTES_KEY, []);
          if (savedDentalQuotes && Array.isArray(savedDentalQuotes) && savedDentalQuotes.length > 0) {
            setDentalQuotes(savedDentalQuotes);
          }
          break;
        case 'hospital-indemnity':
          const savedHospitalQuotes = await loadTemporaryData(HOSPITAL_INDEMNITY_QUOTES_KEY, []);
          if (savedHospitalQuotes && Array.isArray(savedHospitalQuotes) && savedHospitalQuotes.length > 0) {
            // Check if optimization is needed
            const firstQuote = savedHospitalQuotes[0] as any;
            if (firstQuote?.planName) {
              setHospitalIndemnityQuotes(savedHospitalQuotes);
            } else if (firstQuote?.plan_name) {
              const optimized = optimizeHospitalIndemnityQuotes(savedHospitalQuotes);
              setHospitalIndemnityQuotes(optimized);
            }
          }
          break;
        case 'final-expense':
          const savedFinalExpenseQuotes = await loadTemporaryData(FINAL_EXPENSE_QUOTES_KEY, []);
          if (savedFinalExpenseQuotes && Array.isArray(savedFinalExpenseQuotes) && savedFinalExpenseQuotes.length > 0) {
            setFinalExpenseQuotes(savedFinalExpenseQuotes);
          }
          break;
        case 'cancer':
          const savedCancerQuotes = await loadTemporaryData(CANCER_INSURANCE_QUOTES_KEY, []);
          if (savedCancerQuotes && Array.isArray(savedCancerQuotes) && savedCancerQuotes.length > 0) {
            setCancerInsuranceQuotes(savedCancerQuotes);
          }
          break;
      }
    } catch (error) {
      console.error(`Error loading quotes for category ${category}:`, error);
    }
  }, [
    setRealQuotes,
    setAdvantageQuotes,
    setDrugPlanQuotes,
    setDentalQuotes,
    setHospitalIndemnityQuotes,
    setFinalExpenseQuotes,
    setCancerInsuranceQuotes,
  ]);

  return { loadQuotesForCategory };
};
