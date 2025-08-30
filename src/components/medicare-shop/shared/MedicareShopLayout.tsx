"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { RotateCcw } from "lucide-react";

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

      {/* Plan Type Controls - Under Shop/Learn/Resources Navigation */}
      {hasQuotes && (
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg border">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Reset Button - Moved to left */}
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
            
            {/* Plan Categories Dropdown - Moved to right */}
            <div className="min-w-[200px]">
              <Select value={selectedCategory} onValueChange={onCategorySelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="More Plan Options" />
                </SelectTrigger>
                <SelectContent>
                  {productCategories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name} ({category.plans?.length || 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
