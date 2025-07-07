
"use client"

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, File, Trash2, Download, PlusCircle, Edit, ExternalLink, ArrowLeft, Layers, Shield, MoreVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Policy as PolicyType, Document as DocumentType } from '@/types';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogContent } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { db } from '@/lib/firebase';
import { collection, doc, addDoc, setDoc, deleteDoc, onSnapshot, query, serverTimestamp } from 'firebase/firestore';


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

export default function PoliciesAndDocumentsPage() {
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
    
    const { toast } = useToast();
    
     useEffect(() => {
        if (user && db) {
            const policiesQuery = query(collection(db, "users", user.uid, "policies"));
            const docsQuery = query(collection(db, "users", user.uid, "documents"));

            const unsubPolicies = onSnapshot(policiesQuery, (snapshot) => {
                const userPolicies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PolicyType));
                setPolicies(userPolicies);
            });

            const unsubDocs = onSnapshot(docsQuery, (snapshot) => {
                const userDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DocumentType));
                setDocuments(userDocs);
            });

            return () => {
                unsubPolicies();
                unsubDocs();
            }
        }
    }, [user]);

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
        if (event.target.files && event.target.files[0] && user && db) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = async (e) => {
                const newDocument: Omit<DocumentType, 'id'> = {
                    name: file.name,
                    uploadDate: new Date().toISOString().split('T')[0],
                    size: `${(file.size / 1024).toFixed(2)} KB`,
                    dataUrl: e.target?.result as string,
                };
                try {
                    await addDoc(collection(db, "users", user.uid, "documents"), newDocument);
                    toast({ title: "Document Uploaded", description: file.name });
                } catch (error) {
                     console.error("Error uploading document:", error);
                    toast({ variant: 'destructive', title: 'Error', description: 'Could not upload document.' });
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleDeleteDocument = async () => {
        if (documentToDelete && user && db) {
            try {
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


  return (
        <div className="space-y-8 max-w-5xl mx-auto">
             <div>
                <h1 className="text-2xl font-semibold">My Policies &amp; Documents</h1>
                <p className="text-base text-muted-foreground mt-1">Manage your insurance policies and upload important documents.</p>
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
                                        <Button variant="ghost" size="icon" asChild><a href={doc.dataUrl} download={doc.name}><Download className="h-4 w-4" /></a></Button>
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

    