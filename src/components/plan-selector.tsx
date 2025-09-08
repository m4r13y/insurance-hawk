import React from 'react';
import { Button } from "@/components/ui/button";
import { StarIcon as Star, StarFilledIcon as StarFilled } from "@radix-ui/react-icons";
import { FaStethoscope, FaPills, FaTooth, FaEye, FaHeadphones, FaCar, FaUtensils } from "react-icons/fa";
import { MedicareAdvantageQuote, CarouselPage } from '@/types/medicare-advantage';
import { formatCurrency, getMedicalDeductible, getDrugDeductible, getMOOPData, hasDrugCoverage } from '@/utils/medicare-advantage-data';
import { getBenefitStatusDisplay } from '@/utils/benefit-status';
import { PlanCarousel } from './plan-carousel';

interface PlanSelectorProps {
  plans: MedicareAdvantageQuote[];
  selectedPlan: MedicareAdvantageQuote | null;
  onSelectPlan: (plan: MedicareAdvantageQuote | null) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  plansPerPage: number;
  // Carousel props for mobile integration
  currentCarouselPage?: number;
  setCurrentCarouselPage?: React.Dispatch<React.SetStateAction<number>>;
  carouselPages?: CarouselPage[];
  onViewDetails?: () => void;
  showMobileCarousel?: boolean;
}

export const PlanSelector: React.FC<PlanSelectorProps> = ({
  plans,
  selectedPlan,
  onSelectPlan,
  currentPage,
  setCurrentPage,
  plansPerPage,
  currentCarouselPage,
  setCurrentCarouselPage,
  carouselPages,
  onViewDetails,
  showMobileCarousel = false
}) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1280); // xl breakpoint
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  return (
    <div>
      <div className="flex flex-col min-h-96">
        <div className="flex-1 space-y-2">
          {plans.slice(currentPage * plansPerPage, (currentPage + 1) * plansPerPage).map((plan, index) => {
            // Check if this plan has pharmaceutical data with dollar amounts or percentages
            const pharmaData = plan.benefits.find(b => b.benefit_type === 'Outpatient prescription drugs')?.full_description || '';
            const hasDollarAmounts = pharmaData.includes('$') && pharmaData.match(/\$[1-9]\d*/);
            const hasPercentages = pharmaData.includes('%');
            const hasRealValues = hasDollarAmounts || hasPercentages;
            
            const isSelected = selectedPlan?.key === plan.key;
            
            return (
              <div key={plan.key}>
                <Button
                  variant={isSelected ? "default" : "outline"}
                  className="w-full justify-start text-left h-auto p-3 sm:p-4 overflow-hidden"
                  onClick={() => {
                    // On mobile, allow deselecting by clicking the same plan
                    if (isSelected && isMobile) {
                      onSelectPlan(null); // Deselect the plan on mobile
                    } else {
                      onSelectPlan(plan);
                    }
                  }}
                >
                  <div className="w-full min-w-0">
                  {/* Mobile Layout (stacked) */}
                  <div className="block sm:hidden space-y-3">
                    <div className="space-y-1 min-w-0">
                      <div className={`font-semibold text-sm leading-tight break-words ${selectedPlan?.key === plan.key ? 'text-white' : 'text-gray-900'}`}>
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
                    <div className="grid grid-cols-[minmax(0,1fr)_160px] gap-4 lg:gap-6 items-start">
                      <div className="space-y-2 min-w-0">
                        <div className="min-w-0">
                          <div className={`font-semibold text-base lg:text-lg leading-tight truncate pr-4 ${selectedPlan?.key === plan.key ? 'text-white' : 'text-gray-900'}`} title={plan.plan_name}>
                            {plan.plan_name}
                          </div>
                          <div className={`text-xs mt-0.5 font-mono truncate ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-500'}`}>
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
                      
                      <div className="text-right flex flex-col justify-between h-full py-1 w-[160px]">
                        <div className={`text-xl font-bold whitespace-nowrap ${selectedPlan?.key === plan.key ? 'text-white' : 'text-gray-900'}`}>
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
                
                {/* Show carousel after selected plan on mobile */}
                {isSelected && showMobileCarousel && currentCarouselPage !== undefined && setCurrentCarouselPage && carouselPages && onViewDetails && (
                  <div className="mt-4 xl:hidden">
                    <PlanCarousel
                      selectedPlan={selectedPlan}
                      currentCarouselPage={currentCarouselPage}
                      setCurrentCarouselPage={setCurrentCarouselPage}
                      carouselPages={carouselPages}
                      onViewDetails={onViewDetails}
                    />
                  </div>
                )}
              </div>
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
};
