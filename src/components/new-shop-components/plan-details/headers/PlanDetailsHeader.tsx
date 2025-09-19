import React from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import { getCarrierLogoUrl } from "@/lib/carrier-system";
import { QuoteData } from '../types';

interface PlanDetailsHeaderProps {
  quoteData: QuoteData;
  onGoBack: () => void;
  calculateDiscountedRate: (rate: number, discounts: any[]) => number;
  getCurrentRate: () => number | null;
  formatCurrency: (amount: number) => string;
}

export const PlanDetailsHeader: React.FC<PlanDetailsHeaderProps> = ({
  quoteData,
  onGoBack,
  calculateDiscountedRate,
  getCurrentRate,
  formatCurrency
}) => {
  // Defensive: legacy quotes may have company_base, adapter quotes may have carrier
  const companyBaseName = (quoteData as any)?.company_base?.name || (quoteData as any)?.company_base?.name_full;
  const carrierObj = (quoteData as any).carrier;
  const fallbackName = carrierObj?.displayName || carrierObj?.name || (quoteData as any).company || 'Unknown Carrier';
  const displayName = companyBaseName || fallbackName;
  const logoUrl = getCarrierLogoUrl(displayName);
  const currentRate = getCurrentRate();
  // Plan may be string or object { key, display }
  const rawPlan = (quoteData as any).plan;
  const planDisplay = typeof rawPlan === 'string' ? rawPlan : (rawPlan?.key ? rawPlan.key : (rawPlan?.display || ''));
  return (
    <div className="sticky top-20 z-40 backdrop-blur-sm pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="px-10 py-5 flex rounded-2xl items-center justify-between h-20 border border-slate-200/70 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/60 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/55 dark:supports-[backdrop-filter]:bg-slate-900/55">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onGoBack} className="flex items-center space-x-1 text-muted-foreground hover:text-foreground">
              <ArrowLeftIcon className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Back</span>
            </Button>
            <Separator orientation="vertical" className="h-5" />
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 relative flex-shrink-0">
                <Image src={logoUrl} alt={displayName} fill sizes="24px" className="object-contain" onError={(e) => { const t = e.target as HTMLImageElement; t.style.display = 'none'; }} />
              </div>
              <div>
                <h1 className="font-medium text-base text-slate-800 dark:text-slate-100">{displayName}</h1>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-slate-500 dark:text-slate-400">Plan {planDisplay}</div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                {currentRate !== null ? (
                  `${formatCurrency(currentRate)}/mo`
                ) : (
                  <span className="text-slate-400 dark:text-slate-500">Select an option</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
