"use client";

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircledIcon, StarFilledIcon, PersonIcon, ClockIcon, FileTextIcon, GlobeIcon, CalendarIcon } from "@radix-ui/react-icons";
import { PlanCardsSkeleton } from "@/components/medicare-shop/shared";
import { FinalExpenseEmptyState } from "./";
import { 
  FinalExpenseQuote, 
  FinalExpenseShopContentProps, 
  getFinalExpenseCarrierName, 
  getFinalExpenseCarrierFullName,
  groupFinalExpenseQuotesByCompany,
  GroupedFinalExpenseQuotes
} from "@/types/final-expense";
import { getEnhancedCarrierInfo, getCarrierDisplayName } from '@/lib/carrier-system';
import FinalExpensePlanCardsLegacy, { FinalExpenseCarrierSummary as LegacyCarrierSummary } from '@/components/medicare-shop/quote-cards/FinalExpensePlanCards.legacy';
import FinalExpensePlanCardsNew from '@/components/medicare-shop/quote-cards/FinalExpensePlanCards';

export default function FinalExpenseShopContent({ 
  quotes, 
  isLoading = false, 
  onSelectPlan 
}: FinalExpenseShopContentProps) {
  // Toggle between original (legacy) arrow/bookmark style and new tall fee-chip style for visual QA
  const [useNewCards, setUseNewCards] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false; // default to original for comparison
    try {
      const stored = localStorage.getItem('feCardsMode');
      if (stored === 'new') return true;
      if (stored === 'legacy') return false;
    } catch {}
    return false;
  });
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('feCardsMode', useNewCards ? 'new' : 'legacy');
      window.dispatchEvent(new CustomEvent('feCardsMode:change', { detail: { mode: useNewCards ? 'new' : 'legacy' } }));
    } catch {}
  }, [useNewCards]);
  if (isLoading) {
    return <PlanCardsSkeleton count={5} title="Final Expense Life Insurance" />;
  }

  if (!quotes || quotes.length === 0) {
    return <FinalExpenseEmptyState />;
  }

  // Helper function to format currency properly
  const formatCurrency = (amount: number): string => {
    // Handle edge case where monthly_rate might be in cents or incorrectly scaled
    // Final expense monthly premiums should typically be under $500/month
    let adjustedAmount = amount;
    
    // If amount is suspiciously large (>$1000), it might be annual or in cents
    if (amount > 1000) {
      // Check if dividing by 100 gives a reasonable monthly premium (cents to dollars)
      if (amount / 100 <= 500) {
        adjustedAmount = amount / 100;
      }
      // Check if dividing by 12 gives a reasonable monthly premium (annual to monthly)
      else if (amount / 12 <= 500) {
        adjustedAmount = amount / 12;
      }
      // If still large, cap at a reasonable maximum
      else {
        adjustedAmount = Math.min(amount, 500);
      }
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(adjustedAmount).replace('$', '');
  };

  // Helper function to format fees with consistent 2 decimal places
  const formatFee = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount).replace('$', '');
  };

  // Helper function to get carrier display name using the carrier system
  const getCarrierDisplayNameForQuote = (quote: FinalExpenseQuote): string => {
    const carrierName = getFinalExpenseCarrierName(quote);
    return getCarrierDisplayName(carrierName, 'final-expense');
  };

  // Helper function for carrier logo
  const getCarrierLogoUrl = (quote: FinalExpenseQuote): string => {
    const carrierName = getFinalExpenseCarrierName(quote);
    const tempQuote = { carrier: { name: carrierName } };
    const enhancedInfo = getEnhancedCarrierInfo(tempQuote, 'final-expense');
    return enhancedInfo.logoUrl || '/images/carrier-placeholder.svg';
  };

  // Derive legacy/original carrier summaries for original card style
  const carrierSummaries: LegacyCarrierSummary[] = React.useMemo(() => {
    return groupFinalExpenseQuotesByCompany(quotes).map(g => ({
      id: g.company_key || (g.quotes[0] as any)?.policy_id || (g.quotes[0] as any)?.id || Math.random().toString(36).slice(2),
      name: getCarrierDisplayNameForQuote(g.quotes[0]),
      logo: getCarrierLogoUrl(g.quotes[0]),
      min: g.price_range.min,
      max: g.price_range.max,
      planRange: { min: g.price_range.min, max: g.price_range.max, count: g.plan_count },
      count: g.plan_count,
      planName: (g.quotes[0] as any)?.plan_name || (g.quotes[0] as any)?.product_name || undefined,
      faceAmount: (g.quotes[0] as any)?.desired_face_value || undefined,
      faceAmountMin: undefined,
      faceAmountMax: undefined,
      underwritingType: (g.quotes[0] as any)?.underwriting_type || undefined,
      graded: (g.quotes.some(q => (q as any)?.graded)) || false,
      immediate: (g.quotes.some(q => (q as any)?.immediate)) || false,
      accidental: (g.quotes.some(q => (q as any)?.accidental)) || false
    }));
  }, [quotes]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => setUseNewCards(v => !v)}
          className="text-[11px] px-3 py-1.5 rounded-md border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          aria-label={useNewCards ? 'Currently viewing New FE Cards. Click to show Original style.' : 'Currently viewing Original FE Cards. Click to show New style.'}
          title={useNewCards ? 'Viewing New FE Cards (click for Original)' : 'Viewing Original FE Cards (click for New)'}
        >
          {useNewCards ? 'New FE Cards (Active)' : 'Original FE Cards (Active)'}
        </button>
      </div>
      {useNewCards ? (
        <FinalExpensePlanCardsNew quotes={quotes} loading={false} onSelectPlan={onSelectPlan} />
      ) : (
        <FinalExpensePlanCardsLegacy carriers={carrierSummaries} loading={false} />
      )}
    </div>
  );
}
