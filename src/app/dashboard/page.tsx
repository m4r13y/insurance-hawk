import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, FileUp, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

const chartData = [
  { month: "Jan", premium: 186 },
  { month: "Feb", premium: 186 },
  { month: "Mar", premium: 186 },
  { month: "Apr", premium: 186 },
  { month: "May", premium: 190 },
  { month: "Jun", premium: 190 },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Welcome Back, Sarah!</h1>
        <p className="text-muted-foreground">Here's your Medicare portal overview.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Your Current Plan</CardTitle>
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
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>Complete these items for your coverage.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileUp className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">Upload Documents</p>
                <p className="text-sm text-muted-foreground">Proof of residency needed.</p>
              </div>
              <Button size="sm" variant="ghost" className="ml-auto" asChild>
                <Link href="/dashboard/documents"><ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
                <CheckCircle2 className="h-6 w-6" />
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
         <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Find the Perfect Plan</CardTitle>
              <CardDescription>Our AI can help you find a plan that fits your needs.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <Sparkles className="h-8 w-8" />
                </div>
                <p className="mb-4 text-muted-foreground">Answer a few questions and we'll provide a personalized recommendation with a detailed explanation.</p>
            </CardContent>
             <CardFooter>
                 <Button className="w-full bg-accent hover:bg-accent/90" asChild>
                    <Link href="/dashboard/recommendations">Get Recommendation <ArrowRight className="ml-2 h-4 w-4" /></Link>
                 </Button>
             </CardFooter>
         </Card>
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Premium Overview</CardTitle>
                <CardDescription>Your monthly premium costs for the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                        <Tooltip
                          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)" }}
                          cursor={{ fill: 'hsl(var(--muted))' }}
                        />
                        <Bar dataKey="premium" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
