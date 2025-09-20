import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import { getCarrierLogoUrl } from '@/lib/carrier-system';
import { CMSStarRating } from '@/components/ui/cms-star-rating';

interface DrugPlanDetailsHeaderProps {
  carrierName: string;
  onGoBack: () => void;
  min: number;
  max: number;
  deductible?: number;
  star?: number;
}

export const DrugPlanDetailsHeader: React.FC<DrugPlanDetailsHeaderProps> = ({ carrierName, onGoBack, min, max, deductible, star }) => {
  const logoUrl = getCarrierLogoUrl(carrierName);
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
                <Image src={logoUrl} alt={carrierName} fill sizes="24px" className="object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
              <div className="flex flex-col">
                <h1 className="font-medium text-base text-slate-800 dark:text-slate-100">{carrierName}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <CMSStarRating rating={star} showText={false} />
                  {deductible != null && <span className="text-[11px] text-slate-500 dark:text-slate-400">Deductible ${deductible.toFixed(0)}</span>}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="text-sm text-slate-500 dark:text-slate-400">Monthly Premium</div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                ${min.toFixed(2)}{max !== min && <span className="text-slate-500 dark:text-slate-400 font-medium"> – ${max.toFixed(2)}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrugPlanDetailsHeader;
