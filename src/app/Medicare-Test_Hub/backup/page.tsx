"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  TokensIcon,
  HeartIcon,
  HeartFilledIcon,
  ActivityLogIcon,
  EyeOpenIcon,
  PersonIcon,
  InfoCircledIcon,
  CheckCircledIcon,
  FileTextIcon,
  VideoIcon,
  StarIcon,
  StarFilledIcon,
  CheckIcon,
  TriangleUpIcon,
  TargetIcon,
  ArchiveIcon,
  BadgeIcon,
  CalendarIcon,
  AvatarIcon,
  DotFilledIcon,
  CrossCircledIcon
} from '@radix-ui/react-icons';
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ProductCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  isPopular?: boolean;
  plans: Plan[];
}

interface Plan {
  id: string;
  name: string;
  description: string;
  isPopular?: boolean;
  premiumRange?: string;
  features: string[];
}

interface KeyFeature {
  title: string;
  description: string;
  icon: React.ElementType;
  highlight?: boolean;
}

const productCategories: ProductCategory[] = [
  {
    id: "original",
    name: "Original Medicare",
    description: "Traditional Medicare Parts A & B",
    icon: CrossCircledIcon, // Medical cross icon for Original Medicare
    plans: [
      {
        id: "part-a",
        name: "Part A (Hospital)",
        description: "Inpatient hospital, skilled nursing, hospice",
        premiumRange: "Free for most",
        features: ["Hospital stays", "Skilled nursing", "Hospice care", "Home health"]
      },
      {
        id: "part-b",
        name: "Part B (Medical)",
        description: "Doctor visits, outpatient care, medical equipment",
        premiumRange: "$174.70/mo",
        features: ["Doctor visits", "Outpatient care", "Preventive services", "Medical equipment"]
      },
      {
        id: "combined",
        name: "Parts A + B",
        description: "Complete Original Medicare coverage",
        isPopular: true,
        premiumRange: "$174.70/mo",
        features: ["Hospital coverage", "Medical coverage", "Nationwide acceptance", "Choice of doctors"]
      }
    ]
  },
  {
    id: "medigap",
    name: "Medigap (Supplement)",
    description: "Fill the gaps in Original Medicare",
    icon: HeartFilledIcon, // Blue heart for Medigap
    isPopular: true,
    plans: [
      {
        id: "plan-g",
        name: "Plan G",
        description: "Most comprehensive coverage, excluding Part B deductible",
        isPopular: true,
        premiumRange: "$150-250/mo",
        features: ["No copays", "Any doctor", "Covers excess charges"]
      },
      {
        id: "plan-n",
        name: "Plan N",
        description: "Lower premiums with small copays",
        premiumRange: "$120-180/mo",
        features: ["Small copays", "Any doctor", "Lower premiums"]
      },
      {
        id: "plan-f",
        name: "Plan F",
        description: "Full coverage (if eligible)",
        premiumRange: "$180-280/mo",
        features: ["No out-of-pocket", "Any doctor", "Pre-2020 eligible only"]
      }
    ]
  },
  {
    id: "advantage",
    name: "Medicare Advantage",
    description: "All-in-one Medicare alternative",
    icon: HeartIcon, // Red heart for Medicare Advantage
    plans: [
      {
        id: "ppo",
        name: "PPO Plans",
        description: "Flexibility to see specialists without referrals",
        isPopular: true,
        premiumRange: "$0-100/mo",
        features: ["Network flexibility", "Often includes extras", "May have copays"]
      },
      {
        id: "hmo",
        name: "HMO Plans",
        description: "Coordinated care through primary care physician",
        premiumRange: "$0-80/mo",
        features: ["Lower costs", "Coordinated care", "Referrals required"]
      }
    ]
  },
  {
    id: "part-d",
    name: "Part D (Drug Plans)",
    description: "Prescription drug coverage",
    icon: DotFilledIcon, // Pill icon for drug plans
    plans: [
      {
        id: "pdp",
        name: "Standalone PDP",
        description: "Add to Original Medicare + Medigap",
        premiumRange: "$20-80/mo",
        features: ["Works with any plan", "Various formularies", "Deductible varies"]
      }
    ]
  },
  {
    id: "supplemental",
    name: "Supplemental Insurance",
    description: "Extra protection beyond Medicare",
    icon: ActivityLogIcon, // Keep activity icon for supplemental
    plans: [
      {
        id: "cancer",
        name: "Cancer Insurance",
        description: "Lump-sum benefits for cancer diagnosis",
        premiumRange: "$30-100/mo",
        features: ["Cash benefits", "Use anywhere", "No network restrictions"]
      },
      {
        id: "dental-vision",
        name: "Dental & Vision",
        description: "Coverage for routine dental and vision care",
        premiumRange: "$25-60/mo",
        features: ["Routine cleanings", "Eye exams", "Frames allowance"]
      }
    ]
  }
];

const keyFeatures: KeyFeature[] = [
  {
    title: "Expert Guidance",
    description: "Licensed agents help you understand your options",
    icon: PersonIcon,
    highlight: true
  },
  {
    title: "Instant Quotes",
    description: "Compare plans and prices in real-time",
    icon: TargetIcon
  },
  {
    title: "No Cost Service",
    description: "Our guidance is always free to you",
    icon: CheckCircledIcon,
    highlight: true
  },
  {
    title: "All Major Carriers",
    description: "Access to top-rated insurance companies",
    icon: StarFilledIcon
  },
  {
    title: "Ongoing Support",
    description: "Help with enrollment and annual reviews",
    icon: HeartFilledIcon
  }
];

const resources = [
  {
    title: "Medicare Basics Guide",
    description: "Understanding Parts A, B, C, and D",
    type: "guide",
    readTime: "8 min read",
    url: "/resources/medicare-basics"
  },
  {
    title: "Enrollment Periods",
    description: "When you can sign up or make changes",
    type: "guide",
    readTime: "5 min read",
    url: "/resources/enrollment-periods"
  },
  {
    title: "Plan Comparison Tool",
    description: "Interactive tool to compare your options",
    type: "tool",
    readTime: "Try now",
    url: "/tools/compare-plans"
  },
  {
    title: "What's New in 2025",
    description: "Latest changes to Medicare benefits",
    type: "article",
    readTime: "6 min read",
    url: "/resources/2025-changes"
  }
];

// Chart data for plan popularity
const planPopularityData = [
  { plan: "Plan G", enrollment: 45, fill: "#3b82f6" }, // blue-500
  { plan: "Advantage", enrollment: 32, fill: "#60a5fa" }, // blue-400
  { plan: "Plan N", enrollment: 15, fill: "#93c5fd" }, // blue-300
  { plan: "Plan F", enrollment: 8, fill: "#bfdbfe" }, // blue-200
];

const planPopularityConfig = {
  enrollment: {
    label: "Enrollment %",
  },
  planG: {
    label: "Plan G",
    color: "#3b82f6",
  },
  advantage: {
    label: "Advantage",
    color: "#60a5fa",
  },
  planN: {
    label: "Plan N",
    color: "#93c5fd",
  },
  planF: {
    label: "Plan F",
    color: "#bfdbfe",
  },
} satisfies ChartConfig;

// Chart data for customer satisfaction
const satisfactionData = [
  { month: "Jan", satisfaction: 4.7 },
  { month: "Feb", satisfaction: 4.8 },
  { month: "Mar", satisfaction: 4.6 },
  { month: "Apr", satisfaction: 4.9 },
  { month: "May", satisfaction: 4.8 },
  { month: "Jun", satisfaction: 4.9 },
];

const satisfactionConfig = {
  satisfaction: {
    label: "Rating",
    color: "#3b82f6",
  },
} satisfies ChartConfig;

export default function MedicareTestHub() {
  const [selectedCategory, setSelectedCategory] = useState<string>("medigap");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const currentCategory = productCategories.find(cat => cat.id === selectedCategory);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-full">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Medicare Hub</Badge>
              <Badge variant="outline">2025 Plans Available</Badge>
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight break-words">
                Find Your Perfect Medicare Plan
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mt-2 break-words">
                Compare all your Medicare options in one place. Expert guidance included.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Responsive Layout */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-full overflow-x-hidden">
        {/* Mobile Category Selector - Improved */}
        <div className="lg:hidden mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Choose Your Medicare Plan</h2>
            <Badge variant="outline" className="text-xs">
              {productCategories.find(cat => cat.id === selectedCategory)?.name}
            </Badge>
          </div>
          
          {/* Mobile Category Tabs - Horizontal Scroll */}
          <div className="relative -mx-4 px-4">
            <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory">
              {productCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setSelectedPlan(null);
                    }}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-full transition-all duration-200 border-2 snap-start min-w-max ${
                      selectedCategory === category.id
                        ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200"
                        : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    <Icon className={`h-4 w-4 flex-shrink-0 ${
                      selectedCategory === category.id ? 'text-white' : 'text-blue-600'
                    }`} />
                    <span className="text-sm font-medium whitespace-nowrap">
                      {category.name}
                    </span>
                    {category.isPopular && selectedCategory !== category.id && (
                      <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0"></div>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Scroll Indicator */}
            <div className="absolute right-4 top-0 bottom-3 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
          </div>
          
          {/* Mobile Category Description */}
          {currentCategory && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {currentCategory.description}
              </p>
            </div>
          )}
        </div>

        {/* Mobile Quick Actions Bar */}
        <div className="lg:hidden mb-6 overflow-x-hidden">
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <Button size="sm" variant="outline" className="flex-shrink-0 text-xs whitespace-nowrap">
              📞 Call Expert
            </Button>
            <Button size="sm" variant="outline" className="flex-shrink-0 text-xs whitespace-nowrap">
              📄 Get Quote
            </Button>
            <Button size="sm" variant="outline" className="flex-shrink-0 text-xs whitespace-nowrap">
              📊 Compare Plans
            </Button>
            <Button size="sm" variant="outline" className="flex-shrink-0 text-xs whitespace-nowrap">
              🎥 Watch Video
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] xl:grid-cols-[320px_1fr_340px] gap-6 lg:gap-8 min-w-0">
          
          {/* Left Sidebar - Product Navigation (Desktop Only) */}
          <div className="hidden lg:block space-y-2">
            <div className="pb-4">
              <h2 className="text-sm font-medium text-muted-foreground mb-3">
                PRODUCT CATEGORIES
              </h2>
              <div className="space-y-1">
                {productCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setSelectedPlan(null);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-md transition-colors ${
                        selectedCategory === category.id
                          ? "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800"
                          : "hover:bg-accent/50 border border-transparent"
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${
                        selectedCategory === category.id 
                          ? 'text-blue-600 dark:text-blue-400'
                          : category.id === 'original' ? 'text-green-600' :
                            category.id === 'medigap' ? 'text-blue-600' :
                            category.id === 'advantage' ? 'text-red-600' :
                            category.id === 'part-d' ? 'text-purple-600' :
                            'text-muted-foreground'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">
                          {category.name}
                        </div>
                      </div>
                      {category.isPopular && (
                        <Badge variant="secondary" className="text-xs px-2 py-0.5">
                          Popular
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator />

            <div className="pt-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                QUICK TOOLS
              </h3>
              <div className="space-y-1">
                <Link
                  href="/tools/premium-estimator"
                  className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent/50"
                >
                  <TokensIcon className="h-4 w-4" />
                  Premium Calculator
                </Link>
                <Link
                  href="/tools/enrollment-checker"
                  className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent/50"
                >
                  <CalendarIcon className="h-4 w-4" />
                  Enrollment Periods
                </Link>
                <Link
                  href="/tools/doctor-finder"
                  className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent/50"
                >
                  <PersonIcon className="h-4 w-4" />
                  Find Doctors
                </Link>
              </div>
            </div>

            <Separator />

            <div className="pt-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                RELATED RESOURCES
              </h3>
              <div className="space-y-2">
                {resources.slice(0, 3).map((resource, index) => (
                  <Link
                    key={index}
                    href={resource.url}
                    className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent/50 transition-colors"
                  >
                    <FileTextIcon className="h-4 w-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs truncate">{resource.title}</div>
                      <div className="text-xs text-muted-foreground">{resource.readTime}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <Separator />

            <div className="pt-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                WHY CHOOSE US
              </h3>
              <div className="space-y-3">
                {keyFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        feature.highlight
                          ? "bg-accent/20 border-accent"
                          : "bg-card border-border/20"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-1.5 rounded-md ${
                          feature.highlight
                            ? "bg-primary text-primary-foreground"
                            : "bg-accent"
                        }`}>
                          <Icon className="h-3 w-3" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-xs">{feature.title}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Center Content Area */}
          <div className="space-y-6 lg:space-y-8">
            {/* Category Header */}
            {currentCategory && (
              <div className="space-y-4 lg:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold">{currentCategory.name}</h2>
                    <p className="text-sm sm:text-base text-muted-foreground hidden sm:block">{currentCategory.description}</p>
                  </div>
                  <Button className="hidden sm:flex items-center gap-2 self-start sm:self-auto">
                    <ArchiveIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">View</span> Quotes
                  </Button>
                </div>

                {/* Mobile Content Tabs */}
                <div className="lg:hidden overflow-x-hidden">
                  <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-4 -mx-1">
                    <button 
                      className="flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors bg-white dark:bg-gray-700 shadow-sm text-blue-600 min-w-0"
                    >
                      <span className="truncate">📹 Overview</span>
                    </button>
                    <button 
                      className="flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors text-gray-600 hover:text-gray-900 min-w-0"
                    >
                      <span className="truncate">📊 Compare</span>
                    </button>
                    <button 
                      className="flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors text-gray-600 hover:text-gray-900 min-w-0"
                    >
                      <span className="truncate">📖 Learn</span>
                    </button>
                  </div>
                </div>

                {/* Video Section - Enhanced for Mobile */}
                <div className="relative">
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                    <iframe
                      src="https://www.youtube.com/embed/7o3q3med9Dw"
                      title="Learn About Medicare"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                    
                    {/* Mobile Video Overlay */}
                    <div className="lg:hidden absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <div className="flex items-center justify-between text-white">
                        <div>
                          <p className="text-sm font-medium">Understanding {currentCategory.name}</p>
                          <p className="text-xs opacity-90">5:30 min • Expert explanation</p>
                        </div>
                        <Button size="sm" variant="secondary" className="text-xs">
                          📱 Fullscreen
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Table Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <FileTextIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline">{currentCategory.name}</span> Comparison
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Compare key features and benefits across plans
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto -mx-2 sm:mx-0">
                      <div className="min-w-[600px] px-2 sm:px-0">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b-2 border-border/60">
                              <th className="text-left py-3 px-2 sm:px-3 font-semibold text-foreground bg-muted/30 text-xs sm:text-sm sticky left-0 z-10">Feature</th>
                              {currentCategory.plans.map((plan) => (
                                <th key={plan.id} className={`text-center py-3 px-2 sm:px-3 font-semibold relative ${
                                  plan.isPopular 
                                    ? 'bg-blue-50 dark:bg-blue-950/20 border-l-2 border-r-2 border-blue-200 dark:border-blue-800' 
                                    : 'bg-muted/10'
                                }`}>
                                  <div className="space-y-1">
                                    <div className="font-bold text-xs sm:text-sm">{plan.name}</div>
                                    {plan.isPopular && (
                                      <Badge variant="default" className="text-xs bg-blue-200">
                                        Popular
                                      </Badge>
                                    )}
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                          <tr className="border-b border-border/30 hover:bg-muted/20">
                            <td className="py-3 px-2 sm:px-3 font-semibold text-foreground bg-muted/30 text-xs sm:text-sm sticky left-0 z-10">
                              Monthly Premium
                            </td>
                            {currentCategory.plans.map((plan) => (
                              <td key={plan.id} className={`py-3 px-2 sm:px-3 text-center ${
                                plan.isPopular ? 'bg-blue-50/50 dark:bg-blue-950/10' : ''
                              }`}>
                                <div className="text-xs sm:text-sm font-bold text-primary">
                                  {plan.premiumRange}
                                </div>
                              </td>
                            ))}
                          </tr>
                          <tr className="border-b border-border/30 hover:bg-muted/20">
                            <td className="py-3 px-2 sm:px-3 font-semibold text-foreground bg-muted/30 text-xs sm:text-sm sticky left-0 z-10">
                              Coverage Type
                            </td>
                            {currentCategory.plans.map((plan) => (
                              <td key={plan.id} className={`py-3 px-2 sm:px-3 text-center ${
                                plan.isPopular ? 'bg-blue-50/50 dark:bg-blue-950/10' : ''
                              }`}>
                                <div className="text-xs leading-relaxed">
                                  {plan.description}
                                </div>
                              </td>
                            ))}
                          </tr>
                          <tr className="border-b border-border/30 hover:bg-muted/20">
                            <td className="py-3 px-2 sm:px-3 font-semibold text-foreground bg-muted/30 text-xs sm:text-sm sticky left-0 z-10">
                              Key Benefits
                            </td>
                            {currentCategory.plans.map((plan) => (
                              <td key={plan.id} className={`py-3 px-2 sm:px-3 ${
                                plan.isPopular ? 'bg-blue-50/50 dark:bg-blue-950/10' : ''
                              }`}>
                                <ul className="space-y-1">
                                  {plan.features.slice(0, 3).map((feature, index) => (
                                    <li key={index} className="flex items-start gap-1 text-xs">
                                      <span className="text-green-600 flex-shrink-0">✓</span>
                                      <span className="leading-relaxed">{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              </td>
                            ))}
                          </tr>
                          <tr className="hover:bg-muted/20">
                            <td className="py-3 px-2 sm:px-3 font-semibold text-foreground bg-muted/30 text-xs sm:text-sm sticky left-0 z-10">
                              Best For
                            </td>
                            {currentCategory.plans.map((plan, planIndex) => (
                              <td key={plan.id} className={`py-3 px-2 sm:px-3 text-center ${
                                plan.isPopular ? 'bg-blue-50/50 dark:bg-blue-950/10' : ''
                              }`}>
                                <div className="text-xs font-medium text-muted-foreground">
                                  {planIndex === 0 && currentCategory.id === 'medigap' && "Comprehensive coverage"}
                                  {planIndex === 1 && currentCategory.id === 'medigap' && "Budget conscious"}
                                  {planIndex === 2 && currentCategory.id === 'medigap' && "Legacy coverage"}
                                  {planIndex === 0 && currentCategory.id === 'advantage' && "Flexibility seekers"}
                                  {planIndex === 1 && currentCategory.id === 'advantage' && "Cost savers"}
                                  {planIndex === 0 && currentCategory.id === 'part-d' && "Original Medicare users"}
                                  {planIndex === 0 && currentCategory.id === 'supplemental' && "Extra protection"}
                                  {planIndex === 1 && currentCategory.id === 'supplemental' && "Routine care"}
                                  {planIndex === 0 && currentCategory.id === 'original' && "Hospital coverage"}
                                  {planIndex === 1 && currentCategory.id === 'original' && "Medical coverage"}
                                  {planIndex === 2 && currentCategory.id === 'original' && "Complete Medicare"}
                                </div>
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Short Article Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileTextIcon className="h-5 w-5" />
                      Understanding {currentCategory.name}
                    </CardTitle>
                    <CardDescription>
                      Essential information to help you make informed decisions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="prose prose-sm max-w-none">
                    {currentCategory.id === 'original' && (
                      <div className="space-y-4">
                        <p>
                          Original Medicare is the traditional fee-for-service health insurance program managed by the federal government. 
                          It consists of Part A (Hospital Insurance) and Part B (Medical Insurance), providing essential coverage for 
                          hospital stays, doctor visits, and medical services.
                        </p>
                        <p>
                          <strong>Part A Coverage:</strong> Hospital insurance covers inpatient hospital stays, skilled nursing facility 
                          care, hospice care, and some home health care. Most people don't pay a premium for Part A if they or their 
                          spouse paid Medicare taxes while working.
                        </p>
                        <p>
                          <strong>Part B Coverage:</strong> Medical insurance covers doctor visits, outpatient care, medical supplies, 
                          preventive services, and durable medical equipment. Part B requires a monthly premium, which is $174.70 
                          for most people in 2025.
                        </p>
                        <p>
                          Original Medicare allows you to see any doctor or specialist who accepts Medicare, giving you nationwide 
                          coverage and flexibility. However, it doesn't cover prescription drugs, so you may want to consider adding 
                          Part D coverage or a Medigap supplement plan.
                        </p>
                      </div>
                    )}
                    {currentCategory.id === 'medigap' && (
                      <div className="space-y-4">
                        <p>
                          Medigap (Medicare Supplement Insurance) is private insurance designed to help pay for costs that Original 
                          Medicare doesn't cover, such as copayments, coinsurance, and deductibles. These standardized plans work 
                          alongside Original Medicare to reduce your out-of-pocket expenses.
                        </p>
                        <p>
                          <strong>Plan G</strong> is currently the most comprehensive plan available to new Medicare beneficiaries, 
                          covering nearly all out-of-pocket costs except the Part B deductible. This makes healthcare costs predictable 
                          and manageable.
                        </p>
                        <p>
                          <strong>Plan N</strong> offers substantial coverage at a lower premium, requiring small copayments for doctor 
                          visits and emergency room visits. It's an excellent choice for those who want comprehensive coverage while 
                          keeping monthly costs lower.
                        </p>
                        <p>
                          All Medigap plans allow you to see any doctor who accepts Medicare, anywhere in the United States. There are 
                          no networks to worry about, and you don't need referrals to see specialists.
                        </p>
                      </div>
                    )}
                    {currentCategory.id === 'advantage' && (
                      <div className="space-y-4">
                        <p>
                          Medicare Advantage (Part C) plans are an alternative way to receive Medicare benefits through private 
                          insurance companies approved by Medicare. These plans combine Parts A and B, and often include Part D 
                          prescription drug coverage and extra benefits.
                        </p>
                        <p>
                          <strong>HMO Plans</strong> typically offer lower costs and coordinated care through a primary care physician. 
                          You'll generally need referrals to see specialists and must use providers within the plan's network, except 
                          for emergency care.
                        </p>
                        <p>
                          <strong>PPO Plans</strong> provide more flexibility, allowing you to see specialists without referrals and 
                          use out-of-network providers (though at higher cost). These plans often cost more but offer greater freedom 
                          in choosing healthcare providers.
                        </p>
                        <p>
                          Many Medicare Advantage plans include extra benefits like dental, vision, hearing aids, wellness programs, 
                          and transportation services. However, you're limited to the plan's network of providers and the coverage 
                          area where you live.
                        </p>
                      </div>
                    )}
                    {currentCategory.id === 'part-d' && (
                      <div className="space-y-4">
                        <p>
                          Medicare Part D provides prescription drug coverage through private insurance companies. If you have Original 
                          Medicare, you can add a standalone Part D plan (PDP) to get prescription drug coverage. Medicare Advantage 
                          plans often include Part D coverage.
                        </p>
                        <p>
                          <strong>Formularies:</strong> Each Part D plan has a formulary (list of covered drugs) that determines which 
                          medications are covered and at what cost. It's important to check that your current medications are covered 
                          before enrolling in a plan.
                        </p>
                        <p>
                          <strong>Cost Structure:</strong> Part D plans typically have deductibles, copayments, and coinsurance. 
                          There's also a coverage gap (donut hole) where you pay more for drugs until you reach catastrophic coverage.
                        </p>
                        <p>
                          If you don't enroll in Part D when you're first eligible and don't have other creditable prescription drug 
                          coverage, you may pay a late enrollment penalty for as long as you have Medicare prescription drug coverage.
                        </p>
                      </div>
                    )}
                    {currentCategory.id === 'supplemental' && (
                      <div className="space-y-4">
                        <p>
                          Supplemental insurance provides additional protection beyond what Medicare covers. These plans can help 
                          with specific health conditions, routine care, or situations where Medicare benefits may be limited.
                        </p>
                        <p>
                          <strong>Cancer Insurance</strong> provides lump-sum cash benefits upon cancer diagnosis, which can be used 
                          for any purpose - medical bills, living expenses, or treatment-related costs. This coverage is especially 
                          valuable given the high costs associated with cancer treatment.
                        </p>
                        <p>
                          <strong>Dental and Vision Plans</strong> cover routine care that Medicare typically doesn't include. These 
                          plans can help with regular cleanings, eye exams, glasses, and major dental work, helping you maintain 
                          overall health and catch problems early.
                        </p>
                        <p>
                          These supplemental plans work independently of Medicare and can provide peace of mind and financial 
                          protection for specific healthcare needs that traditional Medicare doesn't adequately address.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Right Sidebar - Plans, Charts and Stats */}
          <div className="space-y-4 lg:space-y-6 min-w-0">
            {/* Mobile Section Headers */}
            <div className="lg:hidden">
              <h2 className="text-lg font-semibold mb-4">Plan Options & Insights</h2>
            </div>
            
            {currentCategory && (
              <>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 lg:mb-4">
                    PLAN OPTIONS
                  </h3>
                  
                  {/* Mobile: Horizontal scroll for plan cards */}
                  <div className="lg:space-y-2 overflow-x-hidden">
                    <div className="flex gap-3 overflow-x-auto pb-3 lg:flex-col lg:overflow-x-visible lg:gap-0 lg:space-y-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide">
                      {currentCategory.plans.map((plan) => (
                        <div key={plan.id} className="flex-shrink-0 w-72 lg:w-full min-w-0">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-3 lg:p-4 bg-card border border-border/20 rounded-lg hover:bg-accent/50 hover:border-border/40 transition-all min-w-0">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-sm truncate">{plan.name}</h4>
                                  {plan.isPopular && (
                                    <Badge variant="default" className="text-xs px-2 py-0.5 flex-shrink-0">Popular</Badge>
                                  )}
                                </div>
                                {plan.premiumRange && (
                                  <div className="text-xs text-muted-foreground">
                                    From <span className="font-semibold text-primary">{plan.premiumRange}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1 mt-3 lg:mt-0 lg:ml-3 flex-shrink-0">
                              {/* Info Button */}
                              <button 
                                className={`p-2 rounded-md transition-colors ${
                                  selectedPlan === plan.id 
                                    ? "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400" 
                                    : "hover:bg-blue-50 text-blue-500 dark:hover:bg-blue-950/20"
                                }`}
                                onClick={() => setSelectedPlan(selectedPlan === plan.id ? null : plan.id)}
                              >
                              <FileTextIcon className="h-4 w-4" />
                            </button>
                            
                            {/* Quote Button */}
                            <button className="p-2 rounded-md hover:bg-green-50 text-green-500 dark:hover:bg-green-950/20 transition-colors">
                              <ArchiveIcon className="h-4 w-4" />
                            </button>
                            
                            {/* Video Button */}
                            <button className="p-2 rounded-md hover:bg-purple-50 text-purple-500 dark:hover:bg-purple-950/20 transition-colors">
                              <VideoIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Expanded Info Content */}
                        {selectedPlan === plan.id && (
                          <div className="mx-1 mt-2 p-3 border border-blue-200/60 bg-blue-50/50 dark:bg-blue-950/10 dark:border-blue-800/60 rounded-lg">
                            <div className="space-y-2">
                              <h5 className="font-medium text-xs text-blue-700 dark:text-blue-400 uppercase tracking-wide">Key Features</h5>
                              <ul className="space-y-1">
                                {plan.features.slice(0, 4).map((feature, index) => (
                                  <li key={index} className="flex items-start gap-2 text-xs">
                                    <CheckIcon className="h-3 w-3 text-green-600 flex-shrink-0 mt-0.5" />
                                    <span className="leading-relaxed">{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                </div>

                <Separator />
              </>
            )}

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                NEED HELP?
              </h3>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center space-y-3">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center overflow-hidden">
                      <img 
                        src="https://firebasestorage.googleapis.com/v0/b/medicareally.firebasestorage.app/o/app-photos%2FHeadshot%20Four-2.jpg?alt=media&token=536d05ff-db44-498a-8a28-5a65f5a76d77"
                        alt="Medicare Expert Jonathan Hawkins"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium">Talk to an Expert</h4>
                      <p className="text-sm text-muted-foreground">
                        Free consultation with licensed agent
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Jonathan Hawkins, CFP
                      </p>
                    </div>
                    <Button className="w-full">
                      Schedule Call
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Mon-Fri 8am-8pm EST
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                PLAN POPULARITY
              </h3>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Most Chosen Plans</CardTitle>
                  <CardDescription className="text-sm">
                    Based on 2024 enrollments
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <ChartContainer
                    config={planPopularityConfig}
                    className="mx-auto aspect-square max-h-[150px] sm:max-h-[180px]"
                  >
                    <PieChart>
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Pie
                        data={planPopularityData}
                        dataKey="enrollment"
                        nameKey="plan"
                        innerRadius={45}
                        strokeWidth={2}
                      />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                CUSTOMER SATISFACTION
              </h3>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Monthly Ratings</CardTitle>
                  <CardDescription className="text-sm">
                    Average customer satisfaction
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={satisfactionConfig} className="h-[100px] sm:h-[120px]">
                    <BarChart accessibilityLayer data={satisfactionData}>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        className="text-xs"
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Bar 
                        dataKey="satisfaction" 
                        fill="var(--color-satisfaction)" 
                        radius={4}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
                <div className="px-6 pb-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <TriangleUpIcon className="h-3 w-3" />
                    <span>Trending up this quarter</span>
                  </div>
                </div>
              </Card>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                QUICK STATS
              </h3>
              <div className="space-y-3">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">50,000+</div>
                      <div className="text-sm text-muted-foreground">Plans Compared</div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-chart-1/20 flex items-center justify-center">
                      <ArchiveIcon className="h-4 w-4 text-chart-1" />
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">4.9/5</div>
                      <div className="text-sm text-muted-foreground">Customer Rating</div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-chart-2/20 flex items-center justify-center">
                      <StarFilledIcon className="h-4 w-4 text-chart-2" />
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">$500+</div>
                      <div className="text-sm text-muted-foreground">Avg. Savings</div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-chart-3/20 flex items-center justify-center">
                      <BadgeIcon className="h-4 w-4 text-chart-3" />
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Floating Action Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <div className="flex flex-col gap-3">
          {/* Secondary Actions */}
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-white shadow-lg border-gray-200 hover:bg-blue-50 rounded-full w-12 h-12 p-0"
            >
              📊
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-white shadow-lg border-gray-200 hover:bg-green-50 rounded-full w-12 h-12 p-0"
            >
              📞
            </Button>
          </div>
          
          {/* Main CTA */}
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 shadow-xl rounded-full w-16 h-16 p-0 text-lg"
          >
            📄
          </Button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 safe-area-pb">
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          <button className="flex flex-col items-center justify-center py-2 px-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <div className="text-blue-600 text-lg mb-1">🏠</div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Home</span>
          </button>
          <button className="flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-blue-50 dark:bg-blue-950/20 transition-colors">
            <div className="text-blue-600 text-lg mb-1">📋</div>
            <span className="text-xs text-blue-600 font-medium">Compare</span>
          </button>
          <button className="flex flex-col items-center justify-center py-2 px-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <div className="text-gray-500 text-lg mb-1">💬</div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Help</span>
          </button>
          <button className="flex flex-col items-center justify-center py-2 px-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <div className="text-gray-500 text-lg mb-1">📱</div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Tools</span>
          </button>
        </div>
      </div>
    </div>
  );
}
