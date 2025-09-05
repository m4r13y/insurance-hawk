"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MagnifyingGlassIcon,
  MixerHorizontalIcon
} from "@radix-ui/react-icons";
import { type QuoteFormData } from "./types";
import PreferredCarriersFilter from "@/components/filters/PreferredCarriersFilter";
import { filterPreferredCarriers } from "@/lib/carrier-system";

interface MedicareShopSidebarProps {
  // Search and filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
  selectedCoverageLevel: string;
  setSelectedCoverageLevel: (level: string) => void;
  
  // Category and plans
  selectedCategory: string;
  selectedQuotePlans: string[];
  setSelectedQuotePlans: (plans: string[]) => void;
  
  // Settings
  applyDiscounts: boolean;
  setApplyDiscounts: (apply: boolean) => void;
  paymentMode: 'monthly' | 'quarterly' | 'annually';
  setPaymentMode: (mode: 'monthly' | 'quarterly' | 'annually') => void;
  
  // Data
  quoteFormData: QuoteFormData;
  realQuotes: any[];
  
  // Actions
  onClearFilters: () => void;
  showPreferredOnly: boolean;
  setShowPreferredOnly: (show: boolean) => void;
}

export default function MedicareShopSidebar({
  searchQuery,
  setSearchQuery,
  priceRange,
  setPriceRange,
  selectedCoverageLevel,
  setSelectedCoverageLevel,
  selectedCategory,
  selectedQuotePlans,
  setSelectedQuotePlans,
  applyDiscounts,
  setApplyDiscounts,
  paymentMode,
  setPaymentMode,
  quoteFormData,
  realQuotes,
  onClearFilters,
  showPreferredOnly,
  setShowPreferredOnly
}: MedicareShopSidebarProps) {
  
  // Calculate preferred carriers counts for display
  const preferredQuotes = useMemo(() => {
    if (selectedCategory === 'medigap' && realQuotes.length > 0) {
      return filterPreferredCarriers(realQuotes, 'medicare-supplement');
    }
    return [];
  }, [realQuotes, selectedCategory]);

  // Helper to check if we should show user info
  const hasUserInfo = quoteFormData && (quoteFormData.age || quoteFormData.zipCode || quoteFormData.gender);
  
  return (
    <aside className="lg:col-span-1">
      <div className="space-y-6">
        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search carriers or plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters Card */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <MixerHorizontalIcon className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-6">
            {/* Preferred Carriers Filter */}
            {selectedCategory === 'medigap' && realQuotes.length > 0 && (
              <div>
                <PreferredCarriersFilter
                  isEnabled={showPreferredOnly}
                  onToggle={setShowPreferredOnly}
                  preferredCount={preferredQuotes.length}
                  totalCount={realQuotes.length}
                  category="medicare-supplement"
                />
              </div>
            )}
            
            {/* Apply Discounts */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Apply Discounts</span>
                <Switch
                  checked={applyDiscounts}
                  onCheckedChange={setApplyDiscounts}
                  aria-label="Toggle discount application"
                />
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Monthly Premium Range</label>
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange[0]}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setPriceRange([Math.max(0, value), priceRange[1]]);
                    }}
                    className="text-sm"
                  />
                  <div className="text-xs text-muted-foreground mt-1 text-center">Min</div>
                </div>
                <span className="text-muted-foreground">-</span>
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange[1]}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 500;
                      setPriceRange([priceRange[0], Math.min(1000, value)]);
                    }}
                    className="text-sm"
                  />
                  <div className="text-xs text-muted-foreground mt-1 text-center">Max</div>
                </div>
              </div>
            </div>

            {/* Coverage Level */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Coverage Level</label>
              <Select value={selectedCoverageLevel} onValueChange={setSelectedCoverageLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Basic">Basic</SelectItem>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                  <SelectItem value="Comprehensive">Comprehensive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Mode */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Payment Mode</label>
              <Select value={paymentMode} onValueChange={setPaymentMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* User Information */}
            {hasUserInfo && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">Your Information</h4>
                <div className="space-y-2 text-sm bg-muted/50 rounded-lg p-3">
                  {quoteFormData.age && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Age:</span>
                      <span className="font-medium">{quoteFormData.age}</span>
                    </div>
                  )}
                  {quoteFormData.gender && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gender:</span>
                      <span className="font-medium">{quoteFormData.gender === 'male' ? 'Male' : 'Female'}</span>
                    </div>
                  )}
                  {quoteFormData.zipCode && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Zip Code:</span>
                      <span className="font-medium">{quoteFormData.zipCode}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Clear Filters */}
            <div className="pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={onClearFilters}
              >
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
