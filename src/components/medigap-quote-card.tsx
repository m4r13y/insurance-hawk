
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
    const filledStar = <Star className="h-4 w-4 text-amber-400 fill-amber-400" />;
    const emptyStar = <Star className="h-4 w-4 text-amber-200 fill-amber-200" />;
    
    if (rating === 'A++' || rating === 'A+') return <div className="flex">{Array(5).fill(filledStar)}</div>;
    if (rating === 'A') return <div className="flex">{Array(4).fill(filledStar)}{emptyStar}</div>;
    if (rating === 'A-') return <div className="flex">{Array(3).fill(filledStar)}{Array(2).fill(emptyStar)}</div>;
    if (rating === 'B+' || rating === 'B') return <div className="flex">{Array(2).fill(filledStar)}{Array(3).fill(emptyStar)}</div>;
    if (rating) return <div className="flex">{filledStar}{Array(4).fill(emptyStar)}</div>;
    return <div className="flex">{Array(5).fill(emptyStar)}</div>;
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
    <Card className="flex flex-col h-full transition-colors hover:border-primary/50 hover:shadow-lg">
      <CardHeader className="p-8">
        <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl font-bold text-slate-900">{quote.carrier.name}</CardTitle>
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
      <CardContent className="flex-1 space-y-6 px-8">
        <div className="flex items-baseline gap-2 border-t pt-6">
            <p className="text-5xl font-extrabold tracking-tight text-slate-900">${quote.monthly_premium.toFixed(2)}</p>
            <span className="text-lg text-slate-500">/mo</span>
        </div>
        <ul className="space-y-3 text-sm text-slate-600">
          <li className="flex items-center gap-3">
              <Check className="h-5 w-5 shrink-0 text-teal-500"/>
              <span>AM Best Rating: <strong>{quote.am_best_rating}</strong></span>
          </li>
          <li className="flex items-center gap-3">
              <Check className="h-5 w-5 shrink-0 text-teal-500"/>
              <span>Rate Type: <Badge variant="secondary">{quote.rate_type}</Badge></span>
          </li>
      </ul>
        {quote.discounts && quote.discounts.length > 0 && (
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="discounts" className="border-t pt-4">
                    <AccordionTrigger className="p-0 text-sm font-semibold hover:no-underline">View Available Discounts</AccordionTrigger>
                    <AccordionContent className="pt-2">
                        <ul className="space-y-1 text-xs text-slate-600">
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
      <CardFooter className="mt-auto p-8">
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
