/**
 * Hospital Indemnity Adaptive Plan Builder
 * Handles real API data with comprehensive rider configuration system
 */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { amBestToStars } from '@/utils/amBestRating';
import { AmBestStarRating } from '@/components/ui/star-rating';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { 
  FaInfoCircle as InfoIcon, 
  FaDollarSign as DollarSignIcon, 
  FaCheckCircle as CheckCircleIcon, 
  FaCog as Settings2Icon,
  FaChartLine as TrendingUpIcon,
  FaShieldAlt as ShieldCheckIcon,
  FaBrain as BrainIcon,
  FaLayerGroup as LayerIcon,
  FaCalendarAlt as CalendarIcon,
  FaHospital as HospitalIcon,
  FaStar as Star
} from 'react-icons/fa';

import { OptimizedHospitalIndemnityQuote } from '@/lib/hospital-indemnity-quote-optimizer';
import { extractBenefitDays, analyzeBenefitDayConfigurations } from './analysis-utilities';
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
  getPremiumForDailyBenefit,
  getAvailableRiderOptions,
  hasValidBenefitStructure,
  calculateTotalPremium as calculateTotalPremiumSimplified
} from '@/utils/simplifiedHospitalIndemnityBenefits';
import {
  detectCompanyRouteConfig,
  getAvailablePlanOptions as getAvailablePlanOptionsFromRoutes,
  extractBenefitDaysForCompany,
  getPrimaryBenefitSourceForCompany,
  filterQuotesByBenefitType,
  determineBenefitType
} from '@/utils/hospitalIndemnityRoutes';
import {
  detectPlanStructure,
  hasSpecialPlanStructure,
  getPlanGroupingSummary,
  getDisplayConfiguration
} from '@/utils/hospitalIndemnityPlanStructures';

interface AdaptiveHospitalIndemnityPlanBuilderProps {
  quotes: OptimizedHospitalIndemnityQuote[];
  onPlanBuilt: (selectedQuote: OptimizedHospitalIndemnityQuote, configuration: any) => void;
}

interface PlanConfiguration {
  benefitDays?: number;
  dailyBenefit?: number;
  selectedRiders?: RiderConfiguration[];
  totalPremium?: number;
  company?: string;
  planType?: string;
  [key: string]: any;
}

interface RiderConfiguration {
  name: string;
  selectedBenefitOption?: {
    amount: string;
    quantifier: string;
    rate: number;
  };
}

interface DayConfiguration {
  days: number;
  available: boolean;
  quoteCount: number;
  minPremium: number;
  maxPremium: number;
}

// Helper functions for carrier display
const getCachedLogoUrl = (carrierName: string, carrierId: string): string => {
  // Use the enhanced carrier info system for hospital indemnity
  const tempQuoteForCarrierInfo = { carrier: { name: carrierName } };
  const enhancedInfo = getEnhancedCarrierInfo(tempQuoteForCarrierInfo, 'hospital-indemnity');
  return enhancedInfo.logoUrl;
};

const getCarrierDisplayName = (carrierName: string, carrierId: string): string => {
  return getCarrierDisplayNameFromSystem(carrierName, 'hospital-indemnity');
};

// Convert A.M. Best rating to star rating (1-5 stars)
// REMOVED: Now using centralized utility function from @/utils/amBestRating

// Create abbreviated names for rider badges
const abbreviateRiderName = (riderName: string): string => {
  // Define comprehensive mapping for consistent badge names
  const abbreviations: { [key: string]: string } = {
    // Ambulance services - all variations map to same
    'Ambulance Services Rider': 'Ambulance',
    'Ambulance Ben': 'Ambulance',
    'Ambulance -': 'Ambulance',
    'Ambulance': 'Ambulance',
    'Ambulance Air/Ground Services': 'Ambulance',
    'Ambulance Air': 'Ambulance',
    'Ambulance Ground': 'Ambulance',
    'Ambulance Ai': 'Ambulance',
    
    // Combined Ambulance and Emergency
    'Ambulance /Emergency': 'Ambulance / ER',
    'Ambulance Emergency': 'Ambulance / ER',
    'Ambulance & Emergency': 'Ambulance / ER',
    'Ambulance and Emergency': 'Ambulance / ER',
    
    // Dental and Vision - all variations
    'Dental, Vision & Hearing Rider': 'Dental & Vision',
    'Dental and Vision': 'Dental & Vision',
    'Dental/Vision': 'Dental & Vision',
    
    // Emergency and Urgent Care
    'ER & Urgent Care Benefit Rider': 'Emergency Care',
    'ER/Urgent Care': 'Emergency Care',
    'Emergency Room Visit due to accident or injury': 'Emergency Care',
    'Emergency Care': 'Emergency Care',
    
    // Diagnostics and Exams
    'OP Dx Svcs & Wellness Rider': 'Diagnostics',
    'OP Dx Exam': 'Diagnostics',
    'OP Diagnostics': 'Diagnostics',
    'Diagnostics': 'Diagnostics',
    
    // Therapy and Medical Devices - consolidate all variations
    'OP Therapy & Medical Devices Rider': 'Therapy',
    'OP Therapy 1': 'Therapy',
    'OP Therapy 2': 'Therapy',
    'OP Therapy': 'Therapy',
    'Physical Therapy Rider': 'Therapy',
    'Therapy/Devices': 'Therapy',
    'Therapy': 'Therapy',
    
    // Surgery - all variations
    'Outpatient Surgery Rider': 'Surgery',
    'OP Surgery': 'Surgery',
    'Outpatient Surgical Benefits': 'Surgery',
    'Surgery': 'Surgery',
    
    // Hospital Stay and related
    'Hospital Confinement Benefits': 'Hospital Stay',
    'Hospital Admission': 'Hospital Stay',
    'Hospital Stay': 'Hospital Stay',
    'Intensive Care': 'Intensive Care',
    'Primary Care': 'Primary Care',
    
    // Lump Sum benefits
    'Lump Sum Hospital Confinement Rider': 'Lump Sum',
    'Lump Sum Cancer': 'Cancer Benefit',
    'Lump Sum': 'Lump Sum',
    
    // Skilled Nursing - all variations
    'Skilled Nurse & Hospice Care Facility Rider 1': 'Skilled Nursing',
    'Skilled Nurse & Hospice Care Facility Rider 2': 'Skilled Nursing',
    'Skilled Nurse w/EP & Hospice Care Facility Rider': 'Skilled Nursing',
    'Skilled Nursing': 'Skilled Nursing',
    
    // Rehabilitation
    'OP Rehabilitation': 'Rehabilitation',
    'OP Rehabilit': 'Rehabilitation',
    'Rehabilitation': 'Rehabilitation',
    
    // Wellness and Preventive
    'Wellness & Preventive Care Rider': 'Wellness',
    'Wellness': 'Wellness',
    
    // Other specific riders
    'Critical Accident': 'Critical Care',
    'Critical Care': 'Critical Care',
    'Chiropractic Services Rider': 'Chiropractic',
    'Medical Equipment Rider': 'Equipment',
    'Home Health Care Rider': 'Home Care',
    'Prescription Drug Rider': 'Prescription'
  };

  // First, check for exact match
  if (abbreviations[riderName]) {
    return abbreviations[riderName];
  }

  // Remove trailing numbers and check again (handles numbered variations)
  const baseNameWithoutNumbers = riderName.replace(/\s+\d+\s*$/, '').trim();
  if (abbreviations[baseNameWithoutNumbers]) {
    return abbreviations[baseNameWithoutNumbers];
  }

  // Remove "Rider" suffix and check
  const withoutRider = riderName.replace(/\s+Rider\s*$/, '').trim();
  if (abbreviations[withoutRider]) {
    return abbreviations[withoutRider];
  }

  // Apply intelligent abbreviation rules
  let abbreviated = riderName
    .replace(/\s+Rider\s*$/gi, '') // Remove "Rider" suffix
    .replace(/\s+\d+\s*$/g, '') // Remove trailing numbers
    .replace(/\bServices?\b/gi, '') // Remove "Service(s)"
    .replace(/\bBenefit(s)?\b/gi, '') // Remove "Benefit(s)"
    .replace(/\bOutpatient\b/gi, 'OP')
    .replace(/\bEmergency Room\b/gi, 'Emergency')
    .replace(/\bUrgent Care\b/gi, 'Urgent')
    .replace(/\bDiagnostic(s)?\b/gi, 'Diagnostics')
    .replace(/\bMedical Equipment\b/gi, 'Equipment')
    .replace(/\bSkilled Nurse\b/gi, 'Skilled Nursing')
    .replace(/\bHospice Care\b/gi, 'Hospice')
    .replace(/\bFacility\b/gi, '')
    .replace(/\bConfinement\b/gi, 'Stay')
    .replace(/\s+&\s+/g, ' & ') // Standardize ampersands
    .replace(/\s*-\s*/g, ' ') // Remove dashes
    .replace(/\s+/g, ' ') // Clean up extra spaces
    .trim();

  // Ensure reasonable length (no truncation with ...)
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

// StarRating component for Hospital Indemnity - REMOVED
// Now using centralized AmBestStarRating component from @/components/ui/star-rating

export function AdaptiveHospitalIndemnityPlanBuilder({ quotes, onPlanBuilt }: AdaptiveHospitalIndemnityPlanBuilderProps) {
  // Memoize the validation of quotes to prevent infinite re-renders
  const validQuotes = useMemo(() => {
    const filtered = quotes.filter(quote => hasValidBenefitStructure(quote));
    
    // Log analysis for debugging (only when quotes change)
    const invalidQuotes = quotes.filter(quote => !hasValidBenefitStructure(quote));
    if (invalidQuotes.length > 0) {
      console.log(`Filtered out ${invalidQuotes.length} invalid quotes:`, 
        invalidQuotes.map(q => ({ 
          company: q.companyName, 
          plan: q.planName,
          hasBasePlans: !!q.basePlans?.length,
          hasRiders: !!q.riders?.length
        }))
      );
    }
    console.log(`Using ${filtered.length} of ${quotes.length} total quotes`);
    
    return filtered;
  }, [quotes]); // Only depend on the original quotes prop

  // Group quotes by company and detect plan structures
  const companiesWithStructures = useMemo(() => {
    const companiesList = Array.from(new Set(validQuotes.map(q => q.companyName))).sort();
    
    return companiesList.map(companyName => {
      const companyQuotes = validQuotes.filter(q => q.companyName === companyName);
      const planStructure = detectPlanStructure(companyQuotes);
      const hasSpecialStructure = hasSpecialPlanStructure(companyQuotes);
      
      return {
        name: companyName,
        quotes: companyQuotes,
        planStructure,
        hasSpecialStructure,
        displayConfig: getDisplayConfiguration(planStructure)
      };
    });
  }, [validQuotes]);

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedPlanOption, setSelectedPlanOption] = useState<string>(''); // For companies with multiple plan types
  const [selectedBenefitDays, setSelectedBenefitDays] = useState<number | null>(null);
  const [selectedDailyBenefit, setSelectedDailyBenefit] = useState<number | null>(null);
  const [selectedRiders, setSelectedRiders] = useState<RiderConfiguration[]>([]);
  const [configuration, setConfiguration] = useState<PlanConfiguration>({});
  const [availableQuotes, setAvailableQuotes] = useState<OptimizedHospitalIndemnityQuote[]>([]);
  const [finalQuote, setFinalQuote] = useState<OptimizedHospitalIndemnityQuote | null>(null);
  const [dayConfigurations, setDayConfigurations] = useState<DayConfiguration[]>([]);
  
  // Enhanced state for plan structure handling
  const [selectedCompanyStructure, setSelectedCompanyStructure] = useState<any>(null);
  const [selectedPlanGroup, setSelectedPlanGroup] = useState<string>('');

  // Day configurations are now built per company in the company selection effect below
  // This ensures that only day options available for the selected company are shown

  // Filter quotes when company is selected
  useEffect(() => {
    if (selectedCompany) {
      const companyInfo = companiesWithStructures.find(c => c.name === selectedCompany);
      if (!companyInfo) return;
      
      setAvailableQuotes(companyInfo.quotes);
      setSelectedCompanyStructure(companyInfo);
      
      // Update day configurations for the selected company only
      const companyQuotes = companyInfo.quotes;
      if (companyQuotes.length > 0) {
        const dayAnalysis = analyzeBenefitDayConfigurations(companyQuotes.map(q => ({ plan_name: q.planName })));
        
        // Also collect days from rider quantifiers (for companies like Continental Life)
        const quantifierDays = new Set<number>();
        companyQuotes.forEach(quote => {
          const allBenefits = getAllBenefits(quote);
          allBenefits.forEach(benefit => {
            benefit.benefitOptions.forEach(option => {
              if (option.quantifier) {
                const quantifierDayMatch = option.quantifier.match(/(\d+)\s*day/i);
                if (quantifierDayMatch) {
                  quantifierDays.add(parseInt(quantifierDayMatch[1]));
                }
              }
            });
          });
        });

        // Combine both sources of day options for this company only
        const allDayOptions = [...new Set([...dayAnalysis.availableDayOptions, ...Array.from(quantifierDays)])].sort((a, b) => a - b);
        
        const dayConfigs = allDayOptions.map(days => {
          const quotesForDays = companyQuotes.filter(q => {
            const dayInfo = extractBenefitDays(q.planName);
            
            // Check plan name first
            if (dayInfo.days === days) {
              return true;
            }
            
            // Check rider quantifiers for companies like Continental Life
            const allBenefits = getAllBenefits(q);
            return allBenefits.some(benefit => {
              return benefit.benefitOptions.some(option => {
                if (option.quantifier) {
                  const quantifierDayMatch = option.quantifier.match(/(\d+)\s*day/i);
                  if (quantifierDayMatch) {
                    return parseInt(quantifierDayMatch[1]) === days;
                  }
                }
                return false;
              });
            });
          });

          const premiums = quotesForDays.map(q => {
            const mainBenefit = getMainBenefit(q);
            if (mainBenefit && mainBenefit.benefitOptions.length > 0) {
              return mainBenefit.benefitOptions[0]?.rate || 0;
            }
            return 0;
          }).filter(rate => rate > 0);

          return {
            days,
            available: quotesForDays.length > 0,
            quoteCount: quotesForDays.length,
            minPremium: premiums.length > 0 ? Math.min(...premiums) : 0,
            maxPremium: premiums.length > 0 ? Math.max(...premiums) : 0
          };
        });

        setDayConfigurations(dayConfigs);
      }
      
      if (companyInfo.hasSpecialStructure) {
        // For special structures, reset standard selections
        setSelectedPlanOption('');
        setSelectedBenefitDays(null);
        setSelectedDailyBenefit(null);
        setSelectedRiders([]);
        setSelectedPlanGroup(''); // Reset plan group selection
      } else {
        // Reset special structure state for standard companies
        setSelectedPlanOption(''); // Reset plan option for all companies
        setSelectedPlanGroup('');
      }
      
      if (currentStep === 1) {
        setCurrentStep(2);
      }
    }
  }, [selectedCompany, companiesWithStructures, currentStep]);

  // Update available quotes when plan option is selected (for companies like Continental Life)
  useEffect(() => {
    if (selectedCompany && selectedPlanOption && availableQuotes.length > 0) {
      // Get company routing configuration
      const routeConfig = detectCompanyRouteConfig(selectedCompany, availableQuotes);
      
      // Filter quotes to only include the selected plan option
      const planFilteredQuotes = availableQuotes.filter(q => q.planName === selectedPlanOption);
      
      if (planFilteredQuotes.length > 0) {
        // Use routing system to extract benefit days
        const dayOptions = new Set<number>();
        
        planFilteredQuotes.forEach(quote => {
          const days = extractBenefitDaysForCompany(quote, routeConfig);
          if (days !== null) {
            dayOptions.add(days);
          }
        });

        // Build day configurations for this plan option
        const allDayOptions = Array.from(dayOptions).sort((a, b) => a - b);
        
        const dayConfigs = allDayOptions.map(days => {
          const quotesForDays = planFilteredQuotes.filter(q => {
            const extractedDays = extractBenefitDaysForCompany(q, routeConfig);
            return extractedDays === days;
          });

          const premiums = quotesForDays.map(q => {
            const primarySource = getPrimaryBenefitSourceForCompany(q, routeConfig);
            if (primarySource && primarySource.benefitOptions.length > 0) {
              return primarySource.benefitOptions[0]?.rate || 0;
            }
            return 0;
          }).filter(rate => rate > 0);

          return {
            days,
            available: quotesForDays.length > 0,
            quoteCount: quotesForDays.length,
            minPremium: premiums.length > 0 ? Math.min(...premiums) : 0,
            maxPremium: premiums.length > 0 ? Math.max(...premiums) : 0
          };
        });

        setDayConfigurations(dayConfigs);
        
        // Reset selections when plan option changes
        setSelectedBenefitDays(null);
        setSelectedDailyBenefit(null);
      }
    }
  }, [selectedCompany, selectedPlanOption, availableQuotes]);

  // Update configuration when selections change
  useEffect(() => {
    // Handle special plan structures
    if (selectedCompanyStructure?.hasSpecialStructure && selectedPlanGroup && selectedDailyBenefit && finalQuote) {
      const newConfig: PlanConfiguration = {
        company: selectedCompany,
        planType: 'special-structure',
        dailyBenefit: selectedDailyBenefit,
        selectedRiders: selectedRiders,
        totalPremium: getPremiumForDailyBenefit(finalQuote, selectedDailyBenefit) || 0,
      };
      
      setConfiguration(newConfig);
      
      if (currentStep < 4) {
        setCurrentStep(4);
      }
    } else if (!selectedCompanyStructure?.hasSpecialStructure) {
      // Handle standard (non-special structure) plans
      const newConfig: PlanConfiguration = {
        company: selectedCompany,
        benefitDays: selectedBenefitDays ?? undefined,
        dailyBenefit: selectedDailyBenefit ?? undefined,
        selectedRiders: selectedRiders,
      };

      // Find matching quote
      // More flexible matching - only require company selection, other fields are optional
      if (selectedCompany) {
        const matchingQuote = findBestMatchingQuote(availableQuotes, newConfig);
        if (matchingQuote) {
          setFinalQuote(matchingQuote);
          newConfig.totalPremium = calculateTotalPremium(matchingQuote, selectedRiders);
          
          if (currentStep < 4) {
            setCurrentStep(4);
          }
        }
      }

      setConfiguration(newConfig);
    }
  }, [
    selectedCompany, 
    selectedBenefitDays, 
    selectedDailyBenefit, 
    selectedRiders, 
    availableQuotes, 
    currentStep,
    selectedCompanyStructure,
    selectedPlanGroup,
    finalQuote
  ]);

  const handleCompanySelect = (company: string) => {
    setSelectedCompany(company);
    setSelectedPlanOption('');
    setSelectedBenefitDays(null);
    setSelectedDailyBenefit(null);
    setSelectedRiders([]);
    setFinalQuote(null);
  };

  const handleRiderToggle = (riderName: string, checked: boolean, selectedOption?: any) => {
    setSelectedRiders(prev => {
      if (checked) {
        // Add or update rider configuration
        const existing = prev.find(r => r.name === riderName);
        if (existing) {
          return prev.map(r => 
            r.name === riderName 
              ? { ...r, selectedBenefitOption: selectedOption }
              : r
          );
        } else {
          return [...prev, { 
            name: riderName, 
            selectedBenefitOption: selectedOption 
          }];
        }
      } else {
        // Remove rider
        return prev.filter(r => r.name !== riderName);
      }
    });
  };

  const findBestMatchingQuote = (quotes: OptimizedHospitalIndemnityQuote[], config: PlanConfiguration): OptimizedHospitalIndemnityQuote | null => {
    // Flexible matching - try to find best match based on available configuration
    if (!selectedCompany) return null;
    
    let candidateQuotes = quotes;
    
    // Filter by plan option if selected
    if (selectedPlanOption) {
      candidateQuotes = candidateQuotes.filter(q => q.planName.includes(selectedPlanOption));
    }
    
    // If we have a daily benefit, try to match it
    if (config.dailyBenefit) {
      const matchingQuotes = candidateQuotes.filter(quote => {
        const availableBenefits = getAvailableDailyBenefitsFromQuote(quote);
        return availableBenefits.includes(config.dailyBenefit || 0);
      });
      
      if (matchingQuotes.length > 0) {
        candidateQuotes = matchingQuotes;
      }
    }
    
    // If we have benefit days, try to match them (for daily plans)
    if (config.benefitDays && !isLumpSumPlan()) {
      const dayMatchingQuotes = candidateQuotes.filter(quote => {
        const dayInfo = extractBenefitDays(quote.planName);
        return dayInfo.days === config.benefitDays;
      });
      
      if (dayMatchingQuotes.length > 0) {
        candidateQuotes = dayMatchingQuotes;
      }
    }
    
    // Return the first matching quote (or first quote if no specific matches)
    return candidateQuotes[0] || null;
  };

  const calculateTotalPremium = (quote: OptimizedHospitalIndemnityQuote, riders: RiderConfiguration[]): number => {
    // Get base premium using the new detection system
    const basePremium = getPremiumForDailyBenefit(quote, selectedDailyBenefit || 0);

    const riderPremium = riders.reduce((total, riderConfig) => {
      if (riderConfig.selectedBenefitOption) {
        return total + riderConfig.selectedBenefitOption.rate;
      }
      return total;
    }, 0);

    return basePremium + riderPremium;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const validateRiderConfiguration = (riderConfigs: RiderConfiguration[]): {
    isValid: boolean;
    warnings: string[];
  } => {
    const warnings: string[] = [];
    
    // Group riders by category for better validation
    const emergencyRiders = riderConfigs.filter(r => 
      r.name.includes('Ambulance') || r.name.includes('ER') || r.name.includes('Urgent Care')
    );
    const surgicalRiders = riderConfigs.filter(r => 
      r.name.includes('Surgery') || r.name.includes('Lump Sum')
    );
    const nursingRiders = riderConfigs.filter(r => 
      r.name.includes('Skilled Nurse')
    );

    // Check for complementary coverage recommendations
    if (emergencyRiders.length > 0 && surgicalRiders.length === 0) {
      warnings.push('Consider adding surgical coverage to complement emergency services');
    }

    if (surgicalRiders.length > 0 && emergencyRiders.length === 0) {
      warnings.push('Consider adding emergency coverage to complement surgical benefits');
    }

    // Check for skilled nursing conflicts
    if (nursingRiders.length > 1) {
      const riderNames = nursingRiders.map(r => r.name);
      warnings.push(`Multiple skilled nursing riders selected: ${riderNames.join(', ')}. Consider selecting one that best fits your needs.`);
    }

    // Check for short-term plan recommendations
    if (selectedBenefitDays && selectedBenefitDays <= 7 && riderConfigs.length > 5) {
      warnings.push('Short-term plans (7 days) may not benefit from extensive rider coverage. Consider focusing on essential riders.');
    }

    return {
      isValid: true,
      warnings
    };
  };

  const getAvailablePlanOptions = (): string[] => {
    if (!selectedCompany || !availableQuotes.length) return [];
    
    // Use the new routing system to get plan options
    return getAvailablePlanOptionsFromRoutes(selectedCompany, availableQuotes);
  };

  // Helper function to determine if the current plan configuration is for a lump sum plan
  const isLumpSumPlan = (): boolean => {
    if (!selectedPlanOption && !selectedCompany) return false;
    
    // Check if plan option explicitly mentions lump sum
    if (selectedPlanOption && selectedPlanOption.toLowerCase().includes('lump sum')) {
      return true;
    }
    
    // Check if any of the available quotes for this configuration are lump sum
    if (selectedCompany && availableQuotes.length > 0) {
      const currentQuotes = selectedPlanOption 
        ? availableQuotes.filter(q => q.planName.includes(selectedPlanOption))
        : availableQuotes;
      
      return currentQuotes.some(quote => 
        quote.planName.toLowerCase().includes('lump sum') ||
        (quote.riders && quote.riders.some(rider => 
          rider.benefitOptions?.some(option => 
            option.quantifier?.toLowerCase().includes('occurrence')
          )
        ))
      );
    }
    
    return false;
  };

  const getAvailableDailyBenefits = (): number[] => {
    if (!availableQuotes.length || !selectedCompany) return [];

    // Get company routing configuration
    const routeConfig = detectCompanyRouteConfig(selectedCompany, availableQuotes);

    // Filter by selected plan option first (if applicable)
    let quotesToSearch = availableQuotes;
    if (selectedPlanOption) {
      quotesToSearch = availableQuotes.filter(q => q.planName === selectedPlanOption);
    }

    // Don't filter by benefit days - show all available daily benefits for the selected quotes
    // This allows users to see all configuration options regardless of benefit days selection
    let finalQuotes = quotesToSearch;

    // For hybrid benefit structures, prefer daily benefits but show all if none selected
    if (routeConfig.benefitStructureType === 'hybrid') {
      const dailyQuotes = filterQuotesByBenefitType(quotesToSearch, 'daily', routeConfig);
      if (dailyQuotes.length > 0) {
        finalQuotes = dailyQuotes;
      }
    }

    const amounts = new Set<number>();
    finalQuotes.forEach(quote => {
      const primarySource = getPrimaryBenefitSourceForCompany(quote, routeConfig);
      if (primarySource) {
        primarySource.benefitOptions.forEach(option => {
          // For hybrid companies like Continental Life, only include daily benefits
          if (routeConfig.benefitStructureType === 'hybrid') {
            const benefitType = determineBenefitType(option.quantifier);
            if (benefitType !== 'daily') return;
          }
          
          const amount = parseInt(option.amount);
          if (!isNaN(amount) && amount > 0) {
            amounts.add(amount);
          }
        });
      }
    });

    return Array.from(amounts).sort((a, b) => a - b);
  };

  const getAvailableRiders = (): any[] => {
    // Try to get riders from finalQuote first
    if (finalQuote && finalQuote.riders) {
      return finalQuote.riders.filter(rider => !rider.included) || [];
    }
    
    // Fallback: get riders from any quote with the selected company
    if (selectedCompany) {
      const companyQuote = availableQuotes.find(q => q.companyName === selectedCompany);
      if (companyQuote && companyQuote.riders) {
        return companyQuote.riders.filter(rider => !rider.included) || [];
      }
    }
    
    // Final fallback: get riders from the first available quote
    if (quotes.length > 0 && quotes[0].riders) {
      return quotes[0].riders.filter(rider => !rider.included) || [];
    }
    
    return [];
  };

  const categorizeRiders = (riders: any[]) => {
    const categories = {
      'Emergency Services': riders.filter(r => 
        r.name.includes('Ambulance') || r.name.includes('ER') || r.name.includes('Urgent Care')
      ),
      'Surgical & Procedures': riders.filter(r => 
        r.name.includes('Surgery') || r.name.includes('Lump Sum')
      ),
      'Skilled Nursing Care': riders.filter(r => 
        r.name.includes('Skilled Nurse')
      ),
      'Outpatient Services': riders.filter(r => 
        r.name.includes('Therapy') || r.name.includes('Dx') || r.name.includes('Wellness')
      ),
      'Additional Benefits': riders.filter(r => 
        r.name.includes('Dental') || r.name.includes('Vision') || r.name.includes('Hearing')
      )
    };

    // Remove empty categories
    return Object.fromEntries(
      Object.entries(categories).filter(([_, riders]) => riders.length > 0)
    );
  };

  return (
    <div className="max-w-7xl mt-8 mx-auto">{/* Wider container for single-page layout */}
      <Card>
        <CardContent>
          <Tabs value={selectedCompany ? "2" : "1"} onValueChange={() => {}}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="1" className="flex items-center gap-2">
                <BrainIcon className="h-4 w-4" />
                Select Company
              </TabsTrigger>
              <TabsTrigger value="2" className="flex items-center gap-2" disabled={!selectedCompany}>
                <Settings2Icon className="h-4 w-4" />
                Configure Plan
              </TabsTrigger>
            </TabsList>

            {/* Step 1: Company Selection */}
            <TabsContent value="1" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Select Insurance Company</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {companiesWithStructures.map((companyInfo) => {
                    const company = companyInfo.name;
                    const companyQuotes = companyInfo.quotes;
                    
                    // Get plan structure summary
                    const planSummary = getPlanGroupingSummary(companyQuotes);
                    
                    // Get unique riders from all quotes for this company
                    const allRiders = new Set<string>();
                    companyQuotes.forEach(quote => {
                      if (quote.riders) {
                        quote.riders.forEach(rider => {
                            allRiders.add(rider.name);
                          }
                        );
                      }
                    });
                    
                    // Get company rating from first quote (all quotes from same company should have same rating)
                    const companyRating = companyQuotes[0]?.ambest;
                    const starRating = companyRating ? amBestToStars(companyRating.rating) : 0;
                    
                    const displayName = getCarrierDisplayName(company, company);
                    const subsidiaryName = getSubsidiaryName(company, 'hospital-indemnity');
                    
                    return (
                      <Card 
                        key={company} 
                        className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-primary/20 ${
                          selectedCompany === company ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : 'hover:border-gray-300'
                        }`}
                        onClick={() => handleCompanySelect(company)}
                      >
                        <CardContent className="p-6">
                          {/* Carrier Header */}
                          <div className="mb-4 pb-4 border-b">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {/* Carrier Logo */}
                                <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                  <Image
                                    src={getCachedLogoUrl(company, company)}
                                    alt={`${displayName} logo`}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-contain"
                                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                      const target = e.currentTarget;
                                      const parent = target.parentElement;
                                      if (parent) {
                                        target.style.display = 'none';
                                        const initials = displayName
                                          .split(' ')
                                          .map((word: string) => word[0])
                                          .join('')
                                          .substring(0, 2)
                                          .toUpperCase();
                                        parent.innerHTML = `<span class="text-sm font-semibold text-gray-600">${initials}</span>`;
                                      }
                                    }}
                                  />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-xl font-bold text-primary">{displayName}</h4>
                                    {companyInfo.hasSpecialStructure && (
                                      <Badge variant="secondary" className="text-xs">
                                        {companyInfo.planStructure.structureType === 'multiple-series' ? 'Multiple Series' :
                                         companyInfo.planStructure.structureType === 'pre-configured' ? 'Pre-configured Plans' :
                                         companyInfo.planStructure.structureType === 'hybrid' ? 'Mixed Structure' : 'Special'}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 my-1">
                                    <AmBestStarRating 
                                      amBestRating={companyRating?.rating}
                                      size="sm"
                                    />
                                  </div>
                                  {subsidiaryName && (
                                    <p className="text-sm text-muted-foreground">{subsidiaryName}</p>
                                  )}
                                </div>
                              </div>
                              {selectedCompany === company && (
                                <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                              )}
                            </div>
                          </div>
                          
                          {/* Plan Structure Info & Rider Badges */}
                          <div className="space-y-3">
                            {/* Plan Structure Summary */}
                            {companyInfo.hasSpecialStructure && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                  Plan Structure:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {companyInfo.planStructure.planGroups.map((group, index) => (
                                    <Badge 
                                      key={`group-${index}`} 
                                      variant="default" 
                                      className="text-xs"
                                    >
                                      {group.baseName} ({group.variants.length} options)
                                    </Badge>
                                  ))}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {companyQuotes.length} quotes with {planSummary.totalVariants} variants
                                  {planSummary.hasMultiplePlanSeries && ` across ${planSummary.planSeriesNames.length} series`}
                                </p>
                              </div>
                            )}
                            
                            {/* Rider Badges */}
                            {allRiders.size > 0 && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                  Available Riders ({allRiders.size}):
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {Array.from(new Set(Array.from(allRiders).map(riderName => abbreviateRiderName(riderName)))).slice(0, 20).map((abbreviatedName, index) => (
                                    <Badge 
                                      key={`${abbreviatedName}-${index}`} 
                                      variant="outline" 
                                      className="text-xs"
                                    >
                                      {abbreviatedName}
                                    </Badge>
                                  ))}
                                  {allRiders.size > 20 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{allRiders.size - 20} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            {/* Step 2: All Configuration Options on One Page */}
            <TabsContent value="2" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Benefits Configuration */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-6">Configure Your Plan</h3>
                    
                    {/* Special Plan Structure Configuration */}
                    {selectedCompanyStructure?.hasSpecialStructure ? (
                      // Special Plan Structure Configuration (CIGNA, Guarantee Trust, Allstate, etc.)
                      <div className="space-y-6">
                        <Alert className="bg-green-50 border-green-200">
                          <InfoIcon className="h-4 w-4 text-green-600" />
                          <AlertDescription>
                            <div className="text-green-800">
                              <strong>{selectedCompany} Special Plan Structure</strong>
                              <p className="mt-1">
                                This company offers {selectedCompanyStructure.planStructure.structureType === 'multiple-series' ? 'multiple plan series' : 
                                selectedCompanyStructure.planStructure.structureType === 'pre-configured' ? 'pre-configured plan packages' : 'a mixed plan structure'}. 
                                Select your preferred plan group below.
                              </p>
                            </div>
                          </AlertDescription>
                        </Alert>

                        {/* Plan Group Selection */}
                        <div className="space-y-4">
                          {selectedCompanyStructure.planStructure.planGroups.length > 1 ? (
                            <div>
                              <h4 className="font-medium mb-3">Choose Plan Group</h4>
                              <p className="text-sm text-gray-600 mb-4">
                                Select the type of plan that best fits your needs.
                              </p>
                              <RadioGroup 
                                value={selectedPlanGroup} 
                                onValueChange={setSelectedPlanGroup}
                              >
                                {selectedCompanyStructure.planStructure.planGroups.map((group: any, index: number) => (
                                  <div key={index} className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <RadioGroupItem value={group.baseName} id={`group-${index}`} />
                                    <Label htmlFor={`group-${index}`} className="flex-1 cursor-pointer">
                                      <div className="space-y-1">
                                        <div className="font-medium">{group.baseName}</div>
                                        <div className="text-sm text-gray-600">
                                          {group.variants.length} option{group.variants.length !== 1 ? 's' : ''} available
                                          {group.isPreConfigured && ' (Pre-configured packages)'}
                                        </div>
                                        {group.variants.length > 0 && (
                                          <div className="text-xs text-gray-500">
                                            Options: {group.variants.slice(0, 3).map((v: any) => v.variantName).join(', ')}
                                            {group.variants.length > 3 && ` +${group.variants.length - 3} more`}
                                          </div>
                                        )}
                                      </div>
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </div>
                          ) : (
                            // Single plan group - show info but don't auto-select
                            (() => {
                              const singleGroup = selectedCompanyStructure.planStructure.planGroups[0];
                              return (
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                  <div className="font-medium text-blue-900">{singleGroup?.baseName}</div>
                                  <div className="text-sm text-blue-700">
                                    {singleGroup?.variants.length} option{singleGroup?.variants.length !== 1 ? 's' : ''} available
                                  </div>
                                  <button
                                    onClick={() => setSelectedPlanGroup(singleGroup?.baseName)}
                                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                                  >
                                    Select this plan group
                                  </button>
                                </div>
                              );
                            })()
                          )}

                          {/* Plan Variant Selection */}
                          {selectedPlanGroup && (() => {
                            const selectedGroup = selectedCompanyStructure.planStructure.planGroups.find((g: any) => g.baseName === selectedPlanGroup);
                            if (!selectedGroup) return null;

                            // Helper function to extract daily benefit amount from main benefit
                            const getDailyBenefitAmount = (quote: OptimizedHospitalIndemnityQuote): number => {
                              const mainBenefit = getMainBenefit(quote);
                              if (mainBenefit && mainBenefit.benefitOptions.length > 0) {
                                const amount = mainBenefit.benefitOptions[0]?.amount;
                                return amount ? parseInt(amount.replace(/\D/g, '')) : 0;
                              }
                              return 0;
                            };

                            return (
                              <div>
                                <h4 className="font-medium mb-3">Choose Your Plan Option</h4>
                                <p className="text-sm text-gray-600 mb-4">
                                  Select the plan that best fits your needs. Click on any plan to see details and continue.
                                </p>
                                <div className="space-y-3">
                                  {selectedGroup.variants.map((variant: any, vIndex: number) => {
                                    const dailyBenefit = getDailyBenefitAmount(variant.quote);
                                    const premium = getPremiumForDailyBenefit(variant.quote, dailyBenefit);
                                    const isSelected = selectedDailyBenefit === dailyBenefit;
                                    
                                    return (
                                      <div 
                                        key={vIndex} 
                                        className={`cursor-pointer p-4 border-2 rounded-lg transition-all hover:border-blue-300 hover:shadow-md ${
                                          isSelected 
                                            ? 'border-blue-500 bg-blue-50 shadow-md' 
                                            : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                        onClick={() => {
                                          const dailyBenefit = getDailyBenefitAmount(variant.quote);
                                          setSelectedDailyBenefit(dailyBenefit);
                                          setFinalQuote(variant.quote);
                                        }}
                                      >
                                        <div className="flex justify-between items-start">
                                          <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                              <div className={`w-4 h-4 rounded-full border-2 ${
                                                isSelected 
                                                  ? 'border-blue-500 bg-blue-500' 
                                                  : 'border-gray-300'
                                              }`}>
                                                {isSelected && (
                                                  <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                                                )}
                                              </div>
                                              <div className="font-semibold text-lg">{variant.variantName}</div>
                                            </div>
                                            <div className="text-gray-700 font-medium">
                                              ${dailyBenefit}/day hospital benefit
                                              {variant.benefitDays && ` • ${variant.benefitDays} days coverage`}
                                            </div>
                                            {variant.includedBenefits.length > 0 && (
                                              <div className="text-sm text-gray-600">
                                                <strong>Includes:</strong> {variant.includedBenefits.slice(0, 3).map((b: any) => b.name).join(', ')}
                                                {variant.includedBenefits.length > 3 && ` +${variant.includedBenefits.length - 3} more`}
                                              </div>
                                            )}
                                          </div>
                                          <div className="text-right">
                                            <div className="font-bold text-xl text-green-600">
                                              ${premium?.toFixed(2) || '0.00'}
                                            </div>
                                            <div className="text-sm text-gray-500">per month</div>
                                          </div>
                                        </div>
                                        {isSelected && (
                                          <div className="mt-3 pt-3 border-t border-blue-200">
                                            <div className="text-sm text-blue-700 font-medium">
                                              ✓ Selected - Continue below to customize this plan
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    ) : (
                      // Standard (non-Allstate) Plan Configuration
                      <>
                        {/* Plan Option Selection (for companies with multiple plan types) */}
                        {getAvailablePlanOptions().length > 0 && (
                          <div className="mb-6">
                            <h4 className="font-medium mb-2">Select Plan Option</h4>
                            <Select
                              value={selectedPlanOption}
                              onValueChange={(value) => {
                                setSelectedPlanOption(value);
                                // Reset selections when plan option changes
                                setSelectedBenefitDays(null);
                                setSelectedDailyBenefit(null);
                                setSelectedRiders([]);
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Choose plan option" />
                              </SelectTrigger>
                              <SelectContent>
                                {getAvailablePlanOptions().map((planName) => (
                                  <SelectItem key={planName} value={planName}>
                                    {planName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {/* Basic Plan Configuration */}
                        {/* Only show if no plan option selection is needed OR a plan option has been selected */}
                        {(getAvailablePlanOptions().length === 0 || selectedPlanOption) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div>
                            <h4 className="font-medium mb-2">Benefit Days Coverage</h4>
                            <Select
                              value={selectedBenefitDays?.toString() || ""}
                              onValueChange={(value) => setSelectedBenefitDays(parseInt(value))}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select benefit days coverage" />
                              </SelectTrigger>
                              <SelectContent>
                                {dayConfigurations.map((config) => (
                                  <SelectItem key={config.days} value={config.days.toString()}>
                                    {config.days} days
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Always show daily benefit selector once in configure plan section */}
                          <div>
                            <h4 className="font-medium mb-2">Daily Benefit Amount</h4>
                            <Select
                              value={selectedDailyBenefit?.toString() || ""}
                              onValueChange={(value) => setSelectedDailyBenefit(parseInt(value))}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select daily benefit amount" />
                              </SelectTrigger>
                              <SelectContent>
                                {getAvailableDailyBenefits().map((amount) => (
                                  <SelectItem key={amount} value={amount.toString()}>
                                    ${amount} per day
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        )}

                        {/* Riders Section */}
                        {/* Show riders section once plan option is selected (if needed) or we're in configure mode */}
                        {(getAvailablePlanOptions().length === 0 || selectedPlanOption) && (
                      <div className="space-y-4">
                        <h4 className="font-medium">Optional Riders</h4>
                        
                        {(() => {
                          const validation = validateRiderConfiguration(selectedRiders);
                          return validation.warnings.length > 0 && (
                            <Alert>
                              <InfoIcon className="h-4 w-4" />
                              <AlertDescription>
                                <div className="space-y-1">
                                  {validation.warnings.map((warning, index) => (
                                    <div key={index} className="text-sm">{warning}</div>
                                  ))}
                                </div>
                              </AlertDescription>
                            </Alert>
                          );
                        })()}
                        
                        <div className="space-y-6">
                          {(() => {
                            const availableRiders = getAvailableRiders();
                            const categorizedRiders = categorizeRiders(availableRiders);
                            
                            if (availableRiders.length === 0) {
                              return (
                                <div className="text-center py-4 text-gray-500">
                                  <p>No rider options available for this configuration.</p>
                                </div>
                              );
                            }
                            
                            return Object.entries(categorizedRiders).map(([category, riders]) => (
                              <div key={category} className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <h5 className="text-sm font-semibold text-gray-900">{category}</h5>
                                  <Badge variant="secondary" className="text-xs">
                                    {riders.length} option{riders.length !== 1 ? 's' : ''}
                                  </Badge>
                                </div>
                                
                                <div className="space-y-3">
                                  {riders.map((rider: any) => {
                                    const isSelected = selectedRiders.some(r => r.name === rider.name);
                                    const selectedConfig = selectedRiders.find(r => r.name === rider.name);

                                    return (
                                      <Card key={rider.name} className={`border transition-colors ${
                                        isSelected ? 'border-blue-100 bg-blue-50' : 'border-gray-200'
                                      }`}>
                                        <CardContent className="p-3">
                                          <div className="space-y-3">
                                            {/* Rider Header */}
                                            <div className="flex items-start justify-between">
                                              <div className="flex-1">
                                                <h6 className="text-sm font-medium">{rider.name}</h6>
                                                {rider.notes && (
                                                  <p className="text-xs text-gray-600 mt-1">{rider.notes}</p>
                                                )}
                                              </div>
                                              {isSelected && selectedConfig?.selectedBenefitOption && (
                                                <div className="text-sm font-medium text-green-600">
                                                  +{formatCurrency(selectedConfig.selectedBenefitOption.rate)}/mo
                                                </div>
                                              )}
                                            </div>

                                            {/* Benefit Options */}
                                            {rider.benefitOptions && rider.benefitOptions.length > 0 && (
                                              <div>
                                                <RadioGroup
                                                  value={selectedConfig?.selectedBenefitOption ? 
                                                    `${selectedConfig.selectedBenefitOption.amount}-${selectedConfig.selectedBenefitOption.rate}` : 
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
                                                    {/* Group options by quantifier to reduce redundancy */}
                                                    {(() => {
                                                      // Group benefit options by their quantifier
                                                      const groupedOptions = rider.benefitOptions?.reduce((acc: any, option: any) => {
                                                        const key = option.quantifier || 'per occurrence';
                                                        if (!acc[key]) acc[key] = [];
                                                        acc[key].push(option);
                                                        return acc;
                                                      }, {}) || {};

                                                      return Object.entries(groupedOptions).map(([quantifier, options]: [string, any]) => (
                                                        <div key={quantifier}>
                                                          {Object.keys(groupedOptions).length > 1 && (
                                                            <div className="text-xs font-medium text-gray-600 mb-1">{quantifier}</div>
                                                          )}
                                                          <div className="grid grid-cols-1 gap-1">
                                                            {options.map((option: any, optIndex: number) => (
                                                              <div key={optIndex} className="flex items-center space-x-2">
                                                                <RadioGroupItem 
                                                                  value={`${option.amount}-${option.rate}`} 
                                                                  id={`${rider.name}-${quantifier}-${optIndex}`}
                                                                />
                                                                <Label 
                                                                  htmlFor={`${rider.name}-${quantifier}-${optIndex}`}
                                                                  className="flex-1 cursor-pointer text-xs"
                                                                >
                                                                  <div className="flex justify-between items-center">
                                                                    <span>${option.amount}</span>
                                                                    <span className="font-medium text-blue-600">
                                                                      +${option.rate}/mo
                                                                    </span>
                                                                  </div>
                                                                </Label>
                                                              </div>
                                                            ))}
                                                          </div>
                                                        </div>
                                                      ));
                                                    })()}
                                                  </div>
                                                </RadioGroup>
                                              </div>
                                            )}
                                          </div>
                                        </CardContent>
                                      </Card>
                                    );
                                  })}
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    )}
                      </>
                    )}
                  </div>
                </div>

                {/* Right Column: Plan Summary */}
                <div className="lg:col-span-1">
                  <div className="sticky top-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircleIcon className="h-5 w-5" />
                          Plan Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {finalQuote && (
                          <>
                            <div className="space-y-3">
                              <div>
                                <span className="text-sm text-gray-600">Company:</span>
                                <div className="font-medium">{finalQuote.companyName}</div>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">Plan:</span>
                                <div className="font-medium">{finalQuote.planName}</div>
                              </div>
                              {selectedBenefitDays && (
                                <div>
                                  <span className="text-sm text-gray-600">Benefit Days:</span>
                                  <div className="font-medium">{selectedBenefitDays} days</div>
                                </div>
                              )}
                              {selectedDailyBenefit && (
                                <div>
                                  <span className="text-sm text-gray-600">Daily Benefit:</span>
                                  <div className="font-medium">${selectedDailyBenefit}/day</div>
                                </div>
                              )}
                              {selectedBenefitDays && selectedDailyBenefit && !isLumpSumPlan() && (
                                <div>
                                  <span className="text-sm text-gray-600">Maximum Benefit:</span>
                                  <div className="font-medium">
                                    ${(selectedDailyBenefit || 0) * (selectedBenefitDays || 0)}
                                  </div>
                                </div>
                              )}
                              {isLumpSumPlan() && selectedDailyBenefit && (
                                <div>
                                  <span className="text-sm text-gray-600">Lump Sum Benefit:</span>
                                  <div className="font-medium">${selectedDailyBenefit} per occurrence</div>
                                </div>
                              )}
                            </div>

                            {selectedRiders.length > 0 && (
                              <div>
                                <h6 className="text-sm font-medium mb-2">Selected Riders:</h6>
                                <div className="space-y-1">
                                  {selectedRiders.map(riderConfig => (
                                    <div key={riderConfig.name} className="flex justify-between text-xs">
                                      <span className="text-gray-600">{riderConfig.name}</span>
                                      {riderConfig.selectedBenefitOption && (
                                        <span className="text-green-600">
                                          +{formatCurrency(riderConfig.selectedBenefitOption.rate)}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <Separator />

                            <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold">Total Monthly:</span>
                              <span className="text-lg font-bold text-blue-600">
                                {formatCurrency(configuration.totalPremium || 0)}
                              </span>
                            </div>

                            <Button 
                              onClick={() => onPlanBuilt(finalQuote, configuration)}
                              className="w-full"
                              size="sm"
                              disabled={!finalQuote}
                            >
                              <ShieldCheckIcon className="h-4 w-4 mr-2" />
                              Build This Plan
                            </Button>
                          </>
                        )}
                        
                        {selectedCompany && !finalQuote && (
                          <div className="text-center py-4 text-gray-500">
                            <HospitalIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">Select benefit options to see your plan summary</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}