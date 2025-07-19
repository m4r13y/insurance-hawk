
"use client"

import type { CancerQuote } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, HeartCrack, Edit } from 'lucide-react';
import Link from 'next/link';
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
    <Card className="group transition-all duration-300 hover:shadow-md focus:outline-hidden focus:shadow-md w-full max-w-sm">
      <CardHeader>
        <div className="flex justify-between items-start mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-500">
            <HeartCrack className="h-6 w-6 text-white" />
          </div>
          <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
        <span className="block mb-1 text-xs font-semibold uppercase text-rose-600 dark:text-rose-500">
          Cancer Insurance
        </span>
        <CardTitle>{quote.carrier}</CardTitle>
        <CardDescription>{quote.plan_name}</CardDescription>
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
          <li className="text-center p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
            <p className="text-sm font-semibold text-gray-800 dark:text-neutral-200">Lump-Sum Benefit</p>
            <p className="mt-1 text-3xl font-bold text-rose-600 dark:text-rose-400">${new Intl.NumberFormat().format(quote.benefit_amount)}</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">upon diagnosis</p>
          </li>
          <li className="flex items-center gap-3">
            <Check className="h-5 w-5 shrink-0 text-teal-500"/>
            <span>Pays a lump-sum upon diagnosis</span>
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
