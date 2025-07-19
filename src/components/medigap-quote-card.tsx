
"use client"

import type { Quote } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const getRatingScore = (rating: string) => {
    if (!rating || rating === "N/A") return 0;
    if (rating === 'A++' || rating === 'A+') return 5.0;
    if (rating === 'A') return 4.5;
    if (rating === 'A-') return 4.0;
    if (rating === 'B+' || rating === 'B') return 3.5;
    if (rating === 'B-') return 3.0;
    return 2.5;
};

export function MedigapQuoteCard({ quote }: { quote: Quote }) {
  const [user] = useFirebaseAuth();
  const { toast } = useToast();

  const handleSelectPlan = async () => {
    if (!user || !db) return;
    
    try {
      const quotesCol = collection(db, "users", user.uid, "quotes");
      await addDoc(quotesCol, {
        type: 'medicare-supplement',
        requestData: {
          planName: quote.plan_name,
          provider: quote.carrier.name,
          applicationType: 'medicare-supplement'
        },
        resultData: {
          monthly_premium: quote.monthly_premium,
          carrier: quote.carrier,
          plan_name: quote.plan_name,
          plan_type: quote.plan_type,
          discounts: quote.discounts,
          am_best_rating: quote.am_best_rating,
          rate_type: quote.rate_type
        },
        timestamp: serverTimestamp(),
        status: 'selected'
      });

      toast({
        title: "Quote Saved",
        description: "Your Medicare Supplement quote has been saved to your account.",
      });
    } catch (error) {
      console.error("Error saving quote:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save quote. Please try again.",
      });
    }
  };

  return (
    <Card className="group transition-all duration-300 relative hover:shadow-md focus:outline-hidden focus:shadow-md">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <span className="block mb-1 text-xs font-semibold uppercase text-blue-600 dark:text-blue-400">
              Medicare Supplement
            </span>
            <CardTitle>{quote.carrier.name}</CardTitle>
            <CardDescription>{quote.plan_name}</CardDescription>
          </div>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="font-bold text-sm">{getRatingScore(quote.am_best_rating).toFixed(1)}</span>
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
            <span>AM Best Rating: <strong className="text-gray-800 dark:text-neutral-200">{quote.am_best_rating}</strong></span>
          </li>
          <li className="flex items-center gap-3">
            <Check className="h-5 w-5 text-teal-500 shrink-0"/>
            <span>Rate Type: <strong className="text-gray-800 dark:text-neutral-200">{quote.rate_type}</strong></span>
          </li>
          {quote.discounts && quote.discounts.length > 0 && (
            <li className="flex items-center gap-3">
              <Check className="h-5 w-5 text-teal-500 shrink-0"/>
              <span><strong className="text-gray-800 dark:text-neutral-200">{quote.discounts.length} Discount{quote.discounts.length > 1 ? 's' : ''}</strong> Available</span>
            </li>
          )}
        </ul>
        {quote.discounts && quote.discounts.length > 0 && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="discounts" className="border-t pt-4">
              <AccordionTrigger className="p-0 text-sm font-semibold hover:no-underline">
                View Available Discounts
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <ul className="space-y-1 text-xs text-gray-500 dark:text-neutral-500">
                  {quote.discounts.map((d, i) => (
                    <li key={i} className="flex items-center gap-2 capitalize">
                      <Check className="h-4 w-4 shrink-0 text-teal-500"/>
                      {d.name}: {d.value * 100}%
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          size="lg"
          onClick={async () => {
            await handleSelectPlan();
            window.location.href = `/dashboard/apply?type=medicare-supplement&planName=${encodeURIComponent(quote.plan_name)}&provider=${encodeURIComponent(quote.carrier.name)}&premium=${quote.monthly_premium}`;
          }}
        >
          Select Plan
        </Button>
      </CardFooter>
    </Card>
  )
}
