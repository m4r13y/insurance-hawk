
"use client"

import type { CancerQuote } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star } from 'lucide-react';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export function CancerQuoteCard({ quote }: { quote: CancerQuote }) {
  const [user] = useFirebaseAuth();
  const { toast } = useToast();

  const handleSelectPlan = async () => {
    if (!user || !db) return;
    
    try {
      // Just show success message - quote will be saved during application process
      toast({
        title: "Quote Selected",
        description: "Proceeding to application with selected quote.",
      });
    } catch (error) {
      console.error("Error selecting quote:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to select quote. Please try again.",
      });
    }
  };

  return (
    <Card className="group transition-all duration-300 relative hover:shadow-md focus:outline-hidden focus:shadow-md">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <span className="block mb-1 text-xs font-semibold uppercase text-blue-600 dark:text-blue-400">
              Cancer
            </span>
            <CardTitle>{quote.carrier}</CardTitle>
            <CardDescription>{quote.plan_name}</CardDescription>
          </div>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="font-bold text-sm">4.5</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-6">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-800 dark:text-neutral-200">Monthly Premium</p>
          <p className="mt-1 text-5xl font-bold text-blue-600 dark:text-blue-400">
            ${quote.monthly_premium.toFixed(2)}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">per month</p>
        </div>
        <ul className="space-y-3 text-sm text-gray-500 dark:text-neutral-500">
          <li className="flex items-center gap-3">
            <Check className="h-5 w-5 text-teal-500 shrink-0"/>
            <span>Lump-Sum Benefit: <strong className="text-gray-800 dark:text-neutral-200">${new Intl.NumberFormat().format(quote.benefit_amount)}</strong></span>
          </li>
          <li className="flex items-center gap-3">
            <Check className="h-5 w-5 text-teal-500 shrink-0"/>
            <span>Pays upon diagnosis</span>
          </li>
          <li className="flex items-center gap-3">
            <Check className="h-5 w-5 text-teal-500 shrink-0"/>
            <span>Use for any cancer-related expenses</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          size="lg"
          onClick={async () => {
            await handleSelectPlan();
            window.location.href = `/dashboard/apply?type=cancer&planName=${encodeURIComponent(quote.plan_name)}&provider=${encodeURIComponent(quote.carrier)}&premium=${quote.monthly_premium}`;
          }}
        >
          Select Plan
        </Button>
      </CardFooter>
    </Card>
  )
}
