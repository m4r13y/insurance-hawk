"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  MagnifyingGlassIcon,
  MixerHorizontalIcon,
  StarFilledIcon,
  TokensIcon,
  HeartIcon
} from "@radix-ui/react-icons";
import { type QuoteFormData } from "./types";
import PreferredCarriersFilter from "@/components/filters/PreferredCarriersFilter";
import { filterPreferredCarriers } from "@/lib/carrier-system";

interface MedicareShopSidebarProps {
  // Search and filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: 'price' | 'rating' | 'popularity';
  setSortBy: (sortBy: 'price' | 'rating' | 'popularity') => void;
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
  sortBy,
  setSortBy,
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
  
  // Helper to check if we should show medigap plan selection
  const showMedigapPlans = selectedCategory === 'medigap' && realQuotes.length === 0;
  
  return (
    <aside className="lg:col-span-1">
      <div className="space-y-4">
        {/* Search */}
        <div>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search carriers or plans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Combined Filters */}
        <Card className="border">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <MixerHorizontalIcon className="w-4 h-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Information */}
            {hasUserInfo && (
              <>
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">Your Information</h4>
                  <div className="space-y-2 text-sm">
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
                <Separator />
              </>
            )}

            {/* Filter Controls */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Refine Results</h4>
              
              {/* Preferred Carriers Filter */}
              {selectedCategory === 'medigap' && realQuotes.length > 0 && (
                <PreferredCarriersFilter
                  isEnabled={showPreferredOnly}
                  onToggle={setShowPreferredOnly}
                  preferredCount={preferredQuotes.length}
                  totalCount={realQuotes.length}
                  category="medicare-supplement"
                />
              )}
              
              {/* Discounts */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="apply-discounts"
                  checked={applyDiscounts}
                  onCheckedChange={(checked) => setApplyDiscounts(checked as boolean)}
                />
                <label htmlFor="apply-discounts" className="text-sm font-medium">
                  Apply Discounts
                </label>
              </div>
              
              {/* Sort By */}
              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popularity">Popularity</SelectItem>
                    <SelectItem value="price">Price (Low to High)</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Monthly Premium: ${priceRange[0]} - ${priceRange[1]}
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={500}
                  min={0}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>$0</span>
                  <span>$500+</span>
                </div>
              </div>

              {/* Coverage Level */}
              <div>
                <label className="text-sm font-medium mb-2 block">Coverage Level</label>
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
              <div>
                <label className="text-sm font-medium mb-2 block">Payment Mode</label>
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

              {/* Medigap Plan Selection */}
              {showMedigapPlans && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Medigap Plans</label>
                  <div className="space-y-2">
                    {[
                      { id: 'plan-f', label: 'Plan F', color: 'blue' },
                      { id: 'plan-g', label: 'Plan G', color: 'green' },
                      { id: 'plan-n', label: 'Plan N', color: 'purple' }
                    ].map((plan) => (
                      <div key={plan.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={plan.id}
                          checked={selectedQuotePlans.includes(plan.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedQuotePlans([...selectedQuotePlans, plan.id]);
                            } else {
                              setSelectedQuotePlans(selectedQuotePlans.filter(id => id !== plan.id));
                            }
                          }}
                          className={`border-${plan.color}-400 data-[state=checked]:bg-${plan.color}-600 data-[state=checked]:border-${plan.color}-600`}
                        />
                        <label htmlFor={plan.id} className="text-sm">{plan.label}</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Filters */}
              <div>
                <label className="text-sm font-medium mb-2 block">Quick Filters</label>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start text-xs"
                    onClick={() => setSortBy('popularity')}
                  >
                    <StarFilledIcon className="w-3 h-3 mr-2 text-yellow-400" />
                    Most Popular
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start text-xs"
                    onClick={() => setSortBy('price')}
                  >
                    <TokensIcon className="w-3 h-3 mr-2" />
                    Lowest Cost
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start text-xs"
                    onClick={() => {
                      setSelectedCoverageLevel('Comprehensive');
                      setSortBy('rating');
                    }}
                  >
                    <HeartIcon className="w-3 h-3 mr-2" />
                    Best Coverage
                  </Button>
                </div>
              </div>

              {/* Clear Filters */}
              <Button 
                variant="ghost" 
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
