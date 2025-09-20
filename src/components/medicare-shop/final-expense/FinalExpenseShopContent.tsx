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
// NEW enriched design now exported from former .legacy file (kept filename to minimize diff churn)
import FinalExpensePlanCards, { FinalExpenseCarrierSummary as EnrichedCarrierSummary } from '@/components/medicare-shop/quote-cards/FinalExpensePlanCards.legacy';
// LEGACY simpler design now lives in the plain filename export renamed to FinalExpensePlanCardsLegacy
import FinalExpensePlanCardsLegacy from '@/components/medicare-shop/quote-cards/FinalExpensePlanCards';
import { SavedPlanChips } from '@/components/medicare-shop/quote-cards/SavedPlanChips';

export default function FinalExpenseShopContent({ 
  quotes, 
  isLoading = false, 
  onSelectPlan 
}: FinalExpenseShopContentProps) {
  // Card mode persistence ("new" = enriched tall design, "legacy" = simpler earlier layout)
  const [useNewCards, setUseNewCards] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false; // default to original for comparison
    try {
      const stored = localStorage.getItem('feCardsMode');
      if (stored === 'new') return true;
      if (stored === 'legacy') return false;
    } catch {}
    return false;
  });
  // Content no longer persists/broadcasts mode; sidebar owns source of truth.
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

  // Build grouped data once for both variants
  const feGroups = React.useMemo(() => groupFinalExpenseQuotesByCompany(quotes), [quotes]);

  // Carrier summaries consumed by the (actually new) design in `.legacy` file
  const carrierSummaries: EnrichedCarrierSummary[] = React.useMemo(() => {
    return feGroups.map(g => ({
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
  }, [feGroups]);

  // Map carrier display name -> first quote (for deep link selection when using the enriched design)
  const carrierFirstQuoteMap = React.useMemo(() => {
    const m = new Map<string, FinalExpenseQuote>();
    feGroups.forEach(g => {
      const name = getCarrierDisplayNameForQuote(g.quotes[0]);
      if (!m.has(name)) m.set(name, g.quotes[0]);
    });
    return m;
  }, [feGroups]);

  // Listen for external toggle events dispatched from sidebar
  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.mode) setUseNewCards(detail.mode === 'new');
    };
    window.addEventListener('feCardsMode:change', handler as EventListener);
    return () => window.removeEventListener('feCardsMode:change', handler as EventListener);
  }, []);

  // We no longer emit a header event; chips now occupy the old heading position directly here.

  return (
    <div className="space-y-6">
      {/* Saved plan chips moved here per updated requirement (replacing old title position) */}
      <div className="mb-2">
      </div>
      {useNewCards ? (
        <FinalExpensePlanCards
          carriers={carrierSummaries}
          loading={false}
          onOpenCarrierDetails={(c) => {
            if (!onSelectPlan) return;
            const q = carrierFirstQuoteMap.get(c.name);
            if (q) onSelectPlan(q); else onSelectPlan(quotes[0]);
          }}
        />
      ) : (
        <FinalExpensePlanCardsLegacy quotes={quotes} loading={false} onSelectPlan={onSelectPlan} />
      )}
    </div>
  );
}
