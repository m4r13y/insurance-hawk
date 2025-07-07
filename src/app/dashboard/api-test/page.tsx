
"use client";

import { useState, useEffect, useRef } from 'react';
import { getRelatedDrugs, searchDrugs, searchProviders } from '@/app/dashboard/health-quotes/actions';
import type { Drug, Provider } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HelpCircle, Loader2, Pill, Trash2, XIcon, PlusCircle, Hospital } from 'lucide-react';

type SelectedDrug = Drug & {
    quantity: number;
    frequency: string;
    package: string;
};

type SelectedProvider = Provider & {
    selectedAffiliation?: string;
};

const frequencyLabels: { [key: string]: string } = {
    monthly: 'Every month',
    '3-months': 'Every 3 months',
    'as-needed': 'As needed',
};

const packageLabels: { [key: string]: string } = {
    '30-day': '30-day supply',
    '60-day': '60-day supply',
    '90-day': '90-day supply',
    'bottle': '1 bottle',
};

export default function ApiTestPage() {
    // Provider State
    const [query, setQuery] = useState('');
    const [zipCode, setZipCode] = useState('76116'); 
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(false);
    const [isListVisible, setIsListVisible] = useState(false);
    const [selectedProviders, setSelectedProviders] = useState<SelectedProvider[]>([]);
    const [isDetailsVisible, setIsDetailsVisible] = useState(false);
    const providerSearchTimeout = useRef<NodeJS.Timeout | null>(null);
    const [providerToSelectAffiliation, setProviderToSelectAffiliation] = useState<Provider | null>(null);
    
    // Medication State
    const [medicationQuery, setMedicationQuery] = useState('');
    const [medications, setMedications] = useState<Drug[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [medicationLoading, setMedicationLoading] = useState(false);
    const [isMedicationListVisible, setIsMedicationListVisible] = useState(false);
    const [selectedDrugs, setSelectedDrugs] = useState<SelectedDrug[]>([]);
    const [drugToConfirm, setDrugToConfirm] = useState<Drug | null>(null);
    const medicationSearchTimeout = useRef<NodeJS.Timeout | null>(null);
    const [isMedicationDetailsVisible, setIsMedicationDetailsVisible] = useState(false);
    const [dosages, setDosages] = useState<Drug[]>([]);
    const [dosageLoading, setDosageLoading] = useState(false);
    const [selectedDosage, setSelectedDosage] = useState<Drug | null>(null);
    const [isGenericSelected, setIsGenericSelected] = useState<boolean | null>(null);
    const [drugToAddDetails, setDrugToAddDetails] = useState<Drug | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [frequency, setFrequency] = useState('monthly');
    const [pkg, setPackage] = useState('30-day');
    const [isManualDrugEntryOpen, setIsManualDrugEntryOpen] = useState(false);


    const handleProviderQueryChange = (value: string) => {
        setQuery(value);

        if (providerSearchTimeout.current) {
            clearTimeout(providerSearchTimeout.current);
        }

        if (value.length > 0) {
            setIsListVisible(true);
        } else {
            setIsListVisible(false);
        }

        if (value.length < 3) {
            setProviders([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        providerSearchTimeout.current = setTimeout(async () => {
            const result = await searchProviders({ query: value, zipCode });
            setProviders(result.providers || []);
            setLoading(false);
        }, 300); // 300ms debounce
    };
    
    const handleMedicationQueryChange = (value: string) => {
        setMedicationQuery(value);
        setSuggestions([]);
        
        if (medicationSearchTimeout.current) {
            clearTimeout(medicationSearchTimeout.current);
        }

        if (value.length > 0) {
            setIsMedicationListVisible(true);
        } else {
            setIsMedicationListVisible(false);
        }

        if (value.length < 3) {
            setMedications([]);
            setMedicationLoading(false);
            return;
        }
        
        setMedicationLoading(true);
        
        medicationSearchTimeout.current = setTimeout(async () => {
            const result = await searchDrugs({ query: value });
            setMedications(result.drugs || []);
            setSuggestions(result.suggestions || []);
            setMedicationLoading(false);
        }, 300); // 300ms debounce
    };

    // Provider Handlers
    const handleSelectProvider = (provider: Provider) => {
        if (selectedProviders.some(p => p.npi === provider.npi)) {
             setQuery('');
             setIsListVisible(false);
             return;
        }

        if (provider.affiliations && provider.affiliations.length > 1) {
            setProviderToSelectAffiliation(provider);
        } else {
            const affiliation = provider.affiliations?.[0]?.name;
            setSelectedProviders(prev => [...prev, { ...provider, selectedAffiliation: affiliation }]);
        }

        setQuery('');
        setIsListVisible(false);
    };

    const handleAffiliationSelected = (provider: Provider, affiliationName: string) => {
        setSelectedProviders(prev => [...prev, { ...provider, selectedAffiliation: affiliationName }]);
        setProviderToSelectAffiliation(null);
    }

    const handleRemoveProvider = (npi: string) => {
        setSelectedProviders(prev => prev.filter(p => p.npi !== npi));
    };
    
    // Medication Handlers
    const handleSelectDrug = (drug: Drug) => {
        setIsGenericSelected(null);
        
        const wasBrandSearched = !drug.is_generic && drug.generic;
        if (wasBrandSearched) {
             setIsGenericSelected(null);
        } else {
             setIsGenericSelected(true);
        }
        
        setDrugToConfirm(drug);
        setMedicationQuery('');
        setIsMedicationListVisible(false);
    };

    const handleGenericChoice = (isGeneric: boolean) => {
        setIsGenericSelected(isGeneric);
    };

    const handleProceedToDetails = () => {
        if (selectedDosage) {
            setDrugToAddDetails(selectedDosage);
            setDrugToConfirm(null);
        }
    };
    
    const handleFinalAddDrug = () => {
        if (!drugToAddDetails) return;
        
        const newDrug: SelectedDrug = {
            ...drugToAddDetails,
            quantity: quantity,
            frequency: frequency,
            package: pkg,
        };

        if (!selectedDrugs.some(d => d.rxcui === newDrug.rxcui)) {
            setSelectedDrugs(prev => [...prev, newDrug]);
        }
        setDrugToAddDetails(null);
        setSelectedDosage(null);
    };


    const handleRemoveDrug = (rxcui: string) => {
        setSelectedDrugs(prev => prev.filter(d => d.rxcui !== rxcui));
    };

    const handleManualDrugAdd = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const name = formData.get('manual-drug-name') as string;
        const dosage = formData.get('manual-drug-dosage') as string;

        if (!name) return;

         const newDrug: SelectedDrug = {
            id: `manual-${Date.now()}`,
            rxcui: `manual-${Date.now()}`,
            name: name,
            full_name: `${name} ${dosage || ''}`.trim(),
            strength: dosage || '',
            is_generic: true,
            generic: null, route: '', rxterms_dose_form: '', rxnorm_dose_form: '',
            quantity: 1,
            frequency: 'monthly',
            package: '30-day',
        };

        setSelectedDrugs(prev => [...prev, newDrug]);
        setIsManualDrugEntryOpen(false);
    };

    // Fetch dosages when a drug is selected for confirmation
    useEffect(() => {
        if (drugToConfirm) {
            if (isGenericSelected === null && !drugToConfirm.is_generic && drugToConfirm.generic) {
                setDosages([]);
                setDosageLoading(false);
                return;
            }

            const fetchDosages = async () => {
                setDosageLoading(true);
                setDosages([]);
                setSelectedDosage(null);
                
                const result = await getRelatedDrugs({ rxcui: drugToConfirm.rxcui });

                if (result.drugs) {
                    const filtered = isGenericSelected !== null 
                        ? result.drugs.filter(d => d.is_generic === isGenericSelected)
                        : result.drugs;
                    setDosages(filtered);
                }
                setDosageLoading(false);
            };
            fetchDosages();
        }
    }, [drugToConfirm, isGenericSelected]);

    return (
        <div className="max-w-xl mx-auto py-24 space-y-8">
            {/* Provider Search */}
            <Card>
                <CardHeader>
                    <CardTitle>Find a Doctor or Facility</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-end">
                        <div className="relative">
                            <Label htmlFor="provider-search">Provider Name</Label>
                            <Command shouldFilter={false} className="overflow-visible rounded-lg border">
                                <div className="relative">
                                    <CommandInput
                                        id="provider-search"
                                        value={query}
                                        onValueChange={handleProviderQueryChange}
                                        onFocus={() => { if(query.length > 0) setIsListVisible(true) }}
                                        onBlur={() => setTimeout(() => setIsListVisible(false), 200)}
                                        placeholder="Search for a doctor or facility..."
                                        className="h-11"
                                    />
                                    {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin" />}
                                    
                                    {isListVisible && (
                                        <CommandList className="absolute top-full z-10 mt-1 w-full rounded-b-lg border bg-background shadow-lg">
                                            {query.length > 0 && query.length < 3 && !loading && (
                                                <CommandEmpty>Please enter at least 3 characters to search.</CommandEmpty>
                                            )}
                                            {providers.length === 0 && query.length >= 3 && !loading && (
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
                        </div>
                        <div>
                            <Label htmlFor="zip-code">ZIP Code</Label>
                            <Input id="zip-code" value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="e.g. 90210" className="w-[120px]"/>
                        </div>
                    </div>

                    <Button 
                        onClick={() => setIsDetailsVisible(!isDetailsVisible)} 
                        variant="outline"
                        className="w-full"
                        disabled={selectedProviders.length === 0}
                    >
                        {isDetailsVisible ? 'Hide' : 'Show'} Selected Providers ({selectedProviders.length})
                    </Button>
                    
                    {isDetailsVisible && selectedProviders.length > 0 && (
                        <div className="animate-in fade-in-50 space-y-4 pt-4">
                            <div className="space-y-2 rounded-md border p-2 max-h-60 overflow-y-auto">
                                {selectedProviders.map(provider => (
                                    <div key={provider.npi} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{provider.name}</p>
                                            {provider.selectedAffiliation && <p className="text-xs text-muted-foreground">{provider.selectedAffiliation}</p>}
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveProvider(provider.npi)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                            <span className="sr-only">Remove {provider.name}</span>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>


            {/* Medication Search */}
            <Card>
                <CardHeader>
                    <CardTitle>Find Your Medications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="relative">
                        <Label htmlFor="medication-search">Medication Name</Label>
                        <Command shouldFilter={false} className="overflow-visible rounded-lg border">
                            <div className="relative">
                                <CommandInput
                                    id="medication-search"
                                    value={medicationQuery}
                                    onValueChange={handleMedicationQueryChange}
                                    onFocus={() => { if(medicationQuery.length > 0) setIsMedicationListVisible(true) }}
                                    onBlur={() => setTimeout(() => setIsMedicationListVisible(false), 200)}
                                    placeholder="Search for a medication..."
                                    className="h-11"
                                />
                                {medicationLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin" />}
                                
                                {isMedicationListVisible && (
                                    <CommandList className="absolute top-full z-10 mt-1 w-full rounded-b-lg border bg-background shadow-lg">
                                        {medicationQuery.length > 0 && medicationQuery.length < 3 && !medicationLoading && (
                                            <CommandEmpty>Please enter at least 3 characters to search.</CommandEmpty>
                                        )}
                                        {!medicationLoading && medications.length === 0 && suggestions.length > 0 && medicationQuery.length >= 3 && (
                                            <CommandGroup heading="Did you mean?">
                                                {suggestions.map(suggestion => (
                                                    <CommandItem key={suggestion} value={suggestion} onSelect={() => handleMedicationQueryChange(suggestion)} className="cursor-pointer">{suggestion}</CommandItem>
                                                ))}
                                            </CommandGroup>
                                        )}
                                        {!medicationLoading && medications.length === 0 && suggestions.length === 0 && medicationQuery.length >= 3 && ( <CommandEmpty>No medications found.</CommandEmpty> )}
                                        {medications.length > 0 && (
                                            <CommandGroup>
                                                {medications.map(drug => (
                                                    <CommandItem key={drug.rxcui} value={drug.name} onSelect={() => handleSelectDrug(drug)} className="cursor-pointer">
                                                    <div className="flex items-center gap-3">
                                                            <Pill className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-medium">{drug.name}</span>
                                                    </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        )}
                                    </CommandList>
                                )}
                            </div>
                        </Command>
                    </div>
                    <Button variant="link" className="p-0 h-auto" onClick={() => setIsManualDrugEntryOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Enter medication manually
                    </Button>
                     <Button 
                        onClick={() => setIsMedicationDetailsVisible(!isMedicationDetailsVisible)} 
                        variant="outline"
                        className="w-full"
                        disabled={selectedDrugs.length === 0}
                    >
                        {isMedicationDetailsVisible ? 'Hide' : 'Show'} Selected Medications ({selectedDrugs.length})
                    </Button>
                </CardContent>
            </Card>

            {isMedicationDetailsVisible && selectedDrugs.length > 0 && (
                 <Card className="animate-in fade-in-50">
                    <CardHeader>
                        <CardTitle>Selected Medications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2 rounded-md border p-2 max-h-60 overflow-y-auto">
                            {selectedDrugs.map(drug => (
                                <div key={drug.rxcui} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{drug.full_name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Qty: {drug.quantity} &bull; {frequencyLabels[drug.frequency]} &bull; {packageLabels[drug.package]}
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveDrug(drug.rxcui)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                        <span className="sr-only">Remove {drug.full_name}</span>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Affiliation Selection Dialog */}
            <Dialog open={!!providerToSelectAffiliation} onOpenChange={(open) => !open && setProviderToSelectAffiliation(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Select Hospital Affiliation</DialogTitle>
                        <DialogDescription>
                            {providerToSelectAffiliation?.name} is affiliated with multiple hospitals. Please choose the one you primarily visit.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <RadioGroup 
                            onValueChange={(value) => {
                                if (providerToSelectAffiliation) {
                                    handleAffiliationSelected(providerToSelectAffiliation, value);
                                }
                            }}
                            className="space-y-2 max-h-60 overflow-y-auto"
                        >
                            {providerToSelectAffiliation?.affiliations?.map((aff, index) => (
                                <Label key={index} htmlFor={`aff-${index}`} className="flex items-center space-x-3 rounded-md border p-4 has-[:checked]:border-primary">
                                    <RadioGroupItem value={aff.name} id={`aff-${index}`} />
                                    <span>{aff.name}</span>
                                </Label>
                            ))}
                        </RadioGroup>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setProviderToSelectAffiliation(null)}>Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dosage Selection Dialog */}
             <Dialog open={!!drugToConfirm} onOpenChange={(open) => {
                 if (!open) {
                     setDrugToConfirm(null);
                     setIsGenericSelected(null);
                 }
             }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Select Strength for {drugToConfirm?.name}</DialogTitle>
                        <DialogDescription>
                            Choose the correct strength and form for this medication.
                        </DialogDescription>
                    </DialogHeader>

                    {drugToConfirm && !drugToConfirm.is_generic && drugToConfirm.generic && isGenericSelected === null && (
                         <div className="p-4 border rounded-md bg-amber-50">
                            <p className="text-sm font-semibold">Generic Alternative Available</p>
                            <p className="text-sm text-muted-foreground mt-1">Do you take {drugToConfirm.name} (Brand) or its generic version?</p>
                            <p className="text-xs text-muted-foreground mt-1">Generic: {drugToConfirm.generic.name}</p>
                            <div className="mt-3 flex gap-2">
                                <Button size="sm" onClick={() => handleGenericChoice(false)} variant={isGenericSelected === false ? 'default' : 'outline'}>{drugToConfirm.name} (Brand)</Button>
                                <Button size="sm" onClick={() => handleGenericChoice(true)} variant={isGenericSelected === true ? 'default' : 'outline'}>Generic Version</Button>
                            </div>
                        </div>
                    )}

                    <div className="py-4">
                        {dosageLoading ? (
                            <div className="flex items-center justify-center p-8">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : (
                            <>
                                {(isGenericSelected === null && drugToConfirm?.generic && !drugToConfirm.is_generic) ? (
                                    <p className="text-center text-sm text-muted-foreground p-4">
                                        Please select an option above to see available strengths.
                                    </p>
                                ) : (
                                    <RadioGroup 
                                        onValueChange={(value) => {
                                            const dosage = dosages.find(d => d.rxcui === value);
                                            setSelectedDosage(dosage || null);
                                        }}
                                        className="space-y-2 max-h-60 overflow-y-auto"
                                    >
                                        {dosages.length > 0 ? dosages.map(dosage => (
                                            <Label key={dosage.rxcui} htmlFor={dosage.rxcui} className="flex items-center space-x-3 rounded-md border p-4 has-[:checked]:border-primary">
                                                <RadioGroupItem value={dosage.rxcui} id={dosage.rxcui} />
                                                <span>{dosage.full_name}</span>
                                            </Label>
                                        )) : (
                                            <p className="text-center text-sm text-muted-foreground">No specific strengths found. You can add the base medication.</p>
                                        )}
                                    </RadioGroup>
                                )}
                            </>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDrugToConfirm(null)}>Cancel</Button>
                        <Button onClick={handleProceedToDetails} disabled={!selectedDosage || dosageLoading}>Next</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Drug Details Dialog */}
             <Dialog open={!!drugToAddDetails} onOpenChange={(open) => !open && setDrugToAddDetails(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tell us about this drug</DialogTitle>
                        <DialogDescription>
                            Provide the quantity and frequency for {drugToAddDetails?.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="dosage">Dosage</Label>
                            <Input id="dosage" value={drugToAddDetails?.full_name || ''} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="package">Package</Label>
                            <Select value={pkg} onValueChange={setPackage}>
                                <SelectTrigger id="package">
                                    <SelectValue placeholder="Select package" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="30-day">30-day supply</SelectItem>
                                    <SelectItem value="60-day">60-day supply</SelectItem>
                                    <SelectItem value="90-day">90-day supply</SelectItem>
                                    <SelectItem value="bottle">1 bottle</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="quantity">Quantity</Label>
                                <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} min={1} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="frequency">Frequency</Label>
                                <Select value={frequency} onValueChange={setFrequency}>
                                    <SelectTrigger id="frequency">
                                        <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="monthly">Every month</SelectItem>
                                        <SelectItem value="3-months">Every 3 months</SelectItem>
                                        <SelectItem value="as-needed">As needed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDrugToAddDetails(null)}>Cancel</Button>
                        <Button onClick={handleFinalAddDrug}>Add to My Drug List</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Manual Drug Entry Dialog */}
            <Dialog open={isManualDrugEntryOpen} onOpenChange={setIsManualDrugEntryOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enter Medication Manually</DialogTitle>
                        <DialogDescription>
                            If you couldn't find your medication, you can add its details here.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleManualDrugAdd} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="manual-drug-name">Drug Name</Label>
                            <Input id="manual-drug-name" name="manual-drug-name" required />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="manual-drug-dosage">Dosage (optional)</Label>
                            <Input id="manual-drug-dosage" name="manual-drug-dosage" placeholder="e.g., 20mg" />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => setIsManualDrugEntryOpen(false)}>Cancel</Button>
                            <Button type="submit">Add Medication</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

    