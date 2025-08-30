"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Plus } from "lucide-react";
import MedicareNavigationTabs from "@/components/MedicareNavigationTabs";

interface MedicareShopLayoutProps {
  children: React.ReactNode;
  hasQuotes: boolean;
  cartCount: number;
  selectedFlowCategories: string[];
  activeCategory: string;
  selectedCategory: string;
  productCategories: any[];
  onCategoryToggle: (category: 'medigap' | 'advantage') => void;
  onCategorySelect: (category: string) => void;
  onReset: () => void;
}

export default function MedicareShopLayout({
  children,
  hasQuotes,
  cartCount,
  selectedFlowCategories,
  activeCategory,
  selectedCategory,
  productCategories,
  onCategoryToggle,
  onCategorySelect,
  onReset
}: MedicareShopLayoutProps) {
  const [showMoreCategories, setShowMoreCategories] = useState(false);

  // Determine button text based on number of quote types generated
  const getMoreQuotesButtonText = () => {
    if (selectedFlowCategories.length === 1) {
      return "More Quotes";
    }
    return "+";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Show Shopping Header Only When There Are Quotes */}
      {hasQuotes && (
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            {/* Cart Summary */}
            <div className="flex items-center gap-4">
              {cartCount > 0 && (
                <Badge variant="outline" className="px-3 py-1">
                  {cartCount} plan{cartCount !== 1 ? 's' : ''} selected
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Plan Type Controls - Single Row Layout */}
      {hasQuotes && (
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4">
            {/* Left Side - Reset Button and Plan Toggle */}
            <div className="flex items-center gap-3">
              {/* Reset Button */}
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

              {/* Plan Type Toggle - Moved from center */}
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

              {/* More Quotes Button */}
              <Popover open={showMoreCategories} onOpenChange={setShowMoreCategories}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    title="View more plan options"
                  >
                    {selectedFlowCategories.length === 1 ? (
                      "More Quotes"
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="start">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Additional Plan Options</h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        Select additional plan types to compare more options
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      {productCategories?.map((category) => (
                        <Button
                          key={category.id}
                          variant="ghost"
                          className="w-full justify-start text-left h-auto p-3"
                          onClick={() => {
                            onCategorySelect(category.id);
                            setShowMoreCategories(false);
                          }}
                        >
                          <div className="flex flex-col items-start">
                            <span className="font-medium text-sm">{category.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {category.plans?.length || 0} plans available
                            </span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Center - Empty space for balanced layout */}
            <div className="flex-1"></div>

            {/* Right Side - Navigation Tabs */}
            <div className="flex items-center">
              <MedicareNavigationTabs />
            </div>
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
