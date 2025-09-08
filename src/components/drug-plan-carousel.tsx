import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StarIcon as Star, StarFilledIcon as StarFilled } from "@radix-ui/react-icons";
import { DrugPlanQuote } from '@/types/drug-plan';
import { 
  formatCurrency, 
  getMonthlyPremium, 
  getAnnualDeductible,
  hasGapCoverage,
  hasSpecialtyDrugCoverage,
  hasMailOrder,
  getTier1Copay,
  getTier3Copay
} from '@/utils/drug-plan-data';
import DrugPlanTiersChart from './drug-plan-tiers-chart';

interface DrugPlanCarouselProps {
  selectedPlan: DrugPlanQuote | null;
  onViewDetails: () => void;
}

export const DrugPlanCarousel: React.FC<DrugPlanCarouselProps> = ({
  selectedPlan,
  onViewDetails
}) => {
  if (!selectedPlan) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p>Select a drug plan to see details</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="space-y-3">
          <div>
            <CardTitle className="text-lg font-semibold">{selectedPlan.plan_name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedPlan.contract_id}-{selectedPlan.plan_id}-{selectedPlan.segment_id} ({selectedPlan.contract_year})
            </p>
            <p className="text-sm text-muted-foreground">{selectedPlan.organization_name}</p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Plan Summary & Drug Tiers
            </div>
            <button
              onClick={onViewDetails}
              className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              View Details
            </button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Summary Section */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Plan Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium text-sm text-gray-600">Monthly Premium</span>
              <div className="text-lg font-semibold">{getMonthlyPremium(selectedPlan)}</div>
            </div>
            <div>
              <span className="font-medium text-sm text-gray-600">Annual Deductible</span>
              <div className="text-lg font-semibold">{getAnnualDeductible(selectedPlan)}</div>
            </div>
            <div>
              <span className="font-medium text-sm text-gray-600">Star Rating</span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => 
                  i < selectedPlan.overall_star_rating ? (
                    <StarFilled key={i} className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <Star key={i} className="w-4 h-4 text-gray-300" />
                  )
                )}
                <span className="ml-1 text-sm text-gray-600">
                  {selectedPlan.overall_star_rating}/5
                </span>
              </div>
            </div>
            <div>
              <span className="font-medium text-sm text-gray-600">Gap Coverage</span>
              <div className="text-lg font-semibold">
                {hasGapCoverage(selectedPlan) ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        </div>

        {/* Drug Tiers Section */}
        <div>
          <DrugPlanTiersChart plan={selectedPlan} />
        </div>
      </CardContent>
    </Card>
  );
};
