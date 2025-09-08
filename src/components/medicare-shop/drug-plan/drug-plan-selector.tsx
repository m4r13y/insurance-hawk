import React from 'react';
import { Button } from "@/components/ui/button";
import { StarIcon as Star, StarFilledIcon as StarFilled } from "@radix-ui/react-icons";
import { DrugPlanQuote } from '@/types/drug-plan';
import { 
  formatCurrency, 
  getMonthlyPremium, 
  getAnnualDeductible,
  hasGapCoverage,
  hasSpecialtyDrugCoverage,
  hasMailOrder
} from '@/utils/drug-plan-data';
import { FaPills, FaShippingFast, FaShieldAlt, FaStar } from 'react-icons/fa';

interface DrugPlanSelectorProps {
  plans: DrugPlanQuote[];
  selectedPlan: DrugPlanQuote | null;
  onSelectPlan: (plan: DrugPlanQuote | null) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  plansPerPage: number;
  detailsCard?: React.ReactNode;
}

export function DrugPlanSelector({
  plans,
  selectedPlan,
  onSelectPlan,
  currentPage,
  setCurrentPage,
  plansPerPage,
  detailsCard
}: DrugPlanSelectorProps) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1280); // xl breakpoint
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const startIndex = currentPage * plansPerPage;
  const endIndex = startIndex + plansPerPage;
  const currentPlans = plans.slice(startIndex, endIndex);
  const totalPages = Math.ceil(plans.length / plansPerPage);

  return (
    <div className="space-y-4">
      {/* Plans */}
      <div className="space-y-3">
        {currentPlans.map((plan) => {
          const isSelected = selectedPlan?.key === plan.key;
          
          return (
            <div key={plan.key}>
              <Button
                variant={isSelected ? "default" : "outline"}
                className="w-full justify-start text-left h-auto p-3 sm:p-4 overflow-hidden"
                onClick={() => {
                  // On mobile, allow deselecting by clicking the same plan
                  if (isSelected && isMobile) {
                    onSelectPlan(null);
                  } else {
                    onSelectPlan(plan);
                  }
                }}
              >
                <div className="w-full min-w-0">
                  {/* Mobile Layout (stacked) */}
                  <div className="block sm:hidden space-y-3">
                    <div className="space-y-1 min-w-0">
                      <div className={`font-semibold text-sm leading-tight truncate ${selectedPlan?.key === plan.key ? 'text-white' : 'text-gray-900'}`} title={plan.plan_name}>
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
                          {getMonthlyPremium(plan)}/mo
                        </div>
                        <div className={`text-xs ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-600'}`}>
                          Deductible: {getAnnualDeductible(plan)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {hasGapCoverage(plan) && (
                          <FaShieldAlt className={`w-3 h-3 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Gap Coverage" />
                        )}
                        {hasSpecialtyDrugCoverage(plan) && (
                          <FaPills className={`w-3 h-3 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Specialty Drugs" />
                        )}
                        {hasMailOrder(plan) && (
                          <FaShippingFast className={`w-3 h-3 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Mail Order" />
                        )}
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
                          {hasGapCoverage(plan) && (
                            <FaShieldAlt className={`w-4 h-4 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Gap Coverage" />
                          )}
                          {hasSpecialtyDrugCoverage(plan) && (
                            <FaPills className={`w-4 h-4 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Specialty Drugs" />
                          )}
                          {hasMailOrder(plan) && (
                            <FaShippingFast className={`w-4 h-4 ${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-700'}`} title="Mail Order" />
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right flex flex-col justify-between h-full py-1 w-[160px]">
                        <div className={`text-xl font-bold whitespace-nowrap ${selectedPlan?.key === plan.key ? 'text-white' : 'text-gray-900'}`}>
                          {getMonthlyPremium(plan)}/mo
                        </div>
                        
                        <div className={`text-sm space-y-1 ${selectedPlan?.key === plan.key ? 'text-gray-200' : 'text-gray-600'}`}>
                          <div className="font-medium">
                            <span className={`${selectedPlan?.key === plan.key ? 'text-gray-300' : 'text-gray-500'}`}>Deductible:</span>
                            <span className="ml-1">{getAnnualDeductible(plan)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Button>
              
              {/* Show details card directly after selected plan on mobile */}
              {isSelected && detailsCard && isMobile && detailsCard}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
