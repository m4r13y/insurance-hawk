
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ArrowRight, CheckCircle2, FileUp, PiggyBank, Shield, Activity, LifeBuoy, Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type PolicyInfo = {
    provider: string;
    planName: string;
}

const DentalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M9.34 2.15l3.93 2.75c.1.07.14.19.14.32v4.34c0 .28-.22.5-.5.5h-4.82c-.28 0-.5-.22-.5-.5V5.22c0-.13.04-.25.14-.32l3.93-2.75c.22-.15.54-.15.76 0z"/><path d="M12 10v4c0 .55.45 1 1 1h.5c.55 0 1-.45 1-1v-4"/><path d="m14 14 2.5-3"/><path d="m10 14-2.5-3"/><path d="M12 14v4.5c0 .83.67 1.5 1.5 1.5h.03c.82 0 1.47-.68 1.47-1.5V14"/><path d="M9.97 20c0 .82-.65 1.5-1.47 1.5h-.03C7.67 21.5 7 20.83 7 20v-4.5"/><path d="M14.5 9h-5c-1.1 0-2 .9-2 2v1c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-1c0-1.1-.9-2-2-2z"/>
    </svg>
);

const planTypes = [
    { id: 'health', label: 'Health/Medical Plan', icon: Shield },
    { id: 'dental', label: 'Dental Coverage', icon: DentalIcon },
    { id: 'cancer', label: 'Cancer Insurance', icon: Activity },
    { id: 'life', label: 'Life Insurance', icon: LifeBuoy },
    { id: 'ltc', label: 'Long-Term Care', icon: Home },
    { id: 'financial', label: 'Retirement Plan', icon: PiggyBank }
];


export default function DashboardPage() {
    const [policies, setPolicies] = useState<Record<string, PolicyInfo | null>>({
        health: { provider: "Blue Shield", planName: "Secure PPO" },
        dental: null,
        cancer: null,
        life: null,
        ltc: null,
        financial: null,
    });
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentPlan, setCurrentPlan] = useState<{id: string, label: string} | null>(null);
    const [tempProvider, setTempProvider] = useState("");
    const [tempPlanName, setTempPlanName] = useState("");

    const handleSwitchChange = (planId: string, planLabel: string, checked: boolean) => {
        if (checked) {
            setCurrentPlan({ id: planId, label: planLabel });
            setTempProvider("");
            setTempPlanName("");
            setIsDialogOpen(true);
        } else {
            setPolicies(prev => ({ ...prev, [planId]: null }));
        }
    };
    
    const handleSavePolicy = () => {
        if (currentPlan && tempProvider && tempPlanName) {
            setPolicies(prev => ({
                ...prev,
                [currentPlan.id]: { provider: tempProvider, planName: tempPlanName }
            }));
            setIsDialogOpen(false);
            setCurrentPlan(null);
        }
    };

    const ownedPlanCount = Object.values(policies).filter(p => p !== null).length;
    const retirementScore = Math.round((ownedPlanCount / planTypes.length) * 100);
    const missingPlans = planTypes.filter(p => !policies[p.id]);

  return (
    <div className="space-y-8 md:space-y-12">
      <div className="max-w-4xl">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Welcome Back, Sarah!</h1>
        <p className="mt-2 text-lg text-slate-600 leading-relaxed">Here's your nest overview. Manage your policies, track your progress, and discover new ways to secure your future.</p>
      </div>

      <div className="grid gap-6 md:gap-8 lg:gap-10 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Your Current Plan</CardTitle>
            <CardDescription>Blue Shield Secure PPO</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Premium</p>
                <p className="text-3xl font-bold text-slate-900">$150/mo</p>
              </div>
              <Image src="https://placehold.co/100x40.png" data-ai-hint="insurance logo" alt="Provider Logo" width={100} height={40} className="rounded-lg" />
            </div>
            <div>
              <div className="flex justify-between items-baseline text-sm mb-1">
                <p className="text-slate-500">Deductible Progress</p>
                <p className="font-medium text-slate-700">$125 / $500</p>
              </div>
              <Progress value={25} aria-label="25% of deductible met" />
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
            <CardTitle className="text-xl font-semibold">Next Steps</CardTitle>
            <CardDescription>Complete these items for your coverage.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                <FileUp className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-base text-slate-800">Upload Documents</p>
                <p className="text-sm text-slate-500">Proof of residency needed.</p>
              </div>
              <Button size="icon" variant="ghost" className="ml-auto" asChild>
                <Link href="/dashboard/documents"><ArrowRight className="h-5 w-5" /></Link>
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-base text-slate-800">Application Submitted</p>
                <p className="text-sm text-slate-500">Status: Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:gap-8 lg:gap-10 lg:grid-cols-3">
         <Card className="flex flex-col bg-slate-100/70">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Create Your Financial Plan</CardTitle>
              <CardDescription>Get a personalized retirement plan to secure your future.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                    <PiggyBank className="h-10 w-10" />
                </div>
                <p className="mb-4 text-slate-600">Answer a few questions and our AI will generate a personalized retirement plan with detailed recommendations.</p>
            </CardContent>
             <CardFooter>
                 <Button className="w-full" size="lg" asChild>
                    <Link href="/dashboard/recommendations">Create My Plan <ArrowRight className="ml-2 h-4 w-4" /></Link>
                 </Button>
             </CardFooter>
         </Card>
        
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="text-xl font-semibold">Your Retirement Readiness Score</CardTitle>
                <CardDescription>Based on your current coverage and financial planning.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div className="flex flex-col items-center justify-center text-center p-4">
                    <div className="text-7xl md:text-8xl font-extrabold text-slate-900">{retirementScore}</div>
                    <div className="font-medium text-slate-500">out of 100</div>
                    <Progress value={retirementScore} className="mt-6 w-full" indicatorClassName="bg-teal-500" />
                </div>
                <div>
                    <h4 className="font-semibold mb-4 text-lg text-slate-800">Your Current Plans</h4>
                    <p className="text-sm text-slate-500 mb-6">Toggle the switches for plans you currently have to update your score.</p>
                    <div className="space-y-5">
                        {planTypes.map(plan => (
                            <div key={plan.id} className="flex items-center justify-between">
                                <Label htmlFor={`plan-${plan.id}`} className="flex items-center gap-4 font-normal cursor-pointer text-base text-slate-700">
                                    <plan.icon className="h-6 w-6 text-slate-400" />
                                    {plan.label}
                                </Label>
                                <Switch 
                                    id={`plan-${plan.id}`}
                                    checked={!!policies[plan.id]}
                                    onCheckedChange={(checked) => handleSwitchChange(plan.id, plan.label, checked)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
            {missingPlans.length > 0 && (
                <CardFooter className="flex-col items-start border-t bg-slate-100/50 p-6 sm:p-8">
                     <h4 className="font-semibold text-slate-800 text-lg">Areas for Improvement</h4>
                     <p className="text-sm text-slate-500 mt-1 mb-4">Consider adding these plans to improve your retirement readiness.</p>
                     <div className="flex flex-wrap gap-3">
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
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Add {currentPlan?.label}</DialogTitle>
                  <DialogDescription>
                      Please enter your policy details below.
                  </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                  <div className="space-y-2">
                      <Label htmlFor="provider">Provider / Company</Label>
                      <Input id="provider" value={tempProvider} onChange={(e) => setTempProvider(e.target.value)} placeholder="e.g., Blue Shield" />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="planName">Plan Name</Label>
                      <Input id="planName" value={tempPlanName} onChange={(e) => setTempPlanName(e.target.value)} placeholder="e.g., Secure PPO" />
                  </div>
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSavePolicy}>Save Policy</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  )
}
