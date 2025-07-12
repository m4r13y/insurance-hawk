
"use client"

import type { CancerQuote } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, HeartCrack } from 'lucide-react';
import Link from 'next/link';

export function CancerQuoteCard({ quote }: { quote: CancerQuote }) {
  return (
    <Card className="flex flex-col h-full w-full max-w-sm transition-colors hover:border-primary/50 hover:shadow-lg">
      <CardHeader className="p-8 text-center">
        <HeartCrack className="h-12 w-12 mx-auto text-primary" />
        <CardTitle className="text-xl font-bold text-slate-900 pt-4">{quote.carrier}</CardTitle>
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
          <Button asChild className="w-full" size="lg">
            <Link href={`/dashboard/apply?type=cancer&planName=${encodeURIComponent(quote.plan_name)}&provider=${encodeURIComponent(quote.carrier)}&premium=${quote.monthly_premium}`}>Select Plan</Link>
          </Button>
      </CardFooter>
    </Card>
  )
}
