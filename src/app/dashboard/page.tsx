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
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
        <div className="max-w-4xl">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Welcome Back, {displayName}!</h1>
          <p className="text-blue-100 text-lg leading-relaxed">Here's your nest overview. Manage your policies, track your progress, and discover new ways to secure your future.</p>
        </div>
      </div>

      <div className="flex flex-col gap-6 md:gap-8 lg:gap-10">
        
        {/* Top Row Wrapper */}
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-10">
            {/* Card 1: Current Plan / Prompt */}
            <div className="w-full lg:w-2/3">
                {primaryHealthPlan ? (
                     <Card className="h-full shadow-lg border-0 bg-white dark:bg-neutral-800">
                      <CardHeader className="border-b border-gray-100 dark:border-neutral-700">
                        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Your Current Plan</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-neutral-400">{primaryHealthPlan.carrierName} {primaryHealthPlan.planName}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6 p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-semibold text-gray-800 dark:text-neutral-200">Monthly Premium</p>
                            <p className="mt-1 text-5xl font-bold text-blue-600 dark:text-blue-400">${(primaryHealthPlan.premium || 0).toFixed(2)}</p>
                            <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">per month</p>
                          </div>
                          {primaryHealthPlan.carrierLogoUrl && <Image src={primaryHealthPlan.carrierLogoUrl} data-ai-hint="insurance logo" alt="Provider Logo" width={100} height={40} className="rounded-lg" />}
                        </div>
                        <div>
                          <div className="flex justify-between items-baseline text-sm mb-1">
                            <p className="text-gray-600 dark:text-neutral-400">Deductible Progress</p>
                            <p className="font-medium text-gray-800 dark:text-neutral-200">$125 / $500</p>
                          </div>
                          <Progress value={25} aria-label="25% of deductible met" className="bg-gray-200 dark:bg-neutral-700" />
                        </div>
                      </CardContent>
                      <CardFooter className="border-t border-gray-100 dark:border-neutral-700 p-6">
                        <Button variant="outline" asChild>
                          <Link href="/dashboard/documents">View All Policies</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                ) : (
                     <Card className="h-full flex flex-col items-center justify-center text-center p-8 shadow-lg border-0 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-neutral-800 dark:to-neutral-900">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sky-100 text-sky-600 mb-6 shadow-lg">
                            <ShieldCheck className="h-10 w-10" />
                        </div>
                        <CardTitle className="font-bold text-2xl text-gray-900 dark:text-white mb-3">Secure Your Health</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-neutral-400 mb-6 max-w-md">You haven't added a health plan yet. Get instant quotes to find the best coverage for you.</CardDescription>
                        <CardFooter className="p-0">
                            <Button asChild size="lg" className="shadow-lg">
                                <Link href="/dashboard/health-quotes">Get Health Quotes <ArrowRight className="ml-2 h-4 w-4"/></Link>
                            </Button>
                        </CardFooter>
                    </Card>
                )}
            </div>
            
            {/* Card 2: Retirement Plan */}
            <div className="w-full lg:w-1/3">
                <Card className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-neutral-800 dark:to-neutral-900 shadow-lg border-0">
                    <CardHeader className="border-b border-blue-100 dark:border-neutral-700">
                      <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Create Your Retirement Plan</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-neutral-400">Get a personalized retirement plan to secure your future.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-6">
                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
                            <PiggyBank className="h-10 w-10" />
                        </div>
                        <p className="mb-4 text-gray-700 dark:text-neutral-300 leading-relaxed">Answer a few questions and our AI will generate a personalized retirement plan with detailed recommendations.</p>
                    </CardContent>
                     <CardFooter className="border-t border-blue-100 dark:border-neutral-700 p-6">
                         <Button className="w-full shadow-lg" size="lg" asChild>
                            <Link href="/dashboard/recommendations">Create My Plan <ArrowRight className="ml-2 h-4 w-4" /></Link>
                         </Button>
                     </CardFooter>
                 </Card>
            </div>
        </div>
        
        {/* Bottom Row */}
        <div>
            <Card className="shadow-lg border-0 bg-white dark:bg-neutral-800">
                <CardHeader className="border-b border-gray-100 dark:border-neutral-700">
                    <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Your Retirement Readiness Score</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-neutral-400">Based on your current coverage and financial planning. Add policies on the Documents page to update your score.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center p-8">
                    <div className="flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-neutral-700 dark:to-neutral-800 rounded-2xl">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-neutral-200">Retirement Readiness</h4>
                        <div className="mt-2 text-6xl sm:text-7xl font-bold text-blue-600 dark:text-blue-400">{retirementScore}</div>
                        <div className="mt-1 text-sm text-gray-500 dark:text-neutral-400">out of 100 points</div>
                        <Progress value={retirementScore} className="mt-6 w-full bg-blue-100 dark:bg-neutral-600" indicatorClassName="bg-gradient-to-r from-blue-500 to-blue-600" />
                    </div>
                    <div className="p-6">
                        <h4 className="font-semibold mb-6 text-lg text-gray-900 dark:text-white">Your Current Plans</h4>
                        {ownedPlanCategories.length > 0 ? (
                            <div className="space-y-4">
                                {ownedPlanCategories.map(category => {
                                    const planInfo = planTypes.find(p => p.id === category);
                                    const Icon = planInfo?.icon || FileDigit;
                                    return (
                                        <div key={category} className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-800">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white shadow-md">
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <p className="font-semibold text-base text-green-800 dark:text-green-400">{category}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-700 mx-auto mb-4">
                                    <FileDigit className="h-8 w-8 text-gray-400" />
                                </div>
                                <p className="text-sm text-gray-500 dark:text-neutral-400">You have no plans added yet. Go to the "My Policies" page to add your policies.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
                {missingPlans.length > 0 && (
                    <CardFooter className="flex-col items-start border-t border-gray-100 dark:border-neutral-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-neutral-800 dark:to-neutral-900 p-6 sm:p-8 rounded-b-xl">
                         <h4 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">Areas for Improvement</h4>
                         <p className="text-sm text-gray-600 dark:text-neutral-400 mb-4">Consider adding these plans to improve your retirement readiness.</p>
                         <div className="flex flex-wrap gap-3">
                            {missingPlans.map(plan => (
                                <Button key={plan.id} variant="secondary" size="sm" asChild className="shadow-sm hover:shadow-md">
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
