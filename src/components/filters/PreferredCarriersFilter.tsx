/**
 * Preferred Carriers Filter Component
 * 
 * Provides a filter option in the sidebar to show only preferred carriers
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { StarFilledIcon, InfoCircledIcon } from '@radix-ui/react-icons';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PreferredCarriersFilterProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  preferredCount?: number;
  totalCount?: number;
  category: 'medicare-supplement' | 'medicare-advantage' | 'dental' | 'final-expense' | 'hospital-indemnity';
}

const CATEGORY_LABELS = {
  'medicare-supplement': 'Medicare Supplement',
  'medicare-advantage': 'Medicare Advantage',
  'dental': 'Dental',
  'final-expense': 'Final Expense',
  'hospital-indemnity': 'Hospital Indemnity'
};

export default function PreferredCarriersFilter({
  isEnabled,
  onToggle,
  preferredCount = 0,
  totalCount = 0,
  category
}: PreferredCarriersFilterProps) {
  const percentage = totalCount > 0 ? ((preferredCount / totalCount) * 100).toFixed(0) : 0;
  
  return (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <StarFilledIcon className="h-4 w-4 text-yellow-500" />
          <span className="font-medium text-gray-900">Preferred Carriers</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoCircledIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Show only quotes from our carefully selected preferred carriers. 
                  These carriers offer competitive rates, excellent customer service, 
                  and strong financial ratings.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Switch
          checked={isEnabled}
          onCheckedChange={onToggle}
          aria-label="Toggle preferred carriers filter"
        />
      </div>
      
      {totalCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Badge 
            variant={isEnabled ? "default" : "secondary"}
            className={`text-xs ${isEnabled ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : ''}`}
          >
            {preferredCount} of {totalCount} quotes ({percentage}%)
          </Badge>
          {isEnabled && (
            <span className="text-xs text-gray-500">
              Showing preferred carriers only
            </span>
          )}
        </div>
      )}
      
      <div className="mt-2 text-xs text-gray-500">
        {CATEGORY_LABELS[category]} preferred carriers
      </div>
    </div>
  );
}
