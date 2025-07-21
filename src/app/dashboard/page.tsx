
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import type { Policy } from "@/types";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";
import { getCarrierLogo } from "@/lib/mock-data";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
    HealthIcon,
    DentalCareIcon,
    Cardiogram02Icon,
    FirstAidKitIcon,
    Home01Icon as HomeIcon,
    PiggyBankIcon,
    File01Icon,
    CheckmarkCircleIcon,
    LoaderIcon,
    ArrowRight01Icon,
} from '@hugeicons/core-free-icons';

const DentalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M9.34 2.15l3.93 2.75c.1.07.14.19.14.32v4.34c0 .28-.22.5-.5.5h-4.82c-.28 0-.5-.22-.5-.5V5.22c0-.13.04-.25.14-.32l3.93-2.75c.22-.15.54-.15.76 0z"/><path d="M12 10v4c0 .55.45 1 1 1h.5c.55 0 1-.45 1-1v-4"/><path d="m14 14 2.5-3"/><path d="m10 14-2.5-3"/><path d="M12 14v4.5c0 .83.67 1.5 1.5 1.5h-.03c.82 0 1.47-.68 1.47-1.5V14"/><path d="M9.97 20c0 .82-.65 1.5-1.47 1.5h-.03C7.67 21.5 7 20.83 7 20v-4.5"/><path d="M14.5 9h-5c-1.1 0-2 .9-2 2v1c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-1c0-1.1-.9-2-2-2z"/>
    </svg>
);

const planTypes = [
    { id: 'Health Insurance', label: 'Health/Medical Plan', icon: HealthIcon, href: '/dashboard/health-quotes' },
    { id: 'Dental, Vision, Hearing (DVH)', label: 'Dental Coverage', icon: DentalCareIcon, href: '/dashboard/quotes?plan=dental' },
    { id: 'Cancer Insurance', label: 'Cancer Insurance', icon: Cardiogram02Icon, href: '/dashboard/quotes' },
    { id: 'Life Insurance', label: 'Life Insurance', icon: FirstAidKitIcon, href: '/dashboard/quotes' },
    { id: 'Long-Term Care (LTC)', label: 'Long-Term Care', icon: HomeIcon, href: '/dashboard/quotes' },
    { id: 'Retirement Plan', label: 'Retirement Plan', icon: PiggyBankIcon, href: '/dashboard/recommendations' }
];

const OnboardingGuide = ({ name, onDismiss }: { name: string, onDismiss: () => void }) => (
    <div className="flex items-center justify-center h-full">
        <Card className="max-w-3xl mx-auto text-center animate-in fade-in-50 zoom-in-95">
            <CardHeader className="p-8 sm:p-12">
                 <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 mb-6">
                    <HugeiconsIcon icon={CheckmarkCircleIcon} className="h-10 w-10" />
                </div>
                <CardTitle className="font-headline text-3xl sm:text-4xl pt-2">Welcome to Hawk<span className="text-primary">Nest</span>, {name}!</CardTitle>
                <CardDescription className="text-lg mt-2">Let's get your nest set up. What would you like to do first?</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 px-8">
                <Button asChild size="lg" variant="outline" className="h-auto py-4 justify-start text-left">
                    <Link href="/dashboard/recommendations">
                        <HugeiconsIcon icon={PiggyBankIcon} className="mr-3 h-6 w-6 text-primary" />
                        <span className="flex flex-col">
                            <span className="font-semibold">Create a Retirement Plan</span>
                            <span className="text-xs text-muted-foreground">Get personalized retirement advice.</span>
                        </span>
                    </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-auto py-4 justify-start text-left">
                    <Link href="/dashboard/health-quotes">
                        <HugeiconsIcon icon={HealthIcon} className="mr-3 h-6 w-6 text-primary" />
                        <span className="flex flex-col">
                            <span className="font-semibold">Get Health Quotes</span>
                            <span className="text-xs text-muted-foreground">For individuals under 65.</span>
                        </span>
                    </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-auto py-4 justify-start text-left">
                    <Link href="/dashboard/quotes">
                        <HugeiconsIcon icon={File01Icon} className="mr-3 h-6 w-6 text-primary" />
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
        return <div className="flex h-full items-center justify-center"><HugeiconsIcon icon={LoaderIcon} className="h-8 w-8 animate-spin"/></div>;
    }
    
    if (!user) return null; // Layout should redirect

    if (isNewUser) {
        return <OnboardingGuide name={user.displayName?.split(' ')[0] || 'there'} onDismiss={handleDismissOnboarding} />;
    }

    const ownedPlanCategories = [...new Set((policies || []).map(p => p.policyCategoryName))];
    const retirementScore = Math.round((ownedPlanCategories.length / planTypes.length) * 100);
    const missingPlans = planTypes.filter(p => !ownedPlanCategories.includes(p.id));
    const primaryHealthPlan = (policies || []).find(p => p.policyCategoryName === 'Health Insurance');
    const displayName = user.displayName?.split(' ')[0] || 'there';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
            <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 dark:from-blue-700 dark:via-blue-800 dark:to-blue-900 rounded-xl lg:rounded-2xl p-6 lg:p-8 text-white shadow-xl">
                    <div className="max-w-4xl">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3 lg:mb-4">
                            Welcome Back, {displayName}!
                        </h1>
                        <p className="text-blue-100 text-base lg:text-lg leading-relaxed opacity-90 max-w-3xl">
                            Here's your comprehensive overview. Manage your policies, track your progress, and discover new ways to secure your future.
                        </p>
                    </div>
                </div>

                {/* Mobile/Tablet Retirement Readiness - Show on smaller screens */}
                <div className="xl:hidden mb-4 sm:mb-6">
                    <Card className="shadow-sm border-0 bg-white dark:bg-neutral-800">
                        <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-1">
                                        Retirement Readiness
                                    </h3>
                                    <p className="text-gray-600 dark:text-neutral-400 text-xs sm:text-sm mb-2 sm:mb-3">
                                        You have <span className="font-semibold text-gray-900 dark:text-white">{ownedPlanCategories.length} of {planTypes.length}</span> plan types
                                    </p>
                                    <Button asChild size="sm" variant="outline" className="h-7 text-xs sm:h-8 sm:text-sm">
                                        <Link href="/dashboard/recommendations">
                                            <HugeiconsIcon icon={PiggyBankIcon} className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                                            <span className="hidden sm:inline">Improve Score</span>
                                            <span className="sm:hidden">Improve</span>
                                        </Link>
                                    </Button>
                                </div>
                                <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0 ml-3 sm:ml-4">
                                    <div className="w-full h-full bg-gray-200 dark:bg-neutral-700 rounded-full">
                                        <div 
                                            className="w-full h-full rounded-full flex items-center justify-center"
                                            style={{ background: `conic-gradient(from 0deg, #3b82f6 0%, #3b82f6 ${retirementScore}%, #e5e7eb ${retirementScore}%, #e5e7eb 100%)` }}
                                        >
                                            <div className="w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white dark:bg-neutral-800 rounded-full flex items-center justify-center">
                                                <span className="text-sm sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                                                    {retirementScore}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Content Area */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Plan Overview Grid */}
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Your Coverage Overview
                                </h2>
                                <p className="text-gray-600 dark:text-neutral-400 text-base lg:text-lg mb-4">
                                    Manage your existing plans or get quotes for new coverage
                                </p>
                            </div>
                            <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 lg:gap-6">
                                <div className="xl:col-span-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {planTypes.map((planType) => {
                                    const Icon = planType.icon;
                                    const userPolicy = (policies || []).find(p => p.policyCategoryName === planType.id);
                                    
                                    if (userPolicy) {
                                        // Get carrier logo using our utility function
                                        const carrierLogoUrl = getCarrierLogo(userPolicy.carrierName || '');
                                        
                                        // Dynamic status styling
                                        const getStatusDisplay = (status: Policy['status']) => {
                                            switch (status) {
                                                case 'active':
                                                    return {
                                                        text: 'Active',
                                                        dotColor: 'bg-green-500',
                                                        textColor: 'text-green-700 dark:text-green-400'
                                                    };
                                                case 'pending':
                                                    return {
                                                        text: 'Pending',
                                                        dotColor: 'bg-yellow-500',
                                                        textColor: 'text-yellow-700 dark:text-yellow-400'
                                                    };
                                                case 'declined':
                                                    return {
                                                        text: 'Declined',
                                                        dotColor: 'bg-red-500',
                                                        textColor: 'text-red-700 dark:text-red-400'
                                                    };
                                                default:
                                                    return {
                                                        text: 'Unknown',
                                                        dotColor: 'bg-gray-500',
                                                        textColor: 'text-gray-700 dark:text-gray-400'
                                                    };
                                            }
                                        };
                                        
                                        const statusDisplay = getStatusDisplay(userPolicy.status);
                                        const borderColor = userPolicy.status === 'active' ? 'border-green-200 dark:border-green-800' : 
                                                          userPolicy.status === 'pending' ? 'border-yellow-200 dark:border-yellow-800' : 
                                                          'border-red-200 dark:border-red-800';
                                        
                                        // Show existing policy
                                        return (
                                            <Card key={planType.id} className={`shadow-sm border ${borderColor} bg-white dark:bg-neutral-800 hover:shadow-md transition-all duration-200`}>
                                                <CardContent className="p-4">
                                                    {/* Mobile Layout - Horizontal */}
                                                    <div className="flex items-center gap-3 min-h-[64px] sm:hidden">
                                                        <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                            {carrierLogoUrl ? (
                                                                <Image
                                                                    src={carrierLogoUrl}
                                                                    alt={userPolicy.carrierName || 'Carrier logo'}
                                                                    width={48}
                                                                    height={48}
                                                                    className="w-12 h-12 object-contain rounded-lg"
                                                                    unoptimized
                                                                    onError={(e) => {
                                                                        // Fallback to icon if logo fails to load
                                                                        e.currentTarget.style.display = 'none';
                                                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                                    }}
                                                                />
                                                            ) : null}
                                                            <HugeiconsIcon icon={Icon} className={`w-7 h-7 ${statusDisplay.textColor} ${carrierLogoUrl ? 'hidden' : ''}`} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate leading-tight mb-1">{planType.label}</h3>
                                                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-1">
                                                                {userPolicy.carrierName}
                                                            </p>
                                                            <div className="flex items-center gap-1.5">
                                                                <div className={`w-1.5 h-1.5 ${statusDisplay.dotColor} rounded-full`}></div>
                                                                <span className={`text-xs font-medium ${statusDisplay.textColor}`}>{statusDisplay.text}</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right flex-shrink-0 ml-3">
                                                            {userPolicy.premium && (
                                                                <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                                                                    ${userPolicy.premium.toFixed(2)}/month
                                                                </p>
                                                            )}
                                                            <Button asChild variant="outline" className="h-8 text-xs whitespace-nowrap" size="sm">
                                                                <Link href="/dashboard/plans">
                                                                    View Details
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {/* Tablet+ Layout - Vertical */}
                                                    <div className="hidden sm:block text-left">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                                {carrierLogoUrl ? (
                                                                    <Image
                                                                        src={carrierLogoUrl}
                                                                        alt={userPolicy.carrierName || 'Carrier logo'}
                                                                        width={48}
                                                                        height={48}
                                                                        className="lg:w-14 lg:h-14 object-contain rounded-lg"
                                                                        unoptimized
                                                                        onError={(e) => {
                                                                            // Fallback to icon if logo fails to load
                                                                            e.currentTarget.style.display = 'none';
                                                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                                        }}
                                                                    />
                                                                ) : null}
                                                                <HugeiconsIcon icon={Icon} className={`w-7 h-7 lg:w-8 lg:h-8 ${statusDisplay.textColor} ${carrierLogoUrl ? 'hidden' : ''}`} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 truncate">
                                                                    {userPolicy.carrierName}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1 mb-4">
                                                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">{planType.label}</h3>
                                                            <div className="flex items-center gap-1.5">
                                                                <div className={`w-1.5 h-1.5 ${statusDisplay.dotColor} rounded-full`}></div>
                                                                <span className={`text-xs lg:text-sm font-medium ${statusDisplay.textColor}`}>{statusDisplay.text}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-2">
                                                            {userPolicy.premium && (
                                                                <p className="text-sm lg:text-base font-bold text-gray-900 dark:text-white flex-shrink-0">
                                                                    ${userPolicy.premium.toFixed(2)}/month
                                                                </p>
                                                            )}
                                                            <Button asChild variant="outline" className="h-8 text-xs lg:h-9 lg:text-sm flex-shrink-0 min-w-[60px]" size="sm">
                                                                <Link href="/dashboard/plans">
                                                                    <span className="hidden lg:inline">View Details</span>
                                                                    <span className="lg:hidden">View</span>
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    } else {
                                        // Show get quote option - clean organized design
                                        return (
                                            <Card key={planType.id} className="shadow-sm border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-neutral-800 hover:shadow-md transition-all duration-200 cursor-pointer group">
                                                <Link href={planType.href}>
                                                    <CardContent className="p-4">
                                                        {/* Mobile Layout - Horizontal */}
                                                        <div className="flex items-center gap-3 min-h-[64px] sm:hidden">
                                                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                                                                <HugeiconsIcon icon={Icon} className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                                                            </div>
                                                            <div className="flex-1 min-w-0 flex items-center justify-between">
                                                                <div className="flex-1 min-w-0">
                                                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate leading-tight mb-1">{planType.label}</h3>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                                                                        <span className="text-xs text-gray-500 dark:text-gray-400">Not covered</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors ml-3 whitespace-nowrap">
                                                                    Get Quotes <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 ml-1.5" />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Tablet+ Layout - Vertical */}
                                                        <div className="hidden sm:block text-left">
                                                            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200">
                                                                <HugeiconsIcon icon={Icon} className="w-7 h-7 lg:w-8 lg:h-8 text-blue-600 dark:text-blue-400" />
                                                            </div>
                                                            <div className="space-y-1 mb-4">
                                                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">{planType.label}</h3>
                                                                <div className="flex items-center gap-1.5">
                                                                    <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                                                                    <span className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Not covered</span>
                                                                </div>
                                                            </div>
                                                            <div className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm lg:text-base group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                                                                Get Quotes <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 ml-1.5" />
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Link>
                                            </Card>
                                        );
                                    }
                                        })}
                                    </div>
                                </div>
                                
                                {/* Desktop Sidebar - Retirement Readiness (Hidden on mobile) */}
                                <div className="hidden xl:block xl:col-span-1">
                                    <Card className="shadow-lg border-0 bg-white dark:bg-neutral-800 h-full">
                                        <CardContent className="p-6 h-full flex flex-col justify-center">
                                            <div className="text-center space-y-6">
                                                <div>
                                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                                        Retirement Readiness
                                                    </h2>
                                                    <p className="text-gray-600 dark:text-neutral-400 text-sm">
                                                        Your coverage score
                                                    </p>
                                                </div>
                                                
                                                <div className="relative w-32 h-32 mx-auto">
                                                    <div className="w-full h-full bg-gray-200 dark:bg-neutral-700 rounded-full">
                                                        <div 
                                                            className="w-full h-full rounded-full flex items-center justify-center"
                                                            style={{ background: `conic-gradient(from 0deg, #3b82f6 0%, #3b82f6 ${retirementScore}%, #e5e7eb ${retirementScore}%, #e5e7eb 100%)` }}
                                                        >
                                                            <div className="w-24 h-24 bg-white dark:bg-neutral-800 rounded-full flex items-center justify-center">
                                                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                                                    {retirementScore}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-4">
                                                    <p className="text-sm text-gray-600 dark:text-neutral-400">
                                                        You have <span className="font-semibold text-gray-900 dark:text-white">{ownedPlanCategories.length} of {planTypes.length}</span> plan types
                                                    </p>
                                                    
                                                    <Button asChild className="w-full" size="sm">
                                                        <Link href="/dashboard/recommendations">
                                                            <HugeiconsIcon icon={PiggyBankIcon} className="h-4 w-4 mr-2" />
                                                            Improve Score
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    