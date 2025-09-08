import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FaCheck, FaTimes, FaQuestion
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

interface AllAvailableBenefitTypesProps {
  allAvailableBenefitTypes: string[];
  quotes: MedicareAdvantageQuote[];
  getBenefitIcon: (benefitType: string) => JSX.Element;
  getBenefitStatusDisplay: (plan: MedicareAdvantageQuote, benefitType: string) => {
    status: string;
    icon: JSX.Element;
    textColor: string;
  };
  getBenefitData: (plan: MedicareAdvantageQuote, benefitType: string) => string;
  formatBenefitText: (text: string) => React.ReactNode;
}

export default function AllAvailableBenefitTypes({
  allAvailableBenefitTypes,
  quotes,
  getBenefitIcon,
  getBenefitStatusDisplay,
  getBenefitData,
  formatBenefitText
}: AllAvailableBenefitTypesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Available Benefit Types</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {allAvailableBenefitTypes.map((benefitType, index) => {
            // Calculate how many plans have this benefit
            const plansWithBenefit = quotes.filter(plan => 
              plan.benefits.some(b => b.benefit_type === benefitType)
            ).length;
            
            return (
              <div key={index} className="p-3 border rounded">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getBenefitIcon(benefitType)}
                    <span className="text-sm font-medium">{benefitType}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {plansWithBenefit} of {quotes.length} plans
                  </div>
                </div>
                
                {/* Show benefit details for each plan */}
                <div className="text-xs text-gray-600 space-y-2">
                  {quotes.map((plan, planIndex) => {
                    const statusDisplay = getBenefitStatusDisplay(plan, benefitType);
                    const benefit = plan.benefits.find(b => b.benefit_type === benefitType);
                    
                    return (
                      <div key={planIndex} className="border-l-2 border-gray-200 pl-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-xs">{plan.plan_name}</span>
                          <div className="flex items-center gap-1">
                            {statusDisplay.icon}
                          </div>
                        </div>
                        
                        {benefit && (
                          <div className="text-xs">
                            {/* Show separate In-Network and Out-of-Network sections */}
                            {benefit.summary_description?.in_network && (
                              <div className="mt-1 p-2 bg-green-50 rounded">
                                <strong>In-Network:</strong>
                                <div className="mt-1">
                                  {formatBenefitText(benefit.summary_description.in_network)}
                                </div>
                              </div>
                            )}
                            {benefit.summary_description?.out_network && (
                              <div className="mt-1 p-2 bg-blue-50 rounded">
                                <strong>Out-of-Network:</strong>
                                <div className="mt-1">
                                  {formatBenefitText(benefit.summary_description.out_network)}
                                </div>
                              </div>
                            )}
                            {!benefit.summary_description?.in_network && !benefit.summary_description?.out_network && (
                              <div className="mt-1 p-2 bg-gray-50 rounded">
                                {statusDisplay.status === 'covered' ? (
                                  formatBenefitText(getBenefitData(plan, benefitType))
                                ) : statusDisplay.status === 'not-covered' ? (
                                  <span className="text-gray-500">This benefit is not covered by this plan</span>
                                ) : statusDisplay.status === 'unclear' ? (
                                  <span className="text-gray-500">Coverage details are unclear - contact plan for details</span>
                                ) : (
                                  <span className="text-gray-500">Benefit information not available</span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {!benefit && (
                          <div className="text-xs text-gray-400 italic">
                            Not available in this plan
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
