"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircledIcon, CalendarIcon, PersonIcon, StarFilledIcon } from "@radix-ui/react-icons";
import { OptimizedDentalQuote } from "@/lib/dental-quote-optimizer";
import { getAmBestRatingText } from '@/utils/amBestRating';

interface DentalSidebarProps {
  selectedQuote?: OptimizedDentalQuote;
  className?: string;
}

export default function DentalSidebar({ selectedQuote, className = "" }: DentalSidebarProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Selected Plan Details */}
      {selectedQuote && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircledIcon className="h-5 w-5" />
              Selected Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {selectedQuote.planName}
              </h3>
              <p className="text-sm text-gray-600">{selectedQuote.fullPlanName}</p>
              <p className="text-sm text-gray-500 mt-1">{selectedQuote.companyFullName}</p>
            </div>

            <Separator />

            {/* Pricing */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Monthly Premium</span>
                <span className="text-lg font-bold text-blue-600">
                  ${selectedQuote.monthlyPremium}/mo
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Annual Maximum</span>
                <span className="text-sm font-semibold text-gray-900">
                  ${selectedQuote.annualMaximum.toLocaleString()}
                </span>
              </div>
            </div>

            <Separator />

            {/* Company Info */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Company Rating</span>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <StarFilledIcon className="h-3 w-3 text-yellow-400 fill-current" />
                  {getAmBestRatingText(selectedQuote.ambestRating)}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Outlook</span>
                <span className="text-sm font-medium text-gray-900">
                  {selectedQuote.ambestOutlook || 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">NAIC</span>
              </div>
            </div>

            <Separator />

            {/* Coverage Details */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Age</span>
                <span className="text-sm font-medium text-gray-900">
                  {selectedQuote.age}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">State</span>
                <span className="text-sm font-medium text-gray-900">
                  {selectedQuote.state}
                </span>
              </div>
              
              {selectedQuote.gender && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Gender</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedQuote.gender}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Benefits */}
      {selectedQuote?.benefitNotes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-sm">$</span>
              Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="text-sm text-gray-600 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: selectedQuote.benefitNotes }}
            />
          </CardContent>
        </Card>
      )}

      {/* Plan Limitations */}
      {selectedQuote?.limitationNotes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Limitations & Waiting Periods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="text-sm text-gray-600 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: selectedQuote.limitationNotes }}
            />
          </CardContent>
        </Card>
      )}

      {/* General Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PersonIcon className="h-5 w-5" />
            Important Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-gray-600">
            <p>• Coverage begins on your effective date</p>
            <p>• Waiting periods may apply for certain services</p>
            <p>• Annual maximums reset each policy year</p>
            <p>• Pre-existing conditions may affect coverage</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
