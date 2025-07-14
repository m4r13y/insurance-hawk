

"use client"

import React, { useState, useEffect, Suspense, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { useForm, type FieldPath } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { mockPlans, carriers } from "@/lib/mock-data"
import { Progress } from "@/components/ui/progress"
import { ShieldCheck, CheckCircle, ArrowRight, User, HeartPulse, FileText, Bot, FileCheck, PartyPopper, Heart, Smile, Hospital, ShieldAlert, FileHeart, UserPlus, Pill, PlusCircle, Trash2, Loader2, Hospital as HospitalIcon, ExternalLink, HeartCrack } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import type { Plan, Drug, Provider, SelectedProvider, SelectedDrug, Policy } from "@/types"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { getRelatedDrugs, searchDrugs, searchProviders } from "@/app/dashboard/health-quotes/actions"
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from "@/components/ui/dialog"
import Image from "next/image"
import { useFirebaseAuth } from "@/hooks/use-firebase-auth"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

// --- TYPES FOR SEARCH COMPONENTS --- //
type SelectedDrug = Drug & {
    quantity: number;
    frequency: string;
    package: string;
};

type SelectedProvider = Provider & {
    selectedAffiliation?: string;
};

const frequencyLabels: { [key: string]: string } = {
    monthly: 'Every month', '3-months': 'Every 3 months', 'as-needed': 'As needed',
};

const packageLabels: { [key: string]: string } = {
    '30-day': '30-day supply', '60-day': '60-day supply', '90-day': '90-day supply', 'bottle': '1 bottle',
};

// --- SCHEMAS --- //

const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female"], { required_error: "Gender is required." }),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(5, "Zip code is required"),
  phone: z.string().min(10, "Phone number is required"),
  email: z.string().email(),
});

const medicareInfoSchema = z.object({
  medicareClaimNumber: z.string().min(1, "Medicare Claim Number is required."),
  partAEffectiveDate: z.string().min(1, "Part A Effective Date is required."),
  partBEffectiveDate: z.string().min(1, "Part B Effective Date is required."),
});

const signatureSchema = z.object({
    signature: z.string().min(1, "Digital signature is required"),
    agreesToTerms: z.boolean().refine(val => val === true, { message: "You must agree to the terms and disclaimers." }),
});

const medSupplementSchema = personalInfoSchema.merge(medicareInfoSchema).merge(signatureSchema).extend({
  hasOtherInsurance: z.enum(["yes", "no"], { required_error: "This field is required." }),
  isReplacingCoverage: z.enum(["yes", "no"], { required_error: "This field is required." }),
  hasPrescriptionPlan: z.enum(["yes", "no"], { required_error: "This field is required." }),
  hospitalizedLast12Months: z.enum(["yes", "no"], { required_error: "This field is required." }),
  hasMajorIllness: z.enum(["yes", "no"], { required_error: "This field is required." }),
  majorIllnessDetails: z.string().optional(),
  planId: z.string().min(1, "You must select a plan to apply for."),
  wantsAgentContact: z.enum(["yes", "no"], { required_error: "This field is required." }),
  wantsDental: z.boolean().default(false).optional(),
  wantsCancer: z.boolean().default(false).optional(),
  wantsLifeInsurance: z.boolean().default(false).optional(),
  wantsRetirementPlanning: z.boolean().default(false).optional(),
  wantsDrugPlan: z.boolean().default(false).optional(),
  selectedProviders: z.array(z.any()).optional(),
  selectedDrugs: z.array(z.any()).optional(),
});

const dentalSchema = personalInfoSchema.merge(signatureSchema).extend({
    planId: z.string().min(1, "You must select a plan to apply for."),
    wantsAgentContact: z.enum(["yes", "no"], { required_error: "This field is required." }),
});

const hospitalIndemnitySchema = personalInfoSchema.merge(signatureSchema).extend({
    planId: z.string().min(1, "You must select a plan to apply for."),
    hasMajorIllness: z.enum(["yes", "no"], { required_error: "This field is required." }),
    majorIllnessDetails: z.string().optional(),
    wantsAgentContact: z.enum(["yes", "no"], { required_error: "This field is required." }),
});

const lifeInsuranceSchema = personalInfoSchema.merge(signatureSchema).extend({
    planId: z.string().optional(),
    coverageAmount: z.coerce.number().min(10000, "Minimum coverage is $10,000"),
    tobaccoUse: z.enum(["none", "last_12_months", "over_12_months_ago"], { required_error: "Please select a tobacco use option."}),
    beneficiaryName: z.string().min(1, "Beneficiary name is required"),
    beneficiaryRelationship: z.string().min(1, "Beneficiary relationship is required"),
    wantsAgentContact: z.enum(["yes", "no"], { required_error: "This field is required." }),
});

const healthInsuranceSchema = personalInfoSchema.merge(signatureSchema).extend({
    planId: z.string().min(1, "You must select a plan to apply for."),
    isReplacingCoverage: z.enum(["yes", "no"], { required_error: "This field is required." }),
    wantsAgentContact: z.enum(["yes", "no"], { required_error: "This field is required." }),
    selectedProviders: z.array(z.any()).optional(),
    selectedDrugs: z.array(z.any()).optional(),
});

const medicareAdvantageSchema = personalInfoSchema.merge(medicareInfoSchema).merge(signatureSchema).extend({
    enrollmentPeriod: z.enum(["aep", "oep", "sep", "iep"], { required_error: "Please select your enrollment period." }),
    pcpName: z.string().optional(),
    wantsAgentContact: z.enum(["yes", "no"], { required_error: "This field is required." }),
    selectedProviders: z.array(z.any()).optional(),
    selectedDrugs: z.array(z.any()).optional(),
});

const cancerSchema = personalInfoSchema.merge(signatureSchema).extend({
  planId: z.string().optional(),
  heightFt: z.coerce.number().min(4, "Height must be at least 4'0\"").max(7, "Please enter a valid height"),
  heightIn: z.coerce.number().min(0).max(11),
  weight: z.coerce.number().min(50, "Weight must be at least 50 lbs").max(500, "Please enter a valid weight"),
  // Medical Questions
  q3: z.enum(["yes", "no"], { required_error: "This field is required." }),
  q3_details: z.string().optional(),
  q4: z.enum(["yes", "no"], { required_error: "This field is required." }),
  q4_details: z.string().optional(),
  q5: z.enum(["yes", "no"], { required_error: "This field is required." }),
  q5_details: z.string().optional(),
  wantsAgentContact: z.enum(["yes", "no"], { required_error: "This field is required." }),
});

// --- HELPER COMPONENTS --- //

const SuccessPage = ({ title }: { title: string }) => (
    <div className="flex flex-col items-center justify-center text-center h-full max-w-lg mx-auto">
        <Card className="w-full">
            <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <PartyPopper className="h-8 w-8" />
                </div>
                <CardTitle className="font-headline text-2xl sm:text-3xl pt-4">{title} Complete!</CardTitle>
                <CardDescription className="text-base">Thank you for submitting your application.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">A licensed agent will be in contact with you shortly to finalize your enrollment. Your new policy has been added to your account with a "Pending" status.</p>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full" size="lg">
                    <Link href="/dashboard/documents">Return to My Account</Link>
                </Button>
            </CardFooter>
        </Card>
    </div>
);

const PlanDetailsCard = ({ planName, provider, premium, carrierLogoUrl, carrierWebsite }: { planName?: string, provider?: string, premium?: string, carrierLogoUrl?: string, carrierWebsite?: string }) => {
    if (!planName) return null;
    return (
        <Card className="w-full max-w-sm shrink-0 hidden sm:block">
            <CardHeader className="p-4 flex flex-row items-center gap-4">
                {carrierLogoUrl && (
                    <Image src={carrierLogoUrl} alt={provider || ''} width={48} height={48} className="rounded-full object-contain" />
                )}
                <div className="flex-1">
                    <CardTitle className="text-lg">{provider}</CardTitle>
                    <CardDescription>{planName}</CardDescription>
                </div>
            </CardHeader>
            <CardFooter className="p-4 pt-0 flex justify-between items-center">
                {premium && (
                    <p className="font-bold text-xl">${parseFloat(premium).toFixed(2)}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                )}
                {carrierWebsite && (
                    <Button asChild variant="ghost" size="sm" className="text-muted-foreground px-2">
                        <a href={carrierWebsite} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${provider} website`}>
                           Visit Website <ExternalLink className="ml-1.5 h-4 w-4" />
                        </a>
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};

// --- APPLICATION FORMS --- //
async function saveApplicationAsPolicy(userId: string, data: Partial<Policy>) {
    if (!db) {
        throw new Error("Database not initialized");
    }
    const policiesCol = collection(db, "users", userId, "policies");
    await addDoc(policiesCol, {
        ...data,
        status: 'pending',
        createdAt: serverTimestamp()
    });
}

function CancerApplication() {
    type FormSchema = z.infer<typeof cancerSchema>;
    const [user] = useFirebaseAuth();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [step, setStep] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const planId = searchParams.get('planId');
    const planName = searchParams.get('planName');
    const provider = searchParams.get('provider');
    const premium = searchParams.get('premium');
    const carrierInfo = carriers.find(c => provider && c.name.includes(provider));

    const form = useForm<FormSchema>({
        resolver: zodResolver(cancerSchema),
        defaultValues: {
            planId: planId || '',
            wantsAgentContact: "yes",
            firstName: "", lastName: "", dob: "", gender: undefined, address: "", city: "", state: "", zip: "", phone: "", email: "",
            heightFt: 5, heightIn: 8, weight: 150,
            q3: undefined, q3_details: "",
            q4: undefined, q4_details: "",
            q5: undefined, q5_details: "",
            signature: "", agreesToTerms: false,
        }
    });

    const steps = [
        { id: 1, name: 'Personal Information', fields: ['firstName', 'lastName', 'dob', 'gender', 'address', 'city', 'state', 'zip', 'phone', 'email'] as FieldPath<FormSchema>[] },
        { id: 2, name: 'Underwriting Information', fields: ['heightFt', 'heightIn', 'weight'] as FieldPath<FormSchema>[] },
        { id: 3, name: 'Medical Questions', fields: ['q3', 'q4', 'q5'] as FieldPath<FormSchema>[] },
        { id: 4, name: 'Signature', fields: ['signature', 'agreesToTerms', 'wantsAgentContact'] as FieldPath<FormSchema>[] },
    ];

    const handleNext = async () => {
        const fieldsToValidate = steps[step - 1].fields;
        const output = await form.trigger(fieldsToValidate, { shouldFocus: true });
        if (output) setStep(s => s + 1);
    };

    const handlePrev = () => setStep(s => s - 1);

    async function onSubmit(values: FormSchema) {
        if (!user || !db) return;
        try {
            const policyData: Partial<Policy> = {
                planName: planName || "Cancer Insurance",
                premium: premium ? parseFloat(premium) : 0,
                policyCategoryName: "Cancer Insurance",
                policyCategoryId: "cancer",
                carrierName: provider || "Unknown",
                carrierId: carrierInfo?.id || "unknown",
                carrierLogoUrl: carrierInfo?.logoUrl,
                carrierWebsite: carrierInfo?.website,
                enrollmentDate: new Date().toISOString().split('T')[0],
            };
            await saveApplicationAsPolicy(user.uid, policyData);
            toast({ title: "Application Submitted!", description: "We've received your cancer insurance application." });
            setIsSubmitted(true);
        } catch (error) {
            console.error("Error submitting application:", error);
            toast({ variant: "destructive", title: "Submission Failed", description: "There was an error submitting your application." });
        }
    }

    if (isSubmitted) return <SuccessPage title="Cancer Application" />;
    
    if (step === 0) return (
        <div className="flex flex-col items-center justify-center text-center h-full max-w-lg mx-auto">
            <Card className="w-full">
                <CardHeader>
                     <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                         <HeartCrack className="h-6 w-6" />
                    </div>
                    <CardTitle className="font-headline text-2xl sm:text-3xl pt-4">Cancer Insurance Application</CardTitle>
                </CardHeader>
                <CardContent><p className="text-base text-muted-foreground">This secure application should only take a few minutes to complete.</p></CardContent>
                <CardFooter><Button className="w-full" size="lg" onClick={() => setStep(1)}>Start Application <ArrowRight className="ml-2 h-4 w-4" /></Button></CardFooter>
            </Card>
        </div>
    );
    
    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Cancer Insurance Application</h1>
                    <p className="text-base text-muted-foreground mt-1">Step {step} of {steps.length}: <strong>{steps[step - 1].name}</strong></p>
                </div>
                 <PlanDetailsCard 
                    planName={planName || undefined} 
                    provider={provider || undefined} 
                    premium={premium || undefined}
                    carrierLogoUrl={carrierInfo?.logoUrl}
                    carrierWebsite={carrierInfo?.website}
                />
            </div>
            <Progress value={(step / steps.length) * 100} />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {step === 1 && ( /* Personal Info */
                        <Card><CardHeader><CardTitle>Personal Information</CardTitle></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                            <FormField control={form.control} name="firstName" render={({ field }) => <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="lastName" render={({ field }) => <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="dob" render={({ field }) => <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="gender" render={({ field }) => <FormItem><FormLabel>Gender</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="male" /></FormControl><FormLabel className="font-normal">Male</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="female" /></FormControl><FormLabel className="font-normal">Female</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="address" render={({ field }) => <FormItem className="md:col-span-2"><FormLabel>Street Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="city" render={({ field }) => <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="state" render={({ field }) => <FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="zip" render={({ field }) => <FormItem><FormLabel>Zip Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="phone" render={({ field }) => <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="email" render={({ field }) => <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>} />
                        </CardContent></Card>
                    )}
                    {step === 2 && ( /* Underwriting Info */
                        <Card><CardHeader><CardTitle>Underwriting Information</CardTitle></CardHeader><CardContent className="space-y-6 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormItem>
                                    <FormLabel>Height</FormLabel>
                                    <div className="flex gap-2">
                                        <FormField control={form.control} name="heightFt" render={({ field }) => <FormItem className="flex-1"><FormControl><Input type="number" {...field} placeholder="ft." /></FormControl><FormMessage /></FormItem>} />
                                        <FormField control={form.control} name="heightIn" render={({ field }) => <FormItem className="flex-1"><FormControl><Input type="number" {...field} placeholder="in." /></FormControl><FormMessage /></FormItem>} />
                                    </div>
                                </FormItem>
                                 <FormField control={form.control} name="weight" render={({ field }) => <FormItem><FormLabel>Weight (lbs)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
                            </div>
                        </CardContent></Card>
                    )}
                    {step === 3 && ( /* Medical Questions */
                        <Card><CardHeader><CardTitle>Medical Questions</CardTitle><CardDescription>Please answer all questions completely and accurately.</CardDescription></CardHeader><CardContent className="space-y-8 pt-6">
                             <FormField control={form.control} name="q3" render={({ field }) => (
                                 <FormItem>
                                     <FormLabel>3. In the past 5 years, have you been diagnosed with, treated for, or had any indication of cancer (excluding basal cell carcinoma)?</FormLabel>
                                     <FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl>
                                     {form.watch("q3") === "yes" && <FormField control={form.control} name="q3_details" render={({ field }) => <FormItem className="mt-2"><FormLabel className="text-sm">Please provide details</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>} />}
                                     <FormMessage />
                                 </FormItem>
                             )} />
                             <FormField control={form.control} name="q4" render={({ field }) => (
                                 <FormItem>
                                     <FormLabel>4. Have you ever been diagnosed with or treated for Acquired Immune Deficiency Syndrome (AIDS) or tested positive for the Human Immunodeficiency Virus (HIV)?</FormLabel>
                                     <FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl>
                                     {form.watch("q4") === "yes" && <FormField control={form.control} name="q4_details" render={({ field }) => <FormItem className="mt-2"><FormLabel className="text-sm">Please provide details</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>} />}
                                     <FormMessage />
                                 </FormItem>
                             )} />
                             <FormField control={form.control} name="q5" render={({ field }) => (
                                 <FormItem>
                                     <FormLabel>5. Are you currently hospitalized, in a nursing facility, or do you require the use of a wheelchair or assistance with activities of daily living?</FormLabel>
                                     <FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl>
                                     {form.watch("q5") === "yes" && <FormField control={form.control} name="q5_details" render={({ field }) => <FormItem className="mt-2"><FormLabel className="text-sm">Please provide details</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>} />}
                                     <FormMessage />
                                 </FormItem>
                             )} />
                        </CardContent></Card>
                    )}
                     {step === 4 && ( /* Signature */
                         <Card><CardHeader><CardTitle>Signature & Consent</CardTitle></CardHeader><CardContent className="space-y-6 pt-6">
                            <FormField control={form.control} name="wantsAgentContact" render={({ field }) => <FormItem><FormLabel>Would you like a licensed agent to contact you to review your application?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="agreesToTerms" render={({ field }) => <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>I confirm all information is accurate and agree to the disclaimers and privacy policy.</FormLabel><FormMessage/></div></FormItem>} />
                            <FormField control={form.control} name="signature" render={({ field }) => <FormItem><FormLabel>Digital Signature</FormLabel><FormControl><Input placeholder="Type your full name" {...field} /></FormControl><FormDescription>By typing your name, you are electronically signing this application.</FormDescription><FormMessage /></FormItem>} />
                        </CardContent></Card>
                    )}
                    <div className="flex justify-between">
                        {step > 1 ? (<Button type="button" variant="outline" onClick={handlePrev}>Back</Button>) : <div />}
                        {step < steps.length ? (<Button type="button" onClick={handleNext}>Next Step <ArrowRight className="ml-2 h-4 w-4"/></Button>) : (<Button type="submit">Submit Application</Button>)}
                    </div>
                </form>
            </Form>
        </div>
    );
}

function MedicareSupplementApplication() {
    type FormSchema = z.infer<typeof medSupplementSchema>;
    const [user] = useFirebaseAuth();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [step, setStep] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // --- State for Doctors/Meds Search ---
    const [providerQuery, setProviderQuery] = useState('');
    const [providerZipCode, setProviderZipCode] = useState('');
    const [providerResults, setProviderResults] = useState<Provider[]>([]);
    const [providerLoading, setProviderLoading] = useState(false);
    const [isProviderListVisible, setIsProviderListVisible] = useState(false);
    const [_selectedProviders, _setSelectedProviders] = useState<SelectedProvider[]>([]);
    const providerSearchTimeout = useRef<NodeJS.Timeout | null>(null);
    const [providerToSelectAffiliation, setProviderToSelectAffiliation] = useState<Provider | null>(null);
    
    const [medicationQuery, setMedicationQuery] = useState('');
    const [medicationResults, setMedicationResults] = useState<Drug[]>([]);
    const [medicationSuggestions, setMedicationSuggestions] = useState<string[]>([]);
    const [medicationLoading, setMedicationLoading] = useState(false);
    const [isMedicationListVisible, setIsMedicationListVisible] = useState(false);
    const [_selectedDrugs, _setSelectedDrugs] = useState<SelectedDrug[]>([]);
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
    // --- End State for Doctors/Meds Search ---

    const quotedPlanId = 'quoted-plan';
    const planId = searchParams.get('planId');
    const planName = searchParams.get('planName');
    const provider = searchParams.get('provider');
    const premium = searchParams.get('premium');
    
    const supplementPlans = mockPlans.filter(p => p.category === "Medicare Supplement");
    const allAvailablePlans: Plan[] = [...supplementPlans];
    let quotedPlan: Plan | null = null;
    
    if (planName && provider && premium) {
        quotedPlan = { id: quotedPlanId, name: planName, provider, premium: parseFloat(premium), category: 'Quoted Plan', type: 'PPO', deductible: 0, maxOutOfPocket: 0, rating: 0, features: { dental: false, vision: false, hearing: false, prescriptionDrug: false }};
        if (!allAvailablePlans.some(p => p.name === quotedPlan?.name && p.provider === quotedPlan?.provider)) {
            allAvailablePlans.unshift(quotedPlan);
        }
    }
    const carrierInfo = carriers.find(c => provider && c.name.includes(provider));
    
    const form = useForm<FormSchema>({
        resolver: zodResolver(medSupplementSchema),
        defaultValues: {
            planId: planId || (quotedPlan ? quotedPlanId : ''),
            wantsAgentContact: "yes",
            firstName: "", lastName: "", dob: "", gender: undefined, address: "", city: "", state: "", zip: "", phone: "", email: "",
            medicareClaimNumber: "", partAEffectiveDate: "", partBEffectiveDate: "",
            isReplacingCoverage: undefined, hasPrescriptionPlan: undefined, hasMajorIllness: undefined, hasOtherInsurance: undefined, hospitalizedLast12Months: undefined,
            signature: "", agreesToTerms: false, majorIllnessDetails: "",
            wantsDental: false, wantsCancer: false, wantsLifeInsurance: false, wantsRetirementPlanning: false, wantsDrugPlan: false,
            selectedProviders: [], selectedDrugs: [],
        }
    });

    useEffect(() => {
      setProviderZipCode(form.getValues('zip'));
    }, [form.watch('zip')]);
    
    const updateSelectedProviders = (newProviders: SelectedProvider[]) => {
        _setSelectedProviders(newProviders);
        form.setValue('selectedProviders', newProviders);
    };

    const updateSelectedDrugs = (newDrugs: SelectedDrug[]) => {
        _setSelectedDrugs(newDrugs);
        form.setValue('selectedDrugs', newDrugs);
    };


    const steps = [
        { id: 1, name: 'Personal Information', fields: ['firstName', 'lastName', 'dob', 'gender', 'address', 'city', 'state', 'zip', 'phone', 'email'] },
        { id: 2, name: 'Medicare Details', fields: ['medicareClaimNumber', 'partAEffectiveDate', 'partBEffectiveDate'] },
        { id: 3, name: 'Current & Medical History', fields: ['isReplacingCoverage', 'hasPrescriptionPlan', 'hasMajorIllness'] },
        { id: 4, name: 'Doctors & Medications', fields: ['selectedProviders', 'selectedDrugs'] },
        { id: 5, name: 'Plan & Agent', fields: ['planId', 'wantsAgentContact'] },
        { id: 6, name: 'Signature', fields: ['signature', 'agreesToTerms'] },
    ];

    const handleNext = async () => {
        const fieldsToValidate = steps[step - 1].fields as FieldPath<FormSchema>[];
        const output = await form.trigger(fieldsToValidate, { shouldFocus: true });
        if (output) setStep(s => s + 1);
    };

    const handlePrev = () => setStep(s => s - 1);

    async function onSubmit(values: FormSchema) {
        if (!user || !db) return;
        try {
            const policyData: Partial<Policy> = {
                planName: planName || "Medicare Supplement",
                premium: premium ? parseFloat(premium) : 0,
                policyCategoryName: "Medicare Supplement",
                policyCategoryId: "medicare",
                carrierName: provider || "Unknown",
                carrierId: carrierInfo?.id || "unknown",
                carrierLogoUrl: carrierInfo?.logoUrl,
                carrierWebsite: carrierInfo?.website,
                enrollmentDate: new Date().toISOString().split('T')[0],
            };
            await saveApplicationAsPolicy(user.uid, policyData);
            toast({ title: "Application Submitted!", description: "We've received your application." });
            setIsSubmitted(true);
        } catch (error) {
            console.error("Error submitting application:", error);
            toast({ variant: "destructive", title: "Submission Failed", description: "There was an error submitting your application." });
        }
    }
    
    // --- Handlers for Doctors/Meds Search ---
    const handleProviderQueryChange = (value: string) => {
        setProviderQuery(value);
        if (providerSearchTimeout.current) clearTimeout(providerSearchTimeout.current);
        if (value.length > 0) setIsProviderListVisible(true); else setIsProviderListVisible(false);
        if (value.length < 3) { setProviderResults([]); setProviderLoading(false); return; }
        setProviderLoading(true);
        providerSearchTimeout.current = setTimeout(async () => {
            const result = await searchProviders({ query: value, zipCode: providerZipCode });
            setProviderResults(result.providers || []);
            setProviderLoading(false);
        }, 300);
    };

    const handleSelectProvider = (provider: Provider) => {
        if (_selectedProviders.some(p => p.npi === provider.npi)) { setProviderQuery(''); setIsProviderListVisible(false); return; }
        if (provider.affiliations && provider.affiliations.length > 1) {
            setProviderToSelectAffiliation(provider);
        } else {
            const affiliation = provider.affiliations?.[0]?.name;
            updateSelectedProviders([..._selectedProviders, { ...provider, selectedAffiliation: affiliation }]);
        }
        setProviderQuery(''); setIsProviderListVisible(false);
    };

    const handleAffiliationSelected = (provider: Provider, affiliationName: string) => {
        updateSelectedProviders([..._selectedProviders, { ...provider, selectedAffiliation: affiliationName }]);
        setProviderToSelectAffiliation(null);
    }

    const handleRemoveProvider = (npi: string) => {
        updateSelectedProviders(_selectedProviders.filter(p => p.npi !== npi));
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
        if (!_selectedDrugs.some(d => d.rxcui === newDrug.rxcui)) {
            updateSelectedDrugs([..._selectedDrugs, newDrug]);
        }
        setDrugToAddDetails(null); setSelectedDosage(null);
    };

    const handleRemoveDrug = (rxcui: string) => updateSelectedDrugs(_selectedDrugs.filter(d => d.rxcui !== rxcui));

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
        updateSelectedDrugs([..._selectedDrugs, newDrug]);
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
    // --- End Handlers for Doctors/Meds Search ---

    if (isSubmitted) return <SuccessPage title="Application" />;
    
    if (step === 0) return (
        <div className="flex flex-col items-center justify-center text-center h-full max-w-lg mx-auto">
            <Card className="w-full">
                <CardHeader>
                     <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                         <FileText className="h-6 w-6" />
                    </div>
                    <CardTitle className="font-headline text-2xl sm:text-3xl pt-4">Medicare Supplement Application</CardTitle>
                </CardHeader>
                <CardContent><p className="text-base text-muted-foreground">This secure application will help us determine your eligibility. The process should take about 5-10 minutes.</p></CardContent>
                <CardFooter><Button className="w-full" size="lg" onClick={() => setStep(1)}>Start Application <ArrowRight className="ml-2 h-4 w-4" /></Button></CardFooter>
            </Card>
        </div>
    );
    
    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Medicare Supplement Application</h1>
                    <p className="text-base text-muted-foreground mt-1">Step {step} of {steps.length}: <strong>{steps[step - 1].name}</strong></p>
                </div>
                <PlanDetailsCard 
                    planName={planName || undefined} 
                    provider={provider || undefined} 
                    premium={premium || undefined}
                    carrierLogoUrl={carrierInfo?.logoUrl}
                    carrierWebsite={carrierInfo?.website}
                />
            </div>
            <Progress value={(step / steps.length) * 100} />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {step === 1 && ( /* Personal Info */
                        <Card><CardHeader><CardTitle>Personal Information</CardTitle></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                            <FormField control={form.control} name="firstName" render={({ field }) => <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="lastName" render={({ field }) => <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="dob" render={({ field }) => <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="gender" render={({ field }) => <FormItem><FormLabel>Gender</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="male" /></FormControl><FormLabel className="font-normal">Male</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="female" /></FormControl><FormLabel className="font-normal">Female</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="address" render={({ field }) => <FormItem className="md:col-span-2"><FormLabel>Street Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="city" render={({ field }) => <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="state" render={({ field }) => <FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="zip" render={({ field }) => <FormItem><FormLabel>Zip Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="phone" render={({ field }) => <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="email" render={({ field }) => <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>} />
                        </CardContent></Card>
                    )}
                    {step === 2 && ( /* Medicare Details */
                        <Card><CardHeader><CardTitle>Medicare Details</CardTitle></CardHeader><CardContent className="space-y-6 pt-6">
                            <FormField control={form.control} name="medicareClaimNumber" render={({ field }) => <FormItem><FormLabel>Medicare ID Number (MBI)</FormLabel><FormControl><Input placeholder="Found on your Medicare card" {...field} /></FormControl><FormMessage /></FormItem>} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="partAEffectiveDate" render={({ field }) => <FormItem><FormLabel>Part A Effective Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>} />
                                <FormField control={form.control} name="partBEffectiveDate" render={({ field }) => <FormItem><FormLabel>Part B Effective Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>} />
                            </div>
                        </CardContent></Card>
                    )}
                    {step === 3 && ( /* Current & Medical */
                         <Card><CardHeader><CardTitle>Current Coverage & Medical History</CardTitle></CardHeader><CardContent className="space-y-8 pt-6">
                             <FormField control={form.control} name="isReplacingCoverage" render={({ field }) => <FormItem><FormLabel>Are you replacing current coverage with this new plan?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                             <FormField control={form.control} name="hasPrescriptionPlan" render={({ field }) => <FormItem><FormLabel>Do you have a standalone Prescription Drug Plan (Part D)?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                             <FormField control={form.control} name="hasMajorIllness" render={({ field }) => <FormItem><FormLabel>Have you been diagnosed with or treated for heart disease, cancer, stroke, COPD, or kidney failure?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                             {form.watch("hasMajorIllness") === "yes" && <FormField control={form.control} name="majorIllnessDetails" render={({ field }) => <FormItem><FormLabel>Please provide details</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>} />}
                        </CardContent></Card>
                    )}
                    {step === 4 && ( /* Doctors & Medications */
                        <div className="space-y-8">
                             <Card>
                                <CardHeader>
                                    <CardTitle>Your Doctors & Facilities</CardTitle>
                                    <CardDescription>Add your preferred doctors to check if they are in-network with your new plan.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
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
                                    {_selectedProviders.length > 0 && (
                                        <div className="space-y-2 rounded-md border p-2 max-h-60 overflow-y-auto mt-4">
                                            {_selectedProviders.map(p => (
                                                <div key={p.npi} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                                    <div className="flex-1"><p className="text-sm font-medium">{p.name}</p>{p.selectedAffiliation && <p className="text-xs text-muted-foreground">{p.selectedAffiliation}</p>}</div>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveProvider(p.npi)}><Trash2 className="h-4 w-4 text-destructive" /><span className="sr-only">Remove {p.name}</span></Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle>Your Medications</CardTitle>
                                    <CardDescription>Add your current medications to ensure they are covered.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
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
                                    {_selectedDrugs.length > 0 && (
                                        <div className="space-y-2 rounded-md border p-2 max-h-60 overflow-y-auto mt-4">
                                            {_selectedDrugs.map(drug => (
                                                <div key={drug.rxcui} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                                    <div className="flex-1"><p className="text-sm font-medium">{drug.full_name}</p><p className="text-xs text-muted-foreground">Qty: {drug.quantity} &bull; {frequencyLabels[drug.frequency]} &bull; {packageLabels[drug.package]}</p></div>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveDrug(drug.rxcui)}><Trash2 className="h-4 w-4 text-destructive" /><span className="sr-only">Remove {drug.full_name}</span></Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                    {step === 5 && ( /* Plan & Agent */
                        <Card><CardHeader><CardTitle>Plan Selection & Agent Assistance</CardTitle></CardHeader><CardContent className="space-y-8 pt-6">
                            <FormField control={form.control} name="planId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Selected Medicare Supplement Plan</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select a plan" /></SelectTrigger></FormControl>
                                        <SelectContent>{allAvailablePlans.map(p => <SelectItem key={p.id} value={p.id}>{p.name} - {p.provider}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <div className="space-y-3"><FormLabel>Request Additional Benefits</FormLabel><FormDescription>Check any additional coverage you might be interested in.</FormDescription>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <FormField control={form.control} name="wantsDental" render={({ field }) => <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Dental Coverage</FormLabel></div></FormItem>} />
                                    <FormField control={form.control} name="wantsCancer" render={({ field }) => <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Cancer Coverage</FormLabel></div></FormItem>} />
                                    <FormField control={form.control} name="wantsLifeInsurance" render={({ field }) => <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Life Insurance</FormLabel></div></FormItem>} />
                                    <FormField control={form.control} name="wantsRetirementPlanning" render={({ field }) => <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Retirement Planning</FormLabel></div></FormItem>} />
                                    <FormField control={form.control} name="wantsDrugPlan" render={({ field }) => <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Prescription Drug Plan (Part D)</FormLabel></div></FormItem>} />
                                </div>
                            </div>
                            <FormField control={form.control} name="wantsAgentContact" render={({ field }) => <FormItem><FormLabel>Would you like a licensed agent to contact you to review your application?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                        </CardContent></Card>
                    )}
                    {step === 6 && ( /* Signature */
                         <Card><CardHeader><CardTitle>Signature & Consent</CardTitle></CardHeader><CardContent className="space-y-6 pt-6">
                            <FormField control={form.control} name="agreesToTerms" render={({ field }) => <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>I confirm all information is accurate and agree to the disclaimers and privacy policy.</FormLabel><FormMessage/></div></FormItem>} />
                            <FormField control={form.control} name="signature" render={({ field }) => <FormItem><FormLabel>Digital Signature</FormLabel><FormControl><Input placeholder="Type your full name" {...field} /></FormControl><FormDescription>By typing your name, you are electronically signing this application.</FormDescription><FormMessage /></FormItem>} />
                        </CardContent></Card>
                    )}

                    <div className="flex justify-between">
                        {step > 1 ? (<Button type="button" variant="outline" onClick={handlePrev}>Back</Button>) : <div />}
                        {step < steps.length ? (<Button type="button" onClick={handleNext}>Next Step <ArrowRight className="ml-2 h-4 w-4"/></Button>) : (<Button type="submit">Submit Application</Button>)}
                    </div>
                </form>
            </Form>
             {/* Affiliation Selection Dialog */}
            <Dialog open={!!providerToSelectAffiliation} onOpenChange={(open) => !open && setProviderToSelectAffiliation(null)}><DialogContent><DialogHeader><DialogTitle>Select Hospital Affiliation</DialogTitle><DialogDescription>{providerToSelectAffiliation?.name} is affiliated with multiple hospitals. Please choose the one you primarily visit.</DialogDescription></DialogHeader><div className="py-4"><RadioGroup onValueChange={(value) => { if (providerToSelectAffiliation) { handleAffiliationSelected(providerToSelectAffiliation, value); } }} className="space-y-2 max-h-60 overflow-y-auto">{providerToSelectAffiliation?.affiliations?.map((aff, index) => (<Label key={index} htmlFor={`aff-${index}`} className="flex items-center space-x-3 rounded-md border p-4 has-[:checked]:border-primary"><RadioGroupItem value={aff.name} id={`aff-${index}`} /><span>{aff.name}</span></Label>))}</RadioGroup></div><DialogFooter><Button variant="outline" onClick={() => setProviderToSelectAffiliation(null)}>Cancel</Button></DialogFooter></DialogContent></Dialog>
            {/* Dosage Selection Dialog */}
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
             {/* Drug Details Dialog */}
            <Dialog open={!!drugToAddDetails} onOpenChange={(open) => !open && setDrugToAddDetails(null)}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Tell us about this drug</DialogTitle><DialogDescription>Provide the quantity and frequency for {drugToAddDetails?.name}.</DialogDescription></DialogHeader><div className="grid gap-4 py-4"><div className="space-y-2"><Label htmlFor="dosage">Dosage</Label><Input id="dosage" value={drugToAddDetails?.full_name || ''} disabled /></div><div className="space-y-2"><Label htmlFor="package">Package</Label><Select value={pkg} onValueChange={setPackage}><SelectTrigger id="package"><SelectValue placeholder="Select package" /></SelectTrigger><SelectContent><SelectItem value="30-day">30-day supply</SelectItem><SelectItem value="60-day">60-day supply</SelectItem><SelectItem value="90-day">90-day supply</SelectItem><SelectItem value="bottle">1 bottle</SelectItem></SelectContent></Select></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="quantity">Quantity</Label><Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} min={1} /></div><div className="space-y-2"><Label htmlFor="frequency">Frequency</Label><Select value={frequency} onValueChange={setFrequency}><SelectTrigger id="frequency"><SelectValue placeholder="Select frequency" /></SelectTrigger><SelectContent><SelectItem value="monthly">Every month</SelectItem><SelectItem value="3-months">Every 3 months</SelectItem><SelectItem value="as-needed">As needed</SelectItem></SelectContent></Select></div></div></div><DialogFooter><Button variant="outline" onClick={() => setDrugToAddDetails(null)}>Cancel</Button><Button onClick={handleFinalAddDrug}>Add to My Drug List</Button></DialogFooter></DialogContent></Dialog>
            {/* Manual Drug Entry Dialog */}
            <Dialog open={isManualDrugEntryOpen} onOpenChange={setIsManualDrugEntryOpen}><DialogContent><DialogHeader><DialogTitle>Enter Medication Manually</DialogTitle><DialogDescription>If you couldn't find your medication, you can add its details here.</DialogDescription></DialogHeader><form onSubmit={handleManualDrugAdd} className="space-y-4 py-4"><div className="space-y-2"><Label htmlFor="manual-drug-name">Drug Name</Label><Input id="manual-drug-name" name="manual-drug-name" required /></div><div className="space-y-2"><Label htmlFor="manual-drug-dosage">Dosage (optional)</Label><Input id="manual-drug-dosage" name="manual-drug-dosage" placeholder="e.g., 20mg" /></div><DialogFooter><Button variant="outline" type="button" onClick={() => setIsManualDrugEntryOpen(false)}>Cancel</Button><Button type="submit">Add Medication</Button></DialogFooter></form></DialogContent></Dialog>
        </div>
    );
}

function DentalApplication() {
    type FormSchema = z.infer<typeof dentalSchema>;
    const [user] = useFirebaseAuth();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [step, setStep] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    const planId = searchParams.get('planId');
    const planName = searchParams.get('planName');
    const provider = searchParams.get('provider');
    const premium = searchParams.get('premium');
    const carrierInfo = carriers.find(c => provider && c.name.includes(provider));
    
    const form = useForm<FormSchema>({
        resolver: zodResolver(dentalSchema),
        defaultValues: {
            planId: planId || '',
            wantsAgentContact: "yes",
            firstName: "",
            lastName: "",
            dob: "",
            gender: undefined,
            address: "",
            city: "",
            state: "",
            zip: "",
            phone: "",
            email: "",
            signature: "",
            agreesToTerms: false,
        }
    });

    const steps = [
        { id: 1, name: 'Personal Information', fields: ['firstName', 'lastName', 'dob', 'gender', 'address', 'city', 'state', 'zip', 'phone', 'email'] },
        { id: 2, name: 'Agent & Signature', fields: ['wantsAgentContact', 'signature', 'agreesToTerms'] },
    ];

    const handleNext = async () => {
        const fieldsToValidate = steps[step - 1].fields as FieldPath<FormSchema>[];
        const output = await form.trigger(fieldsToValidate, { shouldFocus: true });
        if (output) setStep(s => s + 1);
    };

    const handlePrev = () => setStep(s => s - 1);

    async function onSubmit(values: FormSchema) {
        if (!user || !db) return;
        try {
            const policyData: Partial<Policy> = {
                planName: planName || "Dental Insurance",
                premium: premium ? parseFloat(premium) : 0,
                policyCategoryName: "Dental Insurance",
                policyCategoryId: "dvh",
                carrierName: provider || "Unknown",
                carrierId: carrierInfo?.id || "unknown",
                carrierLogoUrl: carrierInfo?.logoUrl,
                carrierWebsite: carrierInfo?.website,
                enrollmentDate: new Date().toISOString().split('T')[0],
            };
            await saveApplicationAsPolicy(user.uid, policyData);
            toast({ title: "Application Submitted!", description: "We've received your dental application." });
            setIsSubmitted(true);
        } catch (error) {
            console.error("Error submitting application:", error);
            toast({ variant: "destructive", title: "Submission Failed", description: "There was an error submitting your application." });
        }
    }
    
    if (isSubmitted) return <SuccessPage title="Dental Application" />;
    
    if (step === 0) return (
        <div className="flex flex-col items-center justify-center text-center h-full max-w-lg mx-auto">
            <Card className="w-full">
                <CardHeader>
                     <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                         <Smile className="h-6 w-6" />
                    </div>
                    <CardTitle className="font-headline text-2xl sm:text-3xl pt-4">Dental Insurance Application</CardTitle>
                </CardHeader>
                <CardContent><p className="text-base text-muted-foreground">This secure application should only take a few minutes to complete.</p></CardContent>
                <CardFooter><Button className="w-full" size="lg" onClick={() => setStep(1)}>Start Application <ArrowRight className="ml-2 h-4 w-4" /></Button></CardFooter>
            </Card>
        </div>
    );
    
    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Dental Insurance Application</h1>
                    <p className="text-base text-muted-foreground mt-1">Step {step} of {steps.length}: <strong>{steps[step - 1].name}</strong></p>
                </div>
                 <PlanDetailsCard 
                    planName={planName || undefined} 
                    provider={provider || undefined} 
                    premium={premium || undefined}
                    carrierLogoUrl={carrierInfo?.logoUrl}
                    carrierWebsite={carrierInfo?.website}
                />
            </div>
            <Progress value={(step / steps.length) * 100} />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {step === 1 && ( /* Personal Info */
                        <Card><CardHeader><CardTitle>Personal Information</CardTitle></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                            <FormField control={form.control} name="firstName" render={({ field }) => <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="lastName" render={({ field }) => <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="dob" render={({ field }) => <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="gender" render={({ field }) => <FormItem><FormLabel>Gender</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="male" /></FormControl><FormLabel className="font-normal">Male</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="female" /></FormControl><FormLabel className="font-normal">Female</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="address" render={({ field }) => <FormItem className="md:col-span-2"><FormLabel>Street Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="city" render={({ field }) => <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="state" render={({ field }) => <FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="zip" render={({ field }) => <FormItem><FormLabel>Zip Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="phone" render={({ field }) => <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="email" render={({ field }) => <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>} />
                        </CardContent></Card>
                    )}
                     {step === 2 && ( /* Signature */
                         <Card><CardHeader><CardTitle>Signature & Consent</CardTitle></CardHeader><CardContent className="space-y-6 pt-6">
                            <FormField control={form.control} name="wantsAgentContact" render={({ field }) => <FormItem><FormLabel>Would you like a licensed agent to contact you to review your application?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="agreesToTerms" render={({ field }) => <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>I confirm all information is accurate and agree to the disclaimers and privacy policy.</FormLabel><FormMessage/></div></FormItem>} />
                            <FormField control={form.control} name="signature" render={({ field }) => <FormItem><FormLabel>Digital Signature</FormLabel><FormControl><Input placeholder="Type your full name" {...field} /></FormControl><FormDescription>By typing your name, you are electronically signing this application.</FormDescription><FormMessage /></FormItem>} />
                        </CardContent></Card>
                    )}
                    <div className="flex justify-between">
                        {step > 1 ? (<Button type="button" variant="outline" onClick={handlePrev}>Back</Button>) : <div />}
                        {step < steps.length ? (<Button type="button" onClick={handleNext}>Next Step <ArrowRight className="ml-2 h-4 w-4"/></Button>) : (<Button type="submit">Submit Application</Button>)}
                    </div>
                </form>
            </Form>
        </div>
    );
}

function HospitalIndemnityApplication() {
    type FormSchema = z.infer<typeof hospitalIndemnitySchema>;
    const [user] = useFirebaseAuth();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [step, setStep] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const planId = searchParams.get('planId');
    const planName = searchParams.get('planName');
    const provider = searchParams.get('provider');
    const premium = searchParams.get('premium');
    const carrierInfo = carriers.find(c => provider && c.name.includes(provider));
    
    const form = useForm<FormSchema>({
        resolver: zodResolver(hospitalIndemnitySchema),
        defaultValues: {
            planId: planId || '',
            wantsAgentContact: "yes",
            firstName: "",
            lastName: "",
            dob: "",
            gender: undefined,
            address: "",
            city: "",
            state: "",
            zip: "",
            phone: "",
            email: "",
            hasMajorIllness: undefined,
            majorIllnessDetails: "",
            signature: "",
            agreesToTerms: false,
        }
    });

    const steps = [
        { id: 1, name: 'Personal Information', fields: ['firstName', 'lastName', 'dob', 'gender', 'address', 'city', 'state', 'zip', 'phone', 'email'] },
        { id: 2, name: 'Medical History', fields: ['hasMajorIllness', 'majorIllnessDetails'] },
        { id: 3, name: 'Agent & Signature', fields: ['wantsAgentContact', 'signature', 'agreesToTerms'] },
    ];

    const handleNext = async () => {
        const fieldsToValidate = steps[step - 1].fields as FieldPath<FormSchema>[];
        const output = await form.trigger(fieldsToValidate, { shouldFocus: true });
        if (output) setStep(s => s + 1);
    };

    const handlePrev = () => setStep(s => s - 1);

    async function onSubmit(values: FormSchema) {
         if (!user || !db) return;
        try {
            const policyData: Partial<Policy> = {
                planName: planName || "Hospital Indemnity",
                premium: premium ? parseFloat(premium) : 0,
                policyCategoryName: "Hospital Indemnity",
                policyCategoryId: "hospital",
                carrierName: provider || "Unknown",
                carrierId: carrierInfo?.id || "unknown",
                carrierLogoUrl: carrierInfo?.logoUrl,
                carrierWebsite: carrierInfo?.website,
                enrollmentDate: new Date().toISOString().split('T')[0],
            };
            await saveApplicationAsPolicy(user.uid, policyData);
            toast({ title: "Application Submitted!", description: "We've received your hospital indemnity application." });
            setIsSubmitted(true);
        } catch (error) {
            console.error("Error submitting application:", error);
            toast({ variant: "destructive", title: "Submission Failed", description: "There was an error submitting your application." });
        }
    }
    
    if (isSubmitted) return <SuccessPage title="Hospital Indemnity Application" />;
    
    if (step === 0) return (
        <div className="flex flex-col items-center justify-center text-center h-full max-w-lg mx-auto">
            <Card className="w-full">
                <CardHeader>
                     <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                         <Hospital className="h-6 w-6" />
                    </div>
                    <CardTitle className="font-headline text-2xl sm:text-3xl pt-4">Hospital Indemnity Application</CardTitle>
                </CardHeader>
                <CardContent><p className="text-base text-muted-foreground">This secure application should only take a few minutes to complete.</p></CardContent>
                <CardFooter><Button className="w-full" size="lg" onClick={() => setStep(1)}>Start Application <ArrowRight className="ml-2 h-4 w-4" /></Button></CardFooter>
            </Card>
        </div>
    );
    
    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Hospital Indemnity Application</h1>
                    <p className="text-base text-muted-foreground mt-1">Step {step} of {steps.length}: <strong>{steps[step - 1].name}</strong></p>
                </div>
                 <PlanDetailsCard 
                    planName={planName || undefined} 
                    provider={provider || undefined} 
                    premium={premium || undefined}
                    carrierLogoUrl={carrierInfo?.logoUrl}
                    carrierWebsite={carrierInfo?.website}
                />
            </div>
            <Progress value={(step / steps.length) * 100} />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {step === 1 && ( /* Personal Info */
                        <Card><CardHeader><CardTitle>Personal Information</CardTitle></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                            <FormField control={form.control} name="firstName" render={({ field }) => <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="lastName" render={({ field }) => <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="dob" render={({ field }) => <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="gender" render={({ field }) => <FormItem><FormLabel>Gender</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="male" /></FormControl><FormLabel className="font-normal">Male</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="female" /></FormControl><FormLabel className="font-normal">Female</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="address" render={({ field }) => <FormItem className="md:col-span-2"><FormLabel>Street Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="city" render={({ field }) => <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="state" render={({ field }) => <FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="zip" render={({ field }) => <FormItem><FormLabel>Zip Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="phone" render={({ field }) => <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="email" render={({ field }) => <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>} />
                        </CardContent></Card>
                    )}
                    {step === 2 && ( /* Medical History */
                        <Card><CardHeader><CardTitle>Medical History</CardTitle></CardHeader><CardContent className="space-y-8 pt-6">
                            <FormField control={form.control} name="hasMajorIllness" render={({ field }) => <FormItem><FormLabel>Have you been diagnosed with or treated for heart disease, cancer, stroke, COPD, or kidney failure?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                            {form.watch("hasMajorIllness") === "yes" && <FormField control={form.control} name="majorIllnessDetails" render={({ field }) => <FormItem><FormLabel>Please provide details</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>} />}
                        </CardContent></Card>
                    )}
                     {step === 3 && ( /* Signature */
                         <Card><CardHeader><CardTitle>Signature & Consent</CardTitle></CardHeader><CardContent className="space-y-6 pt-6">
                            <FormField control={form.control} name="wantsAgentContact" render={({ field }) => <FormItem><FormLabel>Would you like a licensed agent to contact you to review your application?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="agreesToTerms" render={({ field }) => <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>I confirm all information is accurate and agree to the disclaimers and privacy policy.</FormLabel><FormMessage/></div></FormItem>} />
                            <FormField control={form.control} name="signature" render={({ field }) => <FormItem><FormLabel>Digital Signature</FormLabel><FormControl><Input placeholder="Type your full name" {...field} /></FormControl><FormDescription>By typing your name, you are electronically signing this application.</FormDescription><FormMessage /></FormItem>} />
                        </CardContent></Card>
                    )}
                    <div className="flex justify-between">
                        {step > 1 ? (<Button type="button" variant="outline" onClick={handlePrev}>Back</Button>) : <div />}
                        {step < steps.length ? (<Button type="button" onClick={handleNext}>Next Step <ArrowRight className="ml-2 h-4 w-4"/></Button>) : (<Button type="submit">Submit Application</Button>)}
                    </div>
                </form>
            </Form>
        </div>
    );
}

function LifeInsuranceApplication() {
    type FormSchema = z.infer<typeof lifeInsuranceSchema>;
    const [user] = useFirebaseAuth();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [step, setStep] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const planId = searchParams.get('planId');
    const planName = searchParams.get('planName');
    const provider = searchParams.get('provider');
    const premium = searchParams.get('premium');
    const carrierInfo = carriers.find(c => provider && c.name.includes(provider));
    
    const form = useForm<FormSchema>({
        resolver: zodResolver(lifeInsuranceSchema),
        defaultValues: {
            planId: planId || '',
            wantsAgentContact: "yes",
            firstName: "",
            lastName: "",
            dob: "",
            gender: undefined,
            address: "",
            city: "",
            state: "",
            zip: "",
            phone: "",
            email: "",
            coverageAmount: 25000,
            tobaccoUse: undefined,
            beneficiaryName: "",
            beneficiaryRelationship: "",
            signature: "",
            agreesToTerms: false,
        }
    });

    const steps = [
        { id: 1, name: 'Personal Information', fields: ['firstName', 'lastName', 'dob', 'gender', 'address', 'city', 'state', 'zip', 'phone', 'email'] },
        { id: 2, name: 'Coverage & Beneficiary', fields: ['coverageAmount', 'tobaccoUse', 'beneficiaryName', 'beneficiaryRelationship'] },
        { id: 3, name: 'Agent & Signature', fields: ['wantsAgentContact', 'signature', 'agreesToTerms'] },
    ];

    const handleNext = async () => {
        const fieldsToValidate = steps[step - 1].fields as FieldPath<FormSchema>[];
        const output = await form.trigger(fieldsToValidate, { shouldFocus: true });
        if (output) setStep(s => s + 1);
    };

    const handlePrev = () => setStep(s => s - 1);

    async function onSubmit(values: FormSchema) {
         if (!user || !db) return;
        try {
            const policyData: Partial<Policy> = {
                planName: planName || "Life Insurance",
                premium: premium ? parseFloat(premium) : 0,
                policyCategoryName: "Life Insurance",
                policyCategoryId: "life",
                carrierName: provider || "Unknown",
                carrierId: carrierInfo?.id || "unknown",
                carrierLogoUrl: carrierInfo?.logoUrl,
                carrierWebsite: carrierInfo?.website,
                enrollmentDate: new Date().toISOString().split('T')[0],
                benefitAmount: values.coverageAmount,
            };
            await saveApplicationAsPolicy(user.uid, policyData);
            toast({ title: "Application Submitted!", description: "We've received your life insurance application." });
            setIsSubmitted(true);
        } catch (error) {
            console.error("Error submitting application:", error);
            toast({ variant: "destructive", title: "Submission Failed", description: "There was an error submitting your application." });
        }
    }
    
    if (isSubmitted) return <SuccessPage title="Life Insurance Application" />;
    
    if (step === 0) return (
        <div className="flex flex-col items-center justify-center text-center h-full max-w-lg mx-auto">
            <Card className="w-full">
                <CardHeader>
                     <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                         <FileHeart className="h-6 w-6" />
                    </div>
                    <CardTitle className="font-headline text-2xl sm:text-3xl pt-4">Life Insurance Application</CardTitle>
                </CardHeader>
                <CardContent><p className="text-base text-muted-foreground">Protect your loved ones with this secure application.</p></CardContent>
                <CardFooter><Button className="w-full" size="lg" onClick={() => setStep(1)}>Start Application <ArrowRight className="ml-2 h-4 w-4" /></Button></CardFooter>
            </Card>
        </div>
    );
    
    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Life Insurance Application</h1>
                    <p className="text-base text-muted-foreground mt-1">Step {step} of {steps.length}: <strong>{steps[step - 1].name}</strong></p>
                </div>
                 <PlanDetailsCard 
                    planName={planName || undefined} 
                    provider={provider || undefined} 
                    premium={premium || undefined}
                    carrierLogoUrl={carrierInfo?.logoUrl}
                    carrierWebsite={carrierInfo?.website}
                />
            </div>
            <Progress value={(step / steps.length) * 100} />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {step === 1 && ( /* Personal Info */
                        <Card><CardHeader><CardTitle>Personal Information</CardTitle></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                            <FormField control={form.control} name="firstName" render={({ field }) => <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="lastName" render={({ field }) => <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="dob" render={({ field }) => <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="gender" render={({ field }) => <FormItem><FormLabel>Gender</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="male" /></FormControl><FormLabel className="font-normal">Male</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="female" /></FormControl><FormLabel className="font-normal">Female</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="address" render={({ field }) => <FormItem className="md:col-span-2"><FormLabel>Street Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="city" render={({ field }) => <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="state" render={({ field }) => <FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="zip" render={({ field }) => <FormItem><FormLabel>Zip Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="phone" render={({ field }) => <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="email" render={({ field }) => <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>} />
                        </CardContent></Card>
                    )}
                    {step === 2 && ( /* Coverage Details */
                        <Card><CardHeader><CardTitle>Coverage & Beneficiary</CardTitle></CardHeader><CardContent className="space-y-8 pt-6">
                             <FormField control={form.control} name="coverageAmount" render={({ field }) => <FormItem><FormLabel>Desired Coverage Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
                             <FormField control={form.control} name="tobaccoUse" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tobacco/Nicotine Use</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">None in the last 5 years</SelectItem>
                                            <SelectItem value="last_12_months">Yes, in the last 12 months</SelectItem>
                                            <SelectItem value="over_12_months_ago">Not in the last 12 months, but in the last 5 years</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="beneficiaryName" render={({ field }) => <FormItem><FormLabel>Primary Beneficiary Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                             <FormField control={form.control} name="beneficiaryRelationship" render={({ field }) => <FormItem><FormLabel>Beneficiary Relationship</FormLabel><FormControl><Input placeholder="e.g., Spouse, Child, Sibling" {...field} /></FormControl><FormMessage /></FormItem>} />
                        </CardContent></Card>
                    )}
                     {step === 3 && ( /* Signature */
                         <Card><CardHeader><CardTitle>Signature & Consent</CardTitle></CardHeader><CardContent className="space-y-6 pt-6">
                            <FormField control={form.control} name="wantsAgentContact" render={({ field }) => <FormItem><FormLabel>Would you like a licensed agent to contact you to review your application?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="agreesToTerms" render={({ field }) => <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>I confirm all information is accurate and agree to the disclaimers and privacy policy.</FormLabel><FormMessage/></div></FormItem>} />
                            <FormField control={form.control} name="signature" render={({ field }) => <FormItem><FormLabel>Digital Signature</FormLabel><FormControl><Input placeholder="Type your full name" {...field} /></FormControl><FormDescription>By typing your name, you are electronically signing this application.</FormDescription><FormMessage /></FormItem>} />
                        </CardContent></Card>
                    )}
                    <div className="flex justify-between">
                        {step > 1 ? (<Button type="button" variant="outline" onClick={handlePrev}>Back</Button>) : <div />}
                        {step < steps.length ? (<Button type="button" onClick={handleNext}>Next Step <ArrowRight className="ml-2 h-4 w-4"/></Button>) : (<Button type="submit">Submit Application</Button>)}
                    </div>
                </form>
            </Form>
        </div>
    );
}

function HealthInsuranceApplication() {
    type FormSchema = z.infer<typeof healthInsuranceSchema>;
    const [user] = useFirebaseAuth();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [step, setStep] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // --- State for Doctors/Meds Search ---
    const [providerQuery, setProviderQuery] = useState('');
    const [providerZipCode, setProviderZipCode] = useState('');
    const [providerResults, setProviderResults] = useState<Provider[]>([]);
    const [providerLoading, setProviderLoading] = useState(false);
    const [isProviderListVisible, setIsProviderListVisible] = useState(false);
    const [_selectedProviders, _setSelectedProviders] = useState<SelectedProvider[]>([]);
    const providerSearchTimeout = useRef<NodeJS.Timeout | null>(null);
    const [providerToSelectAffiliation, setProviderToSelectAffiliation] = useState<Provider | null>(null);
    
    const [medicationQuery, setMedicationQuery] = useState('');
    const [medicationResults, setMedicationResults] = useState<Drug[]>([]);
    const [medicationSuggestions, setMedicationSuggestions] = useState<string[]>([]);
    const [medicationLoading, setMedicationLoading] = useState(false);
    const [isMedicationListVisible, setIsMedicationListVisible] = useState(false);
    const [_selectedDrugs, _setSelectedDrugs] = useState<SelectedDrug[]>([]);
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
    // --- End State for Doctors/Meds Search ---
    
    const planId = searchParams.get('planId');
    const planName = searchParams.get('planName');
    const provider = searchParams.get('provider');
    const premium = searchParams.get('premium');
    const carrierInfo = carriers.find(c => provider && c.name.includes(provider));
    
    const form = useForm<FormSchema>({
        resolver: zodResolver(healthInsuranceSchema),
        defaultValues: {
            planId: planId || '',
            wantsAgentContact: "yes",
            firstName: "", lastName: "", dob: "", gender: undefined, address: "", city: "", state: "", zip: "", phone: "", email: "",
            isReplacingCoverage: undefined,
            signature: "", agreesToTerms: false,
            selectedProviders: [], selectedDrugs: [],
        }
    });

    useEffect(() => {
      setProviderZipCode(form.getValues('zip'));
    }, [form.watch('zip')]);
    
    const updateSelectedProviders = (newProviders: SelectedProvider[]) => {
        _setSelectedProviders(newProviders);
        form.setValue('selectedProviders', newProviders);
    };

    const updateSelectedDrugs = (newDrugs: SelectedDrug[]) => {
        _setSelectedDrugs(newDrugs);
        form.setValue('selectedDrugs', newDrugs);
    };

    const steps = [
        { id: 1, name: 'Personal Information', fields: ['firstName', 'lastName', 'dob', 'gender', 'address', 'city', 'state', 'zip', 'phone', 'email'] },
        { id: 2, name: 'Doctors & Medications', fields: ['selectedProviders', 'selectedDrugs'] },
        { id: 3, name: 'Plan & Signature', fields: ['planId', 'isReplacingCoverage', 'wantsAgentContact', 'signature', 'agreesToTerms'] },
    ];

    const handleNext = async () => {
        const fieldsToValidate = steps[step - 1].fields as FieldPath<FormSchema>[];
        const output = await form.trigger(fieldsToValidate, { shouldFocus: true });
        if (output) setStep(s => s + 1);
    };

    const handlePrev = () => setStep(s => s - 1);

    async function onSubmit(values: FormSchema) {
         if (!user || !db) return;
        try {
            const policyData: Partial<Policy> = {
                planName: planName || "Health Insurance",
                premium: premium ? parseFloat(premium) : 0,
                policyCategoryName: "Health Insurance",
                policyCategoryId: "health",
                carrierName: provider || "Unknown",
                carrierId: carrierInfo?.id || "unknown",
                carrierLogoUrl: carrierInfo?.logoUrl,
                carrierWebsite: carrierInfo?.website,
                enrollmentDate: new Date().toISOString().split('T')[0],
            };
            await saveApplicationAsPolicy(user.uid, policyData);
            toast({ title: "Application Submitted!", description: "We've received your health insurance application." });
            setIsSubmitted(true);
        } catch (error) {
            console.error("Error submitting application:", error);
            toast({ variant: "destructive", title: "Submission Failed", description: "There was an error submitting your application." });
        }
    }
    
     // --- Handlers for Doctors/Meds Search ---
    const handleProviderQueryChange = (value: string) => {
        setProviderQuery(value);
        if (providerSearchTimeout.current) clearTimeout(providerSearchTimeout.current);
        if (value.length > 0) setIsProviderListVisible(true); else setIsProviderListVisible(false);
        if (value.length < 3) { setProviderResults([]); setProviderLoading(false); return; }
        setProviderLoading(true);
        providerSearchTimeout.current = setTimeout(async () => {
            const result = await searchProviders({ query: value, zipCode: providerZipCode });
            setProviderResults(result.providers || []);
            setProviderLoading(false);
        }, 300);
    };

    const handleSelectProvider = (provider: Provider) => {
        if (_selectedProviders.some(p => p.npi === provider.npi)) { setProviderQuery(''); setIsProviderListVisible(false); return; }
        if (provider.affiliations && provider.affiliations.length > 1) {
            setProviderToSelectAffiliation(provider);
        } else {
            const affiliation = provider.affiliations?.[0]?.name;
            updateSelectedProviders([..._selectedProviders, { ...provider, selectedAffiliation: affiliation }]);
        }
        setProviderQuery(''); setIsProviderListVisible(false);
    };

    const handleAffiliationSelected = (provider: Provider, affiliationName: string) => {
        updateSelectedProviders([..._selectedProviders, { ...provider, selectedAffiliation: affiliationName }]);
        setProviderToSelectAffiliation(null);
    }

    const handleRemoveProvider = (npi: string) => {
        updateSelectedProviders(_selectedProviders.filter(p => p.npi !== npi));
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
        if (!_selectedDrugs.some(d => d.rxcui === newDrug.rxcui)) {
            updateSelectedDrugs([..._selectedDrugs, newDrug]);
        }
        setDrugToAddDetails(null); setSelectedDosage(null);
    };

    const handleRemoveDrug = (rxcui: string) => updateSelectedDrugs(_selectedDrugs.filter(d => d.rxcui !== rxcui));

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
        updateSelectedDrugs([..._selectedDrugs, newDrug]);
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
            setSelectedDosage(null);
        } else {
            setUniqueForms([]);
        }
    }, [dosages]);
    // --- End Handlers for Doctors/Meds Search ---
    
    if (isSubmitted) return <SuccessPage title="Health Insurance Application" />;
    
    if (step === 0) return (
        <div className="flex flex-col items-center justify-center text-center h-full max-w-lg mx-auto">
            <Card className="w-full">
                <CardHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Heart className="h-6 w-6" />
                    </div>
                    <CardTitle className="font-headline text-2xl sm:text-3xl pt-4">Health Insurance Application</CardTitle>
                </CardHeader>
                <CardContent><p className="text-base text-muted-foreground">For individuals and families under 65.</p></CardContent>
                <CardFooter><Button className="w-full" size="lg" onClick={() => setStep(1)}>Start Application <ArrowRight className="ml-2 h-4 w-4" /></Button></CardFooter>
            </Card>
        </div>
    );
    
    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Health Insurance Application</h1>
                    <p className="text-base text-muted-foreground mt-1">Step {step} of {steps.length}: <strong>{steps[step - 1].name}</strong></p>
                </div>
                <PlanDetailsCard 
                    planName={planName || undefined} 
                    provider={provider || undefined} 
                    premium={premium || undefined}
                    carrierLogoUrl={carrierInfo?.logoUrl}
                    carrierWebsite={carrierInfo?.website}
                />
            </div>
            <Progress value={(step / steps.length) * 100} />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {step === 1 && ( /* Personal Info */
                        <Card><CardHeader><CardTitle>Personal Information</CardTitle></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                           <FormField control={form.control} name="firstName" render={({ field }) => <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="lastName" render={({ field }) => <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="dob" render={({ field }) => <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="gender" render={({ field }) => <FormItem><FormLabel>Gender</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="male" /></FormControl><FormLabel className="font-normal">Male</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="female" /></FormControl><FormLabel className="font-normal">Female</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="address" render={({ field }) => <FormItem className="md:col-span-2"><FormLabel>Street Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="city" render={({ field }) => <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="state" render={({ field }) => <FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="zip" render={({ field }) => <FormItem><FormLabel>Zip Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="phone" render={({ field }) => <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="email" render={({ field }) => <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>} />
                        </CardContent></Card>
                    )}
                    {step === 2 && ( /* Doctors & Medications */
                       <div className="space-y-8">
                             <Card>
                                <CardHeader><CardTitle>Your Doctors & Facilities</CardTitle><CardDescription>Add your preferred doctors to check if they are in-network with your new plan.</CardDescription></CardHeader>
                                <CardContent className="space-y-4">
                                     <div className="relative">
                                        <Label htmlFor="provider-search">Provider Name</Label>
                                        <Command shouldFilter={false} className="overflow-visible rounded-lg border">
                                            <div className="relative">
                                                <CommandInput id="provider-search" value={providerQuery} onValueChange={handleProviderQueryChange} onFocus={() => { if(providerQuery.length > 0) setIsProviderListVisible(true) }} onBlur={() => setTimeout(() => setIsProviderListVisible(false), 200)} placeholder="Search for a doctor or facility..."/>
                                                {providerLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin" />}
                                                {isProviderListVisible && (
                                                    <CommandList className="absolute top-full z-10 mt-1 w-full rounded-b-lg border bg-background shadow-lg">
                                                        {providerQuery.length > 0 && providerQuery.length < 3 && !providerLoading && (<CommandEmpty>Please enter at least 3 characters.</CommandEmpty>)}
                                                        {providerResults.length === 0 && providerQuery.length >= 3 && !providerLoading && (<CommandEmpty>No providers found.</CommandEmpty>)}
                                                        {providerResults.length > 0 && (<CommandGroup>{providerResults.map(p => (<CommandItem key={p.npi} value={p.name} onSelect={() => handleSelectProvider(p)} className="cursor-pointer py-2 px-4"><div className="flex flex-col"><span className="font-medium">{p.name}</span><span className="text-sm text-muted-foreground">{p.specialties?.[0]} - {p.type}</span></div></CommandItem>))}</CommandGroup>)}
                                                    </CommandList>
                                                )}
                                            </div>
                                        </Command>
                                    </div>
                                    {_selectedProviders.length > 0 && (
                                        <div className="space-y-2 rounded-md border p-2 max-h-60 overflow-y-auto mt-4">
                                            {_selectedProviders.map(p => (
                                                <div key={p.npi} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                                    <div className="flex-1"><p className="text-sm font-medium">{p.name}</p>{p.selectedAffiliation && <p className="text-xs text-muted-foreground">{p.selectedAffiliation}</p>}</div>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveProvider(p.npi)}><Trash2 className="h-4 w-4 text-destructive" /><span className="sr-only">Remove {p.name}</span></Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader><CardTitle>Your Medications</CardTitle><CardDescription>Add your current medications to ensure they are covered.</CardDescription></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="relative">
                                        <Label htmlFor="medication-search">Medication Name</Label>
                                        <Command shouldFilter={false} className="overflow-visible rounded-lg border">
                                            <div className="relative">
                                                <CommandInput id="medication-search" value={medicationQuery} onValueChange={handleMedicationQueryChange} onFocus={() => { if(medicationQuery.length > 0) setIsMedicationListVisible(true) }} onBlur={() => setTimeout(() => setIsMedicationListVisible(false), 200)} placeholder="Search for a medication..."/>
                                                {medicationLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin" />}
                                                {isMedicationListVisible && (
                                                    <CommandList className="absolute top-full z-10 mt-1 w-full rounded-b-lg border bg-background shadow-lg">
                                                         {medicationQuery.length > 0 && medicationQuery.length < 3 && !medicationLoading && (<CommandEmpty>Please enter at least 3 characters.</CommandEmpty>)}
                                                        {!medicationLoading && medicationResults.length === 0 && medicationSuggestions.length > 0 && medicationQuery.length >= 3 && (<CommandGroup heading="Did you mean?">{medicationSuggestions.map(s => (<CommandItem key={s} value={s} onSelect={() => handleMedicationQueryChange(s)} className="cursor-pointer">{s}</CommandItem>))}</CommandGroup>)}
                                                        {medicationResults.length > 0 && (<CommandGroup>{medicationResults.map(d => (<CommandItem key={d.rxcui} value={d.name} onSelect={() => handleSelectDrug(d)} className="cursor-pointer"><div className="flex items-center gap-3"><Pill className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{d.name}</span></div></CommandItem>))}</CommandGroup>)}
                                                    </CommandList>
                                                )}
                                            </div>
                                        </Command>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => setIsManualDrugEntryOpen(true)}>Enter Manually</Button>
                                    {_selectedDrugs.length > 0 && (
                                        <div className="space-y-2 rounded-md border p-2 max-h-60 overflow-y-auto mt-4">
                                            {_selectedDrugs.map(drug => (
                                                <div key={drug.rxcui} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                                    <div className="flex-1"><p className="text-sm font-medium">{drug.full_name}</p><p className="text-xs text-muted-foreground">Qty: {drug.quantity} &bull; {frequencyLabels[drug.frequency]} &bull; {packageLabels[drug.package]}</p></div>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveDrug(drug.rxcui)}><Trash2 className="h-4 w-4 text-destructive" /><span className="sr-only">Remove {drug.full_name}</span></Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                    {step === 3 && ( /* Signature */
                         <Card><CardHeader><CardTitle>Signature & Consent</CardTitle></CardHeader><CardContent className="space-y-6 pt-6">
                             <FormField control={form.control} name="isReplacingCoverage" render={({ field }) => <FormItem><FormLabel>Are you replacing current coverage with this new plan?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="wantsAgentContact" render={({ field }) => <FormItem><FormLabel>Would you like a licensed agent to contact you?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="agreesToTerms" render={({ field }) => <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>I confirm all information is accurate and agree to the disclaimers and privacy policy.</FormLabel><FormMessage/></div></FormItem>} />
                            <FormField control={form.control} name="signature" render={({ field }) => <FormItem><FormLabel>Digital Signature</FormLabel><FormControl><Input placeholder="Type your full name" {...field} /></FormControl><FormDescription>By typing your name, you are electronically signing this application.</FormDescription><FormMessage /></FormItem>} />
                        </CardContent></Card>
                    )}
                    <div className="flex justify-between">
                        {step > 1 ? (<Button type="button" variant="outline" onClick={handlePrev}>Back</Button>) : <div />}
                        {step < steps.length ? (<Button type="button" onClick={handleNext}>Next Step <ArrowRight className="ml-2 h-4 w-4"/></Button>) : (<Button type="submit">Submit Application</Button>)}
                    </div>
                </form>
            </Form>
             {/* Affiliation Selection Dialog */}
            <Dialog open={!!providerToSelectAffiliation} onOpenChange={(open) => !open && setProviderToSelectAffiliation(null)}><DialogContent><DialogHeader><DialogTitle>Select Hospital Affiliation</DialogTitle><DialogDescription>{providerToSelectAffiliation?.name} is affiliated with multiple hospitals. Please choose one.</DialogDescription></DialogHeader><div className="py-4"><RadioGroup onValueChange={(value) => { if (providerToSelectAffiliation) { handleAffiliationSelected(providerToSelectAffiliation, value); } }} className="space-y-2 max-h-60 overflow-y-auto">{providerToSelectAffiliation?.affiliations?.map((aff, index) => (<Label key={index} htmlFor={`aff-${index}`} className="flex items-center space-x-3 rounded-md border p-4 has-[:checked]:border-primary"><RadioGroupItem value={aff.name} id={`aff-${index}`} /><span>{aff.name}</span></Label>))}</RadioGroup></div><DialogFooter><Button variant="outline" onClick={() => setProviderToSelectAffiliation(null)}>Cancel</Button></DialogFooter></DialogContent></Dialog>
            {/* Dosage Selection Dialog */}
            <Dialog open={!!drugToConfirm} onOpenChange={(open) => { if (!open) { setDrugToConfirm(null); setIsGenericSelected(null); } }}><DialogContent><DialogHeader><DialogTitle>Configure {drugToConfirm?.name}</DialogTitle><DialogDescription>Select form and strength.</DialogDescription></DialogHeader>{drugToConfirm && !drugToConfirm.is_generic && drugToConfirm.generic && isGenericSelected === null && (<div className="p-4 border rounded-md bg-amber-50"><p className="text-sm font-semibold">Generic Available</p><p className="text-sm text-muted-foreground mt-1">Take the brand or generic version?</p><p className="text-xs text-muted-foreground mt-1">Generic: {drugToConfirm.generic.name}</p><div className="mt-3 flex gap-2"><Button size="sm" onClick={() => handleGenericChoice(false)} variant={isGenericSelected === false ? 'default' : 'outline'}>{drugToConfirm.name} (Brand)</Button><Button size="sm" onClick={() => handleGenericChoice(true)} variant={isGenericSelected === true ? 'default' : 'outline'}>Generic Version</Button></div></div>)}<div className="py-4 space-y-4">{dosageLoading ? (<div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>) : (<>{(isGenericSelected === null && drugToConfirm?.generic && !drugToConfirm.is_generic) ? (<p className="text-center text-sm text-muted-foreground p-4">Please select an option to see strengths.</p>) : (<>
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
                {dosages.length === 0 && !dosageLoading && (<p className="text-center text-sm text-muted-foreground p-4">No strengths found.</p>)}
            </>)}</>)}</div><DialogFooter><Button variant="outline" onClick={() => setDrugToConfirm(null)}>Cancel</Button><Button onClick={handleProceedToDetails} disabled={!selectedDosage || dosageLoading}>Next</Button></DialogFooter></DialogContent></Dialog>
             {/* Drug Details Dialog */}
            <Dialog open={!!drugToAddDetails} onOpenChange={(open) => !open && setDrugToAddDetails(null)}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Tell us about this drug</DialogTitle><DialogDescription>Provide quantity and frequency for {drugToAddDetails?.name}.</DialogDescription></DialogHeader><div className="grid gap-4 py-4"><div className="space-y-2"><Label htmlFor="dosage">Dosage</Label><Input id="dosage" value={drugToAddDetails?.full_name || ''} disabled /></div><div className="space-y-2"><Label htmlFor="package">Package</Label><Select value={pkg} onValueChange={setPackage}><SelectTrigger id="package"><SelectValue placeholder="Select package" /></SelectTrigger><SelectContent><SelectItem value="30-day">30-day supply</SelectItem><SelectItem value="60-day">60-day supply</SelectItem><SelectItem value="90-day">90-day supply</SelectItem><SelectItem value="bottle">1 bottle</SelectItem></SelectContent></Select></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="quantity">Quantity</Label><Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} min={1} /></div><div className="space-y-2"><Label htmlFor="frequency">Frequency</Label><Select value={frequency} onValueChange={setFrequency}><SelectTrigger id="frequency"><SelectValue placeholder="Select frequency" /></SelectTrigger><SelectContent><SelectItem value="monthly">Every month</SelectItem><SelectItem value="3-months">Every 3 months</SelectItem><SelectItem value="as-needed">As needed</SelectItem></SelectContent></Select></div></div></div><DialogFooter><Button variant="outline" onClick={() => setDrugToAddDetails(null)}>Cancel</Button><Button onClick={handleFinalAddDrug}>Add to My Drug List</Button></DialogFooter></DialogContent></Dialog>
            {/* Manual Drug Entry Dialog */}
            <Dialog open={isManualDrugEntryOpen} onOpenChange={setIsManualDrugEntryOpen}><DialogContent><DialogHeader><DialogTitle>Enter Medication Manually</DialogTitle><DialogDescription>If you couldn't find your medication, add its details here.</DialogDescription></DialogHeader><form onSubmit={handleManualDrugAdd} className="space-y-4 py-4"><div className="space-y-2"><Label htmlFor="manual-drug-name">Drug Name</Label><Input id="manual-drug-name" name="manual-drug-name" required /></div><div className="space-y-2"><Label htmlFor="manual-drug-dosage">Dosage (optional)</Label><Input id="manual-drug-dosage" name="manual-drug-dosage" placeholder="e.g., 20mg" /></div><DialogFooter><Button variant="outline" type="button" onClick={() => setIsManualDrugEntryOpen(false)}>Cancel</Button><Button type="submit">Add Medication</Button></DialogFooter></form></DialogContent></Dialog>
        </div>
    );
}

function MedicareAdvantageApplication() {
    type FormSchema = z.infer<typeof medicareAdvantageSchema>;
    const [user] = useFirebaseAuth();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [step, setStep] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // --- State for Doctors/Meds Search ---
    const [providerQuery, setProviderQuery] = useState('');
    const [providerZipCode, setProviderZipCode] = useState('');
    const [providerResults, setProviderResults] = useState<Provider[]>([]);
    const [providerLoading, setProviderLoading] = useState(false);
    const [isProviderListVisible, setIsProviderListVisible] = useState(false);
    const [_selectedProviders, _setSelectedProviders] = useState<SelectedProvider[]>([]);
    const providerSearchTimeout = useRef<NodeJS.Timeout | null>(null);
    const [providerToSelectAffiliation, setProviderToSelectAffiliation] = useState<Provider | null>(null);
    
    const [medicationQuery, setMedicationQuery] = useState('');
    const [medicationResults, setMedicationResults] = useState<Drug[]>([]);
    const [medicationSuggestions, setMedicationSuggestions] = useState<string[]>([]);
    const [medicationLoading, setMedicationLoading] = useState(false);
    const [isMedicationListVisible, setIsMedicationListVisible] = useState(false);
    const [_selectedDrugs, _setSelectedDrugs] = useState<SelectedDrug[]>([]);
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
    // --- End State for Doctors/Meds Search ---
    
    const planId = searchParams.get('planId');
    const planName = searchParams.get('planName');
    const provider = searchParams.get('provider');
    const premium = searchParams.get('premium');
    const carrierInfo = carriers.find(c => provider && c.name.includes(provider));
    
    const form = useForm<FormSchema>({
        resolver: zodResolver(medicareAdvantageSchema),
        defaultValues: {
            planId: planId || '',
            wantsAgentContact: "yes",
            firstName: "", lastName: "", dob: "", gender: undefined, address: "", city: "", state: "", zip: "", phone: "", email: "",
            medicareClaimNumber: "", partAEffectiveDate: "", partBEffectiveDate: "",
            enrollmentPeriod: undefined, pcpName: "",
            signature: "", agreesToTerms: false,
            selectedProviders: [], selectedDrugs: [],
        }
    });

    useEffect(() => {
      setProviderZipCode(form.getValues('zip'));
    }, [form.watch('zip')]);
    
    const updateSelectedProviders = (newProviders: SelectedProvider[]) => {
        _setSelectedProviders(newProviders);
        form.setValue('selectedProviders', newProviders);
    };

    const updateSelectedDrugs = (newDrugs: SelectedDrug[]) => {
        _setSelectedDrugs(newDrugs);
        form.setValue('selectedDrugs', newDrugs);
    };

    const steps = [
        { id: 1, name: 'Personal Information', fields: ['firstName', 'lastName', 'dob', 'gender', 'address', 'city', 'state', 'zip', 'phone', 'email'] },
        { id: 2, name: 'Medicare Details', fields: ['medicareClaimNumber', 'partAEffectiveDate', 'partBEffectiveDate'] },
        { id: 3, name: 'Doctors & Medications', fields: ['selectedProviders', 'selectedDrugs'] },
        { id: 4, name: 'Plan & Signature', fields: ['enrollmentPeriod', 'pcpName', 'wantsAgentContact', 'signature', 'agreesToTerms'] },
    ];

    const handleNext = async () => {
        const fieldsToValidate = steps[step - 1].fields as FieldPath<FormSchema>[];
        const output = await form.trigger(fieldsToValidate, { shouldFocus: true });
        if (output) setStep(s => s + 1);
    };

    const handlePrev = () => setStep(s => s - 1);

    async function onSubmit(values: FormSchema) {
        if (!user || !db) return;
        try {
            const policyData: Partial<Policy> = {
                planName: planName || "Medicare Advantage",
                premium: premium ? parseFloat(premium) : 0,
                policyCategoryName: "Medicare Advantage",
                policyCategoryId: "medicare",
                carrierName: provider || "Unknown",
                carrierId: carrierInfo?.id || "unknown",
                carrierLogoUrl: carrierInfo?.logoUrl,
                carrierWebsite: carrierInfo?.website,
                enrollmentDate: new Date().toISOString().split('T')[0],
            };
            await saveApplicationAsPolicy(user.uid, policyData);
            toast({ title: "Application Submitted!", description: "We've received your application." });
            setIsSubmitted(true);
        } catch (error) {
            console.error("Error submitting application:", error);
            toast({ variant: "destructive", title: "Submission Failed", description: "There was an error submitting your application." });
        }
    }
    
     // --- Handlers for Doctors/Meds Search ---
    const handleProviderQueryChange = (value: string) => {
        setProviderQuery(value);
        if (providerSearchTimeout.current) clearTimeout(providerSearchTimeout.current);
        if (value.length > 0) setIsProviderListVisible(true); else setIsProviderListVisible(false);
        if (value.length < 3) { setProviderResults([]); setProviderLoading(false); return; }
        setProviderLoading(true);
        providerSearchTimeout.current = setTimeout(async () => {
            const result = await searchProviders({ query: value, zipCode: providerZipCode });
            setProviderResults(result.providers || []);
            setProviderLoading(false);
        }, 300);
    };

    const handleSelectProvider = (provider: Provider) => {
        if (_selectedProviders.some(p => p.npi === provider.npi)) { setProviderQuery(''); setIsProviderListVisible(false); return; }
        if (provider.affiliations && provider.affiliations.length > 1) {
            setProviderToSelectAffiliation(provider);
        } else {
            const affiliation = provider.affiliations?.[0]?.name;
            updateSelectedProviders([..._selectedProviders, { ...provider, selectedAffiliation: affiliation }]);
        }
        setProviderQuery(''); setIsProviderListVisible(false);
    };

    const handleAffiliationSelected = (provider: Provider, affiliationName: string) => {
        updateSelectedProviders([..._selectedProviders, { ...provider, selectedAffiliation: affiliationName }]);
        setProviderToSelectAffiliation(null);
    }

    const handleRemoveProvider = (npi: string) => {
        updateSelectedProviders(_selectedProviders.filter(p => p.npi !== npi));
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
        if (!_selectedDrugs.some(d => d.rxcui === newDrug.rxcui)) {
            updateSelectedDrugs([..._selectedDrugs, newDrug]);
        }
        setDrugToAddDetails(null); setSelectedDosage(null);
    };

    const handleRemoveDrug = (rxcui: string) => updateSelectedDrugs(_selectedDrugs.filter(d => d.rxcui !== rxcui));

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
        updateSelectedDrugs([..._selectedDrugs, newDrug]);
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
            setSelectedDosage(null);
        } else {
            setUniqueForms([]);
        }
    }, [dosages]);
    // --- End Handlers for Doctors/Meds Search ---

    if (isSubmitted) return <SuccessPage title="Medicare Advantage Application" />;
    
    if (step === 0) return (
        <div className="flex flex-col items-center justify-center text-center h-full max-w-lg mx-auto">
            <Card className="w-full">
                <CardHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <UserPlus className="h-6 w-6" />
                    </div>
                    <CardTitle className="font-headline text-2xl sm:text-3xl pt-4">Medicare Advantage Application</CardTitle>
                </CardHeader>
                <CardContent><p className="text-base text-muted-foreground">Part C plans that bundle Parts A, B, and often D.</p></CardContent>
                <CardFooter><Button className="w-full" size="lg" onClick={() => setStep(1)}>Start Application <ArrowRight className="ml-2 h-4 w-4" /></Button></CardFooter>
            </Card>
        </div>
    );
    
    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Medicare Advantage Application</h1>
                    <p className="text-base text-muted-foreground mt-1">Step {step} of {steps.length}: <strong>{steps[step - 1].name}</strong></p>
                </div>
                <PlanDetailsCard 
                    planName={planName || undefined} 
                    provider={provider || undefined} 
                    premium={premium || undefined}
                    carrierLogoUrl={carrierInfo?.logoUrl}
                    carrierWebsite={carrierInfo?.website}
                />
            </div>
            <Progress value={(step / steps.length) * 100} />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {step === 1 && ( /* Personal Info */
                        <Card><CardHeader><CardTitle>Personal Information</CardTitle></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                            <FormField control={form.control} name="firstName" render={({ field }) => <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="lastName" render={({ field }) => <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="dob" render={({ field }) => <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="gender" render={({ field }) => <FormItem><FormLabel>Gender</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="male" /></FormControl><FormLabel className="font-normal">Male</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="female" /></FormControl><FormLabel className="font-normal">Female</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="address" render={({ field }) => <FormItem className="md:col-span-2"><FormLabel>Street Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="city" render={({ field }) => <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="state" render={({ field }) => <FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="zip" render={({ field }) => <FormItem><FormLabel>Zip Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="phone" render={({ field }) => <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="email" render={({ field }) => <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>} />
                        </CardContent></Card>
                    )}
                    {step === 2 && ( /* Medicare Details */
                        <Card><CardHeader><CardTitle>Medicare Details</CardTitle></CardHeader><CardContent className="space-y-6 pt-6">
                            <FormField control={form.control} name="medicareClaimNumber" render={({ field }) => <FormItem><FormLabel>Medicare ID Number (MBI)</FormLabel><FormControl><Input placeholder="Found on your Medicare card" {...field} /></FormControl><FormMessage /></FormItem>} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="partAEffectiveDate" render={({ field }) => <FormItem><FormLabel>Part A Effective Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>} />
                                <FormField control={form.control} name="partBEffectiveDate" render={({ field }) => <FormItem><FormLabel>Part B Effective Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>} />
                            </div>
                        </CardContent></Card>
                    )}
                    {step === 3 && ( /* Doctors & Medications */
                        <div className="space-y-8">
                             <Card>
                                <CardHeader><CardTitle>Your Doctors & Facilities</CardTitle><CardDescription>Add your preferred doctors to check if they are in-network with your new plan.</CardDescription></CardHeader>
                                <CardContent className="space-y-4">
                                     <div className="relative">
                                        <Label htmlFor="provider-search">Provider Name</Label>
                                        <Command shouldFilter={false} className="overflow-visible rounded-lg border">
                                            <div className="relative">
                                                <CommandInput id="provider-search" value={providerQuery} onValueChange={handleProviderQueryChange} onFocus={() => { if(providerQuery.length > 0) setIsProviderListVisible(true) }} onBlur={() => setTimeout(() => setIsProviderListVisible(false), 200)} placeholder="Search for a doctor or facility..."/>
                                                {providerLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin" />}
                                                {isProviderListVisible && (
                                                    <CommandList className="absolute top-full z-10 mt-1 w-full rounded-b-lg border bg-background shadow-lg">
                                                        {providerQuery.length > 0 && providerQuery.length < 3 && !providerLoading && (<CommandEmpty>Please enter at least 3 characters.</CommandEmpty>)}
                                                        {providerResults.length === 0 && providerQuery.length >= 3 && !providerLoading && (<CommandEmpty>No providers found.</CommandEmpty>)}
                                                        {providerResults.length > 0 && (<CommandGroup>{providerResults.map(p => (<CommandItem key={p.npi} value={p.name} onSelect={() => handleSelectProvider(p)} className="cursor-pointer py-2 px-4"><div className="flex flex-col"><span className="font-medium">{p.name}</span><span className="text-sm text-muted-foreground">{p.specialties?.[0]} - {p.type}</span></div></CommandItem>))}</CommandGroup>)}
                                                    </CommandList>
                                                )}
                                            </div>
                                        </Command>
                                    </div>
                                    {_selectedProviders.length > 0 && (
                                        <div className="space-y-2 rounded-md border p-2 max-h-60 overflow-y-auto mt-4">
                                            {_selectedProviders.map(p => (
                                                <div key={p.npi} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                                    <div className="flex-1"><p className="text-sm font-medium">{p.name}</p>{p.selectedAffiliation && <p className="text-xs text-muted-foreground">{p.selectedAffiliation}</p>}</div>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveProvider(p.npi)}><Trash2 className="h-4 w-4 text-destructive" /><span className="sr-only">Remove {p.name}</span></Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader><CardTitle>Your Medications</CardTitle><CardDescription>Add your current medications to ensure they are covered.</CardDescription></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="relative">
                                        <Label htmlFor="medication-search">Medication Name</Label>
                                        <Command shouldFilter={false} className="overflow-visible rounded-lg border">
                                            <div className="relative">
                                                <CommandInput id="medication-search" value={medicationQuery} onValueChange={handleMedicationQueryChange} onFocus={() => { if(medicationQuery.length > 0) setIsMedicationListVisible(true) }} onBlur={() => setTimeout(() => setIsMedicationListVisible(false), 200)} placeholder="Search for a medication..."/>
                                                {medicationLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin" />}
                                                {isMedicationListVisible && (
                                                    <CommandList className="absolute top-full z-10 mt-1 w-full rounded-b-lg border bg-background shadow-lg">
                                                         {medicationQuery.length > 0 && medicationQuery.length < 3 && !medicationLoading && (<CommandEmpty>Please enter at least 3 characters.</CommandEmpty>)}
                                                        {!medicationLoading && medicationResults.length === 0 && medicationSuggestions.length > 0 && medicationQuery.length >= 3 && (<CommandGroup heading="Did you mean?">{medicationSuggestions.map(s => (<CommandItem key={s} value={s} onSelect={() => handleMedicationQueryChange(s)} className="cursor-pointer">{s}</CommandItem>))}</CommandGroup>)}
                                                        {medicationResults.length > 0 && (<CommandGroup>{medicationResults.map(d => (<CommandItem key={d.rxcui} value={d.name} onSelect={() => handleSelectDrug(d)} className="cursor-pointer"><div className="flex items-center gap-3"><Pill className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{d.name}</span></div></CommandItem>))}</CommandGroup>)}
                                                    </CommandList>
                                                )}
                                            </div>
                                        </Command>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => setIsManualDrugEntryOpen(true)}>Enter Manually</Button>
                                    {_selectedDrugs.length > 0 && (
                                        <div className="space-y-2 rounded-md border p-2 max-h-60 overflow-y-auto mt-4">
                                            {_selectedDrugs.map(drug => (
                                                <div key={drug.rxcui} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                                    <div className="flex-1"><p className="text-sm font-medium">{drug.full_name}</p><p className="text-xs text-muted-foreground">Qty: {drug.quantity} &bull; {frequencyLabels[drug.frequency]} &bull; {packageLabels[drug.package]}</p></div>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveDrug(drug.rxcui)}><Trash2 className="h-4 w-4 text-destructive" /><span className="sr-only">Remove {drug.full_name}</span></Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                    {step === 4 && ( /* Plan & Signature */
                        <Card><CardHeader><CardTitle>Plan & Signature</CardTitle></CardHeader><CardContent className="space-y-6 pt-6">
                            <FormField control={form.control} name="enrollmentPeriod" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Enrollment Period</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select a period..." /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="aep">Annual Enrollment Period (AEP)</SelectItem>
                                            <SelectItem value="oep">Open Enrollment Period (OEP)</SelectItem>
                                            <SelectItem value="sep">Special Enrollment Period (SEP)</SelectItem>
                                            <SelectItem value="iep">Initial Enrollment Period (IEP)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="pcpName" render={({ field }) => <FormItem><FormLabel>Primary Care Physician (PCP)</FormLabel><FormControl><Input placeholder="Optional" {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="wantsAgentContact" render={({ field }) => <FormItem><FormLabel>Would you like a licensed agent to contact you?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="agreesToTerms" render={({ field }) => <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>I confirm all information is accurate and agree to the disclaimers and privacy policy.</FormLabel><FormMessage/></div></FormItem>} />
                            <FormField control={form.control} name="signature" render={({ field }) => <FormItem><FormLabel>Digital Signature</FormLabel><FormControl><Input placeholder="Type your full name" {...field} /></FormControl><FormDescription>By typing your name, you are electronically signing this application.</FormDescription><FormMessage /></FormItem>} />
                        </CardContent></Card>
                    )}
                    <div className="flex justify-between">
                        {step > 1 ? (<Button type="button" variant="outline" onClick={handlePrev}>Back</Button>) : <div />}
                        {step < steps.length ? (<Button type="button" onClick={handleNext}>Next Step <ArrowRight className="ml-2 h-4 w-4"/></Button>) : (<Button type="submit">Submit Application</Button>)}
                    </div>
                </form>
            </Form>
             {/* Affiliation Selection Dialog */}
            <Dialog open={!!providerToSelectAffiliation} onOpenChange={(open) => !open && setProviderToSelectAffiliation(null)}><DialogContent><DialogHeader><DialogTitle>Select Hospital Affiliation</DialogTitle><DialogDescription>{providerToSelectAffiliation?.name} is affiliated with multiple hospitals. Please choose one.</DialogDescription></DialogHeader><div className="py-4"><RadioGroup onValueChange={(value) => { if (providerToSelectAffiliation) { handleAffiliationSelected(providerToSelectAffiliation, value); } }} className="space-y-2 max-h-60 overflow-y-auto">{providerToSelectAffiliation?.affiliations?.map((aff, index) => (<Label key={index} htmlFor={`aff-${index}`} className="flex items-center space-x-3 rounded-md border p-4 has-[:checked]:border-primary"><RadioGroupItem value={aff.name} id={`aff-${index}`} /><span>{aff.name}</span></Label>))}</RadioGroup></div><DialogFooter><Button variant="outline" onClick={() => setProviderToSelectAffiliation(null)}>Cancel</Button></DialogFooter></DialogContent></Dialog>
            {/* Dosage Selection Dialog */}
            <Dialog open={!!drugToConfirm} onOpenChange={(open) => { if (!open) { setDrugToConfirm(null); setIsGenericSelected(null); } }}><DialogContent><DialogHeader><DialogTitle>Configure {drugToConfirm?.name}</DialogTitle><DialogDescription>Select form and strength.</DialogDescription></DialogHeader>{drugToConfirm && !drugToConfirm.is_generic && drugToConfirm.generic && isGenericSelected === null && (<div className="p-4 border rounded-md bg-amber-50"><p className="text-sm font-semibold">Generic Available</p><p className="text-sm text-muted-foreground mt-1">Take the brand or generic version?</p><p className="text-xs text-muted-foreground mt-1">Generic: {drugToConfirm.generic.name}</p><div className="mt-3 flex gap-2"><Button size="sm" onClick={() => handleGenericChoice(false)} variant={isGenericSelected === false ? 'default' : 'outline'}>{drugToConfirm.name} (Brand)</Button><Button size="sm" onClick={() => handleGenericChoice(true)} variant={isGenericSelected === true ? 'default' : 'outline'}>Generic Version</Button></div></div>)}<div className="py-4 space-y-4">{dosageLoading ? (<div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>) : (<>{(isGenericSelected === null && drugToConfirm?.generic && !drugToConfirm.is_generic) ? (<p className="text-center text-sm text-muted-foreground p-4">Please select an option to see strengths.</p>) : (<>
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
                {dosages.length === 0 && !dosageLoading && (<p className="text-center text-sm text-muted-foreground p-4">No strengths found.</p>)}
            </>)}</>)}</div><DialogFooter><Button variant="outline" onClick={() => setDrugToConfirm(null)}>Cancel</Button><Button onClick={handleProceedToDetails} disabled={!selectedDosage || dosageLoading}>Next</Button></DialogFooter></DialogContent></Dialog>
             {/* Drug Details Dialog */}
            <Dialog open={!!drugToAddDetails} onOpenChange={(open) => !open && setDrugToAddDetails(null)}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Tell us about this drug</DialogTitle><DialogDescription>Provide quantity and frequency for {drugToAddDetails?.name}.</DialogDescription></DialogHeader><div className="grid gap-4 py-4"><div className="space-y-2"><Label htmlFor="dosage">Dosage</Label><Input id="dosage" value={drugToAddDetails?.full_name || ''} disabled /></div><div className="space-y-2"><Label htmlFor="package">Package</Label><Select value={pkg} onValueChange={setPackage}><SelectTrigger id="package"><SelectValue placeholder="Select package" /></SelectTrigger><SelectContent><SelectItem value="30-day">30-day supply</SelectItem><SelectItem value="60-day">60-day supply</SelectItem><SelectItem value="90-day">90-day supply</SelectItem><SelectItem value="bottle">1 bottle</SelectItem></SelectContent></Select></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="quantity">Quantity</Label><Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} min={1} /></div><div className="space-y-2"><Label htmlFor="frequency">Frequency</Label><Select value={frequency} onValueChange={setFrequency}><SelectTrigger id="frequency"><SelectValue placeholder="Select frequency" /></SelectTrigger><SelectContent><SelectItem value="monthly">Every month</SelectItem><SelectItem value="3-months">Every 3 months</SelectItem><SelectItem value="as-needed">As needed</SelectItem></SelectContent></Select></div></div></div><DialogFooter><Button variant="outline" onClick={() => setDrugToAddDetails(null)}>Cancel</Button><Button onClick={handleFinalAddDrug}>Add to My Drug List</Button></DialogFooter></DialogContent></Dialog>
            {/* Manual Drug Entry Dialog */}
            <Dialog open={isManualDrugEntryOpen} onOpenChange={setIsManualDrugEntryOpen}><DialogContent><DialogHeader><DialogTitle>Enter Medication Manually</DialogTitle><DialogDescription>If you couldn't find your medication, add its details here.</DialogDescription></DialogHeader><form onSubmit={handleManualDrugAdd} className="space-y-4 py-4"><div className="space-y-2"><Label htmlFor="manual-drug-name">Drug Name</Label><Input id="manual-drug-name" name="manual-drug-name" required /></div><div className="space-y-2"><Label htmlFor="manual-drug-dosage">Dosage (optional)</Label><Input id="manual-drug-dosage" name="manual-drug-dosage" placeholder="e.g., 20mg" /></div><DialogFooter><Button variant="outline" type="button" onClick={() => setIsManualDrugEntryOpen(false)}>Cancel</Button><Button type="submit">Add Medication</Button></DialogFooter></form></DialogContent></Dialog>
        </div>
    );
}

const applicationTypes = [
  {
    title: "Medicare Supplement",
    description: "For Medigap plans to cover Original Medicare costs.",
    icon: FileText,
    type: "medicare-supplement",
  },
  {
    title: "Dental Insurance",
    description: "Coverage for check-ups, procedures, and more.",
    icon: Smile,
    type: "dental",
  },
  {
    title: "Cancer Insurance",
    description: "Pays a lump sum upon first diagnosis of cancer.",
    icon: HeartCrack,
    type: "cancer",
  },
  {
    title: "Hospital Indemnity",
    description: "Pays a fixed amount for covered hospital stays.",
    icon: Hospital,
    type: "hospital-indemnity",
  },
  {
    title: "Life Insurance",
    description: "Protect your loved ones with a life insurance policy.",
    icon: FileHeart,
    type: "life-insurance",
  },
  {
    title: "Health Insurance",
    description: "For individuals and families under the age of 65.",
    icon: Heart,
    type: "health-insurance",
  },
  {
    title: "Medicare Advantage",
    description: "Part C plans that bundle Parts A, B, and often D.",
    icon: UserPlus,
    type: "medicare-advantage",
  },
];

function ApplicationSelectionGrid() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Submit an Application</h1>
        <p className="text-base text-muted-foreground mt-1">Select the type of application you would like to start.</p>
      </div>
      <div className="flex flex-col gap-6 md:gap-8 lg:gap-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {applicationTypes.map((app) => {
                const Icon = app.icon
                return (
                  <Link key={app.type} href={`/dashboard/apply?type=${app.type}`} passHref>
                    <Card className="h-full flex flex-col items-center justify-center text-center p-6 hover:shadow-lg hover:border-primary transition-all">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                        <Icon className="h-8 w-8" />
                      </div>
                      <h3 className="font-semibold text-lg">{app.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 leading-snug">{app.description}</p>
                    </Card>
                  </Link>
                )
            })}
        </div>
      </div>
    </div>
  );
}


function ApplyPageContent() {
    const searchParams = useSearchParams()
    const applicationType = searchParams.get('type')

    if (!applicationType) {
        return <ApplicationSelectionGrid />;
    }

    switch (applicationType) {
        case 'medicare-supplement':
            return <MedicareSupplementApplication />;
        case 'dental':
            return <DentalApplication />;
        case 'cancer':
            return <CancerApplication />;
        case 'hospital-indemnity':
            return <HospitalIndemnityApplication />;
        case 'life-insurance':
            return <LifeInsuranceApplication />;
        case 'health-insurance':
            return <HealthInsuranceApplication />;
        case 'medicare-advantage':
            return <MedicareAdvantageApplication />;
        default:
            return <ApplicationSelectionGrid />;
    }
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className="text-center p-12">Loading Application...</div>}>
        <ApplyPageContent />
    </Suspense>
  )
}
