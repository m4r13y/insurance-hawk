"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircledIcon, InfoCircledIcon, PersonIcon, StarFilledIcon, CalendarIcon } from "@radix-ui/react-icons";
import { 
  FinalExpenseQuote, 
  FinalExpenseSidebarProps, 
  getFinalExpenseCarrierName, 
  getFinalExpenseCarrierFullName 
} from "@/types/final-expense";

export default function FinalExpenseSidebar({ selectedQuote, className = "" }: FinalExpenseSidebarProps) {

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Selected Plan Details */}
      {selectedQuote && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircledIcon className="h-5 w-5 text-green-600" />
              Selected Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {selectedQuote.plan_name || `${getFinalExpenseCarrierName(selectedQuote)} Life Insurance`}
              </h3>
              <p className="text-sm text-gray-600">{getFinalExpenseCarrierFullName(selectedQuote)}</p>
              {selectedQuote.underwriting_type === 'guaranteed' && (
                <Badge className="mt-2 bg-green-100 text-green-800 hover:bg-green-100">
                  Guaranteed Acceptance
                </Badge>
              )}
            </div>

            <Separator />

            {/* Pricing */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Monthly Premium</span>
                <span className="text-lg font-bold text-blue-600">
                  ${selectedQuote.monthly_rate?.toLocaleString() || '0'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Coverage Amount</span>
                <span className="text-sm font-semibold text-gray-900">
                  ${selectedQuote.face_value?.toLocaleString() || '0'}
                </span>
              </div>

              {selectedQuote.annual_rate && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Annual Premium</span>
                  <span className="text-sm font-medium text-gray-900">
                    ${selectedQuote.annual_rate.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <Separator />

            {/* Plan Details */}
            <div className="space-y-2">
              {selectedQuote.am_best_rating && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">AM Best Rating</span>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <StarFilledIcon className="h-3 w-3 text-yellow-400 fill-current" />
                    {selectedQuote.am_best_rating}
                  </Badge>
                </div>
              )}
              
              {selectedQuote.underwriting_type && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Plan Type</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {selectedQuote.underwriting_type} Issue
                  </span>
                </div>
              )}

              {selectedQuote.monthly_fee && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Policy Fee</span>
                  <span className="text-sm font-medium text-orange-600">
                    ${selectedQuote.monthly_fee}/month
                  </span>
                </div>
              )}
            </div>

            <Separator />

            {/* Application Options */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-900">Application Options</h4>
              <div className="space-y-2">
                {selectedQuote.e_app_link && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircledIcon className="h-4 w-4 text-green-600" />
                    <span>Online application available</span>
                  </div>
                )}
                {selectedQuote.has_pdf_app && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircledIcon className="h-4 w-4 text-green-600" />
                    <span>PDF application available</span>
                  </div>
                )}
                {selectedQuote.underwriting_type === 'guaranteed' && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircledIcon className="h-4 w-4 text-green-600" />
                    <span>No medical exam required</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Understanding Final Expense</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <span className="text-blue-600 font-bold">$</span>
              What It Covers
            </h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Funeral and burial costs</li>
              <li>• Memorial service expenses</li>
              <li>• Outstanding medical bills</li>
              <li>• Credit card debts</li>
              <li>• Other final expenses</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <CheckCircledIcon className="h-4 w-4 text-green-600" />
              Plan Types
            </h4>
            <div className="space-y-3 text-sm">
              <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                <div className="font-medium text-green-800 mb-1">Guaranteed Acceptance</div>
                <div className="text-green-700">No medical exam or health questions. May have waiting periods.</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <div className="font-medium text-blue-800 mb-1">Simplified Issue</div>
                <div className="text-blue-700">Basic health questions only. Faster approval process.</div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <PersonIcon className="h-4 w-4 text-blue-600" />
              Who Should Consider
            </h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Seniors without life insurance</li>
              <li>• Those with health issues</li>
              <li>• People wanting to ease family burden</li>
              <li>• Fixed income individuals</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <InfoCircledIcon className="h-4 w-4 text-orange-600" />
              Important Notes
            </h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Premiums typically don't increase</li>
              <li>• Benefits paid to beneficiaries</li>
              <li>• Coverage amounts are usually smaller</li>
              <li>• Quick approval for most plans</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* General Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Important Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-gray-600 space-y-2">
            <p>• Coverage begins on your effective date</p>
            <p>• Waiting periods may apply for guaranteed issue plans</p>
            <p>• Premiums are typically fixed for life</p>
            <p>• Benefits are paid tax-free to beneficiaries</p>
            <p>• No cash value accumulation in most plans</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
