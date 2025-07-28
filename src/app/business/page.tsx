"use client";

import React, { useState, useEffect } from "react";
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
    ComponentInstanceIcon,
    PersonIcon,
    GroupIcon,
    GlobeIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    InfoCircledIcon,
    FileTextIcon,
    HeartIcon,
    ActivityLogIcon,
    EyeOpenIcon
} from '@radix-ui/react-icons';
import { Separator } from "@/components/ui/separator";

interface BusinessType {
  id: string;
  name: string;
  icon: any;
  isPopular?: boolean;
}

interface BusinessData {
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

const smallBusinessPlans: BusinessType[] = [
  { id: "small-group-health", name: "Small Group Health", icon: HeartIcon, isPopular: true },
  { id: "key-person", name: "Key Person Life", icon: PersonIcon },
  { id: "business-overhead", name: "Business Overhead", icon: ComponentInstanceIcon },
];

const smallBusinessAddOns: BusinessType[] = [
  { id: "dental-vision", name: "Dental & Vision", icon: EyeOpenIcon },
  { id: "disability", name: "Disability Insurance", icon: ActivityLogIcon },
  { id: "workers-comp", name: "Workers' Compensation", icon: ComponentInstanceIcon },
];

const corporateServices: BusinessType[] = [
  { id: "employee-benefits", name: "Employee Benefits", icon: GroupIcon, isPopular: true },
  { id: "executive-benefits", name: "Executive Benefits", icon: PersonIcon },
  { id: "self-funded", name: "Self-Funded Plans", icon: ComponentInstanceIcon },
];

const corporateAddOns: BusinessType[] = [
  { id: "wellness-programs", name: "Wellness Programs", icon: HeartIcon },
  { id: "voluntary-benefits", name: "Voluntary Benefits", icon: ActivityLogIcon },
  { id: "compliance", name: "Compliance Services", icon: FileTextIcon },
];

const businessData: Record<string, BusinessData> = {
  // Small Business Plans
  "small-group-health": {
    title: "SMALL GROUP HEALTH INSURANCE",
    subtitle: "Comprehensive coverage for your team!",
    description: "Small group health insurance provides comprehensive medical coverage for businesses with 2-50 employees. These plans offer competitive rates, tax advantages, and help attract and retain quality employees. Coverage includes medical, prescription drugs, and preventive care.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    keyInfo: {
      benefits: [
        { label: "Tax Deductible Premiums", value: "✓", highlight: true, icon: InfoCircledIcon },
        { label: "Attract Top Talent", value: "✓", highlight: true, icon: InfoCircledIcon },
        { label: "Predictable Costs", value: "✓", highlight: true, icon: InfoCircledIcon },
      ],
      coverage: [
        { label: "Medical Coverage", value: "Comprehensive", icon: InfoCircledIcon },
        { label: "Prescription Drugs", value: "Included", icon: InfoCircledIcon },
        { label: "Preventive Care", value: "$0 Copay", icon: InfoCircledIcon },
        { label: "Network Access", value: "Nationwide", icon: InfoCircledIcon },
      ],
      costs: [
        { label: "Employee Contribution", value: "50-80%", icon: InfoCircledIcon },
        { label: "Employer Contribution", value: "Varies", icon: InfoCircledIcon },
        { label: "Deductible Options", value: "$500-$5,000", icon: InfoCircledIcon },
      ],
    },
    ctaText: "Get Business Quotes",
    ctaUrl: "/business-quotes",
  },
  "key-person": {
    title: "KEY PERSON LIFE INSURANCE",
    subtitle: "Protect your business from key employee loss!",
    description: "Key person life insurance protects your business financially if a key employee or owner dies. The business owns the policy and pays the premiums, receiving the death benefit to cover losses, find replacements, and maintain operations during transition periods.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    keyInfo: {
      benefits: [
        { label: "Business Continuity", value: "✓", highlight: true, icon: InfoCircledIcon },
        { label: "Loan Protection", value: "✓", highlight: true, icon: InfoCircledIcon },
        { label: "Tax Advantages", value: "✓", highlight: true, icon: InfoCircledIcon },
      ],
      coverage: [
        { label: "Death Benefit", value: "$100K-$5M+", icon: InfoCircledIcon },
        { label: "Policy Owner", value: "Business", icon: InfoCircledIcon },
        { label: "Beneficiary", value: "Business", icon: InfoCircledIcon },
      ],
      costs: [
        { label: "Premium Payment", value: "Business", icon: InfoCircledIcon },
        { label: "Tax Deductible", value: "Premiums", icon: InfoCircledIcon },
        { label: "Underwriting", value: "Required", icon: InfoCircledIcon },
      ],
    },
    ctaText: "Get Key Person Quote",
    ctaUrl: "/key-person-quotes",
  },
  "business-overhead": {
    title: "BUSINESS OVERHEAD EXPENSE",
    subtitle: "Keep your business running during disability!",
    description: "Business Overhead Expense insurance helps pay your business's fixed monthly expenses if you become disabled and can't work. This coverage ensures your business can continue operating while you focus on recovery.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    keyInfo: {
      benefits: [
        { label: "Business Continuity", value: "✓", highlight: true, icon: InfoCircledIcon },
        { label: "Fixed Expense Coverage", value: "✓", highlight: true, icon: InfoCircledIcon },
        { label: "Staff Retention", value: "✓", highlight: true, icon: InfoCircledIcon },
      ],
      coverage: [
        { label: "Monthly Benefit", value: "$2,500-$20,000", icon: InfoCircledIcon },
        { label: "Benefit Period", value: "12-24 months", icon: InfoCircledIcon },
        { label: "Elimination Period", value: "30-365 days", icon: InfoCircledIcon },
      ],
      costs: [
        { label: "Premium Cost", value: "1-3% of benefit", icon: InfoCircledIcon },
        { label: "Tax Treatment", value: "Deductible", icon: InfoCircledIcon },
        { label: "Underwriting", value: "Simplified", icon: InfoCircledIcon },
      ],
    },
    ctaText: "Get BOE Quote",
    ctaUrl: "/boe-quotes",
  },
  "employee-benefits": {
    title: "EMPLOYEE BENEFITS PACKAGE",
    subtitle: "Comprehensive benefits for your workforce!",
    description: "Complete employee benefits packages designed for larger organizations. Includes health, dental, vision, life insurance, and retirement plans to attract and retain top talent in competitive markets.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    keyInfo: {
      benefits: [
        { label: "Talent Attraction", value: "✓", highlight: true, icon: InfoCircledIcon },
        { label: "Employee Retention", value: "✓", highlight: true, icon: InfoCircledIcon },
        { label: "Tax Advantages", value: "✓", highlight: true, icon: InfoCircledIcon },
      ],
      coverage: [
        { label: "Health Insurance", value: "Multiple Options", icon: InfoCircledIcon },
        { label: "Dental & Vision", value: "Included", icon: InfoCircledIcon },
        { label: "Life Insurance", value: "Group Rates", icon: InfoCircledIcon },
        { label: "Retirement Plans", value: "401(k) Available", icon: InfoCircledIcon },
      ],
      costs: [
        { label: "Employer Contribution", value: "70-100%", icon: InfoCircledIcon },
        { label: "Employee Contribution", value: "Varies", icon: InfoCircledIcon },
        { label: "Administration", value: "Included", icon: InfoCircledIcon },
      ],
    },
    ctaText: "Get Employee Benefits Quote",
    ctaUrl: "/employee-benefits-quotes",
  },
};

export default function BusinessHub() {
  const router = useRouter();
  const [isCorporate, setIsCorporate] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("small-group-health");

  // Apply dark theme to entire document when component mounts
  useEffect(() => {
    // Add dark class to html and body elements
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
    
    // Cleanup function to remove dark class when component unmounts
    return () => {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    };
  }, []);

  const currentPlans = isCorporate ? corporateServices : smallBusinessPlans;
  const currentAddOns = isCorporate ? corporateAddOns : smallBusinessAddOns;
  const currentData = businessData[selectedPlan] || businessData["small-group-health"];

  const themeColors = {
    primary: isCorporate ? "text-purple-400" : "text-blue-400",
    accent: isCorporate ? "text-purple-400" : "text-blue-400",
    bg: isCorporate ? "bg-purple-900/20" : "bg-blue-900/20",
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleBackToHome = () => {
    router.back();
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-neutral-900 flex overflow-hidden">
        {/* Custom Sidebar for Business - Matching Main Sidebar Style */}
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

                {/* Business Type Toggle */}
                <div className="px-3 pb-2">
                  <div className="flex items-center justify-center space-x-4 p-3 bg-gray-800 rounded-lg shadow-sm">
                    <span className={`font-semibold text-sm ${!isCorporate ? themeColors.accent : 'text-gray-500'}`}>
                      Small Business
                    </span>
                    <Switch
                      checked={isCorporate}
                      onCheckedChange={(checked) => {
                        setIsCorporate(checked);
                        setSelectedPlan(checked ? "employee-benefits" : "small-group-health");
                      }}
                      className="data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-blue-600"
                    />
                    <span className={`font-semibold text-sm ${isCorporate ? themeColors.accent : 'text-gray-500'}`}>
                      Corporate
                    </span>
                  </div>
                </div>

                <SidebarMenu>
                  {/* Plan Types Section */}
                  <div className="px-3 py-2">
                    <h3 className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
                      {isCorporate ? "CORPORATE SERVICES" : "BUSINESS INSURANCE"}
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
                      ADDITIONAL SERVICES
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
                          <p className="text-gray-300 leading-relaxed">
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
                          <HeartIcon className="w-5 h-5 text-green-400" />
                          Key Benefits
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {currentData.keyInfo.benefits.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-green-900/20 rounded-lg">
                            <div className="flex items-center gap-2">
                              {item.icon && <item.icon className="w-4 h-4 text-green-400" />}
                              <span className="text-sm font-medium">{item.label}</span>
                            </div>
                            <span className={`text-sm font-semibold ${item.highlight ? 'text-green-400' : 'text-gray-300'}`}>
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
                          <ComponentInstanceIcon className="w-5 h-5 text-blue-400" />
                          Coverage Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {currentData.keyInfo.coverage.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-blue-900/20 rounded-lg">
                            <div className="flex items-center gap-2">
                              {item.icon && <item.icon className="w-4 h-4 text-blue-400" />}
                              <span className="text-sm font-medium">{item.label}</span>
                            </div>
                            <span className={`text-sm font-semibold ${item.highlight ? 'text-blue-400' : 'text-gray-300'}`}>
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
                          <ActivityLogIcon className="w-5 h-5 text-orange-400" />
                          Cost Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {currentData.keyInfo.costs.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-orange-900/20 rounded-lg">
                            <div className="flex items-center gap-2">
                              {item.icon && <item.icon className="w-4 h-4 text-orange-400" />}
                              <span className="text-sm font-medium">{item.label}</span>
                            </div>
                            <span className={`text-sm font-semibold ${item.highlight ? 'text-orange-400' : 'text-gray-300'}`}>
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
