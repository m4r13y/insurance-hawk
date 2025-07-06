
"use client"

import type { Plan } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Eye, Ear, Pill, Star } from 'lucide-react';
import Link from 'next/link';

export function PlanCard({ plan, showSelectButton = true }: { plan: Plan, showSelectButton?: boolean }) {
  return (
    <Card className="flex flex-col h-full hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <Badge variant="secondary" className="mb-2">{plan.type}</Badge>
            <CardTitle className="text-lg">{plan.name}</CardTitle>
            <CardDescription>{plan.provider}</CardDescription>
          </div>
          <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
            <Star className="h-4 w-4 fill-current" />
            <span>{plan.rating.toFixed(1)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div className="flex justify-between items-baseline border-b pb-4">
          <p className="text-2xl sm:text-3xl font-bold">${plan.premium}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-muted-foreground">Deductible</p><p className="font-medium">${plan.deductible}</p></div>
            <div><p className="text-muted-foreground">Max Out-of-Pocket</p><p className="font-medium">${plan.maxOutOfPocket}</p></div>
        </div>
        <div>
            <h4 className="text-sm font-medium mb-2">Key Features</h4>
            <div className="flex flex-wrap gap-2">
                {plan.features.prescriptionDrug && <Badge variant="outline"><Pill className="mr-1.5 h-3 w-3"/>Drugs</Badge>}
                {plan.features.dental && <Badge variant="outline"><Heart className="mr-1.5 h-3 w-3"/>Dental</Badge>}
                {plan.features.vision && <Badge variant="outline"><Eye className="mr-1.5 h-3 w-3"/>Vision</Badge>}
                {plan.features.hearing && <Badge variant="outline"><Ear className="mr-1.5 h-3 w-3"/>Hearing</Badge>}
            </div>
        </div>
      </CardContent>
      {showSelectButton && (
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/dashboard/apply">Select Plan</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
