"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarRail,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import { 
    HeartIcon,
    PersonIcon,
    EyeOpenIcon,
    ActivityLogIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    InfoCircledIcon,
    FileTextIcon,
    Cross1Icon,
    ComponentInstanceIcon
} from '@radix-ui/react-icons';
import { Separator } from "@/components/ui/separator";

interface InsuranceType {
  id: string;
  name: string;
  icon: any;
  isPopular?: boolean;
}

interface InsuranceData {
  title: string;
  subtitle: string;
  description: string;
  videoUrl: string;
  keyInfo: {
    details?: Array<{ label: string; value: string; highlight?: boolean; icon?: React.ElementType }>;
    coverage?: Array<{ label: string; value: string; highlight?: boolean; icon?: React.ElementType }>;
    costs?: Array<{ label: string; value: string; highlight?: boolean; icon?: React.ElementType }>;
    benefits?: Array<{ label: string; value: string; highlight?: boolean; icon?: React.ElementType }>;
  };
  ctaText: string;
  ctaUrl: string;
}

const healthInsurancePlans: InsuranceType[] = [
  { id: "aca-health", name: "ACA Health Plans", icon: HeartIcon, isPopular: true },
  { id: "short-term", name: "Short Term Medical", icon: ActivityLogIcon },
  { id: "christian-sharing", name: "Christian Sharing", icon: ComponentInstanceIcon },
];

const healthAddOns: InsuranceType[] = [
  { id: "dental-vision", name: "Dental & Vision", icon: EyeOpenIcon },
  { id: "telemedicine", name: "Telemedicine", icon: PersonIcon },
  { id: "prescription", name: "Prescription Discount", icon: ComponentInstanceIcon },
];

const lifeInsurancePlans: InsuranceType[] = [
  { id: "term-life", name: "Term Life Insurance", icon: PersonIcon, isPopular: true },
  { id: "whole-life", name: "Whole Life Insurance", icon: PersonIcon },
  { id: "universal-life", name: "Universal Life", icon: PersonIcon },
];

const lifeAddOns: InsuranceType[] = [
  { id: "accidental-death", name: "Accidental Death", icon: Cross1Icon },
  { id: "critical-illness", name: "Critical Illness", icon: ActivityLogIcon },
  { id: "disability", name: "Disability Insurance", icon: ComponentInstanceIcon },
];

const insuranceData: Record<string, InsuranceData> = {
  // Health Insurance Plans
  "aca-health": {
    title: "ACA HEALTH INSURANCE",
    subtitle: "Comprehensive health coverage for individuals and families!",
    description: "ACA-compliant health insurance plans provide comprehensive medical coverage with essential health benefits. These plans cover preventive care, prescription drugs, emergency services, and more. Available through the marketplace or directly from carriers.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    keyInfo: {
      benefits: [
        { label: "Essential Health Benefits", value: "✓", highlight: true, icon: InfoCircledIcon },
        { label: "Preventive Care", value: "$0 Copay", highlight: true, icon: InfoCircledIcon },
        { label: "No Pre-existing Conditions", value: "✓", highlight: true, icon: InfoCircledIcon },
      ],
      coverage: [
        { label: "Doctor Visits", value: "Covered", icon: InfoCircledIcon },
        { label: "Prescription Drugs", value: "Included", icon: InfoCircledIcon },
        { label: "Emergency Services", value: "24/7 Coverage", icon: InfoCircledIcon },
        { label: "Mental Health", value: "Included", icon: InfoCircledIcon },
      ],
      costs: [
        { label: "Monthly Premium", value: "$200-$800", icon: InfoCircledIcon },
        { label: "Deductible", value: "$1,000-$8,000", icon: InfoCircledIcon },
        { label: "Out-of-Pocket Max", value: "$8,700-$17,400", icon: InfoCircledIcon },
      ],
    },
    ctaText: "Get Health Insurance Quotes",
    ctaUrl: "/health-quotes",
  },
  "term-life": {
    title: "TERM LIFE INSURANCE",
    subtitle: "Affordable protection for your family's future!",
    description: "Term life insurance provides affordable death benefit protection for a specific period (10, 20, or 30 years). It's the most cost-effective way to provide financial security for your loved ones during your working years.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    keyInfo: {
      benefits: [
        { label: "Affordable Premiums", value: "✓", highlight: true, icon: InfoCircledIcon },
        { label: "Tax-Free Death Benefit", value: "✓", highlight: true, icon: InfoCircledIcon },
        { label: "No Medical Exam Options", value: "✓", highlight: true, icon: InfoCircledIcon },
      ],
      coverage: [
        { label: "Death Benefit", value: "$25K-$10M+", icon: InfoCircledIcon },
        { label: "Term Length", value: "10-30 Years", icon: InfoCircledIcon },
        { label: "Coverage Type", value: "Level Premium", icon: InfoCircledIcon },
        { label: "Conversion Option", value: "Available", icon: InfoCircledIcon },
      ],
      costs: [
        { label: "Monthly Premium", value: "$15-$200", icon: InfoCircledIcon },
        { label: "Age Factor", value: "Younger = Lower", icon: InfoCircledIcon },
        { label: "Health Factor", value: "Better Health = Lower", icon: InfoCircledIcon },
      ],
    },
    ctaText: "Get Life Insurance Quotes",
    ctaUrl: "/life-quotes",
  },
  "short-term": {
    title: "SHORT TERM MEDICAL",
    subtitle: "Temporary health coverage when you need it!",
    description: "Short term medical insurance provides temporary health coverage for gaps in insurance. Perfect for job transitions, COBRA alternatives, or waiting periods. Coverage typically lasts 30 days to 12 months.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    keyInfo: {
      benefits: [
        { label: "Quick Approval", value: "24-48 Hours", highlight: true, icon: InfoCircledIcon },
        { label: "Lower Premiums", value: "✓", highlight: true, icon: InfoCircledIcon },
        { label: "Network Access", value: "PPO Networks", highlight: true, icon: InfoCircledIcon },
      ],
      coverage: [
        { label: "Emergency Services", value: "Covered", icon: InfoCircledIcon },
        { label: "Doctor Visits", value: "After Deductible", icon: InfoCircledIcon },
        { label: "Prescription Drugs", value: "Generic Covered", icon: InfoCircledIcon },
        { label: "Coverage Period", value: "30 days - 12 months", icon: InfoCircledIcon },
      ],
      costs: [
        { label: "Monthly Premium", value: "$50-$300", icon: InfoCircledIcon },
        { label: "Deductible", value: "$1,000-$10,000", icon: InfoCircledIcon },
        { label: "Application Fee", value: "$25-$50", icon: InfoCircledIcon },
      ],
    },
    ctaText: "Get Short Term Quotes",
    ctaUrl: "/short-term-quotes",
  },
  "dental-vision": {
    title: "DENTAL & VISION INSURANCE",
    subtitle: "Complete oral and vision health coverage!",
    description: "Comprehensive dental and vision insurance plans that cover routine care, major procedures, and emergency services. Keep your teeth and eyes healthy with affordable coverage options.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    keyInfo: {
      benefits: [
        { label: "Preventive Care", value: "100% Covered", highlight: true, icon: InfoCircledIcon },
        { label: "No Waiting Periods", value: "✓", highlight: true, icon: InfoCircledIcon },
        { label: "Nationwide Network", value: "✓", highlight: true, icon: InfoCircledIcon },
      ],
      coverage: [
        { label: "Dental Cleanings", value: "2 Per Year", icon: InfoCircledIcon },
        { label: "Vision Exams", value: "Annual", icon: InfoCircledIcon },
        { label: "Glasses/Contacts", value: "Allowance", icon: InfoCircledIcon },
        { label: "Major Dental Work", value: "50-80% Covered", icon: InfoCircledIcon },
      ],
      costs: [
        { label: "Monthly Premium", value: "$15-$60", icon: InfoCircledIcon },
        { label: "Dental Deductible", value: "$0-$150", icon: InfoCircledIcon },
        { label: "Vision Copay", value: "$10-$25", icon: InfoCircledIcon },
      ],
    },
    ctaText: "Get Dental & Vision Quotes",
    ctaUrl: "/dental-vision-quotes",
  },
};

export default function IndividualHub() {
  const router = useRouter();
  const [isLifeInsurance, setIsLifeInsurance] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("aca-health");

  const currentPlans = isLifeInsurance ? lifeInsurancePlans : healthInsurancePlans;
  const currentAddOns = isLifeInsurance ? lifeAddOns : healthAddOns;
  const currentData = insuranceData[selectedPlan] || insuranceData["aca-health"];

  const themeColors = {
    primary: isLifeInsurance ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
    accent: isLifeInsurance ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
    bg: isLifeInsurance ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20",
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleBackToHome = () => {
    router.back();
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 flex overflow-hidden">
        {/* Custom Sidebar for Individual - Matching Main Sidebar Style */}
        <Sidebar className="w-80">
          <SidebarRail />
          <SidebarContent className="flex flex-col justify-between">
            <div>
              {/* Back Button */}
              <div className="px-3 pt-4 pb-2">
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={handleBackToHome} tooltip="Go Back">
                    <ChevronLeftIcon className="w-4 h-4" />
                    <span>Back to Main</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </div>

              {/* Insurance Type Toggle */}
              <div className="px-3 pb-2">
                <div className="flex items-center justify-center space-x-4 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <span className={`font-semibold text-sm ${!isLifeInsurance ? themeColors.accent : 'text-gray-500'}`}>
                    Health Insurance
                  </span>
                  <Switch
                    checked={isLifeInsurance}
                    onCheckedChange={(checked) => {
                      setIsLifeInsurance(checked);
                      setSelectedPlan(checked ? "term-life" : "aca-health");
                    }}
                    className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-600"
                  />
                  <span className={`font-semibold text-sm ${isLifeInsurance ? themeColors.accent : 'text-gray-500'}`}>
                    Life Insurance
                  </span>
                </div>
              </div>

              <SidebarMenu>
                {/* Plan Types Section */}
                <div className="px-3 py-2">
                  <h3 className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
                    {isLifeInsurance ? "LIFE INSURANCE TYPES" : "HEALTH INSURANCE PLANS"}
                  </h3>
                  {currentPlans.map((plan) => (
                    <SidebarMenuItem key={plan.id}>
                      <SidebarMenuButton 
                        onClick={() => handlePlanSelect(plan.id)}
                        isActive={selectedPlan === plan.id}
                        tooltip={plan.name}
                      >
                        <plan.icon className="w-4 h-4" />
                        <span>{plan.name}</span>
                        {plan.isPopular && selectedPlan !== plan.id && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            Popular
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </div>

                {/* Add-ons Section */}
                <div className="px-3 py-2">
                  <h3 className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
                    SUPPLEMENTAL COVERAGE
                  </h3>
                  {currentAddOns.map((addon) => (
                    <SidebarMenuItem key={addon.id}>
                      <SidebarMenuButton 
                        onClick={() => handlePlanSelect(addon.id)}
                        isActive={selectedPlan === addon.id}
                        tooltip={addon.name}
                      >
                        <addon.icon className="w-4 h-4" />
                        <span>{addon.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </div>
              </SidebarMenu>
            </div>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
              {/* Left Column */}
              <div className="lg:col-span-3 space-y-8">
                {/* Video Card */}
                <Card className="overflow-hidden">
                    <div className="relative aspect-video">
                    <iframe
                        width="100%"
                        height="100%"
                        src={currentData.videoUrl}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                    ></iframe>
                    </div>
                </Card>

                {/* Description Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className={themeColors.primary}>{currentData.title}</CardTitle>
                        <CardDescription className="text-lg font-medium">
                            {currentData.subtitle}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            {currentData.description}
                        </p>
                    </CardContent>
                </Card>
              </div>

              {/* Right Column - Key Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Benefits */}
                {currentData.keyInfo.benefits && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <HeartIcon className="w-5 h-5 text-green-600" />
                        Key Benefits
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {currentData.keyInfo.benefits.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center gap-2">
                            {item.icon && <item.icon className="w-4 h-4 text-green-600" />}
                            <span className="text-sm font-medium">{item.label}</span>
                          </div>
                          <span className={`text-sm font-semibold ${item.highlight ? 'text-green-600' : 'text-gray-600 dark:text-gray-300'}`}>
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Coverage Details */}
                {currentData.keyInfo.coverage && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ComponentInstanceIcon className="w-5 h-5 text-blue-600" />
                        Coverage Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {currentData.keyInfo.coverage.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-center gap-2">
                            {item.icon && <item.icon className="w-4 h-4 text-blue-600" />}
                            <span className="text-sm font-medium">{item.label}</span>
                          </div>
                          <span className={`text-sm font-semibold ${item.highlight ? 'text-blue-600' : 'text-gray-600 dark:text-gray-300'}`}>
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Cost Information */}
                {currentData.keyInfo.costs && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ActivityLogIcon className="w-5 h-5 text-orange-600" />
                        Cost Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {currentData.keyInfo.costs.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <div className="flex items-center gap-2">
                            {item.icon && <item.icon className="w-4 h-4 text-orange-600" />}
                            <span className="text-sm font-medium">{item.label}</span>
                          </div>
                          <span className={`text-sm font-semibold ${item.highlight ? 'text-orange-600' : 'text-gray-600 dark:text-gray-300'}`}>
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* CTA Button */}
                <Card>
                  <CardContent className="p-6">
                    <Button asChild className="w-full" size="lg">
                      <Link href={currentData.ctaUrl}>
                        {currentData.ctaText}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
