"use client";
import React from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SaveToggleButton } from './SharedCardParts';
import { useSavedPlans } from '@/contexts/SavedPlansContext';
import { FinalExpenseQuote, getFinalExpenseCarrierName, groupFinalExpenseQuotesByCompany } from '@/types/final-expense';
import { getEnhancedCarrierInfo, getCarrierDisplayName } from '@/lib/carrier-system';

interface Props {
  quotes: FinalExpenseQuote[];
  loading?: boolean;
  onSelectPlan?: (quote: FinalExpenseQuote) => void;
}

// LEGACY (Simpler) DESIGN
// This file now represents the simpler/earlier Final Expense card layout.
// The enriched new design lives in `FinalExpensePlanCards.legacy.tsx` (kept filename to minimize churn elsewhere)
// but exports a default named `FinalExpensePlanCards`.

const FinalExpensePlanCardsLegacy: React.FC<Props> = ({ quotes, loading = false, onSelectPlan }) => {
  // Saved plans context (defensive: swallow if provider absent during experimentation)
  let isSaved = (_id:string,_pt?:string,_cat?:string)=>false;
  let toggle = (_rec:any)=>{};
  try {
    const ctx = useSavedPlans();
    if (ctx) { isSaved = ctx.isSaved; toggle = ctx.toggle; }
  } catch {/* intentionally ignore */}

  if (loading) {
    // Minimal skeleton (avoid pulling in shared skeleton styles to keep change surface tiny)
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" aria-busy="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-64 rounded-xl border border-gray-200 animate-pulse bg-gray-100/60" />
        ))}
      </div>
    );
  }

  if (!quotes || quotes.length === 0) {
    return <div className="text-sm text-gray-500">No Final Expense quotes.</div>;
  }

  const formatCurrency = (amount: number): string => {
    let adjusted = amount;
    if (amount > 1000) {
      if (amount / 100 <= 500) adjusted = amount / 100; else if (amount / 12 <= 500) adjusted = amount / 12; else adjusted = Math.min(amount, 500);
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(adjusted).replace('$','');
  };

  const formatFee = (amount: number): string => new Intl.NumberFormat('en-US', { style:'currency', currency:'USD', minimumFractionDigits:2, maximumFractionDigits:2 }).format(amount).replace('$','');

  const getCarrierDisplayNameForQuote = (q: FinalExpenseQuote) => {
    const carrierName = getFinalExpenseCarrierName(q);
    return getCarrierDisplayName(carrierName, 'final-expense');
  };

  const getCarrierLogoUrl = (q: FinalExpenseQuote) => {
    const carrierName = getFinalExpenseCarrierName(q);
    const tempQuote = { carrier: { name: carrierName } } as any;
    const enhanced = getEnhancedCarrierInfo(tempQuote, 'final-expense');
    return enhanced.logoUrl || '/images/carrier-placeholder.svg';
  };

  const grouped = groupFinalExpenseQuotesByCompany(quotes);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {grouped.map((group, index) => {
        const carrierId = group.company_key || String(index);
        const carrierName = getCarrierDisplayNameForQuote(group.quotes[0]);
        const logo = getCarrierLogoUrl(group.quotes[0]);
        const saved = isSaved(carrierId, 'FE', 'final-expense');
        const min = group.price_range.min;
        const max = group.price_range.max;
        return (
          <Card key={carrierId} className="relative hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300">
            {/* Save button overlay */}
            <SaveToggleButton
              saved={saved}
              onToggle={() => toggle({ carrierId, carrierName, logo, rating: 'N/A', category: 'final-expense', planType: 'FE', price: min, min, max })}
              ariaLabelSave={`Save ${carrierName}`}
              ariaLabelUnsave={`Unsave ${carrierName}`}
            />
            {/* Header */}
            <div className="flex items-center justify-between p-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  <Image
                    src={logo}
                    alt={`${carrierName} logo`}
                    width={40}
                    height={40}
                    className="w-full h-full object-contain"
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { (e.currentTarget as HTMLImageElement).style.display='none'; }}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-base">{carrierName}</h3>
                  <p className="text-sm text-gray-600">{group.plan_count} option{group.plan_count !== 1 ? 's' : ''} available</p>
                </div>
              </div>
            </div>
            <div className="px-4 pb-4">
              {/* Price Range */}
              <div className="mb-4">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {min === max
                    ? `$${formatCurrency(min)}`
                    : `$${formatCurrency(min)} - $${formatCurrency(max)}`}
                  <span className="text-base font-normal text-gray-600">/month</span>
                </div>
              </div>
              {/* Description */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900">Final Expense Life Insurance</h4>
                <p className="text-sm text-gray-600">Multiple coverage amounts available</p>
              </div>
              {/* Fees */}
              {(group.quotes.some(q => q.monthly_fee) || group.quotes.some(q => q.annual_fee)) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {group.quotes.some(q => q.monthly_fee) && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                      ${formatFee(group.quotes.find(q => q.monthly_fee)?.monthly_fee || 0)} monthly policy fee
                    </span>
                  )}
                  {group.quotes.some(q => q.annual_fee) && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                      ${formatFee(group.quotes.find(q => q.annual_fee)?.annual_fee || 0)} annual policy fee
                    </span>
                  )}
                </div>
              )}
              <Button
                onClick={() => onSelectPlan?.(group.quotes[0])}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-3"
                size="lg"
              >
                View Details
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default FinalExpensePlanCardsLegacy;
