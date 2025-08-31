"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MagnifyingGlassIcon, MixerHorizontalIcon, TriangleUpIcon, StarIcon, PersonIcon, ExternalLinkIcon } from '@radix-ui/react-icons';
import { PlanCardsSkeleton } from "@/components/medicare-shop/shared";

interface DrugPlanQuote {
  id: string;
  planName: string;
  carrierName: string;
  monthlyPremium: number;
  annualDeductible: number;
  coverageGap: string;
  formularyTier: string;
  pharmacyNetwork: string[];
  rating: number;
  benefits: string[];
  limitations: string[];
  carrierLogo?: string;
  planType: 'pdp' | 'mapd';
  specialNeeds?: boolean;
}

interface DrugPlanShopContentProps {
  quotes: DrugPlanQuote[];
  loading?: boolean;
  error?: string | null;
  onQuoteSelect?: (quote: DrugPlanQuote) => void;
  onGetQuote?: (quote: DrugPlanQuote) => void;
}

export default function DrugPlanShopContent({ 
  quotes = [], 
  loading = false, 
  error = null,
  onQuoteSelect,
  onGetQuote 
}: DrugPlanShopContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('premium');
  const [filterBy, setFilterBy] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const quotesPerPage = 10;

  // Filter and sort quotes
  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.planName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         quote.carrierName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterBy === 'all') return matchesSearch;
    if (filterBy === 'pdp') return matchesSearch && quote.planType === 'pdp';
    if (filterBy === 'mapd') return matchesSearch && quote.planType === 'mapd';
    if (filterBy === 'special-needs') return matchesSearch && quote.specialNeeds;
    
    return matchesSearch;
  });

  const sortedQuotes = [...filteredQuotes].sort((a, b) => {
    switch (sortBy) {
      case 'premium':
        return a.monthlyPremium - b.monthlyPremium;
      case 'deductible':
        return a.annualDeductible - b.annualDeductible;
      case 'rating':
        return b.rating - a.rating;
      case 'name':
        return a.planName.localeCompare(b.planName);
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedQuotes.length / quotesPerPage);
  const startIndex = (currentPage - 1) * quotesPerPage;
  const paginatedQuotes = sortedQuotes.slice(startIndex, startIndex + quotesPerPage);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPlanTypeLabel = (type: string) => {
    switch (type) {
      case 'pdp':
        return 'Part D Plan';
      case 'mapd':
        return 'Medicare Advantage + Part D';
      default:
        return type;
    }
  };

  if (loading) {
    return <PlanCardsSkeleton count={4} title="Prescription Drug Plans" />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <PersonIcon className="h-12 w-12 mx-auto mb-2" />
          <p className="text-lg font-semibold">Error Loading Quotes</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="text-center py-8">
        <span className="h-12 w-12 mx-auto mb-4 text-gray-400 flex items-center justify-center text-3xl">💊</span>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Drug Plans Found</h3>
        <p className="text-gray-600">No drug plan quotes are available at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results */}
      <div className="space-y-4">
        {paginatedQuotes.map((quote) => (
          <Card key={quote.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Plan Info */}
                <div className="lg:col-span-2">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {quote.planName}
                      </h3>
                      <p className="text-gray-600 text-sm">{quote.carrierName}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">
                          {getPlanTypeLabel(quote.planType)}
                        </Badge>
                        {quote.specialNeeds && (
                          <Badge variant="secondary">Special Needs</Badge>
                        )}
                      </div>
                    </div>
                    {quote.rating && (
                      <div className="flex items-center">
                        <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm font-medium">{quote.rating}</span>
                      </div>
                    )}
                  </div>

                  {/* Key Benefits */}
                  {quote.benefits && quote.benefits.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-700">Key Benefits:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {quote.benefits.slice(0, 3).map((benefit, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Pricing */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Monthly Premium</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(quote.monthlyPremium)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Annual Deductible</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(quote.annualDeductible)}
                    </p>
                  </div>
                  {quote.coverageGap && (
                    <div>
                      <p className="text-sm text-gray-600">Coverage Gap</p>
                      <p className="text-sm">{quote.coverageGap}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={() => onGetQuote?.(quote)}
                    className="w-full"
                  >
                    <span className="h-4 w-4 mr-2">📞</span>
                    Get Quote
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => onQuoteSelect?.(quote)}
                    className="w-full"
                  >
                    <ExternalLinkIcon className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
