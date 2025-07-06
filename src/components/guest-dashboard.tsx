
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen, FileDigit, Heart, UserPlus } from "lucide-react";
import Link from "next/link";

export const GuestDashboard = () => (
    <div className="space-y-8 md:space-y-12">
        <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Your Policies, All in One Nest.</h1>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed">Welcome to HawkNest. Compare plans from top carriers, get personalized recommendations, and securely manage your insurance and financial plans from one convenient place.</p>
             <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" asChild><Link href="/?mode=signup">Create Your Account <UserPlus className="ml-2 h-4 w-4"/></Link></Button>
                <Button size="lg" variant="outline" asChild><Link href="/dashboard/plans">Browse Plans</Link></Button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
                <CardHeader className="flex-row items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-100 text-sky-600 shrink-0"><Heart className="h-6 w-6"/></div>
                    <CardTitle>Health Insurance Quotes</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>Find affordable health coverage for individuals and families under 65.</CardDescription>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                        <Link href="/dashboard/health-quotes">Get Health Quotes <ArrowRight className="ml-2 h-4 w-4"/></Link>
                    </Button>
                </CardFooter>
            </Card>
             <Card>
                <CardHeader className="flex-row items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100 text-teal-600 shrink-0"><FileDigit className="h-6 w-6"/></div>
                    <CardTitle>Supplemental Quotes</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>Get instant quotes for Medigap, Dental, and other supplemental plans.</CardDescription>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                        <Link href="/dashboard/quotes">Get Supplemental Quotes <ArrowRight className="ml-2 h-4 w-4"/></Link>
                    </Button>
                </CardFooter>
            </Card>
            <Card>
                <CardHeader className="flex-row items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-600 shrink-0"><BookOpen className="h-6 w-6"/></div>
                    <CardTitle>Education Center</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>Understand your options with our AI-powered educational resources.</CardDescription>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                        <Link href="/dashboard/education">Learn More <ArrowRight className="ml-2 h-4 w-4"/></Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    </div>
);
