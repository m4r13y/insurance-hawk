import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface PlanCardsSkeletonProps {
  count?: number;
  title?: string;
}

export const PlanCardsSkeleton: React.FC<PlanCardsSkeletonProps> = ({ 
  count = 6,
  title = "Loading Plans"
}) => {
  return (
    <div className="space-y-6">
      {/* Loading title */}
      <div className="text-center">
        <Skeleton className="h-6 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>

      {/* Plan cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-6">
              {/* Logo/Icon area */}
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-24 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>

              {/* Plan name */}
              <Skeleton className="h-6 w-40 mb-3" />

              {/* Plan details */}
              <div className="space-y-2 mb-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/5" />
              </div>

              {/* Price area */}
              <div className="flex items-baseline gap-2 mb-4">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>

              {/* Features list */}
              <div className="space-y-2 mb-6">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-3 w-3/5" />
              </div>

              {/* Action button */}
              <Skeleton className="h-10 w-full rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PlanCardsSkeleton;
