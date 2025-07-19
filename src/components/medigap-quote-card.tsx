
"use client"

import type { Quote } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Edit, Star } from 'lucide-react';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';

const getStarRating = (rating: string) => {
    if (!rating || rating === "N/A") return <span className="text-muted-foreground">N/A</span>;
    
    const filledStar = (key: number) => <Star key={`filled-${key}`} className="h-4 w-4 text-amber-400 fill-amber-400" />;
    const emptyStar = (key: number) => <Star key={`empty-${key}`} className="h-4 w-4 text-amber-200 fill-amber-200" />;

    const renderStars = (filledCount: number) => (
        <div className="flex">
            {Array.from({ length: filledCount }, (_, i) => filledStar(i))}
            {Array.from({ length: 5 - filledCount }, (_, i) => emptyStar(i))}
        </div>
    );
    
    if (rating === 'A++' || rating === 'A+') return renderStars(5);
    if (rating === 'A') return renderStars(4);
    if (rating === 'A-') return renderStars(3);
    if (rating === 'B+' || rating === 'B') return renderStars(2);
    if (rating) return renderStars(1);
    return renderStars(0);
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
    <Card className="group transition-all duration-300 hover:shadow-md focus:outline-hidden focus:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <span className="block mb-1 text-xs font-semibold uppercase text-blue-600 dark:text-blue-500">
              Medicare Supplement
            </span>
            <CardTitle>{quote.carrier.name}</CardTitle>
            <CardDescription>{quote.plan_name}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs">
              {getStarRating(quote.am_best_rating)}
            </div>
            <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
              <Edit className="h-4 w-4" />
            </Button>
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
            <Check className="h-5 w-5 shrink-0 text-teal-500"/>
            <span>AM Best Rating: <strong className="text-gray-800 dark:text-neutral-200">{quote.am_best_rating}</strong></span>
          </li>
          <li className="flex items-center gap-3">
            <Check className="h-5 w-5 shrink-0 text-teal-500"/>
            <span>Rate Type: <Badge variant="secondary">{quote.rate_type}</Badge></span>
          </li>
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
