"use client";

import React from "react";

interface MedigapResultsHeaderProps {
  selectedCategory: string;
  realQuotes: any[];
  advantageQuotes?: any[];
  drugPlanQuotes?: any[];
  dentalQuotes?: any[];
  hospitalIndemnityQuotes?: any[];
  finalExpenseQuotes?: any[];
  cancerInsuranceQuotes?: any[];
  paginationInfo: {
    startItem: number;
    endItem: number;
    totalItems: number;
  };
}

export default function MedigapResultsHeader({
  selectedCategory,
  realQuotes,
  advantageQuotes = [],
  drugPlanQuotes = [],
  dentalQuotes = [],
  hospitalIndemnityQuotes = [],
  finalExpenseQuotes = [],
  cancerInsuranceQuotes = [],
  paginationInfo
}: MedigapResultsHeaderProps) {
  // Get the appropriate quote array based on selected category
  const getCurrentQuotes = () => {
    switch (selectedCategory) {
      case 'medigap':
        return realQuotes;
      case 'advantage':
        return advantageQuotes;
      case 'drug-plan':
        return drugPlanQuotes;
      case 'dental':
        return dentalQuotes;
      case 'hospital-indemnity':
        return hospitalIndemnityQuotes;
      case 'final-expense':
        return finalExpenseQuotes;
      case 'cancer':
        return cancerInsuranceQuotes;
      default:
        return realQuotes;
    }
  };

  const currentQuotes = getCurrentQuotes();
  const totalQuotes = currentQuotes.length;

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        {selectedCategory === 'medigap' && totalQuotes > 0 ? (
          <>
            Showing {paginationInfo.startItem}-{paginationInfo.endItem} of {paginationInfo.totalItems} carrier{paginationInfo.totalItems !== 1 ? 's' : ''}
            <span className="ml-2 text-xs">
              ({totalQuotes} quote{totalQuotes !== 1 ? 's' : ''} loaded)
            </span>
          </>
        ) : totalQuotes > 0 ? (
          <>
            Showing 1-{totalQuotes} of {totalQuotes} plan{totalQuotes !== 1 ? 's' : ''}
          </>
        ) : (
          <>
            Showing 1-0 of 0 plans
          </>
        )}
      </p>
    </div>
  );
}
