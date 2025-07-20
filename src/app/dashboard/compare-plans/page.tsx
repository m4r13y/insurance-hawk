
"use client";

import React, { useState } from "react";
import { resourcesList } from "@/resources/resourcesList";
import type { ResourceCard } from "@/resources/resourcesList";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";


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
    videoUrl: "https://www.youtube.com/embed/7o3q3med9Dw",
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
  "plan-f": {
    title: "MEDIGAP PLAN F",
    subtitle: "Explained in 5 minutes!",
    description: "Plan F covers all gaps left by Original Medicare, including copays, coinsurance, and deductibles. You can see any doctor that accepts Medicare, and you don't need referrals. Plan F is only available to those who became eligible for Medicare before January 1, 2020.",
    videoUrl: "https://www.youtube.com/embed/7o3q3med9Dw",
    keyInfo: {
      benefits: [
        { label: "Use Any Doctor", value: "✓", highlight: true },
        { label: "Visit Any Hospital", value: "✓", highlight: true },
        { label: "No Out-of-Pocket Costs", value: "✓", highlight: true },
      ],
      costs: [
        { label: "Part B Premium", value: "$185/mo *" },
        { label: "Plan F Premium", value: "Varies" },
        { label: "Copays", value: "None" },
        { label: "Deductibles", value: "$0" },
      ],
      details: [
        { label: "Dental, Vision, Hearing", value: "Separate" },
        { label: "Health Questions", value: "Yes" },
      ],
    },
    ctaText: "Get Plan F Quotes",
    ctaUrl: "/dashboard/quotes",
  },
  "plan-n": {
    title: "MEDIGAP PLAN N",
    subtitle: "Explained in 5 minutes!",
    description: "Plan N offers lower premiums than Plan G or F, but you may pay small copays for doctor visits and emergency room trips. It covers most out-of-pocket costs except the Part B deductible and excess charges.",
    videoUrl: "https://www.youtube.com/embed/7o3q3med9Dw",
    keyInfo: {
      benefits: [
        { label: "Use Any Doctor", value: "✓", highlight: true },
        { label: "Visit Any Hospital", value: "✓", highlight: true },
      ],
      costs: [
        { label: "Part B Premium", value: "$185/mo *" },
        { label: "Plan N Premium", value: "Varies" },
        { label: "Copays", value: "Up to $20" },
        { label: "Deductibles", value: "$257/yr" },
      ],
      details: [
        { label: "Dental, Vision, Hearing", value: "Separate" },
        { label: "Health Questions", value: "Yes" },
      ],
    },
    ctaText: "Get Plan N Quotes",
    ctaUrl: "/dashboard/quotes",
  },
  // Original Medicare Add-Ons
  "drug-plan": {
    title: "DRUG PLAN (PART D)",
    subtitle: "Explained in 5 minutes!",
    description: "Medicare Part D helps cover the cost of prescription drugs. Plans vary by coverage, pharmacy network, and formulary. You can choose a plan that fits your medication needs.",
    videoUrl: "https://www.youtube.com/embed/7o3q3med9Dw",
    keyInfo: {
      benefits: [
        { label: "Covers Most Prescriptions", value: "✓", highlight: true },
      ],
      costs: [
        { label: "Monthly Premium", value: "Varies" },
        { label: "Annual Deductible", value: "Up to $545" },
        { label: "Copays", value: "Varies" },
      ],
      details: [
        { label: "Preferred Pharmacies", value: "Yes" },
        { label: "Coverage Gap", value: "Possible" },
      ],
    },
    ctaText: "Get Drug Plan Quotes",
    ctaUrl: "/dashboard/quotes",
  },
  "cancer-plan": {
    title: "CANCER PLAN",
    subtitle: "Explained in 5 minutes!",
    description: "Cancer Plans provide a lump-sum cash benefit if you are diagnosed with cancer. This money can be used for treatment, travel, or any expenses you choose. It helps cover costs not paid by Medicare or other insurance.",
    videoUrl: "https://www.youtube.com/embed/7o3q3med9Dw",
    keyInfo: {
      benefits: [
        { label: "Lump-Sum Benefit", value: "✓", highlight: true },
        { label: "Use Anywhere", value: "✓", highlight: true },
      ],
      costs: [
        { label: "Monthly Premium", value: "Varies" },
        { label: "No Deductible", value: "✓", highlight: true },
      ],
      details: [
        { label: "Pays Directly to You", value: "Yes" },
        { label: "No Network Restrictions", value: "Yes" },
      ],
    },
    ctaText: "Get Cancer Plan Quotes",
    ctaUrl: "/dashboard/quotes",
  },
  "dental-vision": {
    title: "DENTAL, VISION & HEARING",
    subtitle: "Explained in 5 minutes!",
    description: "Dental, Vision & Hearing plans help pay for routine exams, cleanings, eyeglasses, hearing aids, and more. These benefits are not covered by Original Medicare or Medigap.",
    videoUrl: "https://www.youtube.com/embed/7o3q3med9Dw",
    keyInfo: {
      benefits: [
        { label: "Dental Coverage", value: "✓", highlight: true },
        { label: "Vision Coverage", value: "✓", highlight: true },
        { label: "Hearing Coverage", value: "✓", highlight: true },
      ],
      costs: [
        { label: "Monthly Premium", value: "Varies" },
        { label: "Copays", value: "Varies" },
      ],
      details: [
        { label: "Choose Any Provider", value: "Yes" },
        { label: "No Waiting Periods", value: "On some plans" },
      ],
    },
    ctaText: "Get Dental/Vision/Hearing Quotes",
    ctaUrl: "/dashboard/quotes",
  },
  // Advantage Plans
  "ppo": {
    title: "PPO (Preferred Provider Organization)",
    subtitle: "Flexible Medicare Advantage Option",
    description: "PPO plans offer flexibility to see any doctor or specialist, in or out of network, often without referrals. You pay less when using network providers, but you can go out-of-network for a higher cost. PPOs may include extra benefits like dental, vision, and hearing.",
    videoUrl: "https://www.youtube.com/embed/7o3q3med9Dw",
    keyInfo: {
      benefits: [
        { label: "See Any Doctor (Higher Cost Out-of-Network)", value: "✓", highlight: true },
        { label: "No Referral Needed", value: "✓", highlight: true },
        { label: "Extra Benefits (Dental, Vision, Hearing)", value: "Most" },
      ],
      costs: [
        { label: "Monthly Premium", value: "$0-$50" },
        { label: "Copays", value: "Varies" },
        { label: "Out-of-Network Cost", value: "Higher" },
      ],
      details: [
        { label: "Network Size", value: "Large" },
        { label: "Prior Authorization", value: "Sometimes" },
      ],
    },
    ctaText: "Get PPO Quotes",
    ctaUrl: "/dashboard/health-quotes",
  },
  "hmo": {
    title: "HMO (Health Maintenance Organization)",
    subtitle: "Coordinated Medicare Advantage Care",
    description: "HMO plans require you to use network doctors and hospitals except in emergencies. You usually need a referral to see a specialist. HMOs often have lower costs and may include extra benefits like dental, vision, and hearing.",
    videoUrl: "https://www.youtube.com/embed/7o3q3med9Dw",
    keyInfo: {
      benefits: [
        { label: "Coordinated Care", value: "✓", highlight: true },
        { label: "Extra Benefits (Dental, Vision, Hearing)", value: "Most" },
      ],
      costs: [
        { label: "Monthly Premium", value: "$0-$30" },
        { label: "Copays", value: "Low" },
      ],
      details: [
        { label: "Referral Needed", value: "Yes" },
        { label: "Network Size", value: "Medium-Large" },
      ],
    },
    ctaText: "Get HMO Quotes",
    ctaUrl: "/dashboard/health-quotes",
  },
  "c-snp": {
    title: "C-SNP (Chronic Condition Special Needs Plan)",
    subtitle: "Tailored for Chronic Conditions",
    description: "C-SNPs are designed for people with specific chronic conditions (like diabetes, heart disease, or COPD). These plans offer specialized provider networks, care coordination, and benefits tailored to your condition.",
    videoUrl: "https://www.youtube.com/embed/7o3q3med9Dw",
    keyInfo: {
      benefits: [
        { label: "Condition-Specific Care", value: "✓", highlight: true },
        { label: "Care Coordination", value: "✓", highlight: true },
        { label: "Extra Benefits", value: "Varies" },
      ],
      costs: [
        { label: "Monthly Premium", value: "$0-$40" },
        { label: "Copays", value: "Varies" },
      ],
      details: [
        { label: "Eligibility", value: "Specific Chronic Condition" },
        { label: "Network Size", value: "Varies" },
      ],
    },
    ctaText: "Get C-SNP Quotes",
    ctaUrl: "/dashboard/health-quotes",
  },
  "d-snp": {
    title: "D-SNP (Dual Eligible Special Needs Plan)",
    subtitle: "For Medicare & Medicaid Eligible",
    description: "D-SNPs are for people who qualify for both Medicare and Medicaid. These plans coordinate benefits from both programs, often with low or no out-of-pocket costs and extra support services.",
    videoUrl: "https://www.youtube.com/embed/7o3q3med9Dw",
    keyInfo: {
      benefits: [
        { label: "Medicare & Medicaid Coordination", value: "✓", highlight: true },
        { label: "Extra Support Services", value: "✓", highlight: true },
        { label: "Extra Benefits", value: "Most" },
      ],
      costs: [
        { label: "Monthly Premium", value: "$0" },
        { label: "Copays", value: "Low/None" },
      ],
      details: [
        { label: "Eligibility", value: "Medicare & Medicaid" },
        { label: "Network Size", value: "Varies" },
      ],
    },
    ctaText: "Get D-SNP Quotes",
    ctaUrl: "/dashboard/health-quotes",
  },
  // Advantage Add-Ons
  "cancer-insurance": {
    title: "CANCER INSURANCE",
    subtitle: "Lump-Sum Protection for Cancer Diagnosis",
    description: "Cancer Insurance pays a lump-sum cash benefit if you are diagnosed with cancer. Use the money for treatment, travel, or any expenses. It helps cover costs not paid by Medicare or Advantage plans.",
    videoUrl: "https://www.youtube.com/embed/7o3q3med9Dw",
    keyInfo: {
      benefits: [
        { label: "Lump-Sum Benefit", value: "✓", highlight: true },
        { label: "Pays Directly to You", value: "✓", highlight: true },
        { label: "No Network Restrictions", value: "✓", highlight: true },
      ],
      costs: [
        { label: "Monthly Premium", value: "Varies" },
        { label: "No Deductible", value: "✓", highlight: true },
      ],
      details: [
        { label: "Use Anywhere", value: "Yes" },
        { label: "Waiting Period", value: "Possible" },
      ],
    },
    ctaText: "Get Cancer Insurance Quotes",
    ctaUrl: "/dashboard/health-quotes",
  },
  "short-term": {
    title: "SHORT TERM CARE",
    subtitle: "Coverage for Short Recovery Periods",
    description: "Short Term Care plans help pay for recovery after illness, injury, or surgery. They cover skilled nursing, rehabilitation, and home health care for a limited time, filling gaps left by Medicare or Advantage plans.",
    videoUrl: "https://www.youtube.com/embed/7o3q3med9Dw",
    keyInfo: {
      benefits: [
        { label: "Skilled Nursing Coverage", value: "✓", highlight: true },
        { label: "Rehabilitation", value: "✓", highlight: true },
        { label: "Home Health Care", value: "✓", highlight: true },
      ],
      costs: [
        { label: "Monthly Premium", value: "Varies" },
        { label: "Daily Benefit", value: "$100-$300" },
      ],
      details: [
        { label: "Benefit Period", value: "Up to 360 days" },
        { label: "Waiting Period", value: "Possible" },
      ],
    },
    ctaText: "Get Short Term Care Quotes",
    ctaUrl: "/dashboard/health-quotes",
  },
  "hospital-indemnity": {
    title: "HOSPITAL INDEMNITY",
    subtitle: "Cash Benefit for Hospital Stays",
    description: "Hospital Indemnity plans pay a fixed cash benefit for each day you are hospitalized. Use the money for any expenses, including deductibles, copays, or travel. These plans help cover costs not paid by Medicare or Advantage plans.",
    videoUrl: "https://www.youtube.com/embed/7o3q3med9Dw",
    keyInfo: {
      benefits: [
        { label: "Daily Hospital Benefit", value: "✓", highlight: true },
        { label: "Pays Directly to You", value: "✓", highlight: true },
        { label: "No Network Restrictions", value: "✓", highlight: true },
      ],
      costs: [
        { label: "Monthly Premium", value: "Varies" },
        { label: "Daily Benefit", value: "$100-$500" },
      ],
      details: [
        { label: "Benefit Period", value: "Up to 365 days" },
        { label: "Waiting Period", value: "Possible" },
      ],
    },
    ctaText: "Get Hospital Indemnity Quotes",
    ctaUrl: "/dashboard/health-quotes",
  },
  "original-medicare": {
    title: "ORIGINAL MEDICARE",
    subtitle: "Explained in 5 minutes!",
    description: "Original Medicare is government health insurance for people 65+ and those with disabilities. It includes hospital (Part A) and medical (Part B) coverage but only pays 80% of costs.",
    videoUrl: "https://www.youtube.com/embed/7o3q3med9Dw",
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
    videoUrl: "https://www.youtube.com/embed/7o3q3med9Dw",
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

// Dynamically filter resources for the selected plan/add-on
function getRelevantResources(selectedPlan: string, isAdvantage: boolean) {
  const planMap: Record<string, keyof ResourceCard['products']> = {
    'plan-g': 'planG',
    'plan-n': 'planN',
    'plan-f': 'planF',
    'drug-plan': 'pdp',
    'cancer-plan': 'cancer',
    'dental-vision': 'dvh',
    'ppo': 'ppo',
    'hmo': 'hmo',
    'c-snp': 'snp',
    'd-snp': 'snp',
    'cancer-insurance': 'cancer',
    'short-term': 'hip',
    'hospital-indemnity': 'hip',
    'original-medicare': 'ogMedicare',
    'medicare-advantage': 'advantage',
  };
  let key = planMap[selectedPlan];
  if (!key) key = isAdvantage ? 'advantage' : 'ogMedicare';
  return resourcesList.filter(r => r.products[key as keyof ResourceCard['products']]);
}

export default function ComparePlansPage() {
  const router = useRouter();
  const [isAdvantage, setIsAdvantage] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("original-medicare");

  const currentPlans = isAdvantage ? advantagePlans : originalMedicarePlans;
  const currentAddOns = isAdvantage ? advantageAddOns : originalMedicareAddOns;
  const currentData = planData[selectedPlan] || planData[isAdvantage ? "medicare-advantage" : "original-medicare"];
  const relevantResources = getRelevantResources(selectedPlan, isAdvantage);
  
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

              {/* Back Button - moved above the toggle */}
              <div className="px-3 pt-4 pb-2">
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={handleBackToDashboard} tooltip="Back to Dashboard">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </div>

              {/* Plan Type Toggle - now below the back button */}
              <div className="px-3 pb-2">
                <div className="flex items-center justify-center space-x-4 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <span className={`font-semibold text-sm ${!isAdvantage ? themeColors.accent : 'text-gray-500'}`}>
                    Original
                  </span>
                  <Switch
                    checked={isAdvantage}
                    onCheckedChange={(checked) => {
                      setIsAdvantage(checked);
                      setSelectedPlan(checked ? "medicare-advantage" : "original-medicare");
                    }}
                    className="data-[state=checked]:bg-red-600 data-[state=unchecked]:bg-blue-600"
                  />
                  <span className={`font-semibold text-sm ${isAdvantage ? themeColors.accent : 'text-gray-500'}`}>
                    Advantage
                  </span>
                </div>
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
            {/* Video and Description Section - More Compact */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Video and Description - Takes up 1 column (50%) on large screens */}
              <div className="space-y-4">
                {/* Video Player and Content in single card */}
                <Card className="overflow-hidden flex flex-col h-full">
                  {/* YouTube Video Embed */}
                  <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
                    <iframe
                      width="100%"
                      height="100%"
                      src={currentData.videoUrl}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full rounded-t"
                    ></iframe>
                  </div>
                  {/* Description and Button at the bottom, spaced evenly */}
                  <CardContent className="flex flex-col flex-grow justify-between p-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        {currentData.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                        {currentData.description}
                      </p>
                    </div>
                    <Button className={`w-full ${themeColors.button} text-white py-3 text-base font-semibold mt-4`}>
                      {currentData.ctaText}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Key Information Sidebar - Table Style */}
              <div>
                <Card className="sticky top-4">
                  <CardHeader className="p-0 align-top">
                    <CardTitle className="text-lg m-0">Key Information</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 px-0">
                    {/* Details Section */}
                    {currentData.keyInfo.details && (
                      <Table>
                        <TableCaption className="bg-gray-50 border-t border-gray-200 py-2 px-4 text-sm font-bold text-gray-800 text-start dark:bg-neutral-700 dark:border-neutral-700 dark:text-white m-0 p-0">
                          Details
                        </TableCaption>
                        <TableBody className="divide-y divide-gray-200 dark:divide-neutral-700">
                          {currentData.keyInfo.details.map((item, index) => (
                            <TableRow key={index} className="border-t border-gray-200 dark:border-neutral-700">
                              <TableHead className="py-2.5 px-4 text-sm font-normal text-gray-600 text-start dark:text-neutral-400" scope="row">
                                {item.label}
                              </TableHead>
                              <TableCell className="py-2.5 px-4 text-right">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {item.value}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                    {/* Premiums Section */}
                    {currentData.keyInfo.premiums && (
                      <Table>
                        <TableCaption className="bg-gray-50 border-t border-gray-200 py-2 px-4 text-sm font-bold text-gray-800 text-start dark:bg-neutral-700 dark:border-neutral-700 dark:text-white">
                          Premiums
                        </TableCaption>
                        <TableBody className="divide-y divide-gray-200 dark:divide-neutral-700">
                          {currentData.keyInfo.premiums.map((item, index) => (
                            <TableRow key={index} className="border-t border-gray-200 dark:border-neutral-700">
                              <TableHead className="py-2.5 px-4 text-sm font-normal text-gray-600 text-start dark:text-neutral-400" scope="row">
                                {item.label}
                              </TableHead>
                              <TableCell className="py-2.5 px-4 text-right">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {item.value}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                    {/* Deductibles Section */}
                    {currentData.keyInfo.deductibles && (
                      <Table>
                        <TableCaption className="bg-gray-50 border-t border-gray-200 py-2 px-4 text-sm font-bold text-gray-800 text-start dark:bg-neutral-700 dark:border-neutral-700 dark:text-white">
                          Deductibles
                        </TableCaption>
                        <TableBody className="divide-y divide-gray-200 dark:divide-neutral-700">
                          {currentData.keyInfo.deductibles.map((item, index) => (
                            <TableRow key={index} className="border-t border-gray-200 dark:border-neutral-700">
                              <TableHead className="py-2.5 px-4 text-sm font-normal text-gray-600 text-start dark:text-neutral-400" scope="row">
                                {item.label}
                              </TableHead>
                              <TableCell className="py-2.5 px-4 text-right">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {item.value}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                    {/* Benefits Section */}
                    {currentData.keyInfo.benefits && (
                      <Table>
                        <TableCaption className="bg-gray-50 border-t border-gray-200 py-2 px-4 text-sm font-bold text-gray-800 text-start dark:bg-neutral-700 dark:border-neutral-700 dark:text-white">
                          Benefits
                        </TableCaption>
                        <TableBody className="divide-y divide-gray-200 dark:divide-neutral-700">
                          {currentData.keyInfo.benefits.map((item, index) => (
                            <TableRow key={index} className="border-t border-gray-200 dark:border-neutral-700">
                              <TableHead className="py-2.5 px-4 text-sm font-normal text-gray-600 text-start dark:text-neutral-400" scope="row">
                                {item.label}
                              </TableHead>
                              <TableCell className="py-2.5 px-4 text-right">
                                {item.highlight || item.value === "✓" ? (
                                  <svg className="shrink-0 ml-auto size-5 text-blue-600 dark:text-blue-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"/>
                                  </svg>
                                ) : (
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {item.value}
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                    {/* Costs Section */}
                    {currentData.keyInfo.costs && (
                      <Table>
                        <TableCaption className="bg-gray-50 border-t border-gray-200 py-2 px-4 text-sm font-bold text-gray-800 text-start dark:bg-neutral-700 dark:border-neutral-700 dark:text-white">
                          Costs
                        </TableCaption>
                        <TableBody className="divide-y divide-gray-200 dark:divide-neutral-700">
                          {currentData.keyInfo.costs.map((item, index) => (
                            <TableRow key={index} className="border-t border-gray-200 dark:border-neutral-700">
                              <TableHead className="py-2.5 px-4 text-sm font-normal text-gray-600 text-start dark:text-neutral-400" scope="row">
                                {item.label}
                              </TableHead>
                              <TableCell className="py-2.5 px-4 text-right">
                                <span className={`text-sm font-medium ${item.highlight ? themeColors.accent : 'text-gray-900 dark:text-white'}`}>
                                  {item.value}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                    {/* Footer Note */}
                    <div className="px-4 py-2 bg-gray-50 dark:bg-neutral-800">
                      <p className="text-xs text-gray-500 italic text-center">
                        * May vary based on individual situations
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          {/* Helpful Resources Section - Full Width, Always Visible */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-center">Helpful Resources</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {relevantResources.length === 0 ? (
                    <div className="col-span-3 text-center text-gray-500 py-8">No resources available for this plan/add-on.</div>
                  ) : (
                    relevantResources.map((resource, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 mb-1">
                                <span>{resource.type}</span>
                                <Clock className="w-3 h-3" />
                                <span>{resource.duration} {resource.durationUnit}</span>
                              </div>
                            </div>
                          </div>
                          <h3 className="font-semibold text-base mb-2">{resource.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-xs mb-3 leading-relaxed">{resource.description}</p>
                          <Button
                            variant="link"
                            className="p-0 h-auto text-blue-600 dark:text-blue-400 text-xs"
                            onClick={() => {
                              // Always generate slug from resource title
                              const slug = resource.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                              router.push(`/dashboard/resources/${slug}`);
                            }}
                          >
                            {resource.linkLabel} <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
