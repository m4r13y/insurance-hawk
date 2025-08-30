"use client";

import React from "react";
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
  StarIcon,
  StarFilledIcon,
  TokensIcon,
  HeartIcon
} from "@radix-ui/react-icons";
import { type QuoteFormData } from "./types";
import { getCarrierByNaicCode } from "@/lib/naic-carriers";

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
  
  // Category selection
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
  
  // Medigap plans
  selectedMedigapPlans: string[];
  setSelectedMedigapPlans: (plans: string[]) => void;
  
  // Discounts and payment
  applyDiscounts: boolean;
  setApplyDiscounts: (apply: boolean) => void;
  paymentMode: 'monthly' | 'quarterly' | 'annually';
  setPaymentMode: (mode: 'monthly' | 'quarterly' | 'annually') => void;
  
  // User data
  quoteFormData: QuoteFormData;
  
  // Quotes data
  realQuotes: any[];
  selectedQuotePlans: string[];
  
  // Clear filters function
  onClearFilters: () => void;
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
  onCategorySelect,
  selectedMedigapPlans,
  setSelectedMedigapPlans,
  applyDiscounts,
  setApplyDiscounts,
  paymentMode,
  setPaymentMode,
  quoteFormData,
  realQuotes,
  selectedQuotePlans,
  onClearFilters
}: MedicareShopSidebarProps) {
  
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
            {/* User Details - moved from top right */}
            {quoteFormData && (quoteFormData.age || quoteFormData.zipCode || quoteFormData.gender) && (
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
            )}

            <Separator />

            {/* Filter Controls */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Refine Results</h4>
              
              {/* Apply Discounts Toggle */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Discounts</label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="apply-discounts"
                    checked={applyDiscounts}
                    onCheckedChange={(checked) => setApplyDiscounts(checked as boolean)}
                  />
                  <label htmlFor="apply-discounts" className="text-sm">
                    Apply Discounts
                  </label>
                </div>
              </div>
              
              {/* Sort By */}
              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-full">
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
                  <SelectTrigger className="w-full">
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

              {/* Medigap Plan Selection - Only show for Medigap category */}
              {selectedCategory === 'medigap' && realQuotes.length === 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Medigap Plans
                  </label>
                  <div className="space-y-2">
                    {/* Mock data: use selectedMedigapPlans state */}
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="plan-f"
                        checked={selectedMedigapPlans.includes('plan-f')}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedMedigapPlans([...selectedMedigapPlans, 'plan-f']);
                          } else {
                            setSelectedMedigapPlans(selectedMedigapPlans.filter(id => id !== 'plan-f'));
                          }
                        }}
                        className="border-blue-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <label htmlFor="plan-f" className="text-sm">Plan F</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="plan-g"
                        checked={selectedMedigapPlans.includes('plan-g')}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedMedigapPlans([...selectedMedigapPlans, 'plan-g']);
                          } else {
                            setSelectedMedigapPlans(selectedMedigapPlans.filter(id => id !== 'plan-g'));
                          }
                        }}
                        className="border-green-400 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                      />
                      <label htmlFor="plan-g" className="text-sm">Plan G</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="plan-n"
                        checked={selectedMedigapPlans.includes('plan-n')}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedMedigapPlans([...selectedMedigapPlans, 'plan-n']);
                          } else {
                            setSelectedMedigapPlans(selectedMedigapPlans.filter(id => id !== 'plan-n'));
                          }
                        }}
                        className="border-purple-400 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                      />
                      <label htmlFor="plan-n" className="text-sm">Plan N</label>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Filter Buttons */}
              <div>
                <label className="text-sm font-medium mb-2 block">Quick Filters</label>
                <div className="grid grid-cols-1 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="justify-start text-xs"
                    onClick={() => setSortBy('popularity')}
                  >
                    <StarIcon className="w-3 h-3 mr-2" />
                    Most Popular
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="justify-start text-xs"
                    onClick={() => setSortBy('price')}
                  >
                    <TokensIcon className="w-3 h-3 mr-2" />
                    Lowest Cost
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="justify-start text-xs"
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

              {/* Payment Mode */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Mode</label>
                <Select value={paymentMode} onValueChange={(value: 'monthly' | 'quarterly' | 'annually') => setPaymentMode(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs"
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
