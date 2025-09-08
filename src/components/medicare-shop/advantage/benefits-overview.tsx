import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MedicareAdvantageQuote } from '@/types/medicare-advantage';
import { getBenefitStatusDisplay } from '@/utils/benefit-status';
import { getBenefitData } from '@/utils/medicare-advantage-data';
import { getBenefitIcon } from '@/utils/benefit-icons';
import { formatBenefitText } from '@/components/medicare-shop/advantage/benefit-formatter';

interface BenefitsOverviewProps {
  selectedPlan: MedicareAdvantageQuote;
}

export const BenefitsOverview: React.FC<BenefitsOverviewProps> = ({ selectedPlan }) => {
  // All available benefit types from the API
  const allBenefitTypes = [
    'Additional Telehealth Services',
    'Ambulance',
    'Annual Physical Exam',
    'Comprehensive Dental Service',
    'Defined Supplemental Benefits',
    'Diagnostic tests lab and radiology services and x-rays (Costs for these services may be different if received in an outpatient surgery setting)',
    'Dialysis Services',
    'Doctor\'s office visits',
    'Emergency Care',
    'Foot care (podiatry services)',
    'Health Plan Deductible',
    'Hearing services',
    'Inpatient Hospital',
    'Maximum Oopc',
    'Meal Benefit',
    'Medical Equipment',
    'Medicare Part B',
    'Mental health care',
    'Non Opioid Pain Management',
    'Opioid Treatment Services',
    'Optional Supplemental Benefits',
    'Otc Items',
    'Other Deductibles',
    'Outpatient Hospital',
    'Outpatient rehabilitation',
    'Preventive Care',
    'Preventive Dental Service',
    'Skilled Nursing Facility (SNF)',
    'Transportation',
    'Transportation Services',
    'Vision',
    'Wellness Programs',
    'Worldwide Emergency Urgent Coverage',
    'Outpatient prescription drugs'
  ];

  // Categorize benefits by service setting
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

  // Create benefit objects for each category
  const createBenefitCards = (categoryBenefits: string[], categoryName: string) => {
    // Display name mappings for better UX
    const displayNameMap: Record<string, string> = {
      'Comprehensive Dental Service': 'Dental (Comprehensive)',
      'Preventive Dental Service': 'Dental (Preventive)',
      'Diagnostic tests lab and radiology services and x-rays (Costs for these services may be different if received in an outpatient surgery setting)': 'Diagnostic Services'
    };
    
    // Description mappings for benefits that need additional context
    const descriptionMap: Record<string, string> = {
      'Diagnostic tests lab and radiology services and x-rays (Costs for these services may be different if received in an outpatient surgery setting)': 'Costs for these services may be different if received in an outpatient surgery setting'
    };
    
    // Priority order within each category (lower number = higher priority)
    const benefitPriority: Record<string, number> = {
      // Specialty & Benefits priority order
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
      'Worldwide Emergency Urgent Coverage': 14,
      
      // Outpatient Services priority order
      'Doctor\'s office visits': 1,
      'Annual Physical Exam': 2,
      'Preventive Care': 3,
      'Emergency Care': 4,
      'Ambulance': 5,
      'Outpatient Hospital': 6,
      'Outpatient rehabilitation': 7,
      'Diagnostic tests lab and radiology services and x-rays (Costs for these services may be different if received in an outpatient surgery setting)': 8,
      'Additional Telehealth Services': 9,
      
      // Inpatient/Facility priority order
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
    
    const planBenefitTypes = selectedPlan.benefits.map(b => b.benefit_type);
    const benefitObjects = planBenefitTypes
      .filter(benefitType => benefitType !== 'Outpatient prescription drugs' && categoryBenefits.includes(benefitType))
      .map((benefitType, index) => {
        const statusDisplay = getBenefitStatusDisplay(selectedPlan, benefitType);
        const benefitData = statusDisplay.status === 'covered' ? getBenefitData(selectedPlan, benefitType) : 'Not Available';
        const benefit = selectedPlan.benefits.find(b => 
          b.benefit_type.toLowerCase() === benefitType.toLowerCase() ||
          b.benefit_type.toLowerCase().includes(benefitType.toLowerCase())
        );
        
        return {
          benefitType,
          displayName: displayNameMap[benefitType] || benefitType,
          description: descriptionMap[benefitType],
          index: `${categoryName}-${index}`,
          statusDisplay,
          benefitData,
          benefit,
          priority: benefitPriority[benefitType] || 999
        };
      });
    
    // Sort by status within each category, then by priority within status
    const statusOrder: Record<string, number> = { 'covered': 1, 'unclear': 2, 'not-covered': 3, 'not-found': 4 };
    return benefitObjects.sort((a, b) => {
      // First sort by coverage status
      const statusDiff = (statusOrder[a.statusDisplay.status] || 999) - (statusOrder[b.statusDisplay.status] || 999);
      if (statusDiff !== 0) return statusDiff;
      
      // Then sort by priority within the same status
      return a.priority - b.priority;
    });
  };

  const outpatientCards = createBenefitCards(outpatientServices, 'outpatient');
  const inpatientCards = createBenefitCards(inpatientFacility, 'inpatient');
  const specialtyCards = createBenefitCards(specialtyBenefits, 'specialty');

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Available Benefit Types Coverage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Full-width items for pharmaceutical data */}
          {allBenefitTypes.filter(benefitType => benefitType === 'Outpatient prescription drugs').map((benefitType, index) => {
            const benefit = selectedPlan.benefits.find(b => 
              b.benefit_type.toLowerCase() === benefitType.toLowerCase() ||
              b.benefit_type.toLowerCase().includes(benefitType.toLowerCase())
            );
            
            // For pharmaceutical data, always use the full_description when available
            const benefitData = benefit ? benefit.full_description : 'Not Available';
            
            return (
              <div key={`pharma-${index}`} className="p-3 border rounded w-full border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getBenefitIcon(benefitType)}
                    <span className="text-sm font-medium">{benefitType}</span>
                  </div>
                </div>
                {benefit && (
                  <div className="text-xs text-gray-600">
                    {/* Show pharmaceutical table if available, otherwise show no coverage message */}
                    {benefitData && benefitData !== 'Not Available' ? (
                      <div>
                        {formatBenefitText(benefitData)}
                      </div>
                    ) : (
                      <div className="p-3 text-center text-gray-500">
                        No drug coverage available
                      </div>
                    )}
                  </div>
                )}
                {!benefit && (
                  <div className="p-3 text-center text-gray-500">
                    No drug coverage available
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Grid layout for other benefits - organized by service setting */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Inpatient/Facility Column */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Inpatient/Facility</h3>
              {inpatientCards.map(({ benefitType, displayName, description, index, statusDisplay, benefitData, benefit }) => (
                <div key={index} className="p-3 border rounded border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getBenefitIcon(benefitType)}
                      <span className="text-sm font-medium">{displayName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {statusDisplay.icon}
                    </div>
                  </div>
                  {description && (
                    <div className="text-xs text-gray-500 mb-2 italic">
                      {description}
                    </div>
                  )}
                  {benefit && (
                    <div className="text-xs text-gray-600">
                      {/* Show separate In-Network and Out-of-Network sections */}
                      {benefit.summary_description?.in_network && (
                        <div className="mt-2 p-2 bg-green-50 rounded">
                          <strong>In-Network:</strong>
                          <div className="mt-1">
                            {formatBenefitText(benefit.summary_description.in_network)}
                          </div>
                        </div>
                      )}
                      {benefit.summary_description?.out_network && (
                        <div className="mt-2 p-2 bg-blue-50 rounded">
                          <strong>Out-of-Network:</strong>
                          <div className="mt-1">
                            {formatBenefitText(benefit.summary_description.out_network)}
                          </div>
                        </div>
                      )}
                      {/* Fallback to combined data if separate network data isn't available */}
                      {(statusDisplay.status === 'covered' || statusDisplay.status === 'unclear') && !benefit.summary_description?.in_network && !benefit.summary_description?.out_network && (
                        <div className="mt-2">
                          {formatBenefitText(benefitData)}
                        </div>
                      )}
                      {statusDisplay.status !== 'covered' && benefit && (
                        <div className={`italic ${statusDisplay.textColor}`}>
                          {statusDisplay.status === 'not-covered' ? 'This benefit is not covered by this plan' :
                           statusDisplay.status === 'unclear' ? 'Coverage details are unclear - contact plan for details' :
                           'Benefit information not available'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Outpatient Services Column */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Outpatient Services</h3>
              {outpatientCards.map(({ benefitType, displayName, description, index, statusDisplay, benefitData, benefit }) => (
                <div key={index} className="p-3 border rounded border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getBenefitIcon(benefitType)}
                      <span className="text-sm font-medium">{displayName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {statusDisplay.icon}
                    </div>
                  </div>
                  {description && (
                    <div className="text-xs text-gray-500 mb-2 italic">
                      {description}
                    </div>
                  )}
                  {benefit && (
                    <div className="text-xs text-gray-600">
                      {/* Show separate In-Network and Out-of-Network sections */}
                      {benefit.summary_description?.in_network && (
                        <div className="mt-2 p-2 bg-green-50 rounded">
                          <strong>In-Network:</strong>
                          <div className="mt-1">
                            {formatBenefitText(benefit.summary_description.in_network)}
                          </div>
                        </div>
                      )}
                      {benefit.summary_description?.out_network && (
                        <div className="mt-2 p-2 bg-blue-50 rounded">
                          <strong>Out-of-Network:</strong>
                          <div className="mt-1">
                            {formatBenefitText(benefit.summary_description.out_network)}
                          </div>
                        </div>
                      )}
                      {/* Fallback to combined data if separate network data isn't available */}
                      {(statusDisplay.status === 'covered' || statusDisplay.status === 'unclear') && !benefit.summary_description?.in_network && !benefit.summary_description?.out_network && (
                        <div className="mt-2">
                          {formatBenefitText(benefitData)}
                        </div>
                      )}
                      {statusDisplay.status !== 'covered' && benefit && (
                        <div className={`italic ${statusDisplay.textColor}`}>
                          {statusDisplay.status === 'not-covered' ? 'This benefit is not covered by this plan' :
                           statusDisplay.status === 'unclear' ? 'Coverage details are unclear - contact plan for details' :
                           'Benefit information not available'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Specialty & Benefits Column */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Specialty & Benefits</h3>
              {specialtyCards.map(({ benefitType, displayName, description, index, statusDisplay, benefitData, benefit }) => (
                <div key={index} className="p-3 border rounded border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getBenefitIcon(benefitType)}
                      <span className="text-sm font-medium">{displayName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {statusDisplay.icon}
                    </div>
                  </div>
                  {description && (
                    <div className="text-xs text-gray-500 mb-2 italic">
                      {description}
                    </div>
                  )}
                  {benefit && (
                    <div className="text-xs text-gray-600">
                      {/* Show separate In-Network and Out-of-Network sections */}
                      {benefit.summary_description?.in_network && (
                        <div className="mt-2 p-2 bg-green-50 rounded">
                          <strong>In-Network:</strong>
                          <div className="mt-1">
                            {formatBenefitText(benefit.summary_description.in_network)}
                          </div>
                        </div>
                      )}
                      {benefit.summary_description?.out_network && (
                        <div className="mt-2 p-2 bg-blue-50 rounded">
                          <strong>Out-of-Network:</strong>
                          <div className="mt-1">
                            {formatBenefitText(benefit.summary_description.out_network)}
                          </div>
                        </div>
                      )}
                      {!benefit.summary_description?.in_network && !benefit.summary_description?.out_network && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-gray-500">
                          {statusDisplay.status === 'not-covered' ? 'This benefit is not covered by this plan' :
                           statusDisplay.status === 'unclear' ? 'Coverage details are unclear - contact plan for details' :
                           'Benefit information not available'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
