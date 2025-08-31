"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Filter, 
  Star, 
  DollarSign, 
  Shield,
  Heart,
  Eye,
  Pill,
  Building2,
  Search,
  MapPin
} from "lucide-react";

interface MedicareAdvantageSidebarProps {
  zipCode?: string;
  plans: any[];
  onFiltersChange: (filters: MedicareAdvantageFilters) => void;
}

export interface MedicareAdvantageFilters {
  searchQuery: string;
  planTypes: string[];
  starRatings: number[];
  premiumRange: [number, number];
  counties: string[];
  benefitCategories: string[];
  hasLowIncomeSubsidy: boolean;
  hasGapCoverage: boolean;
  hasDentalCoverage: boolean;
  hasVisionCoverage: boolean;
  sortBy: 'premium' | 'rating' | 'popularity';
}

const defaultFilters: MedicareAdvantageFilters = {
  searchQuery: '',
  planTypes: [],
  starRatings: [],
  premiumRange: [0, 200],
  counties: [],
  benefitCategories: [],
  hasLowIncomeSubsidy: false,
  hasGapCoverage: false,
  hasDentalCoverage: false,
  hasVisionCoverage: false,
  sortBy: 'rating'
};

export default function MedicareAdvantageSidebar({
  zipCode = '',
  plans,
  onFiltersChange
}: MedicareAdvantageSidebarProps) {
  const [filters, setFilters] = useState<MedicareAdvantageFilters>(defaultFilters);

  // Extract unique values from plans for filter options
  const uniquePlanTypes = [...new Set(plans.map(plan => plan.plan_type).filter(Boolean))];
  const uniqueCounties = [...new Set(plans.map(plan => `${plan.county}, ${plan.state}`).filter(Boolean))];
  const starRatings = [5, 4, 3, 2, 1];

  // Get benefit categories from plans
  const benefitCategories = [
    'Prescription Drugs',
    'Dental',
    'Vision', 
    'Hearing',
    'Wellness Programs',
    'Transportation',
    'Mental Health',
    'Hospital Coverage'
  ];

  const updateFilters = (newFilters: Partial<MedicareAdvantageFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const clearAllFilters = () => {
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  return (
    <div className="space-y-4">
      {/* Active Filters */}
      {(filters.planTypes.length > 0 || filters.starRatings.length > 0 || 
        filters.hasLowIncomeSubsidy || filters.hasGapCoverage || 
        filters.hasDentalCoverage || filters.hasVisionCoverage) && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Active Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {filters.planTypes.map(type => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {type}
                </Badge>
              ))}
              {filters.starRatings.map(rating => (
                <Badge key={rating} variant="secondary" className="text-xs">
                  {rating}+ Stars
                </Badge>
              ))}
              {filters.hasLowIncomeSubsidy && (
                <Badge variant="secondary" className="text-xs">
                  Low Income Subsidy
                </Badge>
              )}
              {filters.hasGapCoverage && (
                <Badge variant="secondary" className="text-xs">
                  Gap Coverage
                </Badge>
              )}
              {filters.hasDentalCoverage && (
                <Badge variant="secondary" className="text-xs">
                  Dental
                </Badge>
              )}
              {filters.hasVisionCoverage && (
                <Badge variant="secondary" className="text-xs">
                  Vision
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter Plans
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Search Plans */}
          <div className="space-y-2">
            <Label>Search Plans</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by plan name or carrier..."
                value={filters.searchQuery}
                onChange={(e) => updateFilters({ searchQuery: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          <Separator />

          {/* Sort By */}
          <div className="space-y-2">
            <Label>Sort By</Label>
            <Select 
              value={filters.sortBy} 
              onValueChange={(value: 'premium' | 'rating' | 'popularity') => 
                updateFilters({ sortBy: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Star Rating</SelectItem>
                <SelectItem value="premium">Monthly Premium</SelectItem>
                <SelectItem value="popularity">Popularity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Monthly Premium Range */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Monthly Premium Range
            </Label>
            <Slider
              value={filters.premiumRange}
              onValueChange={(value) => updateFilters({ premiumRange: value as [number, number] })}
              max={200}
              min={0}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>${filters.premiumRange[0]}</span>
              <span>${filters.premiumRange[1]}+</span>
            </div>
          </div>

          <Separator />

          {/* Star Rating */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Minimum Star Rating
            </Label>
            <div className="space-y-2">
              {starRatings.map(rating => (
                <div key={rating} className="flex items-center space-x-2">
                  <Checkbox
                    id={`rating-${rating}`}
                    checked={filters.starRatings.includes(rating)}
                    onCheckedChange={(checked) => {
                      const newRatings = checked
                        ? [...filters.starRatings, rating]
                        : filters.starRatings.filter(r => r !== rating);
                      updateFilters({ starRatings: newRatings });
                    }}
                  />
                  <label htmlFor={`rating-${rating}`} className="flex items-center gap-1 text-sm cursor-pointer">
                    {[...Array(rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-muted-foreground">& up</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Plan Type */}
          <div className="space-y-3">
            <Label>Plan Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'HMO', label: 'HMO', includes: ['HMO', 'HMOPOS'] },
                { value: 'PPO', label: 'PPO', includes: ['LOCAL PPO', 'REGIONAL PPO'] },
                { value: 'PFFS', label: 'PFFS', includes: ['PFFS'] },
                { value: 'MSA', label: 'MSA', includes: ['MSA'] }
              ].map(planType => (
                <div key={planType.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${planType.value}`}
                    checked={planType.includes.some(type => filters.planTypes.includes(type))}
                    onCheckedChange={(checked) => {
                      let newTypes = [...filters.planTypes];
                      if (checked) {
                        // Add all included types for this group
                        planType.includes.forEach(type => {
                          if (!newTypes.includes(type)) {
                            newTypes.push(type);
                          }
                        });
                      } else {
                        // Remove all included types for this group
                        newTypes = newTypes.filter(type => !planType.includes.includes(type));
                      }
                      updateFilters({ planTypes: newTypes });
                    }}
                  />
                  <label htmlFor={`type-${planType.value}`} className="text-sm cursor-pointer">
                    {planType.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Special Benefits */}
          <div className="space-y-3">
            <Label>Special Benefits</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="low-income"
                  checked={filters.hasLowIncomeSubsidy}
                  onCheckedChange={(checked) => 
                    updateFilters({ hasLowIncomeSubsidy: checked as boolean })
                  }
                />
                <label htmlFor="low-income" className="text-sm cursor-pointer flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  Low Income Subsidy
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gap-coverage"
                  checked={filters.hasGapCoverage}
                  onCheckedChange={(checked) => 
                    updateFilters({ hasGapCoverage: checked as boolean })
                  }
                />
                <label htmlFor="gap-coverage" className="text-sm cursor-pointer flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  Gap Coverage
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="dental-coverage"
                  checked={filters.hasDentalCoverage}
                  onCheckedChange={(checked) => 
                    updateFilters({ hasDentalCoverage: checked as boolean })
                  }
                />
                <label htmlFor="dental-coverage" className="text-sm cursor-pointer flex items-center gap-2">
                  <Heart className="w-3 h-3" />
                  Dental Coverage
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vision-coverage"
                  checked={filters.hasVisionCoverage}
                  onCheckedChange={(checked) => 
                    updateFilters({ hasVisionCoverage: checked as boolean })
                  }
                />
                <label htmlFor="vision-coverage" className="text-sm cursor-pointer flex items-center gap-2">
                  <Eye className="w-3 h-3" />
                  Vision Coverage
                </label>
              </div>
            </div>
          </div>

          {/* County Filter (if multiple counties available) */}
          {uniqueCounties.length > 1 && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Available Counties
                </Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {uniqueCounties.map(county => (
                    <div key={county} className="flex items-center space-x-2">
                      <Checkbox
                        id={`county-${county}`}
                        checked={filters.counties.includes(county)}
                        onCheckedChange={(checked) => {
                          const newCounties = checked
                            ? [...filters.counties, county]
                            : filters.counties.filter(c => c !== county);
                          updateFilters({ counties: newCounties });
                        }}
                      />
                      <label htmlFor={`county-${county}`} className="text-sm cursor-pointer">
                        {county}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      {plans.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{plans.length}</div>
              <div className="text-sm text-muted-foreground">
                Medicare Advantage plans available
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
