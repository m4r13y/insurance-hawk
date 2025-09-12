'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface PlanVariables {
  annualMaximum: string;
  deductible: string;
  disappearingDeductible: boolean;
  preventiveOption: boolean;
}

interface PlanResult {
  planName: string;
  monthlyRate: number;
  benefits: string[];
  limitations: string[];
}

// Sample data based on the Loyal American Life plans we analyzed
const loyalAmericanPlans = [
  {
    planName: "Value Plan",
    annualMaximum: "$1,000",
    deductible: "$50",
    disappearingDeductible: false,
    preventiveOption: false,
    monthlyRate: 23.39,
    benefits: ["100% Preventive covered", "No deductible on preventive", "80% Basic Services after year 1"],
    limitations: ["Please see plan documents for full details"]
  },
  {
    planName: "Flexible Choice DVH 2500 - $100 Deductible - Disappearing Deductible Option",
    annualMaximum: "$2,500",
    deductible: "$100",
    disappearingDeductible: true,
    preventiveOption: false,
    monthlyRate: 43.48,
    benefits: ["Disappearing deductible reduces by 1/3 each year", "90% coverage by Year 4+", "Vision and Hearing benefits included"],
    limitations: ["12 month waiting period for Major Services", "6 month waiting for Vision", "12 month waiting for Hearing"]
  },
  {
    planName: "Flexible Choice DVH 5000 - $100 Deductible - 100% Preventive Option",
    annualMaximum: "$5,000",
    deductible: "$100",
    disappearingDeductible: false,
    preventiveOption: true,
    monthlyRate: 38.84,
    benefits: ["100% Preventive Services covered", "90% coverage by Year 4+", "Vision and Hearing benefits included"],
    limitations: ["12 month waiting period for Major Services", "6 month waiting for Vision", "12 month waiting for Hearing"]
  }
];

export default function LoyalAmericanPlanBuilder() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedVariables, setSelectedVariables] = useState<PlanVariables>({
    annualMaximum: '',
    deductible: '',
    disappearingDeductible: false,
    preventiveOption: false
  });
  const [calculatedPlan, setCalculatedPlan] = useState<PlanResult | null>(null);

  // Available options based on our analysis
  const annualMaximumOptions = ["$1,000", "$2,500", "$5,000"];
  const deductibleOptions = ["$50", "$100"];

  const handleVariableChange = (variable: keyof PlanVariables, value: any) => {
    const newVariables = { ...selectedVariables, [variable]: value };
    setSelectedVariables(newVariables);
    
    // Reset dependent fields when changing primary variables
    if (variable === 'annualMaximum') {
      newVariables.disappearingDeductible = false;
      newVariables.preventiveOption = false;
      setSelectedVariables(newVariables);
      setCurrentStep(2);
    } else if (variable === 'deductible') {
      newVariables.disappearingDeductible = false;
      newVariables.preventiveOption = false;
      setSelectedVariables(newVariables);
      setCurrentStep(3);
    }
  };

  const calculatePlan = () => {
    // Find matching plan based on selected variables
    const matchingPlan = loyalAmericanPlans.find(plan => 
      plan.annualMaximum === selectedVariables.annualMaximum &&
      plan.deductible === selectedVariables.deductible &&
      plan.disappearingDeductible === selectedVariables.disappearingDeductible &&
      plan.preventiveOption === selectedVariables.preventiveOption
    );

    if (matchingPlan) {
      setCalculatedPlan({
        planName: matchingPlan.planName,
        monthlyRate: matchingPlan.monthlyRate,
        benefits: matchingPlan.benefits,
        limitations: matchingPlan.limitations
      });
      setCurrentStep(4);
    }
  };

  const resetBuilder = () => {
    setCurrentStep(1);
    setSelectedVariables({
      annualMaximum: '',
      deductible: '',
      disappearingDeductible: false,
      preventiveOption: false
    });
    setCalculatedPlan(null);
  };

  const canCalculate = selectedVariables.annualMaximum && selectedVariables.deductible;

  // Check if optional features are available based on current selections
  const hasDisappearingDeductibleOption = selectedVariables.deductible === '$100';
  const hasPreventiveOption = (selectedVariables.annualMaximum === '$2,500' || selectedVariables.annualMaximum === '$5,000');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Loyal American Life - Dental Plan Builder</h2>
        <Button variant="outline" onClick={resetBuilder}>
          Start Over
        </Button>
      </div>

      <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
        <strong>How it works:</strong> Select your desired benefit variables below. The cost will be calculated based on your choices, 
        not used as a selection criteria. This demonstrates how benefit options drive the final plan and price.
      </div>

      {/* Progress Steps */}
      <div className="flex items-center space-x-4">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= step 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {step}
            </div>
            {step < 4 && (
              <div className={`w-12 h-1 mx-2 ${
                currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Labels */}
      <div className="grid grid-cols-4 gap-4 text-center text-sm text-gray-600">
        <div>Annual Maximum</div>
        <div>Deductible</div>
        <div>Optional Features</div>
        <div>Your Plan</div>
      </div>

      {/* Step 1: Annual Maximum */}
      {currentStep >= 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Select Annual Maximum Benefit</CardTitle>
            <CardDescription>
              Choose your desired annual coverage limit - this is the total amount the plan will pay per year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select 
              value={selectedVariables.annualMaximum} 
              onValueChange={(value) => handleVariableChange('annualMaximum', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select annual maximum" />
              </SelectTrigger>
              <SelectContent>
                {annualMaximumOptions.map(option => (
                  <SelectItem key={option} value={option}>
                    {option} per year
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Deductible */}
      {currentStep >= 2 && selectedVariables.annualMaximum && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Select Calendar-Year Deductible</CardTitle>
            <CardDescription>
              Choose your annual deductible amount - what you pay before insurance coverage begins
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select 
              value={selectedVariables.deductible} 
              onValueChange={(value) => handleVariableChange('deductible', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select deductible" />
              </SelectTrigger>
              <SelectContent>
                {deductibleOptions.map(option => (
                  <SelectItem key={option} value={option}>
                    {option} per year
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Optional Features */}
      {currentStep >= 3 && selectedVariables.deductible && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Select Optional Features</CardTitle>
            <CardDescription>
              Choose additional benefit options available for your selected coverage level
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Disappearing Deductible Option */}
            {hasDisappearingDeductibleOption && (
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3">Disappearing Deductible Feature</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Available with $100 deductible plans - reduces your deductible by 1/3 each year
                </p>
                <RadioGroup 
                  value={selectedVariables.disappearingDeductible.toString()}
                  onValueChange={(value) => handleVariableChange('disappearingDeductible', value === 'true')}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="no-disappearing" />
                    <Label htmlFor="no-disappearing">Standard deductible</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="disappearing" />
                    <Label htmlFor="disappearing">
                      Disappearing deductible (Year 1: $100, Year 2: $67, Year 3: $33, Year 4+: $0)
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* 100% Preventive Option */}
            {hasPreventiveOption && (
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3">100% Preventive Coverage Option</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Available with higher coverage plans - covers preventive services at 100%
                </p>
                <RadioGroup 
                  value={selectedVariables.preventiveOption.toString()}
                  onValueChange={(value) => handleVariableChange('preventiveOption', value === 'true')}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="standard-preventive" />
                    <Label htmlFor="standard-preventive">Standard preventive coverage</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="full-preventive" />
                    <Label htmlFor="full-preventive">
                      100% Preventive Services covered (no deductible, no coinsurance)
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {!hasDisappearingDeductibleOption && !hasPreventiveOption && (
              <div className="text-center text-gray-500 p-4">
                No additional options available for this combination of annual maximum and deductible.
              </div>
            )}

            {canCalculate && (
              <Button onClick={calculatePlan} className="w-full" size="lg">
                Calculate My Plan & Cost
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Plan Result */}
      {currentStep >= 4 && calculatedPlan && (
        <Card>
          <CardHeader>
            <CardTitle>Your Customized Plan</CardTitle>
            <CardDescription>
              Based on your selected benefit options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg">{calculatedPlan.planName}</h3>
              <p className="text-sm text-blue-700">Loyal American Life Insurance Company</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold">Annual Maximum</h4>
                <p className="text-lg">{selectedVariables.annualMaximum}</p>
              </div>
              <div>
                <h4 className="font-semibold">Deductible</h4>
                <p className="text-lg">{selectedVariables.deductible}</p>
              </div>
              <div>
                <h4 className="font-semibold">Disappearing Deductible</h4>
                <p className="text-lg">{selectedVariables.disappearingDeductible ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <h4 className="font-semibold">100% Preventive</h4>
                <p className="text-lg">{selectedVariables.preventiveOption ? 'Yes' : 'No'}</p>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2">Key Benefits</h4>
              <ul className="space-y-1">
                {calculatedPlan.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Plan Limitations</h4>
              <ul className="space-y-1">
                {calculatedPlan.limitations.map((limitation, index) => (
                  <li key={index} className="flex items-start text-gray-600">
                    <span className="text-orange-500 mr-2">!</span>
                    {limitation}
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            <div className="flex justify-between items-center bg-green-50 p-4 rounded-lg">
              <div>
                <span className="text-lg font-semibold">Monthly Premium</span>
                <p className="text-sm text-gray-600">Calculated based on your benefit selections</p>
              </div>
              <span className="text-3xl font-bold text-green-600">
                ${calculatedPlan.monthlyRate.toFixed(2)}
              </span>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg text-sm">
              <strong>Note:</strong> This demonstrates how benefit variables drive plan selection and pricing. 
              In a real system, this would connect to actual carrier APIs to get live pricing.
            </div>

            <Button className="w-full" size="lg">
              Continue to Application
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
