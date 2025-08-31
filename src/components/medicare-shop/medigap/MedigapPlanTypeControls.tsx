"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { UpdateIcon } from "@radix-ui/react-icons";

interface MedigapPlanTypeControlsProps {
  selectedQuotePlans: string[];
  setSelectedQuotePlans: (plans: string[]) => void;
  hasQuotesForPlan: (planType: string) => boolean;
  fetchIndividualPlanQuotes: (planType: string) => void;
  loadingPlanButton: string | null;
}

export default function MedigapPlanTypeControls({
  selectedQuotePlans,
  setSelectedQuotePlans,
  hasQuotesForPlan,
  fetchIndividualPlanQuotes,
  loadingPlanButton
}: MedigapPlanTypeControlsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-muted-foreground">Plan Types:</span>
        <div className="flex items-center gap-4">
          {/* Plan F */}
          {hasQuotesForPlan('F') ? (
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="header-plan-f"
                checked={selectedQuotePlans.includes('F')}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedQuotePlans([...selectedQuotePlans, 'F']);
                  } else {
                    setSelectedQuotePlans(selectedQuotePlans.filter(plan => plan !== 'F'));
                  }
                }}
                className="border-blue-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <label htmlFor="header-plan-f" className="text-sm font-medium">
                Plan F
              </label>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => fetchIndividualPlanQuotes('F')}
              disabled={loadingPlanButton === 'F'}
              className="text-xs px-3 py-1 border-blue-300 text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-400"
            >
              {loadingPlanButton === 'F' ? (
                <>
                  <UpdateIcon className="w-3 h-3 animate-spin mr-1" />
                  Loading...
                </>
              ) : (
                '+ Plan F'
              )}
            </Button>
          )}
          
          {/* Plan G */}
          {hasQuotesForPlan('G') ? (
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="header-plan-g"
                checked={selectedQuotePlans.includes('G')}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedQuotePlans([...selectedQuotePlans, 'G']);
                  } else {
                    setSelectedQuotePlans(selectedQuotePlans.filter(plan => plan !== 'G'));
                  }
                }}
                className="border-green-400 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
              />
              <label htmlFor="header-plan-g" className="text-sm font-medium">
                Plan G
              </label>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => fetchIndividualPlanQuotes('G')}
              disabled={loadingPlanButton === 'G'}
              className="text-xs px-3 py-1 border-green-300 text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30 hover:border-green-400"
            >
              {loadingPlanButton === 'G' ? (
                <>
                  <UpdateIcon className="w-3 h-3 animate-spin mr-1" />
                  Loading...
                </>
              ) : (
                '+ Plan G'
              )}
            </Button>
          )}
          
          {/* Plan N */}
          {hasQuotesForPlan('N') ? (
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="header-plan-n"
                checked={selectedQuotePlans.includes('N')}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedQuotePlans([...selectedQuotePlans, 'N']);
                  } else {
                    setSelectedQuotePlans(selectedQuotePlans.filter(plan => plan !== 'N'));
                  }
                }}
                className="border-purple-400 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <label htmlFor="header-plan-n" className="text-sm font-medium">
                Plan N
              </label>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => fetchIndividualPlanQuotes('N')}
              disabled={loadingPlanButton === 'N'}
              className="text-xs px-3 py-1 border-purple-300 text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:border-purple-400"
            >
              {loadingPlanButton === 'N' ? (
                <>
                  <UpdateIcon className="w-3 h-3 animate-spin mr-1" />
                  Loading...
                </>
              ) : (
                '+ Plan N'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
