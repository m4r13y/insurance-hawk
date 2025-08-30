"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  ExternalLink, 
  CheckCircle,
  XCircle,
  Minus
} from "lucide-react";
import Image from "next/image";
import { MedigapQuote } from "../shared/types";

interface MedigapPlanCardProps {
  quote: MedigapQuote;
  onSelectPlan: (quote: MedigapQuote) => void;
  onCarrierClick?: (carrierName: string) => void;
  isSelected?: boolean;
  showCarrierLogo?: boolean;
  compact?: boolean;
}

export default function MedigapPlanCard({ 
  quote, 
  onSelectPlan, 
  onCarrierClick,
  isSelected = false,
  showCarrierLogo = true,
  compact = false
}: MedigapPlanCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getBadgeColor = (rating?: string) => {
    if (!rating) return 'bg-gray-100 text-gray-800';
    const ratingUpper = rating.toUpperCase();
    if (ratingUpper.includes('A')) return 'bg-green-100 text-green-800';
    if (ratingUpper.includes('B')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getCarrierName = () => {
    return quote.carrier?.name || quote.company || quote.company_base?.name || 'Unknown Carrier';
  };

  const getPlanName = () => {
    return quote.plan_name || quote.plan || 'Medigap Plan';
  };

  const getPremium = () => {
    return quote.monthly_premium || quote.rate?.month || 0;
  };

  const getCarrierLogo = () => {
    const carrierName = getCarrierName();
    return quote.carrier?.logo_url || 
           quote.company_base?.logo_url || 
           `/carrier-logos/${carrierName.toLowerCase().replace(/\s+/g, '-')}.png`;
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-lg ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className={compact ? "p-4" : "p-6"}>
        <div className="flex flex-col space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {showCarrierLogo && (
                <div 
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => onCarrierClick?.(getCarrierName())}
                >
                  <Image
                    src={getCarrierLogo()}
                    alt={getCarrierName()}
                    width={48}
                    height={48}
                    className="rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/carrier-placeholder.svg';
                    }}
                  />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {getPlanName()}
                </h3>
                <p className="text-sm text-gray-600">{getCarrierName()}</p>
                {quote.am_best_rating && (
                  <div className="flex items-center space-x-1 mt-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{quote.am_best_rating}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(getPremium())}
              </div>
              <div className="text-sm text-gray-600">
                per month
              </div>
              {quote.am_best_rating && (
                <Badge className={`mt-2 ${getBadgeColor(quote.am_best_rating)}`}>
                  {quote.am_best_rating}
                </Badge>
              )}
            </div>
          </div>

          {/* Plan Type and NAIC */}
          {!compact && (quote.plan_type || quote.naic) && (
            <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-100">
              {quote.plan_type && (
                <div>
                  <span className="text-sm font-medium text-gray-900">Plan Type</span>
                  <p className="text-sm text-gray-600">{quote.plan_type}</p>
                </div>
              )}
              {quote.naic && (
                <div>
                  <span className="text-sm font-medium text-gray-900">NAIC Code</span>
                  <p className="text-sm text-gray-600">{quote.naic}</p>
                </div>
              )}
            </div>
          )}

          {/* Discounts */}
          {!compact && quote.discounts && quote.discounts.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900">Available Discounts</h4>
              <ul className="space-y-1">
                {quote.discounts.slice(0, 3).map((discount, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{discount.name}</span>
                    <span className="text-sm font-medium text-green-600">
                      -{formatCurrency(discount.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Fees */}
          {!compact && quote.fees && quote.fees.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900">Additional Fees</h4>
              <ul className="space-y-1">
                {quote.fees.map((fee, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{fee.name}</span>
                    <span className="text-sm text-gray-600">
                      {formatCurrency(fee.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button 
              onClick={() => onSelectPlan(quote)}
              className="flex-1"
              variant={isSelected ? "default" : "outline"}
            >
              {isSelected ? "Selected" : "Select Plan"}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(`#plan-details-${quote.id}`, '_blank')}
              className="px-3"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>

          {/* Additional Info */}
          {!compact && (
            <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-2">
              {quote.rate_type && <span>Rate Type: {quote.rate_type}</span>}
              {quote.effective_date && (
                <span>Effective: {new Date(quote.effective_date).toLocaleDateString()}</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
