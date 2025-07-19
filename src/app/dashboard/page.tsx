"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, CheckCircle2, PiggyBank, Shield, Activity, LifeBuoy, Home, FileDigit, Heart, ShieldCheck, Loader2 } from "lucide-react";
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
        <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
            <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 dark:from-blue-700 dark:via-blue-800 dark:to-blue-900 rounded-2xl lg:rounded-3xl p-8 lg:p-12 text-white shadow-xl">
                    <div className="max-w-4xl">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 lg:mb-6">
                            Welcome Back, {displayName}!
                        </h1>
                        <p className="text-blue-100 text-lg lg:text-xl leading-relaxed opacity-90 max-w-3xl">
                            Here's your comprehensive overview. Manage your policies, track your progress, and discover new ways to secure your future.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Current Plan / Prompt */}
                        {primaryHealthPlan ? (
                            <Card className="shadow-xl border-0 bg-white dark:bg-neutral-800 hover:shadow-2xl transition-shadow duration-200">
                                <CardHeader className="border-b border-gray-100 dark:border-neutral-700 pb-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-neutral-800 dark:to-neutral-700 rounded-t-xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/10 rounded-full flex items-center justify-center">
                                            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                                                Your Current Plan
                                            </CardTitle>
                                            <CardDescription className="text-gray-600 dark:text-neutral-400 text-base">
                                                {primaryHealthPlan.carrierName} {primaryHealthPlan.planName}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-8 p-8">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-neutral-400 mb-2">Monthly Premium</p>
                                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                                ${primaryHealthPlan.premium?.toFixed(2) || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-600 dark:text-neutral-400 mb-2">Status</p>
                                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                                                primaryHealthPlan.status === 'active' 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400'
                                                    : primaryHealthPlan.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400'
                                            }`}>
                                                {primaryHealthPlan.status.charAt(0).toUpperCase() + primaryHealthPlan.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                    <Button asChild className="w-full h-12 text-base">
                                        <Link href="/dashboard/plans">
                                            <Shield className="mr-2 h-5 w-5" />
                                            View Plan Details
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="shadow-xl border-0 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-neutral-800 dark:to-neutral-900 hover:shadow-2xl transition-shadow duration-200">
                                <CardContent className="flex flex-col items-center justify-center text-center p-12">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-6">
                                        <ShieldCheck className="h-10 w-10" />
                                    </div>
                                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                        Secure Your Health
                                    </CardTitle>
                                    <CardDescription className="text-gray-600 dark:text-neutral-400 mb-8 max-w-md text-base leading-relaxed">
                                        You haven't added a health plan yet. Get instant quotes to find the best coverage for you.
                                    </CardDescription>
                                    <Button asChild size="lg" className="h-12 px-8">
                                        <Link href="/dashboard/health-quotes">
                                            <Heart className="mr-2 h-5 w-5" />
                                            Get Health Quotes
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Quick Actions */}
                        <Card className="shadow-xl border-0 bg-white dark:bg-neutral-800">
                            <CardHeader className="border-b border-gray-100 dark:border-neutral-700 pb-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-neutral-800 dark:to-neutral-700 rounded-t-xl">
                                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Quick Actions
                                </CardTitle>
                                <CardDescription className="text-gray-600 dark:text-neutral-400 text-base">
                                    Common tasks and tools
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {planTypes.slice(0, 4).map((planType) => {
                                        const Icon = planType.icon;
                                        return (
                                            <Button
                                                key={planType.id}
                                                asChild
                                                variant="outline"
                                                className="h-auto p-6 justify-start text-left hover:bg-gray-50 dark:hover:bg-neutral-700 hover:shadow-md transition-all duration-200"
                                            >
                                                <Link href={planType.href}>
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/10 rounded-lg flex items-center justify-center">
                                                            <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <span className="font-medium text-base">{planType.label}</span>
                                                    </div>
                                                </Link>
                                            </Button>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Retirement Score */}
                        <Card className="shadow-xl border-0 bg-white dark:bg-neutral-800">
                            <CardHeader className="text-center pb-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-neutral-800 dark:to-neutral-700 rounded-t-xl">
                                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Retirement Readiness
                                </CardTitle>
                                <CardDescription className="text-gray-600 dark:text-neutral-400 text-base">
                                    Your coverage score
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-center p-8">
                                <div className="relative w-28 h-28 mx-auto mb-6">
                                    <div className="w-full h-full bg-gray-200 dark:bg-neutral-700 rounded-full">
                                        <div 
                                            className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center"
                                            style={{ background: `conic-gradient(from 0deg, #3b82f6 0%, #3b82f6 ${retirementScore}%, #e5e7eb ${retirementScore}%, #e5e7eb 100%)` }}
                                        >
                                            <div className="w-20 h-20 bg-white dark:bg-neutral-800 rounded-full flex items-center justify-center">
                                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {retirementScore}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-base text-gray-600 dark:text-neutral-400 mb-6">
                                    You have {ownedPlanCategories.length} of {planTypes.length} plan types
                                </p>
                                <Button asChild variant="outline" size="lg" className="w-full h-12">
                                    <Link href="/dashboard/recommendations">
                                        <PiggyBank className="mr-2 h-5 w-5" />
                                        Improve Score
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Missing Plans */}
                        {missingPlans.length > 0 && (
                            <Card className="shadow-xl border-0 bg-white dark:bg-neutral-800">
                                <CardHeader className="pb-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-neutral-800 dark:to-neutral-700 rounded-t-xl">
                                    <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Suggested Coverage
                                    </CardTitle>
                                    <CardDescription className="text-gray-600 dark:text-neutral-400 text-base">
                                        Plans you might need
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="space-y-4">
                                        {missingPlans.slice(0, 3).map((plan) => {
                                            const Icon = plan.icon;
                                            return (
                                                <Button
                                                    key={plan.id}
                                                    asChild
                                                    variant="ghost"
                                                    className="w-full justify-start h-auto p-4 hover:bg-gray-50 dark:hover:bg-neutral-700 hover:shadow-sm transition-all duration-200"
                                                >
                                                    <Link href={plan.href}>
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-500/10 rounded-md flex items-center justify-center">
                                                                <Icon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                                            </div>
                                                            <span className="text-base font-medium">{plan.label}</span>
                                                            <ArrowRight className="w-4 h-4 ml-auto text-gray-400" />
                                                        </div>
                                                    </Link>
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
