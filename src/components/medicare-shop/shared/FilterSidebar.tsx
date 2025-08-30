"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Search, X, Filter } from "lucide-react";
import { FilterState } from "./types";

interface FilterSidebarProps {
  filterState: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  additionalFilters?: React.ReactNode;
  planTypeFilters?: {
    label: string;
    options: Array<{ id: string; label: string }>;
    selected: string[];
    onChange: (selected: string[]) => void;
  };
  priceRange?: [number, number];
  maxPrice?: number;
}

export default function FilterSidebar({
  filterState,
  onFilterChange,
  additionalFilters,
  planTypeFilters,
  priceRange = [0, 500],
  maxPrice = 500
}: FilterSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSearchChange = (value: string) => {
    onFilterChange({ searchQuery: value });
  };

  const handleSortChange = (value: string) => {
    onFilterChange({ sortBy: value as 'price' | 'rating' | 'popularity' });
  };

  const handlePriceRangeChange = (value: number[]) => {
    onFilterChange({ priceRange: [value[0], value[1]] });
  };

  const handleCoverageLevelChange = (value: string) => {
    onFilterChange({ selectedCoverageLevel: value });
  };

  const handleDiscountToggle = (checked: boolean) => {
    onFilterChange({ applyDiscounts: checked });
  };

  const handlePaymentModeChange = (value: string) => {
    onFilterChange({ paymentMode: value as 'monthly' | 'quarterly' | 'annually' });
  };

  const clearFilters = () => {
    onFilterChange({
      searchQuery: '',
      sortBy: 'popularity',
      priceRange: [0, maxPrice],
      selectedCoverageLevel: 'all',
      applyDiscounts: false,
      paymentMode: 'monthly'
    });
    if (planTypeFilters) {
      planTypeFilters.onChange([]);
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filterState.searchQuery) count++;
    if (filterState.sortBy !== 'popularity') count++;
    if (filterState.priceRange[0] !== 0 || filterState.priceRange[1] !== maxPrice) count++;
    if (filterState.selectedCoverageLevel !== 'all') count++;
    if (filterState.applyDiscounts) count++;
    if (filterState.paymentMode !== 'monthly') count++;
    if (planTypeFilters && planTypeFilters.selected.length > 0) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card className="h-fit sticky top-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Hide" : "Show"}
          </Button>
        </div>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full">
            <X className="w-4 h-4 mr-2" />
            Clear All Filters
          </Button>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <Label>Search Plans</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, features..."
                value={filterState.searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="space-y-2">
            <Label>Sort By</Label>
            <Select value={filterState.sortBy} onValueChange={handleSortChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Most Popular</SelectItem>
                <SelectItem value="price">Lowest Price</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Plan Type Filters */}
          {planTypeFilters && (
            <div className="space-y-2">
              <Label>{planTypeFilters.label}</Label>
              <div className="space-y-2">
                {planTypeFilters.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={planTypeFilters.selected.includes(option.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          planTypeFilters.onChange([...planTypeFilters.selected, option.id]);
                        } else {
                          planTypeFilters.onChange(
                            planTypeFilters.selected.filter(id => id !== option.id)
                          );
                        }
                      }}
                    />
                    <Label htmlFor={option.id} className="text-sm font-normal">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price Range */}
          <div className="space-y-2">
            <Label>
              Monthly Premium: ${filterState.priceRange[0]} - ${filterState.priceRange[1]}
            </Label>
            <Slider
              value={filterState.priceRange}
              onValueChange={handlePriceRangeChange}
              max={maxPrice}
              min={0}
              step={10}
              className="w-full"
            />
          </div>

          {/* Coverage Level */}
          <div className="space-y-2">
            <Label>Coverage Level</Label>
            <Select value={filterState.selectedCoverageLevel} onValueChange={handleCoverageLevelChange}>
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
          <div className="space-y-2">
            <Label>Payment Frequency</Label>
            <Select value={filterState.paymentMode} onValueChange={handlePaymentModeChange}>
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

          {/* Apply Discounts Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="discounts"
              checked={filterState.applyDiscounts}
              onCheckedChange={handleDiscountToggle}
            />
            <Label htmlFor="discounts">Apply Available Discounts</Label>
          </div>

          {/* Additional Filters */}
          {additionalFilters}
        </CardContent>
      )}
    </Card>
  );
}
