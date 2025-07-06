
"use client"

import type { DentalQuote } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

export function DentalQuoteCard({ quote }: { quote: DentalQuote }) {
  return (
    <Card className="flex flex-col h-full hover:border-primary/50 hover:shadow-lg transition-colors">
      <CardHeader className="p-8">
        <CardTitle className="text-xl font-bold text-slate-900">{quote.carrier.name}</CardTitle>
        <CardDescription>{quote.plan_name}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-6 px-8">
        <div className="flex items-baseline gap-2 border-t pt-6">
            <p className="text-5xl font-extrabold tracking-tight text-slate-900">${quote.monthly_premium.toFixed(2)}</p>
            <span className="text-lg text-slate-500">/mo</span>
        </div>
         <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-teal-500 shrink-0"/>
                <span>Benefit: <strong>${new Intl.NumberFormat().format(Number(quote.benefit_amount))}</strong></span>
            </li>
            <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-teal-500 shrink-0"/>
                <span className="capitalize">{quote.benefit_quantifier}</span>
            </li>
        </ul>
        {(quote.benefit_notes || quote.limitation_notes) && (
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="details" className="border-t pt-4">
                    <AccordionTrigger className="text-sm font-semibold p-0 hover:no-underline">View Details</AccordionTrigger>
                    <AccordionContent className="pt-2 text-xs text-slate-600 prose prose-sm max-w-none">
                        {quote.benefit_notes && <div dangerouslySetInnerHTML={{ __html: quote.benefit_notes }} />}
                        {quote.limitation_notes && <div className="mt-2" dangerouslySetInnerHTML={{ __html: quote.limitation_notes }} />}
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
