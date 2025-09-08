import React from 'react';
import { MedicareAdvantageQuote } from '@/types/medicare-advantage';
import { getBenefitIcon } from '@/utils/benefit-icons';
import { formatBenefitText } from '@/components/medicare-shop/advantage/benefit-formatter';

interface PrescriptionsComponentProps {
  selectedPlan: MedicareAdvantageQuote;
}

export const PrescriptionsComponent: React.FC<PrescriptionsComponentProps> = ({ selectedPlan }) => {
  const allBenefitTypes = selectedPlan.benefits.map(b => b.benefit_type);
  
  return (
    <div className="space-y-4">
      {/* Pharmaceutical data - full width */}
      {allBenefitTypes.filter(benefitType => benefitType === 'Outpatient prescription drugs').map((benefitType, index) => {
        const benefit = selectedPlan.benefits.find(b => 
          b.benefit_type.toLowerCase() === benefitType.toLowerCase() ||
          b.benefit_type.toLowerCase().includes(benefitType.toLowerCase())
        );
        
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
    </div>
  );
};
