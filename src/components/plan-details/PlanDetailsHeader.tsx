import React from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import { getCarrierLogoUrl } from "@/lib/carrier-system";
import { QuoteData } from './types.js';

interface PlanDetailsHeaderProps {
  quoteData: QuoteData;
  onGoBack: () => void;
  calculateDiscountedRate: (rate: number, discounts: any[]) => number;
  getCurrentRate: () => number;
  formatCurrency: (amount: number) => string;
}

export const PlanDetailsHeader: React.FC<PlanDetailsHeaderProps> = ({
  quoteData,
  onGoBack,
  calculateDiscountedRate,
  getCurrentRate,
  formatCurrency
}) => {
  const logoUrl = getCarrierLogoUrl(quoteData.company_base.name);

  return (
    <div className="sticky top-20 z-40 backdrop-blur-sm pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card/50 px-10 py-5 flex rounded-2xl items-center justify-between h-20">
          {/* Left side - Back button and company info */}
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onGoBack}
              className="flex items-center space-x-1 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Back</span>
            </Button>
            <Separator orientation="vertical" className="h-5" />
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 relative flex-shrink-0">
                <Image
                  src={logoUrl}
                  alt={quoteData.company_base.name}
                  fill
                  sizes="24px"
                  className="object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h1 className="font-medium text-base">{quoteData.company_base.name}</h1>
              </div>
            </div>
          </div>

          {/* Right side - Plan and action */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Plan {quoteData.plan}</div>
              <div className="font-semibold text-primary">
                {formatCurrency(getCurrentRate())}/mo
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
