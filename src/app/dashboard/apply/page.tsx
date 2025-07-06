
"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useForm, type FieldPath } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { mockPlans } from "@/lib/mock-data"
import { Progress } from "@/components/ui/progress"
import { ShieldCheck, CheckCircle, ArrowRight, User, HeartPulse, FileText, Bot, FileCheck, PartyPopper, Heart, Smile, Hospital, ShieldAlert, FileHeart, UserPlus } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import type { Plan } from "@/types"

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
  takesPrescriptions: z.enum(["yes", "no"], { required_error: "This field is required." }),
  prescriptionList: z.string().optional(),
  planId: z.string().min(1, "You must select a plan to apply for."),
  wantsAgentContact: z.enum(["yes", "no"], { required_error: "This field is required." }),
  wantsDental: z.boolean().default(false).optional(),
  wantsCancer: z.boolean().default(false).optional(),
  wantsLifeInsurance: z.boolean().default(false).optional(),
  wantsRetirementPlanning: z.boolean().default(false).optional(),
  wantsDrugPlan: z.boolean().default(false).optional(),
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
});

const medicareAdvantageSchema = personalInfoSchema.merge(medicareInfoSchema).merge(signatureSchema).extend({
    enrollmentPeriod: z.enum(["aep", "oep", "sep", "iep"], { required_error: "Please select your enrollment period." }),
    pcpName: z.string().optional(),
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
                <p className="text-muted-foreground">A licensed agent will be in contact with you shortly to finalize your enrollment. You will also receive a confirmation email with a copy of your application.</p>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full" size="lg">
                    <Link href="/dashboard">Return to Dashboard</Link>
                </Button>
            </CardFooter>
        </Card>
    </div>
);

const PlanDetailsCard = ({ planName, provider, premium }: { planName?: string, provider?: string, premium?: string }) => {
    if (!planName) return null;
    return (
        <Card className="w-full max-w-sm shrink-0 hidden sm:block">
            <CardHeader className="p-4">
                <CardDescription>Selected Plan</CardDescription>
                <CardTitle className="text-lg">{planName}</CardTitle>
            </CardHeader>
            <CardFooter className="p-4 pt-0 flex justify-between items-baseline">
                <p className="text-sm text-muted-foreground">{provider}</p>
                {premium && <p className="font-bold text-xl">${parseFloat(premium).toFixed(2)}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>}
            </CardFooter>
        </Card>
    );
};

// --- APPLICATION FORMS --- //

function MedicareSupplementApplication() {
    type FormSchema = z.infer<typeof medSupplementSchema>;
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [step, setStep] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);

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
    
    const form = useForm<FormSchema>({
        resolver: zodResolver(medSupplementSchema),
        defaultValues: {
            planId: planId || (quotedPlan ? quotedPlanId : ''),
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
            medicareClaimNumber: "",
            partAEffectiveDate: "",
            partBEffectiveDate: "",
            isReplacingCoverage: undefined,
            hasPrescriptionPlan: undefined,
            hasMajorIllness: undefined,
            takesPrescriptions: undefined,
            hasOtherInsurance: undefined,
            hospitalizedLast12Months: undefined,
            signature: "",
            agreesToTerms: false,
            majorIllnessDetails: "",
            prescriptionList: "",
            wantsDental: false,
            wantsCancer: false,
            wantsLifeInsurance: false,
            wantsRetirementPlanning: false,
            wantsDrugPlan: false,
        }
    });

    const steps = [
        { id: 1, name: 'Personal Information', fields: ['firstName', 'lastName', 'dob', 'gender', 'address', 'city', 'state', 'zip', 'phone', 'email'] },
        { id: 2, name: 'Medicare Details', fields: ['medicareClaimNumber', 'partAEffectiveDate', 'partBEffectiveDate'] },
        { id: 3, name: 'Current & Medical History', fields: ['isReplacingCoverage', 'hasPrescriptionPlan', 'hasMajorIllness', 'takesPrescriptions'] },
        { id: 4, name: 'Plan & Agent', fields: ['planId', 'wantsAgentContact'] },
        { id: 5, name: 'Signature', fields: ['signature', 'agreesToTerms'] },
    ];

    const handleNext = async () => {
        const fieldsToValidate = steps[step - 1].fields as FieldPath<FormSchema>[];
        const output = await form.trigger(fieldsToValidate, { shouldFocus: true });
        if (output) setStep(s => s + 1);
    };

    const handlePrev = () => setStep(s => s - 1);

    function onSubmit(values: FormSchema) {
        console.log("Medicare Supplement Application Submitted:", values);
        toast({ title: "Application Submitted!", description: "We've received your application." });
        setIsSubmitted(true);
    }
    
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
                <PlanDetailsCard planName={planName || undefined} provider={provider || undefined} premium={premium || undefined} />
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
                             <FormField control={form.control} name="takesPrescriptions" render={({ field }) => <FormItem><FormLabel>Are you currently taking any prescription medications?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                             {form.watch("takesPrescriptions") === "yes" && <FormField control={form.control} name="prescriptionList" render={({ field }) => <FormItem><FormLabel>Please list your prescriptions and dosages</FormLabel><FormControl><Textarea placeholder="e.g., Lisinopril 20mg" {...field} /></FormControl><FormMessage /></FormItem>} />}
                        </CardContent></Card>
                    )}
                    {step === 4 && ( /* Plan & Agent */
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
                    {step === 5 && ( /* Signature */
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
        </div>
    );
}

function DentalApplication() {
    type FormSchema = z.infer<typeof dentalSchema>;
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [step, setStep] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    const planId = searchParams.get('planId');
    const planName = searchParams.get('planName');
    const provider = searchParams.get('provider');
    const premium = searchParams.get('premium');
    
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

    function onSubmit(values: FormSchema) {
        console.log("Dental Application Submitted:", values);
        toast({ title: "Application Submitted!", description: "We've received your dental application." });
        setIsSubmitted(true);
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
                <PlanDetailsCard planName={planName || undefined} provider={provider || undefined} premium={premium || undefined} />
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
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [step, setStep] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const planId = searchParams.get('planId');
    const planName = searchParams.get('planName');
    const provider = searchParams.get('provider');
    const premium = searchParams.get('premium');
    
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

    function onSubmit(values: FormSchema) {
        console.log("Hospital Indemnity Application Submitted:", values);
        toast({ title: "Application Submitted!", description: "We've received your hospital indemnity application." });
        setIsSubmitted(true);
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
                <PlanDetailsCard planName={planName || undefined} provider={provider || undefined} premium={premium || undefined} />
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
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [step, setStep] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const planId = searchParams.get('planId');
    const planName = searchParams.get('planName');
    const provider = searchParams.get('provider');
    const premium = searchParams.get('premium');
    
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

    function onSubmit(values: FormSchema) {
        console.log("Life Insurance Application Submitted:", values);
        toast({ title: "Application Submitted!", description: "We've received your life insurance application." });
        setIsSubmitted(true);
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
                <PlanDetailsCard planName={planName || undefined} provider={provider || undefined} premium={premium || undefined} />
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

// Stubs for other forms
function HealthInsuranceApplication() {
    return <GenericApplication title="Health Insurance Application" icon={Heart} />;
}
function MedicareAdvantageApplication() {
    return <GenericApplication title="Medicare Advantage Application" icon={UserPlus} />;
}

function GenericApplication({ title, icon: Icon }: { title: string, icon: React.ElementType }) {
    const searchParams = useSearchParams();
    const planName = searchParams.get('planName');
    const provider = searchParams.get('provider');
    const premium = searchParams.get('premium');
    
    return (
        <div className="space-y-8">
             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">{title}</h1>
                    <p className="text-base text-muted-foreground mt-1">This application is simplified for this demo.</p>
                </div>
                <PlanDetailsCard planName={planName || undefined} provider={provider || undefined} premium={premium || undefined} />
            </div>
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-6 w-6" />
                        </div>
                        <CardTitle>{title}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">A full application form would be displayed here with fields specific to {title}. For now, you can submit this placeholder form.</p>
                </CardContent>
                <CardFooter>
                    <Button onClick={() => alert('This is a placeholder submission.')}>Submit Application</Button>
                </CardFooter>
            </Card>
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

    