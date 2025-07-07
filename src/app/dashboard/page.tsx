"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, CheckCircle2, FileUp, PiggyBank, Shield, Activity, LifeBuoy, Home, FileDigit, Heart, BookOpen, ShieldCheck, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Policy } from "@/types";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";


const DentalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M9.34 2.15l3.93 2.75c.1.07.14.19.14.32v4.34c0 .28-.22.5-.5.5h-4.82c-.28 0-.5-.22-.5-.5V5.22c0-.13.04-.25.14-.32l3.93-2.75c.22-.15.54-.15.76 0z"/><path d="M12 10v4c0 .55.45 1 1 1h.5c.55 0 1-.45 1-1v-4"/><path d="m14 14 2.5-3"/><path d="m10 14-2.5-3"/><path d="M12 14v4.5c0 .83.67 1.5 1.5 1.5h-.03c.82 0 1.47-.68 1.47-1.5V14"/><path d="M9.97 20c0 .82-.65 1.5-1.47 1.5h-.03C7.67 21.5 7 20.83 7 20v-4.5"/><path d="M14.5 9h-5c-1.1 0-2 .9-2 2v1c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-1c0-1.1-.9-2-2-2z"/>
    </svg>
);

const planTypes = [
    { id: 'Health Insurance', label: 'Health/Medical Plan', icon: Shield, href: '/dashboard/health-quotes' },
    { id: 'Dental, Vision, Hearing (DVH)', label: 'Dental Coverage', icon: DentalIcon, href: '/dashboard/quotes?plan=dental' },
    { id: 'Cancer Insurance', label: 'Cancer Insurance', icon: Activity, href: '/dashboard/quotes' },
    { id: 'Life Insurance', label: 'Life Insurance', icon: LifeBuoy, href: '/dashboard/quotes' },
    { id: 'Long-Term Care (LTC)', label: 'Long-Term Care', icon: Home, href: '/dashboard/quotes' },
    { id: 'Retirement Plan', label: 'Retirement Plan', icon: PiggyBank, href: '/dashboard/recommendations' }
];

const OnboardingGuide = ({ name, onDismiss }: { name: string, onDismiss: () => void }) => (
    <div className="flex items-center justify-center h-full">
        <Card className="max-w-3xl mx-auto text-center animate-in fade-in-50 zoom-in-95">
            <CardHeader className="p-8 sm:p-12">
                 <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 mb-6">
                    <CheckCircle2 className="h-10 w-10" />
                </div>
                <CardTitle className="font-headline text-3xl sm:text-4xl pt-2">Welcome to Hawk<span className="text-primary">Nest</span>, {name}!</CardTitle>
                <CardDescription className="text-lg mt-2">Let's get your nest set up. What would you like to do first?</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 px-8">
                <Button asChild size="lg" variant="outline" className="h-auto py-4 justify-start text-left">
                    <Link href="/dashboard/recommendations">
                        <PiggyBank className="mr-3 h-6 w-6 text-primary" />
                        <span className="flex flex-col">
                            <span className="font-semibold">Create a Retirement Plan</span>
                            <span className="text-xs text-muted-foreground">Get personalized retirement advice.</span>
                        </span>
                    </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-auto py-4 justify-start text-left">
                    <Link href="/dashboard/health-quotes">
                        <Heart className="mr-3 h-6 w-6 text-primary" />
                        <span className="flex flex-col">
                            <span className="font-semibold">Get Health Quotes</span>
                            <span className="text-xs text-muted-foreground">For individuals under 65.</span>
                        </span>
                    </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-auto py-4 justify-start text-left">
                    <Link href="/dashboard/quotes">
                        <FileDigit className="mr-3 h-6 w-6 text-primary" />
                        <span className="flex flex-col">
                            <span className="font-semibold">Get Supplemental Quotes</span>
                            <span className="text-xs text-muted-foreground">For Medigap, Dental, and more.</span>
                        </span>
                    </Link>
                </Button>
            </CardContent>
            <CardFooter className="p-8">
                <Button onClick={onDismiss} variant="ghost" className="w-full text-muted-foreground">
                    I'll explore on my own
                </Button>
            </CardFooter>
        </Card>
    </div>
);


export default function DashboardPage() {
    const [user, authLoading] = useFirebaseAuth();
    const [isNewUser, setIsNewUser] = useState(false);
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [policiesLoading, setPoliciesLoading] = useState(true);
    
    useEffect(() => {
        const newUserFlag = localStorage.getItem("isNewUser") === "true";
        setIsNewUser(newUserFlag);

        if (user && db) {
            const q = query(collection(db, "users", user.uid, "policies"));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const userPolicies: Policy[] = [];
                querySnapshot.forEach((doc) => {
                    userPolicies.push({ id: doc.id, ...doc.data() } as Policy);
                });
                setPolicies(userPolicies);
                setPoliciesLoading(false);
            });
            return () => unsubscribe();
        } else {
            setPoliciesLoading(false);
        }
    }, [user]);

    const handleDismissOnboarding = () => {
        localStorage.removeItem("isNewUser");
        setIsNewUser(false);
    };

    if (authLoading || policiesLoading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div>;
    }
    
    if (!user) return null; // Layout should redirect

    if (isNewUser) {
        return <OnboardingGuide name={user.displayName?.split(' ')[0] || 'there'} onDismiss={handleDismissOnboarding} />;
    }

    const ownedPlanCategories = [...new Set(policies.map(p => p.policyCategoryName))];
    const retirementScore = Math.round((ownedPlanCategories.length / planTypes.length) * 100);
    const missingPlans = planTypes.filter(p => !ownedPlanCategories.includes(p.id));
    const primaryHealthPlan = policies.find(p => p.policyCategoryName === 'Health Insurance');
    const displayName = user.displayName?.split(' ')[0] || 'there';

  return (
    <div className="space-y-8 md:space-y-12">
      <div className="max-w-4xl">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Welcome Back, {displayName}!</h1>
        <p className="mt-2 text-lg text-slate-600 leading-relaxed">Here's your nest overview. Manage your policies, track your progress, and discover new ways to secure your future.</p>
      </div>

      <div className="flex flex-col gap-6 md:gap-8 lg:gap-10">
        
        {/* Top Row Wrapper */}
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-10">
            {/* Card 1: Current Plan / Prompt */}
            <div className="w-full lg:w-2/3">
                {primaryHealthPlan ? (
                     <Card className="h-full">
                      <CardHeader>
                        <CardTitle>Your Current Plan</CardTitle>
                        <CardDescription>{primaryHealthPlan.carrierName} {primaryHealthPlan.planName}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-500">Premium</p>
                            <p className="text-3xl font-bold text-slate-900">${(primaryHealthPlan.premium || 0).toFixed(2)}/mo</p>
                          </div>
                          {primaryHealthPlan.carrierLogoUrl && <Image src={primaryHealthPlan.carrierLogoUrl} data-ai-hint="insurance logo" alt="Provider Logo" width={100} height={40} className="rounded-lg" />}
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
                          <Link href="/dashboard/documents">View All Policies</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                ) : (
                     <Card className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sky-100 text-sky-600 mb-6">
                            <ShieldCheck className="h-10 w-10" />
                        </div>
                        <CardTitle className="font-headline text-2xl">Secure Your Health</CardTitle>
                        <CardDescription className="mt-2">You haven't added a health plan yet. Get instant quotes to find the best coverage for you.</CardDescription>
                        <CardFooter className="mt-6 p-0">
                            <Button asChild size="lg">
                                <Link href="/dashboard/health-quotes">Get Health Quotes <ArrowRight className="ml-2 h-4 w-4"/></Link>
                            </Button>
                        </CardFooter>
                    </Card>
                )}
            </div>
            
            {/* Card 2: Retirement Plan */}
            <div className="w-full lg:w-1/3">
                <Card className="h-full flex flex-col bg-slate-100/70">
                    <CardHeader>
                      <CardTitle>Create Your Retirement Plan</CardTitle>
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
            </div>
        </div>
        
        {/* Bottom Row */}
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Your Retirement Readiness Score</CardTitle>
                    <CardDescription>Based on your current coverage and financial planning. Add policies on the Documents page to update your score.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    <div className="flex flex-col items-center justify-center text-center p-4">
                        <div className="text-7xl md:text-8xl font-extrabold text-slate-900">{retirementScore}</div>
                        <div className="font-medium text-slate-500">out of 100</div>
                        <Progress value={retirementScore} className="mt-6 w-full" indicatorClassName="bg-teal-500" />
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4 text-lg text-slate-800">Your Current Plans</h4>
                        {ownedPlanCategories.length > 0 ? (
                            <div className="space-y-4">
                                {ownedPlanCategories.map(category => {
                                    const planInfo = planTypes.find(p => p.id === category);
                                    const Icon = planInfo?.icon || FileDigit;
                                    return (
                                        <div key={category} className="flex items-center gap-4 p-3 bg-green-50 rounded-md border border-green-200">
                                            <Icon className="h-6 w-6 text-green-600" />
                                            <p className="font-medium text-base text-green-800">{category}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 text-center py-4 border rounded-lg">You have no plans added yet. Go to the "My Policies" page to add your policies.</p>
                        )}
                    </div>
                </CardContent>
                {missingPlans.length > 0 && (
                    <CardFooter className="flex-col items-start border-t bg-slate-100/50 p-6 sm:p-8">
                         <h4 className="font-semibold text-slate-800 text-lg">Areas for Improvement</h4>
                         <p className="text-sm text-slate-500 mt-1 mb-4">Consider adding these plans to improve your retirement readiness.</p>
                         <div className="flex flex-wrap gap-3">
                            {missingPlans.map(plan => (
                                <Button key={plan.id} variant="secondary" size="sm" asChild>
                                    <Link href={plan.href || '#'}>
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
    </div>
  )
}
