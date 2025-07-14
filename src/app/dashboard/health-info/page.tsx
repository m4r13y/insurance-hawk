
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import type { Provider, Drug, SelectedProvider, SelectedDrug } from "@/types";
import { getRelatedDrugs, searchDrugs, searchProviders } from "@/app/dashboard/health-quotes/actions";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Loader2, Pill, Stethoscope } from 'lucide-react';

const frequencyLabels: { [key: string]: string } = {
    monthly: 'Every month', '3-months': 'Every 3 months', 'as-needed': 'As needed',
};

const packageLabels: { [key: string]: string } = {
    '30-day': '30-day supply', '60-day': '60-day supply', '90-day': '90-day supply', 'bottle': '1 bottle',
};

export default function HealthInfoPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [user] = useFirebaseAuth();
    const [profile, setProfile] = useState<any>({});
    
    // --- State for Doctors/Meds Search ---
    const [providerQuery, setProviderQuery] = useState('');
    const [providerResults, setProviderResults] = useState<Provider[]>([]);
    const [providerLoading, setProviderLoading] = useState(false);
    const [isProviderListVisible, setIsProviderListVisible] = useState(false);
    const [selectedProviders, setSelectedProviders] = useState<SelectedProvider[]>([]);
    const providerSearchTimeout = useRef<NodeJS.Timeout | null>(null);
    const [providerToSelectAffiliation, setProviderToSelectAffiliation] = useState<Provider | null>(null);
    
    const [medicationQuery, setMedicationQuery] = useState('');
    const [medicationResults, setMedicationResults] = useState<Drug[]>([]);
    const [medicationSuggestions, setMedicationSuggestions] = useState<string[]>([]);
    const [medicationLoading, setMedicationLoading] = useState(false);
    const [isMedicationListVisible, setIsMedicationListVisible] = useState(false);
    const [selectedDrugs, setSelectedDrugs] = useState<SelectedDrug[]>([]);
    const [drugToConfirm, setDrugToConfirm] = useState<Drug | null>(null);
    const medicationSearchTimeout = useRef<NodeJS.Timeout | null>(null);
    const [dosages, setDosages] = useState<Drug[]>([]);
    const [dosageLoading, setDosageLoading] = useState(false);
    const [selectedDosage, setSelectedDosage] = useState<Drug | null>(null);
    const [isGenericSelected, setIsGenericSelected] = useState<boolean | null>(null);
    const [drugToAddDetails, setDrugToAddDetails] = useState<Drug | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [frequency, setFrequency] = useState('monthly');
    const [pkg, setPackage] = useState('30-day');
    const [isManualDrugEntryOpen, setIsManualDrugEntryOpen] = useState(false);
    const [uniqueForms, setUniqueForms] = useState<string[]>([]);
    const [selectedForm, setSelectedForm] = useState<string>('');

    useEffect(() => {
        if (user && db) {
            getDoc(doc(db, 'users', user.uid)).then(docSnap => {
                if(docSnap.exists()){
                    const data = docSnap.data();
                    setProfile(data);
                    setSelectedProviders(data.doctors || []);
                    setSelectedDrugs(data.medications || []);
                }
            })
        }
    }, [user]);

    const handleSaveAndExit = async () => {
        if (!user || !db) return;
        const userDocRef = doc(db, 'users', user.uid);
        try {
            await setDoc(userDocRef, { doctors: selectedProviders, medications: selectedDrugs }, { merge: true });
            toast({ title: "Health Info Saved" });
            router.push('/dashboard/documents');
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: "Error", description: "Could not save health info." });
        }
    };
    
    const handleProviderQueryChange = (value: string) => {
        setProviderQuery(value);
        if (providerSearchTimeout.current) clearTimeout(providerSearchTimeout.current);
        if (value.length > 0) setIsProviderListVisible(true); else setIsProviderListVisible(false);
        if (value.length < 3) { setProviderResults([]); setProviderLoading(false); return; }
        setProviderLoading(true);
        providerSearchTimeout.current = setTimeout(async () => {
            const result = await searchProviders({ query: value, zipCode: profile.zip || '' });
            if (result.error) {
                toast({
                    variant: 'destructive',
                    title: 'Provider Search Failed',
                    description: result.error,
                });
                setProviderResults([]);
            } else {
                setProviderResults(result.providers || []);
            }
            setProviderLoading(false);
        }, 300);
    };

    const handleSelectProvider = (provider: Provider) => {
        if (selectedProviders.some(p => p.npi === provider.npi)) { setProviderQuery(''); setIsProviderListVisible(false); return; }
        if (provider.affiliations && provider.affiliations.length > 1) {
            setProviderToSelectAffiliation(provider);
        } else {
            const affiliation = provider.affiliations?.[0]?.name;
            setSelectedProviders([...selectedProviders, { ...provider, selectedAffiliation: affiliation }]);
        }
        setProviderQuery(''); setIsProviderListVisible(false);
    };

    const handleAffiliationSelected = (provider: Provider, affiliationName: string) => {
        setSelectedProviders([...selectedProviders, { ...provider, selectedAffiliation: affiliationName }]);
        setProviderToSelectAffiliation(null);
    }

    const handleRemoveProvider = (npi: string) => {
        setSelectedProviders(selectedProviders.filter(p => p.npi !== npi));
    };

    const handleMedicationQueryChange = (value: string) => {
        setMedicationQuery(value);
        setMedicationSuggestions([]);
        if (medicationSearchTimeout.current) clearTimeout(medicationSearchTimeout.current);
        if (value.length > 0) setIsMedicationListVisible(true); else setIsMedicationListVisible(false);
        if (value.length < 3) { setMedicationResults([]); setMedicationLoading(false); return; }
        setMedicationLoading(true);
        medicationSearchTimeout.current = setTimeout(async () => {
            const result = await searchDrugs({ query: value });
            setMedicationResults(result.drugs || []);
            setMedicationSuggestions(result.suggestions || []);
            setMedicationLoading(false);
        }, 300);
    };

    const handleSelectDrug = (drug: Drug) => {
        setIsGenericSelected(null);
        const wasBrandSearched = !drug.is_generic && drug.generic;
        if (wasBrandSearched) { setIsGenericSelected(null); } else { setIsGenericSelected(true); }
        setDrugToConfirm(drug);
        setMedicationQuery('');
        setIsMedicationListVisible(false);
    };
    
    const handleGenericChoice = (isGeneric: boolean) => {
        setIsGenericSelected(isGeneric);
    }
    const handleProceedToDetails = () => { if (selectedDosage) { setDrugToAddDetails(selectedDosage); setDrugToConfirm(null); } };
    
    const handleFinalAddDrug = () => {
        if (!drugToAddDetails) return;
        const newDrug: SelectedDrug = { ...drugToAddDetails, quantity, frequency, package: pkg };
        if (!selectedDrugs.some(d => d.rxcui === newDrug.rxcui)) {
            setSelectedDrugs([...selectedDrugs, newDrug]);
        }
        setDrugToAddDetails(null); setSelectedDosage(null);
    };

    const handleRemoveDrug = (rxcui: string) => {
        setSelectedDrugs(selectedDrugs.filter(d => d.rxcui !== rxcui));
    };

    const handleManualDrugAdd = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const name = formData.get('manual-drug-name') as string;
        const dosage = formData.get('manual-drug-dosage') as string;
        if (!name) return;
        const newDrug: SelectedDrug = {
            id: `manual-${Date.now()}`, rxcui: `manual-${Date.now()}`, name, full_name: `${name} ${dosage || ''}`.trim(), strength: dosage || '', is_generic: true, generic: null, route: '', rxterms_dose_form: '', rxnorm_dose_form: '',
            quantity: 1, frequency: 'monthly', package: '30-day',
        };
        setSelectedDrugs([...selectedDrugs, newDrug]);
        setIsManualDrugEntryOpen(false);
    };

    useEffect(() => {
        if (drugToConfirm) {
            if (isGenericSelected === null && !drugToConfirm.is_generic && drugToConfirm.generic) { setDosages([]); setDosageLoading(false); return; }
            const fetchDosages = async () => {
                setDosageLoading(true); setDosages([]); setSelectedDosage(null);
                const result = await getRelatedDrugs({ rxcui: drugToConfirm.rxcui });
                if (result.drugs) {
                    const filtered = isGenericSelected !== null ? result.drugs.filter(d => d.is_generic === isGenericSelected) : result.drugs;
                    setDosages(filtered);
                }
                setDosageLoading(false);
            };
            fetchDosages();
        }
    }, [drugToConfirm, isGenericSelected]);
    
     useEffect(() => {
        if (dosages.length > 0) {
            const forms = [...new Set(dosages.map(d => d.rxnorm_dose_form).filter(Boolean))];
            setUniqueForms(forms);
            if (forms.length === 1) {
                setSelectedForm(forms[0]);
            } else {
                setSelectedForm('');
            }
            setSelectedDosage(null); // reset selections
        } else {
            setUniqueForms([]);
        }
    }, [dosages]);


    return (
        <div className="max-w-4xl w-full mx-auto space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Edit Health Information</CardTitle>
                    <CardDescription>Add, remove, or manage your preferred doctors and medications.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                        {/* Doctors Section */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Your Doctors & Facilities</h3>
                            <div className="relative">
                                <Label htmlFor="provider-search">Provider Name</Label>
                                <Command shouldFilter={false} className="overflow-visible rounded-lg border">
                                    <div className="relative">
                                        <CommandInput id="provider-search" value={providerQuery} onValueChange={handleProviderQueryChange} onFocus={() => { if(providerQuery.length > 0) setIsProviderListVisible(true) }} onBlur={() => setTimeout(() => setIsProviderListVisible(false), 200)} placeholder="Search for a doctor or facility..."/>
                                        {providerLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin" />}
                                        {isProviderListVisible && (
                                            <CommandList className="absolute top-full z-10 mt-1 w-full rounded-b-lg border bg-background shadow-lg">
                                                {providerQuery.length > 0 && providerQuery.length < 3 && !providerLoading && (<CommandEmpty>Please enter at least 3 characters to search.</CommandEmpty>)}
                                                {providerResults.length === 0 && providerQuery.length >= 3 && !providerLoading && (<CommandEmpty>No providers found.</CommandEmpty>)}
                                                {providerResults.length > 0 && (<CommandGroup>{providerResults.map(p => (<CommandItem key={p.npi} value={p.name} onSelect={() => handleSelectProvider(p)} className="cursor-pointer py-2 px-4"><div className="flex flex-col"><span className="font-medium">{p.name}</span><span className="text-sm text-muted-foreground">{p.specialties?.[0]} - {p.type}</span></div></CommandItem>))}</CommandGroup>)}
                                            </CommandList>
                                        )}
                                    </div>
                                </Command>
                            </div>
                            {selectedProviders.length > 0 && (
                                <div className="space-y-2 rounded-md border p-2 max-h-60 overflow-y-auto mt-4">
                                    {selectedProviders.map(p => (
                                        <div key={p.npi} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                            <div className="flex-1"><p className="text-sm font-medium">{p.name}</p>{p.selectedAffiliation && <p className="text-xs text-muted-foreground">{p.selectedAffiliation}</p>}</div>
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveProvider(p.npi)}><Trash2 className="h-4 w-4 text-destructive" /><span className="sr-only">Remove {p.name}</span></Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* Medications Section */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Your Medications</h3>
                            <div className="relative">
                                <Label htmlFor="medication-search">Medication Name</Label>
                                <Command shouldFilter={false} className="overflow-visible rounded-lg border">
                                    <div className="relative">
                                        <CommandInput id="medication-search" value={medicationQuery} onValueChange={handleMedicationQueryChange} onFocus={() => { if(medicationQuery.length > 0) setIsMedicationListVisible(true) }} onBlur={() => setTimeout(() => setIsMedicationListVisible(false), 200)} placeholder="Search for a medication..."/>
                                        {medicationLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin" />}
                                        {isMedicationListVisible && (
                                            <CommandList className="absolute top-full z-10 mt-1 w-full rounded-b-lg border bg-background shadow-lg">
                                                    {medicationQuery.length > 0 && medicationQuery.length < 3 && !medicationLoading && (<CommandEmpty>Please enter at least 3 characters to search.</CommandEmpty>)}
                                                {!medicationLoading && medicationResults.length === 0 && medicationSuggestions.length > 0 && medicationQuery.length >= 3 && (<CommandGroup heading="Did you mean?">{medicationSuggestions.map(s => (<CommandItem key={s} value={s} onSelect={() => handleMedicationQueryChange(s)} className="cursor-pointer">{s}</CommandItem>))}</CommandGroup>)}
                                                {medicationResults.length > 0 && (<CommandGroup>{medicationResults.map(d => (<CommandItem key={d.rxcui} value={d.name} onSelect={() => handleSelectDrug(d)} className="cursor-pointer"><div className="flex items-center gap-3"><Pill className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{d.name}</span></div></CommandItem>))}</CommandGroup>)}
                                            </CommandList>
                                        )}
                                    </div>
                                </Command>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setIsManualDrugEntryOpen(true)}>Enter Manually</Button>
                            {selectedDrugs.length > 0 && (
                                <div className="space-y-2 rounded-md border p-2 max-h-60 overflow-y-auto mt-4">
                                    {selectedDrugs.map(drug => (
                                        <div key={drug.rxcui} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                            <div className="flex-1"><p className="text-sm font-medium">{drug.full_name}</p><p className="text-xs text-muted-foreground">Qty: {drug.quantity} &bull; {frequencyLabels[drug.frequency]} &bull; {packageLabels[drug.package]}</p></div>
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveDrug(drug.rxcui)}><Trash2 className="h-4 w-4 text-destructive" /><span className="sr-only">Remove {drug.full_name}</span></Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSaveAndExit}>Save and Exit</Button>
                </CardFooter>
            </Card>

             {/* Sub-Dialogs for Health Info */}
            <Dialog open={!!providerToSelectAffiliation} onOpenChange={(open) => !open && setProviderToSelectAffiliation(null)}><DialogContent><DialogHeader><DialogTitle>Select Hospital Affiliation</DialogTitle><DialogDescription>{providerToSelectAffiliation?.name} is affiliated with multiple hospitals. Please choose the one you primarily visit.</DialogDescription></DialogHeader><div className="py-4"><RadioGroup onValueChange={(value) => { if (providerToSelectAffiliation) { handleAffiliationSelected(providerToSelectAffiliation, value); } }} className="space-y-2 max-h-60 overflow-y-auto">{providerToSelectAffiliation?.affiliations?.map((aff, index) => (<Label key={index} htmlFor={`aff-${index}`} className="flex items-center space-x-3 rounded-md border p-4 has-[:checked]:border-primary"><RadioGroupItem value={aff.name} id={`aff-${index}`} /><span>{aff.name}</span></Label>))}</RadioGroup></div><DialogFooter><Button variant="outline" onClick={() => setProviderToSelectAffiliation(null)}>Cancel</Button></DialogFooter></DialogContent></Dialog>
            <Dialog open={!!drugToConfirm} onOpenChange={(open) => { if (!open) { setDrugToConfirm(null); setIsGenericSelected(null); } }}><DialogContent><DialogHeader><DialogTitle>Configure {drugToConfirm?.name}</DialogTitle><DialogDescription>Select the correct form and strength for this medication.</DialogDescription></DialogHeader>{drugToConfirm && !drugToConfirm.is_generic && drugToConfirm.generic && isGenericSelected === null && (<div className="p-4 border rounded-md bg-amber-50"><p className="text-sm font-semibold">Generic Alternative Available</p><p className="text-sm text-muted-foreground mt-1">Do you take {drugToConfirm.name} (Brand) or its generic version?</p><p className="text-xs text-muted-foreground mt-1">Generic: {drugToConfirm.generic.name}</p><div className="mt-3 flex gap-2"><Button size="sm" onClick={() => handleGenericChoice(false)} variant={isGenericSelected === false ? 'default' : 'outline'}>{drugToConfirm.name} (Brand)</Button><Button size="sm" onClick={() => handleGenericChoice(true)} variant={isGenericSelected === true ? 'default' : 'outline'}>Generic Version</Button></div></div>)}<div className="py-4 space-y-4">{dosageLoading ? (<div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>) : (<>{(isGenericSelected === null && drugToConfirm?.generic && !drugToConfirm.is_generic) ? (<p className="text-center text-sm text-muted-foreground p-4">Please select an option above to see available strengths.</p>) : (<>
                <div className="space-y-2">
                    <Label htmlFor="drug-form">Form</Label>
                    <Select value={selectedForm} onValueChange={setSelectedForm} disabled={uniqueForms.length === 0}>
                        <SelectTrigger id="drug-form"><SelectValue placeholder="Select a form..." /></SelectTrigger>
                        <SelectContent>{uniqueForms.map(form => (<SelectItem key={form} value={form}>{form || 'N/A'}</SelectItem>))}</SelectContent>
                    </Select>
                </div>
                {selectedForm && (
                    <div className="space-y-2">
                        <Label htmlFor="drug-strength">Strength</Label>
                        <Select value={selectedDosage?.rxcui || ''} onValueChange={(rxcui) => { const dosage = dosages.find(d => d.rxcui === rxcui); setSelectedDosage(dosage || null);}} disabled={dosages.filter(d => d.rxnorm_dose_form === selectedForm).length === 0}>
                            <SelectTrigger id="drug-strength"><SelectValue placeholder="Select a strength..." /></SelectTrigger>
                            <SelectContent>{dosages.filter(d => d.rxnorm_dose_form === selectedForm).map(dosage => (<SelectItem key={dosage.rxcui} value={dosage.rxcui}>{dosage.strength || dosage.full_name}</SelectItem>))}</SelectContent>
                        </Select>
                    </div>
                )}
                {dosages.length === 0 && !dosageLoading && (<p className="text-center text-sm text-muted-foreground p-4">No specific strengths found for this selection.</p>)}
            </>)}</>)}</div><DialogFooter><Button variant="outline" onClick={() => setDrugToConfirm(null)}>Cancel</Button><Button onClick={handleProceedToDetails} disabled={!selectedDosage || dosageLoading}>Next</Button></DialogFooter></DialogContent></Dialog>
            <Dialog open={!!drugToAddDetails} onOpenChange={(open) => !open && setDrugToAddDetails(null)}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Tell us about this drug</DialogTitle><DialogDescription>Provide the quantity and frequency for {drugToAddDetails?.name}.</DialogDescription></DialogHeader><div className="grid gap-4 py-4"><div className="space-y-2"><Label htmlFor="dosage">Dosage</Label><Input id="dosage" value={drugToAddDetails?.full_name || ''} disabled /></div><div className="space-y-2"><Label htmlFor="package">Package</Label><Select value={pkg} onValueChange={setPackage}><SelectTrigger id="package"><SelectValue placeholder="Select package" /></SelectTrigger><SelectContent><SelectItem value="30-day">30-day supply</SelectItem><SelectItem value="60-day">60-day supply</SelectItem><SelectItem value="90-day">90-day supply</SelectItem><SelectItem value="bottle">1 bottle</SelectItem></SelectContent></Select></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="quantity">Quantity</Label><Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} min={1} /></div><div className="space-y-2"><Label htmlFor="frequency">Frequency</Label><Select value={frequency} onValueChange={setFrequency}><SelectTrigger id="frequency"><SelectValue placeholder="Select frequency" /></SelectTrigger><SelectContent><SelectItem value="monthly">Every month</SelectItem><SelectItem value="3-months">Every 3 months</SelectItem><SelectItem value="as-needed">As needed</SelectItem></SelectContent></Select></div></div></div><DialogFooter><Button variant="outline" onClick={() => setDrugToAddDetails(null)}>Cancel</Button><Button onClick={handleFinalAddDrug}>Add to My Drug List</Button></DialogFooter></DialogContent></Dialog>
            <Dialog open={isManualDrugEntryOpen} onOpenChange={setIsManualDrugEntryOpen}><DialogContent><DialogHeader><DialogTitle>Enter Medication Manually</DialogTitle><DialogDescription>If you couldn't find your medication, you can add its details here.</DialogDescription></DialogHeader><form onSubmit={handleManualDrugAdd} className="space-y-4 py-4"><div className="space-y-2"><Label htmlFor="manual-drug-name">Drug Name</Label><Input id="manual-drug-name" name="manual-drug-name" required /></div><div className="space-y-2"><Label htmlFor="manual-drug-dosage">Dosage (optional)</Label><Input id="manual-drug-dosage" name="manual-drug-dosage" placeholder="e.g., 20mg" /></div><DialogFooter><Button variant="outline" type="button" onClick={() => setIsManualDrugEntryOpen(false)}>Cancel</Button><Button type="submit">Add Medication</Button></DialogFooter></form></DialogContent></Dialog>

        </div>
    )
}

    