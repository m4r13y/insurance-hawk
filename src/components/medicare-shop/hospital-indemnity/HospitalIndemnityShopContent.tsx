"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StarFilledIcon, HomeIcon, CalendarIcon, CheckCircledIcon, TokensIcon as DollarSign, ReloadIcon } from "@radix-ui/react-icons";
import { OptimizedHospitalIndemnityQuote } from "@/lib/hospital-indemnity-quote-optimizer";
import { PlanCardsSkeleton } from "@/components/medicare-shop/shared";
import { SimplifiedHospitalIndemnityPlanBuilder } from './hospital-indemnity-field-mapping/SimplifiedHospitalIndemnityPlanBuilder';

interface HospitalIndemnityShopContentProps {
  quotes: OptimizedHospitalIndemnityQuote[];
  isLoading?: boolean;
  onSelectPlan?: (quote: OptimizedHospitalIndemnityQuote) => void;
}

export default function HospitalIndemnityShopContent({ 
  quotes, 
  isLoading = false, 
  onSelectPlan 
}: HospitalIndemnityShopContentProps) {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [planConfig, setPlanConfig] = useState<any>(null);

  if (isLoading) {
    return <PlanCardsSkeleton count={4} title="Hospital Indemnity Plans" />;
  }

  const handlePlanBuilt = async (config: any) => {
    console.log('✅ Plan built successfully:', config);
    
    // Show processing state
    setIsProcessing(true);
    setPlanConfig(config);
    setShowSuccessModal(true);
    
    // Simulate processing time (you can replace this with actual API calls)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Here you would typically:
    // 1. Save the configuration to the user's profile
    // 2. Navigate to a checkout or enrollment page
    // 3. Process the enrollment
    
    setIsProcessing(false);
    
    // Auto-close modal after 3 seconds
    setTimeout(() => {
      setShowSuccessModal(false);
    }, 3000);
  };

  if (!quotes || quotes.length === 0) {
    return (
      <div className="text-center py-12">
        <HomeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Hospital Indemnity Plans Found</h3>
        <p className="text-gray-500">
          We couldn't find any hospital indemnity insurance plans for your area. Please try adjusting your search criteria.
        </p>
      </div>
    );
  }

  

          return (
      <div className="items-center m-auto">
      {/* Main Content */}

            <SimplifiedHospitalIndemnityPlanBuilder 
              quotes={quotes}
              onPlanBuilt={handlePlanBuilt}
            />
    </div>
          );
}
