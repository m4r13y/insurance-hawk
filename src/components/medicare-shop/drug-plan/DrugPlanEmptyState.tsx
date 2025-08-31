"use client"

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pill, RefreshCw, Phone, Search } from 'lucide-react';

interface DrugPlanEmptyStateProps {
  type?: 'no-results' | 'no-quotes' | 'error';
  searchQuery?: string;
  onResetFilters?: () => void;
  onTryAgain?: () => void;
  onContactAgent?: () => void;
}

export default function DrugPlanEmptyState({
  type = 'no-results',
  searchQuery = '',
  onResetFilters,
  onTryAgain,
  onContactAgent,
}: DrugPlanEmptyStateProps) {
  const getContent = () => {
    switch (type) {
      case 'no-results':
        return {
          icon: <Search className="h-16 w-16 text-gray-400" />,
          title: 'No Drug Plans Found',
          description: searchQuery 
            ? `No drug plans match your search for "${searchQuery}". Try adjusting your filters or search terms.`
            : 'No drug plans match your current filters. Try adjusting your criteria to see more options.',
          actions: (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {onResetFilters && (
                <Button variant="outline" onClick={onResetFilters}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Filters
                </Button>
              )}
              {onContactAgent && (
                <Button onClick={onContactAgent}>
                  <Phone className="h-4 w-4 mr-2" />
                  Speak with Agent
                </Button>
              )}
            </div>
          ),
        };
      
      case 'no-quotes':
        return {
          icon: <Pill className="h-16 w-16 text-gray-400" />,
          title: 'No Drug Plan Quotes Available',
          description: 'We weren\'t able to find any drug plan quotes for your area at this time. This could be due to limited plan availability in your zip code.',
          actions: (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {onTryAgain && (
                <Button variant="outline" onClick={onTryAgain}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              )}
              {onContactAgent && (
                <Button onClick={onContactAgent}>
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Agent
                </Button>
              )}
            </div>
          ),
        };
      
      case 'error':
        return {
          icon: <Pill className="h-16 w-16 text-red-400" />,
          title: 'Unable to Load Drug Plans',
          description: 'We encountered an error while loading drug plan options. Please try again or contact our support team for assistance.',
          actions: (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {onTryAgain && (
                <Button variant="outline" onClick={onTryAgain}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              )}
              {onContactAgent && (
                <Button onClick={onContactAgent}>
                  <Phone className="h-4 w-4 mr-2" />
                  Get Help
                </Button>
              )}
            </div>
          ),
        };
      
      default:
        return {
          icon: <Pill className="h-16 w-16 text-gray-400" />,
          title: 'No Drug Plans Available',
          description: 'No drug plans are currently available.',
          actions: null,
        };
    }
  };

  const content = getContent();

  return (
    <Card className="mx-auto max-w-md">
      <CardContent className="flex flex-col items-center text-center py-12 px-6">
        <div className="mb-6">
          {content.icon}
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          {content.title}
        </h3>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          {content.description}
        </p>
        
        {content.actions}
        
        {/* Additional helpful information */}
        <div className="mt-8 pt-6 border-t border-gray-200 w-full">
          <p className="text-sm text-gray-500 mb-3">
            Need help finding the right drug plan?
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center justify-center">
              <Phone className="h-4 w-4 mr-2" />
              <span>Call us at (555) 123-4567</span>
            </div>
            <p>Our Medicare specialists are here to help</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
