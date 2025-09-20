"use client";
import React from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FinalExpenseQuote, getFinalExpenseCarrierName, groupFinalExpenseQuotesByCompany } from '@/types/final-expense';
import { getEnhancedCarrierInfo, getCarrierDisplayName } from '@/lib/carrier-system';

interface Props {
  quotes: FinalExpenseQuote[];
  loading?: boolean;
  onSelectPlan?: (quote: FinalExpenseQuote) => void;
}

// NOTE: This component purposefully diverges from the generic card system to mirror
// the bespoke visual style currently used in `final-expense/FinalExpenseShopContent`.
// We've kept a legacy copy in `FinalExpensePlanCards.legacy.tsx` for rollback.

const FinalExpensePlanCards: React.FC<Props> = ({ quotes, loading = false, onSelectPlan }) => {
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
      {grouped.map((group, index) => (
        <Card key={group.company_key || index} className="hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300">
          {/* Header */}
          <div className="flex items-center justify-between p-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                <Image
                  src={getCarrierLogoUrl(group.quotes[0])}
                  alt={`${getCarrierDisplayNameForQuote(group.quotes[0])} logo`}
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { (e.currentTarget as HTMLImageElement).style.display='none'; }}
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base">{getCarrierDisplayNameForQuote(group.quotes[0])}</h3>
                <p className="text-sm text-gray-600">{group.plan_count} option{group.plan_count !== 1 ? 's' : ''} available</p>
              </div>
            </div>
          </div>
          <div className="px-4 pb-4">
            {/* Price Range */}
            <div className="mb-4">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {group.price_range.min === group.price_range.max
                  ? `$${formatCurrency(group.price_range.min)}`
                  : `$${formatCurrency(group.price_range.min)} - $${formatCurrency(group.price_range.max)}`}
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
              Select Plan
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default FinalExpensePlanCards;
