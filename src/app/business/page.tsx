"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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
  BackpackIcon,
  GearIcon,
  LightningBoltIcon,
  LockClosedIcon
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
    id: "general-liability",
    name: "General Liability",
    description: "Protect your business from lawsuits and claims",
    isPopular: true,
    plans: [
      {
        id: "basic-gl",
        name: "Basic Coverage",
        description: "Essential liability protection for small businesses",
        premiumRange: "$300-800/year",
        features: ["$1M per occurrence", "Bodily injury protection", "Property damage coverage", "Basic legal defense"]
      },
      {
        id: "enhanced-gl",
        name: "Enhanced Coverage",
        description: "Comprehensive protection with higher limits",
        isPopular: true,
        premiumRange: "$500-1,500/year",
        features: ["$2M per occurrence", "Product liability", "Professional liability add-on", "Enhanced legal defense"]
      },
      {
        id: "premium-gl",
        name: "Premium Coverage",
        description: "Maximum protection for high-risk businesses",
        premiumRange: "$1,000-3,000/year",
        features: ["$5M+ per occurrence", "Cyber liability included", "Employment practices", "Global coverage"]
      }
    ]
  },
  {
    id: "workers-comp",
    name: "Workers' Compensation",
    description: "Required coverage for employee injuries",
    plans: [
      {
        id: "standard-wc",
        name: "Standard Coverage",
        description: "State-required workers' compensation",
        isPopular: true,
        premiumRange: "$500-2,000/year",
        features: ["Medical expense coverage", "Lost wage replacement", "Disability benefits", "Return-to-work programs"]
      },
      {
        id: "enhanced-wc",
        name: "Enhanced Coverage",
        description: "Additional benefits beyond state requirements",
        premiumRange: "$800-3,500/year",
        features: ["Enhanced medical care", "Vocational rehabilitation", "Light duty programs", "Safety training included"]
      }
    ]
  },
  {
    id: "commercial-auto",
    name: "Commercial Auto",
    description: "Vehicle coverage for business use",
    plans: [
      {
        id: "fleet-basic",
        name: "Basic Fleet",
        description: "Essential coverage for business vehicles",
        premiumRange: "$1,200-3,000/year",
        features: ["Liability coverage", "Collision & comprehensive", "Uninsured motorist", "Basic roadside assistance"]
      },
      {
        id: "fleet-premium",
        name: "Premium Fleet",
        description: "Comprehensive protection for commercial fleets",
        isPopular: true,
        premiumRange: "$2,000-5,000/year",
        features: ["Higher liability limits", "Cargo coverage", "Rental reimbursement", "Enhanced roadside service"]
      }
    ]
  },
  {
    id: "property",
    name: "Commercial Property",
    description: "Protect your business property and equipment",
    plans: [
      {
        id: "basic-property",
        name: "Basic Property",
        description: "Essential building and contents coverage",
        premiumRange: "$800-2,500/year",
        features: ["Building coverage", "Business personal property", "Basic business interruption", "Equipment breakdown"]
      },
      {
        id: "comprehensive-property",
        name: "Comprehensive Property",
        description: "Full protection including specialized coverage",
        isPopular: true,
        premiumRange: "$1,500-5,000/year",
        features: ["Replacement cost coverage", "Extended business interruption", "Ordinance & law coverage", "Valuable papers & records"]
      }
    ]
  },
  {
    id: "cyber-liability",
    name: "Cyber Liability",
    description: "Protection against data breaches and cyber attacks",
    plans: [
      {
        id: "basic-cyber",
        name: "Basic Cyber Protection",
        description: "Essential cybersecurity coverage",
        premiumRange: "$500-1,500/year",
        features: ["Data breach response", "Cyber extortion coverage", "Business interruption", "Regulatory fines"]
      },
      {
        id: "advanced-cyber",
        name: "Advanced Cyber Protection",
        description: "Comprehensive cyber risk management",
        isPopular: true,
        premiumRange: "$1,000-5,000/year",
        features: ["Advanced threat protection", "Cyber crime coverage", "Reputation management", "24/7 incident response"]
      }
    ]
  }
];

const keyFeatures: KeyFeature[] = [
  {
    title: "Business Expertise",
    description: "Specialized agents understand your industry risks",
    icon: PersonIcon,
    highlight: true
  },
  {
    title: "Custom Solutions",
    description: "Tailored coverage packages for your business",
    icon: TargetIcon
  },
  {
    title: "Risk Assessment",
    description: "Free evaluation of your business exposures",
    icon: CheckCircledIcon,
    highlight: true
  },
  {
    title: "Carrier Network",
    description: "Access to top commercial insurance carriers",
    icon: StarFilledIcon
  },
  {
    title: "Claims Support",
    description: "Dedicated assistance when you need to file claims",
    icon: HeartFilledIcon
  }
];

const resources = [
  {
    title: "Business Insurance Basics",
    description: "Essential coverage every business needs",
    type: "guide",
    readTime: "10 min read",
    url: "/resources/business-insurance-basics"
  },
  {
    title: "Industry Risk Assessment",
    description: "Interactive tool to identify your risks",
    type: "tool", 
    readTime: "Try now",
    url: "/tools/risk-assessment"
  },
  {
    title: "Workers' Comp Requirements",
    description: "State-by-state compliance guide",
    type: "guide",
    readTime: "7 min read",
    url: "/resources/workers-comp-requirements"
  },
  {
    title: "Cyber Security Best Practices",
    description: "Protect your business from digital threats",
    type: "article",
    readTime: "12 min read",
    url: "/resources/cyber-security-guide"
  }
];

// Chart data for plan popularity
const planPopularityData = [
  { plan: "General Liability", enrollment: 45, fill: "hsl(var(--chart-1))" },
  { plan: "Workers' Comp", enrollment: 25, fill: "hsl(var(--chart-2))" },
  { plan: "Commercial Auto", enrollment: 20, fill: "hsl(var(--chart-3))" },
  { plan: "Property", enrollment: 10, fill: "hsl(var(--chart-4))" },
];

const planPopularityConfig = {
  enrollment: {
    label: "Enrollment %",
  },
  generalLiability: {
    label: "General Liability",
    color: "hsl(var(--chart-1))",
  },
  workersComp: {
    label: "Workers' Comp",
    color: "hsl(var(--chart-2))",
  },
  commercialAuto: {
    label: "Commercial Auto",
    color: "hsl(var(--chart-3))",
  },
  property: {
    label: "Property",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

// Chart data for customer satisfaction
const satisfactionData = [
  { month: "Jan", satisfaction: 4.5 },
  { month: "Feb", satisfaction: 4.6 },
  { month: "Mar", satisfaction: 4.4 },
  { month: "Apr", satisfaction: 4.7 },
  { month: "May", satisfaction: 4.6 },
  { month: "Jun", satisfaction: 4.7 },
];

const satisfactionConfig = {
  satisfaction: {
    label: "Rating",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function BusinessHub() {
  const [selectedCategory, setSelectedCategory] = useState<string>("general-liability");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCompareSheetOpen, setIsCompareSheetOpen] = useState(false);
  const [isArticleSheetOpen, setIsArticleSheetOpen] = useState(false);

  const currentCategory = productCategories.find(cat => cat.id === selectedCategory);

  const resources = [
    {
      title: "Business Insurance Guide: Complete Protection",
      description: "Everything you need to know about commercial insurance coverage",
      url: "/resources/business-insurance-guide",
      readTime: "12 min read"
    },
    {
      title: "General Liability vs Professional Liability",
      description: "Compare different types of business protection",
      url: "/resources/liability-comparison",
      readTime: "8 min read"
    },
    {
      title: "When to Review Your Business Coverage",
      description: "Business milestones that trigger insurance updates",
      url: "/resources/business-insurance-review",
      readTime: "6 min read"
    }
  ];

  return (
    <div className="overflow-x-hidden">
      {/* Header */}
      <div className="border-b mt-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Business Insurance</Badge>
              <Badge variant="outline">Commercial Coverage Available</Badge>
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight break-words">
                Protect Your Business with Confidence
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mt-2 break-words">
                Compare commercial insurance options tailored to your industry. Expert guidance included.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Responsive Layout */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 overflow-x-hidden">
        {/* Mobile Category Selector - Improved */}
        <div className="lg:hidden mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Choose Your Coverage Type</h2>
            <Badge variant="outline" className="text-xs">
              {productCategories.find(cat => cat.id === selectedCategory)?.name}
            </Badge>
          </div>
          
          {/* Mobile Category Tabs - Horizontal Scroll */}
          <div className="relative -mx-4 px-4">
            <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory">
              {productCategories.map((category) => {
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setSelectedPlan(null);
                    }}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-full transition-all duration-200 border-2 snap-start min-w-max ${
                      selectedCategory === category.id
                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                        : "bg-card text-card-foreground border-border hover:border-primary/30 hover:bg-primary/5"
                    }`}
                  >
                    <span className="text-sm font-medium whitespace-nowrap">
                      {category.name}
                    </span>
                    {category.isPopular && selectedCategory !== category.id && (
                      <div className="w-2 h-2 bg-warning rounded-full flex-shrink-0"></div>
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
            <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-primary">
                {currentCategory.description}
              </p>
            </div>
          )}
        </div>

        {/* Mobile Quick Actions Bar */}
        <div className="lg:hidden mb-6 overflow-x-hidden">
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <Button size="sm" variant="outline" className="flex-shrink-0 text-xs whitespace-nowrap">
              Call Expert
            </Button>
            <Button size="sm" variant="outline" className="flex-shrink-0 text-xs whitespace-nowrap">
              Get Quote
            </Button>
            <Button size="sm" variant="outline" className="flex-shrink-0 text-xs whitespace-nowrap">
              Compare Coverage
            </Button>
            <Button size="sm" variant="outline" className="flex-shrink-0 text-xs whitespace-nowrap">
              Watch Video
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] xl:grid-cols-[320px_1fr_340px] gap-6 lg:gap-8 min-w-0">
          
          {/* Left Sidebar - Product Navigation (Desktop Only) */}
          <div className="hidden lg:block space-y-2">
            <div className="pb-4">
              <h2 className="text-sm font-medium text-muted-foreground mb-3">
                BUSINESS COVERAGE
              </h2>
              <div className="space-y-1">
                {productCategories.map((category) => {
                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setSelectedPlan(null);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-md transition-colors ${
                        selectedCategory === category.id
                          ? "bg-primary/5 text-primary border border-primary/20"
                          : "hover:bg-accent/50 border border-transparent"
                      }`}
                    >
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
                BUSINESS TOOLS
              </h3>
              <div className="space-y-1">
                <Link
                  href="/tools/business-risk-assessment"
                  className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent/50"
                >
                  <TokensIcon className="h-4 w-4" />
                  Risk Assessment
                </Link>
                <Link
                  href="/tools/coverage-calculator"
                  className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent/50"
                >
                  <TargetIcon className="h-4 w-4" />
                  Coverage Calculator
                </Link>
                <Link
                  href="/tools/agent-finder"
                  className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent/50"
                >
                  <PersonIcon className="h-4 w-4" />
                  Find Business Agent
                </Link>
              </div>
            </div>

            <Separator />

            <div className="pt-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                INDUSTRY RESOURCES
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
                          ? "bg-card border-accent"
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
                    <span className="hidden sm:inline">Get</span> Quote
                  </Button>
                </div>

                {/* Mobile Content Tabs */}
                <div className="lg:hidden overflow-x-hidden">
                  <div className="flex gap-1 bg-muted p-1 rounded-lg mb-4 -mx-1">
                    <button 
                      className="flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors bg-card shadow-sm text-primary min-w-0"
                    >
                      <span className="truncate">Overview</span>
                    </button>
                    <button 
                      className="flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors text-muted-foreground hover:text-foreground min-w-0"
                    >
                      <span className="truncate">Compare</span>
                    </button>
                    <button 
                      className="flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors text-muted-foreground hover:text-foreground min-w-0"
                    >
                      <span className="truncate">Learn</span>
                    </button>
                  </div>
                </div>

                {/* Video Section - Enhanced for Mobile */}
                <div className="relative">
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                    <iframe
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                      title={`Learn About ${currentCategory.name}`}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                    
                    {/* Mobile Video Overlay */}
                    <div className="lg:hidden absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <div className="flex items-center justify-between text-white">
                        <div>
                          <p className="text-sm font-medium">Understanding {currentCategory.name}</p>
                          <p className="text-xs opacity-90">8:15 min • Business expert explanation</p>
                        </div>
                        <Button size="sm" variant="secondary" className="text-xs">
                          Fullscreen
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
                      Compare coverage options and limits across business plans
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
                                    ? 'bg-primary/5 border-l-2 border-r-2 border-primary/20' 
                                    : 'bg-muted/10'
                                }`}>
                                  <div className="space-y-1">
                                    <div className="font-bold text-xs sm:text-sm">{plan.name}</div>
                                    {plan.isPopular && (
                                      <Badge variant="default" className="text-xs bg-primary/20">
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
                              Annual Premium
                            </td>
                            {currentCategory.plans.map((plan) => (
                              <td key={plan.id} className={`py-3 px-2 sm:px-3 text-center ${
                                plan.isPopular ? 'bg-primary/5' : ''
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
                                plan.isPopular ? 'bg-primary/5' : ''
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
                                plan.isPopular ? 'bg-primary/5' : ''
                              }`}>
                                <ul className="space-y-1">
                                  {plan.features.slice(0, 3).map((feature, index) => (
                                    <li key={index} className="flex items-start gap-1 text-xs">
                                      <span className="text-success flex-shrink-0">✓</span>
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
                                plan.isPopular ? 'bg-primary/5' : ''
                              }`}>
                                <div className="text-xs font-medium text-muted-foreground">
                                  {planIndex === 0 && currentCategory.id === 'general-liability' && "Small businesses"}
                                  {planIndex === 1 && currentCategory.id === 'general-liability' && "Growing businesses"}
                                  {planIndex === 2 && currentCategory.id === 'general-liability' && "High-risk industries"}
                                  {planIndex === 0 && currentCategory.id === 'workers-comp' && "Basic compliance"}
                                  {planIndex === 1 && currentCategory.id === 'workers-comp' && "Enhanced protection"}
                                  {planIndex === 0 && currentCategory.id === 'commercial-auto' && "Small fleets"}
                                  {planIndex === 1 && currentCategory.id === 'commercial-auto' && "Large operations"}
                                  {planIndex === 0 && currentCategory.id === 'property' && "Basic coverage"}
                                  {planIndex === 1 && currentCategory.id === 'property' && "Full protection"}
                                  {planIndex === 0 && currentCategory.id === 'cyber-liability' && "Basic cyber risks"}
                                  {planIndex === 1 && currentCategory.id === 'cyber-liability' && "High-tech businesses"}
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
              </div>
            )}
          </div>

          {/* Right Sidebar - Plans, Charts and Stats */}
          <div className="space-y-4 lg:space-y-6 min-w-0">
            {/* Mobile Section Headers */}
            <div className="lg:hidden">
              <h2 className="text-lg font-semibold mb-4">Coverage Options & Insights</h2>
            </div>
            
            {currentCategory && (
              <>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 lg:mb-4">
                    COVERAGE OPTIONS
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
                                    ? "bg-primary/10 text-primary dark:bg-primary/10 dark:text-primary"
                                    : "hover:bg-primary/5 text-primary dark:hover:bg-primary/5"
                                }`}
                                onClick={() => setSelectedPlan(selectedPlan === plan.id ? null : plan.id)}
                              >
                              <FileTextIcon className="h-4 w-4" />
                            </button>
                            
                            {/* Quote Button */}
                            <button className="p-2 rounded-md hover:bg-success/10 text-success transition-colors">
                              <ArchiveIcon className="h-4 w-4" />
                            </button>
                            
                            {/* Video Button */}
                            <button className="p-2 rounded-md hover:bg-accent/10 text-accent-foreground transition-colors">
                              <VideoIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Expanded Info Content */}
                        {selectedPlan === plan.id && (
                          <div className="mx-1 mt-2 p-3 border border-primary/20 bg-primary/5 dark:border-primary/20 rounded-lg">
                            <div className="space-y-2">
                              <h5 className="font-medium text-xs text-primary dark:text-primary uppercase tracking-wide">Key Features</h5>
                              <ul className="space-y-1">
                                {plan.features.slice(0, 4).map((feature, index) => (
                                  <li key={index} className="flex items-start gap-2 text-xs">
                                    <CheckIcon className="h-3 w-3 text-success flex-shrink-0 mt-0.5" />
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
                        alt="Business Insurance Expert Michael Davis"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium">Talk to an Expert</h4>
                      <p className="text-sm text-muted-foreground">
                        Free consultation with commercial insurance specialist
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Michael Davis, CIC
                      </p>
                    </div>
                    <Button className="w-full">
                      Schedule Call
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Mon-Fri 8am-6pm CST
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                COVERAGE POPULARITY
              </h3>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Most Requested Coverage</CardTitle>
                  <CardDescription className="text-sm">
                    Based on 2024 business quotes
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
                    Average business client satisfaction
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
                      <div className="text-2xl font-bold">15,000+</div>
                      <div className="text-sm text-muted-foreground">Businesses Protected</div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-chart-1/20 flex items-center justify-center">
                      <ArchiveIcon className="h-4 w-4 text-chart-1" />
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">4.7/5</div>
                      <div className="text-sm text-muted-foreground">Client Rating</div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-chart-2/20 flex items-center justify-center">
                      <StarFilledIcon className="h-4 w-4 text-chart-2" />
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">$750+</div>
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
              className="bg-card shadow-lg border-border hover:bg-primary/5 rounded-full w-12 h-12 p-0"
            >
              Compare
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-card shadow-lg border-border hover:bg-success/5 rounded-full w-12 h-12 p-0"
            >
              Call
            </Button>
          </div>
          
          {/* Main CTA */}
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 shadow-xl rounded-full w-16 h-16 p-0 text-lg"
          >
            Quote
          </Button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-pb">
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          <button className="flex flex-col items-center justify-center py-2 px-1 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="text-primary text-lg mb-1">Home</div>
            <span className="text-xs text-muted-foreground">Home</span>
          </button>
          <button className="flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-primary/5 transition-colors">
            <div className="text-primary text-lg mb-1">Compare</div>
            <span className="text-xs text-primary font-medium">Compare</span>
          </button>
          <button className="flex flex-col items-center justify-center py-2 px-1 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="text-muted-foreground text-lg mb-1">Help</div>
            <span className="text-xs text-muted-foreground">Help</span>
          </button>
          <button className="flex flex-col items-center justify-center py-2 px-1 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="text-muted-foreground text-lg mb-1">Tools</div>
            <span className="text-xs text-muted-foreground">Tools</span>
          </button>
        </div>
      </div>

      {/* Mobile Compare Sheet */}
      <Sheet open={isCompareSheetOpen} onOpenChange={setIsCompareSheetOpen}>
        <SheetContent side="bottom" className="h-[90vh]">
          <SheetHeader>
            <SheetTitle>Compare Coverage</SheetTitle>
            <SheetDescription>
              Compare different {currentCategory?.name} options side by side
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4 overflow-y-auto">
            {currentCategory?.plans.map((plan) => (
              <Card key={plan.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold">{plan.name}</h3>
                  <div className="text-right">
                    <div className="font-bold text-primary">{plan.premiumRange}</div>
                    <div className="text-xs text-muted-foreground">per year</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
                <div className="space-y-1">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <CheckIcon className="h-3 w-3 text-success mt-1 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile Article Sheet */}
      <Sheet open={isArticleSheetOpen} onOpenChange={setIsArticleSheetOpen}>
        <SheetContent side="bottom" className="h-[90vh]">
          <SheetHeader>
            <SheetTitle>Learn More About {currentCategory?.name}</SheetTitle>
            <SheetDescription>
              Business insurance guides and resources
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4 overflow-y-auto">
            {resources.map((resource, index) => (
              <Link
                key={index}
                href={resource.url}
                className="block p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                onClick={() => setIsArticleSheetOpen(false)}
              >
                <div className="flex items-start gap-3">
                  <FileTextIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{resource.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{resource.description}</p>
                    <div className="text-xs text-primary">{resource.readTime}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
