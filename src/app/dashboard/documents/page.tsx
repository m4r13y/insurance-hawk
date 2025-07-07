
"use client"

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, File, Trash2, Download, PlusCircle, Edit, ExternalLink, ArrowLeft, Layers, Shield, MoreVertical, User, Pencil, Eye, EyeOff, Stethoscope, Pill, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Policy as PolicyType, Document as DocumentType, Provider, Drug, SelectedProvider, SelectedDrug } from '@/types';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogContent } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { db, storage } from '@/lib/firebase';
import { collection, doc, addDoc, setDoc, deleteDoc, onSnapshot, query, serverTimestamp, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getRelatedDrugs, searchDrugs, searchProviders } from "@/app/dashboard/health-quotes/actions";


// --- MOCK DATA & CONFIGS (from original file) --- //
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

const frequencyLabels: { [key: string]: string } = {
    monthly: 'Every month', '3-months': 'Every 3 months', 'as-needed': 'As needed',
};

const packageLabels: { [key: string]: string } = {
    '30-day': '30-day supply', '60-day': '60-day supply', '90-day': '90-day supply', 'bottle': '1 bottle',
};

// --- SCHEMAS FOR PROFILE FORMS --- //
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


// --- HELPER COMPONENTS FOR PROFILE INFO --- //
const EditableCard = ({ title, children, FormComponent, onSave, profileData }: { title: string; children: React.ReactNode; FormComponent: React.FC<any>; onSave: (data: any) => void; profileData: any; }) => {
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
                <div className={cn(!isEditing ? "block" : "hidden")}>{children}</div>
                <div className={cn(isEditing ? "block" : "hidden")}>
                    <FormComponent profileData={profileData} onSave={(data:any) => { onSave(data); setIsEditing(false); }} onCancel={() => setIsEditing(false)} />
                </div>
            </CardContent>
        </Card>
    );
};

const InfoRow = ({ label, value, isSensitive = false }: { label: string; value: string; isSensitive?: boolean; }) => {
    const [isVisible, setIsVisible] = useState(false);
    const displayValue = isSensitive ? (isVisible ? value : '•'.repeat(value?.length || 10)) : value;
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

const PersonalInfoForm = ({ onSave, onCancel, profileData }: { onSave: (data: any) => void; onCancel: () => void, profileData: any }) => {
    const form = useForm({ 
      resolver: zodResolver(profileSchema.pick({ firstName: true, lastName: true, dob: true })),
      defaultValues: {
        firstName: profileData?.firstName || '',
        lastName: profileData?.lastName || '',
        dob: profileData?.dob || '',
      }
    });
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

const ContactInfoForm = ({ onSave, onCancel, profileData }: { onSave: (data: any) => void; onCancel: () => void, profileData: any }) => {
    const form = useForm({ 
      resolver: zodResolver(profileSchema.pick({ phone: true, address: true, city: true, state: true, zip: true })),
      defaultValues: {
        phone: profileData?.phone || '',
        address: profileData?.address || '',
        city: profileData?.city || '',
        state: profileData?.state || '',
        zip: profileData?.zip || '',
      }
    });
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
                <FormField name="phone" control={form.control} render={({ field }) => <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
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

const FinancialInfoForm = ({ onSave, onCancel, profileData }: { onSave: (data: any) => void; onCancel: () => void, profileData: any }) => {
    const form = useForm({ 
      resolver: zodResolver(profileSchema.pick({ medicareId: true })),
      defaultValues: {
        medicareId: profileData?.medicareId || '',
      }
    });
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
                <FormField name="medicareId" control={form.control} render={({ field }) => <FormItem><FormLabel>Medicare ID</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button><Button type="submit">Save</Button></div>
            </form>
        </Form>
    );
};

// --- HELPER COMPONENTS FOR POLICIES --- //

function PolicyDialog({ open, onOpenChange, onSave, editingPolicy }: { 
    open: boolean; 
    onOpenChange: (open: boolean) => void;
    onSave: (policy: Omit<PolicyType, 'id'>, id?: string) => void;
    editingPolicy: PolicyType | null;
}) {
    const [step, setStep] = useState(1);
    const [policy, setPolicy] = useState<Partial<PolicyType>>({});
    const [carrierSearch, setCarrierSearch] = useState('');

    const benefitAmountCategories = ['life', 'cancer', 'heart', 'hospital', 'annuity', 'ltc', 'stc'];

    useEffect(() => {
        if (open) {
            setPolicy(editingPolicy || {});
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
        onSave(policy as Omit<PolicyType, 'id'>, editingPolicy?.id);
        onOpenChange(false);
    }
    
    const filteredCarriers = carriers.filter(c => c.name.toLowerCase().includes(carrierSearch.toLowerCase()));
    
    const isSaveDisabled = step === 4 && (!policy.policyCategoryId || !policy.carrierId || !policy.planName);

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
                                {policy.carrierLogoUrl && <Image src={policy.carrierName || ''} alt={policy.carrierName || ''} width={32} height={32} />}
                                <div className="font-semibold">
                                    <p>{policy.carrierName}</p>
                                    <p className="text-sm text-muted-foreground">{policy.policySubcategoryName || policy.policyCategoryName}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="planName">Policy Nickname</Label>
                                <Input id="planName" value={policy.planName || ''} onChange={e => setPolicy(p => ({ ...p, planName: e.target.value }))} placeholder="e.g., John's Medigap"/>
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="premium">Monthly Premium ($)</Label>
                                    <Input id="premium" type="number" value={policy.premium || ''} onChange={e => setPolicy(p => ({ ...p, premium: Number(e.target.value) }))} />
                                </div>
                                {benefitAmountCategories.includes(policy.policyCategoryId || '') && (
                                    <div className="space-y-2">
                                        <Label htmlFor="benefitAmount">Benefit Amount ($)</Label>
                                        <Input id="benefitAmount" type="number" value={policy.benefitAmount || ''} onChange={e => setPolicy(p => ({ ...p, benefitAmount: Number(e.target.value) }))} />
                                    </div>
                                )}
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
                        {step === 4 && <Button onClick={handleSave} className="ml-2" disabled={isSaveDisabled}>Save Policy</Button>}
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
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => onEdit(policy)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                        </DropdownMenuItem>
                        {policy.carrierWebsite && (
                             <DropdownMenuItem asChild>
                                <a href={policy.carrierWebsite} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    <span>Visit Site</span>
                                </a>
                            </DropdownMenuItem>
                        )}
                         <DropdownMenuItem onSelect={() => onDelete(policy.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="flex-1 p-4 pt-0">
                <Separator/>
                <div className="space-y-3 text-sm pt-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Category</span>
                        <Badge variant="secondary">{policy.policySubcategoryName || policy.policyCategoryName}</Badge>
                    </div>
                    {policy.premium != null && (
                        <div className="flex justify-between items-center">
                            <p className="text-muted-foreground">Premium</p>
                            <p className="font-semibold">{`$${policy.premium.toFixed(2)}/mo`}</p>
                        </div>
                    )}
                    {policy.benefitAmount != null && (
                        <div className="flex justify-between items-center">
                            <p className="text-muted-foreground">Benefit Amount</p>
                            <p className="font-semibold">{`$${policy.benefitAmount.toLocaleString()}`}</p>
                        </div>
                    )}
                    {policy.enrollmentDate && (
                        <div className="flex justify-between items-center">
                            <p className="text-muted-foreground">Enrollment Date</p>
                            <p className="font-semibold">{new Date(policy.enrollmentDate).toLocaleDateString('en-US', { timeZone: 'UTC' })}</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

function HealthInfoDialog({ open, onOpenChange, onSave, profile }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: { doctors: SelectedProvider[], medications: SelectedDrug[] }) => void;
    profile: any;
}) {
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
        if (open) {
            setSelectedProviders(profile.doctors || []);
            setSelectedDrugs(profile.medications || []);
        }
    }, [open, profile]);

    const handleProviderQueryChange = (value: string) => {
        setProviderQuery(value);
        if (providerSearchTimeout.current) clearTimeout(providerSearchTimeout.current);
        if (value.length > 0) setIsProviderListVisible(true); else setIsProviderListVisible(false);
        if (value.length < 3) { setProviderResults([]); setProviderLoading(false); return; }
        setProviderLoading(true);
        providerSearchTimeout.current = setTimeout(async () => {
            const result = await searchProviders({ query: value, zipCode: profile.zip || '' });
            setProviderResults(result.providers || []);
            setProviderLoading(false);
        }, 300);
    };

    const handleSelectProvider = (provider: Provider) => {
        if (selectedProviders.some(p => p.provider.npi === provider.npi)) { setProviderQuery(''); setIsProviderListVisible(false); return; }
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
        setSelectedProviders(selectedProviders.filter(p => p.provider.npi !== npi));
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
    
    const handleGenericChoice = (isGeneric: boolean) => setIsGenericSelected(isGeneric);
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

    const handleSave = () => {
        onSave({ doctors: selectedProviders, medications: selectedDrugs });
        onOpenChange(false);
    }
    
    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Edit Health Information</DialogTitle>
                        <DialogDescription>Add, remove, or manage your preferred doctors and medications.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4 max-h-[60vh] overflow-y-auto px-2">
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
                    <DialogFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Sub-Dialogs for Health Info */}
            <Dialog open={!!providerToSelectAffiliation} onOpenChange={(open) => !open && setProviderToSelectAffiliation(null)}><DialogContent><DialogHeader><DialogTitle>Select Hospital Affiliation</DialogTitle><DialogDescription>{providerToSelectAffiliation?.name} is affiliated with multiple hospitals. Please choose the one you primarily visit.</DialogDescription></DialogHeader><div className="py-4"><RadioGroup onValueChange={(value) => { if (providerToSelectAffiliation) { handleAffiliationSelected(providerToSelectAffiliation, value); } }} className="space-y-2 max-h-60 overflow-y-auto">{providerToSelectAffiliation?.affiliations?.map((aff, index) => (<Label key={index} htmlFor={`aff-${index}`} className="flex items-center space-x-3 rounded-md border p-4 has-[:checked]:border-primary"><RadioGroupItem value={aff.name} id={`aff-${index}`} /><span>{aff.name}</span></Label>))}</RadioGroup></div><DialogFooter><Button variant="outline" onClick={() => setProviderToSelectAffiliation(null)}>Cancel</Button></DialogFooter></DialogContent></Dialog>
            <Dialog open={!!drugToConfirm} onOpenChange={(open) => { if (!open) { setDrugToConfirm(null); setIsGenericSelected(null); } }}><DialogContent><DialogHeader><DialogTitle>Configure {drugToConfirm?.name}</DialogTitle><DialogDescription>Select the correct form and strength for this medication.</DialogDescription></DialogHeader>{drugToConfirm && !drugToConfirm.is_generic && drugToConfirm.generic && isGenericSelected === null && (<div className="p-4 border rounded-md bg-amber-50"><p className="text-sm font-semibold">Generic Alternative Available</p><p className="text-sm text-muted-foreground mt-1">Do you take {drugToConfirm.name} (Brand) or its generic version?</p><p className="text-xs text-muted-foreground mt-1">Generic: {drugToConfirm.generic.name}</p><div className="mt-3 flex gap-2"><Button size="sm" onClick={() => handleGenericChoice(false)} variant={isGenericSelected === false ? 'default' : 'outline'}>{drugToConfirm.name} (Brand)</Button><Button size="sm" onClick={() => handleGenericChoice(true)} variant={isGenericSelected === true ? 'default' : 'outline'}>Generic Version</Button></div></div>)}<div className="py-4 space-y-4">{dosageLoading ? (<div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>) : (<>{(isGenericSelected === null && drugToConfirm?.generic && !drugToConfirm.is_generic) ? (<p className="text-center text-sm text-muted-foreground p-4">Please select an option above to see available strengths.</p>) : (<>
                <div className="space-y-2">
                    <FormLabel htmlFor="drug-form">Form</FormLabel>
                    <Select value={selectedForm} onValueChange={setSelectedForm} disabled={uniqueForms.length === 0}>
                        <SelectTrigger id="drug-form"><SelectValue placeholder="Select a form..." /></SelectTrigger>
                        <SelectContent>{uniqueForms.map(form => (<SelectItem key={form} value={form}>{form || 'N/A'}</SelectItem>))}</SelectContent>
                    </Select>
                </div>
                {selectedForm && (
                    <div className="space-y-2">
                        <FormLabel htmlFor="drug-strength">Strength</FormLabel>
                        <Select value={selectedDosage?.rxcui || ''} onValueChange={(rxcui) => { const dosage = dosages.find(d => d.rxcui === rxcui); setSelectedDosage(dosage || null);}} disabled={dosages.filter(d => d.rxnorm_dose_form === selectedForm).length === 0}>
                            <SelectTrigger id="drug-strength"><SelectValue placeholder="Select a strength..." /></SelectTrigger>
                            <SelectContent>{dosages.filter(d => d.rxnorm_dose_form === selectedForm).map(dosage => (<SelectItem key={dosage.rxcui} value={dosage.rxcui}>{dosage.strength || dosage.full_name}</SelectItem>))}</SelectContent>
                        </Select>
                    </div>
                )}
                {dosages.length === 0 && !dosageLoading && (<p className="text-center text-sm text-muted-foreground p-4">No specific strengths found for this selection.</p>)}
            </>)}</>)}</div><DialogFooter><Button variant="outline" onClick={() => setDrugToConfirm(null)}>Cancel</Button><Button onClick={handleProceedToDetails} disabled={!selectedDosage || dosageLoading}>Next</Button></DialogFooter></DialogContent></Dialog>
            <Dialog open={!!drugToAddDetails} onOpenChange={() => !open && setDrugToAddDetails(null)}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Tell us about this drug</DialogTitle><DialogDescription>Provide the quantity and frequency for {drugToAddDetails?.name}.</DialogDescription></DialogHeader><div className="grid gap-4 py-4"><div className="space-y-2"><Label htmlFor="dosage">Dosage</Label><Input id="dosage" value={drugToAddDetails?.full_name || ''} disabled /></div><div className="space-y-2"><Label htmlFor="package">Package</Label><Select value={pkg} onValueChange={setPackage}><SelectTrigger id="package"><SelectValue placeholder="Select package" /></SelectTrigger><SelectContent><SelectItem value="30-day">30-day supply</SelectItem><SelectItem value="60-day">60-day supply</SelectItem><SelectItem value="90-day">90-day supply</SelectItem><SelectItem value="bottle">1 bottle</SelectItem></SelectContent></Select></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="quantity">Quantity</Label><Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} min={1} /></div><div className="space-y-2"><Label htmlFor="frequency">Frequency</Label><Select value={frequency} onValueChange={setFrequency}><SelectTrigger id="frequency"><SelectValue placeholder="Select frequency" /></SelectTrigger><SelectContent><SelectItem value="monthly">Every month</SelectItem><SelectItem value="3-months">Every 3 months</SelectItem><SelectItem value="as-needed">As needed</SelectItem></SelectContent></Select></div></div></div><DialogFooter><Button variant="outline" onClick={() => setDrugToAddDetails(null)}>Cancel</Button><Button onClick={handleFinalAddDrug}>Add to My Drug List</Button></DialogFooter></DialogContent></Dialog>
            <Dialog open={isManualDrugEntryOpen} onOpenChange={setIsManualDrugEntryOpen}><DialogContent><DialogHeader><DialogTitle>Enter Medication Manually</DialogTitle><DialogDescription>If you couldn't find your medication, you can add its details here.</DialogDescription></DialogHeader><form onSubmit={handleManualDrugAdd} className="space-y-4 py-4"><div className="space-y-2"><Label htmlFor="manual-drug-name">Drug Name</Label><Input id="manual-drug-name" name="manual-drug-name" required /></div><div className="space-y-2"><Label htmlFor="manual-drug-dosage">Dosage (optional)</Label><Input id="manual-drug-dosage" name="manual-drug-dosage" placeholder="e.g., 20mg" /></div><DialogFooter><Button variant="outline" type="button" onClick={() => setIsManualDrugEntryOpen(false)}>Cancel</Button><Button type="submit">Add Medication</Button></DialogFooter></form></DialogContent></Dialog>
        </>
    );
}


export default function MyAccountPage() {
    const [user] = useFirebaseAuth();
    
    // Policy state
    const [policies, setPolicies] = useState<PolicyType[]>([]);
    const [isAddPolicyDialogOpen, setIsAddPolicyDialogOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<PolicyType | null>(null);
    const [policyToDelete, setPolicyToDelete] = useState<string | null>(null);

    // Document state
    const [documents, setDocuments] = useState<DocumentType[]>([]);
    const [documentToDelete, setDocumentToDelete] = useState<DocumentType | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Profile state
    const [profile, setProfile] = useState<any>({});
    const [isHealthInfoDialogOpen, setIsHealthInfoDialogOpen] = useState(false);

    const { toast } = useToast();
    
     useEffect(() => {
        if (user && db) {
            // Firestore listeners
            const policiesQuery = query(collection(db, "users", user.uid, "policies"));
            const docsQuery = query(collection(db, "users", user.uid, "documents"));
            const unsubPolicies = onSnapshot(policiesQuery, (snapshot) => setPolicies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PolicyType))));
            const unsubDocs = onSnapshot(docsQuery, (snapshot) => setDocuments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DocumentType))));

            // Fetch user profile data
            const userDocRef = doc(db, 'users', user.uid);
            getDoc(userDocRef).then(docSnap => {
                if (docSnap.exists()) {
                    setProfile(docSnap.data());
                }
            });

            return () => {
                unsubPolicies();
                unsubDocs();
            }
        }
    }, [user]);

    // --- HANDLERS --- //

    const handleSaveProfile = async (newData: any) => {
        if (!user || !db) return;
        const userDocRef = doc(db, 'users', user.uid);
        try {
            await setDoc(userDocRef, newData, { merge: true });
            setProfile(prev => ({ ...prev, ...newData }));
            toast({ title: "Profile Updated", description: "Your information has been saved." });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: "Error", description: "Could not save profile." });
        }
    };

    const handleSaveHealthInfo = async (data: { doctors: SelectedProvider[], medications: SelectedDrug[] }) => {
        handleSaveProfile({ doctors: data.doctors, medications: data.medications });
    };

    // Policy handlers
    const handleSavePolicy = async (policyData: Omit<PolicyType, 'id'>, id?: string) => {
        if (!user || !db) return;
        
        const dataToSave: { [key: string]: any } = {};
        Object.entries(policyData).forEach(([key, value]) => {
            if (value !== undefined) {
                dataToSave[key] = value;
            }
        });

        try {
            if (id) {
                const policyRef = doc(db, "users", user.uid, "policies", id);
                await setDoc(policyRef, dataToSave, { merge: true });
                toast({ title: 'Policy Updated', description: `${dataToSave.carrierName} policy has been updated.` });
            } else {
                const policiesCol = collection(db, "users", user.uid, "policies");
                await addDoc(policiesCol, { ...dataToSave, createdAt: serverTimestamp() });
                toast({ title: 'Policy Added', description: `${dataToSave.carrierName} policy has been added.` });
            }
        } catch (error) {
            console.error("Error saving policy:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save policy.' });
        }
        setEditingPolicy(null);
    };

    const handleEditPolicy = (policy: PolicyType) => {
        setEditingPolicy(policy);
        setIsAddPolicyDialogOpen(true);
    }
    
    const handleDeletePolicy = async () => {
        if(policyToDelete && user && db) {
            try {
                await deleteDoc(doc(db, "users", user.uid, "policies", policyToDelete));
                toast({ title: 'Policy Removed', description: `The policy has been removed.` });
                setPolicyToDelete(null);
            } catch (error) {
                console.error("Error deleting policy:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not delete policy.' });
            }
        }
    }

    // Document handlers
     const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0] && user && db && storage) {
            const file = event.target.files[0];
            const storagePath = `users/${user.uid}/documents/${file.name}`;
            const storageRef = ref(storage, storagePath);

            try {
                const snapshot = await uploadBytes(storageRef, file);
                const downloadURL = await getDownloadURL(snapshot.ref);

                const newDocument: Omit<DocumentType, 'id'> = {
                    name: file.name,
                    uploadDate: new Date().toISOString().split('T')[0],
                    size: `${(file.size / 1024).toFixed(2)} KB`,
                    downloadURL,
                    storagePath,
                };
                
                await addDoc(collection(db, "users", user.uid, "documents"), newDocument);
                toast({ title: "Document Uploaded", description: file.name });

            } catch (error) {
                console.error("Error uploading document:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not upload document.' });
            }
        }
    };
    
    const handleDeleteDocument = async () => {
        if (documentToDelete && user && db && storage) {
            const storageRef = ref(storage, documentToDelete.storagePath);
            try {
                // Delete file from storage first
                await deleteObject(storageRef);
                // Then delete the reference from Firestore
                await deleteDoc(doc(db, "users", user.uid, "documents", documentToDelete.id));

                toast({ title: "Document Removed", description: `${documentToDelete.name} has been removed.` });
                setDocumentToDelete(null);
            } catch (error) {
                console.error("Error deleting document:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not delete document.' });
            }
        }
    }

    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    const displayName = profile.firstName ? `${profile.firstName} ${profile.lastName}` : user?.displayName;

  return (
        <div className="space-y-8 max-w-5xl mx-auto">
             <div>
                <h1 className="text-2xl font-semibold">My Account</h1>
                <p className="text-base text-muted-foreground mt-1">Manage your policies, documents, and personal information.</p>
            </div>
        
            <Card>
                <CardHeader className="flex flex-row justify-between items-start">
                    <div>
                        <CardTitle className="text-xl">Your Policies</CardTitle>
                        <CardDescription>Here are the policies you've added to your nest.</CardDescription>
                    </div>
                    <Button onClick={() => { setEditingPolicy(null); setIsAddPolicyDialogOpen(true); }}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Policy
                    </Button>
                </CardHeader>
                <CardContent>
                    {policies.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {policies.map((policy) => (
                                <PolicyCard key={policy.id} policy={policy} onEdit={handleEditPolicy} onDelete={() => setPolicyToDelete(policy.id)} />
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

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Your Documents</CardTitle>
                    <CardDescription>Upload and manage supporting documents like your Medicare card or proof of residence.</CardDescription>
                </CardHeader>
                <CardContent>
                    {documents.length > 0 ? (
                        <div className="space-y-2">
                             {documents.map(doc => (
                                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <File className="h-6 w-6 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">{doc.name}</p>
                                            <p className="text-xs text-muted-foreground">Uploaded on {new Date(doc.uploadDate).toLocaleDateString()} &bull; {doc.size}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" asChild><a href={doc.downloadURL} download={doc.name} target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4" /></a></Button>
                                        <Button variant="ghost" size="icon" onClick={() => setDocumentToDelete(doc)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </div>
                                </div>
                             ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg">
                            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mt-4">No Documents Uploaded</h3>
                            <p className="text-muted-foreground mt-2">Click the button below to upload your first document.</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                     <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                     <Button onClick={triggerFileUpload}>
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Upload Document
                    </Button>
                </CardFooter>
            </Card>

            <div className="space-y-6">
                <EditableCard title="Personal Information" FormComponent={PersonalInfoForm} onSave={handleSaveProfile} profileData={profile}>
                    <InfoRow label="Name" value={displayName || ''} />
                    <Separator/>
                    <InfoRow label="Date of Birth" value={profile.dob ? new Date(profile.dob).toLocaleDateString('en-US', { timeZone: 'UTC' }) : ''} />
                </EditableCard>

                <EditableCard title="Contact Information" FormComponent={ContactInfoForm} onSave={handleSaveProfile} profileData={profile}>
                    <InfoRow label="Email" value={profile.email || user?.email || ''} />
                    <Separator/>
                    <InfoRow label="Phone" value={profile.phone || ''} />
                    <Separator/>
                    <InfoRow label="Address" value={`${profile.address || ''} ${profile.city || ''} ${profile.state || ''} ${profile.zip || ''}`.trim()} />
                </EditableCard>

                <EditableCard title="Financial & Health IDs" FormComponent={FinancialInfoForm} onSave={handleSaveProfile} profileData={profile}>
                    <InfoRow label="Medicare ID" value={profile.medicareId || ''} isSensitive={true}/>
                </EditableCard>
            </div>
            
            <Card>
                <CardHeader className="flex flex-row justify-between items-start">
                    <div>
                        <CardTitle className="text-xl">Health Information</CardTitle>
                        <CardDescription>Manage your preferred doctors and current medications.</CardDescription>
                    </div>
                    <Button onClick={() => setIsHealthInfoDialogOpen(true)} variant="outline">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Health Info
                    </Button>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><Stethoscope className="h-5 w-5"/>Your Doctors</h4>
                        {profile.doctors && profile.doctors.length > 0 ? (
                            <div className="space-y-2 rounded-md border p-2 max-h-60 overflow-y-auto mt-4">
                                {profile.doctors.map((p: SelectedProvider) => (
                                    <div key={p.npi} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                        <div className="flex-1"><p className="text-sm font-medium">{p.name}</p>{p.selectedAffiliation && <p className="text-xs text-muted-foreground">{p.selectedAffiliation}</p>}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                           <p className="text-sm text-muted-foreground mt-2">No doctors added yet.</p>
                        )}
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><Pill className="h-5 w-5"/>Your Medications</h4>
                        {profile.medications && profile.medications.length > 0 ? (
                           <div className="space-y-2 rounded-md border p-2 max-h-60 overflow-y-auto mt-4">
                                {profile.medications.map((drug: SelectedDrug) => (
                                    <div key={drug.rxcui} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                        <div className="flex-1"><p className="text-sm font-medium">{drug.full_name}</p><p className="text-xs text-muted-foreground">Qty: {drug.quantity} &bull; {frequencyLabels[drug.frequency]} &bull; {packageLabels[drug.package]}</p></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                           <p className="text-sm text-muted-foreground mt-2">No medications added yet.</p>
                        )}
                    </div>
                </CardContent>
            </Card>


            <PolicyDialog 
                open={isAddPolicyDialogOpen} 
                onOpenChange={setIsAddPolicyDialogOpen} 
                onSave={handleSavePolicy}
                editingPolicy={editingPolicy}
            />

            <HealthInfoDialog 
                open={isHealthInfoDialogOpen}
                onOpenChange={setIsHealthInfoDialogOpen}
                onSave={handleSaveHealthInfo}
                profile={profile}
            />

            <AlertDialog open={!!policyToDelete} onOpenChange={() => setPolicyToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This action will permanently delete this policy from your list. This cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeletePolicy}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            <AlertDialog open={!!documentToDelete} onOpenChange={() => setDocumentToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This action will permanently delete this document. This cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteDocument}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
  )
}

    