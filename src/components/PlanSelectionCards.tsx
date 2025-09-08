'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { StarIcon as Star, StarFilledIcon as StarFilled } from "@radix-ui/react-icons";
import { 
  FaStethoscope, FaEye, FaHeadphones, FaPills, FaTooth, FaCar, FaUtensils
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

interface PlanSelectionCardsProps {
  plans: MedicareAdvantageQuote[];
  plansPerPage: number;
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  selectedPlan: MedicareAdvantageQuote | null;
  setSelectedPlan: (plan: MedicareAdvantageQuote | null) => void;
  getMedicalDeductible: (plan: MedicareAdvantageQuote) => string;
  getDrugDeductible: (plan: MedicareAdvantageQuote) => string;
  hasDrugCoverage: (plan: MedicareAdvantageQuote) => boolean;
  getMOOPData: (plan: MedicareAdvantageQuote) => { inNetwork: string; outNetwork: string; combined: string };
  getBenefitStatusDisplay: (plan: MedicareAdvantageQuote, benefitName: string) => { status: string };
  formatCurrency: (amount: number) => string;
}

export default function PlanSelectionCards({
  plans,
  plansPerPage,
  currentPage,
  setCurrentPage,
  selectedPlan,
  setSelectedPlan,
  getMedicalDeductible,
  getDrugDeductible,
  hasDrugCoverage,
  getMOOPData,
  getBenefitStatusDisplay,
  formatCurrency
}: PlanSelectionCardsProps) {
  return (
    <div>
      <div className="flex flex-col min-h-96">
        <div className="flex-1 space-y-2">
          {plans.slice(currentPage * plansPerPage, (currentPage + 1) * plansPerPage).map((plan) => {
            // Check if this plan has pharmaceutical data with dollar amounts or percentages
            const pharmaData = plan.benefits.find(b => b.benefit_type === 'Outpatient prescription drugs')?.full_description || '';
            const hasDollarAmounts = pharmaData.includes('$') && pharmaData.match(/\$[1-9]\d*/);
            const hasPercentages = pharmaData.includes('%');
            const hasRealValues = hasDollarAmounts || hasPercentages;
            
            return (
              <Button
                key={plan.key}
                variant={selectedPlan?.key === plan.key ? "default" : "outline"}
                className="w-full justify-start text-left h-auto p-3 sm:p-4"
                onClick={() => setSelectedPlan(plan)}
              >
                <div className="w-full">
                  {/* Mobile Layout (stacked) */}
                  <div className="block sm:hidden space-y-3">
                    <div className="space-y-1">
                      <div className={`font-semibold text-sm ${selectedPlan?.key === plan.key ? 'text-white' : 'text-gray-900'}`}>
                        {plan.plan_name}
                      </div>
                      <div className={`text-xs font-mono ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-500'}`}>
                        {plan.contract_id}-{plan.plan_id}-{plan.segment_id} ({plan.contract_year})
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => 
                            i < plan.overall_star_rating ? (
                              <StarFilled 
                                key={i} 
                                className="w-3 h-3 text-yellow-500" 
                              />
                            ) : (
                              <Star 
                                key={i} 
                                className={`w-3 h-3 ${selectedPlan?.key === plan.key ? 'text-gray-400' : 'text-gray-300'}`}
                              />
                            )
                          )}
                        </div>
                        <div className={`text-xs ${selectedPlan?.key === plan.key ? 'text-gray-200' : 'text-gray-600'}`}>
                          {plan.organization_name}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-lg font-bold ${selectedPlan?.key === plan.key ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(plan.month_rate / 100)}/mo
                        </div>
                        {plan.part_b_reduction && plan.part_b_reduction !== "0" && (
                          <div className="text-green-400 font-medium text-xs">Giveback: ${plan.part_b_reduction}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getBenefitStatusDisplay(plan, 'Comprehensive Dental Service').status === 'covered' && (
                          <FaTooth className={`w-3 h-3 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Dental" />
                        )}
                        {getBenefitStatusDisplay(plan, 'Vision').status === 'covered' && (
                          <FaEye className={`w-3 h-3 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Vision" />
                        )}
                        {getBenefitStatusDisplay(plan, 'Hearing services').status === 'covered' && (
                          <FaHeadphones className={`w-3 h-3 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Hearing" />
                        )}
                        {getBenefitStatusDisplay(plan, 'Transportation').status === 'covered' && (
                          <FaCar className={`w-3 h-3 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Transportation" />
                        )}
                        {getBenefitStatusDisplay(plan, 'Meal Benefit').status === 'covered' && (
                          <FaUtensils className={`w-3 h-3 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Meal Benefit" />
                        )}
                      </div>
                      
                      <div className={`text-xs space-y-1 ${selectedPlan?.key === plan.key ? 'text-gray-200' : 'text-gray-600'}`}>
                        <div className="flex items-center justify-end gap-1">
                          <FaStethoscope className={`w-3 h-3 ${selectedPlan?.key === plan.key ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className="font-medium text-xs">{getMedicalDeductible(plan)}</span>
                          {hasDrugCoverage(plan) && (
                            <>
                              <span className={`${selectedPlan?.key === plan.key ? 'text-gray-400' : 'text-gray-400'}`}>|</span>
                              <FaPills className={`w-3 h-3 ${selectedPlan?.key === plan.key ? 'text-gray-400' : 'text-gray-500'}`} />
                              <span className="font-medium text-xs">{getDrugDeductible(plan)}</span>
                            </>
                          )}
                        </div>
                        
                        <div className="font-medium text-xs text-right">
                          <span className={`${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-500'}`}>MOOP:</span>
                          {getMOOPData(plan).inNetwork !== 'N/A' && getMOOPData(plan).inNetwork !== 'Contact Plan' && (
                            <span className="ml-1">{getMOOPData(plan).inNetwork}</span>
                          )}
                          {getMOOPData(plan).combined !== 'N/A' && getMOOPData(plan).combined !== 'Contact Plan' && (
                            <span>
                              {getMOOPData(plan).inNetwork !== 'N/A' && getMOOPData(plan).inNetwork !== 'Contact Plan' ? (
                                <span className={`mx-1 ${selectedPlan?.key === plan.key ? 'text-gray-400' : 'text-gray-400'}`}>|</span>
                              ) : ' '}
                              {getMOOPData(plan).combined}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Desktop Layout (grid) */}
                  <div className="hidden sm:block">
                    <div className="grid grid-cols-3 gap-4 lg:gap-6">
                      <div className="col-span-2 space-y-2">
                        <div>
                          <div className={`font-semibold text-base lg:text-lg ${selectedPlan?.key === plan.key ? 'text-white' : 'text-gray-900'}`}>
                            {plan.plan_name}
                          </div>
                          <div className={`text-xs mt-0.5 font-mono ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-500'}`}>
                            {plan.contract_id}-{plan.plan_id}-{plan.segment_id} ({plan.contract_year})
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => 
                            i < plan.overall_star_rating ? (
                              <StarFilled 
                                key={i} 
                                className="w-4 h-4 text-yellow-500" 
                              />
                            ) : (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${selectedPlan?.key === plan.key ? 'text-gray-400' : 'text-gray-300'}`}
                              />
                            )
                          )}
                        </div>
                        
                        <div className={`text-sm font-medium ${selectedPlan?.key === plan.key ? 'text-gray-200' : 'text-gray-600'}`}>
                          {plan.organization_name}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {getBenefitStatusDisplay(plan, 'Comprehensive Dental Service').status === 'covered' && (
                            <FaTooth className={`w-4 h-4 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Dental" />
                          )}
                          {getBenefitStatusDisplay(plan, 'Vision').status === 'covered' && (
                            <FaEye className={`w-4 h-4 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Vision" />
                          )}
                          {getBenefitStatusDisplay(plan, 'Hearing services').status === 'covered' && (
                            <FaHeadphones className={`w-4 h-4 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Hearing" />
                          )}
                          {getBenefitStatusDisplay(plan, 'Transportation').status === 'covered' && (
                            <FaCar className={`w-4 h-4 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Transportation" />
                          )}
                          {getBenefitStatusDisplay(plan, 'Meal Benefit').status === 'covered' && (
                            <FaUtensils className={`w-4 h-4 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Meal Benefit" />
                          )}
                        </div>
                      </div>
                      
                      <div className="col-span-1 text-right flex flex-col justify-between h-full py-1">
                        <div className={`text-xl font-bold ${selectedPlan?.key === plan.key ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(plan.month_rate / 100)}/mo
                        </div>
                        
                        <div className={`text-sm space-y-1 ${selectedPlan?.key === plan.key ? 'text-gray-200' : 'text-gray-600'}`}>
                          {/* Show giveback if available */}
                          {plan.part_b_reduction && plan.part_b_reduction !== "0" && (
                            <div className="text-green-400 font-medium">Giveback: ${plan.part_b_reduction}</div>
                          )}
                          
                          <div className="flex items-center justify-end gap-1.5">
                            <FaStethoscope className={`w-3.5 h-3.5 ${selectedPlan?.key === plan.key ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className="font-medium">{getMedicalDeductible(plan)}</span>
                            {/* Only show drug deductible if plan has drug coverage */}
                            {hasDrugCoverage(plan) && (
                              <>
                                <span className={`${selectedPlan?.key === plan.key ? 'text-gray-400' : 'text-gray-400'}`}>|</span>
                                <FaPills className={`w-3.5 h-3.5 ${selectedPlan?.key === plan.key ? 'text-gray-400' : 'text-gray-500'}`} />
                                <span className="font-medium">{getDrugDeductible(plan)}</span>
                              </>
                            )}
                          </div>
                          
                          <div className="font-medium">
                            <span className={`${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-500'}`}>MOOP:</span>
                            {getMOOPData(plan).inNetwork !== 'N/A' && getMOOPData(plan).inNetwork !== 'Contact Plan' && (
                              <span className="ml-1">{getMOOPData(plan).inNetwork}</span>
                            )}
                            {getMOOPData(plan).combined !== 'N/A' && getMOOPData(plan).combined !== 'Contact Plan' && (
                              <span>
                                {getMOOPData(plan).inNetwork !== 'N/A' && getMOOPData(plan).inNetwork !== 'Contact Plan' ? (
                                  <span className={`mx-1 ${selectedPlan?.key === plan.key ? 'text-gray-400' : 'text-gray-400'}`}>|</span>
                                ) : ' '}
                                {getMOOPData(plan).combined}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
        
        {/* Pagination */}
        {plans.length > plansPerPage && (
          <div className="flex items-center justify-between pt-3 border-t">
            <button
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              {currentPage + 1} of {Math.ceil(plans.length / plansPerPage)}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(plans.length / plansPerPage) - 1, prev + 1))}
              disabled={currentPage >= Math.ceil(plans.length / plansPerPage) - 1}
              className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
}: PlanSelectionCardsProps) {
  const currentPlans = plans.slice(currentPage * plansPerPage, (currentPage + 1) * plansPerPage)

  return (
    <div className="lg:w-1/2 w-full">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-xl font-bold mb-3">Available Plans ({plans.length})</h2>
        
        {/* Mobile layout */}
        <div className="block lg:hidden space-y-3">
          {currentPlans.map((plan) => (
            <Button
              key={plan.key}
              variant="ghost"
              className={`w-full h-auto p-3 text-left transition-all duration-200 rounded-lg ${
                selectedPlan?.key === plan.key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'hover:bg-gray-50 border border-gray-200'
              }`}
              onClick={() => setSelectedPlan(plan)}
            >
              <div className="w-full space-y-2">
                {/* Plan name and stars row */}
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-2">
                    <div className={`font-semibold text-sm ${selectedPlan?.key === plan.key ? 'text-white' : 'text-gray-900'}`}>
                      {plan.plan_name}
                    </div>
                    <div className={`text-xs ${selectedPlan?.key === plan.key ? 'text-gray-200' : 'text-gray-600'}`}>
                      {plan.organization_name}
                    </div>
                    <div className={`text-xs ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-500'}`}>
                      Contract: {plan.contract_id}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${selectedPlan?.key === plan.key ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(plan.month_rate / 100)}/mo
                    </div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-xs ${
                            i < plan.overall_star_rating
                              ? 'text-yellow-400'
                              : selectedPlan?.key === plan.key ? 'text-gray-400' : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Icons and benefits row */}
                <div className="flex justify-between items-center pt-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {getBenefitStatusDisplay(plan, 'Dental').status === 'covered' && (
                      <FaTooth className={`w-3 h-3 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Dental" />
                    )}
                    {getBenefitStatusDisplay(plan, 'Vision').status === 'covered' && (
                      <FaEye className={`w-3 h-3 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Vision" />
                    )}
                    {getBenefitStatusDisplay(plan, 'Hearing').status === 'covered' && (
                      <FaSyringe className={`w-3 h-3 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Hearing" />
                    )}
                    {getBenefitStatusDisplay(plan, 'Wellness').status === 'covered' && (
                      <FaHeart className={`w-3 h-3 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Wellness" />
                    )}
                    {getBenefitStatusDisplay(plan, 'Fitness').status === 'covered' && (
                      <FaDumbbell className={`w-3 h-3 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Fitness" />
                    )}
                    {getBenefitStatusDisplay(plan, 'Transportation').status === 'covered' && (
                      <FaCar className={`w-3 h-3 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Transportation" />
                    )}
                    {getBenefitStatusDisplay(plan, 'Meal Benefit').status === 'covered' && (
                      <FaUtensils className={`w-3 h-3 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Meal Benefit" />
                    )}
                  </div>
                </div>

                {/* Deductibles and MOOP row */}
                <div className="space-y-1">
                  {/* Show giveback if available */}
                  {plan.part_b_reduction && plan.part_b_reduction !== "0" && (
                    <div className="text-green-400 font-medium text-xs">Giveback: ${plan.part_b_reduction}</div>
                  )}
                  
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <FaStethoscope className={`w-3 h-3 ${selectedPlan?.key === plan.key ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className="font-medium">{getMedicalDeductible(plan)}</span>
                    </div>
                    {/* Only show drug deductible if plan has drug coverage */}
                    {hasDrugCoverage(plan) && (
                      <div className="flex items-center gap-1">
                        <span className={`${selectedPlan?.key === plan.key ? 'text-gray-400' : 'text-gray-400'}`}>|</span>
                        <FaPills className={`w-3 h-3 ${selectedPlan?.key === plan.key ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className="font-medium">{getDrugDeductible(plan)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs font-medium">
                    <span className={`${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-500'}`}>MOOP:</span>
                    {getMOOPData(plan).inNetwork !== 'N/A' && getMOOPData(plan).inNetwork !== 'Contact Plan' && (
                      <span className="ml-1">{getMOOPData(plan).inNetwork}</span>
                    )}
                    {getMOOPData(plan).combined !== 'N/A' && getMOOPData(plan).combined !== 'Contact Plan' && (
                      <span>
                        {getMOOPData(plan).inNetwork !== 'N/A' && getMOOPData(plan).inNetwork !== 'Contact Plan' ? (
                          <span className={`mx-1 ${selectedPlan?.key === plan.key ? 'text-gray-400' : 'text-gray-400'}`}>|</span>
                        ) : ' '}
                        {getMOOPData(plan).combined}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>

        {/* Desktop layout */}
        <div className="hidden lg:block space-y-2">
          {currentPlans.map((plan) => (
            <Button
              key={plan.key}
              variant="ghost"
              className={`w-full h-auto p-3 text-left transition-all duration-200 rounded-lg ${
                selectedPlan?.key === plan.key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'hover:bg-gray-50 border border-gray-200'
              }`}
              onClick={() => setSelectedPlan(plan)}
            >
              <div className="w-full">
                <div className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-7">
                    <div className={`font-semibold text-sm ${selectedPlan?.key === plan.key ? 'text-white' : 'text-gray-900'}`}>
                      {plan.plan_name}
                    </div>
                    <div className={`text-xs ${selectedPlan?.key === plan.key ? 'text-gray-200' : 'text-gray-600'}`}>
                      {plan.organization_name}
                    </div>
                    <div className={`text-xs ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-500'}`}>
                      Contract: {plan.contract_id}
                    </div>
                  </div>
                  
                  <div className="col-span-1 flex justify-center">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-xs ${
                            i < plan.overall_star_rating
                              ? 'text-yellow-400'
                              : selectedPlan?.key === plan.key ? 'text-gray-400' : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="col-span-3 flex items-center justify-center">
                    <div className="flex items-center gap-1.5 flex-wrap justify-center">
                      {getBenefitStatusDisplay(plan, 'Dental').status === 'covered' && (
                        <FaTooth className={`w-4 h-4 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Dental" />
                      )}
                      {getBenefitStatusDisplay(plan, 'Vision').status === 'covered' && (
                        <FaEye className={`w-4 h-4 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Vision" />
                      )}
                      {getBenefitStatusDisplay(plan, 'Hearing').status === 'covered' && (
                        <FaSyringe className={`w-4 h-4 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Hearing" />
                      )}
                      {getBenefitStatusDisplay(plan, 'Wellness').status === 'covered' && (
                        <FaHeart className={`w-4 h-4 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Wellness" />
                      )}
                      {getBenefitStatusDisplay(plan, 'Fitness').status === 'covered' && (
                        <FaDumbbell className={`w-4 h-4 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Fitness" />
                      )}
                      {getBenefitStatusDisplay(plan, 'Transportation').status === 'covered' && (
                        <FaCar className={`w-4 h-4 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Transportation" />
                      )}
                      {getBenefitStatusDisplay(plan, 'Meal Benefit').status === 'covered' && (
                        <FaUtensils className={`w-4 h-4 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Meal Benefit" />
                      )}
                    </div>
                  </div>
                  
                  <div className="col-span-1 text-right flex flex-col justify-between h-full py-1">
                    <div className={`text-xl font-bold ${selectedPlan?.key === plan.key ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(plan.month_rate / 100)}/mo
                    </div>
                    
                    <div className={`text-sm space-y-1 ${selectedPlan?.key === plan.key ? 'text-gray-200' : 'text-gray-600'}`}>
                      {/* Show giveback if available */}
                      {plan.part_b_reduction && plan.part_b_reduction !== "0" && (
                        <div className="text-green-400 font-medium">Giveback: ${plan.part_b_reduction}</div>
                      )}
                      
                      <div className="flex items-center justify-end gap-1.5">
                        <FaStethoscope className={`w-3.5 h-3.5 ${selectedPlan?.key === plan.key ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className="font-medium">{getMedicalDeductible(plan)}</span>
                        {/* Only show drug deductible if plan has drug coverage */}
                        {hasDrugCoverage(plan) && (
                          <>
                            <span className={`${selectedPlan?.key === plan.key ? 'text-gray-400' : 'text-gray-400'}`}>|</span>
                            <FaPills className={`w-3.5 h-3.5 ${selectedPlan?.key === plan.key ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className="font-medium">{getDrugDeductible(plan)}</span>
                          </>
                        )}
                      </div>
                      
                      <div className="font-medium">
                        <span className={`${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-500'}`}>MOOP:</span>
                        {getMOOPData(plan).inNetwork !== 'N/A' && getMOOPData(plan).inNetwork !== 'Contact Plan' && (
                          <span className="ml-1">{getMOOPData(plan).inNetwork}</span>
                        )}
                        {getMOOPData(plan).combined !== 'N/A' && getMOOPData(plan).combined !== 'Contact Plan' && (
                          <span>
                            {getMOOPData(plan).inNetwork !== 'N/A' && getMOOPData(plan).inNetwork !== 'Contact Plan' ? (
                              <span className={`mx-1 ${selectedPlan?.key === plan.key ? 'text-gray-400' : 'text-gray-400'}`}>|</span>
                            ) : ' '}
                            {getMOOPData(plan).combined}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
        
        {/* Pagination */}
        {plans.length > plansPerPage && (
          <div className="flex items-center justify-between pt-3 border-t">
            <button
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              {currentPage + 1} of {Math.ceil(plans.length / plansPerPage)}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(plans.length / plansPerPage) - 1, prev + 1))}
              disabled={currentPage >= Math.ceil(plans.length / plansPerPage) - 1}
              className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
