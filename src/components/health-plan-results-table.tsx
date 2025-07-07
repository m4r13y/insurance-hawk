
"use client";

import React, { useState, useTransition, useEffect, useCallback, useRef } from 'react';
import type { HealthPlan, Drug, Provider, DrugCoverage, ProviderCoverage } from '@/types';
import type { z } from 'zod';
import type { healthQuoterFormSchema } from './health-insurance-quoter';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Loader2, RefreshCw, Info, Pill, Stethoscope, PlusCircle, Trash2, Check, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getHealthQuotes, getDrugCoverage, getProviderCoverage, searchDrugs, searchProviders } from '@/app/dashboard/health-quotes/actions';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Checkbox } from './ui/checkbox';
import Link from 'next/link';
import { useDebounce } from 'use-debounce';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"


type FormValues = z.infer<typeof healthQuoterFormSchema>;
type SelectedProvider = { provider: Provider; filterInNetwork: boolean; };
type HealthPlanResultsTableProps = {
  initialResults: { plans: HealthPlan[], total: number };
  searchParams: FormValues;
  onBack: () => void;
};


// --- DIALOG COMPONENTS --- //
const CoverageDetailsDialog = ({ open, onOpenChange, plan, selectedDrugs, selectedProviders }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    plan: HealthPlan | null;
    selectedDrugs: Drug[];
    selectedProviders: SelectedProvider[];
}) => {
    const [drugCoverage, setDrugCoverage] = useState<DrugCoverage[]>([]);
    const [providerCoverage, setProviderCoverage] = useState<ProviderCoverage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && plan) {
            const fetchCoverage = async () => {
                setLoading(true);
                setError(null);
                setDrugCoverage([]);
                setProviderCoverage([]);

                const drugIds = selectedDrugs.map(d => d.rxcui);
                const providerIds = selectedProviders.map(p => p.provider.npi);

                if (drugIds.length > 0) {
                    const res = await getDrugCoverage({ planIds: [plan.id], drugIds });
                    if (res.error) setError(prev => (prev ? `${prev}\\n${res.error}` : res.error!));
                    else setDrugCoverage(res.coverage || []);
                }
                
                if (providerIds.length > 0) {
                    const res = await getProviderCoverage({ planIds: [plan.id], providerIds });
                     if (res.error) setError(prev => (prev ? `${prev}\\n${res.error}` : res.error!));
                    else setProviderCoverage(res.coverage || []);
                }
                setLoading(false);
            };
            fetchCoverage();
        }
    }, [open, plan, selectedDrugs, selectedProviders]);

    const getDrugName = (rxcui: string) => selectedDrugs.find(d => d.rxcui === rxcui)?.full_name || rxcui;
    const getProviderName = (npi: string) => selectedProviders.find(p => p.provider.npi === npi)?.provider.name || npi;

    return (
         <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Coverage Details for {plan?.name}</DialogTitle>
                </DialogHeader>
                <div className="py-4 max-h-[60vh] overflow-y-auto">
                    {loading && <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin"/></div>}
                    {!loading && error && <p className="text-destructive text-sm">{error}</p>}
                    {!loading && !error && (
                        <div className="space-y-6">
                            {selectedProviders.length > 0 && providerCoverage.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="font-semibold flex items-center gap-2"><Stethoscope className="h-4 w-4"/> Doctor Coverage</h4>
                                    <div className="space-y-2">
                                        {providerCoverage.map(pc => (
                                            <div key={pc.npi} className="flex items-center justify-between text-sm p-2 rounded-md border">
                                                <span className="flex items-center gap-2">
                                                    {pc.coverage === 'Covered' ? (
                                                        <Check className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <X className="h-4 w-4 text-destructive" />
                                                    )}
                                                    {getProviderName(pc.npi)}
                                                </span>
                                                {pc.coverage === 'Covered' ? 
                                                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">In-Network</Badge> : 
                                                    <Badge variant="destructive">Out-of-Network</Badge>
                                                }
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                             {selectedDrugs.length > 0 && drugCoverage.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="font-semibold flex items-center gap-2"><Pill className="h-4 w-4"/> Medication Coverage</h4>
                                    <div className="space-y-2">
                                       {drugCoverage.map(dc => (
                                            <div key={dc.rxcui} className="flex items-center justify-between text-sm p-2 rounded-md border">
                                                <span>{getDrugName(dc.rxcui)}</span>
                                                 <Badge variant="secondary" className="capitalize bg-blue-100 text-blue-800 border-blue-200">{dc.coverage.replace(/([A-Z])/g, ' $1').trim()}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground pt-2">Drug costs are estimates. Check the plan's official formulary for details.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                 <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
         </Dialog>
    )
}


// --- INLINE SELECTOR COMPONENTS --- //
const ProviderSelector = ({ selectedProviders, setSelectedProviders, zipCode }: {
  selectedProviders: SelectedProvider[];
  setSelectedProviders: (providers: SelectedProvider[]) => void;
  zipCode: string;
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [results, setResults] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (debouncedSearchTerm.length < 3) {
      setResults([]);
      return;
    }
    const fetchProviders = async () => {
      setLoading(true);
      const { providers } = await searchProviders({ query: debouncedSearchTerm, zipCode });
      setResults(providers || []);
      setLoading(false);
    };
    fetchProviders();
  }, [debouncedSearchTerm, zipCode]);

  const handleAddProvider = (provider: Provider) => {
    if (!selectedProviders.some(p => p.provider.npi === provider.npi)) {
      setSelectedProviders([...selectedProviders, { provider, filterInNetwork: true }]);
    }
    setSearchTerm('');
    setResults([]);
    setIsOpen(false);
  };

  const handleRemoveProvider = (npi: string) => {
    setSelectedProviders(selectedProviders.filter(p => p.provider.npi !== npi));
  };
  
  const handleToggleInNetwork = (npi: string) => {
    setSelectedProviders(selectedProviders.map(p => 
        p.provider.npi === npi ? { ...p, filterInNetwork: !p.filterInNetwork } : p
    ));
  };
  
  const allInNetwork = selectedProviders.length > 0 && selectedProviders.every(p => p.filterInNetwork);

  const handleToggleAllInNetwork = () => {
    const newValue = !allInNetwork;
    setSelectedProviders(selectedProviders.map(p => ({ ...p, filterInNetwork: newValue })));
  };

  const handleOnBlur = () => {
      setTimeout(() => setIsOpen(false), 150);
  }

  return (
    <div className="space-y-4">
      <Command className="relative overflow-visible">
        <CommandInput 
          placeholder="Search by doctor or facility name..." 
          value={searchTerm}
          onValueChange={(search) => {
              setSearchTerm(search);
              if(search.length > 2) setIsOpen(true);
              else setIsOpen(false);
          }}
          onBlur={handleOnBlur}
          onFocus={() => { if(results.length > 0) setIsOpen(true)}}
        />
        {isOpen && (
            <CommandList className="absolute z-10 w-full rounded-md border bg-background shadow-md top-full mt-1">
            {loading && <CommandItem disabled>Loading...</CommandItem>}
            {!loading && results.length === 0 && searchTerm.length > 2 && <CommandEmpty>No providers found.</CommandEmpty>}
            {results.length > 0 && (
                <CommandGroup>
                {results.map(provider => (
                    <CommandItem key={provider.npi} onSelect={() => handleAddProvider(provider)} className="cursor-pointer">
                    {provider.name} <span className="text-xs ml-2 text-muted-foreground">{provider.specialties?.[0]}</span>
                    </CommandItem>
                ))}
                </CommandGroup>
            )}
            </CommandList>
        )}
      </Command>

      {selectedProviders.length > 0 && (
        <div className="space-y-2">
            <h4 className="font-medium text-sm">Selected Providers</h4>
            <div className="flex items-center p-2 border-b">
              <Checkbox id="toggle-all-in-network" onCheckedChange={handleToggleAllInNetwork} checked={allInNetwork} />
              <Label htmlFor="toggle-all-in-network" className="ml-2 text-sm font-normal">Filter in-network for all</Label>
            </div>
            <div className="space-y-2 rounded-md border p-2 max-h-48 overflow-y-auto">
                {selectedProviders.map(({provider, filterInNetwork}) => (
                    <div key={provider.npi} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                        <div className="flex items-center gap-2">
                            <Checkbox id={`provider-${provider.npi}`} checked={filterInNetwork} onCheckedChange={() => handleToggleInNetwork(provider.npi)}/>
                            <Label htmlFor={`provider-${provider.npi}`} className="font-normal text-sm cursor-pointer">{provider.name}</Label>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveProvider(provider.npi)}>
                            <Trash2 className="h-4 w-4"/>
                        </Button>
                    </div>
                ))}
            </div>
             <p className="text-xs text-muted-foreground p-1">Checked providers will be used to filter for plans that include them in-network.</p>
        </div>
      )}
    </div>
  )
}

const DrugSelector = ({ selectedDrugs, setSelectedDrugs }: {
  selectedDrugs: Drug[];
  setSelectedDrugs: (drugs: Drug[]) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [results, setResults] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (debouncedSearchTerm.length < 3) {
      setResults([]);
      return;
    }
    const fetchDrugs = async () => {
      setLoading(true);
      const { drugs } = await searchDrugs({ query: debouncedSearchTerm });
      setResults(drugs || []);
      setLoading(false);
    };
    fetchDrugs();
  }, [debouncedSearchTerm]);

  const handleAddDrug = (drug: Drug) => {
    if (!selectedDrugs.some(d => d.rxcui === drug.rxcui)) {
      setSelectedDrugs([...selectedDrugs, drug]);
    }
    setSearchTerm('');
    setResults([]);
    setIsOpen(false);
  };
  
  const handleRemoveDrug = (rxcui: string) => {
    setSelectedDrugs(selectedDrugs.filter(d => d.rxcui !== rxcui));
  };

  const handleOnBlur = () => {
      setTimeout(() => setIsOpen(false), 150);
  }

  return (
    <div className="space-y-4">
      <Command className="relative overflow-visible">
        <CommandInput 
          placeholder="Search by drug name..." 
          value={searchTerm}
           onValueChange={(search) => {
              setSearchTerm(search);
              if(search.length > 2) setIsOpen(true);
              else setIsOpen(false);
          }}
          onBlur={handleOnBlur}
          onFocus={() => { if(results.length > 0) setIsOpen(true)}}
        />
        {isOpen && (
            <CommandList className="absolute z-10 w-full rounded-md border bg-background shadow-md top-full mt-1">
            {loading && <CommandItem disabled>Loading...</CommandItem>}
            {!loading && results.length === 0 && searchTerm.length > 2 && <CommandEmpty>No drugs found.</CommandEmpty>}
            {results.length > 0 && (
                <CommandGroup>
                {results.map(drug => (
                    <CommandItem key={drug.rxcui} onSelect={() => handleAddDrug(drug)} className="cursor-pointer">
                    {drug.full_name}
                    </CommandItem>
                ))}
                </CommandGroup>
            )}
            </CommandList>
        )}
      </Command>

      {selectedDrugs.length > 0 && (
         <div className="space-y-2">
            <h4 className="font-medium text-sm">Selected Medications</h4>
            <div className="space-y-2 rounded-md border p-2 max-h-48 overflow-y-auto">
                {selectedDrugs.map(drug => (
                    <div key={drug.rxcui} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                        <p className="text-sm">{drug.full_name}</p>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveDrug(drug.rxcui)}>
                            <Trash2 className="h-4 w-4"/>
                        </Button>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  )
}


// --- MAIN COMPONENT --- //
export function HealthPlanResultsTable({ initialResults, searchParams, onBack }: HealthPlanResultsTableProps) {
  const [plans, setPlans] = useState(initialResults.plans);
  const [totalPlans, setTotalPlans] = useState(initialResults.total);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const [premium, setPremium] = useState([0, 1500]);
  const [deductible, setDeductible] = useState([0, 15000]);
  const [isHsa, setIsHsa] = useState(false);
  const [selectedDrugs, setSelectedDrugs] = useState<Drug[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<SelectedProvider[]>([]);
  const [isCoverageDetailsOpen, setIsCoverageDetailsOpen] = useState(false);
  const [activePlanForDetails, setActivePlanForDetails] = useState<HealthPlan | null>(null);

  const PLANS_PER_PAGE = 50;
  const totalPages = Math.ceil(totalPlans / PLANS_PER_PAGE);

  const fetchPlans = useCallback(async (offset = 0) => {
    startTransition(async () => {
      const providersToFilter = selectedProviders
        .filter(p => p.filterInNetwork)
        .map(p => p.provider.npi);

      const filters = {
        premium_range: { min: premium[0], max: premium[1] >= 1500 ? 99999 : premium[1] },
        deductible_range: { min: deductible[0], max: deductible[1] >= 15000 ? 99999 : deductible[1] },
        hsa: isHsa,
        providers: providersToFilter.length > 0 ? providersToFilter : undefined,
        drugs: selectedDrugs.length > 0 ? selectedDrugs.map(d => d.rxcui) : undefined,
      };

      const updatedSearchParams = { ...searchParams, filter: filters, offset };
      
      const result = await getHealthQuotes(updatedSearchParams);
      
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error updating results',
          description: result.error,
        });
      } else {
        setPlans(result.plans || []);
        setTotalPlans(result.total || 0);
        if (offset === 0) { // Only show toast on filter, not page change
             toast({
                title: 'Results updated',
                description: `Found ${result.total || 0} plans matching your new criteria.`
            })
        }
      }
    });
  }, [premium, deductible, isHsa, selectedProviders, selectedDrugs, searchParams, toast]);

  const handleRefineSearch = () => {
    setCurrentPage(1);
    fetchPlans(0);
  };
  
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    fetchPlans((newPage - 1) * PLANS_PER_PAGE);
  };

  const handleShowCoverage = (plan: HealthPlan) => {
    setActivePlanForDetails(plan);
    setIsCoverageDetailsOpen(true);
  };

  return (
    <div className="space-y-8">
      <Card>
          <CardHeader>
            <CardTitle className="text-xl">Refine Results</CardTitle>
            <CardDescription>Use the filters and choose your doctors/medications to narrow down the results.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-4">
                <Label>Monthly Premium</Label>
                <Slider defaultValue={[0, 1500]} max={1500} step={50} value={premium} onValueChange={setPremium} />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${premium[0]}</span>
                  <span>${premium[1] >= 1500 ? '1500+' : premium[1]}</span>
                </div>
              </div>
              <div className="space-y-4">
                <Label>Annual Deductible</Label>
                <Slider defaultValue={[0, 15000]} max={15000} step={500} value={deductible} onValueChange={setDeductible} />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${deductible[0]}</span>
                  <span>${deductible[1] >= 15000 ? '15k+' : deductible[1]}</span>
                </div>
              </div>
            </div>
            
            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Collapsible>
                    <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                            <Stethoscope className="mr-2 h-4 w-4"/> {selectedProviders.length > 0 ? `Edit Doctors (${selectedProviders.length})` : 'Choose Doctors & Facilities'}
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4 p-4 border rounded-md">
                        <ProviderSelector 
                            selectedProviders={selectedProviders}
                            setSelectedProviders={setSelectedProviders}
                            zipCode={searchParams.zipCode}
                        />
                    </CollapsibleContent>
                </Collapsible>
                <Collapsible>
                    <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                            <Pill className="mr-2 h-4 w-4"/> {selectedDrugs.length > 0 ? `Edit Medications (${selectedDrugs.length})` : 'Choose Medications'}
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4 p-4 border rounded-md">
                        <DrugSelector
                            selectedDrugs={selectedDrugs}
                            setSelectedDrugs={setSelectedDrugs}
                        />
                    </CollapsibleContent>
                </Collapsible>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                  <Switch checked={isHsa} onCheckedChange={setIsHsa} id="hsa-filter"/>
                  <Label htmlFor="hsa-filter">HSA Eligible Plans Only</Label>
              </div>
              <Button onClick={handleRefineSearch} disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>


      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Your Health Plan Results</h2>
          <p className="text-base text-muted-foreground mt-1">Found {totalPlans} plans. Use the filters to refine your search.</p>
        </div>
        <Button variant="outline" onClick={onBack}>New Search</Button>
      </div>

      <div>
          {plans.length > 0 ? (
            <Card>
                <div className="w-full overflow-x-auto">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Plan Details</TableHead>
                        <TableHead className="hidden sm:table-cell">Monthly Premium</TableHead>
                        <TableHead className="hidden md:table-cell">Deductible</TableHead>
                        <TableHead className="hidden lg:table-cell">Max Out-of-Pocket</TableHead>
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
                                <div className="flex items-center gap-2 text-xs mt-2 text-muted-foreground">
                                    <span>{plan.network}</span>
                                    {plan.hsa_eligible && <><span>•</span><span>HSA Eligible</span></>}
                                    <div className="ml-2 flex gap-1">
                                      {(selectedProviders.length > 0 || selectedDrugs.length > 0) && (
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleShowCoverage(plan)}>
                                                {selectedProviders.length > 0 && <Stethoscope className="h-4 w-4" />}
                                                {selectedDrugs.length > 0 && <Pill className="h-4 w-4 ml-1" />}
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent><p>View Coverage Details</p></TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      )}
                                    </div>
                                </div>
                                <div className="mt-4 sm:hidden">
                                     <p className="font-bold text-lg">${plan.premium.toFixed(2)}</p>
                                    {plan.taxCredit > 0 && <p className="text-xs text-green-600 whitespace-nowrap">after ${plan.taxCredit.toFixed(2)} credit</p>}
                                </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
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
                                            This is an estimated Advanced Premium Tax Credit (APTC) based on your monthly health insurance payment.
                                        </p>
                                        </TooltipContent>
                                    </Tooltip>
                                    </TooltipProvider>
                                )}
                            </TableCell>
                            <TableCell className="font-medium hidden md:table-cell">${plan.deductible.toLocaleString()}</TableCell>
                            <TableCell className="font-medium hidden lg:table-cell">${plan.outOfPocketMax.toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                                <Button asChild><Link href={`/dashboard/apply?type=health-insurance&planName=${encodeURIComponent(plan.name)}&provider=${encodeURIComponent(plan.provider)}&premium=${plan.premium}`}>Select Plan</Link></Button>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </div>
                 {totalPages > 1 && (
                    <div className="flex items-center justify-center space-x-4 p-4">
                        <Button
                            variant="outline"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1 || isPending}
                        >
                            Previous
                        </Button>
                        <span className="text-sm font-medium">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || isPending}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </Card>
          ) : (
              <Card className="flex flex-col items-center justify-center text-center p-12">
                   <h3 className="text-xl font-semibold">No Plans Found</h3>
                  <p className="text-muted-foreground mt-2">Try adjusting your filters or starting a new search.</p>
              </Card>
          )}
      </div>

        <CoverageDetailsDialog
            open={isCoverageDetailsOpen}
            onOpenChange={setIsCoverageDetailsOpen}
            plan={activePlanForDetails}
            selectedDrugs={selectedDrugs}
            selectedProviders={selectedProviders}
        />

    </div>
  );
}
