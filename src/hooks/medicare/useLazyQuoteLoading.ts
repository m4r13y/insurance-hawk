import { useCallback } from 'react';
import { 
  loadFromStorage,
  REAL_QUOTES_KEY,
  ADVANTAGE_QUOTES_KEY,
  DRUG_PLAN_QUOTES_KEY,
  DENTAL_QUOTES_KEY,
  HOSPITAL_INDEMNITY_QUOTES_KEY,
  FINAL_EXPENSE_QUOTES_KEY,
  CANCER_INSURANCE_QUOTES_KEY
} from '@/components/medicare-shop/shared';
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
      switch (category) {
        case 'medigap':
          const savedQuotes = await loadFromStorage(REAL_QUOTES_KEY, []);
          if (savedQuotes && Array.isArray(savedQuotes) && savedQuotes.length > 0) {
            setRealQuotes(savedQuotes);
          }
          break;
        case 'advantage':
          const savedAdvantageQuotes = await loadFromStorage(ADVANTAGE_QUOTES_KEY, []);
          if (savedAdvantageQuotes && Array.isArray(savedAdvantageQuotes) && savedAdvantageQuotes.length > 0) {
            setAdvantageQuotes(savedAdvantageQuotes);
          }
          break;
        case 'drug-plan':
          const savedDrugPlanQuotes = await loadFromStorage(DRUG_PLAN_QUOTES_KEY, []);
          if (savedDrugPlanQuotes && Array.isArray(savedDrugPlanQuotes) && savedDrugPlanQuotes.length > 0) {
            setDrugPlanQuotes(savedDrugPlanQuotes);
          }
          break;
        case 'dental':
          const savedDentalQuotes = await loadFromStorage(DENTAL_QUOTES_KEY, []);
          if (savedDentalQuotes && Array.isArray(savedDentalQuotes) && savedDentalQuotes.length > 0) {
            setDentalQuotes(savedDentalQuotes);
          }
          break;
        case 'hospital-indemnity':
          const savedHospitalQuotes = await loadFromStorage(HOSPITAL_INDEMNITY_QUOTES_KEY, []);
          if (savedHospitalQuotes && Array.isArray(savedHospitalQuotes) && savedHospitalQuotes.length > 0) {
            // Check if optimization is needed
            const firstQuote = savedHospitalQuotes[0];
            if (firstQuote?.planName) {
              setHospitalIndemnityQuotes(savedHospitalQuotes);
            } else if (firstQuote?.plan_name) {
              const optimized = optimizeHospitalIndemnityQuotes(savedHospitalQuotes);
              setHospitalIndemnityQuotes(optimized);
            }
          }
          break;
        case 'final-expense':
          const savedFinalExpenseQuotes = await loadFromStorage(FINAL_EXPENSE_QUOTES_KEY, []);
          if (savedFinalExpenseQuotes && Array.isArray(savedFinalExpenseQuotes) && savedFinalExpenseQuotes.length > 0) {
            setFinalExpenseQuotes(savedFinalExpenseQuotes);
          }
          break;
        case 'cancer':
          const savedCancerQuotes = await loadFromStorage(CANCER_INSURANCE_QUOTES_KEY, []);
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
