"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building2, DollarSign, Info, Calendar } from "lucide-react";

interface HospitalIndemnitySidebarProps {
  selectedQuote?: any;
  className?: string;
}

export default function HospitalIndemnitySidebar({ selectedQuote, className = "" }: HospitalIndemnitySidebarProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Hospital Plan Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Monthly Premium</label>
            <div className="space-y-2">
              <input 
                type="range" 
                min="0" 
                max="150" 
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>$0</span>
                <span>$150+</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Daily Benefit</label>
            <select className="w-full p-2 border rounded-md">
              <option value="all">Any Amount</option>
              <option value="100">$100+/day</option>
              <option value="200">$200+/day</option>
              <option value="300">$300+/day</option>
              <option value="500">$500+/day</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Maximum Days</label>
            <select className="w-full p-2 border rounded-md">
              <option value="all">Any Length</option>
              <option value="365">365+ days</option>
              <option value="180">180+ days</option>
              <option value="90">90+ days</option>
            </select>
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
                <span className="text-sm">30 days or less</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">90 days or less</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Understanding Hospital Indemnity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              How It Works
            </h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Hospital indemnity insurance pays a fixed daily amount for each day you're hospitalized, regardless of your actual medical costs.</p>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              What It Covers
            </h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Hospital room and board</li>
              <li>• Intensive care unit stays</li>
              <li>• Emergency room visits</li>
              <li>• Ambulance services</li>
              <li>• Outpatient procedures</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Key Benefits
            </h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Cash payments directly to you</li>
              <li>• Supplements existing health insurance</li>
              <li>• Helps cover deductibles and copays</li>
              <li>• Can be used for any expenses</li>
              <li>• No network restrictions</li>
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
                <span className="text-sm">Daily Benefit</span>
                <span className="font-medium">${selectedQuote.dailyBenefit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Maximum Days</span>
                <span className="font-medium">{selectedQuote.maxDays} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Max Annual Benefit</span>
                <span className="font-medium">
                  ${(selectedQuote.dailyBenefit * selectedQuote.maxDays).toLocaleString()}
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-1">
              <div className="text-sm font-medium">Benefits Included</div>
              {selectedQuote.benefits?.slice(0, 5).map((benefit: string, idx: number) => (
                <div key={idx} className="text-sm text-gray-600">• {benefit}</div>
              ))}
              {selectedQuote.benefits?.length > 5 && (
                <div className="text-sm text-green-600">+ {selectedQuote.benefits.length - 5} more benefits</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
