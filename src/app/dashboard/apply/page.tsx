
"use client"

import { useState, useEffect } from "react"
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
import { ShieldCheck, CheckCircle, ArrowRight, User, HeartPulse, FileText, Bot, FileCheck, PartyPopper } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import type { Plan } from "@/types"

const formSchema = z.object({
  // Personal Info
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

  // Medicare Info
  medicareClaimNumber: z.string().min(1, "Medicare Claim Number is required."),
  partAEffectiveDate: z.string().min(1, "Part A Effective Date is required."),
  partBEffectiveDate: z.string().min(1, "Part B Effective Date is required."),
  
  // Current Coverage
  hasOtherInsurance: z.enum(["yes", "no"], { required_error: "This field is required." }),
  otherInsuranceType: z.string().optional(),
  hasMedigap: z.enum(["yes", "no"], { required_error: "This field is required." }),
  medigapCompany: z.string().optional(),
  medigapPlan: z.string().optional(),
  isReplacingCoverage: z.enum(["yes", "no"], { required_error: "This field is required." }),
  hasPrescriptionPlan: z.enum(["yes", "no"], { required_error: "This field is required." }),

  // Medical History
  hospitalizedLast12Months: z.enum(["yes", "no"], { required_error: "This field is required." }),
  hasMajorIllness: z.enum(["yes", "no"], { required_error: "This field is required." }),
  majorIllnessDetails: z.string().optional(),
  takesPrescriptions: z.enum(["yes", "no"], { required_error: "This field is required." }),
  prescriptionList: z.string().optional(),

  // Plan Selection
  planId: z.string().min(1, "You must select a plan to apply for."),
  wantsDental: z.boolean().default(false).optional(),
  wantsCancer: z.boolean().default(false).optional(),
  wantsLifeInsurance: z.boolean().default(false).optional(),
  wantsFinancialPlanning: z.boolean().default(false).optional(),
  wantsDrugPlan: z.boolean().default(false).optional(),

  // Agent Assistance
  wantsAgentContact: z.enum(["yes", "no"], { required_error: "This field is required." }),

  // Signature & Consent
  signature: z.string().min(1, "Digital signature is required"),
  agreesToTerms: z.boolean().refine(val => val === true, { message: "You must agree to the terms and disclaimers." }),
  confirmsAccuracy: z.boolean().refine(val => val === true, { message: "You must confirm the accuracy of your information." }),
}).superRefine((data, ctx) => {
    if (data.hasMajorIllness === "yes" && !data.majorIllnessDetails) {
        ctx.addIssue({ code: "custom", message: "Please provide details about major illnesses.", path: ["majorIllnessDetails"] });
    }
    if (data.takesPrescriptions === "yes" && !data.prescriptionList) {
        ctx.addIssue({ code: "custom", message: "Please list your prescriptions.", path: ["prescriptionList"] });
    }
});


type FormSchemaType = z.infer<typeof formSchema>;

const steps = [
    { id: 1, name: 'Personal Information', icon: User, fields: ['firstName', 'lastName', 'dob', 'gender', 'address', 'city', 'state', 'zip', 'phone', 'email'] as FieldPath<FormSchemaType>[] },
    { id: 2, name: 'Medicare Details', icon: ShieldCheck, fields: ['medicareClaimNumber', 'partAEffectiveDate', 'partBEffectiveDate'] as FieldPath<FormSchemaType>[] },
    { id: 3, name: 'Current Coverage', icon: FileText, fields: ['hasOtherInsurance', 'otherInsuranceType', 'hasMedigap', 'medigapCompany', 'medigapPlan', 'isReplacingCoverage', 'hasPrescriptionPlan'] as FieldPath<FormSchemaType>[] },
    { id: 4, name: 'Medical History', icon: HeartPulse, fields: ['hospitalizedLast12Months', 'hasMajorIllness', 'majorIllnessDetails', 'takesPrescriptions', 'prescriptionList'] as FieldPath<FormSchemaType>[] },
    { id: 5, name: 'Plan Selection', icon: CheckCircle, fields: ['planId', 'wantsDental', 'wantsCancer', 'wantsLifeInsurance', 'wantsFinancialPlanning', 'wantsDrugPlan'] as FieldPath<FormSchemaType>[] },
    { id: 6, name: 'Agent Assistance', icon: Bot, fields: ['wantsAgentContact'] as FieldPath<FormSchemaType>[] },
    { id: 7, name: 'Review & Submit', icon: FileCheck, fields: ['signature', 'agreesToTerms', 'confirmsAccuracy'] as FieldPath<FormSchemaType>[] },
];

function ReviewSection({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="mb-8">
            <h4 className="font-headline text-xl font-semibold border-b pb-3 mb-4">{title}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-base">{children}</div>
        </div>
    )
}

function ReviewItem({ label, value }: { label: string, value: any }) {
    return (
        <>
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium">{String(value) || 'N/A'}</dd>
        </>
    )
}

export default function ApplyPage() {
    const searchParams = useSearchParams()
    const { toast } = useToast()
    const [step, setStep] = useState(0)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const quotedPlanId = 'quoted-plan';
    const planIdFromQuery = searchParams.get('planId');
    const planNameFromQuery = searchParams.get('planName');
    const providerFromQuery = searchParams.get('provider');
    const premiumFromQuery = searchParams.get('premium');

    const supplementPlans = mockPlans.filter(p => p.category === "Medicare Supplement");
    
    const allAvailablePlans: Plan[] = [...supplementPlans];
    let quotedPlan: Plan | null = null;
    
    if (planNameFromQuery && providerFromQuery && premiumFromQuery) {
        quotedPlan = {
            id: quotedPlanId,
            name: planNameFromQuery,
            provider: providerFromQuery,
            premium: parseFloat(premiumFromQuery),
            category: 'Quoted Plan',
            type: 'PPO',
            deductible: 0,
            maxOutOfPocket: 0,
            rating: 0,
            features: { dental: false, vision: false, hearing: false, prescriptionDrug: false }
        }
        if (!allAvailablePlans.some(p => p.name === quotedPlan?.name && p.provider === quotedPlan?.provider)) {
            allAvailablePlans.unshift(quotedPlan);
        }
    }

    const form = useForm<FormSchemaType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            dob: "",
            address: "",
            city: "",
            state: "",
            zip: "",
            phone: "",
            email: "",
            medicareClaimNumber: "",
            partAEffectiveDate: "",
            partBEffectiveDate: "",
            hasOtherInsurance: "no",
            hasMedigap: "no",
            isReplacingCoverage: "no",
            hasPrescriptionPlan: "no",
            hospitalizedLast12Months: "no",
            hasMajorIllness: "no",
            takesPrescriptions: "no",
            planId: planIdFromQuery || (quotedPlan ? quotedPlanId : supplementPlans[0]?.id || ""),
            wantsAgentContact: "yes",
            signature: "",
            agreesToTerms: false,
            confirmsAccuracy: false,
            wantsDental: false,
            wantsCancer: false,
            wantsLifeInsurance: false,
            wantsFinancialPlanning: false,
            wantsDrugPlan: false,
        }
    })

    const watchHasMajorIllness = form.watch("hasMajorIllness");
    const watchTakesPrescriptions = form.watch("takesPrescriptions");
    const watchedPlanId = form.watch("planId");
    const selectedPlan = allAvailablePlans.find(p => p.id === watchedPlanId);
    
    function onSubmit(values: FormSchemaType) {
        console.log(values)
        toast({
            title: "Application Submitted!",
            description: "We have received your application and will be in touch shortly.",
        })
        setIsSubmitted(true);
    }

    const handleNext = async () => {
        const currentStep = steps[step - 1];
        const fields = currentStep.fields;
        const output = await form.trigger(fields, { shouldFocus: true });
        
        if (!output) return;
        
        if (step < steps.length) {
            setStep(step + 1);
        } else {
           await form.handleSubmit(onSubmit)();
        }
    }

    const handlePrev = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    }

    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center text-center h-full max-w-lg mx-auto">
                <Card className="w-full">
                    <CardHeader>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                             <PartyPopper className="h-8 w-8" />
                        </div>
                        <CardTitle className="font-headline text-2xl sm:text-3xl pt-4">Application Complete!</CardTitle>
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
        )
    }

    if (step === 0) {
        return (
             <div className="flex flex-col items-center justify-center text-center h-full max-w-lg mx-auto">
                <Card className="w-full">
                    <CardHeader>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                             <FileText className="h-6 w-6" />
                        </div>
                        <CardTitle className="font-headline text-2xl sm:text-3xl pt-4">Medicare Supplement Application</CardTitle>
                        <CardDescription className="text-base">Let's get you enrolled in the right plan.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-base text-muted-foreground">This application will help us determine your eligibility for a Medicare Supplement insurance policy. The process should take about 5-10 minutes.</p>
                        <Alert>
                            <ShieldCheck className="h-4 w-4" />
                            <AlertTitle>Your Information is Secure</AlertTitle>
                            <AlertDescription>
                                Your personal information is kept strictly confidential and is only used for insurance purposes as required by state and federal law.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" size="lg" onClick={() => setStep(1)}>
                            Start Application <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>
             </div>
        )
    }

  return (
    <div className="space-y-8">
        <div className="flex justify-between items-start gap-8">
            <div>
                <h1 className="text-2xl font-semibold">Submit Application</h1>
                <p className="text-base text-muted-foreground mt-1">Please follow the steps to complete your enrollment.</p>
            </div>
            {selectedPlan && (
                <Card className="w-full max-w-sm shrink-0 hidden sm:block">
                    <CardHeader className="p-4">
                        <CardDescription>Selected Plan</CardDescription>
                        <CardTitle className="text-lg">{selectedPlan.name}</CardTitle>
                    </CardHeader>
                    <CardFooter className="p-4 pt-0 flex justify-between items-baseline">
                        <p className="text-sm text-muted-foreground">{selectedPlan.provider}</p>
                        <p className="font-bold text-xl">${selectedPlan.premium?.toFixed(2)}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                    </CardFooter>
                </Card>
            )}
        </div>

       <div className="space-y-6">
        <div className="space-y-3">
            <Progress value={(step / steps.length) * 100} />
            <div className="flex justify-between text-sm text-muted-foreground">
                <p>Step {step} of {steps.length}: <strong>{steps[step - 1].name}</strong></p>
                <p>{Math.round((step / steps.length) * 100)}% Complete</p>
            </div>
        </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {step === 1 && ( // Personal Info
                <Card>
                    <CardHeader><CardTitle className="text-xl">Personal Information</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="firstName" render={({ field }) => <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="lastName" render={({ field }) => <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <FormField control={form.control} name="dob" render={({ field }) => <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>} />
                             <FormField control={form.control} name="gender" render={({ field }) => <FormItem><FormLabel>Gender</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="male" /></FormControl><FormLabel className="font-normal">Male</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="female" /></FormControl><FormLabel className="font-normal">Female</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                        </div>
                        <FormField control={form.control} name="address" render={({ field }) => <FormItem><FormLabel>Street Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField control={form.control} name="city" render={({ field }) => <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="state" render={({ field }) => <FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="zip" render={({ field }) => <FormItem><FormLabel>Zip Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="phone" render={({ field }) => <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="email" render={({ field }) => <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>} />
                        </div>
                    </CardContent>
                </Card>
            )}

            {step === 2 && ( // Medicare Details
                <Card>
                    <CardHeader><CardTitle className="text-xl">Medicare Details</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={form.control} name="medicareClaimNumber" render={({ field }) => <FormItem><FormLabel>Medicare ID Number (MBI)</FormLabel><FormControl><Input placeholder="Found on your Medicare card" {...field} /></FormControl><FormMessage /></FormItem>} />
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="partAEffectiveDate" render={({ field }) => <FormItem><FormLabel>Part A Effective Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="partBEffectiveDate" render={({ field }) => <FormItem><FormLabel>Part B Effective Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>} />
                        </div>
                    </CardContent>
                </Card>
            )}

            {step === 3 && ( // Current Coverage
                 <Card>
                    <CardHeader><CardTitle className="text-xl">Current Coverage</CardTitle><CardDescription>Tell us about any other health insurance you have.</CardDescription></CardHeader>
                    <CardContent className="space-y-8">
                        <FormField control={form.control} name="hasOtherInsurance" render={({ field }) => <FormItem><FormLabel>Are you currently covered by any other health insurance (e.g., from an employer, Medicaid)?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="hasMedigap" render={({ field }) => <FormItem><FormLabel>Do you have a Medicare Supplement (Medigap) plan now?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="isReplacingCoverage" render={({ field }) => <FormItem><FormLabel>Are you replacing your current coverage with this new plan?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormDescription>If yes, do not cancel any coverage until you receive written approval for your new plan.</FormDescription><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="hasPrescriptionPlan" render={({ field }) => <FormItem><FormLabel>Do you have a standalone Prescription Drug Plan (Part D)?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                    </CardContent>
                </Card>
            )}

            {step === 4 && ( // Medical History
                 <Card>
                    <CardHeader><CardTitle className="text-xl">Medical Questions</CardTitle><CardDescription>Your answers help determine eligibility and are kept confidential.</CardDescription></CardHeader>
                    <CardContent className="space-y-8">
                        <FormField control={form.control} name="hospitalizedLast12Months" render={({ field }) => <FormItem><FormLabel>Have you been hospitalized in the last 12 months?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="hasMajorIllness" render={({ field }) => <FormItem><FormLabel>Have you ever been diagnosed with or treated for heart disease, cancer, stroke, COPD, or kidney failure?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                        {watchHasMajorIllness === "yes" && <FormField control={form.control} name="majorIllnessDetails" render={({ field }) => <FormItem><FormLabel>Please provide details</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>} />}
                        <FormField control={form.control} name="takesPrescriptions" render={({ field }) => <FormItem><FormLabel>Are you currently taking any prescription medications?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                        {watchTakesPrescriptions === "yes" && <FormField control={form.control} name="prescriptionList" render={({ field }) => <FormItem><FormLabel>Please list your prescription drugs and dosages</FormLabel><FormControl><Textarea placeholder="e.g., Lisinopril 20mg, Metformin 500mg" {...field} /></FormControl><FormMessage /></FormItem>} />}
                    </CardContent>
                </Card>
            )}

            {step === 5 && ( // Plan Selection
                <Card>
                    <CardHeader><CardTitle className="text-xl">Plan Selection</CardTitle></CardHeader>
                    <CardContent className="space-y-8">
                        <FormField control={form.control} name="planId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Selected Medicare Supplement Plan</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a plan" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {allAvailablePlans.map(plan => (
                                            <SelectItem key={plan.id} value={plan.id}>{plan.name} - {plan.provider}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <div className="space-y-3">
                             <FormLabel>Request Additional Benefits</FormLabel>
                             <FormDescription>Check any additional coverage you might be interested in.</FormDescription>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="wantsDental" render={({ field }) => <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Dental Coverage</FormLabel></div></FormItem>} />
                                <FormField control={form.control} name="wantsCancer" render={({ field }) => <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Cancer Coverage</FormLabel></div></FormItem>} />
                                <FormField control={form.control} name="wantsLifeInsurance" render={({ field }) => <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Life Insurance</FormLabel></div></FormItem>} />
                                <FormField control={form.control} name="wantsFinancialPlanning" render={({ field }) => <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Financial Planning</FormLabel></div></FormItem>} />
                                <FormField control={form.control} name="wantsDrugPlan" render={({ field }) => <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Prescription Drug Plan (Part D)</FormLabel></div></FormItem>} />
                             </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {step === 6 && ( // Agent Assistance
                <Card>
                    <CardHeader><CardTitle className="text-xl">Agent Assistance</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={form.control} name="wantsAgentContact" render={({ field }) => <FormItem><FormLabel>Would you like a licensed agent to contact you to review your application and answer any questions?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes, please have an agent call me.</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No, I'll proceed on my own.</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                    </CardContent>
                </Card>
            )}

            {step === 7 && ( // Review & Submit
                 <Card>
                    <CardHeader><CardTitle className="text-xl">Review Your Application</CardTitle><CardDescription>Please review all information for accuracy before submitting.</CardDescription></CardHeader>
                    <CardContent className="space-y-8">
                        <ReviewSection title="Personal Information">
                            <ReviewItem label="Full Name" value={`${form.getValues("firstName")} ${form.getValues("lastName")}`} />
                            <ReviewItem label="Date of Birth" value={form.getValues("dob")} />
                            <ReviewItem label="Gender" value={form.getValues("gender")} />
                            <ReviewItem label="Address" value={`${form.getValues("address")}, ${form.getValues("city")}, ${form.getValues("state")} ${form.getValues("zip")}`} />
                            <ReviewItem label="Phone" value={form.getValues("phone")} />
                            <ReviewItem label="Email" value={form.getValues("email")} />
                        </ReviewSection>

                        <ReviewSection title="Medicare Details">
                            <ReviewItem label="Medicare ID (MBI)" value={form.getValues("medicareClaimNumber")} />
                            <ReviewItem label="Part A Date" value={form.getValues("partAEffectiveDate")} />
                            <ReviewItem label="Part B Date" value={form.getValues("partBEffectiveDate")} />
                        </ReviewSection>
                        
                        {/* More review sections could be added here */}

                        <div className="space-y-6 rounded-lg border bg-background/50 p-6">
                            <h4 className="font-headline font-semibold text-lg">Disclosures & Consent</h4>
                            <div className="space-y-2 text-sm text-muted-foreground max-h-32 overflow-y-auto">
                                <p>Medicare Supplement insurance plans are not connected with or endorsed by the U.S. Government or the federal Medicare program.</p>
                                <p>By providing your contact information, you agree to be contacted by phone, email, or text by a licensed insurance agent, including via auto-dialer or pre-recorded message. Consent is not a condition of purchase.</p>
                                <p>We do not offer every plan available in your area. Any information we provide is limited to those plans we do offer in your area. Please contact Medicare.gov or 1-800-MEDICARE to get information on all your options.</p>
                            </div>
                            <FormField control={form.control} name="confirmsAccuracy" render={({ field }) => <FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>I confirm that the information provided is true and accurate to the best of my knowledge.</FormLabel><FormMessage/></div></FormItem>} />
                            <FormField control={form.control} name="agreesToTerms" render={({ field }) => <FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>I have read and agree to the disclaimers and privacy policy.</FormLabel><FormMessage/></div></FormItem>} />
                        </div>
                        
                         <FormField control={form.control} name="signature" render={({ field }) => (
                             <FormItem>
                                 <FormLabel>Digital Signature</FormLabel>
                                 <FormControl><Input placeholder="Type your full name" {...field} /></FormControl>
                                 <FormDescription>By typing your name, you are electronically signing this application.</FormDescription>
                                 <FormMessage />
                             </FormItem>
                         )} />
                    </CardContent>
                </Card>
            )}

            <div className="flex justify-between">
                {step > 1 ? (
                    <Button type="button" variant="outline" onClick={handlePrev}>Back</Button>
                ) : <div />}
                
                <Button type="button" onClick={handleNext} className={step === steps.length ? 'bg-accent hover:bg-accent/90' : ''}>
                    {step === steps.length ? 'Submit Application' : 'Next Step'}
                    <ArrowRight className="ml-2 h-4 w-4"/>
                </Button>
            </div>
        </form>
      </Form>
      </div>
    </div>
  )
}
