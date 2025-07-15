
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
    <Card className="flex flex-col h-full w-full max-w-sm transition-colors hover:border-primary/50 hover:shadow-lg">
      <CardHeader className="p-8 text-center">
        <div className="flex justify-between items-start mb-4">
          <HeartCrack className="h-12 w-12 text-primary" />
          <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
        <CardTitle className="text-xl font-bold text-slate-900">{quote.carrier}</CardTitle>
        <CardDescription>{quote.plan_name}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-6 px-8 text-center">
        <div className="flex items-baseline justify-center gap-2 border-t pt-6">
            <p className="text-5xl font-extrabold tracking-tight text-slate-900">${quote.monthly_premium.toFixed(2)}</p>
            <span className="text-lg text-slate-500">/mo</span>
        </div>
         <ul className="space-y-3 text-sm text-slate-600 text-left">
            <li className="flex items-center gap-3">
                <Check className="h-5 w-5 shrink-0 text-teal-500"/>
                <span>Benefit Amount: <strong>${new Intl.NumberFormat().format(quote.benefit_amount)}</strong></span>
            </li>
        </ul>
      </CardContent>
      <CardFooter className="mt-auto p-8">
          <Button 
            className="w-full" 
            size="lg"
            onClick={async () => {
              await handleSelectPlan();
              // Navigate after saving
              window.location.href = `/dashboard/apply?type=cancer&planName=${encodeURIComponent(quote.plan_name)}&provider=${encodeURIComponent(quote.carrier)}&premium=${quote.monthly_premium}`;
            }}
          >
            Select Plan
          </Button>
      </CardFooter>
    </Card>
  )
}
