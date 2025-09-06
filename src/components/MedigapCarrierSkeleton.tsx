import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface MedigapCarrierSkeletonProps {
  planCount: number;
}

export const MedigapCarrierSkeleton: React.FC<MedigapCarrierSkeletonProps> = ({ planCount }) => {
  return (
    <Card className="w-full animate-in fade-in-0 duration-300">
      <CardContent className="p-6">
        {/* Carrier Header Skeleton */}
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="w-12 h-12 rounded-lg animate-pulse" /> {/* Logo */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-32 animate-pulse" /> {/* Carrier name */}
            <Skeleton className="h-4 w-24 animate-pulse" /> {/* Additional info */}
          </div>
        </div>

        {/* Plans Skeleton */}
        <div className={`space-y-6 md:space-y-0 ${
          planCount === 1 
            ? 'md:grid md:grid-cols-1'
            : planCount === 2
            ? 'md:grid md:grid-cols-2 md:gap-6' 
            : 'md:grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
        } md:gap-4`}>
          {Array.from({ length: planCount }).map((_, index) => (
            <div 
              key={index} 
              className="border rounded-lg p-4 animate-in fade-in-0 duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Plan Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-16 animate-pulse" /> {/* Plan type */}
                  <Skeleton className="h-8 w-20 animate-pulse" /> {/* Price */}
                </div>
                <Skeleton className="h-5 w-5 rounded animate-pulse" /> {/* Checkbox */}
              </div>

              {/* Plan Details */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 animate-pulse" /> {/* Rating class */}
                <Skeleton className="h-4 w-20 animate-pulse" /> {/* Payment mode */}
              </div>

              {/* Action Button */}
              <Skeleton className="h-10 w-full mt-4 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Bottom Action Button */}
        <div className="mt-6">
          <Skeleton className="h-10 w-full animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
};

export default MedigapCarrierSkeleton;
