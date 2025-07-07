
"use client"

import { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, File, Trash2, Download, PlusCircle, Edit, ExternalLink, X, ArrowLeft, Building, ListCollapse, Shield, ListTodo, Layers, Pencil, Eye, EyeOff, Save, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Policy as PolicyType, Document as DocumentType } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const carriers = [
  { "id": "unitedhealth", "name": "UnitedHealth Group", "logoUrl": "https://logo.clearbit.com/uhc.com", "website": "https://uhc.com" },
  { "id": "elevance", "name": "Elevance Health (Anthem)", "logoUrl": "https://logo.clearbit.com/anthem.com", "website": "https://anthem.com" },
  { "id": "centene", "name": "Centene Corporation", "logoUrl": "https://logo.clearbit.com/centene.com", "website": "https://centene.com" },
  { "id": "humana", "name": "Humana", "logoUrl": "https://logo.clearbit.com/humana.com", "website": "https://humana.com" },
  { "id": "cvs_aetna", "name": "CVS Health (Aetna)", "logoUrl": "https://logo.clearbit.com/aetna.com", "website": "https://aetna.com" },
  { "id": "kaiser", "name": "Kaiser Permanente", "logoUrl": "https://logo.clearbit.com/kaiserpermanente.org", "website": "https://kaiserpermanente.org" },
  { "id": "hcsc", "name": "Health Care Service Corporation", "logoUrl": "https://logo.clearbit.com/hcsc.com", "website": "https://hcsc.com" },
  { "id": "cigna", "name": "Cigna", "logoUrl": "https://logo.clearbit.com/cigna.com", "website": "https://cigna.com" },
  { "id": "molina", "name": "Molina Healthcare", "logoUrl": "https://logo.clearbit.com/molinahealthcare.com", "website": "https://molinahealthcare.com" },
  { "id": "guidewell", "name": "GuideWell (Florida Blue)", "logoUrl": "https://logo.clearbit.com/floridablue.com", "website": "https://floridablue.com" },
  { "id": "highmark", "name": "Highmark", "logoUrl": "https://logo.clearbit.com/highmark.com", "website": "https://highmark.com" },
  { "id": "bcbsm", "name": "Blue Cross Blue Shield Michigan", "logoUrl": "https://logo.clearbit.com/bcbsm.com", "website": "https://bcbsm.com" },
  { "id": "bcbsca", "name": "Blue Shield of California", "logoUrl": "https://logo.clearbit.com/blueshieldca.com", "website": "https://blueshieldca.com" },
  { "id": "bcbstx", "name": "Blue Cross Blue Shield Texas", "logoUrl": "https://logo.clearbit.com/bcbstx.com", "website": "https://bcbstx.com" },
  { "id": "bcbsnc", "name": "Blue Cross Blue Shield North Carolina", "logoUrl": "https://logo.clearbit.com/bcbsnc.com", "website": "https://bcbsnc.com" },
  { "id": "independence", "name": "Independence Blue Cross", "logoUrl": "https://logo.clearbit.com/ibx.com", "website": "https://ibx.com" },
  { "id": "carefirst", "name": "CareFirst BlueCross BlueShield", "logoUrl": "https://logo.clearbit.com/carefirst.com", "website": "https://carefirst.com" },
  { "id": "premera", "name": "Premera Blue Cross", "logoUrl": "https://logo.clearbit.com/premera.com", "website": "https://premera.com" },
  { "id": "oscar", "name": "Oscar Health", "logoUrl": "https://logo.clearbit.com/oscar.com", "website": "https://oscar.com" },
  { "id": "brighthealth", "name": "Bright Health", "logoUrl": "https://logo.clearbit.com/brighthealth.com", "website": "https://brighthealth.com" },
  { "id": "amerihealth", "name": "AmeriHealth Caritas", "logoUrl": "https://logo.clearbit.com/amerihealthcaritas.com", "website": "https://amerihealthcaritas.com" },
  { "id": "upmc", "name": "UPMC Health Plan", "logoUrl": "https://logo.clearbit.com/upmc.com", "website": "https://upmc.com" },
  { "id": "point32health", "name": "Point32Health", "logoUrl": "https://logo.clearbit.com/point32health.org", "website": "https://point32health.org" },
  { "id": "northwestern", "name": "Northwestern Mutual", "logoUrl": "https://logo.clearbit.com/northwesternmutual.com", "website": "https://northwesternmutual.com" },
  { "id": "newyorklife", "name": "New York Life", "logoUrl": "https://logo.clearbit.com/newyorklife.com", "website": "https://newyorklife.com" },
  { "id": "massmutual", "name": "MassMutual", "logoUrl": "https://logo.clearbit.com/massmutual.com", "website": "https://massmutual.com" },
  { "id": "pru", "name": "Prudential Financial", "logoUrl": "https://logo.clearbit.com/prudential.com", "website": "https://prudential.com" },
  { "id": "lincoln", "name": "Lincoln Financial", "logoUrl": "https://logo.clearbit.com/lfg.com", "website": "https://lfg.com" },
  { "id": "metlife", "name": "MetLife", "logoUrl": "https://logo.clearbit.com/metlife.com", "website": "https://metlife.com" },
  { "id": "statefarm", "name": "State Farm", "logoUrl": "https://logo.clearbit.com/statefarm.com", "website": "https://statefarm.com" },
  { "id": "nationwide", "name": "Nationwide", "logoUrl": "https://logo.clearbit.com/nationwide.com", "website": "https://nationwide.com" },
  { "id": "johnhancock", "name": "John Hancock", "logoUrl": "https://logo.clearbit.com/johnhancock.com", "website": "https://johnhancock.com" },
  { "id": "axa", "name": "AXA Equitable", "logoUrl": "https://logo.clearbit.com/axa.com", "website": "https://axa.com" },
  { "id": "aegon", "name": "Aegon/Transamerica", "logoUrl": "https://logo.clearbit.com/transamerica.com", "website": "https://transamerica.com" },
  { "id": "principal", "name": "Principal Financial Group", "logoUrl": "https://logo.clearbit.com/principal.com", "website": "https://principal.com" },
  { "id": "nationlife", "name": "Nationwide", "logoUrl": "https://logo.clearbit.com/nationwide.com", "website": "https://nationwide.com" },
  { "id": "guardian", "name": "Guardian Life", "logoUrl": "https://logo.clearbit.com/guardianlife.com", "website": "https://guardianlife.com" },
  { "id": "americo", "name": "Americo", "logoUrl": "https://logo.clearbit.com/americo.com", "website": "https://americo.com" },
  { "id": "aflac", "name": "Aflac", "logoUrl": "https://logo.clearbit.com/aflac.com", "website": "https://aflac.com" },
  { "id": "transamerica", "name": "Transamerica", "logoUrl": "https://logo.clearbit.com/transamerica.com", "website": "https://transamerica.com" },
  { "id": "gerber", "name": "Gerber Life", "logoUrl": "https://logo.clearbit.com/gerberlife.com", "website": "https://gerberlife.com" },
  { "id": "assurity", "name": "Assurity", "logoUrl": "https://logo.clearbit.com/assurity.com", "website": "https://assurity.com" },
  { "id": "colonialpenn", "name": "Colonial Penn", "logoUrl": "https://logo.clearbit.com/colonialpenn.com", "website": "https://colonialpenn.com" },
  { "id": "eyemed", "name": "EyeMed", "logoUrl": "https://logo.clearbit.com/eyemed.com", "website": "https://eyemed.com" },
  { "id": "vsp", "name": "VSP Vision Care", "logoUrl": "https://logo.clearbit.com/vsp.com", "website": "https://vsp.com" },
  { "id": "wellcare", "name": "WellCare", "logoUrl": "https://logo.clearbit.com/wellcare.com", "website": "https://wellcare.com" },
  { "id": "bankersfidelity", "name": "Bankers Fidelity", "logoUrl": "https://logo.clearbit.com/bankersfidelity.com", "website": "https://bankersfidelity.com" },
  { "id": "sentinel", "name": "Sentinel Security Life", "logoUrl": "https://logo.clearbit.com/sslco.com", "website": "https://sslco.com" },
  { "id": "greatsouthern", "name": "Great Southern Life", "logoUrl": "https://logo.clearbit.com/gslife.com", "website": "https://gslife.com" }
];

const policyCategories = [
  { "id": "medicare", "name": "Medicare" },
  { "id": "health", "name": "Health Insurance" },
  { "id": "life", "name": "Life Insurance" },
  { "id": "dvh", "name": "Dental, Vision, Hearing (DVH)" },
  { "id": "cancer", "name": "Cancer Insurance" },
  { "id": "heart", "name": "Heart & Stroke Insurance" },
  { "id": "drug", "name": "Prescription Drug Plan" },
  { "id": "hospital", "name": "Hospital Indemnity" },
  { "id": "annuity", "name": "Annuity" },
  { "id": "ltc", "name": "Long-Term Care (LTC)" },
  { "id": "stc", "name": "Short-Term Care (STC)" }
];

const medicareSubcategories = [
    { "id": "planG", "name": "Medicare Supplement Plan G" },
    { "id": "planN", "name": "Medicare Supplement Plan N" },
    { "id": "planF", "name": "Medicare Supplement Plan F" },
    { "id": "hmo", "name": "Medicare Advantage HMO" },
    { "id": "ppo", "name": "Medicare Advantage PPO" },
    { "id": "csnp", "name": "Chronic Special Needs Plan (CSNP)" },
    { "id": "dsnp", "name": "Dual-Eligible Special Needs Plan (DSNP)" },
    { "id": "pdp", "name": "Prescription Drug Plan (Part D)" }
];


function PolicyDialog({ open, onOpenChange, onSave, editingPolicy }: { 
    open: boolean; 
    onOpenChange: (open: boolean) => void;
    onSave: (policy: PolicyType) => void;
    editingPolicy: PolicyType | null;
}) {
    const [step, setStep] = useState(1);
    const [policy, setPolicy] = useState<Partial<PolicyType>>({});
    const [carrierSearch, setCarrierSearch] = useState('');

    useEffect(() => {
        if (open) {
            setPolicy(editingPolicy || { id: `pol-${Date.now()}` });
            setStep(editingPolicy ? 4 : 1);
        } else {
            setPolicy({});
            setStep(1);
        }
    }, [open, editingPolicy]);

    const handleSelectCarrier = (carrierId: string) => {
        const carrier = carriers.find(c => c.id === carrierId);
        if (carrier) {
            setPolicy(prev => ({ 
                ...prev, 
                carrierId: carrier.id,
                carrierName: carrier.name,
                carrierLogoUrl: carrier.logoUrl,
                carrierWebsite: carrier.website,
            }));
            setStep(2);
        }
    }

    const handleSelectCategory = (categoryId: string) => {
        const category = policyCategories.find(c => c.id === categoryId);
        if (category) {
            setPolicy(prev => ({ 
                ...prev, 
                policyCategoryId: category.id,
                policyCategoryName: category.name,
                // Reset subcategory if category changes
                policySubcategoryId: undefined,
                policySubcategoryName: undefined,
            }));
            setStep(category.id === 'medicare' ? 3 : 4);
        }
    }

    const handleSelectSubcategory = (subcategoryId: string) => {
        const subcategory = medicareSubcategories.find(s => s.id === subcategoryId);
        if (subcategory) {
            setPolicy(prev => ({ 
                ...prev, 
                policySubcategoryId: subcategory.id,
                policySubcategoryName: subcategory.name,
            }));
            setStep(4);
        }
    }

    const handleSave = () => {
        onSave(policy as PolicyType);
        onOpenChange(false);
    }
    
    const filteredCarriers = carriers.filter(c => c.name.toLowerCase().includes(carrierSearch.toLowerCase()));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{editingPolicy ? 'Edit Policy' : 'Add New Policy'}</DialogTitle>
                    <DialogDescription>
                        {step === 1 && "Search for and select the policy carrier."}
                        {step === 2 && "Select the main category for this policy."}
                        {step === 3 && "Select the specific type of Medicare plan."}
                        {step === 4 && "Enter the specific details for your policy."}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4 min-h-[300px]">
                    {step === 1 && (
                        <Command>
                            <CommandInput placeholder="Search for a carrier..." value={carrierSearch} onValueChange={setCarrierSearch} />
                            <CommandList>
                                <CommandEmpty>No carrier found.</CommandEmpty>
                                <CommandGroup>
                                {filteredCarriers.map((carrier) => (
                                    <CommandItem key={carrier.id} value={carrier.name} onSelect={() => handleSelectCarrier(carrier.id)} className="cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <Image src={carrier.logoUrl} alt={carrier.name} width={24} height={24} className="rounded-sm" />
                                            <span>{carrier.name}</span>
                                        </div>
                                    </CommandItem>
                                ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    )}
                    {step === 2 && (
                         <div className="flex flex-wrap justify-center gap-3">
                            {policyCategories.map(cat => (
                                <Button key={cat.id} variant="outline" className="h-auto py-3 px-4 text-center whitespace-normal" onClick={() => handleSelectCategory(cat.id)}>
                                    {cat.name}
                                </Button>
                            ))}
                        </div>
                    )}
                     {step === 3 && (
                        <div className="flex flex-wrap justify-center gap-3">
                            {medicareSubcategories.map(sub => (
                                <Button key={sub.id} variant="outline" className="h-auto py-3 px-4 text-center whitespace-normal" onClick={() => handleSelectSubcategory(sub.id)}>
                                    {sub.name}
                                </Button>
                            ))}
                        </div>
                    )}
                     {step === 4 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted">
                                {policy.carrierLogoUrl && <Image src={policy.carrierLogoUrl} alt={policy.carrierName || ''} width={32} height={32} />}
                                <div className="font-semibold">
                                    <p>{policy.carrierName}</p>
                                    <p className="text-sm text-muted-foreground">{policy.policySubcategoryName || policy.policyCategoryName}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="planName">Plan / Policy Name</Label>
                                <Input id="planName" value={policy.planName || ''} onChange={e => setPolicy(p => ({ ...p, planName: e.target.value }))} />
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="premium">Monthly Premium ($)</Label>
                                    <Input id="premium" type="number" value={policy.premium || ''} onChange={e => setPolicy(p => ({ ...p, premium: Number(e.target.value) }))} />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="benefitAmount">Benefit Amount ($)</Label>
                                    <Input id="benefitAmount" type="number" value={policy.benefitAmount || ''} onChange={e => setPolicy(p => ({ ...p, benefitAmount: Number(e.target.value) }))} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="enrollmentDate">Enrollment Date</Label>
                                <Input id="enrollmentDate" type="date" value={policy.enrollmentDate || ''} onChange={e => setPolicy(p => ({ ...p, enrollmentDate: e.target.value }))} />
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-row justify-between w-full">
                    <div>
                        {step > 1 && (
                            <Button variant="ghost" onClick={() => setStep(s => s - 1)}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                            </Button>
                        )}
                    </div>
                     <div>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        {step === 4 && <Button onClick={handleSave} className="ml-2" disabled={!policy.planName?.trim()}>Save Policy</Button>}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function PolicyCard({ policy, onEdit, onDelete }: { policy: PolicyType; onEdit: (policy: PolicyType) => void; onDelete: (policyId: string) => void; }) {
    return (
        <Card className="flex flex-col">
            <CardHeader className="flex-row items-center gap-4 space-y-0 p-4">
                {policy.carrierLogoUrl && (
                    <Image src={policy.carrierLogoUrl} alt={policy.carrierName} width={40} height={40} className="rounded-md" />
                )}
                <div className="flex-1">
                    <CardTitle className="text-lg">{policy.carrierName}</CardTitle>
                    <CardDescription className="text-sm">{policy.planName}</CardDescription>
                </div>
                <div className="flex items-center">
                    <Button variant="ghost" size="icon" asChild>
                        <a href={policy.carrierWebsite} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4 text-muted-foreground" /></a>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(policy)}><Edit className="h-4 w-4 text-muted-foreground" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(policy.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4 text-sm p-4 pt-0">
                <div className="flex justify-between items-center border-t pt-4">
                    <span className="text-muted-foreground">Category</span>
                    <Badge variant="secondary">{policy.policySubcategoryName || policy.policyCategoryName}</Badge>
                </div>
                 <Separator />
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-muted-foreground">Premium</p>
                        <p className="font-semibold">{policy.premium ? `$${policy.premium.toFixed(2)}/mo` : 'N/A'}</p>
                    </div>
                     <div className="space-y-1">
                        <p className="text-muted-foreground">Benefit Amount</p>
                        <p className="font-semibold">{policy.benefitAmount ? `$${policy.benefitAmount.toLocaleString()}` : 'N/A'}</p>
                    </div>
                 </div>
                 <div className="space-y-1">
                    <p className="text-muted-foreground">Enrollment Date</p>
                    <p className="font-semibold">{policy.enrollmentDate ? new Date(policy.enrollmentDate).toLocaleDateString('en-US', { timeZone: 'UTC' }) : 'N/A'}</p>
                </div>
            </CardContent>
        </Card>
    )
}

// Editable Card Component
const EditableCard = ({ title, children, form: FormComponent, onSave }: { title: string; children: React.ReactNode; form: React.FC<any>; onSave: (data: any) => void; }) => {
    const [isEditing, setIsEditing] = useState(false);
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">{title}</CardTitle>
                {!isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                {isEditing ? (
                    <FormComponent onSave={(data:any) => { onSave(data); setIsEditing(false); }} onCancel={() => setIsEditing(false)} />
                ) : (
                    children
                )}
            </CardContent>
        </Card>
    );
};

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dob: z.string().optional(),
  email: z.string().email("Invalid email").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  medicareId: z.string().optional(),
});

const PersonalInfoForm = ({ onSave, onCancel }: { onSave: (data: any) => void; onCancel: () => void }) => {
    const form = useForm({ resolver: zodResolver(profileSchema.pick({ firstName: true, lastName: true, dob: true })) });
     useEffect(() => {
        const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        form.reset(profile);
    }, [form]);
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField name="firstName" control={form.control} render={({ field }) => <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField name="lastName" control={form.control} render={({ field }) => <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                </div>
                <FormField name="dob" control={form.control} render={({ field }) => <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>} />
                <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button><Button type="submit">Save</Button></div>
            </form>
        </Form>
    );
};

const ContactInfoForm = ({ onSave, onCancel }: { onSave: (data: any) => void; onCancel: () => void }) => {
    const form = useForm({ resolver: zodResolver(profileSchema.pick({ email: true, phone: true, address: true, city: true, state: true, zip: true })) });
     useEffect(() => {
        const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        form.reset(profile);
    }, [form]);
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField name="email" control={form.control} render={({ field }) => <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField name="phone" control={form.control} render={({ field }) => <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                </div>
                 <FormField name="address" control={form.control} render={({ field }) => <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <div className="grid grid-cols-3 gap-4">
                     <FormField name="city" control={form.control} render={({ field }) => <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                     <FormField name="state" control={form.control} render={({ field }) => <FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                     <FormField name="zip" control={form.control} render={({ field }) => <FormItem><FormLabel>Zip</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                </div>
                <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button><Button type="submit">Save</Button></div>
            </form>
        </Form>
    );
};

const FinancialInfoForm = ({ onSave, onCancel }: { onSave: (data: any) => void; onCancel: () => void }) => {
    const form = useForm({ resolver: zodResolver(profileSchema.pick({ medicareId: true })) });
     useEffect(() => {
        const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        form.reset(profile);
    }, [form]);
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
                <FormField name="medicareId" control={form.control} render={({ field }) => <FormItem><FormLabel>Medicare ID</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button><Button type="submit">Save</Button></div>
            </form>
        </Form>
    );
};

const InfoRow = ({ label, value, isSensitive = false }: { label: string; value: string; isSensitive?: boolean; }) => {
    const [isVisible, setIsVisible] = useState(false);
    const displayValue = isSensitive ? (isVisible ? value : '•'.repeat(value.length || 10)) : value;
    return (
        <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">{label}</span>
            <div className="flex items-center gap-2">
                <span className="font-medium">{displayValue || 'N/A'}</span>
                {isSensitive && value && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsVisible(!isVisible)}>
                        {isVisible ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                    </Button>
                )}
            </div>
        </div>
    );
};


export default function MyAccountPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [policies, setPolicies] = useState<PolicyType[]>([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<PolicyType | null>(null);
    const { toast } = useToast();
    const [profile, setProfile] = useState<any>({});
    
     useEffect(() => {
        const checkAuth = () => {
            const guestAuth = localStorage.getItem("hawk-auth") === "true";
            setIsLoggedIn(guestAuth);
            setLoading(false);
        };
        checkAuth();

        const storedPolicies = localStorage.getItem("hawk-policies");
        if (storedPolicies) setPolicies(JSON.parse(storedPolicies));

        const storedProfile = localStorage.getItem("userProfile");
        if(storedProfile) setProfile(JSON.parse(storedProfile));
        
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "hawk-policies") {
                const updatedPolicies = localStorage.getItem("hawk-policies");
                setPolicies(updatedPolicies ? JSON.parse(updatedPolicies) : []);
            }
            if (e.key === "userProfile") {
                 const updatedProfile = localStorage.getItem("userProfile");
                setProfile(updatedProfile ? JSON.parse(updatedProfile) : {});
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);

    }, []);

    const savePolicies = (updatedPolicies: PolicyType[]) => {
        setPolicies(updatedPolicies);
        localStorage.setItem("hawk-policies", JSON.stringify(updatedPolicies));
    }
    
    const handleSaveProfile = (newData: any) => {
        const updatedProfile = { ...profile, ...newData };
        setProfile(updatedProfile);
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        toast({ title: "Profile Updated", description: "Your information has been saved." });
    };

    const handleSavePolicy = (policy: PolicyType) => {
        if (!isLoggedIn) {
            toast({ variant: 'destructive', title: 'Action Disabled', description: 'You must have an account to add policies.' });
            return;
        }
        
        const existingIndex = policies.findIndex(p => p.id === policy.id);

        if (existingIndex > -1) { // Editing existing policy
            const updatedPolicies = [...policies];
            updatedPolicies[existingIndex] = policy;
            savePolicies(updatedPolicies);
             toast({ title: 'Policy Updated', description: `${policy.carrierName} policy has been updated.` });
        } else { // Adding new policy
            savePolicies([...policies, policy]);
            toast({ title: 'Policy Added', description: `${policy.carrierName} policy has been added to your list.` });
        }
        setEditingPolicy(null);
    };

    const handleEditPolicy = (policy: PolicyType) => {
        setEditingPolicy(policy);
        setIsAddDialogOpen(true);
    }
    
    const handleDeletePolicy = (policyId: string) => {
        const updatedPolicies = policies.filter(p => p.id !== policyId);
        savePolicies(updatedPolicies);
        toast({ title: 'Policy Removed', description: `The policy has been removed from your list.` });
    }
    
    if (loading) return <p>Loading...</p>;
    
    if (!isLoggedIn) {
        return (
            <div className="text-center">
                <p>Please log in or continue as a guest to manage your account.</p>
                <Button asChild className="mt-4"><Link href="/">Login</Link></Button>
            </div>
        );
    }

  return (
        <div className="space-y-8 max-w-4xl mx-auto">
             <div>
                <h1 className="text-2xl font-semibold">My Account</h1>
                <p className="text-base text-muted-foreground mt-1">View and edit your profile information. All data is saved locally in your browser.</p>
            </div>
        
             <div className="space-y-8">
                 <EditableCard title="Personal Information" form={PersonalInfoForm} onSave={handleSaveProfile}>
                     <InfoRow label="Name" value={`${profile.firstName || ''} ${profile.lastName || ''}`} />
                     <Separator/>
                     <InfoRow label="Date of Birth" value={profile.dob || ''} />
                 </EditableCard>

                 <EditableCard title="Contact Information" form={ContactInfoForm} onSave={handleSaveProfile}>
                     <InfoRow label="Email" value={profile.email || ''} />
                     <Separator/>
                     <InfoRow label="Phone" value={profile.phone || ''} />
                     <Separator/>
                     <InfoRow label="Address" value={`${profile.address || ''} ${profile.city || ''} ${profile.state || ''} ${profile.zip || ''}`} />
                 </EditableCard>

                 <EditableCard title="Financial & Health IDs" form={FinancialInfoForm} onSave={handleSaveProfile}>
                     <InfoRow label="Medicare ID" value={profile.medicareId || ''} isSensitive={true}/>
                 </EditableCard>
             </div>


            <Card>
                <CardHeader className="flex flex-row justify-between items-start">
                    <div>
                        <CardTitle className="text-xl">Your Policies</CardTitle>
                        <CardDescription>Here are the policies you've added to your nest.</CardDescription>
                    </div>
                    <Button onClick={() => { setEditingPolicy(null); setIsAddDialogOpen(true); }}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Policy
                    </Button>
                </CardHeader>
                <CardContent>
                    {policies.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {policies.map((policy) => (
                                <PolicyCard key={policy.id} policy={policy} onEdit={handleEditPolicy} onDelete={handleDeletePolicy} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg">
                            <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mt-4">No Policies Added Yet</h3>
                            <p className="text-muted-foreground mt-2">Click the 'Add Policy' button to add your first policy.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <PolicyDialog 
                open={isAddDialogOpen} 
                onOpenChange={setIsAddDialogOpen} 
                onSave={handleSavePolicy}
                editingPolicy={editingPolicy}
            />
        </div>
  )
}
