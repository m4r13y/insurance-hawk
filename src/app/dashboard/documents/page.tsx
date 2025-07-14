
"use client"

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, File, Trash2, Download, PlusCircle, Edit, ExternalLink, ArrowLeft, Layers, Shield, MoreVertical, User, Pencil, Eye, EyeOff, Stethoscope, Pill, Loader2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Policy as PolicyType, Document as DocumentType, Provider, Drug, SelectedProvider, SelectedDrug } from '@/types';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogContent } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { db, storage } from '@/lib/firebase';
import { collection, doc, addDoc, setDoc, deleteDoc, onSnapshot, query, serverTimestamp, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';
import { carriers } from '@/lib/mock-data';


// --- MOCK DATA & CONFIGS (from original file) --- //
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
            setPolicy(editingPolicy || { status: 'pending' });
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
                        <div className="space-y-4">
                            <Input 
                                placeholder="Search for a carrier..." 
                                value={carrierSearch} 
                                onChange={(e) => setCarrierSearch(e.target.value)}
                            />
                            <ScrollArea className="h-64">
                                <div className="space-y-2">
                                    {filteredCarriers.length > 0 ? (
                                        filteredCarriers.map(c => (
                                            <Button 
                                                key={c.id} 
                                                variant="ghost" 
                                                className="w-full justify-start gap-4"
                                                onClick={() => handleSelectCarrier(c.id)}
                                            >
                                                {c.logoUrl && <Image src={c.logoUrl} alt={c.name} width={24} height={24} />}
                                                <span>{c.name}</span>
                                            </Button>
                                        ))
                                    ) : (
                                        <p className="text-center text-sm text-muted-foreground pt-4">No carriers found.</p>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
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
                             <div className="space-y-2">
                                <Label htmlFor="status">Policy Status</Label>
                                <Select value={policy.status} onValueChange={(value: PolicyType['status']) => setPolicy(p => ({ ...p, status: value }))}>
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Set status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="declined">Declined</SelectItem>
                                    </SelectContent>
                                </Select>
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
    
    const statusClasses = {
        active: "from-green-400 to-emerald-500",
        pending: "from-yellow-400 to-amber-500",
        declined: "from-red-500 to-rose-600",
    }
    
    return (
        <Card className="flex flex-col relative overflow-hidden">
            <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", statusClasses[policy.status])} />
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
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={policy.status === 'active' ? 'default' : policy.status === 'pending' ? 'secondary' : 'destructive'} className={cn(
                            policy.status === 'active' && 'bg-green-100 text-green-800',
                            policy.status === 'pending' && 'bg-yellow-100 text-yellow-800',
                            policy.status === 'declined' && 'bg-red-100 text-red-800',
                        )}>{policy.status}</Badge>
                    </div>
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
            const unsubProfile = onSnapshot(userDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    setProfile(docSnap.data());
                }
            });

            return () => {
                unsubPolicies();
                unsubDocs();
                unsubProfile();
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
                     <Button asChild variant="outline">
                        <Link href="/dashboard/health-info">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Health Info
                        </Link>
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

            <AlertDialog open={!!policyToDelete} onOpenChange={() => setPolicyToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This action will permanently delete this policy from your list. This cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeletePolicy} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
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
                        <AlertDialogAction onClick={handleDeleteDocument} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
  )
}
