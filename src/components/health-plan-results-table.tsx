
"use client";

import React, { useState, useTransition, useCallback } from 'react';
import type { HealthPlan, Drug, Provider } from '@/types';
import type { z } from 'zod';
import type { healthQuoterFormSchema } from './health-insurance-quoter';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Combobox, type ComboboxOption } from './ui/combobox';
import { X, Loader2, RefreshCw, Info } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getHealthQuotes, searchDrugs, searchProviders } from '@/app/dashboard/health-quotes/actions';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

type FormValues = z.infer<typeof healthQuoterFormSchema>;
interface HealthPlanResultsTableProps {
  initialPlans: HealthPlan[];
  searchParams: FormValues;
  onBack: () => void;
}
type SelectedItem = { id: string; name: string };

function FilterTag({ item, onRemove }: { item: SelectedItem, onRemove: (id: string) => void }) {
    return (
        <Badge variant="secondary" className="flex items-center gap-2 text-sm">
            {item.name}
            <button onClick={() => onRemove(item.id)} className="rounded-full hover:bg-muted-foreground/20">
                <X className="h-3 w-3" />
            </button>
        </Badge>
    )
}

export function HealthPlanResultsTable({ initialPlans, searchParams, onBack }: HealthPlanResultsTableProps) {
  const [plans, setPlans] = useState(initialPlans);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const [premium, setPremium] = useState([0, 1500]);
  const [deductible, setDeductible] = useState([0, 15000]);
  const [isHsa, setIsHsa] = useState(false);
  const [selectedDoctors, setSelectedDoctors] = useState<SelectedItem[]>([]);
  const [selectedDrugs, setSelectedDrugs] = useState<SelectedItem[]>([]);

  const [doctorQuery, setDoctorQuery] = useState('');
  const [drugQuery, setDrugQuery] = useState('');
  const [doctorOptions, setDoctorOptions] = useState<ComboboxOption[]>([]);
  const [drugOptions, setDrugOptions] = useState<ComboboxOption[]>([]);

  const handleDoctorSearch = useCallback(async (query: string) => {
    setDoctorQuery(query);
    if (query.length < 3) {
      setDoctorOptions([]);
      return;
    }
    const { providers } = await searchProviders({ query, zipCode: searchParams.zipCode });
    setDoctorOptions(providers.map(p => ({ value: p.npi, label: `${p.name} (${p.specialties?.[0] || 'Provider'})` })));
  }, [searchParams.zipCode]);

  const handleDrugSearch = useCallback(async (query: string) => {
    setDrugQuery(query);
    if (query.length < 3) {
      setDrugOptions([]);
      return;
    }
    const { drugs } = await searchDrugs({ query });
    setDrugOptions(drugs.map(d => ({ value: d.rxcui, label: d.full_name })));
  }, []);

  const handleAddDoctor = (value: string) => {
    const doctor = doctorOptions.find(d => d.value === value);
    if (doctor && !selectedDoctors.find(d => d.id === doctor.value)) {
      setSelectedDoctors(prev => [...prev, { id: doctor.value, name: doctor.label }]);
    }
    setDoctorQuery('');
    setDoctorOptions([]);
  };

  const handleAddDrug = (value: string) => {
    const drug = drugOptions.find(d => d.value === value);
    if (drug && !selectedDrugs.find(d => d.id === drug.value)) {
        setSelectedDrugs(prev => [...prev, { id: drug.value, name: drug.label }]);
    }
    setDrugQuery('');
    setDrugOptions([]);
  };

  const handleRefineSearch = () => {
    startTransition(async () => {
      const filters = {
        premium_range: { min: premium[0], max: premium[1] > 1499 ? 99999 : premium[1] },
        deductible_range: { min: deductible[0], max: deductible[1] > 14999 ? 99999 : deductible[1] },
        drugs: selectedDrugs.map(d => d.id),
        providers: selectedDoctors.map(d => d.id),
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
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Your Health Plan Results</h2>
          <p className="text-base text-muted-foreground mt-1">Found {plans.length} plans. Use the filters to refine your search.</p>
        </div>
        <Button variant="outline" onClick={onBack}>New Search</Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <Card className="lg:col-span-1 lg:sticky lg:top-24">
          <CardHeader><CardTitle className="text-xl">Refine Results</CardTitle></CardHeader>
          <CardContent className="space-y-6">
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
            <div className="flex items-center justify-between">
                <Label>HSA Eligible</Label>
                <Switch checked={isHsa} onCheckedChange={setIsHsa} />
            </div>

            <Separator />
            
            <div className="space-y-2">
                <Label>My Doctors</Label>
                <Combobox options={doctorOptions} value={doctorQuery} onSelect={handleAddDoctor} onInputChange={handleDoctorSearch} placeholder="Search for a doctor..." />
                <div className="flex flex-wrap gap-2 pt-2">
                    {selectedDoctors.map(doc => <FilterTag key={doc.id} item={doc} onRemove={(id) => setSelectedDoctors(prev => prev.filter(d => d.id !== id))} />)}
                </div>
            </div>

             <div className="space-y-2">
                <Label>My Prescriptions</Label>
                <Combobox options={drugOptions} value={drugQuery} onSelect={handleAddDrug} onInputChange={handleDrugSearch} placeholder="Search for a medication..." />
                <div className="flex flex-wrap gap-2 pt-2">
                    {selectedDrugs.map(drug => <FilterTag key={drug.id} item={drug} onRemove={(id) => setSelectedDrugs(prev => prev.filter(d => d.id !== id))} />)}
                </div>
            </div>
            
            <Button onClick={handleRefineSearch} className="w-full" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Apply Filters
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-3">
            {plans.length > 0 ? (
                <Card>
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="min-w-[24rem]">Plan Details</TableHead>
                        <TableHead className="min-w-[12rem]">Monthly Premium</TableHead>
                        <TableHead className="min-w-[10rem]">Deductible</TableHead>
                        <TableHead className="min-w-[12rem]">Max Out-of-Pocket</TableHead>
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
            ) : (
                <Card className="flex flex-col items-center justify-center text-center p-12">
                     <h3 className="text-xl font-semibold">No Plans Found</h3>
                    <p className="text-muted-foreground mt-2">Try adjusting your filters or starting a new search.</p>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
}
