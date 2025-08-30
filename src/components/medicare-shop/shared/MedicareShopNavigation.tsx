"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { RotateCcw } from "lucide-react";

interface MedicareShopNavigationProps {
  selectedFlowCategories: string[];
  activeCategory: string;
  onCategoryToggle: (category: 'medigap' | 'advantage') => void;
  onReset: () => void;
}

export default function MedicareShopNavigation({
  selectedFlowCategories,
  activeCategory,
  onCategoryToggle,
  onReset
}: MedicareShopNavigationProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg border">
        <div className="flex items-center gap-4">
          {/* Category Toggle for when both Medigap and Advantage are selected */}
          {selectedFlowCategories.includes('medigap') && selectedFlowCategories.includes('advantage') && (
            <div className="flex items-center gap-2 p-1 bg-background rounded-lg border">
              <Button
                variant={activeCategory === 'medigap' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onCategoryToggle('medigap')}
                className="flex-1"
              >
                Medicare Supplement
              </Button>
              <Button
                variant={activeCategory === 'advantage' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onCategoryToggle('advantage')}
                className="flex-1"
              >
                Medicare Advantage
              </Button>
            </div>
          )}
        </div>
        
        {/* Reset Button - Moved to right of toggles */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
              title="Clear all quotes and start over"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset All Data?</AlertDialogTitle>
              <AlertDialogDescription>
                This will clear all your quotes, form data, and filters. You'll need to start over from the beginning. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Reset Everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
