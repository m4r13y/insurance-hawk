"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

interface MedigapEmptyStateProps {
  onResetFilters: () => void;
}

export default function MedigapEmptyState({ onResetFilters }: MedigapEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
        <MagnifyingGlassIcon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        No Medicare Supplement Plans Found
      </h3>
      <p className="text-muted-foreground mb-4 max-w-md">
        We couldn't find any Medigap plans for your area and criteria. Try adjusting your search or contact us for assistance.
      </p>
      <Button 
        onClick={onResetFilters}
        variant="outline"
      >
        Reset Filters
      </Button>
    </div>
  );
}
