
"use client"

import type { DentalQuote } from '@/types';
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

export function DentalQuoteCard({ quote }: { quote: DentalQuote }) {
  const [user] = useFirebaseAuth();
  const { toast } = useToast();

  const handleSelectPlan = async () => {
    if (!user || !db) return;
    
    try {
      const quotesCol = collection(db, "users", user.uid, "quotes");
      await addDoc(quotesCol, {
        type: 'dental',
        requestData: {
          planName: quote.plan_name,
          provider: quote.carrier.name,
          applicationType: 'dental'
        },
        resultData: {
          monthly_premium: quote.monthly_premium,
          carrier: quote.carrier,
          plan_name: quote.plan_name,
          am_best_rating: quote.am_best_rating,
          benefit_amount: quote.benefit_amount,
          benefit_quantifier: quote.benefit_quantifier
        },
        timestamp: serverTimestamp(),
        status: 'selected'
      });

      toast({
        title: "Quote Saved",
        description: "Your dental quote has been saved to your account.",
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
              Dental
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
            <span>Maximum Benefit: <strong className="text-gray-800 dark:text-neutral-200">${new Intl.NumberFormat().format(Number(quote.benefit_amount))}</strong></span>
          </li>
          <li className="flex items-center gap-3">
            <Check className="h-5 w-5 text-teal-500 shrink-0"/>
            <span>Benefit Period: <strong className="text-gray-800 dark:text-neutral-200 capitalize">{quote.benefit_quantifier}</strong></span>
          </li>
          <li className="flex items-center gap-3">
            <Check className="h-5 w-5 text-teal-500 shrink-0"/>
            <span>AM Best Rating: <strong className="text-gray-800 dark:text-neutral-200">{quote.am_best_rating}</strong></span>
          </li>
        </ul>
        {(quote.benefit_notes || quote.limitation_notes) && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="details" className="border-t pt-4">
              <AccordionTrigger className="p-0 text-sm font-semibold hover:no-underline">
                View Details
              </AccordionTrigger>
              <AccordionContent className="prose prose-sm max-w-none pt-2 text-xs text-gray-500 dark:text-neutral-500">
                {quote.benefit_notes && <div dangerouslySetInnerHTML={{ __html: quote.benefit_notes }} />}
                {quote.limitation_notes && <div className="mt-2" dangerouslySetInnerHTML={{ __html: quote.limitation_notes }} />}
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
            window.location.href = `/dashboard/apply?type=dental&planName=${encodeURIComponent(quote.plan_name)}&provider=${encodeURIComponent(quote.carrier.name)}&premium=${quote.monthly_premium}`;
          }}
        >
          Select Plan
        </Button>
      </CardFooter>
    </Card>
  )
}
