import React from 'react';
import { MedicareAdvantageQuote } from '@/types/medicare-advantage';
import { getBenefitStatusDisplay } from '@/utils/benefit-status';
import { getBenefitData } from '@/utils/medicare-advantage-data';
import { getBenefitIcon } from '@/utils/benefit-icons';
import { formatBenefitText } from '@/components/benefit-formatter';

interface BenefitCategoryProps {
  selectedPlan: MedicareAdvantageQuote;
  benefitTypes: string[];
  displayNameMap?: Record<string, string>;
  benefitPriority?: Record<string, number>;
}

export const BenefitCategory: React.FC<BenefitCategoryProps> = ({
  selectedPlan,
  benefitTypes,
  displayNameMap = {},
  benefitPriority = {}
}) => {
  const allBenefitTypes = selectedPlan.benefits.map(b => b.benefit_type);
  const benefitObjects = allBenefitTypes
    .filter(benefitType => benefitTypes.includes(benefitType))
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
        index: `benefit-${index}`,
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

  return (
    <div className="space-y-4">
      {sortedBenefits.map(({ benefitType, displayName, index, statusDisplay, benefitData, benefit }) => (
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
      ))}
    </div>
  );
};
