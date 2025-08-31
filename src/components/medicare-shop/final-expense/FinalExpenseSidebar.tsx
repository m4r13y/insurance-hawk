"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircledIcon, InfoCircledIcon, PersonIcon } from "@radix-ui/react-icons";

interface FinalExpenseSidebarProps {
  selectedQuote?: any;
  className?: string;
}

export default function FinalExpenseSidebar({ selectedQuote, className = "" }: FinalExpenseSidebarProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircledIcon className="h-5 w-5" />
            Final Expense Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Monthly Premium</label>
            <div className="space-y-2">
              <input 
                type="range" 
                min="0" 
                max="200" 
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>$0</span>
                <span>$200+</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Coverage Amount</label>
            <select className="w-full p-2 border rounded-md">
              <option value="all">Any Amount</option>
              <option value="5000">$5,000+</option>
              <option value="10000">$10,000+</option>
              <option value="25000">$25,000+</option>
              <option value="50000">$50,000+</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Plan Type</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">Guaranteed acceptance</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">Simplified issue</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">Full underwriting</span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Waiting Period</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">No waiting period</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">2 years or less</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">3 years or less</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Understanding Final Expense</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <span className="text-sm">$</span>
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
              <CheckCircledIcon className="h-4 w-4" />
              Plan Types
            </h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div>
                <strong>Guaranteed Acceptance:</strong> No medical exam or health questions. May have waiting periods.
              </div>
              <div>
                <strong>Simplified Issue:</strong> Basic health questions only. Faster approval process.
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <PersonIcon className="h-4 w-4" />
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
              <InfoCircledIcon className="h-4 w-4" />
              Important Notes
            </h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Premiums typically don't increase</li>
              <li>• Cash value may be available</li>
              <li>• Benefits paid to beneficiaries</li>
              <li>• Coverage amounts are usually smaller</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Selected Plan Details */}
      {selectedQuote && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selected Plan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="font-medium">{selectedQuote.planName}</div>
              <div className="text-sm text-gray-600">{selectedQuote.carrierName}</div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Monthly Premium</span>
                <span className="font-medium">${selectedQuote.monthlyPremium}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Coverage Amount</span>
                <span className="font-medium">${selectedQuote.coverageAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Age Range</span>
                <span className="font-medium">{selectedQuote.ageRange}</span>
              </div>
              {selectedQuote.waitingPeriod && (
                <div className="flex justify-between">
                  <span className="text-sm">Waiting Period</span>
                  <span className="font-medium">{selectedQuote.waitingPeriod} years</span>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-1">
              <div className="text-sm font-medium">Plan Features</div>
              {selectedQuote.features?.slice(0, 5).map((feature: string, idx: number) => (
                <div key={idx} className="text-sm text-gray-600">• {feature}</div>
              ))}
              {selectedQuote.features?.length > 5 && (
                <div className="text-sm text-orange-600">+ {selectedQuote.features.length - 5} more features</div>
              )}
            </div>

            {selectedQuote.guaranteed && (
              <>
                <Separator />
                <div className="bg-orange-50 p-2 rounded text-sm">
                  <div className="font-medium text-orange-800">Guaranteed Acceptance</div>
                  <div className="text-orange-700">No medical exam required</div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
