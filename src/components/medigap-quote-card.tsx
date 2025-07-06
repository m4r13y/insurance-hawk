
"use client"

import type { Quote } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

const getStarRating = (rating: string) => {
    if (!rating || rating === "N/A") return <span className="text-muted-foreground">N/A</span>;
    const filledStar = '★';
    const emptyStar = '☆';
    if (rating === 'A++' || rating === 'A+') return <span className="text-amber-500">{filledStar.repeat(5)}</span>;
    if (rating === 'A') return <span className="text-amber-500">{filledStar.repeat(4) + emptyStar}</span>;
    if (rating === 'A-') return <span className="text-amber-500">{filledStar.repeat(3) + emptyStar.repeat(2)}</span>;
    if (rating === 'B+' || rating === 'B') return <span className="text-amber-500">{filledStar.repeat(2) + emptyStar.repeat(3)}</span>;
    if (rating) return <span className="text-amber-500">{filledStar + emptyStar.repeat(4)}</span>;
    return <span className="text-amber-500">{emptyStar.repeat(5)}</span>;
};


export function MedigapQuoteCard({ quote }: { quote: Quote }) {
  return (
    <Card className="flex flex-col h-full hover:border-primary/50 hover:shadow-lg transition-colors">
      <CardHeader className="p-8">
        <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-bold text-slate-900">{quote.carrier.name}</CardTitle>
            <div className="text-xs">
                {getStarRating(quote.am_best_rating)}
            </div>
        </div>
        <CardDescription>{quote.plan_name}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-6 px-8">
        <div className="flex items-baseline gap-2 border-t pt-6">
            <p className="text-5xl font-extrabold tracking-tight text-slate-900">${quote.monthly_premium.toFixed(2)}</p>
            <span className="text-lg text-slate-500">/mo</span>
        </div>
        {quote.discounts && quote.discounts.length > 0 && (
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="discounts" className="border-t pt-4">
                    <AccordionTrigger className="text-sm font-semibold p-0 hover:no-underline">View Available Discounts</AccordionTrigger>
                    <AccordionContent className="pt-2">
                        <ul className="space-y-1 text-xs text-slate-600">
                            {quote.discounts.map((d, i) => (
                                <li key={i} className="capitalize flex items-center gap-2">
                                    <Check className="h-4 w-4 text-teal-500 shrink-0"/>
                                    {d.name}: {d.value * 100}%
                                </li>
                            ))}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        )}
      </CardContent>
      <CardFooter className="p-8 mt-auto">
          <Button asChild className="w-full" size="lg">
            <Link href={`/dashboard/apply?planName=${encodeURIComponent(quote.plan_name)}&provider=${encodeURIComponent(quote.carrier.name)}&premium=${quote.monthly_premium}`}>Select Plan</Link>
          </Button>
      </CardFooter>
    </Card>
  )
}
