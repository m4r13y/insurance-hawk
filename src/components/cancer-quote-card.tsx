
"use client"

import type { CancerQuote, CancerQuoteRequestValues } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, HeartCrack, Edit, User, Users, MapPin, Calendar, Cigarette, CreditCard, Shield } from 'lucide-react';
import Link from 'next/link';

interface CancerQuoteCardProps {
  quote: CancerQuote;
  quoteInputs?: CancerQuoteRequestValues;
  onEdit?: () => void;
}

export function CancerQuoteCard({ quote, quoteInputs, onEdit }: CancerQuoteCardProps) {
  return (
    <Card className="flex flex-col h-full w-full max-w-md transition-colors hover:border-primary/50 hover:shadow-lg">
      <CardHeader className="p-6 text-center relative">
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit quote</span>
          </Button>
        )}
        <HeartCrack className="h-12 w-12 mx-auto text-primary" />
        <CardTitle className="text-xl font-bold text-slate-900 pt-4">{quote.carrier}</CardTitle>
        <CardDescription>{quote.plan_name}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4 px-6 text-center">
        <div className="flex items-baseline justify-center gap-2 border-t pt-4">
          <p className="text-4xl font-extrabold tracking-tight text-slate-900">${quote.monthly_premium.toFixed(2)}</p>
          <span className="text-lg text-slate-500">/mo</span>
        </div>
        
        {/* Quote Details */}
        <div className="space-y-3 text-sm text-left border-t pt-4">
          <div className="flex items-center gap-3">
            <Check className="h-4 w-4 shrink-0 text-teal-500"/>
            <span>Benefit Amount: <strong>${new Intl.NumberFormat().format(quote.benefit_amount)}</strong></span>
          </div>
          
          {quoteInputs && (
            <>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-blue-500"/>
                <span>State: <strong>{quoteInputs.state}</strong></span>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 shrink-0 text-purple-500"/>
                <span>Age: <strong>{quoteInputs.age}</strong></span>
              </div>
              
              <div className="flex items-center gap-3">
                {quoteInputs.familyType === "Applicant Only" ? (
                  <User className="h-4 w-4 shrink-0 text-green-500"/>
                ) : (
                  <Users className="h-4 w-4 shrink-0 text-green-500"/>
                )}
                <span>Coverage: <strong>{quoteInputs.familyType}</strong></span>
              </div>
              
              <div className="flex items-center gap-3">
                <Cigarette className="h-4 w-4 shrink-0 text-orange-500"/>
                <span>Tobacco: <strong>{quoteInputs.tobaccoStatus}</strong></span>
              </div>
              
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 shrink-0 text-indigo-500"/>
                <span>Payment: <strong>{quoteInputs.premiumMode}</strong></span>
              </div>
              
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 shrink-0 text-red-500"/>
                <span>Carcinoma In Situ: <strong>{quoteInputs.carcinomaInSitu} Benefit</strong></span>
              </div>
            </>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="mt-auto p-6">
        <Button asChild className="w-full" size="lg">
          <Link href={`/dashboard/apply?type=cancer&planName=${encodeURIComponent(quote.plan_name)}&provider=${encodeURIComponent(quote.carrier)}&premium=${quote.monthly_premium}&benefitAmount=${quote.benefit_amount}${quoteInputs ? `&state=${quoteInputs.state}&age=${quoteInputs.age}&familyType=${encodeURIComponent(quoteInputs.familyType)}&tobaccoStatus=${encodeURIComponent(quoteInputs.tobaccoStatus)}` : ''}`}>
            Select Plan
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
