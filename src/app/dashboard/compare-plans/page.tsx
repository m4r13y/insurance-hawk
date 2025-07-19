"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Check,
  Info,
  Play,
  ArrowRight,
  Clock,
  DollarSign,
  Shield,
  Heart,
  Users,
  FileText,
  ChevronDown,
  ExternalLink,
  ArrowLeft,
  Stethoscope,
  Pill,
  Activity,
  Eye,
  Ear,
} from "lucide-react";

interface PlanType {
  id: string;
  name: string;
  icon: React.ReactNode;
  isPopular?: boolean;
}

interface PlanData {
  title: string;
  subtitle: string;
  description: string;
  videoUrl: string; // Will be replaced with Firebase storage URLs
  keyInfo: {
    details?: Array<{ label: string; value: string; highlight?: boolean }>;
    premiums?: Array<{ label: string; value: string; highlight?: boolean }>;
    deductibles?: Array<{ label: string; value: string; highlight?: boolean }>;
    costs?: Array<{ label: string; value: string; highlight?: boolean }>;
    benefits?: Array<{ label: string; value: string; highlight?: boolean }>;
  };
  ctaText: string;
  ctaUrl: string;
}

interface ResourceArticle {
  title: string;
  description: string;
  readTime: string;
  url: string;
}

const originalMedicarePlans: PlanType[] = [
  { id: "plan-g", name: "Plan G", icon: <Shield className="w-4 h-4" />, isPopular: true },
  { id: "plan-f", name: "Plan F", icon: <Shield className="w-4 h-4" /> },
  { id: "plan-n", name: "Plan N", icon: <Shield className="w-4 h-4" /> },
];

const originalMedicareAddOns: PlanType[] = [
  { id: "drug-plan", name: "Drug Plan (Part D)", icon: <Pill className="w-4 h-4" /> },
  { id: "cancer-plan", name: "Cancer Plan", icon: <Activity className="w-4 h-4" /> },
  { id: "dental-vision", name: "Dental, Vision & Hearing", icon: <Eye className="w-4 h-4" /> },
];

const advantagePlans: PlanType[] = [
  { id: "ppo", name: "PPO", icon: <Heart className="w-4 h-4" />, isPopular: true },
  { id: "hmo", name: "HMO", icon: <Heart className="w-4 h-4" /> },
  { id: "c-snp", name: "C-SNP", icon: <Heart className="w-4 h-4" /> },
  { id: "d-snp", name: "D-SNP", icon: <Heart className="w-4 h-4" /> },
];

const advantageAddOns: PlanType[] = [
  { id: "cancer-insurance", name: "Cancer Insurance", icon: <Activity className="w-4 h-4" /> },
  { id: "short-term", name: "Short Term Care", icon: <Stethoscope className="w-4 h-4" /> },
  { id: "hospital-indemnity", name: "Hospital Indemnity", icon: <Shield className="w-4 h-4" /> },
];

const planData: Record<string, PlanData> = {
  // Original Medicare Plans
  "plan-g": {
    title: "MEDIGAP PLAN G",
    subtitle: "Explained in 5 minutes!",
    description: "Plan G helps pay for most out-of-pocket costs left by Original Medicare, like copays, coinsurance, and hospital costs. Plan G covers everything except the Medicare Part B deductible. You can see any doctor that accepts Medicare, and you don't need referrals. It's a good choice for people who want predictable costs and freedom to choose providers.",
    videoUrl: "/placeholder-video.mp4",
    keyInfo: {
      benefits: [
        { label: "Use Any Doctor", value: "✓", highlight: true },
        { label: "Visit Any Hospital", value: "✓", highlight: true },
        { label: "Exclusive Cancer Centers", value: "✓", highlight: true },
      ],
      costs: [
        { label: "Part B Premium", value: "$185/mo *" },
        { label: "Plan G Premium", value: "Varies" },
        { label: "Copays", value: "None" },
        { label: "Deductibles", value: "$257/yr" },
      ],
      details: [
        { label: "Dental, Vision, Hearing", value: "Separate" },
        { label: "Health Questions", value: "Yes" },
      ],
    },
    ctaText: "Get Instant Quotes Online",
    ctaUrl: "/dashboard/quotes",
  },
  "original-medicare": {
    title: "ORIGINAL MEDICARE",
    subtitle: "Explained in 5 minutes!",
    description: "Original Medicare is government health insurance for people 65+ and those with disabilities. It includes hospital (Part A) and medical (Part B) coverage but only pays 80% of costs.",
    videoUrl: "/placeholder-video.mp4",
    keyInfo: {
      details: [
        { label: "Original Medicare", value: "Part A + Part B" },
        { label: "Part A", value: "Hospital Coverage" },
        { label: "Part B", value: "Medical Coverage" },
        { label: "Part D", value: "Prescription Drug Plan" },
        { label: "Part C", value: "Medicare Advantage" },
      ],
      premiums: [
        { label: "Part A Premium", value: "$0 *" },
        { label: "Part B Premium", value: "$185/mo *" },
      ],
      deductibles: [
        { label: "Part A Deductible", value: "$1,676 *" },
        { label: "Part B Deductible", value: "$257/yr *" },
      ],
    },
    ctaText: "Apply for Original Medicare",
    ctaUrl: "https://www.medicare.gov",
  },
  // Medicare Advantage Plans
  "medicare-advantage": {
    title: "MEDICARE ADVANTAGE",
    subtitle: "Explained in 5 minutes!",
    description: "Medicare Advantage is a Medicare-approved plan from a private company that covers hospital, medical, and often prescription drug costs. These plans may also offer extra benefits, like dental or vision, and have a yearly cap on out-of-pocket costs.",
    videoUrl: "/placeholder-video.mp4",
    keyInfo: {
      costs: [
        { label: "Part B Premium", value: "$185/mo *" },
        { label: "Copays", value: "Varies", highlight: true },
        { label: "Deductibles", value: "Varies", highlight: true },
        { label: "Skilled Nursing", value: "Varies", highlight: true },
        { label: "Hospitalization Cost", value: "Varies" },
        { label: "Cancer", value: "20%" },
      ],
      benefits: [
        { label: "Dental, Vision, Hearing", value: "Most", highlight: true },
      ],
      deductibles: [
        { label: "Networks", value: "Varies", highlight: true },
        { label: "Prior Authorization", value: "Varies", highlight: true },
      ],
    },
    ctaText: "Get Medicare Advantage",
    ctaUrl: "/dashboard/health-quotes",
  },
};

const resourceArticles: ResourceArticle[] = [
  {
    title: "Drug Plans Explained",
    description: "Learn the basics of Medicare Part D a.k.a. PDP.",
    readTime: "11 min read",
    url: "/dashboard/education/drug-plans",
  },
  {
    title: "Avoiding Penalties",
    description: "Avoid extra costs by signing up for Medicare on time.",
    readTime: "4 min read",
    url: "/dashboard/education/penalties",
  },
  {
    title: "Enrollment Periods",
    description: "Know when to sign up and make changes to your Medicare.",
    readTime: "4 min read",
    url: "/dashboard/education/enrollment",
  },
];

export default function ComparePlansPage() {
  const router = useRouter();
  const [isAdvantage, setIsAdvantage] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("original-medicare");
  const [showResources, setShowResources] = useState(false);

  const currentPlans = isAdvantage ? advantagePlans : originalMedicarePlans;
  const currentAddOns = isAdvantage ? advantageAddOns : originalMedicareAddOns;
  const currentData = planData[selectedPlan] || planData[isAdvantage ? "medicare-advantage" : "original-medicare"];
  
  const themeColors = {
    primary: isAdvantage ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700",
    secondary: isAdvantage ? "bg-red-50 border-red-200 text-red-800" : "bg-blue-50 border-blue-200 text-blue-800",
    sidebar: isAdvantage ? "bg-red-600" : "bg-blue-600",
    gradient: isAdvantage ? "from-red-900 to-purple-900" : "from-blue-900 to-purple-900",
    accent: isAdvantage ? "text-red-600" : "text-blue-600",
    button: isAdvantage ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700",
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const resetToMain = () => {
    setSelectedPlan(isAdvantage ? "medicare-advantage" : "original-medicare");
  };

  const handleBackToDashboard = () => {
    router.back();
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 flex overflow-hidden">
        {/* Custom Sidebar for Compare Plans - Matching Main Sidebar Style */}
        <Sidebar className="w-80">
          <SidebarRail />
          <SidebarContent className="flex flex-col justify-between">
            <div>
              <SidebarHeader>
                <Logo />
              </SidebarHeader>
              
              {/* Back Button */}
              <div className="px-3 pb-2">
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={handleBackToDashboard} tooltip="Back to Dashboard">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </div>
              
              <SidebarMenu>
                {/* Plan Types Section */}
                <div className="px-3 py-2">
                  <h3 className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
                    {isAdvantage ? "PLAN TYPES" : "MEDIGAP PLANS"}
                  </h3>
                  {currentPlans.map((plan) => (
                    <SidebarMenuItem key={plan.id}>
                      <SidebarMenuButton 
                        onClick={() => handlePlanSelect(plan.id)}
                        isActive={selectedPlan === plan.id}
                        tooltip={plan.name}
                      >
                        {plan.icon}
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
                    POPULAR ADD-ONS
                  </h3>
                  {currentAddOns.map((addon) => (
                    <SidebarMenuItem key={addon.id}>
                      <SidebarMenuButton 
                        onClick={() => handlePlanSelect(addon.id)}
                        isActive={selectedPlan === addon.id}
                        tooltip={addon.name}
                      >
                        {addon.icon}
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
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-8">
            
            {/* Page Header with Toggle */}
            <div className="text-center space-y-6">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                Compare Medicare Plans
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Choose the best Medicare option for your needs. Compare Original Medicare with Medigap plans or explore Medicare Advantage options.
              </p>
              
              {/* Plan Type Toggle */}
              <div className="flex items-center justify-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm max-w-md mx-auto">
                <span className={`font-semibold ${!isAdvantage ? themeColors.accent : 'text-gray-500'}`}>
                  Original
                </span>
                <Switch
                  checked={isAdvantage}
                  onCheckedChange={(checked) => {
                    setIsAdvantage(checked);
                    resetToMain();
                  }}
                  className="data-[state=checked]:bg-red-600 data-[state=unchecked]:bg-blue-600"
                />
                <span className={`font-semibold ${isAdvantage ? themeColors.accent : 'text-gray-500'}`}>
                  Advantage
                </span>
              </div>
            </div>

            {/* Video and Description Section */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
              
              {/* Video and Description - Takes up 3 columns on XL screens */}
              <div className="xl:col-span-3 space-y-6">
                
                {/* Video Player */}
                <Card className="overflow-hidden">
                  <div className="relative bg-black aspect-video">
                    <div className={`absolute inset-0 bg-gradient-to-r ${themeColors.gradient} flex items-center justify-center`}>
                      <div className="text-center text-white p-6">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">{currentData.title}</h2>
                        <div className="inline-block bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium mb-4">
                          {currentData.subtitle}
                        </div>
                        <div className="flex items-center justify-center space-x-4 text-white/80">
                          <Play className="w-6 h-6" />
                          <span>0:00 / 0:36</span>
                          <div className="flex space-x-2">
                            <button className="hover:text-white"><Info className="w-5 h-5" /></button>
                            <button className="hover:text-white"><ExternalLink className="w-5 h-5" /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Description */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">
                      What is {isAdvantage ? "Medicare Advantage" : selectedPlan === "original-medicare" ? "Original Medicare" : "Plan G"}?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {currentData.description}
                    </p>
                  </CardContent>
                </Card>

                {/* CTA Button */}
                <Button className={`w-full ${themeColors.button} text-white py-4 text-lg font-semibold`}>
                  {currentData.ctaText}
                </Button>
              </div>

              {/* Key Information Sidebar - Takes up 1 column on XL screens */}
              <div className="xl:col-span-1">
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Key Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    
                    {/* Benefits */}
                    {currentData.keyInfo.benefits && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Benefits</h4>
                        <div className="space-y-2">
                          {currentData.keyInfo.benefits.map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Info className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                              </div>
                              {item.highlight ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <span className="text-sm font-medium">{item.value}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Costs */}
                  {currentData.keyInfo.costs && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Costs</h4>
                      <div className="space-y-2">
                        {currentData.keyInfo.costs.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Info className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {item.highlight && <Check className="w-4 h-4 text-green-500" />}
                              <span className="text-sm font-medium">{item.value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Details */}
                  {currentData.keyInfo.details && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Details</h4>
                      <div className="space-y-2">
                        {currentData.keyInfo.details.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Info className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                            </div>
                            <span className="text-sm font-medium">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Premiums */}
                  {currentData.keyInfo.premiums && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Premiums</h4>
                      <div className="space-y-2">
                        {currentData.keyInfo.premiums.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Info className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                            </div>
                            <span className="text-sm font-medium">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Deductibles */}
                  {currentData.keyInfo.deductibles && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Deductibles</h4>
                      <div className="space-y-2">
                        {currentData.keyInfo.deductibles.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Info className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {item.highlight && <Check className="w-4 h-4 text-green-500" />}
                              <span className="text-sm font-medium">{item.value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-gray-500 italic">
                    * May vary based on individual situations
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Helpful Resources Section */}
          <Card>
            <CardHeader>
              <button
                onClick={() => setShowResources(!showResources)}
                className="w-full flex items-center justify-between text-left"
              >
                <CardTitle className="text-xl">Helpful Resources</CardTitle>
                <ChevronDown className={`w-5 h-5 transition-transform ${showResources ? 'rotate-180' : ''}`} />
              </button>
            </CardHeader>
            
            {showResources && (
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {resourceArticles.map((article, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 mb-1">
                              <span>Article</span>
                              <Clock className="w-3 h-3" />
                              <span>{article.readTime}</span>
                            </div>
                          </div>
                        </div>
                        
                        <h3 className="font-semibold text-lg mb-2">{article.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{article.description}</p>
                        
                        <Button variant="link" className="p-0 h-auto text-blue-600 dark:text-blue-400">
                          Learn More <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
    </SidebarProvider>
  );
}
