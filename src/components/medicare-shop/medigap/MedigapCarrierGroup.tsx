"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown, 
  ChevronUp, 
  Star,
  Users
} from "lucide-react";
import Image from "next/image";
import { CarrierGroup, MedigapQuote } from "../shared/types";
import MedigapPlanCard from "./MedigapPlanCard";

interface MedigapCarrierGroupProps {
  carrierGroup: CarrierGroup;
  onSelectPlan: (quote: MedigapQuote) => void;
  onCarrierClick?: (carrierName: string) => void;
  selectedPlanId?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export default function MedigapCarrierGroup({
  carrierGroup,
  onSelectPlan,
  onCarrierClick,
  selectedPlanId,
  isExpanded = false,
  onToggleExpand
}: MedigapCarrierGroupProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  
  const expanded = onToggleExpand ? isExpanded : internalExpanded;
  const toggleExpanded = onToggleExpand ? onToggleExpand : () => setInternalExpanded(!internalExpanded);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getLowestPremium = () => {
    return Math.min(...carrierGroup.quotes.map((quote: MedigapQuote) => 
      quote.monthly_premium || quote.rate?.month || 0
    ));
  };

  const getHighestPremium = () => {
    return Math.max(...carrierGroup.quotes.map((quote: MedigapQuote) => 
      quote.monthly_premium || quote.rate?.month || 0
    ));
  };

  const getCarrierLogo = () => {
    const firstQuote = carrierGroup.quotes[0] as MedigapQuote;
    if (!firstQuote) return '/images/carrier-placeholder.svg';
    
    return firstQuote.carrier?.logo_url || 
           firstQuote.company_base?.logo_url || 
           `/carrier-logos/${carrierGroup.carrierName.toLowerCase().replace(/\s+/g, '-')}.png`;
  };

  const getAverageRating = () => {
    const ratingsWithValues = carrierGroup.quotes
      .map((quote: MedigapQuote) => quote.am_best_rating)
      .filter(Boolean);
    
    if (ratingsWithValues.length === 0) return null;
    
    // For AM Best ratings, we'll just return the most common one
    const ratingCounts: { [key: string]: number } = {};
    ratingsWithValues.forEach(rating => {
      ratingCounts[rating!] = (ratingCounts[rating!] || 0) + 1;
    });
    
    return Object.keys(ratingCounts).reduce((a, b) => 
      ratingCounts[a] > ratingCounts[b] ? a : b
    );
  };

  const lowestPremium = getLowestPremium();
  const highestPremium = getHighestPremium();
  const averageRating = getAverageRating();

  return (
    <Card className="transition-all duration-200 hover:shadow-lg">
      <CardContent className="p-6">
        {/* Carrier Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div 
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onCarrierClick?.(carrierGroup.carrierName)}
            >
              <Image
                src={getCarrierLogo()}
                alt={carrierGroup.carrierName}
                width={56}
                height={56}
                className="rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/carrier-placeholder.svg';
                }}
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {carrierGroup.carrierName}
              </h3>
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {carrierGroup.quotes.length} plan{carrierGroup.quotes.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {averageRating && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{averageRating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">
              {lowestPremium === highestPremium 
                ? formatCurrency(lowestPremium)
                : `${formatCurrency(lowestPremium)} - ${formatCurrency(highestPremium)}`
              }
            </div>
            <div className="text-sm text-gray-600">per month</div>
            <Badge variant="secondary" className="mt-2">
              {carrierGroup.quotes.length} option{carrierGroup.quotes.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-900">Starting at</div>
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(lowestPremium)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-900">Average</div>
            <div className="text-lg font-bold text-blue-600">
              {formatCurrency(carrierGroup.averagePremium)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-900">Plans</div>
            <div className="text-lg font-bold text-gray-900">
              {carrierGroup.quotes.length}
            </div>
          </div>
        </div>

        {/* Expand/Collapse Button */}
        <div className="pt-4 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={toggleExpanded}
            className="w-full"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Hide Plans
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                View All Plans
              </>
            )}
          </Button>
        </div>

        {/* Expanded Plans */}
        {expanded && (
          <div className="mt-6 space-y-4">
            {carrierGroup.quotes.map((quote: MedigapQuote, index) => (
              <MedigapPlanCard
                key={quote.id || index}
                quote={quote}
                onSelectPlan={onSelectPlan}
                onCarrierClick={onCarrierClick}
                isSelected={selectedPlanId === quote.id}
                showCarrierLogo={false} // Don't show logo since it's already shown in group header
                compact={true}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
