/**
 * Simplified Hospital Indemnity Plan Builder Component
 * Uses dropdown-based UI similar to Protection Series example
 */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FaArrowLeft, FaInfoCircle } from 'react-icons/fa';
import Image from 'next/image';
import { 
  FaDollarSign as DollarSignIcon, 
  FaCheckCircle as CheckCircleIcon, 
  FaHospital as HospitalIcon,
  FaStar as Star
} from 'react-icons/fa';

import { OptimizedHospitalIndemnityQuote } from '@/lib/hospital-indemnity-quote-optimizer';
import { amBestToStars } from '@/utils/amBestRating';
import { AmBestStarRating } from '@/components/ui/star-rating';
import { 
  getEnhancedCarrierInfo,
  getCarrierDisplayName as getCarrierDisplayNameFromSystem,
  getSubsidiaryName
} from '@/lib/carrier-system';
import {
  getAllBenefits,
  getMainBenefit,
  getAdditionalRiders,
  getAvailableDailyBenefits as getAvailableDailyBenefitsFromQuote,
  getMainBenefitType,
  shouldShowMainBenefitSelection,
  getPremiumForDailyBenefit,
  getAvailableRiderOptions,
  getIncludedBenefits,
  hasValidBenefitStructure,
  calculateTotalPremium as calculateTotalPremiumSimplified
} from '@/utils/simplifiedHospitalIndemnityBenefits';
import { CarrierSelectionView } from './CarrierSelectionView';

// Helper functions for carrier display
const getCachedLogoUrl = (carrierName: string, carrierId: string): string => {
  const tempQuoteForCarrierInfo = { carrier: { name: carrierName } };
  const enhancedInfo = getEnhancedCarrierInfo(tempQuoteForCarrierInfo, 'hospital-indemnity');
  return enhancedInfo.logoUrl;
};

const getCarrierDisplayName = (carrierName: string, carrierId: string): string => {
  return getCarrierDisplayNameFromSystem(carrierName, 'hospital-indemnity');
};

// Create abbreviated names for rider badges
const abbreviateRiderName = (riderName: string): string => {
  const abbreviations: { [key: string]: string } = {
    // Ambulance services
    'Ambulance Services Rider': 'Ambulance',
    'Ambulance Ben': 'Ambulance',
    'Ambulance -': 'Ambulance',
    'Ambulance': 'Ambulance',
    
    // Emergency and Urgent Care
    'ER & Urgent Care Benefit Rider': 'Emergency Care',
    'ER/Urgent Care': 'Emergency Care',
    'Emergency Room Visit due to accident or injury': 'Emergency Care',
    
    // Therapy and Medical Devices
    'OP Therapy & Medical Devices Rider': 'Therapy',
    'OP Therapy 1': 'Therapy',
    'OP Therapy 2': 'Therapy',
    'Physical Therapy Rider': 'Therapy',
    
    // Surgery
    'Outpatient Surgery Rider': 'Surgery',
    'OP Surgery': 'Surgery',
    
    // Hospital Stay
    'Hospital Confinement Benefits': 'Hospital Stay',
    'Hospital Admission': 'Hospital Stay',
    
    // Skilled Nursing
    'Skilled Nursing Facility Benefits 1': 'Skilled Nursing',
    'Skilled Nursing Facility Benefits 2': 'Skilled Nursing',
    
    // Other benefits
    'Dental, Vision & Hearing Rider': 'Dental & Vision',
    'Lump Sum Hospital Benefit': 'Lump Sum',
    'Wellness Benefit': 'Wellness'
  };

  if (abbreviations[riderName]) {
    return abbreviations[riderName];
  }

  // Apply intelligent abbreviation rules
  let abbreviated = riderName
    .replace(/\s+Rider\s*$/gi, '')
    .replace(/\s+\d+\s*$/g, '')
    .replace(/\bServices?\b/gi, '')
    .replace(/\bBenefit(s)?\b/gi, '')
    .replace(/\bOutpatient\b/gi, 'OP')
    .replace(/\bEmergency Room\b/gi, 'Emergency')
    .replace(/\bSkilled Nurse\b/gi, 'Skilled Nursing')
    .replace(/\s+/g, ' ')
    .trim();

  if (abbreviated.length > 15) {
    const words = abbreviated.split(' ');
    if (words.length > 2) {
      abbreviated = words.slice(0, 2).join(' ');
    } else if (abbreviated.length > 15) {
      abbreviated = abbreviated.substring(0, 12);
    }
  }

  return abbreviated;
};

interface SimplifiedHospitalIndemnityPlanBuilderProps {
  quotes: OptimizedHospitalIndemnityQuote[];
  onPlanBuilt: (config: any) => void;
  /** Hide the internal header (carrier title + Change button) when an outer container supplies its own */
  hideHeader?: boolean;
}

interface RiderSelection {
  riderName: string;
  selectedOption: any;
  // For grouped riders
  isGrouped?: boolean;
  selectedVariant?: string; // The variant name (e.g., "Skilled Nursing Facility Benefits 1")
}

export function SimplifiedHospitalIndemnityPlanBuilder({ 
  quotes, 
  onPlanBuilt,
  hideHeader = false
}: SimplifiedHospitalIndemnityPlanBuilderProps) {
  // URL parameter handling
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get company from URL params
  const urlCompany = searchParams.get('company');
  
  // View management
  const [currentView, setCurrentView] = useState<'carriers' | 'configuration'>(
    urlCompany ? 'configuration' : 'carriers'
  );
  
  const [selectedCompany, setSelectedCompany] = useState<string>(urlCompany || '');
  const [selectedPlanOption, setSelectedPlanOption] = useState<string>('');
  const [selectedBenefitDays, setSelectedBenefitDays] = useState<number | null>(null);
  const [selectedDailyBenefit, setSelectedDailyBenefit] = useState<number | null>(null);
  const [selectedRiders, setSelectedRiders] = useState<RiderSelection[]>([]);
  const [groupedRiderSelections, setGroupedRiderSelections] = useState<{ [key: string]: { variant: string; option: any } }>({});
  const [automaticBenefitIncrease, setAutomaticBenefitIncrease] = useState<boolean>(false);
  const [gpoRider, setGpoRider] = useState<boolean>(false);
  const [selectedPlanTier, setSelectedPlanTier] = useState<string>('');
  const [finalQuote, setFinalQuote] = useState<OptimizedHospitalIndemnityQuote | null>(null);

  // Precompute primitive company param value so dependency array size stays constant
  const companyParam = searchParams.get('company') || '';

  // Effect to handle URL parameter changes (with fuzzy brand->legal name resolution)
  useEffect(() => {
    const raw = companyParam || null;
    if (!raw) {
      if (selectedCompany) {
        setSelectedCompany('');
        setCurrentView('carriers');
        setSelectedPlanOption('');
        setSelectedBenefitDays(null);
        setSelectedDailyBenefit(null);
        setSelectedRiders([]);
        setGroupedRiderSelections({});
        setAutomaticBenefitIncrease(false);
        setGpoRider(false);
        setSelectedPlanTier('');
        setFinalQuote(null);
      }
      return;
    }

    // Try to resolve short brand (e.g. "Aetna") to the internal grouped company key
    const resolveCompany = (value: string): string | null => {
      // availableCompanies is defined later; we can derive from quotes here instead (lightweight pass)
      const candidates = new Set<string>();
      quotes.forEach(q => { const full = q.companyFullName || q.companyName; if (full) candidates.add(normalizeCompany(full) || full); });
      const lowerValue = value.toLowerCase();
      // Direct match first
      for (const c of candidates) { if (c === value) return c; }
      // Brand display name match
      for (const c of candidates) { try { const display = getCarrierDisplayNameFromSystem(c, 'hospital-indemnity'); if (display === value) return c; } catch {} }
      // Substring / parenthetical match: if full legal contains (Brand) or starts/ends with brand
      for (const c of candidates) { const lc = c.toLowerCase(); if (lc.includes('(' + lowerValue + ')') || lc.endsWith(' ' + lowerValue) || lc.startsWith(lowerValue + ' ')) return c; }
      return null;
    };

    const resolved = resolveCompany(raw) || raw;
    if (resolved !== selectedCompany) {
      setSelectedCompany(resolved);
      setCurrentView('configuration');
      // Reset other selections when company changes
      setSelectedPlanOption('');
      setSelectedBenefitDays(null);
      setSelectedDailyBenefit(null);
      setSelectedRiders([]);
      setGroupedRiderSelections({});
      setAutomaticBenefitIncrease(false);
      setGpoRider(false);
      setSelectedPlanTier('');
      setFinalQuote(null);
    }
  // Dependencies use only primitives to avoid dynamic dependency list length changes
  }, [companyParam, selectedCompany, quotes]);

  // Effect to handle plan configuration changes (checkboxes and tier selection)
  useEffect(() => {
    if (selectedPlanOption) {
      // Reset dependent selections when plan configuration changes
      setSelectedBenefitDays(null);
      setSelectedDailyBenefit(null);
      setSelectedRiders([]);
      setGroupedRiderSelections({});
      setFinalQuote(null);
    }
  }, [automaticBenefitIncrease, gpoRider, selectedPlanTier]);

  // Filter valid quotes
  // Normalize company names (strip common suffixes, extra spaces) for grouping
  const normalizeCompany = (name: string | undefined): string => {
    if (!name) return '';
    return name
      .replace(/life insurance company$/i,'')
      .replace(/insurance company$/i,'')
      .replace(/insurance co\.?$/i,'')
      .replace(/company$/i,'')
      .replace(/\s+/g,' ') // collapse spaces
      .trim();
  };

  const availableQuotes = useMemo(() => {
    const valid = quotes.filter(quote => hasValidBenefitStructure(quote));
    if (valid.length) return valid;
    // Fallback: if optimizer produced zero "valid" quotes, allow raw quotes through so user can still build minimally
    console.warn('[hospital builder] no quotes passed hasValidBenefitStructure; falling back to all quotes (len=' + quotes.length + ')');
    return quotes;
  }, [quotes]);

  // Get available companies
  const availableCompanies = useMemo(() => {
    const companies = new Map<string, OptimizedHospitalIndemnityQuote[]>();
    availableQuotes.forEach(quote => {
      const companyRaw = quote.companyFullName || quote.companyName;
      const company = normalizeCompany(companyRaw) || companyRaw || 'Unknown Carrier';
      if (!companies.has(company)) {
        companies.set(company, []);
      }
      companies.get(company)!.push(quote);
    });
    return Array.from(companies.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [availableQuotes]);

  // Get quotes for selected company
  const companyQuotes = useMemo(() => {
    if (!selectedCompany) return [];
    return availableQuotes.filter(q => {
      const companyRaw = q.companyFullName || q.companyName;
      return normalizeCompany(companyRaw) === selectedCompany || companyRaw === selectedCompany;
    });
  }, [availableQuotes, selectedCompany]);

  // BENEFIT LABELS (reintroduced after refactor) --------------------------------------------------
  const benefitLabels = useMemo(() => {
    // Detect benefit type from first company quote (very lightweight heuristic)
    const sample = companyQuotes[0];
    // If any benefit option mentions 'admission' choose admission labeling; else default daily benefit
    const looksAdmission = sample?.basePlans?.some((bp: any) => bp?.benefitOptions?.some((o: any) => /admission/i.test(o?.amount || '')));
    if (looksAdmission) {
      return {
        label: 'Admission Benefit Amount',
        placeholder: 'Choose admission amount...',
        format: (amount: number) => `$${amount}`
      };
    }
    return {
      label: 'Daily Benefit Amount',
      placeholder: 'Choose daily benefit...',
      format: (amount: number) => `$${amount}/day`
    };
  }, [companyQuotes]);

  // Get available plan options (simplified) with defensive fallback synthesis if list is empty
  const availablePlanOptions = useMemo(() => {
    if (!selectedCompany) return [];
    const rawNames = companyQuotes.map(q => q.planName).filter(Boolean) as string[];
    const planNames = [...new Set(rawNames)];
    console.log('🔍 Original plan names for', selectedCompany + ':', planNames);

    // Fallback chain if empty:
    if (planNames.length === 0) {
      // Attempt to derive distinct main benefit descriptors to present as pseudo plan options
      const benefitDerived = companyQuotes
        .map(q => {
          try {
            const main = getMainBenefit(q as any);
            if (main?.name) return main.name.replace(/Benefit$/i,'').trim();
          } catch {}
          return null;
        })
        .filter(Boolean) as string[];
      const uniqueBenefitNames = [...new Set(benefitDerived)];
      if (uniqueBenefitNames.length) {
        console.warn('⚠️ Using main benefit names as plan options:', uniqueBenefitNames);
        return uniqueBenefitNames;
      }
      if (companyQuotes.length) {
        console.warn('⚠️ Using generic fallback plan option');
        return ['Base Plan'];
      }
      return [];
    }

    const simplified = planNames.map(name => {
      let base = name
        .replace(/\s+with\s+GPO\s+Rider/gi, '')
        .replace(/\s+with\s+Automatic\s+Benefit\s+Increase\s+Rider/gi, '')
        .replace(/\s*-\s*(Core|Preferred|Premier|Elite)\s+Option\s+\d+/gi, '')
        .replace(/\s+(Elite|Core|Premier|Preferred)\s*/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      console.log('📝 Simplified:', name, '->', base);
      return base || name || 'Plan';
    });
    const unique = [...new Set(simplified)].filter(Boolean);
    if (!unique.length && companyQuotes.length) {
      console.warn('⚠️ Simplification produced empty list, falling back to raw first name');
      return [companyQuotes[0].planName || 'Plan'];
    }
    console.log('✅ Final simplified plan options:', unique);
    return unique;
  }, [companyQuotes, selectedCompany]);

  // Helper function to construct actual plan name from all selected options
  const getActualPlanName = (
    basePlanName: string, 
    tier: string = '', 
    includeAutomaticBenefitIncrease: boolean = false,
    includeGpo: boolean = false
  ): string => {
    // This function is now mainly for display purposes in the plan summary
    let planName = basePlanName;
    
    if (tier) {
      planName = `${planName} ${tier}`;
    }
    
    if (includeGpo) {
      planName += ' with GPO Rider';
    }
    if (includeAutomaticBenefitIncrease) {
      planName += ' with Automatic Benefit Increase Rider';
    }
    
    return planName;
  };

  // Check if Automatic Benefit Increase Rider is available for the selected plan
  const isAutomaticBenefitIncreaseAvailable = useMemo(() => {
    if (!selectedPlanOption || !selectedCompany) return false;
    
    // Check if there are any plans with "Automatic Benefit Increase Rider" for this plan option
    const withRiderPlanName = `${selectedPlanOption} with Automatic Benefit Increase Rider`;
    const hasRiderVersion = companyQuotes.some(q => q.planName === withRiderPlanName);
    
    return hasRiderVersion;
  }, [selectedPlanOption, selectedCompany, companyQuotes]);

  // Check if GPO Rider is available for the selected plan
  const isGpoRiderAvailable = useMemo(() => {
    if (!selectedPlanOption || !selectedCompany) return false;
    
    // Debug: log all plan names for this company
    console.log('🔍 Checking GPO availability for:', selectedPlanOption);
    console.log('📋 Available plan names:', companyQuotes.map(q => q.planName));
    
    // Get the base plan name from selectedPlanOption (remove day count)
    const basePlanPattern = selectedPlanOption.replace(/\s*-\s*\d+\s*Day.*$/i, '').trim();
    console.log('🔍 Base plan pattern:', basePlanPattern);
    
    // Check if there are any plans with "with GPO Rider" pattern
    const hasGpoVersion = companyQuotes.some(q => {
      const planNameLower = q.planName.toLowerCase();
      const basePatternLower = basePlanPattern.toLowerCase();
      
      // Check if this plan starts with our base plan and has GPO
      const startsWithBasePlan = planNameLower.startsWith(basePatternLower.toLowerCase());
      const hasGpoInName = planNameLower.includes('with gpo rider') || planNameLower.includes('gpo rider');
      
      if (startsWithBasePlan && hasGpoInName) {
        console.log('✅ Found matching GPO plan:', q.planName);
      }
      
      return startsWithBasePlan && hasGpoInName;
    });
    
    console.log('🎯 GPO Rider available:', hasGpoVersion);
    
    return hasGpoVersion;
  }, [selectedPlanOption, selectedCompany, companyQuotes]);

  // Get available plan tiers for the selected plan
  const availablePlanTiers = useMemo(() => {
    if (!selectedPlanOption || !selectedCompany) return [];
    
    console.log('🔍 Checking tiers for:', selectedPlanOption);
    
    const planTiers = new Set<string>();
    
    companyQuotes.forEach(quote => {
      // Look for plans that match our base plan
      const planNameLower = quote.planName.toLowerCase();
      const selectedLower = selectedPlanOption.toLowerCase();
      
      // Check if this plan matches our base plan
      if (planNameLower.includes(selectedLower) || selectedLower.includes(planNameLower.split(' -')[0]?.toLowerCase() || '')) {
        // Look for tier patterns like "Core Option", "Preferred Option", "Premier Option", "Elite"
        const tierMatch = quote.planName.match(/\b(Core|Preferred|Premier|Elite)\s*(?:Option\s*\d+)?/i);
        if (tierMatch) {
          const tierName = tierMatch[1];
          console.log('🎯 Found tier:', tierName, 'in plan:', quote.planName);
          planTiers.add(tierName);
        }
      }
    });
    
    console.log('📊 Available tiers:', Array.from(planTiers));
    
    // Sort tiers in a logical order
    const tierOrder = ['Core', 'Premier', 'Preferred', 'Elite'];
    return Array.from(planTiers).sort((a, b) => {
      const orderA = tierOrder.indexOf(a);
      const orderB = tierOrder.indexOf(b);
      return orderA - orderB;
    });
  }, [selectedPlanOption, selectedCompany, companyQuotes]);

  // Effect to reset checkboxes when riders are no longer available
  useEffect(() => {
    if (selectedPlanOption && automaticBenefitIncrease && !isAutomaticBenefitIncreaseAvailable) {
      setAutomaticBenefitIncrease(false);
    }
    if (selectedPlanOption && gpoRider && !isGpoRiderAvailable) {
      setGpoRider(false);
    }
  }, [selectedPlanOption, isAutomaticBenefitIncreaseAvailable, automaticBenefitIncrease, isGpoRiderAvailable, gpoRider]);

  // Get available benefit days for selected plan
  const availableBenefitDays = useMemo(() => {
    if (!selectedPlanOption) return [];
    const actualPlanName = getActualPlanName(selectedPlanOption, selectedPlanTier, automaticBenefitIncrease, gpoRider);
    const filteredQuotes = companyQuotes.filter(q => q.planName === actualPlanName);
    const daysSet = new Set<number>();
    
    filteredQuotes.forEach(quote => {
      // Extract days from plan name
      const dayMatch = quote.planName.match(/(\d+)\s*(?:benefit\s*)?days?/i);
      if (dayMatch) {
        daysSet.add(parseInt(dayMatch[1]));
      }
    });
    
    return Array.from(daysSet).sort((a, b) => a - b);
  }, [companyQuotes, selectedPlanOption, selectedPlanTier, automaticBenefitIncrease, gpoRider]);

  // Get available daily benefits for current selection
  const availableDailyBenefits = useMemo(() => {
    if (!selectedCompany || !selectedPlanOption) return [];
    
    // Get daily benefits from any plan that matches the base plan name
    const basePlanPattern = selectedPlanOption.replace(/\s*-\s*\d+\s*Day.*$/i, '').trim();
    let matchingQuotes = companyQuotes.filter(q => q.planName.includes(basePlanPattern));
    
    if (selectedBenefitDays) {
      matchingQuotes = matchingQuotes.filter(q => {
        const dayMatch = q.planName.match(/(\d+)\s*(?:benefit\s*)?days?/i);
        return dayMatch && parseInt(dayMatch[1]) === selectedBenefitDays;
      });
    }

    if (matchingQuotes.length === 0) return [];
    
    // Get all available daily benefits from the first matching quote
    const quote = matchingQuotes[0];
    return getAvailableDailyBenefitsFromQuote(quote);
  }, [companyQuotes, selectedPlanOption, selectedBenefitDays]);

  // Get current quote for configuration
  const currentQuote = useMemo(() => {
    console.log('🔄 currentQuote useMemo triggered with:', {
      selectedCompany,
      selectedPlanOption,
      selectedDailyBenefit,
      selectedPlanTier,
      gpoRider,
      automaticBenefitIncrease
    });
    
    if (!selectedCompany || !selectedPlanOption) {
      console.log('❌ Missing company or plan option for currentQuote');
      return null;
    }
    
    // If no daily benefit is selected yet, try to use the first available one
    let dailyBenefitToUse = selectedDailyBenefit;
    if (!dailyBenefitToUse && availableDailyBenefits.length > 0) {
      dailyBenefitToUse = availableDailyBenefits[0];
      console.log('🔧 Auto-selecting first available daily benefit:', dailyBenefitToUse);
    }
    
    if (!dailyBenefitToUse) {
      console.log('❌ No daily benefit available');
      return null;
    }
    
    console.log('🔍 Looking for quote with:');
    console.log('  - Base plan:', selectedPlanOption);
    console.log('  - Tier:', selectedPlanTier);
    console.log('  - GPO:', gpoRider);
    console.log('  - Auto Benefit:', automaticBenefitIncrease);
    console.log('📋 Available plans:', companyQuotes.map(q => q.planName));
    
    // Build search criteria
    let filteredQuotes = companyQuotes;
    
    // Filter by base plan name
    const basePlanPattern = selectedPlanOption.replace(/\s*-\s*\d+\s*Day.*$/i, '').trim();
    filteredQuotes = filteredQuotes.filter(q => q.planName.includes(basePlanPattern));
    console.log('🎯 After base plan filter:', filteredQuotes.length, 'quotes');
    
    // Filter by tier if selected
    if (selectedPlanTier) {
      filteredQuotes = filteredQuotes.filter(q => q.planName.includes(selectedPlanTier));
      console.log('🎯 After tier filter:', filteredQuotes.length, 'quotes');
    }
    
    // Filter by GPO if selected
    if (gpoRider) {
      filteredQuotes = filteredQuotes.filter(q => 
        q.planName.toLowerCase().includes('with gpo rider') || 
        q.planName.toLowerCase().includes('gpo rider')
      );
      console.log('🎯 After GPO filter:', filteredQuotes.length, 'quotes');
    } else {
      // If GPO not selected, exclude GPO plans
      filteredQuotes = filteredQuotes.filter(q => 
        !q.planName.toLowerCase().includes('with gpo rider') && 
        !q.planName.toLowerCase().includes('gpo rider')
      );
      console.log('🎯 After excluding GPO:', filteredQuotes.length, 'quotes');
    }
    
    // Filter by automatic benefit increase if selected
    if (automaticBenefitIncrease) {
      filteredQuotes = filteredQuotes.filter(q => 
        q.planName.toLowerCase().includes('automatic benefit increase') ||
        q.planName.toLowerCase().includes('abi')
      );
      console.log('🎯 After ABI filter:', filteredQuotes.length, 'quotes');
    }
    
    // Filter by benefit days if specified
    if (selectedBenefitDays) {
      filteredQuotes = filteredQuotes.filter(q => {
        const dayMatch = q.planName.match(/(\d+)\s*(?:benefit\s*)?days?/i);
        return dayMatch && parseInt(dayMatch[1]) === selectedBenefitDays;
      });
      console.log('🎯 After benefit days filter:', filteredQuotes.length, 'quotes');
    }

    if (filteredQuotes.length === 0) {
      console.log('❌ No matching quotes found');
      return null;
    }
    
    // Find quote with matching daily benefit
    const finalQuote = filteredQuotes.find(q => {
      const availableBenefits = getAvailableDailyBenefitsFromQuote(q);
      return availableBenefits.includes(dailyBenefitToUse);
    }) || filteredQuotes[0];
    
    console.log('✅ Selected quote:', finalQuote?.planName);
    return finalQuote;
  }, [selectedCompany, companyQuotes, selectedPlanOption, selectedBenefitDays, selectedDailyBenefit, selectedPlanTier, automaticBenefitIncrease, gpoRider, availableDailyBenefits]);

  // Riders available for current quote (extracted from structure)
  const availableRiders = useMemo(() => {
    if (!currentQuote) return [] as any[];
    try {
      return getAdditionalRiders(currentQuote) || [];
    } catch {
      return [] as any[];
    }
  }, [currentQuote]);

  // NOTE: removed duplicate availablePlanOptions useMemo & erroneous switch fragment introduced during refactor

  // Determine if we should show the main benefit selection dropdown
  const showMainBenefitSelection = useMemo(() => {
    // Use currentQuote if available, otherwise use first available quote from company
    const quoteToCheck = currentQuote || (companyQuotes.length > 0 ? companyQuotes[0] : null);
    if (!quoteToCheck) return true;
    return shouldShowMainBenefitSelection(quoteToCheck);
  }, [currentQuote, companyQuotes]);

  // Auto-select daily benefit when dropdown is hidden (only one option available)
  useEffect(() => {
    if (!showMainBenefitSelection && availableDailyBenefits.length === 1 && !selectedDailyBenefit) {
      setSelectedDailyBenefit(availableDailyBenefits[0]);
    }
  }, [showMainBenefitSelection, availableDailyBenefits, selectedDailyBenefit]);

  // Calculate total premium
  const totalPremium = useMemo(() => {
    if (!currentQuote || !selectedDailyBenefit) return 0;
    
    let basePremium = getPremiumForDailyBenefit(currentQuote, selectedDailyBenefit);
    
    // Add ungrouped riders
    selectedRiders.forEach(riderSelection => {
      if (riderSelection.selectedOption) {
        basePremium += riderSelection.selectedOption.rate;
      }
    });
    
    // Add grouped riders
    Object.values(groupedRiderSelections).forEach(selection => {
      if (selection.option) {
        basePremium += selection.option.rate;
      }
    });
    
    return basePremium;
  }, [currentQuote, selectedDailyBenefit, selectedRiders, groupedRiderSelections]);

  // Reset selections when company changes
  const handleCompanyChange = (company: string) => {
    setSelectedCompany(company);
    setSelectedPlanOption('');
    setSelectedBenefitDays(null);
    setSelectedDailyBenefit(null);
    setSelectedRiders([]);
    setGroupedRiderSelections({});
    setFinalQuote(null);
  };

  // Reset subsequent selections when plan option changes
  const handlePlanOptionChange = (planOption: string) => {
    setSelectedPlanOption(planOption);
    setSelectedBenefitDays(null);
    setSelectedDailyBenefit(null);
    setSelectedRiders([]);
    setGroupedRiderSelections({});
    setFinalQuote(null);
    
    // Reset automatic benefit increase if not available for the new plan
    const withRiderPlanName = `${planOption} with Automatic Benefit Increase Rider`;
    const hasRiderVersion = companyQuotes.some(q => q.planName === withRiderPlanName);
    if (!hasRiderVersion) {
      setAutomaticBenefitIncrease(false);
    }
    
    // Reset GPO rider if not available for the new plan
    const withGpoRiderPattern = new RegExp(`${planOption.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*with\\s+GPO\\s+Rider`, 'i');
    const hasGpoVersion = companyQuotes.some(q => withGpoRiderPattern.test(q.planName));
    if (!hasGpoVersion) {
      setGpoRider(false);
    }
    
    // Reset plan tier - let user choose from available tiers
    setSelectedPlanTier('');
  };

  // Handle rider selection
  const handleRiderToggle = (riderName: string, checked: boolean, selectedOption?: any) => {
    setSelectedRiders(prev => {
      if (checked && selectedOption) {
        const existing = prev.find(r => r.riderName === riderName);
        if (existing) {
          return prev.map(r => 
            r.riderName === riderName 
              ? { ...r, selectedOption }
              : r
          );
        } else {
          return [...prev, { riderName, selectedOption }];
        }
      } else {
        return prev.filter(r => r.riderName !== riderName);
      }
    });
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Get the relevant benefit option for included benefits based on current selection
  const getRelevantBenefitOption = (benefit: any, selectedDailyBenefit: number | null) => {
    if (!benefit.benefitOptions || benefit.benefitOptions.length === 0) {
      return null;
    }

    // If we have a selected daily benefit, try to find a matching option
    if (selectedDailyBenefit) {
      // For benefits that scale with the base benefit (like "25% of Base Benefit Day")
      const scaledOption = benefit.benefitOptions.find((option: any) => {
        // Look for patterns like "25% of Base Benefit Day" or similar scaling
        const amount = option.amount?.toString().toLowerCase();
        return amount?.includes('base benefit') || amount?.includes('%');
      });
      
      if (scaledOption) {
        return scaledOption;
      }

      // For fixed amount benefits, try to find one that matches our selection level
      const matchingOption = benefit.benefitOptions.find((option: any) => {
        const optionAmount = parseInt(option.amount?.toString().replace(/[^0-9]/g, '') || '0');
        return optionAmount > 0;
      });
      
      if (matchingOption) {
        return matchingOption;
      }
    }

    // Fallback: return the first option
    return benefit.benefitOptions[0];
  };

  // Group related riders (like "Skilled Nursing Facility Benefits 1" and "Skilled Nursing Facility Benefits 2")
  const groupRelatedRiders = (riders: any[]) => {
    const groupedRiders: { [key: string]: any } = {};
    const ungroupedRiders: any[] = [];

    riders.forEach(rider => {
      // Look for patterns like "Name 1", "Name 2", "Name Rider 1", "Name Rider 2"
      const match = rider.name.match(/^(.+?)\s+(?:Rider\s+)?(\d+)$/i);
      
      if (match) {
        const baseName = match[1].trim();
        const number = match[2];
        
        if (!groupedRiders[baseName]) {
          groupedRiders[baseName] = {
            baseName,
            variants: [],
            isGrouped: true
          };
        }
        
        groupedRiders[baseName].variants.push({
          ...rider,
          variantNumber: number,
          variantLabel: rider.notes || `Option ${number}`
        });
      } else {
        ungroupedRiders.push({
          ...rider,
          isGrouped: false
        });
      }
    });

    // Sort variants within each group by number
    Object.values(groupedRiders).forEach((group: any) => {
      group.variants.sort((a: any, b: any) => parseInt(a.variantNumber) - parseInt(b.variantNumber));
    });

    return {
      groupedRiders: Object.values(groupedRiders),
      ungroupedRiders
    };
  };

  // Get grouped riders for current quote
  const { groupedRiders, ungroupedRiders } = useMemo(() => {
    if (!currentQuote || availableRiders.length === 0) {
      return { groupedRiders: [], ungroupedRiders: [] };
    }
    return groupRelatedRiders(availableRiders);
  }, [currentQuote, availableRiders]);

  // Included benefits for summary sections
  const includedBenefits = useMemo(() => {
    if (!currentQuote) return [] as any[];
    try { return getIncludedBenefits(currentQuote); } catch { return [] as any[]; }
  }, [currentQuote]);

  // Get carrier display name with fallback
  const getCarrierDisplayName = (company: string): string => {
    try {
      return getCarrierDisplayNameFromSystem(company, 'hospital-indemnity');
    } catch {
      return company;
    }
  };

  // Get cached logo URL with fallback
  const getCachedLogoUrl = (company: string): string => {
    try {
      const enhancedInfo = getEnhancedCarrierInfo(company, 'hospital-indemnity');
      return enhancedInfo.logoUrl || '/images/carrier-placeholder.svg';
    } catch {
      return '/images/carrier-placeholder.svg';
    }
  };

  return (
    <>
      <style jsx>{`
        .radio-filled {
          --tw-ring-offset-shadow: 0 0 #0000;
          --tw-ring-shadow: 0 0 #0000;
          --tw-shadow: 0 0 #0000;
        }
        .radio-filled[data-state="checked"] {
          background-color: #3b82f6 !important;
          border-color: #3b82f6 !important;
        }
        .radio-filled[data-state="checked"] > span {
          background-color: #3b82f6 !important;
          width: 100% !important;
          height: 100% !important;
          border-radius: 50% !important;
        }
      `}</style>
  <div className="space-y-8">
      {currentView === 'carriers' ? (
        // Carrier Selection View
        <CarrierSelectionView
          quotes={quotes}
          selectedCompany={selectedCompany}
          onCompanySelect={(companyName) => {
            // Update URL with company parameter
            const params = new URLSearchParams(searchParams);
            params.set('company', companyName);
            router.push(`?${params.toString()}`);
          }}
        />
      ) : (
        // Configuration View
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Configuration Panel */}
            <div className="lg:col-span-2">
              <Card>
            <CardContent className="space-y-6">
              {/* Plan Option Selection */}
              {selectedCompany && (
                <div>
                  {!hideHeader && (
                    <div className='flex justify-between items-start'>
                      <h2 className="text-xl font-bold">{selectedCompany}</h2>
                      <div>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const params = new URLSearchParams(searchParams);
                            params.delete('company');
                            router.push(`?${params.toString()}`);
                          }}
                          className="mb-4"
                        >
                          Change
                        </Button>
                      </div>
                    </div>
                  )}
                  <label className="text-sm font-medium mb-2 block">Select Plan Option</label>
                  <Select value={selectedPlanOption} onValueChange={handlePlanOptionChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose plan type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePlanOptions.map(planName => (
                        <SelectItem key={planName} value={planName}>
                          {planName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Automatic Benefit Increase Rider Checkbox */}
              {selectedPlanOption && isAutomaticBenefitIncreaseAvailable && (
                <div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="automatic-benefit-increase"
                      checked={automaticBenefitIncrease}
                      onCheckedChange={(checked) => setAutomaticBenefitIncrease(checked === true)}
                    />
                    <Label htmlFor="automatic-benefit-increase" className="text-sm font-medium cursor-pointer">
                      Automatic Benefit Increase Rider
                    </Label>
                  </div>
                </div>
              )}

              {/* GPO Rider Checkbox */}
              {selectedPlanOption && isGpoRiderAvailable && (
                <div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="gpo-rider"
                      checked={gpoRider}
                      onCheckedChange={(checked) => {
                        console.log('🔧 GPO checkbox changed to:', checked);
                        setGpoRider(checked === true);
                      }}
                    />
                    <Label htmlFor="gpo-rider" className="text-sm font-medium cursor-pointer">
                      Guarantee Purchase Option (GPO) Rider
                    </Label>
                  </div>
                </div>
              )}

              {/* Plan Tier Selection */}
              {selectedPlanOption && availablePlanTiers.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Plan Tier</label>
                  <Select value={selectedPlanTier} onValueChange={setSelectedPlanTier}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose plan tier..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePlanTiers.map((tier, index) => (
                        <SelectItem key={`tier-${tier}-${index}`} value={tier}>
                          {tier}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Benefit Days Coverage (if applicable) */}
              {selectedPlanOption && availableBenefitDays.length > 1 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Benefit Days Coverage</label>
                  <Select 
                    value={selectedBenefitDays?.toString() || ''} 
                    onValueChange={(value) => setSelectedBenefitDays(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose coverage period..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBenefitDays.map(days => (
                        <SelectItem key={days} value={days.toString()}>
                          {days} days
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Benefit Amount */}
              {selectedPlanOption && availableDailyBenefits.length > 0 && showMainBenefitSelection && (
                <div>
                  <label className="text-sm font-medium mb-2 block">{benefitLabels.label}</label>
                  <Select 
                    value={selectedDailyBenefit?.toString() || ''} 
                    onValueChange={(value) => setSelectedDailyBenefit(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={benefitLabels.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDailyBenefits.map(amount => (
                        <SelectItem key={amount} value={amount.toString()}>
                          {benefitLabels.format(amount)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Included Benefits */}
              {currentQuote && includedBenefits.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium mb-2 text-gray-700">Included Benefits</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {includedBenefits.map((benefit, benefitIndex) => {
                      const relevantOption = getRelevantBenefitOption(benefit, selectedDailyBenefit);
                      
                      return (
                        <div key={`benefit-${benefit.name}-${benefitIndex}`} className="border border-green-200 rounded p-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-medium mb-2">{benefit.name}</h5>
                              {relevantOption && (
                                <div className="text-xs text-gray-700">
                                  <span className="font-bold">${relevantOption.amount}</span> {relevantOption.quantifier}
                                </div>
                              )}
                              {benefit.notes && (
                                <p className="text-xs text-gray-700 mt-1 line-clamp-2">
                                  {benefit.notes.split(/(\$\d+(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d+)?%)/g).map((part: string, index: number) => {
                                    if (part.match(/^\$\d+(?:,\d{3})*(?:\.\d{2})?$/) || part.match(/^\d+(?:\.\d+)?%$/)) {
                                      return <span key={index} className="font-bold">{part}</span>;
                                    }
                                    return part;
                                  })}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center text-green-600 ml-2 flex-shrink-0">
                              <CheckCircleIcon className="h-3 w-3" />
                              <span className="text-xs ml-1">Included</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Optional Riders */}
              {currentQuote && (groupedRiders.length > 0 || ungroupedRiders.length > 0) && (
                <div>
                  <h4 className="text-xs font-medium mb-2 text-gray-700">Optional Riders</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    
                    {/* Grouped Riders */}
                    {groupedRiders.map((group: any) => {
                      const selection = groupedRiderSelections[group.baseName];
                      const selectedVariant = selection ? group.variants.find((v: any) => v.name === selection.variant) : null;
                      
                      return (
                        <div key={group.baseName} className="border rounded p-3">
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium">{group.baseName}</h5>

                            {/* Variant Selection */}
                            <div>
                              <Select
                                value={selection?.variant || ''}
                                onValueChange={(value) => {
                                  if (value) {
                                    setGroupedRiderSelections(prev => ({
                                      ...prev,
                                      [group.baseName]: { variant: value, option: null }
                                    }));
                                  } else {
                                    setGroupedRiderSelections(prev => {
                                      const newState = { ...prev };
                                      delete newState[group.baseName];
                                      return newState;
                                    });
                                  }
                                }}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue placeholder="Choose coverage..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {group.variants.map((variant: any) => (
                                    <SelectItem key={variant.name} value={variant.name} className="text-xs">
                                      {variant.variantLabel}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Benefit Amount Selection */}
                            {selectedVariant && selectedVariant.benefitOptions && selectedVariant.benefitOptions.length > 0 && (
                              <div>
                                <RadioGroup
                                  value={selection?.option ? `${selection.option.amount}-${selection.option.rate}` : ''}
                                  onValueChange={(value) => {
                                    if (value) {
                                      const [amount, rate] = value.split('-');
                                      const option = selectedVariant.benefitOptions?.find(
                                        (opt: any) => opt.amount === amount && opt.rate.toString() === rate
                                      );
                                      if (option) {
                                        setGroupedRiderSelections(prev => ({
                                          ...prev,
                                          [group.baseName]: { variant: selection.variant, option }
                                        }));
                                      }
                                      }
                                    }}
                                  >
                                    <div className="space-y-2">
                                      {selectedVariant.benefitOptions.slice(0, 3).map((option: any, index: number) => (
                                        <div key={index} className="flex items-center space-x-1.5">
                                          <RadioGroupItem 
                                            value={`${option.amount}-${option.rate}`} 
                                            id={`${group.baseName}-${index}`}
                                            className="w-3 h-3 radio-filled"
                                          />
                                          <Label htmlFor={`${group.baseName}-${index}`} className="flex-1 cursor-pointer text-xs">
                                            <div className="flex justify-between items-center">
                                              <span>
                                                <span className="font-bold">${option.amount}</span> {option.quantifier || 'per occurrence'}
                                              </span>
                                              <span className="font-medium text-blue-500">
                                                +{formatCurrency(option.rate)}/mo
                                              </span>
                                            </div>
                                          </Label>
                                        </div>
                                      ))}
                                    </div>
                                  </RadioGroup>
                                </div>
                              )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Ungrouped Riders */}
                    {ungroupedRiders.map((rider, riderIndex) => {
                      const isSelected = selectedRiders.some(r => r.riderName === rider.name);
                      const selectedConfig = selectedRiders.find(r => r.riderName === rider.name);

                      return (
                        <div key={`rider-${rider.name}-${riderIndex}`} className="border rounded p-3">
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium">{rider.name}</h5>
                              {rider.notes && (
                                <p className="text-xs text-gray-600">{rider.notes}</p>
                              )}

                              {rider.benefitOptions && rider.benefitOptions.length > 0 && (
                                <div>
                                  <RadioGroup
                                    value={selectedConfig?.selectedOption ? 
                                      `${selectedConfig.selectedOption.amount}-${selectedConfig.selectedOption.rate}` : 
                                      ''
                                    }
                                    onValueChange={(value) => {
                                      if (value) {
                                        const [amount, rate] = value.split('-');
                                        const option = rider.benefitOptions?.find(
                                          (opt: any) => opt.amount === amount && opt.rate.toString() === rate
                                        );
                                        if (option) {
                                          handleRiderToggle(rider.name, true, option);
                                        }
                                      } else {
                                        handleRiderToggle(rider.name, false);
                                      }
                                    }}
                                  >
                                    <div className="space-y-2">
                                      {rider.benefitOptions.slice(0, 3).map((option: any, index: number) => (
                                        <div key={index} className="flex items-center space-x-1.5">
                                          <RadioGroupItem 
                                            value={`${option.amount}-${option.rate}`} 
                                            id={`${rider.name}-${index}`}
                                            className="w-3 h-3 radio-filled"
                                          />
                                          <Label htmlFor={`${rider.name}-${index}`} className="flex-1 cursor-pointer text-xs">
                                            <div className="flex justify-between items-center">
                                              <span>
                                                <span className="font-bold">${option.amount}</span> {option.quantifier || 'per occurrence'}
                                              </span>
                                              <span className="font-medium text-blue-500">
                                                +{formatCurrency(option.rate)}/mo
                                              </span>
                                            </div>
                                          </Label>
                                        </div>
                                      ))}
                                    </div>
                                  </RadioGroup>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Plan Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardContent className="space-y-3">
              {selectedCompany && (
                <div>
                <h3 className="text-sm font-semibold mb-2">Plan Summary</h3>
                  <h4 className="text-xs font-medium text-gray-600">Company:</h4>
                  <p className="text-sm font-medium">{getCarrierDisplayName(selectedCompany)}</p>
                </div>
              )}

              {selectedPlanOption && (
                <div>
                  <h4 className="text-xs font-medium text-gray-600">Plan:</h4>
                  <p className="text-sm font-medium">{selectedPlanOption}</p>
                </div>
              )}

              {selectedBenefitDays && (
                <div>
                  <h4 className="text-xs font-medium text-gray-600">Benefit Days:</h4>
                  <p className="text-sm font-medium">{selectedBenefitDays} days</p>
                </div>
              )}

              {selectedDailyBenefit && (
                <div>
                  <h4 className="text-xs font-medium text-gray-600">{benefitLabels.label.replace(/ Amount$/,'')}:</h4>
                  <p className="text-sm font-medium">
                    <span className="font-bold">{benefitLabels.format(selectedDailyBenefit)}</span>
                  </p>
                </div>
              )}

              {selectedRiders.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-600">Selected Riders:</h4>
                  <div className="space-y-1">
                    {selectedRiders.map((rider, index) => (
                      <div key={index} className="text-xs">
                        {rider.riderName}: <span className="font-bold">${rider.selectedOption.amount}</span> 
                        (+{formatCurrency(rider.selectedOption.rate)}/mo)
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {totalPremium > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-semibold">Total Monthly:</h4>
                    <p className="text-lg font-bold text-blue-500">
                      {formatCurrency(totalPremium)}
                    </p>
                  </div>
                </>
              )}

              {currentQuote && totalPremium > 0 && (
                <Button 
                  className="w-full"
                  onClick={() => onPlanBuilt({
                    quote: currentQuote,
                    selectedDailyBenefit,
                    selectedRiders,
                    totalPremium
                  })}
                >
                  <HospitalIcon className="h-4 w-4 mr-2" />
                  Build This Plan
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
        </div>
        </div>
      )}
      </div>
    </>
  );
}