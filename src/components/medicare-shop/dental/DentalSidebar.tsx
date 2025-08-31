"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Calendar, Users, DollarSign } from "lucide-react";
import { 
  OptimizedDentalQuote,
  GroupedDentalQuote, 
  getMonthlyPremium, 
  getAnnualMaximum, 
  getCompanyName,
  getCoveragePercentages,
  getDeductible
} from "@/lib/dental-quote-optimizer";

interface DentalSidebarProps {
  selectedQuote?: GroupedDentalQuote;
  selectedAnnualMaximum?: string;
  className?: string;
}

export default function DentalSidebar({ selectedQuote, selectedAnnualMaximum, className = "" }: DentalSidebarProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Dental Plan Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Coverage Level</label>
            <select className="w-full p-2 border rounded-md">
              <option value="all">All Levels</option>
              <option value="basic">Basic</option>
              <option value="standard">Standard</option>
              <option value="comprehensive">Comprehensive</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Monthly Premium</label>
            <div className="space-y-2">
              <input 
                type="range" 
                min="0" 
                max="100" 
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>$0</span>
                <span>$100+</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Annual Maximum</label>
            <select className="w-full p-2 border rounded-md">
              <option value="all">Any Amount</option>
              <option value="1000">$1,000+</option>
              <option value="2000">$2,000+</option>
              <option value="3000">$3,000+</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Waiting Periods</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">No waiting for preventive</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">6 months or less for basic</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">12 months or less for major</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Understanding Dental Coverage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Coverage Types
            </h4>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Preventive (100%):</strong> Cleanings, exams, X-rays
              </div>
              <div>
                <strong>Basic (70-80%):</strong> Fillings, extractions
              </div>
              <div>
                <strong>Major (50-70%):</strong> Crowns, bridges, dentures
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              What to Consider
            </h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Annual maximum benefits</li>
              <li>• Waiting periods for services</li>
              <li>• Network provider access</li>
              <li>• Orthodontic coverage (if needed)</li>
            </ul>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Who Should Consider
            </h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Those without employer dental coverage</li>
              <li>• Individuals needing major dental work</li>
              <li>• Families with children</li>
              <li>• Seniors on Medicare (no dental coverage)</li>
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
            {(() => {
              // Get the selected annual maximum option or default
              const selectedOption = selectedAnnualMaximum 
                ? selectedQuote.annualMaximumOptions.find(opt => opt.displayAmount === selectedAnnualMaximum)
                : selectedQuote.annualMaximumOptions[0];
              
              const monthlyPremium = selectedOption?.monthlyPremium || selectedQuote.defaultMonthlyPremium;
              const annualMaximum = selectedOption?.displayAmount || selectedQuote.defaultAnnualMaximum;
              
              return (
                <>
                  <div>
                    <div className="font-medium">{selectedQuote.planName}</div>
                    <div className="text-sm text-gray-600">{selectedQuote.companyName}</div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly Premium</span>
                      <span className="font-medium">${monthlyPremium}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Annual Maximum</span>
                      <span className="font-medium">${annualMaximum}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Deductible</span>
                      <span className="font-medium">${selectedQuote.deductible}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-1">
                    <div className="text-sm font-medium">Coverage Levels</div>
                    <div className="text-sm">Preventive: {selectedQuote.coveragePercentages.preventive}%</div>
                    <div className="text-sm">Basic: {selectedQuote.coveragePercentages.basic}%</div>
                    <div className="text-sm">Major: {selectedQuote.coveragePercentages.major}%</div>
                    {selectedQuote.coveragePercentages.orthodontic && (
                      <div className="text-sm">Orthodontic: {selectedQuote.coveragePercentages.orthodontic}%</div>
                    )}
                  </div>
                  
                  {selectedQuote.annualMaximumOptions.length > 1 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Available Annual Maximum Options</div>
                        {selectedQuote.annualMaximumOptions.map((option) => (
                          <div key={option.id} className="flex justify-between text-sm">
                            <span>${option.displayAmount}</span>
                            <span className="text-gray-600">${option.monthlyPremium}/mo</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
