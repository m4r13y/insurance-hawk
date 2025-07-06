
"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm, useFieldArray, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ArrowRight, ArrowLeft, ShieldCheck, Users, Wallet, MapPin, Cake, ShieldQuestion, Briefcase, Star, Search, Pill, PlusCircle, Info, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Label } from "./ui/label";
import type { HealthPlan } from "@/types";
import { getHealthQuotes } from "@/app/dashboard/health-quotes/actions";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";

export const healthQuoterFormSchema = z.object({
    zipCode: z.string().length(5, "Enter a valid 5-digit ZIP code."),
    householdSize: z.coerce.number().min(1, "Household must have at least one person.").max(10, "Please contact us for households larger than 10."),
    householdIncome: z.coerce.number().min(0, "Income must be a positive number."),
    members: z.array(z.object({ 
        age: z.coerce.number().min(0,"Please enter a valid age.").max(120, "Please enter a valid age."),
        gender: z.enum(["Male", "Female"], { required_error: "Please select a gender."}),
        uses_tobacco: z.boolean().default(false),
     })).min(1),
    hasInsurance: z.enum(["yes", "no"], {required_error: "Please select an option."}),
    hadUnemployment: z.enum(["yes", "no"], {required_error: "Please select an option."}),
});

type FormSchemaType = z.infer<typeof healthQuoterFormSchema>;

const steps: { id: number; name: string; icon: React.ElementType; fields: FieldPath<FormSchemaType>[] }[] = [
    { id: 1, name: "Location & Household Size", icon: MapPin, fields: ["zipCode", "householdSize"] },
    { id: 2, name: "Member Details", icon: Users, fields: ["members"] },
    { id: 3, name: "Household Income", icon: Wallet, fields: ["householdIncome"] },
    { id: 4, name: "Coverage Status", icon: ShieldQuestion, fields: ["hasInsurance", "hadUnemployment"] },
];

const HealthPlanCard = ({ plan }: { plan: HealthPlan }) => (
    <Card className="w-full flex flex-col">
        <CardHeader>
            {plan.isBestMatch && <Badge className="w-fit bg-accent text-accent-foreground mb-2">Best Match</Badge>}
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.provider}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
            <div className="flex justify-between items-baseline border-b pb-4">
                <div>
                    <p className="text-2xl sm:text-3xl font-bold">${plan.premium.toFixed(2)}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                    {plan.taxCredit > 0 && <p className="text-sm text-green-600">After estimated ${plan.taxCredit.toFixed(2)} tax credit</p>}
                </div>
                {plan.rating > 0 && 
                    <div className="flex items-center gap-1 text-amber-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-bold">{plan.rating}</span>
                    </div>
                }
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                <div><p className="text-muted-foreground">Deductible</p><p className="font-medium">${plan.deductible.toLocaleString()}</p></div>
                <div><p className="text-muted-foreground">Max Out-of-Pocket</p><p className="font-medium">${plan.outOfPocketMax.toLocaleString()}</p></div>
                <div><p className="text-muted-foreground">Network</p><p className="font-medium">{plan.network}</p></div>
            </div>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-2 pt-4">
            <Button className="w-full">Select Plan</Button>
            <div className="flex justify-around text-xs pt-2">
                {plan.benefits_url && <a href={plan.benefits_url} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Benefits Summary</a>}
                {plan.formulary_url && <a href={plan.formulary_url} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Drug List</a>}
            </div>
        </CardFooter>
    </Card>
);

export function HealthInsuranceQuoter() {
    const [step, setStep] = useState(1);
    const [isPending, startTransition] = useTransition();
    const [results, setResults] = useState<HealthPlan[] | null>(null);
    const { toast } = useToast();

    const form = useForm<FormSchemaType>({
        resolver: zodResolver(healthQuoterFormSchema),
        defaultValues: {
            householdSize: 1,
            householdIncome: 50000,
            zipCode: "",
            members: [{ age: 30, gender: "Female", uses_tobacco: false }],
            hasInsurance: "no",
            hadUnemployment: "no",
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
                append({ age: 30, gender: "Female", uses_tobacco: false });
            }
        } else if (size < currentCount) {
             for (let i = currentCount - 1; i >= size; i--) {
                remove(i);
            }
        }
    }, [watchHouseholdSize, fields.length, append, remove]);


    async function onSubmit(values: FormSchemaType) {
        setResults(null);
        startTransition(async () => {
            const result = await getHealthQuotes(values);
            if(result.error) {
                toast({
                    variant: "destructive",
                    title: "Error fetching quotes",
                    description: result.error
                });
            } else {
                setResults(result.plans || []);
            }
        });
    }
    
    const handleNext = async () => {
        const currentStepInfo = steps[step - 1];
        const output = await form.trigger(currentStepInfo.fields, { shouldFocus: true });
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
                     {results.length > 0 ? (
                        <p className="text-muted-foreground">We found {results.length} plans that match your needs. Here are the top matches.</p>
                     ) : (
                        <p className="text-muted-foreground">No plans found for your criteria. Please try different options or contact us for assistance.</p>
                     )}
                </div>
                {results.length > 0 && (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {results.map(plan => <HealthPlanCard key={plan.id} plan={plan}/>)}
                    </div>
                )}
                <Button variant="outline" onClick={() => setResults(null)}>Start Over</Button>
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
            <CardContent>
                <Form {...form}>
                    <form className="space-y-8">
                        {step === 1 && (
                            <div className="space-y-8">
                                <FormField control={form.control} name="zipCode" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-lg">What's your ZIP code?</FormLabel>
                                        <FormDescription>Your location determines which plans are available.</FormDescription>
                                        <FormControl><Input {...field} className="max-w-xs"/></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="householdSize" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-lg">How many people are in your household (including yourself)?</FormLabel>
                                        <FormControl><Input type="number" {...field} min={1} max={10} className="max-w-xs"/></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        )}
                        {step === 2 && (
                            <div className="space-y-6">
                                <Label className="text-lg font-medium">Please provide details for each person needing coverage.</Label>
                                {fields.map((item, index) => (
                                     <Card key={item.id} className="p-6 bg-slate-50">
                                         <FormLabel className="font-semibold">Person {index + 1}</FormLabel>
                                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8 mt-4">
                                            <FormField control={form.control} name={`members.${index}.age`} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Age</FormLabel>
                                                    <FormControl><Input type="number" {...field} placeholder="e.g. 42" /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name={`members.${index}.gender`} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Gender</FormLabel>
                                                    <FormControl>
                                                         <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4">
                                                            <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Male" /></FormControl><FormLabel className="font-normal">Male</FormLabel></FormItem>
                                                            <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Female" /></FormControl><FormLabel className="font-normal">Female</FormLabel></FormItem>
                                                        </RadioGroup>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name={`members.${index}.uses_tobacco`} render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:col-span-2">
                                                    <FormLabel>Uses Tobacco?</FormLabel>
                                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                                </FormItem>
                                            )} />
                                         </div>
                                     </Card>
                                ))}
                            </div>
                        )}
                        {step === 3 && (
                             <FormField control={form.control} name="householdIncome" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-lg">What's your estimated household income for this year?</FormLabel>
                                    <FormDescription>This helps us calculate your potential tax credits. Include income from all members.</FormDescription>
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
                         {step === 4 && (
                            <div className="space-y-8">
                                <FormField control={form.control} name="hasInsurance" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-lg">Does anyone in your household currently have health insurance?</FormLabel>
                                        <FormControl>
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4">
                                                <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem>
                                                <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="hadUnemployment" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-lg">Has anyone in your household received unemployment income at any time this year?</FormLabel>
                                        <FormControl>
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2 gap-4">
                                                <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem>
                                                <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
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
                    <span>Your information is secure and will only be used to find plans and estimate savings.</span>
                </div>
            </CardFooter>
        </Card>
    );
}
