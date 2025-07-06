
"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ArrowRight, ArrowLeft, ShieldCheck, Users, Wallet, MapPin, Cake, ShieldQuestion, Briefcase, Star, Search, Pill, PlusCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "./ui/label";
import type { HealthPlan } from "@/types";

// Mock data
const mockHealthPlans: HealthPlan[] = [
    { id: 'hplan-1', name: 'Silver Enhanced 2500', provider: 'Blue Cross', isBestMatch: true, premium: 450, taxCredit: 200, deductible: 2500, outOfPocketMax: 8000, network: 'PPO', rating: 4, features: { doctors: '10,000+', drugs: 'Tier 1 & 2 Covered' } },
    { id: 'hplan-2', name: 'Bronze Secure HMO', provider: 'HealthNet', isBestMatch: true, premium: 320, taxCredit: 200, deductible: 6000, outOfPocketMax: 9000, network: 'HMO', rating: 3, features: { doctors: '5,000+', drugs: 'Tier 1 Covered' } },
    { id: 'hplan-3', name: 'Gold Premier PPO', provider: 'UnitedHealthcare', isBestMatch: false, premium: 600, taxCredit: 200, deductible: 1000, outOfPocketMax: 6500, network: 'PPO', rating: 5, features: { doctors: '12,000+', drugs: 'Tier 1, 2 & 3 Covered' } },
];

const formSchema = z.object({
    householdSize: z.coerce.number().min(1, "Household must have at least one person.").max(10, "Please contact us for households larger than 10."),
    householdIncome: z.coerce.number().min(0, "Income must be a positive number."),
    zipCode: z.string().length(5, "Enter a valid 5-digit ZIP code."),
    members: z.array(z.object({ age: z.coerce.number().min(0,"Please enter a valid age.").max(120, "Please enter a valid age.") })).min(1),
    hasInsurance: z.enum(["yes", "no"], {required_error: "Please select an option."}),
    hadUnemployment: z.enum(["yes", "no"], {required_error: "Please select an option."}),
});

type FormSchemaType = z.infer<typeof formSchema>;

const steps = [
    { id: 1, name: "Household Size", field: "householdSize", icon: Users },
    { id: 2, name: "Ages", field: "members", icon: Cake },
    { id: 3, name: "Location", field: "zipCode", icon: MapPin },
    { id: 4, name: "Household Income", field: "householdIncome", icon: Wallet },
    { id: 5, name: "Current Coverage", field: "hasInsurance", icon: ShieldQuestion },
    { id: 6, name: "Unemployment", field: "hadUnemployment", icon: Briefcase },
];

const HealthPlanCard = ({ plan }: { plan: HealthPlan }) => (
    <Card className="w-full">
        <CardHeader>
            {plan.isBestMatch && <Badge className="w-fit bg-accent text-accent-foreground mb-2">Best Match</Badge>}
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.provider}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex justify-between items-baseline border-b pb-4">
                <div>
                    <p className="text-3xl font-bold">${(plan.premium - plan.taxCredit).toFixed(2)}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                    <p className="text-sm text-muted-foreground">After estimated ${plan.taxCredit} tax credit</p>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="font-bold">{plan.rating}</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                <div><p className="text-muted-foreground">Deductible</p><p className="font-medium">${plan.deductible}</p></div>
                <div><p className="text-muted-foreground">Max Out-of-Pocket</p><p className="font-medium">${plan.outOfPocketMax}</p></div>
                <div><p className="text-muted-foreground">Network</p><p className="font-medium">{plan.network}</p></div>
                <div><p className="text-muted-foreground">Doctors</p><p className="font-medium">{plan.features.doctors}</p></div>
            </div>
            <Accordion type="single" collapsible className="w-full mt-4">
                <AccordionItem value="item-1">
                    <AccordionTrigger>More Details</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                        <div className="space-y-2">
                             <h4 className="font-semibold">What's Covered?</h4>
                             <ul className="list-disc list-inside text-muted-foreground text-xs">
                                <li>Preventive care, check-ups, and immunizations</li>
                                <li>Emergency services and hospitalization</li>
                                <li>Prescription drugs (details below)</li>
                             </ul>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                             <h4 className="font-semibold">Find a Doctor</h4>
                             <div className="flex gap-2">
                                <Input placeholder="Search for a doctor or specialist" />
                                <Button size="icon" variant="outline"><Search className="h-4 w-4"/></Button>
                             </div>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                             <h4 className="font-semibold">Check Medications</h4>
                             <div className="flex gap-2">
                                <Input placeholder="Search for your prescription drug" />
                                <Button size="icon" variant="outline"><Pill className="h-4 w-4"/></Button>
                             </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </CardContent>
        <CardFooter>
            <Button className="w-full">Select Plan</Button>
        </CardFooter>
    </Card>
);

export function HealthInsuranceQuoter() {
    const [step, setStep] = useState(1);
    const [isPending, startTransition] = useTransition();
    const [results, setResults] = useState<HealthPlan[] | null>(null);

    const form = useForm<FormSchemaType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            householdSize: 1,
            householdIncome: 50000,
            zipCode: "",
            members: [{ age: 30 }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "members",
    });

    const watchHouseholdSize = form.watch("householdSize");

    useEffect(() => {
        const size = watchHouseholdSize || 1;
        const currentCount = fields.length;
        if (size > currentCount) {
            for (let i = 0; i < size - currentCount; i++) {
                append({ age: 0 });
            }
        } else if (size < currentCount) {
             for (let i = currentCount - 1; i >= size; i--) {
                remove(i);
            }
        }
    }, [watchHouseholdSize, fields.length, append, remove]);


    function onSubmit(values: FormSchemaType) {
        startTransition(() => {
            // Mock API call
            setTimeout(() => {
                setResults(mockHealthPlans);
            }, 1500);
        });
    }
    
    const handleNext = async () => {
        const currentStepInfo = steps[step - 1];
        // @ts-ignore
        const output = await form.trigger(currentStepInfo.field, { shouldFocus: true });
        if (!output) return;
        
        if (step < steps.length) {
            setStep(step + 1);
        } else {
           form.handleSubmit(onSubmit)();
        }
    }

    const handlePrev = () => { if (step > 1) setStep(step - 1); }
    
    if(isPending) {
        return (
             <Card className="flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                <h3 className="mt-4 font-headline text-xl font-semibold">Finding the best plans for you...</h3>
                <p className="mt-2 text-muted-foreground">This will just take a moment.</p>
            </Card>
        )
    }
    
    if(results) {
        return (
            <div className="space-y-8">
                <div>
                     <h2 className="font-headline text-3xl font-bold">Your Health Plan Results</h2>
                     <p className="text-muted-foreground">We found {results.length} plans that match your needs. Here are the top matches.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map(plan => <HealthPlanCard key={plan.id} plan={plan}/>)}
                </div>
                <Card className="bg-secondary/50">
                    <CardHeader>
                        <CardTitle>Complete Your Coverage</CardTitle>
                        <CardDescription>Don't leave gaps in your protection. Add these affordable plans to your cart.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-md border bg-background p-4">
                            <h4 className="font-semibold">Dental Insurance</h4>
                            <Button>Add to Cart <PlusCircle className="ml-2 h-4 w-4"/></Button>
                        </div>
                        <div className="flex items-center justify-between rounded-md border bg-background p-4">
                            <h4 className="font-semibold">Cancer & Critical Illness</h4>
                             <Button>Add to Cart <PlusCircle className="ml-2 h-4 w-4"/></Button>
                        </div>
                        <div className="flex items-center justify-between rounded-md border bg-background p-4">
                            <h4 className="font-semibold">Life Insurance</h4>
                             <Button>Add to Cart <PlusCircle className="ml-2 h-4 w-4"/></Button>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <p className="text-xs text-muted-foreground">An agent will contact you to finalize these additional coverages.</p>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    const currentStepInfo = steps[step - 1];
    const CurrentStepIcon = currentStepInfo.icon;

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <Progress value={(step / steps.length) * 100} className="mb-4"/>
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                        <CurrentStepIcon className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle className="font-headline text-xl">Step {step}: {currentStepInfo.name}</CardTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="min-h-[200px]">
                <Form {...form}>
                    <form className="space-y-8">
                        {step === 1 && (
                            <FormField control={form.control} name="householdSize" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-lg">How many people are in your household (including yourself)?</FormLabel>
                                    <FormControl><Input type="number" {...field} min={1} max={10} className="max-w-xs"/></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        )}
                        {step === 2 && (
                            <div className="space-y-4">
                                <Label className="text-lg font-medium">What are the ages of each person needing coverage?</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {fields.map((item, index) => (
                                     <FormField key={item.id} control={form.control} name={`members.${index}.age`} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Person {index + 1} Age</FormLabel>
                                            <FormControl><Input type="number" {...field} placeholder="e.g. 42" className="max-w-xs"/></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                ))}
                                </div>
                            </div>
                        )}
                        {step === 3 && (
                             <FormField control={form.control} name="zipCode" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-lg">What's your ZIP code?</FormLabel>
                                    <FormDescription>Your location determines which plans are available.</FormDescription>
                                    <FormControl><Input {...field} className="max-w-xs"/></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        )}
                         {step === 4 && (
                             <FormField control={form.control} name="householdIncome" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-lg">What's your estimated household income for this year?</FormLabel>
                                    <FormDescription>This helps us calculate your potential tax credits.</FormDescription>
                                    <FormControl>
                                        <div className="relative max-w-xs">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                                            <Input type="number" {...field} className="pl-7"/>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        )}
                        {step === 5 && (
                             <FormField control={form.control} name="hasInsurance" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-lg">Do you currently have health insurance?</FormLabel>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4">
                                            <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        )}
                         {step === 6 && (
                             <FormField control={form.control} name="hadUnemployment" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-lg">Have you received unemployment income at any time this year?</FormLabel>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4">
                                            <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        )}
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-4">
                 <div className="flex justify-between">
                    {step > 1 ? (
                        <Button type="button" variant="outline" onClick={handlePrev}><ArrowLeft className="mr-2 h-4 w-4"/> Back</Button>
                    ) : <div/>}
                    <Button type="button" onClick={handleNext}>
                        {step === steps.length ? 'See My Plans' : 'Next'}
                        <ArrowRight className="ml-2 h-4 w-4"/>
                    </Button>
                </div>
                 <div className="flex items-center gap-2 pt-4 text-xs text-muted-foreground">
                    <ShieldCheck className="h-4 w-4" />
                    <span>No spam. This info only finds you real plans & real savings.</span>
                </div>
            </CardFooter>
        </Card>
    );
}
