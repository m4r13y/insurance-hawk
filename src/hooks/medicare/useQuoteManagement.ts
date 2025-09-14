import { useState, useCallback } from 'react';
import type { OptimizedDentalQuote } from '@/lib/dental-quote-optimizer';
import type { OptimizedHospitalIndemnityQuote } from '@/lib/hospital-indemnity-quote-optimizer';

export interface QuoteState {
  realQuotes: any[];
  advantageQuotes: any[];
  drugPlanQuotes: any[];
  dentalQuotes: OptimizedDentalQuote[];
  hospitalIndemnityQuotes: OptimizedHospitalIndemnityQuote[];
  finalExpenseQuotes: any[];
  cancerInsuranceQuotes: any[];
}

export interface QuoteActions {
  setRealQuotes: React.Dispatch<React.SetStateAction<any[]>>;
  setAdvantageQuotes: React.Dispatch<React.SetStateAction<any[]>>;
  setDrugPlanQuotes: React.Dispatch<React.SetStateAction<any[]>>;
  setDentalQuotes: React.Dispatch<React.SetStateAction<OptimizedDentalQuote[]>>;
  setHospitalIndemnityQuotes: React.Dispatch<React.SetStateAction<OptimizedHospitalIndemnityQuote[]>>;
  setFinalExpenseQuotes: React.Dispatch<React.SetStateAction<any[]>>;
  setCancerInsuranceQuotes: React.Dispatch<React.SetStateAction<any[]>>;
  clearAllQuotes: () => void;
  hasQuotes: () => boolean;
  getQuotesForCategory: (category: string) => any[];
}

import { hasQuotes as hasQuotesFromStorage } from '@/components/medicare-shop/shared';

export const useQuoteManagement = () => {
  // Quote state
  const [realQuotes, setRealQuotes] = useState<any[]>([]);
  const [advantageQuotes, setAdvantageQuotes] = useState<any[]>([]);
  const [drugPlanQuotes, setDrugPlanQuotes] = useState<any[]>([]);
  const [dentalQuotes, setDentalQuotes] = useState<OptimizedDentalQuote[]>([]);
  const [hospitalIndemnityQuotes, setHospitalIndemnityQuotes] = useState<OptimizedHospitalIndemnityQuote[]>([]);
  const [finalExpenseQuotes, setFinalExpenseQuotes] = useState<any[]>([]);
  const [cancerInsuranceQuotes, setCancerInsuranceQuotes] = useState<any[]>([]);

  // Helper functions
  const clearAllQuotes = useCallback(() => {
    setRealQuotes([]);
    setAdvantageQuotes([]);
    setDrugPlanQuotes([]);
    setDentalQuotes([]);
    setHospitalIndemnityQuotes([]);
    setFinalExpenseQuotes([]);
    setCancerInsuranceQuotes([]);
  }, []);

  const hasQuotes = useCallback(() => {
    // Fast check using medicare_quote_form_data - much faster than checking all quote arrays
    return hasQuotesFromStorage();
  }, []);

  const getQuotesForCategory = useCallback((category: string) => {
    switch (category) {
      case 'medigap': return realQuotes;
      case 'advantage': return advantageQuotes;
      case 'drug-plan': return drugPlanQuotes;
      case 'dental': return dentalQuotes;
      case 'hospital-indemnity': return hospitalIndemnityQuotes;
      case 'final-expense': return finalExpenseQuotes;
      case 'cancer': return cancerInsuranceQuotes;
      default: return [];
    }
  }, [realQuotes, advantageQuotes, drugPlanQuotes, dentalQuotes, hospitalIndemnityQuotes, finalExpenseQuotes, cancerInsuranceQuotes]);

  const quoteState: QuoteState = {
    realQuotes,
    advantageQuotes,
    drugPlanQuotes,
    dentalQuotes,
    hospitalIndemnityQuotes,
    finalExpenseQuotes,
    cancerInsuranceQuotes,
  };

  const quoteActions: QuoteActions = {
    setRealQuotes,
    setAdvantageQuotes,
    setDrugPlanQuotes,
    setDentalQuotes,
    setHospitalIndemnityQuotes,
    setFinalExpenseQuotes,
    setCancerInsuranceQuotes,
    clearAllQuotes,
    hasQuotes,
    getQuotesForCategory,
  };

  return {
    ...quoteState,
    ...quoteActions,
  };
};
