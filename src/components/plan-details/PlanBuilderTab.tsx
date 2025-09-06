import React, { useState, useEffect } from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { CheckIcon, Pencil1Icon, InfoCircledIcon, ResetIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import { getCarrierLogoUrl, getCarrierDisplayName } from "@/lib/carrier-system";
import { getMedigapQuotes } from "@/lib/actions/medigap-quotes";
import { getDrugPlanQuotes } from "@/lib/actions/drug-plan-quotes";
import { getDentalQuotes } from "@/lib/actions/dental-quotes";
import { getCancerInsuranceQuotes, type CancerInsuranceQuoteParams } from "@/lib/actions/cancer-insurance-quotes";
import { consolidateQuoteVariations } from "@/lib/plan-consolidation";
import { processOptionsForDisplay } from "@/lib/medigap-utils";
import { QuoteData } from './types';
import { loadFromStorage, saveToStorage, QUOTE_FORM_DATA_KEY, DRUG_PLAN_QUOTES_KEY, DENTAL_QUOTES_KEY, CANCER_INSURANCE_QUOTES_KEY } from "@/components/medicare-shop/shared/storage";
import { type QuoteFormData } from "@/components/medicare-shop/shared/types";
import { MissingFieldsModal } from "@/components/shared/MissingFieldsModal";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { optimizeDentalQuotes, OptimizedDentalQuote } from "@/lib/dental-quote-optimizer";
import { savePlanBuilderData, loadPlanBuilderData, PlanBuilderData } from "@/lib/services/temporary-storage";
import { Timestamp } from 'firebase/firestore';
import { useDiscountState } from "@/lib/services/discount-state";

interface PlanConfiguration {
  ratingClass: string;
  discounts: string[];
}

interface PlanBuilderTabProps {
  quoteData: QuoteData;
  carrierQuotes?: QuoteData[];
  formatCurrency: (amount: number) => string;
  calculateDiscountedRate: (rate: number, discounts: any[]) => number;
  currentSelection?: PlanConfiguration;
  getCurrentRate?: () => number | null;
  hasUserSelection?: boolean;
}

// Helper function for rating colors
const getRatingColor = (rating: string) => {
  switch (rating.toLowerCase()) {
    case 'a++':
    case 'a+':
      return 'text-green-600';
    case 'a':
    case 'a-':
      return 'text-green-500';
    case 'b++':
    case 'b+':
    case 'b':
      return 'text-yellow-600';
    case 'b-':
    case 'c++':
    case 'c+':
      return 'text-orange-600';
    default:
      return 'text-gray-500';
  }
};

// Helper functions for validating required fields (same logic as MissingFieldsModal)
const getRequiredFieldsForCategory = (categoryId: string): string[] => {
  switch (categoryId) {
    case 'dental':
    case 'hospital-indemnity':
    case 'final-expense':
      return ['zipCode'];
    case 'cancer':
      return ['age', 'gender', 'tobaccoUse'];
    case 'medigap':
    default:
      return ['age', 'zipCode', 'gender', 'tobaccoUse'];
  }
};

const getAdditionalFieldsForCategory = (category: string): string[] => {
  switch (category) {
    case 'cancer':
      return ['familyType', 'carcinomaInSitu', 'premiumMode', 'benefitAmount', 'state'];
    case 'dental':
      return ['coveredMembers'];
    case 'final-expense':
      return ['desiredFaceValue'];
    default:
      return [];
  }
};

const validateCategoryData = (category: string, data: any): { isValid: boolean; missing: string[] } => {
  const requiredFields = getRequiredFieldsForCategory(category);
  const additionalFields = getAdditionalFieldsForCategory(category);
  const allRequired = [...requiredFields, ...additionalFields];
  
  const missing = allRequired.filter(field => {
    const value = data[field];
    return value === '' || value === null || value === undefined;
  });

  return {
    isValid: missing.length === 0,
    missing
  };
};

export const PlanBuilderTab: React.FC<PlanBuilderTabProps> = ({
  quoteData,
  carrierQuotes,
  formatCurrency,
  calculateDiscountedRate,
  currentSelection,
  getCurrentRate,
  hasUserSelection = false
}) => {
  const [applyDiscounts, setApplyDiscounts] = useDiscountState();
  const [selectedPlanOption, setSelectedPlanOption] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [realQuotes, setRealQuotes] = useState<QuoteData[]>([]);
  const [generatingQuote, setGeneratingQuote] = useState<string | null>(null);
  
  // Modal states for additional coverage quotes
  const [showDrugPlanModal, setShowDrugPlanModal] = useState(false);
  const [showDentalModal, setShowDentalModal] = useState(false);
  const [showCancerModal, setShowCancerModal] = useState(false);
  
  // Shared missing fields modal state
  const [showMissingFieldsModal, setShowMissingFieldsModal] = useState(false);
  
  // Debug: Watch for unexpected modal state changes
  useEffect(() => {
    console.log('PlanBuilderTab showMissingFieldsModal changed to:', showMissingFieldsModal);
  }, [showMissingFieldsModal]);
  const [selectedCoverageCategory, setSelectedCoverageCategory] = useState<string>('');
  const [coverageDisplayName, setCoverageDisplayName] = useState<string>('');
  const [initialFormDataForModal, setInitialFormDataForModal] = useState<Partial<QuoteFormData>>({});
  const [formDataLoaded, setFormDataLoaded] = useState(false);
  
  // Keep legacy modal for complex fields (medications, dental history, etc.)
  const [showAdditionalInfoModal, setShowAdditionalInfoModal] = useState(false);
  const [currentCoverageType, setCurrentCoverageType] = useState<string>('');
  const [additionalFormData, setAdditionalFormData] = useState<Record<string, any>>({});
  const [missingFields, setMissingFields] = useState<string[]>([]);
  
  // New state for additional coverage quote generation
  const [loadingCoverageTypes, setLoadingCoverageTypes] = useState<string[]>([]);
  const [completedCoverageTypes, setCompletedCoverageTypes] = useState<string[]>([]);
  
  // Additional coverage quotes state
  const [drugPlanQuotes, setDrugPlanQuotes] = useState<any[]>([]);
  const [dentalQuotes, setDentalQuotes] = useState<OptimizedDentalQuote[]>([]);
  const [cancerInsuranceQuotes, setCancerInsuranceQuotes] = useState<any[]>([]);

  // Effect to open modal after form data is loaded
  useEffect(() => {
    if (formDataLoaded && selectedCoverageCategory) {
      console.log('Checking if fields are missing for category:', selectedCoverageCategory);
      console.log('Form data loaded:', initialFormDataForModal);
      
      // Check if any fields are actually missing
      const validation = validateCategoryData(selectedCoverageCategory, initialFormDataForModal);
      console.log('Validation result:', validation);
      
      if (!validation.isValid && validation.missing.length > 0) {
        console.log('Missing fields found, showing modal:', validation.missing);
        setShowMissingFieldsModal(true);
      } else {
        console.log('All required fields present, proceeding with quote generation');
        // All fields are present, proceed directly with quote generation
        handleDirectQuoteGeneration();
      }
      
      setFormDataLoaded(false); // Reset for next time
    }
  }, [formDataLoaded, selectedCoverageCategory]); // Removed initialFormDataForModal to prevent re-triggering

  // Calculate the current selection rate with applied discounts
  const getCurrentSelectionRate = () => {
    // If a plan option is selected, use its rate
    if (selectedPlanOption) {
      return selectedPlanOption.rate?.month || 0;
    }
    
    // Use the parent's rate calculation function if available
    if (getCurrentRate) {
      const rate = getCurrentRate();
      return rate !== null ? rate : null; // Return null if no selection made
    }
    
    // Return null if no selection has been made
    return null;
  };
  
  // Selected additional coverage plans
  const [selectedDrugPlan, setSelectedDrugPlan] = useState<any>(null);
  const [selectedDentalPlan, setSelectedDentalPlan] = useState<OptimizedDentalQuote | null>(null);
  const [selectedCancerPlan, setSelectedCancerPlan] = useState<any>(null);
  
  // Flag to track if data has been loaded from Firestore
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Helper function to determine what additional information is needed for specific coverage types
  // Note: This function only checks for coverage-specific fields that require custom handling.
  // Basic fields (age, zipCode, gender, etc.) are handled by the shared MissingFieldsModal.
  const getRequiredAdditionalInfo = (coverageType: string, formData: any): string[] => {
    const missing: string[] = [];
    
    // Helper function to check if a field is missing or empty
    const isFieldMissing = (value: any): boolean => {
      return value === '' || value === null || value === undefined;
    };
    
    switch (coverageType) {
      case 'partd':
      case 'Medicare Part D':
        // Part D might need current medications information (complex fields not in shared modal)
        if (!formData.medications || formData.medications.length === 0) {
          missing.push('Current Medications');
        }
        if (isFieldMissing(formData.pharmacy)) {
          missing.push('Preferred Pharmacy');
        }
        break;
        
      case 'dental-vision-hearing':
      case 'Dental/Vision/Hearing':
        // Dental might need dental history or specific needs (complex fields not in shared modal)
        if (isFieldMissing(formData.lastDentalVisit)) {
          missing.push('Last Dental Visit');
        }
        if (isFieldMissing(formData.needsGlasses)) {
          missing.push('Vision Needs');
        }
        if (isFieldMissing(formData.hearingAids)) {
          missing.push('Hearing Aids Needed');
        }
        break;
        
      // Note: For coverage types that use the shared modal (cancer, final-expense, hospital-indemnity, etc.),
      // we don't check basic fields here since they're handled by the shared modal's internal validation.
      // Only add cases here for coverage types that need complex custom fields.
    }
    
    return missing;
  };
  
  // Helper function to show additional information collection modal (legacy modal for complex fields)
  const showAdditionalInfoCollection = async (coverageType: string, missingInfo: string[]) => {
    // This function now only handles coverage types that need custom/complex fields
    // that can't be handled by the shared modal
    console.log('Using legacy modal for coverage type with custom fields:', coverageType);
    
    setCurrentCoverageType(coverageType);
    setMissingFields(missingInfo);
    setAdditionalFormData({});
    setShowAdditionalInfoModal(true);
  };
  
  // Handler for shared modal submission
  const handleSharedModalSubmit = async (formData: QuoteFormData) => {
    try {
      // Close the modal first
      setShowMissingFieldsModal(false);
      
      // Save the updated form data
      await saveToStorage(QUOTE_FORM_DATA_KEY, formData);
      
      // Map category ID to coverage type name for internal processing
      const coverageTypeMapping: Record<string, string> = {
        'cancer': 'Cancer Insurance',
        'dental': 'Dental/Vision/Hearing',
        'drug-plan': 'Medicare Part D',
        'final-expense': 'Final Expense',
        'advantage': 'Medicare Advantage',
        'hospital-indemnity': 'Hospital Indemnity'
      };
      
      const coverageTypeName = coverageTypeMapping[selectedCoverageCategory] || selectedCoverageCategory;
      
      // Continue with quote generation using the mapped coverage type
      await generateQuotesForCoverageInternal(coverageTypeName, formData);
    } catch (error) {
      console.error('Error in handleSharedModalSubmit:', error);
      // Re-open modal if there was an error
      setShowMissingFieldsModal(true);
    }
  };
  
  // Handler for direct quote generation when no fields are missing
  const handleDirectQuoteGeneration = async () => {
    // Map category ID to coverage type name for internal processing
    const coverageTypeMapping: Record<string, string> = {
      'cancer': 'Cancer Insurance',
      'dental': 'Dental/Vision/Hearing',
      'drug-plan': 'Medicare Part D',
      'final-expense': 'Final Expense',
      'advantage': 'Medicare Advantage',
      'hospital-indemnity': 'Hospital Indemnity'
    };
    
    const coverageTypeName = coverageTypeMapping[selectedCoverageCategory] || selectedCoverageCategory;
    
    // Continue with quote generation using existing form data
    await generateQuotesForCoverageInternal(coverageTypeName, initialFormDataForModal);
  };
  
  // Helper function to proceed with quote generation after collecting additional info
  const proceedWithQuoteGeneration = async (coverageType: string, updatedFormData: any) => {
    // Save the updated form data
    await saveToStorage(QUOTE_FORM_DATA_KEY, updatedFormData);
    
    // Close the modal
    setShowAdditionalInfoModal(false);
    
    // Continue with the original quote generation logic
    await generateQuotesForCoverageInternal(coverageType, updatedFormData);
  };
  
  // Load existing quotes from Firestore on component mount
  useEffect(() => {
    const loadStoredQuotes = async () => {
      try {
        // Load form data first to get user info
        const formData = await loadFromStorage(QUOTE_FORM_DATA_KEY, {} as QuoteFormData);
        
        // Load existing plan builder data
        const existingPlanBuilder = await loadPlanBuilderData();
        if (existingPlanBuilder) {
          console.log('📖 Loaded existing plan builder data:', existingPlanBuilder);
          
          // Restore chart data if it exists
          if (existingPlanBuilder.chartData) {
            console.log('🔄 Restoring chart data:', existingPlanBuilder.chartData);
            setChartData(existingPlanBuilder.chartData);
          }
          
          // Restore selected plans
          if (existingPlanBuilder.selectedPlans.drugPlan) {
            console.log('💊 Restoring drug plan:', existingPlanBuilder.selectedPlans.drugPlan);
            setSelectedDrugPlan(existingPlanBuilder.selectedPlans.drugPlan);
          }
          if (existingPlanBuilder.selectedPlans.dentalPlan) {
            console.log('🦷 Restoring dental plan:', existingPlanBuilder.selectedPlans.dentalPlan);
            setSelectedDentalPlan(existingPlanBuilder.selectedPlans.dentalPlan);
          }
          if (existingPlanBuilder.selectedPlans.cancerPlan) {
            console.log('🎗️ Restoring cancer plan:', existingPlanBuilder.selectedPlans.cancerPlan);
            setSelectedCancerPlan(existingPlanBuilder.selectedPlans.cancerPlan);
          }
        } else {
          console.log('📝 No existing plan builder data found, using defaults');
        }
        
        setDataLoaded(true);
        
        // Load drug plan quotes
        const storedDrugQuotes = await loadFromStorage(DRUG_PLAN_QUOTES_KEY, []);
        if (storedDrugQuotes && storedDrugQuotes.length > 0) {
          setDrugPlanQuotes(storedDrugQuotes);
          setCompletedCoverageTypes(prev => [...prev, 'Medicare Part D']);
        }

        // Load dental quotes
        const storedDentalQuotes = await loadFromStorage(DENTAL_QUOTES_KEY, []);
        if (storedDentalQuotes && storedDentalQuotes.length > 0) {
          setDentalQuotes(storedDentalQuotes);
          setCompletedCoverageTypes(prev => [...prev, 'Dental/Vision/Hearing']);
        }

        // Load cancer insurance quotes
        const storedCancerQuotes = await loadFromStorage(CANCER_INSURANCE_QUOTES_KEY, []);
        if (storedCancerQuotes && storedCancerQuotes.length > 0) {
          setCancerInsuranceQuotes(storedCancerQuotes);
          setCompletedCoverageTypes(prev => [...prev, 'Cancer Insurance']);
        }
      } catch (error) {
        console.error('Error loading stored quotes:', error);
      }
    };

    loadStoredQuotes();
  }, []);
  
  // Chart data for the Coverage Quality scale - initialized with default values
  const getDefaultChartData = () => [
    { name: 'Medicare A & B', value: 50, color: '#ef4444', selected: true, description: 'Base minimum', quality: 'Basic' },
    { name: 'Medigap', value: 20, color: '#3b82f6', selected: true, description: 'Essential supplement', quality: 'Good' },
    { name: 'Part D', value: 15, color: '#10b981', selected: false, description: 'Drug coverage', quality: 'Better' },
    { name: 'DVH', value: 10, color: '#f59e0b', selected: false, description: 'Dental, Vision & Hearing', quality: 'Very Good' },
    { name: 'Cancer', value: 5, color: '#8b5cf6', selected: false, description: 'Cancer insurance', quality: 'Excellent' },
  ];
  
  const [chartData, setChartData] = useState(getDefaultChartData());

  // Save plan builder state whenever relevant data changes
  useEffect(() => {
    // Only save if data has been loaded from Firestore first (to avoid overwriting on mount)
    if (!dataLoaded) {
      console.log('⏳ Data not loaded yet, skipping save');
      return;
    }
    
    // Only save if Medicare A&B is selected and we have actual data
    const medicareABSelected = chartData.find(item => item.name === 'Medicare A & B')?.selected;
    if (medicareABSelected && quoteData.plan) {
      console.log('💾 Saving plan builder state...', {
        chartData,
        selectedDrugPlan,
        selectedDentalPlan,
        selectedCancerPlan
      });
      savePlanBuilderState();
    } else {
      console.log('❌ Not saving - conditions not met:', {
        medicareABSelected,
        hasQuoteData: !!quoteData.plan
      });
    }
  }, [chartData, selectedDrugPlan, selectedDentalPlan, selectedCancerPlan, dataLoaded]);

  // Helper functions from test-multi-plan
  const formatRate = (rate: any) => {
    if (typeof rate === 'number') {
      return `$${rate.toFixed(2)}`;
    }
    return 'N/A';
  };

  // Load existing quotes from localStorage
  const loadExistingQuotes = () => {
    try {
      const storedQuotes = localStorage.getItem('medigapQuotes');
      if (storedQuotes) {
        const quotes = JSON.parse(storedQuotes);
        console.log('Plan Builder - loaded existing quotes:', quotes.length);
        setRealQuotes(quotes);
        return quotes;
      }
    } catch (error) {
      console.error('Error loading existing quotes:', error);
    }
    return [];
  };

  // Check if we have quotes for a specific plan
  const hasQuotesForPlan = (planType: string): boolean => {
    return realQuotes.some(quote => quote.plan === planType);
  };

  // Get quotes for a specific plan
  const getQuotesForPlan = (planType: string): QuoteData[] => {
    return realQuotes.filter(quote => quote.plan === planType);
  };

  // Convert MedigapQuote to QuoteData format
  const convertMedigapQuoteToQuoteData = (medigapQuote: any, formData: any): QuoteData => {
    return {
      key: medigapQuote.id || `quote-${medigapQuote.plan}-${Date.now()}`,
      age: parseInt(formData.age) || 65,
      age_increases: [],
      company: medigapQuote.company || medigapQuote.carrier?.name || '',
      company_base: {
        key: medigapQuote.company || medigapQuote.carrier?.name || '',
        name: medigapQuote.carrier?.name || medigapQuote.company || '',
        name_full: medigapQuote.carrier?.full_name || medigapQuote.company || '',
        naic: '',
        ambest_rating: medigapQuote.am_best_rating || 'n/a',
        ambest_outlook: 'n/a',
        sp_rating: 'n/a',
        type: 'STOCK',
        established_year: 2000,
        customer_complaint_ratio: null,
        customer_satisfaction_ratio: -1,
        med_supp_market_data: [],
        parent_company_base: undefined
      },
      discount_category: 'Standard',
      discounts: (medigapQuote.discounts || []).map((d: any) => ({
        name: d.name || 'Discount',
        type: 'fixed' as const,
        value: d.amount || 0
      })),
      e_app_link: '',
      effective_date: medigapQuote.effective_date || new Date().toISOString(),
      expires_date: '2099-12-31T00:00:00',
      fees: (medigapQuote.fees || []).map((f: any) => ({
        name: f.name || 'Fee',
        type: 'fixed' as const,
        value: f.amount || 0
      })),
      gender: formData.gender === 'male' ? 'M' : 'F',
      has_brochure: false,
      has_pdf_app: false,
      plan: medigapQuote.plan || medigapQuote.plan_name || '',
      rate: {
        annual: (medigapQuote.monthly_premium || medigapQuote.rate?.month || 0) * 12,
        month: medigapQuote.monthly_premium || medigapQuote.rate?.month || 0,
        quarter: (medigapQuote.monthly_premium || medigapQuote.rate?.month || 0) * 3,
        semi_annual: (medigapQuote.monthly_premium || medigapQuote.rate?.month || 0) * 6
      },
      rate_increases: [],
      rate_type: medigapQuote.rate_type || 'attained age',
      rating_class: 'Standard',
      riders: [],
      tobacco: formData.tobaccoUse || false,
      location_base: {
        state: 'TX',
        zip5: [],
        county: []
      }
    };
  };

  // Generate quotes for a specific plan
  const generateQuoteForPlan = async (planType: string) => {
    setGeneratingQuote(planType);
    
    try {
      // Use the same form data fallback strategy as the main medigap page
      const formData = await loadFromStorage(QUOTE_FORM_DATA_KEY, null);
      
      console.log('Plan Builder - generating quote for plan:', planType, 'with form data:', formData);
      
      if (!formData) {
        console.error('❌ No form data found for quote generation');
        alert('Please complete the quote form first by visiting the Medicare Shop page.');
        return;
      }

      // Convert form data to API format
      const quoteParams = {
        zipCode: formData.zipCode,
        age: formData.age.toString(),
        gender: formData.gender === 'male' ? 'M' as const : 'F' as const,
        tobacco: formData.tobaccoUse ? "1" as const : "0" as const,
        plans: [planType], // Just this single plan
      };

      console.log('Plan Builder - calling getMedigapQuotes with params:', quoteParams);
      const response = await getMedigapQuotes(quoteParams);
      
      if (response?.quotes && response.quotes.length > 0) {
        console.log(`Plan Builder - got ${response.quotes.length} quotes for plan ${planType}`);
        
        // Filter quotes for this specific plan and convert to QuoteData format
        const planQuotes = response.quotes
          .filter(quote => quote?.plan === planType)
          .map(quote => convertMedigapQuoteToQuoteData(quote, formData));
        
        // Update existing quotes by removing old quotes for this plan and adding new ones
        const otherQuotes = realQuotes.filter(quote => quote?.plan !== planType);
        const updatedQuotes = [...otherQuotes, ...planQuotes];
        
        setRealQuotes(updatedQuotes);
        
        // Also save to localStorage
        localStorage.setItem('medigapQuotes', JSON.stringify(updatedQuotes));
        
        console.log(`Plan Builder - successfully generated and stored quotes for plan ${planType}`);
      } else {
        console.error(`Plan Builder - no quotes returned for plan ${planType}`);
      }
    } catch (error) {
      console.error(`Error generating quote for plan ${planType}:`, error);
    } finally {
      setGeneratingQuote(null);
    }
  };

  // Generate quotes for additional coverage types (dental, vision, etc.)
  const generateQuotesForCoverage = async (coverageType: string) => {
    setLoadingCoverageTypes(prev => [...prev, coverageType]);
    
    try {
      // Use the same form data fallback strategy as the main medigap page
      const formData = await loadFromStorage(QUOTE_FORM_DATA_KEY, null);
      
      console.log('Plan Builder - generating quotes for coverage:', coverageType, 'with form data:', formData);
      
      if (!formData) {
        console.error('❌ No form data found for coverage quote generation');
        alert('Please complete the quote form first by visiting the Medicare Shop page.');
        setLoadingCoverageTypes(prev => prev.filter(type => type !== coverageType));
        return;
      }

      // Check if this coverage type should use the shared modal for validation
      const sharedModalCategoryMapping: Record<string, { categoryId: string; displayName: string }> = {
        'cancer': { categoryId: 'cancer', displayName: 'Cancer Insurance' },
        'Cancer Insurance': { categoryId: 'cancer', displayName: 'Cancer Insurance' },
        'dental': { categoryId: 'dental', displayName: 'Dental, Vision & Hearing' },
        'dental-vision-hearing': { categoryId: 'dental', displayName: 'Dental, Vision & Hearing' },
        'Dental/Vision/Hearing': { categoryId: 'dental', displayName: 'Dental, Vision & Hearing' },
        'final-expense': { categoryId: 'final-expense', displayName: 'Final Expense Life' },
        'Final Expense': { categoryId: 'final-expense', displayName: 'Final Expense Life' },
        'hospital-indemnity': { categoryId: 'hospital-indemnity', displayName: 'Hospital Indemnity' },
        'Hospital Indemnity': { categoryId: 'hospital-indemnity', displayName: 'Hospital Indemnity' },
        'advantage': { categoryId: 'advantage', displayName: 'Medicare Advantage' },
        'Medicare Advantage': { categoryId: 'advantage', displayName: 'Medicare Advantage' },
        'drug-plan': { categoryId: 'drug-plan', displayName: 'Medicare Part D' },
        'partd': { categoryId: 'drug-plan', displayName: 'Medicare Part D' },
        'Medicare Part D': { categoryId: 'drug-plan', displayName: 'Medicare Part D' }
      };

      const mappedCategory = sharedModalCategoryMapping[coverageType];
      
      if (mappedCategory) {
        // For coverage types that use the shared modal, show the modal directly
        // The modal will handle all validation internally
        console.log('📋 Using shared modal for', coverageType);
        setLoadingCoverageTypes(prev => prev.filter(type => type !== coverageType));
        setInitialFormDataForModal(formData);
        setSelectedCoverageCategory(mappedCategory.categoryId);
        setCoverageDisplayName(mappedCategory.displayName);
        setFormDataLoaded(true); // This will trigger the useEffect to open the modal
        return;
      }

      // For coverage types that need custom fields, check for additional information
      const missingInfo = getRequiredAdditionalInfo(coverageType, formData);
      
      if (missingInfo.length > 0) {
        console.log('📋 Additional information needed for', coverageType, ':', missingInfo);
        setLoadingCoverageTypes(prev => prev.filter(type => type !== coverageType));
        showAdditionalInfoCollection(coverageType, missingInfo);
        return;
      }

      // If no additional info needed, proceed with generation
      await generateQuotesForCoverageInternal(coverageType, formData);
      
    } catch (error) {
      console.error(`Error generating quotes for ${coverageType}:`, error);
      alert(`Failed to generate quotes for ${coverageType}. Please try again.`);
      setLoadingCoverageTypes(prev => prev.filter(type => type !== coverageType));
    }
  };

  // Internal function that actually generates the quotes
  const generateQuotesForCoverageInternal = async (coverageType: string, formData: any) => {
    try {
      // Real quote generation based on coverage type
      if (coverageType === 'partd' || coverageType === 'Medicare Part D') {
        console.log('🔍 Generating Part D quotes...');
        const result = await getDrugPlanQuotes(formData);
        console.log('✅ Part D quotes result:', result);
        
        if (result?.quotes && result.quotes.length > 0) {
          setDrugPlanQuotes(result.quotes);
          await saveToStorage(DRUG_PLAN_QUOTES_KEY, result.quotes);
          setCompletedCoverageTypes(prev => [...prev, 'Medicare Part D']);
          toggleCoverageType('Medicare Part D');
        } else if (result?.error) {
          console.error('Part D quotes error:', result.error);
        }
      } 
      else if (coverageType === 'dental-vision-hearing' || coverageType === 'Dental/Vision/Hearing') {
        console.log('🔍 Generating Dental/Vision/Hearing quotes...');
        const response = await getDentalQuotes(formData);
        console.log('✅ Raw dental quotes response:', response);
        
        if (response?.quotes && Array.isArray(response.quotes)) {
          console.log(`📊 Raw dental quotes count: ${response.quotes.length}`);
          
          const optimizationResult = optimizeDentalQuotes(response);
          console.log('🎯 Dental optimization result:', {
            success: optimizationResult.success,
            quotesCount: optimizationResult.quotes?.length,
            originalSize: optimizationResult.originalSize,
            optimizedSize: optimizationResult.optimizedSize,
            compressionRatio: optimizationResult.compressionRatio
          });
          
          if (optimizationResult.success) {
            setDentalQuotes(optimizationResult.quotes);
            await saveToStorage(DENTAL_QUOTES_KEY, optimizationResult.quotes);
            setCompletedCoverageTypes(prev => [...prev, 'Dental/Vision/Hearing']);
            toggleCoverageType('Dental/Vision/Hearing');
            
            console.log(`🎉 Successfully loaded ${optimizationResult.quotes.length} dental plans (2025 filtered)`);
          }
        } else if (response?.error) {
          console.error('Dental quotes error:', response.error);
        }
      }
      else if (coverageType === 'cancer' || coverageType === 'Cancer Insurance') {
        console.log('🔍 Generating Cancer Insurance quotes...');
        
        // Transform form data to match CancerInsuranceQuoteParams interface
        const cancerParams: CancerInsuranceQuoteParams = {
          state: formData.state as "TX" | "GA",
          age: typeof formData.age === 'number' ? formData.age : parseInt(formData.age as string),
          familyType: formData.familyType === 'individual' ? "Applicant Only" : 
                     formData.familyType === 'family' ? "Applicant and Spouse" : "Applicant Only",
          tobaccoStatus: formData.tobaccoUse ? "Tobacco" : "Non-Tobacco",
          premiumMode: formData.premiumMode === 'monthly' ? "Monthly Bank Draft" : "Annual",
          carcinomaInSitu: formData.carcinomaInSitu ? "100%" : "25%",
          benefitAmount: parseInt(formData.benefitAmount || "25000")
        };
        
        console.log('🎯 Cancer params transformed:', cancerParams);
        
        const response = await getCancerInsuranceQuotes(cancerParams);
        console.log('✅ Cancer Insurance quotes response:', response);
        
        if (response?.quotes && Array.isArray(response.quotes)) {
          setCancerInsuranceQuotes(response.quotes);
          await saveToStorage(CANCER_INSURANCE_QUOTES_KEY, response.quotes);
          setCompletedCoverageTypes(prev => [...prev, 'Cancer Insurance']);
          toggleCoverageType('Cancer Insurance');
        } else if (response?.error) {
          console.error('Cancer Insurance quotes error:', response.error);
        }
      }
      
    } catch (error) {
      console.error(`Error generating quotes for ${coverageType}:`, error);
      alert(`Failed to generate quotes for ${coverageType}. Please try again.`);
    } finally {
      setLoadingCoverageTypes(prev => prev.filter(type => type !== coverageType));
    }
  };

  // Toggle coverage type selection and update Coverage Quality
  const toggleCoverageType = (coverageType: string) => {
    // Check if Medicare A & B is selected (required for other coverage types)
    const medicareABSelected = chartData.find(item => item.name === 'Medicare A & B')?.selected;
    
    // If trying to toggle a non-Medicare A & B coverage type without Medicare A & B selected, do nothing
    if (coverageType !== 'medicare-ab' && !medicareABSelected) {
      return;
    }
    
    setChartData(prevData => 
      prevData.map(item => {
        if ((coverageType === 'partd' && item.name === 'Part D') ||
            ((coverageType === 'dental-vision-hearing' || coverageType === 'dental' || coverageType === 'vision') && item.name === 'DVH') ||
            (coverageType === 'cancer' && item.name === 'Cancer')) {
          return {
            ...item,
            selected: !item.selected
          };
        }
        return item;
      })
    );
  };

  // Functions to handle plan selection and chart updates
  const selectDrugPlan = (plan: any) => {
    setSelectedDrugPlan(plan);
    setChartData(prevData => 
      prevData.map(item => {
        if (item.name === 'Part D') {
          return { ...item, selected: true };
        }
        return item;
      })
    );
  };

  const selectDentalPlan = (plan: OptimizedDentalQuote) => {
    setSelectedDentalPlan(plan);
    setChartData(prevData => 
      prevData.map(item => {
        if (item.name === 'DVH') {
          return { ...item, selected: true };
        }
        return item;
      })
    );
  };

  const selectCancerPlan = (plan: any) => {
    setSelectedCancerPlan(plan);
    setChartData(prevData => 
      prevData.map(item => {
        if (item.name === 'Cancer') {
          return { ...item, selected: true };
        }
        return item;
      })
    );
  };

  // Function to save plan builder state to Firestore
  const savePlanBuilderState = async () => {
    try {
      const currentRate = getCurrentSelectionRate();
      if (currentRate === null) {
        console.warn('Cannot save plan builder state: No plan selection made yet');
        return;
      }

      const totalMonthlyCost = 
        currentRate + 
        (selectedDrugPlan ? ((selectedDrugPlan.month_rate || selectedDrugPlan.part_d_rate || 0) / 100) : 0) +
        (selectedDentalPlan ? selectedDentalPlan.monthlyPremium : 0) +
        (selectedCancerPlan ? (selectedCancerPlan.monthly_premium || 0) : 0);

      const totalScore = chartData.filter(item => item.selected).reduce((sum, item) => sum + item.value, 0);
      let coverageQuality = 'Basic';
      if (totalScore >= 85) coverageQuality = 'Excellent';
      else if (totalScore >= 70) coverageQuality = 'Very Good';
      else if (totalScore >= 55) coverageQuality = 'Good';
      else if (totalScore >= 40) coverageQuality = 'Fair';

      const planBuilderData: PlanBuilderData = {
        medigapPlan: {
          plan: quoteData.plan,
          carrier: getCarrierDisplayName(quoteData.company_base?.name || quoteData.company || ''),
          monthlyRate: currentRate,
          selected: true
        },
        medicareAB: {
          selected: chartData.find(item => item.name === 'Medicare A & B')?.selected || false,
          selectedAt: Timestamp.now()
        },
        selectedPlans: {
          drugPlan: selectedDrugPlan,
          dentalPlan: selectedDentalPlan,
          cancerPlan: selectedCancerPlan
        },
        chartData: chartData,
        totalMonthlyCost: totalMonthlyCost,
        coverageQuality: coverageQuality,
        lastUpdated: Timestamp.now()
      };

      console.log('💾 About to save plan builder data:', planBuilderData);
      await savePlanBuilderData(planBuilderData);
      console.log('✅ Plan Builder state saved to Firestore');
    } catch (error) {
      console.error('❌ Failed to save plan builder state:', error);
    }
  };

  useEffect(() => {
    // Load existing quotes when component mounts
    loadExistingQuotes();
  }, [quoteData.plan]);

  // Reload quotes when the component mounts or when we need to refresh
  useEffect(() => {
    loadExistingQuotes();
  }, []);

  return (
    <TabsContent value="builder" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Plan Builder */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Build Your Medicare Plan</CardTitle>
                <div className="flex items-center space-x-3">
                  {/* Reset Button - Always visible when coverage builder is active */}
                  {selectedPlanOption && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // Reset all selected plans
                        setSelectedDrugPlan(null);
                        setSelectedDentalPlan(null);
                        setSelectedCancerPlan(null);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <ResetIcon className="h-4 w-4" />
                    </Button>
                  )}
                  {/* Hide discount toggle when coverage quality builder is visible */}
                  {!selectedPlanOption && (
                    <>
                      <label htmlFor="apply-discounts-inline" className="text-sm font-medium">
                        Apply available discounts
                      </label>
                      <Switch 
                        id="apply-discounts-inline"
                        checked={applyDiscounts}
                        onCheckedChange={(checked) => {
                          console.log('Inline discount toggle changed:', checked);
                          setApplyDiscounts(checked as boolean);
                        }}
                      />
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-0">
              {/* Plan Options Section */}
              <div className="space-y-2">

                {/* Plan Options List - Show only if no plan is selected */}
                {!selectedPlanOption && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">Choose Your Plan Option:</h4>
                      {(() => {
                        // Quick check for pre-calculated discounts badge
                        const planSpecificQuotes = carrierQuotes?.filter(quote => 
                          quote.plan === quoteData.plan
                        ) || [];
                        
                        const availableOptions = planSpecificQuotes.length > 0 ? planSpecificQuotes : [{
                          name: 'Standard Plan',
                          rate: quoteData.rate,
                          view_type: ['standard'],
                          rating_class: 'Standard',
                          description: 'Standard coverage with no additional discounts'
                        }];
                        
                        const hasWithHHD = availableOptions.some((opt: any) => opt.view_type?.includes('with_hhd'));
                        const hasSansHHD = availableOptions.some((opt: any) => opt.view_type?.includes('sans_hhd'));
                        const hasPreCalculatedDiscounts = hasWithHHD && hasSansHHD;
                        
                        if (hasPreCalculatedDiscounts) {
                          return (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                              pre-calculated discounts
                            </Badge>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    {(() => {
                      // Get available plan options
                      const planSpecificQuotes = carrierQuotes?.filter(quote => 
                        quote.plan === quoteData.plan
                      ) || [];
                      
                      console.log('PlanBuilderTab: planSpecificQuotes found:', planSpecificQuotes.length);
                      console.log('PlanBuilderTab: applyDiscounts state:', applyDiscounts);

                      // Create fallback option if no carrier quotes
                      const availableOptions = planSpecificQuotes.length > 0 ? planSpecificQuotes : [{
                        name: 'Standard Plan',
                        rate: quoteData.rate,
                        view_type: ['standard'],
                        rating_class: 'Standard',
                        description: 'Standard coverage option'
                      }];

                      // Create plan object for processOptionsForDisplay function
                      const planData = {
                        plan: quoteData.plan,
                        options: availableOptions
                      };

                      console.log('PlanBuilderTab: planData created with', availableOptions.length, 'options');
                      console.log('PlanBuilderTab: sample option:', availableOptions[0]);

                      // Use the proper filtering logic from medigap-utils
                      const displayOptions = processOptionsForDisplay(planData, applyDiscounts);
                      
                      console.log('PlanBuilderTab: displayOptions after filtering:', displayOptions.length);

                      // Add description of what options are being shown
                      const hasWithHHD = planData.options.some((opt: any) => opt.view_type?.includes('with_hhd'));
                      const hasSansHHD = planData.options.some((opt: any) => opt.view_type?.includes('sans_hhd'));
                      const hasPreCalculatedDiscounts = hasWithHHD && hasSansHHD;
                      
                      const optionsDescription = (() => {
                        if (hasPreCalculatedDiscounts) {
                          return applyDiscounts ? 
                            `Discounted Options (${displayOptions.length}):` : 
                            `Standard Options (${displayOptions.length}):`;
                        } else {
                          return `All Options (${displayOptions.length}):`;
                        }
                      })();

                      return (
                        <>
                          <div className="text-sm font-medium mb-2 text-gray-600">
                            {optionsDescription}
                          </div>
                          {displayOptions.map((option: any, index: number) => {
                        const hasWithHHD = option.view_type?.includes('with_hhd');
                        const hasSansHHD = option.view_type?.includes('sans_hhd');
                        
                        return (
                          <div 
                            key={`${index}-${applyDiscounts}`} 
                            className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => {
                              setSelectedPlanOption(option);
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">
                                    {option.name || 
                                     (option.rating_class ? `${option.rating_class} Class` : '') ||
                                     (option.discount_category ? `${option.discount_category} Rate` : '') ||
                                     `Plan ${quoteData.plan} Option ${index + 1}`}
                                  </span>
                                  {option.isRecommended && <Badge className="text-xs">Recommended</Badge>}
                                  {option.isCalculatedDiscount && (
                                    <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                                      Calculated Discount
                                    </Badge>
                                  )}
                                  {hasWithHHD && (
                                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                      Including Household Discount
                                    </Badge>
                                  )}
                                  {hasSansHHD && (
                                    <Badge variant="outline" className="text-xs">
                                      Household Discount Available
                                    </Badge>
                                  )}
                                  {!hasWithHHD && !hasSansHHD && option.discounts && option.discounts.length > 0 && !applyDiscounts && (
                                    <Badge variant="outline" className="text-xs text-green-600">
                                      Discounts Available
                                    </Badge>
                                  )}
                                </div>
                                
                                {option.description && (
                                  <div className="text-sm text-muted-foreground mb-1">{option.description}</div>
                                )}
                                
                                {/* Available Discounts */}
                                {option.discounts && option.discounts.length > 0 && (
                                  <div className="text-xs text-green-600 mb-1">
                                    {applyDiscounts ? 'Discounts applied: ' : 'Available discounts: '}
                                    {option.discounts.map((d: any) => {
                                      const name = d.name?.charAt(0).toUpperCase() + d.name?.slice(1) || 'Discount';
                                      const discountPercent = d.value ? (d.value * 100) : (d.percent || 0);
                                      const value = d.type === 'percent' ? `${Math.round(discountPercent)}%` : `$${d.value}`;
                                      return `${name} (${value})`;
                                    }).join(', ')}
                                  </div>
                                )}
                                
                                {option.rating_class && (
                                  <div className="text-xs text-blue-600">
                                    Rating Class: {option.rating_class}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-semibold">
                                  ${((option.rate?.month || 0) / 100).toFixed(2)}/mo
                                </div>
                                {option.rate?.annual && (
                                  <div className="text-xs text-muted-foreground">
                                    ${Math.round((option.rate.annual || 0) / 100)}/year
                                  </div>
                                )}
                                {option.savings && (
                                  <div className="text-xs text-green-600">
                                    Save ${((option.savings || 0) / 100).toFixed(2)}/mo
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Coverage Builder Section - Only show if a plan option is selected */}
              {selectedPlanOption && (
                <div data-scroll-target="coverage-builder">
                  {/* Coverage Quality Header Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
                    
                    {/* Left Columns: Plan Options */}
                    <div className="lg:col-span-6 space-y-3">
                      {/* Medicare Part A & B */}
                      <div className={`border rounded-lg p-4 ${
                        chartData.find(item => item.name === 'Medicare A & B')?.selected 
                          ? 'border-green-500' 
                          : 'border-red-500'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div>
                              <h5 className={`font-medium ${
                                chartData.find(item => item.name === 'Medicare A & B')?.selected 
                                  ? '' 
                                  : ''
                              }`}>Medicare Part A & B</h5>
                              <p className={`text-sm ${
                                chartData.find(item => item.name === 'Medicare A & B')?.selected 
                                  ? '' 
                                  : ''
                              }`}>Base Medicare coverage (required)</p>
                            </div>
                            </div>
                              <Checkbox 
                              checked={chartData.find(item => item.name === 'Medicare A & B')?.selected || false}
                              onCheckedChange={(checked) => {
                                setChartData(prevData => 
                                  prevData.map(item => 
                                    item.name === 'Medicare A & B' 
                                      ? { ...item, selected: !!checked }
                                      : item
                                  )
                                );
                              }}
                            />
                          
                        </div>
                      </div>

                      {/* Selected Medigap Plan */}
                      {selectedPlanOption ? (
                        <div className="p-4 border border-green-500 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className='text-md'>
                              <h4 className="font-semibold">
                                {getCarrierDisplayName(quoteData.company_base?.name || quoteData.company || '')} - Plan {quoteData.plan}
                              </h4>
                              <div className='flex items-center gap-2'>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedPlanOption(null)}
                                className="mt-2"
                              >
                                Change Plan
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedPlanOption(null)}
                                className="mt-2"
                              >
                                Info
                              </Button>
                              </div>
                              {selectedPlanOption.description && (
                                <p className="text-xs mt-1">{selectedPlanOption.description}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-semibold">
                                ${((selectedPlanOption.rate?.month || 0) / 100).toFixed(2)}/mo
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="border-red-500 border rounded-lg p-4 bg-red-50 opacity-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium text-red-900">Plan {quoteData.plan}</h5>
                              <p className="text-sm text-red-700">Select a Medigap plan option</p>
                            </div>
                            <div className="font-medium text-red-900">
                              Select option
                            </div>
                          </div>
                        </div>
                      )}
                      {selectedDrugPlan && (
                        <div className="border rounded-lg p-4 border-green-500">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium">
                                {selectedDrugPlan.plan_name || 'Selected Drug Plan'}
                              </h5>
                              <p className="text-sm text-gray-600">
                                {selectedDrugPlan.organization_name || 'Prescription Drug Coverage'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-green-900">
                                ${((selectedDrugPlan.month_rate || selectedDrugPlan.part_d_rate || 0) / 100).toFixed(2)}/mo
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowDrugPlanModal(true)}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil1Icon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <InfoCircledIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Medicare Part D - if not selected */}
                      {!selectedDrugPlan && (
                        <div className={`border-red-500 border rounded-lg p-4 transition-colors ${
                          chartData.find(item => item.name === 'Medicare A & B')?.selected 
                            ? 'hover:bg-muted/50' 
                            : 'opacity-50 cursor-not-allowed bg-gray-50'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className={`font-medium ${
                                chartData.find(item => item.name === 'Medicare A & B')?.selected 
                                  ? '' 
                                  : 'text-gray-500'
                              }`}>Prescription Drug Plan</h5>
                            </div>
                            <div className="flex items-center gap-2">
                              {drugPlanQuotes.length > 0 && (
                                <button
                                  onClick={() => setShowDrugPlanModal(true)}
                                  className={`text-sm font-medium hover:underline cursor-pointer ${
                                    chartData.find(item => item.name === 'Medicare A & B')?.selected 
                                      ? 'text-blue-600 hover:text-blue-800' 
                                      : 'text-gray-500'
                                  }`}
                                  disabled={!chartData.find(item => item.name === 'Medicare A & B')?.selected}
                                >
                                  {drugPlanQuotes.length} quotes
                                </button>
                              )}
                              {loadingCoverageTypes.includes('partd') ? (
                                <Button variant="ghost" size="sm" disabled>...</Button>
                              ) : drugPlanQuotes.length === 0 ? (
                                <Button 
                                  variant="ghost" 
                                  size="default"
                                  disabled={!chartData.find(item => item.name === 'Medicare A & B')?.selected}
                                  onClick={() => generateQuotesForCoverage('partd')}
                                  className="text-lg font-bold w-10 h-10"
                                >
                                  +
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedDentalPlan && (
                        <div className="border rounded-lg p-4 border-green-500">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium">
                                {selectedDentalPlan.planName}
                              </h5>
                              <p className="text-sm text-gray-600">
                                {selectedDentalPlan.companyName} - Dental, Vision & Hearing
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-amber-900">
                                ${selectedDentalPlan.monthlyPremium.toFixed(2)}/mo
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowDentalModal(true)}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil1Icon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <InfoCircledIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Dental, Vision & Hearing Coverage - if not selected */}
                      {!selectedDentalPlan && (
                        <div className={`border-red-500 border rounded-lg p-4 transition-colors ${
                          chartData.find(item => item.name === 'Medicare A & B')?.selected 
                            ? 'hover:bg-muted/50' 
                            : 'opacity-50 cursor-not-allowed bg-gray-50'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className={`font-medium ${
                                chartData.find(item => item.name === 'Medicare A & B')?.selected 
                                  ? '' 
                                  : 'text-gray-500'
                              }`}>Dental, Vision & Hearing</h5>
                            </div>
                            <div className="flex items-center gap-2">
                              {dentalQuotes.length > 0 && (
                                <button
                                  onClick={() => setShowDentalModal(true)}
                                  className={`text-sm font-medium hover:underline cursor-pointer ${
                                    chartData.find(item => item.name === 'Medicare A & B')?.selected 
                                      ? 'text-blue-600 hover:text-blue-800' 
                                      : 'text-gray-500'
                                  }`}
                                  disabled={!chartData.find(item => item.name === 'Medicare A & B')?.selected}
                                >
                                  {dentalQuotes.length} quotes
                                </button>
                              )}
                              {loadingCoverageTypes.includes('dental-vision-hearing') ? (
                                <Button variant="ghost" size="sm" disabled>...</Button>
                              ) : dentalQuotes.length === 0 ? (
                                <Button 
                                  variant="ghost" 
                                  size="default"
                                  disabled={!chartData.find(item => item.name === 'Medicare A & B')?.selected}
                                  onClick={() => generateQuotesForCoverage('dental-vision-hearing')}
                                  className="text-lg font-bold w-10 h-10"
                                >
                                  +
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedCancerPlan && (
                        <div className="border rounded-lg p-4 border-green-500">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium">
                                {selectedCancerPlan.plan_name || 'Selected Cancer Plan'}
                              </h5>
                              <p className="text-sm text-gray-600">
                                {selectedCancerPlan.carrier || 'Cancer Insurance Coverage'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="font-medium">
                                ${(selectedCancerPlan.monthly_premium || 0).toFixed(2)}/mo
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowCancerModal(true)}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil1Icon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <InfoCircledIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Cancer Insurance - if not selected */}
                      {!selectedCancerPlan && (
                        <div className={`border-red-500 border rounded-lg p-4 transition-colors ${
                          chartData.find(item => item.name === 'Medicare A & B')?.selected 
                            ? 'hover:bg-muted/50' 
                            : 'opacity-50 cursor-not-allowed bg-gray-50'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className={`font-medium ${
                                chartData.find(item => item.name === 'Medicare A & B')?.selected 
                                  ? '' 
                                  : 'text-gray-500'
                              }`}>Cancer Insurance</h5>
                            </div>
                            <div className="flex items-center gap-2">
                              {cancerInsuranceQuotes.length > 0 && (
                                <button
                                  onClick={() => setShowCancerModal(true)}
                                  className={`text-sm font-medium hover:underline cursor-pointer ${
                                    chartData.find(item => item.name === 'Medicare A & B')?.selected 
                                      ? 'text-blue-600 hover:text-blue-800' 
                                      : 'text-gray-500'
                                  }`}
                                  disabled={!chartData.find(item => item.name === 'Medicare A & B')?.selected}
                                >
                                  {cancerInsuranceQuotes.length} quotes
                                </button>
                              )}
                              {loadingCoverageTypes.includes('cancer') ? (
                                <Button variant="ghost" size="sm" disabled>...</Button>
                              ) : cancerInsuranceQuotes.length === 0 ? (
                                <Button 
                                  variant="ghost" 
                                  size="default"
                                  disabled={!chartData.find(item => item.name === 'Medicare A & B')?.selected}
                                  onClick={() => generateQuotesForCoverage('cancer')}
                                  className="text-lg font-bold w-10 h-10"
                                >
                                  +
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Columns: Score and Chart */}
                    <div className="lg:col-span-6">
                      {/* Coverage Quality Score - Above Chart */}
                      <div className="text-center">
                        <h5 className="font-semibold text-lg mb-2">Coverage Quality</h5>
                        <div className="text-3xl font-bold">
                          {(() => {
                            const medicareABSelected = chartData.find(item => item.name === 'Medicare A & B')?.selected;
                            const totalScore = chartData.filter(item => {
                              if (item.name === 'Medicare A & B') {
                                return item.selected;
                              } else {
                                return medicareABSelected && item.selected;
                              }
                            }).reduce((sum, item) => sum + item.value, 0);
                            
                            if (totalScore >= 85) return <span className="text-green-600">Excellent</span>;
                            if (totalScore >= 70) return <span className="text-blue-600">Very Good</span>;
                            if (totalScore >= 55) return <span className="text-yellow-600">Good</span>;
                            if (totalScore >= 40) return <span className="text-orange-600">Fair</span>;
                            return <span className="text-red-600">Basic</span>;
                          })()}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {(() => {
                            const medicareABSelected = chartData.find(item => item.name === 'Medicare A & B')?.selected;
                            return chartData.filter(item => {
                              if (item.name === 'Medicare A & B') {
                                return item.selected;
                              } else {
                                return medicareABSelected && item.selected;
                              }
                            }).reduce((sum, item) => sum + item.value, 0);
                          })()}% Complete
                        </p>
                      </div>
                      
                      {/* Pie Chart */}
                      <div className="flex justify-center">
                        <div className="w-full max-w-sm">
                          <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                              <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                              >
                                {chartData.map((entry, index) => {
                                  const medicareABSelected = chartData.find(item => item.name === 'Medicare A & B')?.selected;
                                  let fillColor = '#e5e7eb';
                                  
                                  if (entry.name === 'Medicare A & B') {
                                    fillColor = entry.selected ? entry.color : '#e5e7eb';
                                  } else {
                                    fillColor = (medicareABSelected && entry.selected) ? entry.color : '#e5e7eb';
                                  }
                                  
                                  return <Cell 
                                    key={`cell-${index}`} 
                                    fill={fillColor}
                                    stroke="none"
                                  />;
                                })}
                              </Pie>
                              <Tooltip 
                                formatter={(value, name) => [`${value}%`, name]}
                                contentStyle={{ 
                                  backgroundColor: 'white', 
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '8px'
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      
                      {/* Legend Below Chart */}
                      <div className="bg-gray-50 rounded-lg px-4">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 px-4">
                          {chartData.map((item, index) => {
                            const medicareABSelected = chartData.find(chartItem => chartItem.name === 'Medicare A & B')?.selected;
                            const isEnabled = item.name === 'Medicare A & B' || medicareABSelected;
                            const isActive = item.selected && isEnabled;
                            
                            return (
                              <div key={index} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ 
                                      backgroundColor: isActive ? item.color : '#e5e7eb'
                                    }}
                                  />
                                  <span className={
                                    isActive ? 'font-medium' : 
                                    isEnabled ? 'text-muted-foreground' : 'text-gray-400'
                                  }>
                                    {item.name}
                                  </span>
                                </div>
                                <span className={`text-xs ${
                                  isActive ? 'font-medium' : 
                                  isEnabled ? 'text-muted-foreground' : 'text-gray-400'
                                }`}>
                                  {item.value}%
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      
                    </div>

                    {/* Bottom Section: Additional Plan Options */}
                    <div className="lg:col-span-12 space-y-3">
                      {/* Selected Additional Coverage Plans */}
                     {/* Dynamic Explanation Text - Below Legend */}
                      <div className="text-sm text-gray-600 space-y-2">
                        {(() => {
                          const medicareABSelected = chartData.find(item => item.name === 'Medicare A & B')?.selected;
                          const totalScore = chartData.filter(item => {
                            if (item.name === 'Medicare A & B') {
                              return item.selected;
                            } else {
                              return medicareABSelected && item.selected;
                            }
                          }).reduce((sum, item) => sum + item.value, 0);
                          
                          if (totalScore >= 85) {
                            return (
                              <>
                                <p><strong>Excellent Coverage!</strong></p>
                                <p>You have comprehensive Medicare protection with all major coverage types. This provides:</p>
                                <ul className="list-disc pl-4 space-y-1 text-xs">
                                  <li>Complete hospital and medical coverage</li>
                                  <li>No gaps in Medicare benefits</li>
                                  <li>Prescription drug protection</li>
                                  <li>Dental, vision, and hearing benefits</li>
                                  <li>Specialized cancer insurance</li>
                                </ul>
                              </>
                            );
                          } else if (totalScore >= 70) {
                            return (
                              <>
                                <p><strong>Very Good Coverage</strong></p>
                                <p>You have strong Medicare protection. Consider adding the remaining coverage types for complete protection:</p>
                                <ul className="list-disc pl-4 space-y-1 text-xs">
                                  <li>Core Medicare and Medigap coverage in place</li>
                                  <li>Good foundation for healthcare needs</li>
                                  <li>Minor gaps that could be filled for optimal coverage</li>
                                </ul>
                              </>
                            );
                          } else if (totalScore >= 55) {
                            return (
                              <>
                                <p><strong>Good Foundation</strong></p>
                                <p>You have essential Medicare coverage but important gaps remain:</p>
                                <ul className="list-disc pl-4 space-y-1 text-xs">
                                  <li>Basic Medicare and supplement coverage</li>
                                  <li>Missing prescription drug coverage puts you at risk</li>
                                  <li>No dental, vision, or hearing benefits</li>
                                  <li>Consider adding Part D and DVH coverage</li>
                                </ul>
                              </>
                            );
                          } else if (totalScore >= 40) {
                            return (
                              <>
                                <p><strong>Fair Coverage - Significant Gaps</strong></p>
                                <p>Your Medicare coverage has major gaps that could result in high out-of-pocket costs:</p>
                                <ul className="list-disc pl-4 space-y-1 text-xs">
                                  <li>Limited protection beyond basic Medicare</li>
                                  <li>High exposure to copays and deductibles</li>
                                  <li>No prescription drug coverage</li>
                                  <li>Missing preventive dental and vision care</li>
                                </ul>
                              </>
                            );
                          } else {
                            return (
                              <>
                                <p><strong>Basic Coverage - Major Risks</strong></p>
                                <p>You have minimal Medicare protection with substantial financial exposure:</p>
                                <ul className="list-disc pl-4 space-y-1 text-xs">
                                  <li>Only basic Medicare A & B coverage</li>
                                  <li>No protection from Medicare gaps</li>
                                  <li>High risk of unexpected medical costs</li>
                                  <li>Strongly recommend adding Medigap and Part D</li>
                                </ul>
                              </>
                            );
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Plan Summary Sidebar */}
        <div className="space-y-6">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Plan Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Total Monthly Premium */}
              <div className="text-center py-4 border rounded-lg bg-gray-50">
                <div className="text-sm text-gray-600 mb-1">Total Monthly Premium</div>
                <div className="text-2xl font-bold">
                  ${(() => {
                    const currentRate = getCurrentSelectionRate();
                    if (currentRate === null) return '-.--'; // Show placeholder when no selection
                    const baseRate = currentRate / 100; // Convert from cents to dollars and use discounted rate
                    const drugRate = selectedDrugPlan ? ((selectedDrugPlan.month_rate || selectedDrugPlan.part_d_rate || 0) / 100) : 0;
                    const dentalRate = selectedDentalPlan ? ((selectedDentalPlan as any).monthlyPremium || 0) : 0;
                    const cancerRate = selectedCancerPlan ? ((selectedCancerPlan.monthly_premium || 0)) : 0;
                    
                    return (baseRate + drugRate + dentalRate + cancerRate).toFixed(2);
                  })()}
                </div>
              </div>
              
              {/* Itemized Plan List */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-900">Coverage Breakdown</h4>
                
                {/* Base Medicare + Medigap */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 border border-blue-200 rounded-md">
                    <div>
                      <div className="text-sm font-medium">Plan {quoteData.plan}</div>
                      <div className="text-xs text-gray-600">{getCarrierDisplayName(quoteData.company_base?.name || quoteData.company || '')}</div>
                    </div>
                    <span className="font-medium">
                      {(() => {
                        const rate = getCurrentSelectionRate();
                        return rate !== null ? formatCurrency(rate) : 'Select option';
                      })()}
                    </span>
                  </div>
                  
                  {/* Selected Additional Plans */}
                  {selectedDrugPlan && (
                    <div className="flex justify-between items-center p-2 border border-green-200 rounded-md">
                      <div>
                        <div className="text-sm font-medium">{selectedDrugPlan.plan_name || 'Prescription Drug Plan'}</div>
                        <div className="text-xs text-gray-600">{selectedDrugPlan.organization_name || 'Drug Coverage'}</div>
                      </div>
                      <span className="font-medium">
                        ${((selectedDrugPlan.month_rate || selectedDrugPlan.part_d_rate || 0) / 100).toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  {selectedDentalPlan && (
                    <div className="flex justify-between items-center p-2 border border-amber-200 rounded-md">
                      <div>
                        <div className="text-sm font-medium">{(selectedDentalPlan as any).planName}</div>
                        <div className="text-xs text-gray-600">{(selectedDentalPlan as any).companyName}</div>
                      </div>
                      <span className="font-medium">
                        ${(selectedDentalPlan as any).monthlyPremium.toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  {selectedCancerPlan && (
                    <div className="flex justify-between items-center p-2 border border-purple-200 rounded-md">
                      <div>
                        <div className="text-sm font-medium">{selectedCancerPlan.plan_name || 'Cancer Insurance'}</div>
                        <div className="text-xs text-gray-600">{selectedCancerPlan.carrier || 'Cancer Coverage'}</div>
                      </div>
                      <span className="font-medium">
                        ${(selectedCancerPlan.monthly_premium || 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <Button className="w-full">
                Proceed to Application
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Drug Plan Quotes Modal */}
      <Dialog open={showDrugPlanModal} onOpenChange={setShowDrugPlanModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prescription Drug Plan Options</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose a prescription drug plan to add to your coverage
            </p>
            
            {drugPlanQuotes
              .sort((a, b) => {
                const rateA = (a.month_rate || a.part_d_rate || 0) / 100;
                const rateB = (b.month_rate || b.part_d_rate || 0) / 100;
                return rateA - rateB;
              })
              .map((quote: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">
                      {quote.plan_name || `Plan ${index + 1}`}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {quote.organization_name || 'Drug Plan Provider'}
                    </p>
                    <div className="mt-2 space-y-1 text-sm">
                      {quote.overall_star_rating && (
                        <p>Star Rating: {quote.overall_star_rating}/5</p>
                      )}
                      {quote.drug_benefit_type && quote.drug_benefit_type !== 'n/a' && (
                        <p>Benefit Type: {quote.drug_benefit_type}</p>
                      )}
                      {quote.in_network_moop && (
                        <p>Max Out-of-Pocket: {quote.in_network_moop}</p>
                      )}
                      {quote.plan_type && quote.plan_type !== 'n/a' && (
                        <p>Plan Type: {quote.plan_type}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      ${((quote.month_rate || quote.part_d_rate || 0) / 100).toFixed(2)}/mo
                    </div>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log('View details for drug plan:', quote);
                        }}
                      >
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          selectDrugPlan(quote);
                          setShowDrugPlanModal(false);
                        }}
                      >
                        Select Plan
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dental/Vision/Hearing Quotes Modal */}
      <Dialog open={showDentalModal} onOpenChange={setShowDentalModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dental, Vision & Hearing Plan Options</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Choose a dental, vision, and hearing plan to add to your coverage
              </p>
              <div className="text-right">
                <Badge variant="outline" className="text-xs">
                  {dentalQuotes.length} Plans Available (2025)
                </Badge>
              </div>
            </div>
            
            {dentalQuotes
              .sort((a, b) => {
                // First sort by A.M. Best rating (A++ is best)
                const ratingOrder = { 'A++': 1, 'A+': 2, 'A': 3, 'A-': 4, 'B++': 5, 'B+': 6, 'B': 7, 'B-': 8 };
                const aRating = ratingOrder[a.ambestRating as keyof typeof ratingOrder] || 999;
                const bRating = ratingOrder[b.ambestRating as keyof typeof ratingOrder] || 999;
                
                if (aRating !== bRating) {
                  return aRating - bRating;
                }
                
                // Then sort by premium (ascending)
                return a.monthlyPremium - b.monthlyPremium;
              })
              .filter((quote, index) => {
                // Show top 15 plans based on rating and price
                return index < 15;
              })
              .map((quote: OptimizedDentalQuote, index: number) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-lg">{quote.planName}</h4>
                      {quote.ambestRating && (
                        <Badge variant="secondary" className="text-xs">
                          {quote.ambestRating}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {quote.companyFullName || quote.companyName}
                    </p>
                  </div>
                  
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        ${quote.monthlyPremium.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">per month</div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // View details functionality
                          console.log('View details for dental plan:', quote);
                        }}
                      >
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          selectDentalPlan(quote);
                          setShowDentalModal(false);
                        }}
                      >
                        Select Plan
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {dentalQuotes.length > 15 && (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  Showing top 15 of {dentalQuotes.length} available plans. 
                  Plans are sorted by A.M. Best rating and lowest premium.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  All plans are 2025 current and available in your area.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancer Insurance Quotes Modal */}
      <Dialog open={showCancerModal} onOpenChange={setShowCancerModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cancer Insurance Plan Options</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose a cancer insurance plan to add to your coverage
            </p>
            
            {cancerInsuranceQuotes
              .sort((a, b) => (a.monthly_premium || 0) - (b.monthly_premium || 0))
              .map((quote: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">
                      {quote.plan_name || `Cancer Plan ${index + 1}`}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {quote.carrier || 'Cancer Insurance Provider'}
                    </p>
                    <div className="mt-2 space-y-1 text-sm">
                      {quote.benefit_amount && (
                        <p>Benefit Amount: ${quote.benefit_amount.toLocaleString()}</p>
                      )}
                      <p>Cancer Insurance Coverage</p>
                      <p className="text-xs text-muted-foreground">
                        Comprehensive cancer treatment benefits
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      ${(quote.monthly_premium || 0).toFixed(2)}/mo
                    </div>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log('View details for cancer plan:', quote);
                        }}
                      >
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          selectCancerPlan(quote);
                          setShowCancerModal(false);
                        }}
                      >
                        Select Plan
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Additional Information Collection Modal */}
      <Dialog open={showAdditionalInfoModal} onOpenChange={setShowAdditionalInfoModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Additional Information Required</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              To provide accurate quotes for {currentCoverageType}, we need some additional information:
            </p>
            
            <div className="space-y-4">
              {missingFields.map((field, index) => (
                <div key={index} className="space-y-2">
                  <label className="text-sm font-medium">{field}</label>
                  
                  {field === 'Current Medications' && (
                    <div className="space-y-2">
                      <textarea
                        className="w-full p-2 border border-gray-300 rounded-md"
                        rows={3}
                        placeholder="List any current medications..."
                        value={additionalFormData.medications || ''}
                        onChange={(e) => setAdditionalFormData(prev => ({
                          ...prev,
                          medications: e.target.value.split(',').map(med => med.trim()).filter(med => med)
                        }))}
                      />
                      <p className="text-xs text-gray-500">Separate multiple medications with commas</p>
                    </div>
                  )}
                  
                  {field === 'Preferred Pharmacy' && (
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Enter your preferred pharmacy..."
                      value={additionalFormData.pharmacy || ''}
                      onChange={(e) => setAdditionalFormData(prev => ({
                        ...prev,
                        pharmacy: e.target.value
                      }))}
                    />
                  )}
                  
                  {field === 'Last Dental Visit' && (
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={additionalFormData.lastDentalVisit || ''}
                      onChange={(e) => setAdditionalFormData(prev => ({
                        ...prev,
                        lastDentalVisit: e.target.value
                      }))}
                    >
                      <option value="">Select...</option>
                      <option value="within-6-months">Within 6 months</option>
                      <option value="6-12-months">6-12 months ago</option>
                      <option value="1-2-years">1-2 years ago</option>
                      <option value="more-than-2-years">More than 2 years ago</option>
                      <option value="never">Never</option>
                    </select>
                  )}
                  
                  {field === 'Vision Needs' && (
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={additionalFormData.needsGlasses || ''}
                      onChange={(e) => setAdditionalFormData(prev => ({
                        ...prev,
                        needsGlasses: e.target.value
                      }))}
                    >
                      <option value="">Select...</option>
                      <option value="glasses">Need glasses/contacts</option>
                      <option value="reading-only">Reading glasses only</option>
                      <option value="no-vision-needs">No vision needs</option>
                    </select>
                  )}
                  
                  {field === 'Hearing Aids Needed' && (
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={additionalFormData.hearingAids || ''}
                      onChange={(e) => setAdditionalFormData(prev => ({
                        ...prev,
                        hearingAids: e.target.value
                      }))}
                    >
                      <option value="">Select...</option>
                      <option value="yes">Yes, I need hearing aids</option>
                      <option value="considering">Considering hearing aids</option>
                      <option value="no">No hearing aids needed</option>
                    </select>
                  )}
                  
                  {/* Cancer Insurance Fields */}
                  {field === 'State' && currentCoverageType.includes('cancer') && (
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={additionalFormData.state || ''}
                      onChange={(e) => setAdditionalFormData(prev => ({
                        ...prev,
                        state: e.target.value
                      }))}
                    >
                      <option value="">Select...</option>
                      <option value="TX">Texas</option>
                      <option value="GA">Georgia</option>
                    </select>
                  )}
                  
                  {field === 'Family Type' && (
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={additionalFormData.familyType || ''}
                      onChange={(e) => setAdditionalFormData(prev => ({
                        ...prev,
                        familyType: e.target.value
                      }))}
                    >
                      <option value="">Select...</option>
                      <option value="individual">Individual Only</option>
                      <option value="family">Family Coverage</option>
                    </select>
                  )}
                  
                  {field === 'Carcinoma In Situ Benefit' && (
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={additionalFormData.carcinomaInSitu || ''}
                      onChange={(e) => setAdditionalFormData(prev => ({
                        ...prev,
                        carcinomaInSitu: e.target.value === 'true'
                      }))}
                    >
                      <option value="">Select...</option>
                      <option value="false">25% of benefit amount</option>
                      <option value="true">100% of benefit amount</option>
                    </select>
                  )}
                  
                  {field === 'Premium Payment Mode' && (
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={additionalFormData.premiumMode || ''}
                      onChange={(e) => setAdditionalFormData(prev => ({
                        ...prev,
                        premiumMode: e.target.value
                      }))}
                    >
                      <option value="">Select...</option>
                      <option value="monthly">Monthly Bank Draft</option>
                      <option value="annual">Annual Payment</option>
                    </select>
                  )}
                  
                  {field === 'Benefit Amount' && (
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={additionalFormData.benefitAmount || ''}
                      onChange={(e) => setAdditionalFormData(prev => ({
                        ...prev,
                        benefitAmount: e.target.value
                      }))}
                    >
                      <option value="">Select...</option>
                      <option value="10000">$10,000</option>
                      <option value="25000">$25,000</option>
                      <option value="50000">$50,000</option>
                      <option value="75000">$75,000</option>
                      <option value="100000">$100,000</option>
                    </select>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowAdditionalInfoModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  // Merge additional form data with existing form data
                  const existingFormData = await loadFromStorage(QUOTE_FORM_DATA_KEY, {});
                  const updatedFormData = {
                    ...existingFormData,
                    ...additionalFormData
                  };
                  
                  // Proceed with quote generation
                  await proceedWithQuoteGeneration(currentCoverageType, updatedFormData);
                }}
                disabled={missingFields.some(field => {
                  switch (field) {
                    case 'Current Medications': return !additionalFormData.medications || additionalFormData.medications.length === 0;
                    case 'Preferred Pharmacy': return !additionalFormData.pharmacy;
                    case 'Last Dental Visit': return !additionalFormData.lastDentalVisit;
                    case 'Vision Needs': return !additionalFormData.needsGlasses;
                    case 'Hearing Aids Needed': return !additionalFormData.hearingAids;
                    case 'State': return !additionalFormData.state;
                    case 'Family Type': return !additionalFormData.familyType;
                    case 'Carcinoma In Situ Benefit': return additionalFormData.carcinomaInSitu === null || additionalFormData.carcinomaInSitu === undefined;
                    case 'Premium Payment Mode': return !additionalFormData.premiumMode;
                    case 'Benefit Amount': return !additionalFormData.benefitAmount;
                    default: return false;
                  }
                })}
              >
                Continue with Quote Generation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Shared Missing Fields Modal */}
      <MissingFieldsModal
        isOpen={showMissingFieldsModal}
        onClose={() => setShowMissingFieldsModal(false)}
        onSubmit={handleSharedModalSubmit}
        categoryId={selectedCoverageCategory}
        categoryName={coverageDisplayName}
        missingFields={[]} // Will be calculated internally
        initialFormData={initialFormDataForModal}
      />

    </TabsContent>
  );
};
