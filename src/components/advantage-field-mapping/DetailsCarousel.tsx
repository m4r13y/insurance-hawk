import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StarIcon as Star, StarFilledIcon as StarFilled } from "@radix-ui/react-icons";
import { 
  FaChevronLeft, FaChevronRight, FaCheck, FaTimes
} from "react-icons/fa";

interface MedicareAdvantageQuote {
  key: string;
  plan_name: string;
  organization_name: string;
  plan_type: string;
  county: string;
  state: string;
  overall_star_rating: number;
  part_c_rate: number;
  part_d_rate: number;
  month_rate: number;
  in_network_moop: string;
  annual_drug_deductible: number;
  contract_id: string;
  plan_id: string;
  segment_id: string;
  benefits: Array<{
    benefit_type: string;
    full_description: string;
    summary_description?: {
      in_network?: string;
      out_network?: string;
    };
    pd_view_display: boolean;
  }>;
  part_d_subsides?: {
    "25": number;
    "50": number;
    "75": number;
    "100": number;
  };
  contextual_data?: {
    has_eapp: boolean;
    carrier_resources: {
      "Formulary Website"?: string;
      "Pharmacy Website"?: string;
      "Physician Lookup"?: string;
    };
  };
  company_base?: {
    name: string;
    name_full: string;
    naic?: string;
  };
  drug_benefit_type?: string;
  drug_benefit_type_detail?: string;
  zero_premium_with_full_low_income_subsidy?: boolean;
  additional_coverage_offered_in_the_gap?: boolean;
  additional_drug_coverage_offered_in_the_gap?: boolean;
  contract_year: string;
  effective_date: string;
  part_b_reduction?: string;
}

interface DetailsCarouselProps {
  selectedPlan: MedicareAdvantageQuote | null;
  currentCarouselPage: number;
  onCarouselPageChange: (page: number) => void;
  getFieldMappings: () => Array<{ column: string; field: string; value: any }>;
  formatBenefitText: (text: string) => React.ReactNode;
  getBenefitIcon: (benefitType: string) => JSX.Element;
  getBenefitStatusDisplay: (plan: MedicareAdvantageQuote, benefitType: string) => {
    status: string;
    icon: JSX.Element;
    textColor: string;
  };
  getBenefitData: (plan: MedicareAdvantageQuote, benefitType: string) => string;
}

export default function DetailsCarousel({
  selectedPlan,
  currentCarouselPage,
  onCarouselPageChange,
  getFieldMappings,
  formatBenefitText,
  getBenefitIcon,
  getBenefitStatusDisplay,
  getBenefitData
}: DetailsCarouselProps) {
  const carouselPages = [
    { title: 'Field Mapping', id: 'field-mapping' },
    { title: 'Specialty & Benefits', id: 'specialty-benefits' },
    { title: 'Outpatient Services', id: 'outpatient-services' },
    { title: 'Inpatient/Facility', id: 'inpatient-facility' },
    { title: 'Prescriptions', id: 'prescriptions' }
  ];

  const fieldMappings = getFieldMappings();

  if (!selectedPlan) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Please select a plan to view details
          </div>
        </CardContent>
      </Card>
    );
  }

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
        
        {/* Carousel Navigation - moved below stars */}
        <div className="flex items-center gap-2 mt-3 min-w-100 justify-end">
          <button
            onClick={() => onCarouselPageChange(Math.max(0, currentCarouselPage - 1))}
            disabled={currentCarouselPage === 0}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="text-sm font-medium px-3 py-1 bg-gray-100 rounded">
            {carouselPages[currentCarouselPage]?.title}
          </div>
          
          <button
            onClick={() => onCarouselPageChange(Math.min(carouselPages.length - 1, currentCarouselPage + 1))}
            disabled={currentCarouselPage === carouselPages.length - 1}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaChevronRight className="w-4 h-4" />
          </button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Field Mapping Page */}
        {currentCarouselPage === 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>API Reference</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fieldMappings.map((mapping, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{mapping.column}</TableCell>
                  <TableCell className="font-mono text-xs text-gray-600">{mapping.field}</TableCell>
                  <TableCell>{mapping.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        {/* Specialty & Benefits Page */}
        {currentCarouselPage === 1 && selectedPlan && (
          <div className="space-y-4">
            {(() => {
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

              const displayNameMap: Record<string, string> = {
                'Comprehensive Dental Service': 'Dental (Comprehensive)',
                'Preventive Dental Service': 'Dental (Preventive)'
              };

              const benefitPriority: Record<string, number> = {
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

              const allBenefitTypes = selectedPlan.benefits.map(b => b.benefit_type);
              const benefitObjects = allBenefitTypes
                .filter(benefitType => specialtyBenefits.includes(benefitType))
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
                    index: `specialty-${index}`,
                    statusDisplay,
                    benefitData,
                    benefit,
                    priority: benefitPriority[benefitType] || 999
                  };
                });

              const statusOrder: Record<string, number> = { 'covered': 1, 'unclear': 2, 'not-covered': 3, 'not-found': 4 };
              const sortedBenefits = benefitObjects.sort((a, b) => {
                const statusDiff = (statusOrder[a.statusDisplay.status] || 999) - (statusOrder[b.statusDisplay.status] || 999);
                if (statusDiff !== 0) return statusDiff;
                return a.priority - b.priority;
              });

              return sortedBenefits.map(({ benefitType, displayName, index, statusDisplay, benefitData, benefit }) => (
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
                  {!benefit && (
                    <div className="text-xs text-gray-500">Not available in this plan</div>
                  )}
                </div>
              ));
            })()}
          </div>
        )}
        
        {/* Outpatient Services Page */}
        {currentCarouselPage === 2 && selectedPlan && (
          <div className="space-y-4">
            {(() => {
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

              const displayNameMap: Record<string, string> = {
                'Diagnostic tests lab and radiology services and x-rays (Costs for these services may be different if received in an outpatient surgery setting)': 'Diagnostic Services'
              };
              
              const descriptionMap: Record<string, string> = {
                'Diagnostic tests lab and radiology services and x-rays (Costs for these services may be different if received in an outpatient surgery setting)': 'Costs for these services may be different if received in an outpatient surgery setting'
              };

              const benefitPriority: Record<string, number> = {
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

              const allBenefitTypes = selectedPlan.benefits.map(b => b.benefit_type);
              const benefitObjects = allBenefitTypes
                .filter(benefitType => outpatientServices.includes(benefitType))
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
                    index: `outpatient-${index}`,
                    statusDisplay,
                    benefitData,
                    benefit,
                    priority: benefitPriority[benefitType] || 999
                  };
                });

              const statusOrder: Record<string, number> = { 'covered': 1, 'unclear': 2, 'not-covered': 3, 'not-found': 4 };
              const sortedBenefits = benefitObjects.sort((a, b) => {
                const statusDiff = (statusOrder[a.statusDisplay.status] || 999) - (statusOrder[b.statusDisplay.status] || 999);
                if (statusDiff !== 0) return statusDiff;
                return a.priority - b.priority;
              });

              return sortedBenefits.map(({ benefitType, displayName, description, index, statusDisplay, benefitData, benefit }) => (
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
              ));
            })()}
          </div>
        )}
        
        {/* Inpatient/Facility Page */}
        {currentCarouselPage === 3 && selectedPlan && (
          <div className="space-y-4">
            {(() => {
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

              const benefitPriority: Record<string, number> = {
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

              const allBenefitTypes = selectedPlan.benefits.map(b => b.benefit_type);
              const benefitObjects = allBenefitTypes
                .filter(benefitType => inpatientFacility.includes(benefitType))
                .map((benefitType, index) => {
                  const statusDisplay = getBenefitStatusDisplay(selectedPlan, benefitType);
                  const benefitData = statusDisplay.status === 'covered' ? getBenefitData(selectedPlan, benefitType) : 'Not Available';
                  const benefit = selectedPlan.benefits.find(b => 
                    b.benefit_type.toLowerCase() === benefitType.toLowerCase() ||
                    b.benefit_type.toLowerCase().includes(benefitType.toLowerCase())
                  );
                  
                  return {
                    benefitType,
                    displayName: benefitType,
                    index: `inpatient-${index}`,
                    statusDisplay,
                    benefitData,
                    benefit,
                    priority: benefitPriority[benefitType] || 999
                  };
                });

              const statusOrder: Record<string, number> = { 'covered': 1, 'unclear': 2, 'not-covered': 3, 'not-found': 4 };
              const sortedBenefits = benefitObjects.sort((a, b) => {
                const statusDiff = (statusOrder[a.statusDisplay.status] || 999) - (statusOrder[b.statusDisplay.status] || 999);
                if (statusDiff !== 0) return statusDiff;
                return a.priority - b.priority;
              });

              return sortedBenefits.map(({ benefitType, displayName, index, statusDisplay, benefitData, benefit }) => (
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
              ));
            })()}
          </div>
        )}
        
        {/* Prescriptions Page */}
        {currentCarouselPage === 4 && selectedPlan && (
          <div className="space-y-4">
            {/* Pharmaceutical data - full width */}
            {(() => {
              const allBenefitTypes = selectedPlan.benefits.map(b => b.benefit_type);
              return allBenefitTypes.filter(benefitType => benefitType === 'Outpatient prescription drugs').map((benefitType, index) => {
                const statusDisplay = getBenefitStatusDisplay(selectedPlan, benefitType);
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
              });
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
