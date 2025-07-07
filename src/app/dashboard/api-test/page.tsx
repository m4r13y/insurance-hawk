
"use client";

import { useState, useEffect, useRef } from 'react';
import { searchProviders, searchDrugs } from '@/app/dashboard/health-quotes/actions';
import type { Provider, Drug } from '@/types';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Loader2, Trash2, Pill, HelpCircle, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useDebounce } from 'use-debounce';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';


export default function ApiTestPage() {
    // Provider State
    const [query, setQuery] = useState('');
    const [zipCode, setZipCode] = useState('76116'); 
    const [debouncedQuery] = useDebounce(query, 500);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(false);
    const [isListVisible, setIsListVisible] = useState(false);
    const [selectedProviders, setSelectedProviders] = useState<Provider[]>([]);
    const [showInNetworkOnly, setShowInNetworkOnly] = useState(true);
    const [isDetailsVisible, setIsDetailsVisible] = useState(false);
    
    // Medication State
    const [medicationQuery, setMedicationQuery] = useState('');
    const [medications, setMedications] = useState<Drug[]>([]);
    const [medicationLoading, setMedicationLoading] = useState(false);
    const [isMedicationListVisible, setIsMedicationListVisible] = useState(false);
    const [selectedDrugs, setSelectedDrugs] = useState<Drug[]>([]);
    const [stagedDrug, setStagedDrug] = useState<Drug | null>(null);
    const [isMedicationDetailsVisible, setIsMedicationDetailsVisible] = useState(false);
    const medicationSearchTimeout = useRef<NodeJS.Timeout | null>(null);
    const [genericPrompt, setGenericPrompt] = useState<Drug | null>(null);


    // Fetch Providers
    useEffect(() => {
        if (debouncedQuery.length < 3) {
            setProviders([]);
            setIsListVisible(false);
            return;
        }
        const fetchProviders = async () => {
            setLoading(true);
            const result = await searchProviders({ query: debouncedQuery, zipCode });
            setProviders(result.providers || []);
            setLoading(false);
        };

        fetchProviders();
    }, [debouncedQuery, zipCode]);
    
    // Medication Search Handler with Manual Debounce (from medicare.gov code)
    const handleMedicationQueryChange = (value: string) => {
        setMedicationQuery(value);
        setStagedDrug(null); // Clear staged drug on new input
        
        if (medicationSearchTimeout.current) {
            clearTimeout(medicationSearchTimeout.current);
        }

        if (value.length < 3) {
            setMedications([]);
            setIsMedicationListVisible(false);
            return;
        }
        
        setIsMedicationListVisible(true);
        
        medicationSearchTimeout.current = setTimeout(async () => {
            setMedicationLoading(true);
            const result = await searchDrugs({ query: value });
            setMedications(result.drugs || []);
            setMedicationLoading(false);
        }, 300); // 300ms debounce
    };

    // Provider Handlers
    const handleSelectProvider = (provider: Provider) => {
        if (!selectedProviders.some(p => p.npi === provider.npi)) {
            setSelectedProviders(prev => [...prev, provider]);
        }
        setQuery('');
        setIsListVisible(false);
    };

    const handleRemoveProvider = (npi: string) => {
        setSelectedProviders(prev => prev.filter(p => p.npi !== npi));
    };
    
    // Medication Handlers
    const handleSelectDrug = (drug: Drug) => {
        // This simulates the medicare.gov flow:
        // 1. If it's a brand name with a generic, show a prompt.
        // 2. Otherwise, stage it to be added.
        if (!drug.is_generic && drug.generic) {
            setGenericPrompt(drug);
        } else {
            setStagedDrug(drug);
        }
        setMedicationQuery(drug.full_name);
        setIsMedicationListVisible(false);
    };

    const handleAddDrug = (drugToAdd?: Drug) => {
        const drug = drugToAdd || stagedDrug;
        if (drug && !selectedDrugs.some(d => d.rxcui === drug.rxcui)) {
            setSelectedDrugs(prev => [...prev, drug]);
        }
        setStagedDrug(null);
        setMedicationQuery('');
    };

    const handleGenericPromptSubmit = (useGeneric: boolean) => {
        if (!genericPrompt) return;
        const drugToAdd = useGeneric ? {
            ...genericPrompt.generic!,
            id: genericPrompt.generic!.rxcui,
            full_name: genericPrompt.generic!.name,
            is_generic: true,
            generic: null,
            // Add other fields to satisfy Drug type
            strength: '', route: '', rxterms_dose_form: '', rxnorm_dose_form: ''
        } : genericPrompt;

        handleAddDrug(drugToAdd as Drug);
        setGenericPrompt(null);
    };

    const handleRemoveDrug = (rxcui: string) => {
        setSelectedDrugs(prev => prev.filter(d => d.rxcui !== rxcui));
    };

    return (
        <div className="max-w-xl mx-auto py-24 space-y-8">
            {/* Provider Search */}
            <Command shouldFilter={false} className="overflow-visible rounded-lg border shadow-md">
                <div className="relative">
                    <CommandInput
                        value={query}
                        onValueChange={setQuery}
                        onFocus={() => { if(debouncedQuery.length >=3) setIsListVisible(true) }}
                        onBlur={() => setTimeout(() => setIsListVisible(false), 200)}
                        placeholder="Search for a doctor or facility..."
                        className="h-12 text-lg"
                    />
                    {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin" />}
                    
                    {isListVisible && (
                        <CommandList className="absolute top-full z-10 mt-1 w-full rounded-b-lg border bg-background shadow-lg">
                            {providers.length === 0 && debouncedQuery.length > 2 && !loading && (
                                <CommandEmpty>No providers found.</CommandEmpty>
                            )}
                            {providers.length > 0 && (
                                <CommandGroup>
                                    {providers.map(provider => (
                                        <CommandItem
                                            key={provider.npi}
                                            value={provider.name}
                                            onSelect={() => handleSelectProvider(provider)}
                                            className="cursor-pointer py-2 px-4"
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-medium">{provider.name}</span>
                                                <span className="text-sm text-muted-foreground">{provider.specialties?.[0]} - {provider.type}</span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}
                        </CommandList>
                    )}
                </div>
            </Command>

            <Button 
                onClick={() => setIsDetailsVisible(!isDetailsVisible)} 
                variant="outline"
                className="w-full"
                disabled={selectedProviders.length === 0}
            >
                {isDetailsVisible ? 'Hide' : 'Show'} Selected Providers ({selectedProviders.length})
            </Button>
            
            {isDetailsVisible && selectedProviders.length > 0 && (
                <Card className="animate-in fade-in-50">
                    <CardHeader>
                        <CardTitle>Selected Providers</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2 rounded-md border p-2 max-h-60 overflow-y-auto">
                            {selectedProviders.map(provider => (
                                <div key={provider.npi} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                    <p className="text-sm font-medium">{provider.name}</p>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveProvider(provider.npi)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                        <span className="sr-only">Remove {provider.name}</span>
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center space-x-2 pt-4">
                            <Switch 
                                id="in-network-toggle" 
                                checked={showInNetworkOnly} 
                                onCheckedChange={setShowInNetworkOnly}
                            />
                            <Label htmlFor="in-network-toggle">Only show plans where all selected providers are in-network</Label>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Medication Search */}
            <Command shouldFilter={false} className="overflow-visible rounded-lg border shadow-md">
                 <div className="flex items-center">
                    <div className="relative flex-grow">
                        <CommandInput
                            value={medicationQuery}
                            onValueChange={handleMedicationQueryChange}
                            onFocus={() => { if(medicationQuery.length >=3) setIsMedicationListVisible(true) }}
                            onBlur={() => setTimeout(() => setIsMedicationListVisible(false), 200)}
                            placeholder="Search for a medication..."
                            className="h-12 text-lg border-0 focus-visible:ring-0"
                        />
                         {medicationQuery && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full"
                                onClick={() => handleMedicationQueryChange('')}
                            >
                                <XIcon className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    <Button onClick={() => handleAddDrug()} disabled={!stagedDrug} className="h-10 m-1">Add</Button>
                </div>
                
                {isMedicationListVisible && (
                    <CommandList className="border-t">
                        {medicationLoading && <CommandItem disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" />Searching...</CommandItem>}
                        {!medicationLoading && medications.length === 0 && medicationQuery.length > 2 && (
                             <CommandEmpty>
                                <div className="text-center px-4 py-8">
                                    <p className="font-semibold">No Medications Found</p>
                                    <p className="text-sm text-muted-foreground mt-2">If you're having trouble, try the following:</p>
                                    <ul className="text-sm text-muted-foreground list-disc list-inside mt-2 text-left max-w-xs mx-auto">
                                        <li>Check the spelling of the medication.</li>
                                        <li>Try searching for the generic name.</li>
                                        <li>The drug may be over-the-counter and not listed.</li>
                                    </ul>
                                </div>
                            </CommandEmpty>
                        )}
                        {medications.length > 0 && (
                            <CommandGroup>
                                {medications.map(drug => (
                                    <CommandItem
                                        key={drug.rxcui}
                                        value={drug.full_name}
                                        onSelect={() => handleSelectDrug(drug)}
                                        className="cursor-pointer py-2 px-4"
                                    >
                                       <div className="flex items-center gap-3">
                                            <Pill className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{drug.full_name}</span>
                                       </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                )}
            </Command>

            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="link" className="text-sm text-muted-foreground">
                        <HelpCircle className="mr-2 h-4 w-4" />
                        Can't find your drug?
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Trouble Finding Your Medication?</DialogTitle>
                         <DialogDescription>
                            If you're having trouble finding your medication, try the following tips:
                        </DialogDescription>
                    </DialogHeader>
                    <ul className="list-disc list-inside space-y-2 text-sm py-4">
                        <li>Check the spelling of the medication.</li>
                        <li>Try searching for the generic name instead of the brand name.</li>
                        <li>Ensure you are searching for a prescription drug. Over-the-counter medications are not typically listed.</li>
                    </ul>
                </DialogContent>
            </Dialog>

             <Button 
                onClick={() => setIsMedicationDetailsVisible(!isMedicationDetailsVisible)} 
                variant="outline"
                className="w-full"
                disabled={selectedDrugs.length === 0}
            >
                {isMedicationDetailsVisible ? 'Hide' : 'Show'} Selected Medications ({selectedDrugs.length})
            </Button>

            {isMedicationDetailsVisible && selectedDrugs.length > 0 && (
                 <Card className="animate-in fade-in-50">
                    <CardHeader>
                        <CardTitle>Selected Medications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2 rounded-md border p-2 max-h-60 overflow-y-auto">
                            {selectedDrugs.map(drug => (
                                <div key={drug.rxcui} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                    <p className="text-sm font-medium">{drug.full_name}</p>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveDrug(drug.rxcui)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                        <span className="sr-only">Remove {drug.full_name}</span>
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center space-x-2 pt-4">
                            <Switch id="drug-cost-toggle" />
                            <Label htmlFor="drug-cost-toggle">Apply estimated drug costs to premium</Label>
                        </div>
                         <Button variant="secondary" className="w-full">Add Pharmacy</Button>
                    </CardContent>
                </Card>
            )}

            {/* Generic Drug Prompt Dialog */}
            <Dialog open={!!genericPrompt} onOpenChange={(open) => !open && setGenericPrompt(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generic Alternative Available</DialogTitle>
                        <DialogDescription>
                            A generic version of <strong>{genericPrompt?.name}</strong> is available. Generic drugs are typically cheaper and just as effective.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p>Would you like to add the generic version, <strong>{genericPrompt?.generic?.name}</strong>, instead?</p>
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => handleGenericPromptSubmit(false)}>Add Brand Name</Button>
                        <Button onClick={() => handleGenericPromptSubmit(true)}>Add Generic</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
