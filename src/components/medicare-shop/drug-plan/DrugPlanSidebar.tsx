"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  DollarSign, 
  Pill, 
  Star, 
  RefreshCw,
  Info,
  Shield
} from 'lucide-react';

interface DrugPlanSidebarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  selectedPlanTypes: string[];
  setSelectedPlanTypes: (types: string[]) => void;
  selectedCarriers: string[];
  setSelectedCarriers: (carriers: string[]) => void;
  minRating: number;
  setMinRating: (rating: number) => void;
  includeSpecialNeeds: boolean;
  setIncludeSpecialNeeds: (include: boolean) => void;
  maxDeductible: number;
  setMaxDeductible: (deductible: number) => void;
  availableCarriers?: string[];
  onResetFilters: () => void;
}

const planTypes = [
  { id: 'pdp', label: 'Part D Only', description: 'Standalone prescription drug coverage' },
  { id: 'mapd', label: 'Medicare Advantage + Part D', description: 'Combined medical and drug coverage' },
];

const starRatings = [
  { value: 0, label: 'Any Rating' },
  { value: 3, label: '3+ Stars' },
  { value: 4, label: '4+ Stars' },
  { value: 5, label: '5 Stars Only' },
];

export default function DrugPlanSidebar({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  priceRange,
  setPriceRange,
  selectedPlanTypes,
  setSelectedPlanTypes,
  selectedCarriers,
  setSelectedCarriers,
  minRating,
  setMinRating,
  includeSpecialNeeds,
  setIncludeSpecialNeeds,
  maxDeductible,
  setMaxDeductible,
  availableCarriers = [],
  onResetFilters,
}: DrugPlanSidebarProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handlePlanTypeToggle = (planType: string) => {
    setSelectedPlanTypes(
      selectedPlanTypes.includes(planType)
        ? selectedPlanTypes.filter(type => type !== planType)
        : [...selectedPlanTypes, planType]
    );
  };

  const handleCarrierToggle = (carrier: string) => {
    setSelectedCarriers(
      selectedCarriers.includes(carrier)
        ? selectedCarriers.filter(c => c !== carrier)
        : [...selectedCarriers, carrier]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const activeFiltersCount = 
    selectedPlanTypes.length + 
    selectedCarriers.length + 
    (minRating > 0 ? 1 : 0) + 
    (includeSpecialNeeds ? 1 : 0) +
    (maxDeductible < 1000 ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 500 ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <Search className="h-4 w-4 mr-2" />
            Search Plans
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search plans or carriers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sort Options */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Sort By</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Choose sorting" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="premium">Monthly Premium (Low to High)</SelectItem>
              <SelectItem value="premium-desc">Monthly Premium (High to Low)</SelectItem>
              <SelectItem value="deductible">Annual Deductible (Low to High)</SelectItem>
              <SelectItem value="deductible-desc">Annual Deductible (High to Low)</SelectItem>
              <SelectItem value="rating">Star Rating (High to Low)</SelectItem>
              <SelectItem value="name">Plan Name (A to Z)</SelectItem>
              <SelectItem value="carrier">Carrier Name (A to Z)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <DollarSign className="h-4 w-4 mr-2" />
            Monthly Premium Range
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              max={500}
              min={0}
              step={10}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>{formatCurrency(priceRange[0])}</span>
            <span>{formatCurrency(priceRange[1])}</span>
          </div>
        </CardContent>
      </Card>

      {/* Plan Types */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <Pill className="h-4 w-4 mr-2" />
            Plan Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {planTypes.map((type) => (
            <div key={type.id} className="flex items-start space-x-2">
              <Checkbox
                id={type.id}
                checked={selectedPlanTypes.includes(type.id)}
                onCheckedChange={() => handlePlanTypeToggle(type.id)}
              />
              <div className="flex-1">
                <Label 
                  htmlFor={type.id} 
                  className="text-sm font-medium cursor-pointer"
                >
                  {type.label}
                </Label>
                <p className="text-xs text-gray-600 mt-1">{type.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Star Rating */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <Star className="h-4 w-4 mr-2" />
            Minimum Star Rating
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={minRating.toString()} onValueChange={(value) => setMinRating(parseInt(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Any rating" />
            </SelectTrigger>
            <SelectContent>
              {starRatings.map((rating) => (
                <SelectItem key={rating.value} value={rating.value.toString()}>
                  <div className="flex items-center">
                    {rating.value > 0 && (
                      <div className="flex items-center mr-2">
                        {[...Array(rating.value)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    )}
                    {rating.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Advanced Filters Toggle */}
      <Button
        variant="outline"
        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
        className="w-full"
      >
        <Filter className="h-4 w-4 mr-2" />
        Advanced Filters
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="ml-2">
            {activeFiltersCount}
          </Badge>
        )}
      </Button>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <>
          {/* Carriers */}
          {availableCarriers.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Insurance Carriers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-48 overflow-y-auto">
                {availableCarriers.map((carrier) => (
                  <div key={carrier} className="flex items-center space-x-2">
                    <Checkbox
                      id={carrier}
                      checked={selectedCarriers.includes(carrier)}
                      onCheckedChange={() => handleCarrierToggle(carrier)}
                    />
                    <Label 
                      htmlFor={carrier} 
                      className="text-sm cursor-pointer flex-1"
                    >
                      {carrier}
                    </Label>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Special Needs Plans */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Info className="h-4 w-4 mr-2" />
                Special Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="special-needs"
                  checked={includeSpecialNeeds}
                  onCheckedChange={setIncludeSpecialNeeds}
                />
                <div className="flex-1">
                  <Label 
                    htmlFor="special-needs" 
                    className="text-sm font-medium cursor-pointer"
                  >
                    Include Special Needs Plans
                  </Label>
                  <p className="text-xs text-gray-600 mt-1">
                    Plans designed for people with chronic conditions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Max Deductible */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Maximum Annual Deductible
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="px-2">
                <Slider
                  value={[maxDeductible]}
                  onValueChange={(value) => setMaxDeductible(value[0])}
                  max={1000}
                  min={0}
                  step={50}
                  className="w-full"
                />
              </div>
              <div className="text-center text-sm text-gray-600">
                Up to {formatCurrency(maxDeductible)}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Reset Filters */}
      <Button
        variant="outline"
        onClick={onResetFilters}
        className="w-full"
        disabled={activeFiltersCount === 0}
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Reset All Filters
      </Button>

      {/* Filter Summary */}
      {activeFiltersCount > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {selectedPlanTypes.map(type => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {planTypes.find(p => p.id === type)?.label}
                </Badge>
              ))}
              {selectedCarriers.map(carrier => (
                <Badge key={carrier} variant="secondary" className="text-xs">
                  {carrier}
                </Badge>
              ))}
              {minRating > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {minRating}+ Stars
                </Badge>
              )}
              {includeSpecialNeeds && (
                <Badge variant="secondary" className="text-xs">
                  Special Needs
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
