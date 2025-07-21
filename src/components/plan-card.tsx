
"use client"

import type { Plan } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircleIcon, StarIcon } from '@hugeicons/core-free-icons';

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
        "group transition-all duration-300 relative hover:shadow-md focus:outline-hidden focus:shadow-md",
        isFeatured ? "border-blue-500 shadow-lg" : "hover:border-primary/50"
    )}>
      {isFeatured && (
        <div className="absolute -top-3 left-8 z-10">
          <span className="hs-button hs-button-primary px-3 py-1 rounded-full text-xs font-semibold uppercase">
            Best Value
          </span>
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <span className="block mb-1 text-xs font-semibold uppercase text-blue-600 dark:text-blue-400">
              {plan.category}
            </span>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.provider}</CardDescription>
          </div>
          <div className="flex items-center gap-1 text-amber-500">
            <HugeiconsIcon icon={StarIcon} className="h-4 w-4 fill-current" />
            <span className="font-bold text-sm">{plan.rating.toFixed(1)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-6">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-800 dark:text-neutral-200">Monthly Premium</p>
          <p className="mt-1 text-5xl font-bold text-blue-600 dark:text-blue-400">
            ${plan.premium}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">per month</p>
        </div>
        <ul className="space-y-3 text-sm text-gray-500 dark:text-neutral-500">
          <li className="flex items-center gap-3">
            <HugeiconsIcon icon={CheckmarkCircleIcon} className="h-5 w-5 text-teal-500 shrink-0"/>
            <span>Deductible: <strong className="text-gray-800 dark:text-neutral-200">${plan.deductible.toLocaleString()}</strong></span>
          </li>
          <li className="flex items-center gap-3">
            <HugeiconsIcon icon={CheckmarkCircleIcon} className="h-5 w-5 text-teal-500 shrink-0"/>
            <span>Max Out-of-Pocket: <strong className="text-gray-800 dark:text-neutral-200">${plan.maxOutOfPocket.toLocaleString()}</strong></span>
          </li>
          {plan.features.prescriptionDrug && (
            <li className="flex items-center gap-3">
              <HugeiconsIcon icon={CheckmarkCircleIcon} className="h-5 w-5 text-teal-500 shrink-0"/>
              <span>Prescription Drug Coverage</span>
            </li>
          )}
          {plan.features.dental && (
            <li className="flex items-center gap-3">
              <HugeiconsIcon icon={CheckmarkCircleIcon} className="h-5 w-5 text-teal-500 shrink-0"/>
              <span>Dental Coverage</span>
            </li>
          )}
          {plan.features.vision && (
            <li className="flex items-center gap-3">
              <HugeiconsIcon icon={CheckmarkCircleIcon} className="h-5 w-5 text-teal-500 shrink-0"/>
              <span>Vision Coverage</span>
            </li>
          )}
          {plan.features.hearing && (
            <li className="flex items-center gap-3">
              <HugeiconsIcon icon={CheckmarkCircleIcon} className="h-5 w-5 text-teal-500 shrink-0"/>
              <span>Hearing Coverage</span>
            </li>
          )}
        </ul>
      </CardContent>
      {showSelectButton && (
        <CardFooter>
          <Button asChild className="w-full" size="lg" variant={isFeatured ? 'default' : 'outline'}>
            <Link href={applicationUrl}>Select Plan</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
