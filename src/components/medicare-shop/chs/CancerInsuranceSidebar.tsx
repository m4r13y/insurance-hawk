"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HeartIcon, PersonIcon, InfoCircledIcon } from "@radix-ui/react-icons";

interface CancerInsuranceSidebarProps {
  selectedQuote?: any;
  className?: string;
}

export default function CancerInsuranceSidebar({ selectedQuote, className = "" }: CancerInsuranceSidebarProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <HeartIcon className="h-5 w-5" />
            Cancer Plan Filters
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
            <label className="text-sm font-medium mb-2 block">Benefit Amount</label>
            <select className="w-full p-2 border rounded-md">
              <option value="all">Any Amount</option>
              <option value="25000">$25,000+</option>
              <option value="50000">$50,000+</option>
              <option value="100000">$100,000+</option>
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
          <CardTitle className="text-lg">Understanding Cancer Insurance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <PersonIcon className="h-4 w-4" />
              What It Covers
            </h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Cancer diagnosis benefit</li>
              <li>• Treatment and therapy costs</li>
              <li>• Transportation to treatment</li>
              <li>• Lodging during treatment</li>
              <li>• Loss of income support</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <span className="w-4 h-4 text-center text-sm">$</span>
              How It Works
            </h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Cancer insurance provides a lump sum payment upon diagnosis of covered cancers. This money can be used for any purpose - medical bills, lost income, or daily expenses.</p>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <InfoCircledIcon className="h-4 w-4" />
              Important Notes
            </h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Supplements other health insurance</li>
              <li>• Typically has waiting periods</li>
              <li>• Pre-existing conditions may be excluded</li>
              <li>• Benefits paid directly to you</li>
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
              {selectedQuote.benefitAmount && (
                <div className="flex justify-between">
                  <span className="text-sm">Max Benefit</span>
                  <span className="font-medium">${selectedQuote.benefitAmount.toLocaleString()}</span>
                </div>
              )}
              {selectedQuote.waitingPeriod && (
                <div className="flex justify-between">
                  <span className="text-sm">Waiting Period</span>
                  <span className="font-medium">{selectedQuote.waitingPeriod} days</span>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-1">
              <div className="text-sm font-medium">Benefits Included</div>
              {selectedQuote.benefits?.slice(0, 5).map((benefit: string, idx: number) => (
                <div key={idx} className="text-sm text-gray-600">• {benefit}</div>
              ))}
              {selectedQuote.benefits?.length > 5 && (
                <div className="text-sm text-blue-600">+ {selectedQuote.benefits.length - 5} more benefits</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
