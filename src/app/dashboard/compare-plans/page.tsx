

"use client";

import React, { useState } from "react";
import { resourcesList } from "@/resources/resourcesList";
import type { ResourceCard } from "@/resources/resourcesList";
import { useRouter } from "next/navigation";
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
import { HugeiconsIcon } from '@hugeicons/react';
import { 
    ShieldIcon,
    HealthIcon,
    ActivityIcon,
    EyeIcon,
    StethoscopeIcon,
    ArrowLeft01Icon,
    ArrowRight01Icon,
    InformationCircleIcon,
    File01Icon
} from '@hugeicons/core-free-icons';
import { Separator } from "@/components/ui/separator";


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
  videoUrl: string;
  keyInfo: {
    details?: Array<{ label: string; value: string; highlight?: boolean; icon?: React.ElementType }>;
    premiums?: Array<{ label: string; value: string; highlight?: boolean; icon?: React.ElementType }>;
    deductibles?: Array<{ label: string; value: string; highlight?: boolean; icon?: React.ElementType }>;
    costs?: Array<{ label: string; value: string; highlight?: boolean; icon?: React.ElementType }>;
    benefits?: Array<{ label: string; value: string; highlight?: boolean; icon?: React.ElementType }>;
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
  { id: "plan-g", name: "Plan G", icon: <HugeiconsIcon icon={ShieldIcon} className="w-4 h-4" />, isPopular: true },
  { id: "plan-f", name: "Plan F", icon: <HugeiconsIcon icon={ShieldIcon} className="w-4 h-4" /> },
  { id: "plan-n", name: "Plan N", icon: <HugeiconsIcon icon={ShieldIcon} className="w-4 h-4" /> },
];

const originalMedicareAddOns: PlanType[] = [
  { id: "drug-plan", name: "Drug Plan (Part D)", icon: <HugeiconsIcon icon={StethoscopeIcon} className="w-4 h-4" /> },
  { id: "cancer-plan", name: "Cancer Plan", icon: <HugeiconsIcon icon={ActivityIcon} className="w-4 h-4" /> },
  { id: "dental-vision", name: "Dental, Vision & Hearing", icon: <HugeiconsIcon icon={EyeIcon} className="w-4 h-4" /> },
];

const advantagePlans: PlanType[] = [
  { id: "ppo", name: "PPO", icon: <HugeiconsIcon icon={HealthIcon} className="w-4 h-4" />, isPopular: true },
  { id: "hmo", name: "HMO", icon: <HugeiconsIcon icon={HealthIcon} className="w-4 h-4" /> },
  { id: "c-snp", name: "C-SNP", icon: <HugeiconsIcon icon={HealthIcon} className="w-4 h-4" /> },
  { id: "d-snp", name: "D-SNP", icon: <HugeiconsIcon icon={HealthIcon} className="w-4 h-4" /> },
];

const advantageAddOns: PlanType[] = [
  { id: "cancer-insurance", name: "Cancer Insurance", icon: <HugeiconsIcon icon={ActivityIcon} className="w-4 h-4" /> },
  { id: "short-term", name: "Short Term Care", icon: <HugeiconsIcon icon={StethoscopeIcon} className="w-4 h-4" /> },
  { id: "hospital-indemnity", name: "Hospital Indemnity", icon: <HugeiconsIcon icon={ShieldIcon} className="w-4 h-4" /> },
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
        { label: "Use Any Doctor", value: "✓", highlight: true, icon: InformationCircleIcon },
        { label: "Visit Any Hospital", value: "✓", highlight: true, icon: InformationCircleIcon },
        { label: "Exclusive Cancer Centers", value: "✓", highlight: true, icon: InformationCircleIcon },
      ],
      costs: [
        { label: "Part B Premium", value: "$185/mo *", icon: InformationCircleIcon },
        { label: "Plan G Premium", value: "Varies", icon: InformationCircleIcon },
        { label: "Copays", value: "None", icon: InformationCircleIcon },
        { label: "Deductibles", value: "$257/yr", icon: InformationCircleIcon },
      ],
      details: [
        { label: "Dental, Vision, Hearing", value: "Separate", icon: InformationCircleIcon },
        { label: "Health Questions", value: "Yes", icon: InformationCircleIcon },
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
        { label: "Use Any Doctor", value: "✓", highlight: true, icon: InformationCircleIcon },
        { label: "Visit Any Hospital", value: "✓", highlight: true, icon: InformationCircleIcon },
        { label: "No Out-of-Pocket Costs", value: "✓", highlight: true, icon: InformationCircleIcon },
      ],
      costs: [
        { label: "Part B Premium", value: "$185/mo *", icon: InformationCircleIcon },
        { label: "Plan F Premium", value: "Varies", icon: InformationCircleIcon },
        { label: "Copays", value: "None", icon: InformationCircleIcon },
        { label: "Deductibles", value: "$0", icon: InformationCircleIcon },
      ],
      details: [
        { label: "Dental, Vision, Hearing", value: "Separate", icon: InformationCircleIcon },
        { label: "Health Questions", value: "Yes", icon: InformationCircleIcon },
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
        { label: "Use Any Doctor", value: "✓", highlight: true, icon: InformationCircleIcon },
        { label: "Visit Any Hospital", value: "✓", highlight: true, icon: InformationCircleIcon },
      ],
      costs: [
        { label: "Part B Premium", value: "$185/mo *", icon: InformationCircleIcon },
        { label: "Plan N Premium", value: "Varies", icon: InformationCircleIcon },
        { label: "Copays", value: "Up to $20", icon: InformationCircleIcon },
        { label: "Deductibles", value: "$257/yr", icon: InformationCircleIcon },
      ],
      details: [
        { label: "Dental, Vision, Hearing", value: "Separate", icon: InformationCircleIcon },
        { label: "Health Questions", value: "Yes", icon: InformationCircleIcon },
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
        { label: "Covers Most Prescriptions", value: "✓", highlight: true, icon: InformationCircleIcon },
      ],
      costs: [
        { label: "Monthly Premium", value: "Varies", icon: InformationCircleIcon },
        { label: "Annual Deductible", value: "Up to $545", icon: InformationCircleIcon },
        { label: "Copays", value: "Varies", icon: InformationCircleIcon },
      ],
      details: [
        { label: "Preferred Pharmacies", value: "Yes", icon: InformationCircleIcon },
        { label: "Coverage Gap", value: "Possible", icon: InformationCircleIcon },
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
        { label: "Lump-Sum Benefit", value: "✓", highlight: true, icon: InformationCircleIcon },
        { label: "Use Anywhere", value: "✓", highlight: true, icon: InformationCircleIcon },
      ],
      costs: [
        { label: "Monthly Premium", value: "Varies", icon: InformationCircleIcon },
        { label: "No Deductible", value: "✓", highlight: true, icon: InformationCircleIcon },
      ],
      details: [
        { label: "Pays Directly to You", value: "Yes", icon: InformationCircleIcon },
        { label: "No Network Restrictions", value: "Yes", icon: InformationCircleIcon },
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
        { label: "Dental Coverage", value: "✓", highlight: true, icon: InformationCircleIcon },
        { label: "Vision Coverage", value: "✓", highlight: true, icon: InformationCircleIcon },
        { label: "Hearing Coverage", value: "✓", highlight: true, icon: InformationCircleIcon },
      ],
      costs: [
        { label: "Monthly Premium", value: "Varies", icon: InformationCircleIcon },
        { label: "Copays", value: "Varies", icon: InformationCircleIcon },
      ],
      details: [
        { label: "Choose Any Provider", value: "Yes", icon: InformationCircleIcon },
        { label: "No Waiting Periods", value: "On some plans", icon: InformationCircleIcon },
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
        { label: "See Any Doctor (Higher Cost Out-of-Network)", value: "✓", highlight: true, icon: InformationCircleIcon },
        { label: "No Referral Needed", value: "✓", highlight: true, icon: InformationCircleIcon },
        { label: "Extra Benefits (Dental, Vision, Hearing)", value: "Most", icon: InformationCircleIcon },
      ],
      costs: [
        { label: "Monthly Premium", value: "$0-$50", icon: InformationCircleIcon },
        { label: "Copays", value: "Varies", icon: InformationCircleIcon },
        { label: "Out-of-Network Cost", value: "Higher", icon: InformationCircleIcon },
      ],
      details: [
        { label: "Network Size", value: "Large", icon: InformationCircleIcon },
        { label: "Prior Authorization", value: "Sometimes", icon: InformationCircleIcon },
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
        { label: "Coordinated Care", value: "✓", highlight: true, icon: InformationCircleIcon },
        { label: "Extra Benefits (Dental, Vision, Hearing)", value: "Most", icon: InformationCircleIcon },
      ],
      costs: [
        { label: "Monthly Premium", value: "$0-$30", icon: InformationCircleIcon },
        { label: "Copays", value: "Low", icon: InformationCircleIcon },
      ],
      details: [
        { label: "Referral Needed", value: "Yes", icon: InformationCircleIcon },
        { label: "Network Size", value: "Medium-Large", icon: InformationCircleIcon },
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
        { label: "Condition-Specific Care", value: "✓", highlight: true, icon: InformationCircleIcon },
        { label: "Care Coordination", value: "✓", highlight: true, icon: InformationCircleIcon },
        { label: "Extra Benefits", value: "Varies", icon: InformationCircleIcon },
      ],
      costs: [
        { label: "Monthly Premium", value: "$0-$40", icon: InformationCircleIcon },
        { label: "Copays", value: "Varies", icon: InformationCircleIcon },
      ],
      details: [
        { label: "Eligibility", value: "Specific Chronic Condition", icon: InformationCircleIcon },
        { label: "Network Size", value: "Varies", icon: InformationCircleIcon },
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
        { label: "Medicare & Medicaid Coordination", value: "✓", highlight: true, icon: InformationCircleIcon },
        { label: "Extra Support Services", value: "✓", highlight: true, icon: InformationCircleIcon },
        { label: "Extra Benefits", value: "Most", icon: InformationCircleIcon },
      ],
      costs: [
        { label: "Monthly Premium", value: "$0", icon: InformationCircleIcon },
        { label: "Copays", value: "Low/None", icon: InformationCircleIcon },
      ],
      details: [
        { label: "Eligibility", value: "Medicare & Medicaid", icon: InformationCircleIcon },
        { label: "Network Size", value: "Varies", icon: InformationCircleIcon },
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
        { label: "Lump-Sum Benefit", value: "✓", highlight: true, icon: InformationCircleIcon },
        { label: "Pays Directly to You", value: "✓", highlight: true, icon: InformationCircleIcon },
        { label: "No Network Restrictions", value: "✓", highlight: true, icon: InformationCircleIcon },
      ],
      costs: [
        { label: "Monthly Premium", value: "Varies", icon: InformationCircleIcon },
        { label: "No Deductible", value: "✓", highlight: true, icon: InformationCircleIcon },
      ],
      details: [
        { label: "Use Anywhere", value: "Yes", icon: InformationCircleIcon },
        { label: "Waiting Period", value: "Possible", icon: InformationCircleIcon },
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
        { label: "Skilled Nursing Coverage", value: "✓", highlight: true, icon: InformationCircleIcon },
        { label: "Rehabilitation", value: "✓", highlight: true, icon: InformationCircleIcon },
        { label: "Home Health Care", value: "✓", highlight: true, icon: InformationCircleIcon },
      ],
      costs: [
        { label: "Monthly Premium", value: "Varies", icon: InformationCircleIcon },
        { label: "Daily Benefit", value: "$100-$300", icon: InformationCircleIcon },
      ],
      details: [
        { label: "Benefit Period", value: "Up to 360 days", icon: InformationCircleIcon },
        { label: "Waiting Period", value: "Possible", icon: InformationCircleIcon },
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
        { label: "Daily Hospital Benefit", value: "✓", highlight: true, icon: InformationCircleIcon },
        { label: "Pays Directly to You", value: "✓", highlight: true, icon: InformationCircleIcon },
        { label: "No Network Restrictions", value: "✓", highlight: true, icon: InformationCircleIcon },
      ],
      costs: [
        { label: "Monthly Premium", value: "Varies", icon: InformationCircleIcon },
        { label: "Daily Benefit", value: "$100-$500", icon: InformationCircleIcon },
      ],
      details: [
        { label: "Benefit Period", value: "Up to 365 days", icon: InformationCircleIcon },
        { label: "Waiting Period", value: "Possible", icon: InformationCircleIcon },
      ],
    },
    ctaText: "Get Hospital Indemnity Quotes",
    ctaUrl: "/dashboard/health-quotes",
  },
  "original-medicare": {
    title: "ORIGINAL MEDICARE",
    subtitle: "Explained in 5 minutes!",
    description: "Original Medicare is government health insurance for people 65+ and those with disabilities. It includes hospital (Part A) and medical (Part B) coverage but only pays 80% of costs.",
    videoUrl: "https://www.youtube.com/embed/hzP_KO6fwLU",
    keyInfo: {
      details: [
        { label: "Original Medicare", value: "Part A + Part B", icon: InformationCircleIcon },
        { label: "Part A", value: "Hospital Coverage", icon: InformationCircleIcon },
        { label: "Part B", value: "Medical Coverage", icon: InformationCircleIcon },
        { label: "Part D", value: "Prescription Drug Plan", icon: InformationCircleIcon },
        { label: "Part C", value: "Medicare Advantage", icon: InformationCircleIcon },
      ],
      premiums: [
        { label: "Part A Premium", value: "$0 *", icon: InformationCircleIcon },
        { label: "Part B Premium", value: "$185/mo *", icon: InformationCircleIcon },
      ],
      deductibles: [
        { label: "Part A Deductible", value: "$1,676 *", icon: InformationCircleIcon },
        { label: "Part B Deductible", value: "$257/yr *", icon: InformationCircleIcon },
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
        { label: "Part B Premium", value: "$185/mo *", highlight: true, icon: InformationCircleIcon },
        { label: "Copays", value: "Varies", highlight: true, icon: InformationCircleIcon },
        { label: "Deductibles", value: "Varies", highlight: true, icon: InformationCircleIcon },
        { label: "Skilled Nursing", value: "Varies", highlight: true, icon: InformationCircleIcon },
        { label: "Hospitalization Cost", value: "Varies", highlight: true, icon: InformationCircleIcon },
        { label: "Cancer", value: "20%", icon: InformationCircleIcon },
      ],
      benefits: [
        { label: "Dental, Vision, Hearing", value: "Most", highlight: true, icon: InformationCircleIcon },
      ],
      deductibles: [
        { label: "Networks", value: "Varies", highlight: true, icon: InformationCircleIcon },
        { label: "Prior Authorization", value: "Varies", highlight: true, icon: InformationCircleIcon },
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

const KeyInfoSection = ({ title, items }: { title: string, items: PlanData['keyInfo']['details'] }) => {
    if (!items || items.length === 0) return null;
    return (
        <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</h4>
            <div className="space-y-3">
                {items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            {item.icon && <HugeiconsIcon icon={item.icon} className="h-4 w-4" />}
                            <span>{item.label}</span>
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    )
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
                    <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4" />
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
                    <CardTitle>What is {currentData.title}?</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {currentData.description}
                    </p>
                    </CardContent>
                </Card>
                
                {/* CTA Button */}
                <a href={currentData.ctaUrl} className={`block p-4 w-full text-center ${themeColors.button} text-white py-3 text-base font-semibold rounded-xl`}>
                    <div className="flex justify-center items-center">
                        {currentData.ctaText} <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-4 w-4"/>
                    </div>
                </a>
              </div>
              
              {/* Right Column */}
              <div className="lg:col-span-2">
                <Card className="sticky top-8">
                    <CardHeader>
                        <CardTitle>Key Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {currentData.keyInfo.details && currentData.keyInfo.details.length > 0 && (
                           <>
                            <KeyInfoSection title="Details" items={currentData.keyInfo.details} />
                           </>
                        )}
                        
                        {currentData.keyInfo.premiums && currentData.keyInfo.premiums.length > 0 && (
                           <>
                             <Separator/>
                            <KeyInfoSection title="Premiums" items={currentData.keyInfo.premiums} />
                           </>
                        )}

                        {currentData.keyInfo.deductibles && currentData.keyInfo.deductibles.length > 0 && (
                           <>
                            <Separator/>
                            <KeyInfoSection title="Deductibles" items={currentData.keyInfo.deductibles} />
                           </>
                        )}

                        {currentData.keyInfo.costs && currentData.keyInfo.costs.length > 0 && (
                           <>
                            <Separator/>
                            <KeyInfoSection title="Costs" items={currentData.keyInfo.costs} />
                           </>
                        )}
                        
                        {currentData.keyInfo.benefits && currentData.keyInfo.benefits.length > 0 && (
                           <>
                            <Separator/>
                            <KeyInfoSection title="Benefits" items={currentData.keyInfo.benefits} />
                           </>
                        )}
                        
                        <p className="text-xs text-gray-500 italic pt-4">
                        * May vary based on individual situations
                        </p>
                    </CardContent>
                </Card>
              </div>
            </div>


            {/* Helpful Resources Section */}
            <div className="pt-12 mt-8 border-t">
                <h2 className="text-2xl font-bold text-center mb-8">Helpful Resources</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relevantResources.length > 0 ? relevantResources.map((resource, index) => (
                      <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6 flex flex-col h-full">
                           <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                              <HugeiconsIcon icon={File01Icon} className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                                <span>{resource.type}</span>
                                <span>&bull;</span>
                                <span>{resource.duration} {resource.durationUnit}</span>
                              </div>
                            </div>
                          </div>
                          <h3 className="font-semibold text-lg mb-2 flex-grow">{resource.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">{resource.description}</p>
                          <Button
                            variant="link"
                            className="p-0 h-auto text-blue-600 dark:text-blue-400 text-sm self-start mt-auto"
                            onClick={() => {
                              const slug = resource.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                              router.push(`/dashboard/resources/${slug}`);
                            }}
                          >
                            {resource.linkLabel} <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 ml-1" />
                          </Button>
                        </CardContent>
                      </Card>
                    )) : (
                      <div className="col-span-full text-center text-gray-500 py-12">No resources available for this selection.</div>
                    )}
                </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}







