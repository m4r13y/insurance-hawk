"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ChevronLeft, 
  ChevronRight, 
  Grid, 
  List,
  AlertCircle
} from "lucide-react";
import { PaginationInfo } from "./types";

interface PlanResultsContainerProps {
  isLoading: boolean;
  error: string | null;
  paginationInfo: PaginationInfo;
  onPageChange: (page: number) => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  children: React.ReactNode;
  emptyStateMessage?: string;
  loadingMessage?: string;
}

export default function PlanResultsContainer({
  isLoading,
  error,
  paginationInfo,
  onPageChange,
  viewMode = 'list',
  onViewModeChange,
  children,
  emptyStateMessage = "No plans found matching your criteria.",
  loadingMessage = "Loading your personalized quotes..."
}: PlanResultsContainerProps) {
  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const { currentPage, totalPages } = paginationInfo;
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">{loadingMessage}</p>
          </div>
        </div>
        
        {/* Loading Skeletons */}
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <Skeleton className="h-6 w-20 ml-auto" />
                    <Skeleton className="h-8 w-24 ml-auto" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Unable to Load Plans
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Empty State
  if (paginationInfo.totalItems === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Grid className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            No Plans Found
          </h3>
          <p className="text-gray-600">{emptyStateMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-gray-600">
            Showing {paginationInfo.startItem}-{paginationInfo.endItem} of{" "}
            {paginationInfo.totalItems} {paginationInfo.displayType === 'grouped' ? 'carriers' : 'plans'}
          </p>
        </div>
        
        {onViewModeChange && (
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Results Content */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
        {children}
      </div>

      {/* Pagination */}
      {paginationInfo.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(paginationInfo.currentPage - 1)}
            disabled={!paginationInfo.hasPrevPage}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex gap-1">
            {getPageNumbers().map((pageNum) => (
              <Button
                key={pageNum}
                variant={pageNum === paginationInfo.currentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className="w-10"
              >
                {pageNum}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(paginationInfo.currentPage + 1)}
            disabled={!paginationInfo.hasNextPage}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
