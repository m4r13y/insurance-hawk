import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StarIcon as Star, StarFilledIcon as StarFilled } from "@radix-ui/react-icons";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { MedicareAdvantageQuote, CarouselPage } from '@/types/medicare-advantage';
import { FieldMappingTable } from './field-mapping-table';
import { BenefitCategory } from './benefit-category';
import { PrescriptionsComponent } from './prescriptions-component';

interface PlanCarouselProps {
  selectedPlan: MedicareAdvantageQuote | null;
  currentCarouselPage: number;
  setCurrentCarouselPage: React.Dispatch<React.SetStateAction<number>>;
  carouselPages: CarouselPage[];
  onViewDetails: () => void;
}

export const PlanCarousel: React.FC<PlanCarouselProps> = ({
  selectedPlan,
  currentCarouselPage,
  setCurrentCarouselPage,
  carouselPages,
  onViewDetails
}) => {
  // Benefit category configurations
  const specialtyBenefits = [
    'Vision',
    'Hearing services',
    'Mental health care',
    'Foot care (podiatry services)',
    'Comprehensive Dental Service',
    'Preventive Dental Service',
    'Transportation',
    'Transportation Services',
    'Wellness Programs',
    'Meal Benefit',
    'Otc Items',
    'Defined Supplemental Benefits',
    'Optional Supplemental Benefits',
    'Worldwide Emergency Urgent Coverage'
  ];

  const outpatientServices = [
    'Doctor\'s office visits',
    'Annual Physical Exam', 
    'Preventive Care',
    'Outpatient Hospital',
    'Outpatient rehabilitation',
    'Diagnostic tests lab and radiology services and x-rays (Costs for these services may be different if received in an outpatient surgery setting)',
    'Additional Telehealth Services',
    'Emergency Care',
    'Ambulance'
  ];

  const inpatientFacility = [
    'Inpatient Hospital',
    'Skilled Nursing Facility (SNF)',
    'Dialysis Services',
    'Medical Equipment',
    'Health Plan Deductible',
    'Other Deductibles',
    'Medicare Part B',
    'Non Opioid Pain Management',
    'Opioid Treatment Services'
  ];

  const specialtyDisplayNameMap: Record<string, string> = {
    'Comprehensive Dental Service': 'Dental (Comprehensive)',
    'Preventive Dental Service': 'Dental (Preventive)'
  };

  const outpatientDisplayNameMap: Record<string, string> = {
    'Diagnostic tests lab and radiology services and x-rays (Costs for these services may be different if received in an outpatient surgery setting)': 'Diagnostic Services'
  };

  const specialtyBenefitPriority: Record<string, number> = {
    'Preventive Dental Service': 1,
    'Comprehensive Dental Service': 2,
    'Vision': 3,
    'Hearing services': 4,
    'Otc Items': 5,
    'Transportation': 6,
    'Transportation Services': 7,
    'Meal Benefit': 8,
    'Wellness Programs': 9,
    'Foot care (podiatry services)': 10,
    'Mental health care': 11,
    'Defined Supplemental Benefits': 12,
    'Optional Supplemental Benefits': 13,
    'Worldwide Emergency Urgent Coverage': 14
  };

  const outpatientBenefitPriority: Record<string, number> = {
    'Doctor\'s office visits': 1,
    'Annual Physical Exam': 2,
    'Preventive Care': 3,
    'Emergency Care': 4,
    'Ambulance': 5,
    'Outpatient Hospital': 6,
    'Outpatient rehabilitation': 7,
    'Diagnostic tests lab and radiology services and x-rays (Costs for these services may be different if received in an outpatient surgery setting)': 8,
    'Additional Telehealth Services': 9
  };

  const inpatientBenefitPriority: Record<string, number> = {
    'Inpatient Hospital': 1,
    'Skilled Nursing Facility (SNF)': 2,
    'Dialysis Services': 3,
    'Medical Equipment': 4,
    'Health Plan Deductible': 5,
    'Other Deductibles': 6,
    'Medicare Part B': 7,
    'Non Opioid Pain Management': 8,
    'Opioid Treatment Services': 9
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {selectedPlan ? (
            <div>
              <div>{selectedPlan.plan_name}</div>
              <div className="text-sm font-normal text-gray-600 mt-1 flex items-center gap-2">
                <span>{selectedPlan.organization_name}</span>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => 
                    i < selectedPlan.overall_star_rating ? (
                      <StarFilled 
                        key={i} 
                        className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-500" 
                      />
                    ) : (
                      <Star 
                        key={i} 
                        className="w-3 h-3 lg:w-4 lg:h-4 text-gray-300" 
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          ) : (
            'Plan Details'
          )}
        </CardTitle>
        
        {/* Carousel Navigation and View Details Button */}
        <div className="flex items-center justify-between mt-3">
          <button
            onClick={onViewDetails}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            View Details
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentCarouselPage(prev => Math.max(0, prev - 1))}
              disabled={currentCarouselPage === 0}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="text-sm font-medium px-3 py-1 bg-gray-100 rounded">
              {carouselPages[currentCarouselPage]?.title}
            </div>
            
            <button
              onClick={() => setCurrentCarouselPage(prev => Math.min(carouselPages.length - 1, prev + 1))}
              disabled={currentCarouselPage === carouselPages.length - 1}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Summary Page */}
        {currentCarouselPage === 0 && selectedPlan && (
          <FieldMappingTable selectedPlan={selectedPlan} />
        )}
        
        {/* Specialty & Benefits Page */}
        {currentCarouselPage === 1 && selectedPlan && (
          <BenefitCategory 
            selectedPlan={selectedPlan}
            benefitTypes={specialtyBenefits}
            displayNameMap={specialtyDisplayNameMap}
            benefitPriority={specialtyBenefitPriority}
          />
        )}
        
        {/* Outpatient Services Page */}
        {currentCarouselPage === 2 && selectedPlan && (
          <BenefitCategory 
            selectedPlan={selectedPlan}
            benefitTypes={outpatientServices}
            displayNameMap={outpatientDisplayNameMap}
            benefitPriority={outpatientBenefitPriority}
          />
        )}
        
        {/* Inpatient/Facility Page */}
        {currentCarouselPage === 3 && selectedPlan && (
          <BenefitCategory 
            selectedPlan={selectedPlan}
            benefitTypes={inpatientFacility}
            benefitPriority={inpatientBenefitPriority}
          />
        )}
        
        {/* Prescriptions Page */}
        {currentCarouselPage === 4 && selectedPlan && (
          <PrescriptionsComponent selectedPlan={selectedPlan} />
        )}
      </CardContent>
    </Card>
  );
};
