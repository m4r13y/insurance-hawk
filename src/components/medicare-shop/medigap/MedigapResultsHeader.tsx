"use client";

import React from "react";

interface MedigapResultsHeaderProps {
  selectedCategory: string;
  realQuotes: any[];
  paginationInfo: {
    startItem: number;
    endItem: number;
    totalItems: number;
  };
}

export default function MedigapResultsHeader({
  selectedCategory,
  realQuotes,
  paginationInfo
}: MedigapResultsHeaderProps) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">
        {selectedCategory === 'medigap' && realQuotes.length > 0 ? (
          <>
            Showing {paginationInfo.startItem}-{paginationInfo.endItem} of {paginationInfo.totalItems} carrier{paginationInfo.totalItems !== 1 ? 's' : ''}
            <span className="ml-2 text-xs">
              ({realQuotes.length} quote{realQuotes.length !== 1 ? 's' : ''} loaded)
            </span>
          </>
        ) : (
          <>
            Showing {paginationInfo.startItem}-{paginationInfo.endItem} of {paginationInfo.totalItems} plan{paginationInfo.totalItems !== 1 ? 's' : ''}
          </>
        )}
      </p>
    </div>
  );
}
