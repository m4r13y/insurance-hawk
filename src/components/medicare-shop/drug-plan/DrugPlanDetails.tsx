"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Star, 
  DollarSign, 
  Pill, 
  Shield, 
  Phone, 
  MapPin, 
  Clock,
  CheckCircle,
  XCircle,
  Info,
  ExternalLink
} from 'lucide-react';

interface DrugPlanDetailsProps {
  plan: {
    id: string;
    planName: string;
    carrierName: string;
    monthlyPremium: number;
    annualDeductible: number;
    coverageGap: string;
    formularyTier: string;
    pharmacyNetwork: string[];
    rating: number;
    benefits: string[];
    limitations: string[];
    planType: 'pdp' | 'mapd';
    specialNeeds?: boolean;
    carrierLogo?: string;
    planDetails?: {
      copayments: {
        tier1: number;
        tier2: number;
        tier3: number;
        tier4: number;
        tier5: number;
      };
      coinsurance: {
        tier3: number;
        tier4: number;
        tier5: number;
      };
      coverageGapCoverage: {
        genericDrugs: number;
        brandDrugs: number;
      };
      catastrophicCoverage: {
        copayGeneric: number;
        copayBrand: number;
        coinsurance: number;
      };
      pharmacyTypes: {
        retail: boolean;
        mailOrder: boolean;
        specialty: boolean;
      };
      additionalBenefits?: string[];
    };
  };
  onGetQuote?: () => void;
  onCallAgent?: () => void;
  onBack?: () => void;
}

export default function DrugPlanDetails({ 
  plan, 
  onGetQuote, 
  onCallAgent, 
  onBack 
}: DrugPlanDetailsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage}%`;
  };

  const getPlanTypeLabel = (type: string) => {
    switch (type) {
      case 'pdp':
        return 'Part D Plan';
      case 'mapd':
        return 'Medicare Advantage + Part D';
      default:
        return type;
    }
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{rating}/5</span>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            ← Back to Results
          </Button>
        )}
        <div className="flex gap-2">
          <Button onClick={onGetQuote} className="bg-blue-600 hover:bg-blue-700">
            <Phone className="h-4 w-4 mr-2" />
            Get Quote
          </Button>
          {onCallAgent && (
            <Button variant="outline" onClick={onCallAgent}>
              <Phone className="h-4 w-4 mr-2" />
              Call Agent
            </Button>
          )}
        </div>
      </div>

      {/* Plan Overview */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl mb-2">{plan.planName}</CardTitle>
              <p className="text-lg text-gray-600 mb-3">{plan.carrierName}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {getPlanTypeLabel(plan.planType)}
                </Badge>
                {plan.specialNeeds && (
                  <Badge variant="secondary">Special Needs Plan</Badge>
                )}
                {plan.rating && renderStarRating(plan.rating)}
              </div>
            </div>
            
            {/* Pricing Summary */}
            <div className="lg:text-right">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {formatCurrency(plan.monthlyPremium)}
              </div>
              <p className="text-sm text-gray-600">per month</p>
              <div className="mt-2">
                <p className="text-sm text-gray-600">Annual Deductible</p>
                <p className="text-lg font-semibold">{formatCurrency(plan.annualDeductible)}</p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coverage Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Pill className="h-5 w-5 mr-2" />
              Coverage Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {plan.planDetails && (
              <>
                {/* Copayments */}
                <div>
                  <h4 className="font-medium mb-2">Prescription Copayments</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Tier 1 (Generic):</span>
                      <span className="font-medium">{formatCurrency(plan.planDetails.copayments.tier1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tier 2 (Preferred Generic):</span>
                      <span className="font-medium">{formatCurrency(plan.planDetails.copayments.tier2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tier 3 (Preferred Brand):</span>
                      <span className="font-medium">{formatCurrency(plan.planDetails.copayments.tier3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tier 4 (Non-Preferred Brand):</span>
                      <span className="font-medium">{formatCurrency(plan.planDetails.copayments.tier4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tier 5 (Specialty):</span>
                      <span className="font-medium">{formatCurrency(plan.planDetails.copayments.tier5)}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Coverage Gap */}
                <div>
                  <h4 className="font-medium mb-2">Coverage Gap ("Donut Hole")</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Generic Drugs:</span>
                      <span className="font-medium">
                        {formatPercentage(plan.planDetails.coverageGapCoverage.genericDrugs)} coinsurance
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Brand Drugs:</span>
                      <span className="font-medium">
                        {formatPercentage(plan.planDetails.coverageGapCoverage.brandDrugs)} coinsurance
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Catastrophic Coverage */}
                <div>
                  <h4 className="font-medium mb-2">Catastrophic Coverage</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Generic Copay:</span>
                      <span className="font-medium">{formatCurrency(plan.planDetails.catastrophicCoverage.copayGeneric)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Brand Copay:</span>
                      <span className="font-medium">{formatCurrency(plan.planDetails.catastrophicCoverage.copayBrand)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Coinsurance:</span>
                      <span className="font-medium">{formatPercentage(plan.planDetails.catastrophicCoverage.coinsurance)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pharmacy Network */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Pharmacy Network
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {plan.planDetails && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Retail Pharmacies
                  </span>
                  {plan.planDetails.pharmacyTypes.retail ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Mail Order
                  </span>
                  {plan.planDetails.pharmacyTypes.mailOrder ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Pill className="h-4 w-4 mr-2" />
                    Specialty Pharmacy
                  </span>
                  {plan.planDetails.pharmacyTypes.specialty ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            )}

            {plan.pharmacyNetwork && plan.pharmacyNetwork.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Participating Pharmacies</h4>
                  <div className="space-y-1">
                    {plan.pharmacyNetwork.slice(0, 8).map((pharmacy, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        • {pharmacy}
                      </div>
                    ))}
                    {plan.pharmacyNetwork.length > 8 && (
                      <div className="text-sm text-blue-600">
                        + {plan.pharmacyNetwork.length - 8} more pharmacies
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Key Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {plan.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </li>
              ))}
            </ul>

            {plan.planDetails?.additionalBenefits && (
              <>
                <Separator className="my-4" />
                <div>
                  <h4 className="font-medium mb-2">Additional Benefits</h4>
                  <ul className="space-y-2">
                    {plan.planDetails.additionalBenefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Limitations */}
        {plan.limitations && plan.limitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="h-5 w-5 mr-2" />
                Important Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.limitations.map((limitation, index) => (
                  <li key={index} className="flex items-start">
                    <Info className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{limitation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" onClick={onGetQuote} className="bg-blue-600 hover:bg-blue-700">
          <Phone className="h-5 w-5 mr-2" />
          Get This Quote
        </Button>
        
        <Button size="lg" variant="outline">
          <ExternalLink className="h-5 w-5 mr-2" />
          View Official Summary
        </Button>
        
        {onCallAgent && (
          <Button size="lg" variant="outline" onClick={onCallAgent}>
            <Phone className="h-5 w-5 mr-2" />
            Speak with Agent
          </Button>
        )}
      </div>
    </div>
  );
}
