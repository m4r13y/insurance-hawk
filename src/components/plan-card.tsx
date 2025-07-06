
"use client"

import type { Plan } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Pill, Star, Eye, Ear, Heart } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function PlanCard({ plan, showSelectButton = true, isFeatured = false }: { plan: Plan, showSelectButton?: boolean, isFeatured?: boolean }) {
  
  const getApplicationType = (category: string) => {
    switch (category) {
      case 'Medicare Supplement':
        return 'medicare-supplement';
      case 'Dental':
        return 'dental';
      case 'Hospital Indemnity':
        return 'hospital-indemnity';
      case 'Life Insurance':
        return 'life-insurance';
      default:
        return 'medicare-supplement';
    }
  }

  const applicationType = getApplicationType(plan.category);
  const applicationUrl = `/dashboard/apply?type=${applicationType}&planId=${plan.id}&planName=${encodeURIComponent(plan.name)}&provider=${encodeURIComponent(plan.provider)}&premium=${plan.premium}`;
  
  return (
    <Card className={cn(
        "flex flex-col h-full transition-all duration-300 relative",
        isFeatured ? "border-sky-500 shadow-lg" : "hover:border-primary/50 hover:shadow-lg"
    )}>
      {isFeatured && <Badge className="absolute -top-3 left-8 bg-sky-500 text-white">Best Value</Badge>}
      <CardHeader className="p-8">
        <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold text-slate-900">{plan.name}</CardTitle>
            <div className="flex items-center gap-1 text-amber-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="font-bold">{plan.rating.toFixed(1)}</span>
            </div>
        </div>
        <CardDescription>{plan.provider}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-6 px-8">
        <div className="flex items-baseline gap-2">
            <p className="text-5xl font-extrabold tracking-tight text-slate-900">${plan.premium}</p>
            <span className="text-lg text-slate-500">/mo</span>
        </div>
        <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-teal-500 shrink-0"/>
                <span>Deductible: <strong>${plan.deductible.toLocaleString()}</strong></span>
            </li>
            <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-teal-500 shrink-0"/>
                <span>Max Out-of-Pocket: <strong>${plan.maxOutOfPocket.toLocaleString()}</strong></span>
            </li>
            {plan.features.prescriptionDrug && <li className="flex items-center gap-3"><Check className="h-5 w-5 text-teal-500 shrink-0"/><span>Prescription Drug Coverage</span></li>}
            {plan.features.dental && <li className="flex items-center gap-3"><Check className="h-5 w-5 text-teal-500 shrink-0"/><span>Dental Coverage</span></li>}
            {plan.features.vision && <li className="flex items-center gap-3"><Check className="h-5 w-5 text-teal-500 shrink-0"/><span>Vision Coverage</span></li>}
            {plan.features.hearing && <li className="flex items-center gap-3"><Check className="h-5 w-5 text-teal-500 shrink-0"/><span>Hearing Coverage</span></li>}
        </ul>
      </CardContent>
      {showSelectButton && (
        <CardFooter className="p-8 mt-auto">
          <Button asChild className="w-full" size="lg" variant={isFeatured ? 'default' : 'outline'}>
            <Link href={applicationUrl}>Select Plan</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
