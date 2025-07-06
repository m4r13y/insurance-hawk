"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowRight, CheckCircle2, FileUp, Sparkles, Shield, Eye, LifeBuoy, Home, PiggyBank } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";


// Custom icon for Dental since it's not in lucide-react
const DentalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M9.34 2.15l3.93 2.75c.1.07.14.19.14.32v4.34c0 .28-.22.5-.5.5h-4.82c-.28 0-.5-.22-.5-.5V5.22c0-.13.04-.25.14-.32l3.93-2.75c.22-.15.54-.15.76 0z"/><path d="M12 10v4c0 .55.45 1 1 1h.5c.55 0 1-.45 1-1v-4"/><path d="m14 14 2.5-3"/><path d="m10 14-2.5-3"/><path d="M12 14v4.5c0 .83.67 1.5 1.5 1.5h.03c.82 0 1.47-.68 1.47-1.5V14"/><path d="M9.97 20c0 .82-.65 1.5-1.47 1.5h-.03C7.67 21.5 7 20.83 7 20v-4.5"/><path d="M14.5 9h-5c-1.1 0-2 .9-2 2v1c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-1c0-1.1-.9-2-2-2z"/>
    </svg>
);


export default function DashboardPage() {
    const planTypes = [
        { id: 'health', label: 'Health/Medical Plan', icon: Shield },
        { id: 'dental', label: 'Dental Coverage', icon: DentalIcon },
        { id: 'vision', label: 'Vision Coverage', icon: Eye },
        { id: 'life', label: 'Life Insurance', icon: LifeBuoy },
        { id: 'ltc', label: 'Long-Term Care', icon: Home },
        { id: 'financial', label: 'Retirement Plan', icon: PiggyBank }
    ];

    const [ownedPlans, setOwnedPlans] = useState(['health']);
    
    const retirementScore = Math.round((ownedPlans.length / planTypes.length) * 100);

    const handlePlanToggle = (planId: string) => {
        setOwnedPlans(prev => 
            prev.includes(planId) ? prev.filter(p => p !== planId) : [...prev, planId]
        );
    };

    const missingPlans = planTypes.filter(p => !ownedPlans.includes(p.id));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-primary from-40% to-accent bg-clip-text text-transparent">Welcome Back, Sarah!</h1>
        <p className="text-muted-foreground mt-1">Here's your nest overview.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">Your Current Plan</CardTitle>
            <CardDescription>Blue Shield Secure PPO</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Premium</p>
                <p className="text-2xl font-bold">$150/mo</p>
              </div>
              <Image src="https://placehold.co/100x40.png" data-ai-hint="insurance logo" alt="Provider Logo" width={100} height={40} className="rounded-lg" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Deductible Progress</p>
              <div className="mt-1 flex items-center gap-2">
                <Progress value={25} aria-label="25% of deductible met" />
                <span className="text-sm font-medium">$125 / $500</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild>
              <Link href="/dashboard/plans">View Plan Details</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl">Next Steps</CardTitle>
            <CardDescription>Complete these items for your coverage.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileUp className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Upload Documents</p>
                <p className="text-sm text-muted-foreground">Proof of residency needed.</p>
              </div>
              <Button size="icon" variant="ghost" className="ml-auto" asChild>
                <Link href="/dashboard/documents"><ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Application Submitted</p>
                <p className="text-sm text-muted-foreground">Status: Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
         <Card className="flex flex-col bg-primary/5">
            <CardHeader>
              <CardTitle className="text-xl">Create Your Financial Plan</CardTitle>
              <CardDescription>Get a personalized retirement plan to secure your future.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <PiggyBank className="h-8 w-8" />
                </div>
                <p className="mb-4 text-muted-foreground">Answer a few questions and our AI will generate a personalized retirement plan with detailed recommendations.</p>
            </CardContent>
             <CardFooter>
                 <Button className="w-full bg-accent hover:bg-accent/90" asChild>
                    <Link href="/dashboard/recommendations">Create My Plan <ArrowRight className="ml-2 h-4 w-4" /></Link>
                 </Button>
             </CardFooter>
         </Card>
        
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="text-xl">Your Retirement Readiness Score</CardTitle>
                <CardDescription>Based on your current coverage and financial planning.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="flex flex-col items-center justify-center text-center p-4">
                    <div className="text-7xl font-bold text-primary">{retirementScore}</div>
                    <div className="font-medium text-muted-foreground">out of 100</div>
                    <Progress value={retirementScore} className="mt-4 w-full" indicatorClassName="bg-accent" />
                </div>
                <div>
                    <h4 className="font-semibold mb-3">Your Current Plans</h4>
                    <p className="text-sm text-muted-foreground mb-4">Check the boxes for plans you currently have to update your score.</p>
                    <div className="space-y-3">
                        {planTypes.map(plan => (
                            <div key={plan.id} className="flex items-center">
                                <Checkbox 
                                    id={`plan-${plan.id}`}
                                    checked={ownedPlans.includes(plan.id)}
                                    onCheckedChange={() => handlePlanToggle(plan.id)}
                                    className="h-5 w-5"
                                />
                                <Label htmlFor={`plan-${plan.id}`} className="flex items-center gap-3 font-normal ml-3 cursor-pointer">
                                    <plan.icon className="h-5 w-5 text-muted-foreground" />
                                    {plan.label}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
            {missingPlans.length > 0 && (
                <CardFooter className="flex-col items-start border-t pt-6 bg-secondary/50">
                     <h4 className="font-semibold text-card-foreground">Areas for Improvement</h4>
                     <p className="text-sm text-muted-foreground mt-1 mb-4">Consider adding these plans to improve your retirement readiness.</p>
                     <div className="flex flex-wrap gap-2">
                        {missingPlans.map(plan => (
                            <Button key={plan.id} variant="secondary" size="sm" asChild>
                                <Link href={plan.id === 'financial' ? '/dashboard/financial-plan' : '/dashboard/quotes'}>
                                    Add {plan.label}
                                </Link>
                            </Button>
                        ))}
                     </div>
                </CardFooter>
            )}
        </Card>
      </div>
    </div>
  )
}
