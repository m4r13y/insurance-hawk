
"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Sparkles, ArrowRight, Download, Phone, Mail, Terminal, PartyPopper, AlertTriangle, Percent, FileText, BookUser, Rocket, Shield, TrendingUp, Landmark, Users, ClipboardList, Target, FileCheck } from "lucide-react";
import { getRetirementPlan } from "./actions";


// --- Retirement Plan Component --- //

const retirementFormSchema = z.object({
  // General
  greatestConcern: z.string().min(1, "Please select an option."),
  taxFilingStatus: z.enum(["single", "married_jointly", "married_separately", "hoh", "widow"]),
  hasSpouse: z.enum(["yes", "no"]),

  // Spouse Info (conditional)
  spouseFirstName: z.string().optional(),
  spouseLastName: z.string().optional(),

  // Health Insurance
  healthInsuranceCompany: z.string().min(1, "Required"),
  healthInsuranceDeductible: z.coerce.number().min(0),
  healthInsurancePlan: z.string().min(1, "Required"),
  healthInsurancePremium: z.coerce.number().min(0),
  healthInsuranceCopays: z.string().optional(),
  healthInsuranceMaxOutOfPocket: z.coerce.number().min(0),

  // Spouse Health Insurance (conditional)
  spouseHealthInsuranceCompany: z.string().optional(),
  spouseHealthInsuranceDeductible: z.coerce.number().optional(),
  spouseHealthInsurancePlan: z.string().optional(),
  spouseHealthInsurancePremium: z.coerce.number().optional(),
  spouseHealthInsuranceCopays: z.string().optional(),
  spouseHealthInsuranceMaxOutOfPocket: z.coerce.number().optional(),

  // Other Insurance
  otherInsurancePolicies: z.array(z.string()).optional(),
  hasLifeInsurance: z.enum(["yes", "no"]),
  lifeInsuranceType: z.string().optional(),
  beneficiariesUpdated: z.enum(["yes", "no"]).optional(),
  hasLTC: z.enum(["yes", "no"]),
  ltcHasRiders: z.enum(["yes", "no"]).optional(),

  // Investments
  riskTolerance: z.enum(["low", "medium", "high"]),
  assetTypes: z.array(z.string()).optional(),
  assetsHeldAt: z.string().optional(),
  investmentExperience: z.array(z.string()).optional(),

  // Income & Expenses
  hasEmergencyFund: z.enum(["yes", "no"]),
  emergencyFundMonths: z.coerce.number().optional(),
  socialSecurityIncome: z.coerce.number().default(0),
  pensionIncome: z.coerce.number().default(0),
  rmdIncome: z.coerce.number().default(0),
  annuityIncome: z.coerce.number().default(0),
  workIncome: z.coerce.number().default(0),
  rentalIncome: z.coerce.number().default(0),
  totalMonthlyIncome: z.coerce.number(),
  totalMonthlyExpenses: z.coerce.number(),

  // Tax Planning
  takesIraDistributions: z.enum(["yes", "no"]),
  makingRothConversions: z.enum(["yes", "no"]),
  hasTaxFreeBonds: z.enum(["yes", "no"]),
  wantsToLowerTaxes: z.enum(["yes", "no"]),
  isDonating: z.enum(["yes", "no"]),

  // Estate Planning
  hasEstatePlan: z.enum(["yes", "no"]),
  hasHealthCarePOA: z.enum(["yes", "no"]),
  hasLivingWill: z.enum(["yes", "no"]),
  wantsToAvoidProbate: z.enum(["yes", "no"]),
  marriedMoreThanOnce: z.enum(["yes", "no"]),

  // Goals
  wantsFiduciary: z.enum(["yes", "no"]),
  wantsMarketProtection: z.enum(["yes", "no"]),
  concernedAboutOutOfMoney: z.enum(["yes", "no"]),
  otherGoals: z.string().optional(),
  signature: z.string().min(1, "Signature is required."),

}).superRefine((data, ctx) => {
    if (data.hasSpouse === "yes" && !data.spouseFirstName) {
        ctx.addIssue({ code: "custom", message: "Spouse's first name is required.", path: ["spouseFirstName"] });
    }
    if (data.hasLifeInsurance === "yes" && !data.lifeInsuranceType) {
        ctx.addIssue({ code: "custom", message: "Please specify life insurance type.", path: ["lifeInsuranceType"] });
    }
    if (data.hasEmergencyFund === "yes" && (data.emergencyFundMonths === undefined || data.emergencyFundMonths < 0)) {
        ctx.addIssue({ code: "custom", message: "Please specify number of months.", path: ["emergencyFundMonths"] });
    }
});

type FormSchemaType = z.infer<typeof retirementFormSchema>;

const otherInsuranceOptions = [
    { id: 'long_term_care', label: 'Long Term Care' },
    { id: 'dental', label: 'Dental' },
    { id: 'accident', label: 'Accident' },
    { id: 'short_term_care', label: 'Short Term Care' },
    { id: 'cancer', label: 'Cancer' },
    { id: 'heart_attack_stroke', label: 'Heart Attack/Stroke' },
    { id: 'home_health_care', label: 'Home Health Care' }
];

const assetTypeOptions = [
    { id: 'savings', label: 'Savings' }, { id: 'bonds', label: 'Bonds' }, { id: '401k', label: '401k' },
    { id: '401k_roth', label: '401k Roth' }, { id: 'money_market', label: 'Money Market' }, { id: 'real_estate', label: 'Real Estate' },
    { id: 'roth_ira', label: 'Roth IRA' }, { id: 'cds', label: 'CDs' }, { id: 'ira', label: 'IRA' },
    { id: 'mutual_funds', label: 'Mutual Funds' }, { id: 'annuities', label: 'Annuities' }, { id: 'etfs', label: 'ETFs' },
    { id: 'stocks', label: 'Stocks' }
];

const financialConcerns = [
    { id: 'health', label: 'Protecting my health and insuring my assets' },
    { id: 'retirement', label: 'Ensuring I have financial security for tomorrow' },
    { id: 'investments', label: 'Growing my money with confidence' },
    { id: 'estate', label: 'Planning my estate and gifting strategies' },
    { id: 'taxes', label: 'Maximizing my tax reduction techniques' },
    { id: 'planning', label: 'Continuous monitoring of my financial plan' },
];

const steps = [
    { id: 1, name: 'Getting Started', icon: ClipboardList, fields: ['greatestConcern'] as FieldPath<FormSchemaType>[] },
    { id: 2, name: 'Your Picture', icon: Users, fields: ['taxFilingStatus', 'hasSpouse', 'spouseFirstName', 'spouseLastName'] as FieldPath<FormSchemaType>[] },
    { id: 3, name: 'Insurance', icon: Shield, fields: ['healthInsuranceCompany', 'healthInsuranceDeductible', 'healthInsurancePlan', 'healthInsurancePremium', 'healthInsuranceCopays', 'healthInsuranceMaxOutOfPocket', 'spouseHealthInsuranceCompany', 'spouseHealthInsuranceDeductible', 'spouseHealthInsurancePlan', 'spouseHealthInsurancePremium', 'spouseHealthInsuranceCopays', 'spouseHealthInsuranceMaxOutOfPocket', 'otherInsurancePolicies', 'hasLifeInsurance', 'lifeInsuranceType', 'beneficiariesUpdated', 'hasLTC', 'ltcHasRiders'] as FieldPath<FormSchemaType>[] },
    { id: 4, name: 'Assets & Income', icon: TrendingUp, fields: ['riskTolerance', 'assetTypes', 'assetsHeldAt', 'investmentExperience', 'hasEmergencyFund', 'emergencyFundMonths', 'socialSecurityIncome', 'pensionIncome', 'rmdIncome', 'annuityIncome', 'workIncome', 'rentalIncome', 'totalMonthlyIncome', 'totalMonthlyExpenses'] as FieldPath<FormSchemaType>[] },
    { id: 5, name: 'Tax & Estate', icon: Landmark, fields: ['takesIraDistributions', 'makingRothConversions', 'hasTaxFreeBonds', 'wantsToLowerTaxes', 'isDonating', 'hasEstatePlan', 'hasHealthCarePOA', 'hasLivingWill', 'wantsToAvoidProbate', 'marriedMoreThanOnce'] as FieldPath<FormSchemaType>[] },
    { id: 6, name: 'Goals & Consent', icon: Target, fields: ['wantsFiduciary', 'wantsMarketProtection', 'concernedAboutOutOfMoney', 'otherGoals', 'signature'] as FieldPath<FormSchemaType>[] },
    { id: 7, name: 'Review & Submit', icon: FileCheck, fields: [] as FieldPath<FormSchemaType>[] },
];

const sectionIconMap: { [key: string]: React.ElementType } = {
    'Retirement Plan Summary': PartyPopper,
    'Insurance Review': Shield,
    'Investment & Income Strategy': TrendingUp,
    'Tax Planning': Landmark,
    'Estate Planning': FileText,
    'Next Steps': Rocket,
    'Important Disclaimer': AlertTriangle,
};

function PlanResults({ plan, name }: { plan: string, name: string }) {
    const resultsRef = useRef<HTMLDivElement>(null);

    const handleDownload = () => {
        const input = resultsRef.current;
        if (!input) return;

        html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'pt', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;

            const margin = 40;
            const contentWidth = pdfWidth - margin * 2;
            const ratio = contentWidth / canvasWidth;
            const contentHeight = canvasHeight * ratio;
            const pageHeight = pdfHeight - margin * 2;

            let heightLeft = contentHeight;
            let position = margin;

            pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
                position = margin - heightLeft;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentHeight);
                heightLeft -= pageHeight;
            }
            
            pdf.save(`${name.replace(' ', '_')}_RetirementPlan.pdf`);
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Card>
                <CardHeader className="text-center p-8 sm:p-12">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
                        <PartyPopper className="h-10 w-10" />
                    </div>
                    <CardTitle className="font-headline text-3xl sm:text-4xl pt-6">Your Retirement Plan is Ready!</CardTitle>
                    <CardDescription className="text-lg">Here is your personalized plan, {name}.</CardDescription>
                </CardHeader>
                <CardContent ref={resultsRef} className="px-6 sm:px-12 py-10 bg-card">
                    <div className="prose lg:prose-xl max-w-none text-card-foreground">
                        {plan.split('\n').map((line, index) => {
                            const trimmedLine = line.trim();
                             if (trimmedLine.startsWith('## ')) {
                                const title = trimmedLine.substring(3).trim();
                                const IconComponent = sectionIconMap[title];
                                return (
                                    <h2 key={index} className="font-headline text-2xl font-semibold mt-8 mb-4 flex items-center gap-3 border-b pb-2">
                                        {IconComponent && <IconComponent className="h-7 w-7 text-primary" />}
                                        <span>{title}</span>
                                    </h2>
                                );
                            }
                             if (trimmedLine.startsWith('### ')) {
                                return <h3 key={index} className="font-headline text-xl font-semibold mt-6 mb-2">{trimmedLine.substring(4)}</h3>;
                            }
                            if (trimmedLine.startsWith('* ')) {
                                return <li key={index} className="ml-6 list-disc">{trimmedLine.substring(2)}</li>;
                            }
                            if (trimmedLine.includes('**Important Disclaimer:**')) {
                                const disclaimerText = trimmedLine.replace('**Important Disclaimer:**', '').trim();
                                return (
                                    <div key={index} className="mt-8 p-4 rounded-lg border border-amber-300 bg-amber-50/50 text-amber-800">
                                        <div className="flex items-center gap-3">
                                            <AlertTriangle className="h-5 w-5 shrink-0" />
                                            <span className="font-semibold text-base">Important Disclaimer</span>
                                        </div>
                                        {disclaimerText && <p className="mt-2 text-sm">{disclaimerText}</p>}
                                    </div>
                                );
                            }
                            if (trimmedLine === '') {
                                return null;
                            }
                            return <p key={index} className="text-muted-foreground">{trimmedLine}</p>;
                        })}
                    </div>
                </CardContent>
                 <CardFooter className="flex-col gap-8 bg-muted/50 p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                        <Button onClick={handleDownload} className="w-full" size="lg">
                            <Download className="mr-2 h-4 w-4" />
                            Download as PDF
                        </Button>
                         <Button onClick={() => window.print()} variant="outline" className="w-full" size="lg">Print Plan</Button>
                    </div>
                    <div className="text-center">
                        <h4 className="font-semibold text-lg">Ready to take the next step?</h4>
                        <p className="text-muted-foreground text-base mt-1">Contact your fiduciary advisor to put your plan into action.</p>
                        <div className="flex justify-center gap-6 mt-4">
                            <Button variant="ghost"><Phone className="mr-2 h-4 w-4"/> Call Us</Button>
                            <Button variant="ghost"><Mail className="mr-2 h-4 w-4"/> Email Us</Button>
                        </div>
                    </div>
                 </CardFooter>
            </Card>
        </div>
    )
}

function ReviewSection({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="mb-6">
            <h4 className="font-headline text-lg font-semibold border-b pb-2 mb-3">{title}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">{children}</div>
        </div>
    )
}

function ReviewItem({ label, value }: { label: string, value: any }) {
    const displayValue = Array.isArray(value) ? value.join(', ') : String(value);
    return (
        <>
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium">{displayValue || 'N/A'}</dd>
        </>
    )
}

function RetirementPlanForm() {
    const [step, setStep] = useState(0);
    const [isPending, startTransition] = useTransition();
    const [planResult, setPlanResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [userName, setUserName] = useState("Guest");

    useEffect(() => {
        const name = localStorage.getItem("userFirstName");
        if (name) setUserName(name);
    }, []);

    const form = useForm<FormSchemaType>({
        resolver: zodResolver(retirementFormSchema),
        defaultValues: {
            greatestConcern: "", taxFilingStatus: "single", hasSpouse: "no",
            spouseFirstName: "", spouseLastName: "", healthInsuranceCompany: "",
            healthInsuranceDeductible: 0, healthInsurancePlan: "", healthInsurancePremium: 0,
            healthInsuranceCopays: "", healthInsuranceMaxOutOfPocket: 0,
            otherInsurancePolicies: [], hasLifeInsurance: "no", lifeInsuranceType: "",
            beneficiariesUpdated: "no", hasLTC: "no", ltcHasRiders: "no", riskTolerance: "medium",
            assetTypes: [], assetsHeldAt: "", investmentExperience: [], hasEmergencyFund: "no",
            socialSecurityIncome: 0, pensionIncome: 0, rmdIncome: 0, annuityIncome: 0,
            workIncome: 0, rentalIncome: 0, totalMonthlyIncome: 0, totalMonthlyExpenses: 0,
            takesIraDistributions: "no", makingRothConversions: "no", hasTaxFreeBonds: "no",
            wantsToLowerTaxes: "no", isDonating: "no", hasEstatePlan: "no", hasHealthCarePOA: "no",
            hasLivingWill: "no", wantsToAvoidProbate: "no", marriedMoreThanOnce: "no",
            wantsFiduciary: "no", wantsMarketProtection: "no", concernedAboutOutOfMoney: "no",
            otherGoals: "", signature: "",
        },
    })
    
    const { watch, setValue } = form;
    const watchTaxStatus = watch("taxFilingStatus");

    useEffect(() => {
        if (watchTaxStatus === "married_jointly" || watchTaxStatus === "married_separately") {
            setValue("hasSpouse", "yes");
        }
    }, [watchTaxStatus, setValue]);

    const watchHasSpouse = form.watch("hasSpouse");
    const watchHasLifeInsurance = form.watch("hasLifeInsurance");
    const watchHasLTC = form.watch("hasLTC");
    const watchHasEmergencyFund = form.watch("hasEmergencyFund");

    const incomeSources = watch([
        "socialSecurityIncome", "pensionIncome", "rmdIncome", 
        "annuityIncome", "workIncome", "rentalIncome"
    ]);

    useEffect(() => {
        const total = incomeSources.reduce((sum, current) => sum + (Number(current) || 0), 0);
        setValue("totalMonthlyIncome", total);
    }, [incomeSources, setValue]);
    
    async function onSubmit(values: FormSchemaType) {
        setError(null);
        setPlanResult(null);
        startTransition(async () => {
            const { greatestConcern, taxFilingStatus, hasSpouse, healthInsurancePremium, healthInsuranceMaxOutOfPocket, hasLifeInsurance, hasLTC, riskTolerance, hasEmergencyFund, totalMonthlyIncome, totalMonthlyExpenses, wantsMarketProtection, concernedAboutOutOfMoney, hasEstatePlan, otherGoals } = values;
            const result = await getRetirementPlan({ greatestConcern, taxFilingStatus, hasSpouse, healthInsurancePremium, healthInsuranceMaxOutOfPocket, hasLifeInsurance, hasLTC, riskTolerance, hasEmergencyFund, totalMonthlyIncome, totalMonthlyExpenses, wantsMarketProtection, concernedAboutOutOfMoney, hasEstatePlan, otherGoals });
            if (result.error) {
                setError(result.error);
            }
            if (result.plan) {
                setPlanResult(result.plan);
            }
        });
    }

    const handleNext = async () => {
        const currentStep = steps[step - 1];
        const fields = currentStep.fields;
        const output = await form.trigger(fields, { shouldFocus: true });
        if (!output) return;
        if (step === 6) { setStep(7); return; }
        if (step < steps.length) { setStep(step + 1); } 
        else { await form.handleSubmit(onSubmit)(); }
    }

    const handlePrev = () => { if (step > 1) { setStep(step - 1); } }

    if (isPending) {
        return (
            <div className="flex flex-col items-center justify-center text-center h-full max-w-lg mx-auto">
                <Card className="w-full">
                    <CardHeader>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                             <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                        <CardTitle className="font-headline text-3xl pt-4">Generating Your Plan</CardTitle>
                        <CardDescription className="text-lg">Our AI is crafting your personalized retirement plan. This may take a moment.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    if (error) {
         return (
            <div className="flex flex-col items-center justify-center text-center h-full max-w-lg mx-auto">
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>An Error Occurred</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button onClick={() => setError(null)} variant="outline" className="mt-4">Try Again</Button>
            </div>
         )
    }

    if (planResult) {
        return <PlanResults plan={planResult} name={userName} />
    }

    if (step === 0) {
        return (
             <div className="flex flex-col items-center justify-center text-center h-full max-w-lg mx-auto">
                <Card className="w-full">
                    <CardHeader>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                             <Sparkles className="h-8 w-8" />
                        </div>
                        <CardTitle className="font-headline text-2xl sm:text-3xl pt-4">Your Personalized Retirement Plan</CardTitle>
                        <CardDescription className="text-lg">Let's build a secure future together.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-base text-muted-foreground">This confidential questionnaire helps us understand your goals to build a custom plan. The process should take about 10-15 minutes. Your information is kept strictly private and secure.</p>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" size="lg" onClick={() => setStep(1)}>
                            Get Started <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>
             </div>
        )
    }
  
  const CurrentStepIcon = steps[step - 1]?.icon;
  const totalFormSteps = steps.length - 1;
  const progressPercentage = step > totalFormSteps ? 100 : Math.round(((step-1) / totalFormSteps) * 100);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
       <div className="space-y-4">
        <div className="space-y-3">
            <Progress value={progressPercentage} />
            <div className="flex justify-between text-sm text-muted-foreground">
                <p>
                  {step > totalFormSteps
                    ? <strong>{steps[step - 1].name}</strong>
                    : <>Step {step} of {totalFormSteps}: <strong>{steps[step - 1].name}</strong></>
                  }
                </p>
                <p>{progressPercentage}% Complete</p>
            </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        {CurrentStepIcon && <CurrentStepIcon className="h-8 w-8 text-primary"/>}
                        <CardTitle className="font-headline text-xl md:text-2xl">{steps[step - 1].name}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                  {step === 1 && ( // Getting Started
                      <div className="space-y-8">
                          <FormField
                              control={form.control}
                              name="greatestConcern"
                              render={({ field }) => (
                                  <FormItem className="space-y-4">
                                      <FormLabel className="text-lg font-semibold">To start, which of the following best describes your greatest financial concern?</FormLabel>
                                      <FormDescription>This helps us understand what's most important to you right now.</FormDescription>
                                      <FormControl>
                                          <RadioGroup
                                              onValueChange={field.onChange}
                                              defaultValue={field.value}
                                              className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"
                                          >
                                              {financialConcerns.map((concern) => (
                                                  <FormItem key={concern.id} className="flex items-center space-x-3 space-y-0 rounded-lg border bg-background hover:bg-secondary/50 p-4 transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10">
                                                      <FormControl>
                                                          <RadioGroupItem value={concern.label} />
                                                      </FormControl>
                                                      <FormLabel className="font-normal w-full cursor-pointer !mt-0">
                                                          {concern.label}
                                                      </FormLabel>
                                                  </FormItem>
                                              ))}
                                          </RadioGroup>
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />
                      </div>
                  )}
                  
                  {step === 2 && ( // Your Picture
                      <div className="space-y-8">
                          <FormField control={form.control} name="taxFilingStatus" render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Tax Filing Status</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                      <SelectContent>
                                          <SelectItem value="single">Single</SelectItem>
                                          <SelectItem value="married_jointly">Married Filing Jointly</SelectItem>
                                          <SelectItem value="married_separately">Married Filing Separately</SelectItem>
                                          <SelectItem value="hoh">Head of Household</SelectItem>
                                          <SelectItem value="widow">Qualifying Widow(er)</SelectItem>
                                      </SelectContent>
                                  </Select>
                                  <FormMessage />
                              </FormItem>
                          )} />
                          <FormField control={form.control} name="hasSpouse" render={({ field }) => <FormItem><FormLabel>Do you have a spouse?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                          {watchHasSpouse === 'yes' && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 border rounded-md">
                                  <FormField control={form.control} name="spouseFirstName" render={({ field }) => <FormItem><FormLabel>Spouse's First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                                  <FormField control={form.control} name="spouseLastName" render={({ field }) => <FormItem><FormLabel>Spouse's Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                              </div>
                          )}
                      </div>
                  )}

                  {step === 3 && ( // Insurance
                      <div className="space-y-10">
                          <div>
                              <h4 className="font-semibold mb-4 text-lg">Your Health Insurance</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                  <FormField control={form.control} name="healthInsuranceCompany" render={({ field }) => <FormItem><FormLabel>Company</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                                  <FormField control={form.control} name="healthInsurancePlan" render={({ field }) => <FormItem><FormLabel>Plan</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                                  <FormField control={form.control} name="healthInsurancePremium" render={({ field }) => <FormItem><FormLabel>Premium ($)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
                                  <FormField control={form.control} name="healthInsuranceDeductible" render={({ field }) => <FormItem><FormLabel>Deductible ($)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
                                  <FormField control={form.control} name="healthInsuranceCopays" render={({ field }) => <FormItem><FormLabel>Copays</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                                  <FormField control={form.control} name="healthInsuranceMaxOutOfPocket" render={({ field }) => <FormItem><FormLabel>Max Out-of-Pocket ($)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
                              </div>
                          </div>
                          {watchHasSpouse === 'yes' && (
                              <div>
                                  <h4 className="font-semibold mb-4 text-lg">Spouse's Health Insurance</h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                      <FormField control={form.control} name="spouseHealthInsuranceCompany" render={({ field }) => <FormItem><FormLabel>Company</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                                      <FormField control={form.control} name="spouseHealthInsurancePlan" render={({ field }) => <FormItem><FormLabel>Plan</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                                      <FormField control={form.control} name="spouseHealthInsurancePremium" render={({ field }) => <FormItem><FormLabel>Premium ($)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
                                      <FormField control={form.control} name="spouseHealthInsuranceDeductible" render={({ field }) => <FormItem><FormLabel>Deductible ($)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
                                      <FormField control={form.control} name="spouseHealthInsuranceCopays" render={({ field }) => <FormItem><FormLabel>Copays</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                                      <FormField control={form.control} name="spouseHealthInsuranceMaxOutOfPocket" render={({ field }) => <FormItem><FormLabel>Max Out-of-Pocket ($)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
                                  </div>
                              </div>
                          )}
                          <FormField control={form.control} name="otherInsurancePolicies" render={() => (
                              <FormItem>
                                  <FormLabel className="text-lg">Do you have any of the following insurance policies?</FormLabel>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                                      {otherInsuranceOptions.map((item) => (
                                          <FormField key={item.id} control={form.control} name="otherInsurancePolicies" render={({ field }) => (
                                              <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                                  <FormControl>
                                                      <Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => {
                                                          return checked ? field.onChange([...(field.value || []), item.id]) : field.onChange(field.value?.filter((value) => value !== item.id))
                                                      }} />
                                                  </FormControl>
                                                  <FormLabel className="font-normal">{item.label}</FormLabel>
                                              </FormItem>
                                          )} />
                                      ))}
                                  </div>
                                  <FormMessage />
                              </FormItem>
                          )}/>
                          <FormField control={form.control} name="hasLifeInsurance" render={({ field }) => <FormItem><FormLabel>Do you have life insurance?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                          {watchHasLifeInsurance === 'yes' && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-md">
                                  <FormField control={form.control} name="lifeInsuranceType" render={({ field }) => <FormItem><FormLabel>Type of Life Insurance</FormLabel><FormControl><Input placeholder="e.g., Term, Whole, Universal" {...field} /></FormControl><FormMessage /></FormItem>} />
                                  <FormField control={form.control} name="beneficiariesUpdated" render={({ field }) => <FormItem><FormLabel>Have beneficiaries been updated in the last 5 years?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                              </div>
                          )}
                          <FormField control={form.control} name="hasLTC" render={({ field }) => <FormItem><FormLabel>Do you have Long Term Care (LTC) insurance?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                          {watchHasLTC === 'yes' && (
                              <FormField control={form.control} name="ltcHasRiders" render={({ field }) => <FormItem><FormLabel>Does your LTC policy have riders (e.g., inflation protection)?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                          )}
                      </div>
                  )}

                  {step === 4 && ( // Assets & Income
                      <div className="space-y-8">
                          <FormField control={form.control} name="riskTolerance" render={({ field }) => (
                              <FormItem>
                                  <FormLabel>What is your investment risk tolerance?</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                      <SelectContent>
                                          <SelectItem value="low">Low (Conservative)</SelectItem>
                                          <SelectItem value="medium">Medium (Moderate)</SelectItem>
                                          <SelectItem value="high">High (Aggressive)</SelectItem>
                                      </SelectContent>
                                  </Select>
                                  <FormMessage />
                              </FormItem>
                          )} />
                          <FormField control={form.control} name="assetTypes" render={() => (
                              <FormItem>
                                  <FormLabel>Where is your money currently?</FormLabel>
                                  <FormDescription>Select all that apply.</FormDescription>
                                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
                                      {assetTypeOptions.map((item) => (
                                          <FormField key={item.id} control={form.control} name="assetTypes" render={({ field }) => (
                                              <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                                  <FormControl>
                                                      <Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => {
                                                          return checked ? field.onChange([...(field.value || []), item.id]) : field.onChange(field.value?.filter((value) => value !== item.id))
                                                      }} />
                                                  </FormControl>
                                                  <FormLabel className="font-normal">{item.label}</FormLabel>
                                              </FormItem>
                                          )} />
                                      ))}
                                  </div>
                                  <FormMessage />
                              </FormItem>
                          )}/>
                          <FormField control={form.control} name="assetsHeldAt" render={({ field }) => <FormItem><FormLabel>Where are your assets held?</FormLabel><FormControl><Textarea placeholder="e.g., Fidelity, Vanguard, Local Bank..." {...field} /></FormControl><FormMessage /></FormItem>} />
                          <FormField control={form.control} name="investmentExperience" render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Have you experienced any of the following with your money?</FormLabel>
                                  <div className="flex flex-col space-y-2 pt-2">
                                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                          <FormControl><Checkbox checked={field.value?.includes('loss')} onCheckedChange={(checked) => { return checked ? field.onChange([...(field.value || []), 'loss']) : field.onChange(field.value?.filter((v) => v !== 'loss'))}} /></FormControl>
                                          <FormLabel className="font-normal">Loss or instability</FormLabel>
                                      </FormItem>
                                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                          <FormControl><Checkbox checked={field.value?.includes('no_growth')} onCheckedChange={(checked) => { return checked ? field.onChange([...(field.value || []), 'no_growth']) : field.onChange(field.value?.filter((v) => v !== 'no_growth'))}} /></FormControl>
                                          <FormLabel className="font-normal">Lack of growth</FormLabel>
                                      </FormItem>
                                  </div>
                                  <FormMessage />
                              </FormItem>
                          )} />
                          <FormField control={form.control} name="hasEmergencyFund" render={({ field }) => <FormItem><FormLabel>Do you have an emergency fund?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                          {watchHasEmergencyFund === 'yes' && (
                              <FormField control={form.control} name="emergencyFundMonths" render={({ field }) => <FormItem><FormLabel>How many months of expenses does it cover?</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
                          )}
                          <div>
                              <h4 className="font-semibold mb-4 text-lg">Monthly Income Sources ($)</h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                  <FormField control={form.control} name="socialSecurityIncome" render={({ field }) => <FormItem><FormLabel>Social Security</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
                                  <FormField control={form.control} name="pensionIncome" render={({ field }) => <FormItem><FormLabel>Pensions</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
                                  <FormField control={form.control} name="rmdIncome" render={({ field }) => <FormItem><FormLabel>RMDs</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
                                  <FormField control={form.control} name="annuityIncome" render={({ field }) => <FormItem><FormLabel>Annuity Payments</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
                                  <FormField control={form.control} name="workIncome" render={({ field }) => <FormItem><FormLabel>Full-time Work</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
                                  <FormField control={form.control} name="rentalIncome" render={({ field }) => <FormItem><FormLabel>Rental Income</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
                              </div>
                          </div>
                            <div>
                              <h4 className="font-semibold mb-4 text-lg">Monthly Totals ($)</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                  <FormField control={form.control} name="totalMonthlyIncome" render={({ field }) => <FormItem><FormLabel>Total Income</FormLabel><FormControl><Input type="number" {...field} readOnly className="bg-muted" /></FormControl><FormMessage /></FormItem>} />
                                  <FormField control={form.control} name="totalMonthlyExpenses" render={({ field }) => <FormItem><FormLabel>Total Expenses</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
                              </div>
                            </div>
                      </div>
                  )}

                  {step === 5 && ( // Tax & Estate
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12">
                          <div className="space-y-8">
                              <h4 className="font-semibold text-lg">Tax Planning</h4>
                              <FormField control={form.control} name="takesIraDistributions" render={({ field }) => <FormItem><FormLabel>Are you taking IRA distributions?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                              <FormField control={form.control} name="makingRothConversions" render={({ field }) => <FormItem><FormLabel>Are you making Roth conversions?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                              <FormField control={form.control} name="hasTaxFreeBonds" render={({ field }) => <FormItem><FormLabel>Do you have tax-free mutual bonds?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                              <FormField control={form.control} name="wantsToLowerTaxes" render={({ field }) => <FormItem><FormLabel>Would you like to lower your taxes every year?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                              <FormField control={form.control} name="isDonating" render={({ field }) => <FormItem><FormLabel>Are you donating anything?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                          </div>
                          <div className="space-y-8">
                              <h4 className="font-semibold text-lg">Estate Planning</h4>
                              <FormField control={form.control} name="hasEstatePlan" render={({ field }) => <FormItem><FormLabel>Do you have an estate plan in place?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                              <FormField control={form.control} name="hasHealthCarePOA" render={({ field }) => <FormItem><FormLabel>Do you have a Power of Attorney for health care?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                              <FormField control={form.control} name="hasLivingWill" render={({ field }) => <FormItem><FormLabel>Do you have a living will for advanced medical directives?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                              <FormField control={form.control} name="wantsToAvoidProbate" render={({ field }) => <FormItem><FormLabel>Are you wanting to go through or avoid probate?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Avoid</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">Go Through / Unsure</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                              <FormField control={form.control} name="marriedMoreThanOnce" render={({ field }) => <FormItem><FormLabel>Have you been married more than once?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                          </div>
                      </div>
                  )}

                  {step === 6 && ( // Goals & Consent
                      <div className="space-y-8">
                          <FormField control={form.control} name="wantsFiduciary" render={({ field }) => <FormItem><FormLabel>Would it be valuable for you to work with a fiduciary?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                          <FormField control={form.control} name="wantsMarketProtection" render={({ field }) => <FormItem><FormLabel>Do you want to know how to protect yourself from loss in the markets and still grow money?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                          <FormField control={form.control} name="concernedAboutOutOfMoney" render={({ field }) => <FormItem><FormLabel>Are you concerned about running out of money?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>} />
                          <FormField control={form.control} name="otherGoals" render={({ field }) => <FormItem><FormLabel>Do you have any other financial goals?</FormLabel><FormControl><Textarea placeholder="e.g., Leave an inheritance, travel, purchase a home..." {...field} /></FormControl><FormMessage /></FormItem>} />
                          <FormField control={form.control} name="signature" render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Digital Signature</FormLabel>
                                  <FormControl><Input placeholder="Type your full name" {...field} /></FormControl>
                                  <FormDescription>By typing your name, you are electronically signing this document.</FormDescription>
                                  <FormMessage />
                              </FormItem>
                          )} />
                      </div>
                  )}
                  
                  {step === 7 && ( // Review
                      <div className="space-y-6">
                          <ReviewSection title="General">
                              <ReviewItem label="Greatest Financial Concern" value={form.getValues("greatestConcern")} />
                              <ReviewItem label="Tax Filing Status" value={form.getValues("taxFilingStatus")} />
                              <ReviewItem label="Has a Spouse" value={form.getValues("hasSpouse")} />
                              {form.getValues("hasSpouse") === 'yes' && <ReviewItem label="Spouse Name" value={`${form.getValues("spouseFirstName")} ${form.getValues("spouseLastName")}`} />}
                          </ReviewSection>
                          <ReviewSection title="Insurance">
                              <ReviewItem label="Other Policies" value={form.getValues("otherInsurancePolicies")} />
                              <ReviewItem label="Has Life Insurance" value={form.getValues("hasLifeInsurance")} />
                              <ReviewItem label="Has LTC" value={form.getValues("hasLTC")} />
                          </ReviewSection>
                          <ReviewSection title="Investments & Assets">
                              <ReviewItem label="Risk Tolerance" value={form.getValues("riskTolerance")} />
                              <ReviewItem label="Asset Types" value={form.getValues("assetTypes")} />
                          </ReviewSection>
                          <ReviewSection title="Goals">
                              <ReviewItem label="Wants Fiduciary" value={form.getValues("wantsFiduciary")} />
                              <ReviewItem label="Concerned about market loss" value={form.getValues("wantsMarketProtection")} />
                              <ReviewItem label="Concerned about running out of money" value={form.getValues("concernedAboutOutOfMoney")} />
                          </ReviewSection>
                      </div>
                  )}
                </CardContent>
            </Card>

            <div className="flex justify-between">
                {step > 1 ? (
                    <Button type="button" variant="outline" onClick={handlePrev}>Back</Button>
                ) : <div />}
                
                {step < 7 ? (
                    <Button type="button" onClick={handleNext}>
                        {step === 6 ? 'Review' : 'Next Step'}
                        <ArrowRight className="ml-2 h-4 w-4"/>
                    </Button>
                ) : (
                    <Button type="button" onClick={form.handleSubmit(onSubmit)} className="bg-primary hover:bg-primary/90">
                        Generate My Plan
                        <Sparkles className="ml-2 h-4 w-4"/>
                    </Button>
                )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

// --- Main Page Component --- //
export default function RetirementPlanPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Retirement Plan</h1>
        <p className="text-base text-muted-foreground mt-1">
          Use our AI tool to create a personalized retirement strategy.
        </p>
      </div>
      <RetirementPlanForm />
    </div>
  );
}
