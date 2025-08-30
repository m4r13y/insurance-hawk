"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

interface PaginationControlsProps {
  paginationInfo: PaginationInfo;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
}

export default function PaginationControls({
  paginationInfo,
  setCurrentPage
}: PaginationControlsProps) {
  if (paginationInfo.totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t">
      <div className="text-sm text-muted-foreground">
        Page {paginationInfo.currentPage} of {paginationInfo.totalPages}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={!paginationInfo.hasPrevPage}
        >
          Previous
        </Button>
        
        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, paginationInfo.totalPages) }, (_, i) => {
            const pageNum = Math.max(1, Math.min(
              paginationInfo.totalPages - 4,
              paginationInfo.currentPage - 2
            )) + i;
            
            if (pageNum <= paginationInfo.totalPages) {
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === paginationInfo.currentPage ? "default" : "outline"}
                  size="sm"
                  className="w-10 h-8"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            }
            return null;
          })}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(paginationInfo.totalPages, prev + 1))}
          disabled={!paginationInfo.hasNextPage}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
