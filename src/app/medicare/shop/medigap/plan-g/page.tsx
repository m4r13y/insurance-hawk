"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeftIcon,
  StarFilledIcon,
  CheckIcon,
  InfoCircledIcon
} from '@radix-ui/react-icons';

export default function PlanGPage() {
  const router = useRouter();

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <section className="py-4 border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Medicare</span>
            <span>/</span>
            <span>Shop</span>
            <span>/</span>
            <span>Medigap</span>
            <span>/</span>
            <span className="text-foreground font-medium">Plan G</span>
          </div>
        </div>
      </section>

      {/* Header */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/medicare/shop?category=medigap')}
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Medigap Plans
            </Button>
          </div>
          
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-3xl font-bold">Medigap Plan G</h1>
            <Badge variant="secondary" className="flex items-center gap-1">
              <StarFilledIcon className="w-3 h-3" />
              Most Popular
            </Badge>
          </div>
          
          <p className="text-muted-foreground text-lg max-w-2xl">
            Comprehensive Medigap coverage with excellent value. Plan G covers most 
            out-of-pocket costs except the Part B deductible.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Coverage Details */}
            <Card>
              <CardHeader>
                <CardTitle>What Plan G Covers</CardTitle>
                <CardDescription>
                  Comprehensive coverage for Medicare gaps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    "Part A deductible ($1,632)",
                    "Part A coinsurance and hospital costs",
                    "Part B coinsurance (20%)",
                    "Part B excess charges",
                    "Blood (first 3 pints)",
                    "Skilled nursing facility care coinsurance",
                    "Hospice care coinsurance",
                    "Foreign travel emergency (80%)"
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* What's Not Covered */}
            <Card>
              <CardHeader>
                <CardTitle>What You Pay</CardTitle>
                <CardDescription>
                  Costs not covered by Plan G
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Part B Deductible</span>
                    <span className="text-sm text-muted-foreground">$240 per year (2025)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Monthly Premium</span>
                    <span className="text-sm text-muted-foreground">Varies by location & insurer</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Why Choose Plan G */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <InfoCircledIcon className="w-5 h-5" />
                  Why Plan G is Popular
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Predictable Costs</h4>
                    <p className="text-sm text-muted-foreground">
                      Once you meet the Part B deductible, Plan G covers virtually all your remaining costs,
                      making your healthcare expenses predictable.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">No Networks</h4>
                    <p className="text-sm text-muted-foreground">
                      Visit any doctor or hospital that accepts Medicare, anywhere in the United States.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Standardized Benefits</h4>
                    <p className="text-sm text-muted-foreground">
                      Plan G benefits are the same regardless of which insurance company you choose,
                      so you can shop based on price and customer service.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Plan G Quick Facts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Monthly Premium Range</span>
                    <span className="text-sm">$120-350</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Annual Deductible</span>
                    <span className="text-sm">$240 (Part B only)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Coverage Level</span>
                    <span className="text-sm">Comprehensive</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Best For</span>
                    <span className="text-sm">Most people</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <Card>
              <CardHeader>
                <CardTitle>Ready to Enroll?</CardTitle>
                <CardDescription>
                  Get personalized quotes from licensed agents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full">
                  Get Plan G Quotes
                </Button>
                <Button variant="outline" className="w-full">
                  Compare with Other Plans
                </Button>
                <Button variant="ghost" className="w-full text-sm">
                  Schedule Consultation
                </Button>
              </CardContent>
            </Card>

            {/* Alternative Plans */}
            <Card>
              <CardHeader>
                <CardTitle>Also Consider</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <button 
                    className="w-full text-left p-3 rounded-lg border hover:bg-muted transition-colors"
                    onClick={() => router.push('/medicare/shop/medigap/plan-n')}
                  >
                    <div className="font-medium">Plan N</div>
                    <div className="text-xs text-muted-foreground">Lower premium, small copays</div>
                  </button>
                  <button 
                    className="w-full text-left p-3 rounded-lg border hover:bg-muted transition-colors"
                    onClick={() => router.push('/medicare/shop/advantage')}
                  >
                    <div className="font-medium">Medicare Advantage</div>
                    <div className="text-xs text-muted-foreground">All-in-one alternative</div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
