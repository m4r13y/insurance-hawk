
"use client";

import React, { useState, useTransition } from 'react';
import type { HealthPlan } from '@/types';
import type { z } from 'zod';
import type { healthQuoterFormSchema } from './health-insurance-quoter';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Loader2, RefreshCw, Info } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getHealthQuotes } from '@/app/dashboard/health-quotes/actions';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

type FormValues = z.infer<typeof healthQuoterFormSchema>;
interface HealthPlanResultsTableProps {
  initialPlans: HealthPlan[];
  searchParams: FormValues;
  onBack: () => void;
}

export function HealthPlanResultsTable({ initialPlans, searchParams, onBack }: HealthPlanResultsTableProps) {
  const [plans, setPlans] = useState(initialPlans);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const [premium, setPremium] = useState([0, 1500]);
  const [deductible, setDeductible] = useState([0, 15000]);
  const [isHsa, setIsHsa] = useState(false);
  
  const handleRefineSearch = () => {
    startTransition(async () => {
      const filters = {
        premium_range: { min: premium[0], max: premium[1] > 1499 ? 99999 : premium[1] },
        deductible_range: { min: deductible[0], max: deductible[1] > 14999 ? 99999 : deductible[1] },
        hsa: isHsa,
      };

      const updatedSearchParams = { ...searchParams, filter: filters };
      
      const result = await getHealthQuotes(updatedSearchParams);
      
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error updating results',
          description: result.error,
        });
      } else {
        setPlans(result.plans || []);
        toast({
            title: 'Results updated',
            description: `Found ${result.plans?.length || 0} plans matching your new criteria.`
        })
      }
    });
  };

  return (
    <div className="space-y-8">
      <Card>
          <CardHeader>
            <CardTitle className="text-xl">Refine Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-4">
                <Label>Monthly Premium</Label>
                <Slider defaultValue={[0, 1500]} max={1500} step={50} onValueChange={setPremium} />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${premium[0]}</span>
                  <span>${premium[1] >= 1500 ? '1500+' : premium[1]}</span>
                </div>
              </div>
              <div className="space-y-4">
                <Label>Annual Deductible</Label>
                <Slider defaultValue={[0, 15000]} max={15000} step={500} onValueChange={setDeductible} />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${deductible[0]}</span>
                  <span>${deductible[1] >= 15000 ? '15k+' : deductible[1]}</span>
                </div>
              </div>
            </div>
            
            <Separator className="my-6" />

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center space-x-2">
                    <Switch checked={isHsa} onCheckedChange={setIsHsa} id="hsa-filter"/>
                    <Label htmlFor="hsa-filter">HSA Eligible Plans Only</Label>
                </div>
                <Button onClick={handleRefineSearch} className="w-full sm:w-auto" disabled={isPending}>
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                  Apply Filters
                </Button>
            </div>
          </CardContent>
        </Card>


      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Your Health Plan Results</h2>
          <p className="text-base text-muted-foreground mt-1">Found {plans.length} plans. Use the filters to refine your search.</p>
        </div>
        <Button variant="outline" onClick={onBack}>New Search</Button>
      </div>

      <div>
          {plans.length > 0 ? (
              <div className="w-full overflow-x-auto">
                <Card>
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Plan Details</TableHead>
                        <TableHead>Monthly Premium</TableHead>
                        <TableHead>Deductible</TableHead>
                        <TableHead>Max Out-of-Pocket</TableHead>
                        <TableHead className="text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {plans.map(plan => (
                        <TableRow key={plan.id} className={plan.isBestMatch ? 'bg-sky-50' : ''}>
                            <TableCell>
                                {plan.isBestMatch && <Badge className="mb-2 bg-accent text-accent-foreground">Best Match</Badge>}
                                <p className="font-bold text-base">{plan.provider}</p>
                                <p className="text-muted-foreground">{plan.name}</p>
                                <div className="flex gap-2 text-xs mt-2 text-muted-foreground">
                                    <span>{plan.network}</span>
                                    {plan.hsa_eligible && <><span>•</span><span>HSA Eligible</span></>}
                                </div>
                            </TableCell>
                            <TableCell>
                                <p className="font-bold text-xl">${plan.premium.toFixed(2)}</p>
                                {plan.taxCredit > 0 && (
                                    <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1 cursor-help">
                                            <p className="text-xs text-green-600 whitespace-nowrap">after ${plan.taxCredit.toFixed(2)} est. tax credit</p>
                                            <Info className="h-3 w-3 text-muted-foreground" />
                                        </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                        <p className="max-w-xs text-sm">
                                            This is an estimated Advanced Premium Tax Credit (APTC) based on your income. It lowers your monthly health insurance payment.
                                        </p>
                                        </TooltipContent>
                                    </Tooltip>
                                    </TooltipProvider>
                                )}
                            </TableCell>
                            <TableCell className="font-medium">${plan.deductible.toLocaleString()}</TableCell>
                            <TableCell className="font-medium">${plan.outOfPocketMax.toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                                <Button>Select Plan</Button>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </Card>
              </div>
          ) : (
              <Card className="flex flex-col items-center justify-center text-center p-12">
                   <h3 className="text-xl font-semibold">No Plans Found</h3>
                  <p className="text-muted-foreground mt-2">Try adjusting your filters or starting a new search.</p>
              </Card>
          )}
      </div>
    </div>
  );
}
