/**
 * Carrier Selection View Component
 * Extracted from AdaptiveHospitalIndemnityPlanBuilder for reuse
 */
'use client';

import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { FaCheckCircle as CheckCircleIcon } from 'react-icons/fa';

import { OptimizedHospitalIndemnityQuote } from '@/lib/hospital-indemnity-quote-optimizer';
import { amBestToStars } from '@/utils/amBestRating';
import { AmBestStarRating } from '@/components/ui/star-rating';
import { 
  getEnhancedCarrierInfo,
  getCarrierDisplayName as getCarrierDisplayNameFromSystem,
  getSubsidiaryName
} from '@/lib/carrier-system';
import {
  getAdditionalRiders,
  hasValidBenefitStructure
} from '@/utils/simplifiedHospitalIndemnityBenefits';

// Helper functions from AdaptiveHospitalIndemnityPlanBuilder
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

interface CarrierSelectionViewProps {
  quotes: OptimizedHospitalIndemnityQuote[];
  selectedCompany?: string;
  onCompanySelect: (companyName: string) => void;
}

interface CompanyInfo {
  name: string;
  displayName: string;
  logoUrl: string;
  subsidiaryName: string | null;
  quotes: OptimizedHospitalIndemnityQuote[];
  amBestRating?: string;
  starRating?: number;
  availableRiders: string[];
  planCount: number;
}

export function CarrierSelectionView({ 
  quotes, 
  selectedCompany, 
  onCompanySelect 
}: CarrierSelectionViewProps) {
  // Filter valid quotes
  const validQuotes = useMemo(() => {
    return quotes.filter(quote => hasValidBenefitStructure(quote));
  }, [quotes]);

  // Group quotes by company and build company info
  const availableCompanies = useMemo(() => {
    const companiesList = Array.from(new Set(validQuotes.map(q => q.companyFullName || q.companyName))).sort();
    
    return companiesList.map(companyName => {
      const companyQuotes = validQuotes.filter(q => (q.companyFullName || q.companyName) === companyName);
      const representativeQuote = companyQuotes[0];
      
      // Get enhanced carrier info
      const displayName = getCarrierDisplayName(companyName, companyName);
      const logoUrl = getCachedLogoUrl(companyName, companyName);
      const subsidiaryName = getSubsidiaryName(companyName, 'hospital-indemnity');
      
      // Get all available riders for this company
      const allRiders = new Set<string>();
      companyQuotes.forEach(quote => {
        const additionalRiders = getAdditionalRiders(quote);
        additionalRiders.forEach(rider => allRiders.add(rider.name));
      });
      
      return {
        name: companyName,
        displayName,
        logoUrl,
        subsidiaryName,
        quotes: companyQuotes,
        amBestRating: representativeQuote.ambest?.rating,
        starRating: representativeQuote.ambest?.rating ? amBestToStars(representativeQuote.ambest.rating) : undefined,
        availableRiders: Array.from(allRiders),
        planCount: companyQuotes.length
      };
    });
  }, [validQuotes]);

  return (
    <div>    
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableCompanies.map((company) => (
          <Card 
            key={company.name}
            className={`cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 hover:border-blue-300 ${
              selectedCompany === company.name ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : 'hover:border-gray-300'
            }`}
            onClick={() => onCompanySelect(company.name)}
          >
            <CardContent className="p-6">
              {/* Company Header */}
              <div className="mb-4 pb-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Carrier Logo */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      <Image
                        src={company.logoUrl}
                        alt={`${company.displayName} logo`}
                        width={48}
                        height={48}
                        className="w-full h-full object-contain"
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                          const target = e.currentTarget;
                          const parent = target.parentElement;
                          if (parent) {
                            target.style.display = 'none';
                            const initials = company.displayName
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
                        <h4 className="text-xl font-bold text-primary">{company.displayName}</h4>
                      </div>
                      <div className="flex items-center gap-2 my-1">
                        <AmBestStarRating 
                          amBestRating={company.amBestRating}
                          size="sm"
                        />
                      </div>
                      {company.subsidiaryName && (
                        <p className="text-sm text-muted-foreground">{company.subsidiaryName}</p>
                      )}
                    </div>
                  </div>
                  {selectedCompany === company.name && (
                    <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                  )}
                </div>
              </div>
              
              {/* Plan Summary */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Available Plans</span>
                    <Badge variant="outline" className="text-xs">
                      {company.planCount} options
                    </Badge>
                  </div>
                </div>
                
                {/* Rider Badges */}
                {company.availableRiders.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Available Riders ({company.availableRiders.length}):
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {Array.from(new Set(company.availableRiders.map(riderName => abbreviateRiderName(riderName)))).slice(0, 20).map((abbreviatedName, index) => (
                        <Badge 
                          key={`${abbreviatedName}-${index}`} 
                          variant="outline" 
                          className="text-xs"
                        >
                          {abbreviatedName}
                        </Badge>
                      ))}
                      {company.availableRiders.length > 20 && (
                        <Badge variant="outline" className="text-xs">
                          +{company.availableRiders.length - 20} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}