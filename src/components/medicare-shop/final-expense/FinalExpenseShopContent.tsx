"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarIcon, CalendarIcon } from "@radix-ui/react-icons";
import { PlanCardsSkeleton } from "@/components/medicare-shop/shared";

interface FinalExpenseQuote {
  id?: string;
  monthly_rate: number;
  annual_rate: number;
  face_value: number;
  face_amount_min: number;
  face_amount_max: number;
  carrier?: { 
    name: string;
    full_name?: string;
    logo_url?: string | null;
  } | null;
  plan_name?: string;
  company_name?: string;
  company_base?: { 
    name?: string;
    full_name?: string; 
    logo_url?: string | null;
  };
  benefit_name?: string;
  naic?: string;
  effective_date?: string;
  expires_date?: string;
  underwriting_type?: string;
  am_best_rating?: string;
  monthly_fee?: number;
  annual_fee?: number;
  is_down_payment_plan?: boolean;
  has_pdf_app?: boolean;
  e_app_link?: string;
  key?: string;
}

interface FinalExpenseShopContentProps {
  quotes: FinalExpenseQuote[];
  isLoading?: boolean;
  onSelectPlan?: (quote: FinalExpenseQuote) => void;
}

export default function FinalExpenseShopContent({ 
  quotes, 
  isLoading = false, 
  onSelectPlan 
}: FinalExpenseShopContentProps) {
  if (isLoading) {
    return <PlanCardsSkeleton count={5} title="Final Expense Life Insurance" />;
  }

  if (!quotes || quotes.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="mx-auto h-12 w-12 text-gray-400 mb-4 flex items-center justify-center text-3xl">☂️</span>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Final Expense Plans Found</h3>
        <p className="text-gray-500">
          We couldn't find any final expense life insurance plans for your area. Please try adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Final Expense Life Insurance Plans ({quotes.length})
        </h3>
      </div>

      <div className="space-y-4">
        {quotes.map((quote) => (
          <Card key={quote.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-lg">{quote.plan_name || 'Final Expense Life Insurance'}</h4>
                    {quote.am_best_rating && (
                      <div className="flex items-center gap-1">
                        <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">{quote.am_best_rating}</span>
                      </div>
                    )}
                    {quote.underwriting_type === 'guaranteed' && (
                      <Badge variant="default" className="bg-orange-100 text-orange-800">
                        Guaranteed Acceptance
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600">{quote.carrier?.name || quote.company_name || 'Unknown Carrier'}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600">
                    ${quote.monthly_rate?.toLocaleString() || '0'}
                  </div>
                  <div className="text-sm text-gray-500">per month</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="text-sm text-orange-700">Coverage Amount</div>
                  <div className="font-semibold text-orange-800">
                    ${quote.face_value?.toLocaleString() || '0'}
                  </div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="text-sm text-orange-700">Annual Premium</div>
                  <div className="font-semibold text-orange-800">${quote.annual_rate?.toLocaleString() || '0'}</div>
                </div>
              </div>

              <div className="mb-4">
                <h5 className="font-medium mb-2">Plan Features</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {/* Generate features based on available data */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="h-3 w-3 text-orange-500">☂️</span>
                    <span>Coverage up to ${quote.face_value?.toLocaleString() || '0'}</span>
                  </div>
                  {quote.underwriting_type === 'guaranteed' && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="h-3 w-3 text-orange-500">☂️</span>
                      <span>Guaranteed Acceptance</span>
                    </div>
                  )}
                  {quote.has_pdf_app && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="h-3 w-3 text-orange-500">☂️</span>
                      <span>PDF Application Available</span>
                    </div>
                  )}
                  {quote.e_app_link && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="h-3 w-3 text-orange-500">☂️</span>
                      <span>Online Application Available</span>
                    </div>
                  )}
                  {quote.am_best_rating && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="h-3 w-3 text-orange-500">☂️</span>
                      <span>AM Best Rating: {quote.am_best_rating}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="h-3 w-3 text-orange-500">☂️</span>
                    <span>Final Expense Life Insurance</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                {quote.underwriting_type && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    {quote.underwriting_type}
                  </Badge>
                )}
                {quote.underwriting_type === 'guaranteed' && (
                  <Badge variant="secondary">
                    No medical exam required
                  </Badge>
                )}
                {quote.monthly_fee && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <span className="h-3 w-3 font-bold">$</span>
                    ${quote.monthly_fee} monthly fee
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Coverage for final expenses and burial costs
                </div>
                <Button 
                  onClick={() => onSelectPlan?.(quote)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Select Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
