"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import MedicareNavigationTabsWrapper from "@/components/MedicareNavigationTabsWrapper";
import { 
  ReaderIcon,
  VideoIcon,
  FileTextIcon,
  QuestionMarkCircledIcon,
  InfoCircledIcon,
  BookmarkIcon,
  CheckIcon,
  StarFilledIcon,
  TokensIcon,
  HeartIcon,
  ActivityLogIcon,
  PersonIcon,
  ArchiveIcon,
  CalendarIcon,
  AvatarIcon
} from '@radix-ui/react-icons';
import { resourcesList } from "@/resources/resourcesList";

// Function to get relevant articles based on plan type
const getRelevantArticles = (planType: string, maxArticles: number = 9) => {
  const productKeyMap: Record<string, keyof typeof resourcesList[0]['products']> = {
    'original': 'ogMedicare',
    'medigap': 'planG', // Use planG as proxy for medigap
    'advantage': 'advantage',
    'Part A (Hospital)': 'ogMedicare',
    'Part B (Medical)': 'ogMedicare', 
    'Plan G': 'planG',
    'Plan N': 'planN',
    'HMO Plans': 'hmo',
    'PPO Plans': 'ppo',
    'Special Needs Plans': 'snp',
    'drug': 'pdp'
  };

  const productKey = productKeyMap[planType] || 'ogMedicare';
  
  return resourcesList
    .filter(resource => resource.products[productKey] === true)
    .slice(0, maxArticles)
    .map(resource => ({
      title: resource.title,
      excerpt: resource.description,
      readTime: `${resource.duration} ${resource.durationUnit}`,
      category: resource.type,
      isPopular: resource.featured,
      slug: resource.slug,
      linkLabel: resource.linkLabel
    }));
};

interface PlanCategory {
  id: string;
  name: string;
  description: string;
  videoUrl: string;
  videoDuration: string;
  plans: Plan[];
  keyDetails: string[];
  relatedArticles: Article[];
}

interface Plan {
  id: string;
  name: string;
  description: string;
  isPopular?: boolean;
  premiumRange?: string;
  features: string[];
}

interface Article {
  title: string;
  excerpt: string;
  readTime: string;
  category: string;
  isPopular?: boolean;
}

const planCategories: PlanCategory[] = [
  {
    id: "original",
    name: "Original Medicare",
    description: "Traditional Medicare Parts A & B",
    videoUrl: "https://www.youtube.com/embed/7o3q3med9Dw",
    videoDuration: "5:30",
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
      }
    ],
    keyDetails: [
      "Original Medicare consists of Part A (Hospital Insurance) and Part B (Medical Insurance)",
      "Part A is free for most people who worked and paid Medicare taxes for 10+ years",
      "Part B requires a monthly premium that varies based on income",
      "You can see any doctor or hospital that accepts Medicare nationwide",
      "Original Medicare doesn't include prescription drug coverage - you'll need Part D"
    ],
    relatedArticles: [
      {
        title: "Medicare Basics: Everything You Need to Know",
        excerpt: "Complete guide to understanding Medicare Parts A, B, C, and D",
        readTime: "8 min read",
        category: "Basics",
        isPopular: true
      },
      {
        title: "Original Medicare vs Medicare Advantage",
        excerpt: "Key differences between traditional Medicare and Medicare Advantage plans",
        readTime: "6 min read",
        category: "Comparison"
      },
      {
        title: "Understanding Medicare Costs and Premiums",
        excerpt: "Breakdown of Medicare costs, deductibles, and out-of-pocket expenses",
        readTime: "5 min read",
        category: "Costs"
      }
    ]
  },
  {
    id: "medigap",
    name: "Medigap (Supplement)",
    description: "Fill the gaps in Original Medicare",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videoDuration: "7:45",
    plans: [
      {
        id: "plan-g",
        name: "Plan G",
        description: "Most comprehensive Medigap coverage",
        isPopular: true,
        premiumRange: "$150-300/mo",
        features: ["Hospital coinsurance", "Medical coinsurance", "Blood coverage", "Foreign travel"]
      },
      {
        id: "plan-n",
        name: "Plan N",
        description: "Lower premium option with small copays",
        premiumRange: "$100-200/mo",
        features: ["Hospital coinsurance", "Medical coinsurance", "Blood coverage", "Small copays"]
      }
    ],
    keyDetails: [
      "Medigap policies help pay for costs that Original Medicare doesn't cover",
      "Standardized plans (A through N) offer different levels of coverage",
      "Plan G is the most comprehensive option available for new Medicare beneficiaries",
      "Medigap premiums vary by location, insurance company, and your age",
      "You must be enrolled in Original Medicare to purchase a Medigap policy"
    ],
    relatedArticles: [
      {
        title: "Medigap Plan G vs Plan N: Which is Right for You?",
        excerpt: "Detailed comparison of the two most popular Medigap plans",
        readTime: "7 min read",
        category: "Comparison",
        isPopular: true
      },
      {
        title: "When to Enroll in Medigap",
        excerpt: "Understanding Medigap open enrollment and guaranteed issue rights",
        readTime: "5 min read",
        category: "Enrollment"
      },
      {
        title: "Medigap Rate Increases: What to Expect",
        excerpt: "How Medigap premiums are calculated and why they increase",
        readTime: "4 min read",
        category: "Costs"
      }
    ]
  },
  {
    id: "advantage",
    name: "Medicare Advantage",
    description: "All-in-one Medicare alternative",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videoDuration: "6:15",
    plans: [
      {
        id: "hmo",
        name: "HMO Plans",
        description: "Network-based care with referrals",
        premiumRange: "$0-50/mo",
        features: ["Network providers", "Referrals required", "Often includes extras", "Lower costs"]
      },
      {
        id: "ppo",
        name: "PPO Plans",
        description: "More flexibility in provider choice",
        premiumRange: "$20-100/mo",
        features: ["Network flexibility", "No referrals", "Out-of-network coverage", "Higher costs"]
      }
    ],
    keyDetails: [
      "Medicare Advantage plans replace Original Medicare and often include Part D",
      "Plans must cover everything Original Medicare covers, plus often extras",
      "You're limited to the plan's network of doctors and hospitals",
      "Many plans include prescription drugs, dental, vision, and hearing aids",
      "Annual out-of-pocket maximums provide financial protection"
    ],
    relatedArticles: [
      {
        title: "Medicare Advantage Explained: Pros and Cons",
        excerpt: "Complete guide to Medicare Advantage benefits and drawbacks",
        readTime: "9 min read",
        category: "Overview",
        isPopular: true
      },
      {
        title: "How to Choose a Medicare Advantage Plan",
        excerpt: "Key factors to consider when selecting a Medicare Advantage plan",
        readTime: "6 min read",
        category: "Comparison"
      },
      {
        title: "Medicare Advantage vs Medigap",
        excerpt: "Should you choose Medicare Advantage or Original Medicare with Medigap?",
        readTime: "8 min read",
        category: "Comparison"
      }
    ]
  },
  {
    id: "part-d",
    name: "Part D (Drug Plans)",
    description: "Prescription drug coverage",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videoDuration: "4:50",
    plans: [
      {
        id: "standalone",
        name: "Standalone PDP",
        description: "Standalone prescription drug plans",
        premiumRange: "$15-80/mo",
        features: ["Works with Original Medicare", "Various formularies", "Different cost structures", "Annual changes"]
      }
    ],
    keyDetails: [
      "Part D covers prescription drugs and is offered by private insurance companies",
      "You can add Part D to Original Medicare or get it included in Medicare Advantage",
      "Each plan has a formulary (list of covered drugs) that can change annually",
      "Coverage gap ('donut hole') affects costs when you reach certain spending levels",
      "Late enrollment penalty applies if you don't sign up when first eligible"
    ],
    relatedArticles: [
      {
        title: "Understanding Medicare Part D Coverage",
        excerpt: "How prescription drug plans work and what they cover",
        readTime: "6 min read",
        category: "Overview"
      },
      {
        title: "Avoiding the Medicare Part D Late Penalty",
        excerpt: "When and how to enroll in Part D to avoid penalties",
        readTime: "4 min read",
        category: "Enrollment",
        isPopular: true
      },
      {
        title: "Medicare Part D Coverage Gap Explained",
        excerpt: "Understanding the 'donut hole' and how it affects your costs",
        readTime: "5 min read",
        category: "Costs"
      }
    ]
  }
];

export default function MedicareLearnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize state from URL params
  const [selectedCategory, setSelectedCategory] = useState("original");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'overview' | 'plan'>('overview');
  const [selectedPlanData, setSelectedPlanData] = useState<any>(null);
  
  // Update state based on URL params on mount and URL changes
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const planParam = searchParams.get('plan');
    
    if (categoryParam && planCategories.find(cat => cat.id === categoryParam)) {
      setSelectedCategory(categoryParam);
    }
    
    if (planParam) {
      setSelectedPlan(planParam);
      setCurrentView('plan');
      const planData = getPlanSpecificData(planParam, categoryParam || selectedCategory);
      setSelectedPlanData(planData);
    } else {
      setCurrentView('overview');
      setSelectedPlan(null);
      setSelectedPlanData(null);
    }
  }, [searchParams]);
  
  // Update URL when category changes
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedPlan(null);
    setSelectedPlanData(null);
    setCurrentView('overview');
    
    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', categoryId);
    params.delete('plan');
    router.push(`?${params.toString()}`, { scroll: false });
  };
  
  const currentCategory = planCategories.find(cat => cat.id === selectedCategory);
  
  // Handle plan selection from quick links
  const handlePlanSelect = (planName: string, categoryId: string) => {
    const planData = getPlanSpecificData(planName, categoryId);
    setSelectedPlanData(planData);
    setCurrentView('plan');
    setSelectedPlan(planName);
    
    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', categoryId);
    params.set('plan', planName);
    router.push(`?${params.toString()}`, { scroll: false });
  };
  
  // Get plan-specific data for dedicated learn interface
  const getPlanSpecificData = (planName: string, categoryId: string) => {
    const planDataMap: Record<string, any> = {
      // Original Medicare Plans
      "Part A (Hospital)": {
        name: "Medicare Part A",
        description: "Hospital Insurance Coverage",
        videoUrl: "https://www.youtube.com/embed/7o3q3med9Dw",
        videoDuration: "6:15",
        keyDetails: [
          "Covers inpatient hospital stays, including semi-private rooms, meals, and general nursing",
          "Includes skilled nursing facility care when medically necessary",
          "Covers hospice care and some home health care services",
          "Free for most people who worked and paid Medicare taxes for 10+ years",
          "Has deductibles and coinsurance that you'll need to pay"
        ],
        quickLinks: [
          { name: "Coverage Details", description: "What Part A covers", popular: true },
          { name: "Costs & Deductibles", description: "2024 Part A costs", popular: false },
          { name: "Enrollment", description: "How to get Part A", popular: false }
        ],
        relatedArticles: [
          {
            title: "Understanding Medicare Part A Benefits",
            excerpt: "Complete guide to hospital insurance coverage and benefits",
            readTime: "7 min read",
            category: "Benefits",
            isPopular: true
          },
          {
            title: "Part A Costs and Deductibles for 2024",
            excerpt: "Breakdown of Part A premiums, deductibles, and coinsurance",
            readTime: "5 min read",
            category: "Costs"
          }
        ]
      },
      "Part B (Medical)": {
        name: "Medicare Part B",
        description: "Medical Insurance Coverage",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        videoDuration: "5:45",
        keyDetails: [
          "Covers doctor visits, outpatient care, and preventive services",
          "Includes medical equipment like wheelchairs, walkers, and oxygen",
          "Covers ambulance services and some home health care",
          "Standard monthly premium in 2024 is $174.70 for most people",
          "Higher-income beneficiaries pay more based on modified adjusted gross income"
        ],
        quickLinks: [
          { name: "Covered Services", description: "What Part B covers", popular: true },
          { name: "Premium Costs", description: "Monthly premium amounts", popular: false },
          { name: "Preventive Care", description: "Free wellness services", popular: false }
        ],
        relatedArticles: [
          {
            title: "Medicare Part B Complete Guide",
            excerpt: "Everything you need to know about medical insurance coverage",
            readTime: "8 min read",
            category: "Overview",
            isPopular: true
          }
        ]
      },
      // Medigap Plans
      "Plan G": {
        name: "Medigap Plan G",
        description: "Most Comprehensive Supplement Coverage",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        videoDuration: "8:30",
        keyDetails: [
          "Covers Medicare Part A and Part B deductibles (except Part B deductible)",
          "Pays 100% of Medicare Part A and Part B coinsurance and copayments",
          "Covers skilled nursing facility care coinsurance",
          "Includes coverage for foreign travel emergency (up to plan limits)",
          "Most popular Medigap plan for new Medicare beneficiaries"
        ],
        quickLinks: [
          { name: "Coverage Chart", description: "What Plan G covers", popular: true },
          { name: "Premium Rates", description: "Cost by location & age", popular: false },
          { name: "Plan Comparison", description: "G vs other plans", popular: true }
        ],
        relatedArticles: [
          {
            title: "Why Plan G is the Most Popular Medigap Plan",
            excerpt: "Comprehensive analysis of Plan G benefits and value",
            readTime: "9 min read",
            category: "Comparison",
            isPopular: true
          }
        ]
      },
      "Plan N": {
        name: "Medigap Plan N",
        description: "Lower Premium Alternative",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", 
        videoDuration: "7:20",
        keyDetails: [
          "Covers Medicare Part A deductible and coinsurance",
          "Covers Part B coinsurance except up to $20 copay for office visits",
          "Up to $50 copay for emergency room visits (waived if admitted)",
          "Does not cover Part B deductible or excess charges",
          "Lower premiums than Plan G, good for healthy individuals"
        ],
        quickLinks: [
          { name: "Plan N Benefits", description: "Coverage details", popular: true },
          { name: "Copay Information", description: "When you pay copays", popular: false },
          { name: "G vs N Comparison", description: "Which plan is better", popular: true }
        ],
        relatedArticles: [
          {
            title: "Medigap Plan N: Is It Right for You?",
            excerpt: "Detailed analysis of Plan N benefits, costs, and considerations",
            readTime: "8 min read",
            category: "Analysis",
            isPopular: true
          }
        ]
      },
      // Medicare Advantage Plans
      "HMO Plans": {
        name: "Medicare Advantage HMO",
        description: "Health Maintenance Organization Plans",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        videoDuration: "7:45",
        keyDetails: [
          "You must use doctors and hospitals in the plan's network",
          "Usually need referrals to see specialists",
          "Often include prescription drug coverage (Part D)",
          "May include extra benefits like dental, vision, or hearing aids",
          "Lower or $0 monthly premiums but higher out-of-pocket costs"
        ],
        quickLinks: [
          { name: "Network Providers", description: "Find in-network doctors", popular: true },
          { name: "Extra Benefits", description: "Dental, vision, wellness", popular: false },
          { name: "Referral Process", description: "How to see specialists", popular: false }
        ],
        relatedArticles: [
          {
            title: "Medicare Advantage HMO Plans Explained",
            excerpt: "How HMO plans work and what to expect",
            readTime: "7 min read",
            category: "Plan Types",
            isPopular: true
          }
        ]
      },
      "PPO Plans": {
        name: "Medicare Advantage PPO", 
        description: "Preferred Provider Organization Plans",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        videoDuration: "6:50",
        keyDetails: [
          "More flexibility to see any doctor or specialist",
          "No referrals needed to see specialists",
          "Can see out-of-network providers (at higher cost)",
          "Often include prescription drug coverage",
          "Higher premiums than HMO but more provider choice"
        ],
        quickLinks: [
          { name: "Provider Network", description: "In & out-of-network costs", popular: true },
          { name: "Coverage Areas", description: "Where plans are available", popular: false },
          { name: "HMO vs PPO", description: "Compare plan types", popular: true }
        ],
        relatedArticles: [
          {
            title: "Medicare Advantage PPO vs HMO: Which is Better?",
            excerpt: "Compare flexibility vs cost in Medicare Advantage plans",
            readTime: "8 min read", 
            category: "Comparison",
            isPopular: true
          }
        ]
      }
    };
    
    return planDataMap[planName] || null;
  };
  
  // Dynamic Quick Links based on selected category
  const getQuickLinks = () => {
    switch (selectedCategory) {
      case "original":
        return {
          title: "Original Medicare",
          sections: [
            {
              name: "Parts",
              links: [
                { name: "Part A (Hospital)", description: "Inpatient hospital coverage", popular: false },
                { name: "Part B (Medical)", description: "Doctor visits & outpatient", popular: false },
                { name: "Part D (Drugs)", description: "Prescription drug coverage", popular: false }
              ]
            },
            {
              name: "Resources",
              links: [
                { name: "Medicare.gov", description: "Official Medicare website", popular: false },
                { name: "Enrollment Guide", description: "When and how to enroll", popular: true }
              ]
            }
          ]
        };
      case "medigap":
        return {
          title: "Medigap Plans",
          sections: [
            {
              name: "Popular Plans",
              links: [
                { name: "Plan G", description: "Most comprehensive coverage", popular: true },
                { name: "Plan N", description: "Lower premium option", popular: false },
                { name: "Plan F", description: "Legacy plan (if eligible)", popular: false }
              ]
            },
            {
              name: "Resources",
              links: [
                { name: "Plan Comparison", description: "Compare all Medigap plans", popular: false },
                { name: "Rate Calculator", description: "Estimate your premiums", popular: false }
              ]
            }
          ]
        };
      case "advantage":
        return {
          title: "Medicare Advantage",
          sections: [
            {
              name: "Plan Types",
              links: [
                { name: "HMO Plans", description: "Network-based care", popular: false },
                { name: "PPO Plans", description: "More provider flexibility", popular: true },
                { name: "SNP Plans", description: "Special Needs Plans", popular: false }
              ]
            },
            {
              name: "Resources",
              links: [
                { name: "Plan Finder", description: "Find plans in your area", popular: false },
                { name: "Star Ratings", description: "Quality & performance", popular: false }
              ]
            }
          ]
        };
      case "part-d":
        return {
          title: "Part D Drug Plans",
          sections: [
            {
              name: "Plan Types",
              links: [
                { name: "Standalone PDP", description: "Works with Original Medicare", popular: true },
                { name: "MA-PD Plans", description: "Included in Advantage plans", popular: false }
              ]
            },
            {
              name: "Resources",
              links: [
                { name: "Formulary Search", description: "Find covered drugs", popular: false },
                { name: "Coverage Gap", description: "Understanding the donut hole", popular: false },
                { name: "LIS Program", description: "Low Income Subsidy help", popular: false }
              ]
            }
          ]
        };
      default:
        return { title: "Quick Links", sections: [] };
    }
  };

  const quickLinks = getQuickLinks();
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb / Back Navigation */}
      {currentView === 'plan' && selectedPlanData && (
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => {
              setCurrentView('overview');
              setSelectedPlan(null);
              setSelectedPlanData(null);
              
              // Update URL to remove plan parameter
              const params = new URLSearchParams(searchParams.toString());
              params.delete('plan');
              router.push(`?${params.toString()}`, { scroll: false });
            }}
            className="mb-4"
          >
            ← Back to {currentCategory?.name} Overview
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Medicare</span>
            <span>›</span>
            <span>{currentCategory?.name}</span>
            <span>›</span>
            <span className="text-foreground">{selectedPlanData.name}</span>
          </div>
        </div>
      )}

      {/* Category Selection - Only show in overview mode */}
      {currentView === 'overview' && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Learn About Medicare Plans</h2>
            {/* Navigation Tabs - Right side */}
            <MedicareNavigationTabsWrapper />
          </div>
          <div className="flex flex-wrap gap-2">
            {planCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => handleCategoryChange(category.id)}
                className="flex items-center gap-2"
              >
                {category.name}
                {category.id === "medigap" && <Badge variant="secondary" className="text-xs">Popular</Badge>}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Plan-Specific View */}
      {currentView === 'plan' && selectedPlanData && (
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Video and Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Video Section */}
              <Card className="border border-border h-fit">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <VideoIcon className="w-5 h-5" />
                        {selectedPlanData.name}
                      </CardTitle>
                      <CardDescription>
                        {selectedPlanData.description} • {selectedPlanData.videoDuration}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">Video</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                    <iframe
                      src={selectedPlanData.videoUrl}
                      title={`Learn About ${selectedPlanData.name}`}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Plan Details Section */}
              <Card className="border border-border h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <InfoCircledIcon className="w-5 h-5" />
                    Key Details About {selectedPlanData.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedPlanData.keyDetails.map((detail: string, index: number) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckIcon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-muted-foreground">{detail}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Quick Links */}
            <div className="space-y-6 flex flex-col h-fit">
              <Card className="border border-border min-h-[600px]">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookmarkIcon className="w-5 h-5" />
                    Quick Links
                  </CardTitle>
                  <CardDescription>
                    Explore {selectedPlanData.name} options
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="space-y-6">
                    {/* Plan-specific tools and resources */}
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                        Tools & Resources
                      </h4>
                      <div className="space-y-2">
                        <div className="p-3 border border-border/50 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <CalendarIcon className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <h5 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">Enrollment Periods</h5>
                              <p className="text-xs text-muted-foreground">Important dates & deadlines</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 border border-border/50 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <TokensIcon className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <h5 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">Cost Calculator</h5>
                              <p className="text-xs text-muted-foreground">Estimate your costs</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 border border-border/50 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <FileTextIcon className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <h5 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">Plan Comparison</h5>
                              <p className="text-xs text-muted-foreground">Compare plan options</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 h-24">
                  <div className="flex items-center justify-between h-full">
                    <div>
                      <div className="text-2xl font-bold">65M+</div>
                      <div className="text-sm text-muted-foreground">Medicare Beneficiaries</div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <PersonIcon className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </Card>
                <Card className="p-4 h-24">
                  <div className="flex items-center justify-between h-full">
                    <div>
                      <div className="text-2xl font-bold">4.8/5</div>
                      <div className="text-sm text-muted-foreground">Satisfaction Rating</div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <StarFilledIcon className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Plan Mode Related Articles - Full Width */}
          <div className="mt-12">
            <div className="flex items-center gap-2 mb-6">
              <ReaderIcon className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Related Articles</h3>
              <p className="text-muted-foreground ml-2">Learn more about {selectedPlanData.name} with these helpful guides</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getRelevantArticles(selectedPlanData.name, 9).map((article, index) => (
                <a 
                  key={index} 
                  href={`/resources/${article.slug}`}
                  className="bg-card border border-border rounded-lg p-6 hover:bg-accent/50 transition-colors cursor-pointer min-h-[160px] flex flex-col group"
                >
                  <div className="flex items-start gap-2 mb-3">
                    <h4 className="font-semibold text-foreground line-clamp-2 flex-1 group-hover:text-primary transition-colors">{article.title}</h4>
                    {article.isPopular && (
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                        <StarFilledIcon className="w-3 h-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">{article.excerpt}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{article.readTime}</span>
                      <span>•</span>
                      <span>{article.category}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 px-3 text-xs pointer-events-none">
                      {article.linkLabel || 'Read More'}
                    </Button>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Overview Mode - Original Category View */}
      {currentView === 'overview' && currentCategory && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Video and Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Video Section */}
            <Card className="border border-border h-fit">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <VideoIcon className="w-5 h-5" />
                      Understanding {currentCategory.name}
                    </CardTitle>
                    <CardDescription>
                      {currentCategory.description} • {currentCategory.videoDuration}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">Video</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                  <iframe
                    src={currentCategory.videoUrl}
                    title={`Learn About ${currentCategory.name}`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </CardContent>
            </Card>

            {/* Plan Details Section */}
            <Card className="border border-border h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <InfoCircledIcon className="w-5 h-5" />
                  Key Details About {currentCategory.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentCategory.keyDetails.map((detail, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-muted-foreground">{detail}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Links */}
          <div className="space-y-6 flex flex-col h-fit">
            <Card className="border border-border min-h-[600px]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookmarkIcon className="w-5 h-5" />
                  Quick Links
                </CardTitle>
                <CardDescription>
                  Explore {quickLinks.title} options
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="space-y-6">
                  {quickLinks.sections.map((section, sectionIndex) => (
                    <div key={sectionIndex}>
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                        {section.name}
                      </h4>
                      <div className="space-y-2">
                        {section.links.map((link, linkIndex) => (
                          <div 
                            key={linkIndex} 
                            className="p-3 border border-border/50 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group"
                            onClick={() => handlePlanSelect(link.name, selectedCategory)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                  {link.name}
                                </h5>
                                <p className="text-xs text-muted-foreground">{link.description}</p>
                              </div>
                              {link.popular && (
                                <Badge variant="default" className="text-xs">Popular</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Universal Resources */}
                  <div className="pt-4 border-t border-border/50">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                      Tools
                    </h4>
                    <div className="space-y-2">
                      <div className="p-3 border border-border/50 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <CalendarIcon className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">Enrollment Periods</h5>
                            <p className="text-xs text-muted-foreground">Important dates & deadlines</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 border border-border/50 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <TokensIcon className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">Cost Calculator</h5>
                            <p className="text-xs text-muted-foreground">Estimate your total costs</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 h-24">
                <div className="flex items-center justify-between h-full">
                  <div>
                    <div className="text-2xl font-bold">65M+</div>
                    <div className="text-sm text-muted-foreground">Medicare Beneficiaries</div>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <PersonIcon className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </Card>
              <Card className="p-4 h-24">
                <div className="flex items-center justify-between h-full">
                  <div>
                    <div className="text-2xl font-bold">4.8/5</div>
                    <div className="text-sm text-muted-foreground">Satisfaction Rating</div>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <StarFilledIcon className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Overview Mode Related Articles - Full Width */}
      {currentView === 'overview' && currentCategory && (
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-6">
            <ReaderIcon className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Related Articles</h3>
            <p className="text-muted-foreground ml-2">Learn more about {currentCategory.name} with these helpful guides</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getRelevantArticles(currentCategory?.name || '', 9).map((article, index) => (
              <a 
                key={index} 
                href={`/resources/${article.slug}`}
                className="bg-card border border-border rounded-lg p-6 hover:bg-accent/50 transition-colors cursor-pointer min-h-[160px] flex flex-col group"
              >
                <div className="flex items-start gap-2 mb-3">
                  <h4 className="font-semibold text-foreground line-clamp-2 flex-1 group-hover:text-primary transition-colors">{article.title}</h4>
                  {article.isPopular && (
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      <StarFilledIcon className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">{article.excerpt}</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{article.readTime}</span>
                    <span>•</span>
                    <span>{article.category}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 px-3 text-xs pointer-events-none">
                    {article.linkLabel || 'Read More'}
                  </Button>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
