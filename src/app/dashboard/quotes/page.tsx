
"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Terminal, FileDigit, Info, Building, PlusCircle, Check } from "lucide-react";
import { getMedigapQuotes, getDentalQuotes, getHospitalIndemnityQuotes } from "./actions";
import type { Quote, DentalQuote, HospitalIndemnityQuote, HospitalIndemnityRider, HospitalIndemnityBenefit } from "@/types";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MedigapQuoteCard } from "@/components/medigap-quote-card";
import { DentalQuoteCard } from "@/components/dental-quote-card";

const medigapFormSchema = z.object({
  zipCode: z.string().length(5, "Enter a valid 5-digit ZIP code"),
  age: z.coerce.number().min(65, "Must be at least 65").max(120, "Age seems too high"),
  gender: z.enum(["female", "male"]),
  tobacco: z.enum(["false", "true"]),
  plan: z.enum(["A", "F", "G", "N"]),
  effectiveDate: z.string().optional(),
  apply_discounts: z.boolean().default(true).optional(),
});

const dentalFormSchema = z.object({
  zipCode: z.string().length(5, "Enter a valid 5-digit ZIP code"),
  age: z.coerce.number().min(18, "Must be at least 18").max(120, "Age seems too high"),
  gender: z.enum(["female", "male"]),
  tobacco: z.enum(["false", "true"]),
});

const hospitalIndemnityFormSchema = z.object({
  zipCode: z.string().length(5, "Enter a valid 5-digit ZIP code"),
  age: z.coerce.number().min(18, "Must be at least 18").max(120, "Age seems too high"),
  gender: z.enum(["female", "male"]),
  tobacco: z.enum(["false", "true"]),
});

export default function QuotesPage() {
  const [isMedigapPending, startMedigapTransition] = useTransition();
  const [medigapQuotes, setMedigapQuotes] = useState<Quote[] | null>(null);
  const [medigapError, setMedigapError] = useState<string | null>(null);

  const [isDentalPending, startDentalTransition] = useTransition();
  const [dentalQuotes, setDentalQuotes] = useState<DentalQuote[] | null>(null);
  const [dentalError, setDentalError] = useState<string | null>(null);

  const [isHospitalIndemnityPending, startHospitalIndemnityTransition] = useTransition();
  const [hospitalIndemnityQuotes, setHospitalIndemnityQuotes] = useState<HospitalIndemnityQuote[] | null>(null);
  const [hospitalIndemnityError, setHospitalIndemnityError] = useState<string | null>(null);
  const [featuredQuote, setFeaturedQuote] = useState<HospitalIndemnityQuote | null>(null);
  const [selectedBaseBenefit, setSelectedBaseBenefit] = useState<HospitalIndemnityBenefit | null>(null);
  const [selectedRiders, setSelectedRiders] = useState<Record<string, HospitalIndemnityBenefit>>({});

  const medigapForm = useForm<z.infer<typeof medigapFormSchema>>({
    resolver: zodResolver(medigapFormSchema),
    defaultValues: {
      zipCode: "",
      age: 65,
      gender: "female",
      tobacco: "false",
      plan: "G",
      effectiveDate: new Date().toISOString().split("T")[0],
      apply_discounts: true,
    },
  });

  const dentalForm = useForm<z.infer<typeof dentalFormSchema>>({
    resolver: zodResolver(dentalFormSchema),
    defaultValues: {
      zipCode: "",
      age: 65,
      gender: "female",
      tobacco: "false",
    },
  });

  const hospitalIndemnityForm = useForm<z.infer<typeof hospitalIndemnityFormSchema>>({
    resolver: zodResolver(hospitalIndemnityFormSchema),
    defaultValues: {
        zipCode: "",
        age: 65,
        gender: "female",
        tobacco: "false",
    },
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const planParam = urlParams.get('plan');
    const validPlans = medigapFormSchema.shape.plan.options;
    if (planParam && validPlans.includes(planParam.toUpperCase() as any)) {
        medigapForm.setValue('plan', planParam.toUpperCase() as z.infer<typeof medigapFormSchema>['plan']);
    }
  }, [medigapForm]);

  useEffect(() => {
    if (featuredQuote?.baseBenefits && featuredQuote.baseBenefits.length > 0) {
        const sortedBenefits = [...featuredQuote.baseBenefits].sort((a, b) => a.rate - b.rate);
        setSelectedBaseBenefit(sortedBenefits[0]);
    } else {
        setSelectedBaseBenefit(null);
    }
    setSelectedRiders({});
  }, [featuredQuote]);


  function onMedigapSubmit(values: z.infer<typeof medigapFormSchema>) {
    setMedigapError(null);
    setMedigapQuotes(null);
    startMedigapTransition(async () => {
      const result = await getMedigapQuotes({
        ...values,
        apply_discounts: values.apply_discounts || false,
      });
      if (result.error) {
        setMedigapError(result.error);
      }
      if (result.quotes) {
        setMedigapQuotes(result.quotes);
      }
    });
  }

  function onDentalSubmit(values: z.infer<typeof dentalFormSchema>) {
    setDentalError(null);
    setDentalQuotes(null);
    startDentalTransition(async () => {
      const result = await getDentalQuotes(values);
      if (result.error) {
        setDentalError(result.error);
      }
      if (result.quotes) {
        setDentalQuotes(result.quotes);
      }
    });
  }

  function onHospitalIndemnitySubmit(values: z.infer<typeof hospitalIndemnityFormSchema>) {
    setHospitalIndemnityError(null);
    setHospitalIndemnityQuotes(null);
    setFeaturedQuote(null);
    setSelectedBaseBenefit(null);
    setSelectedRiders({});
    startHospitalIndemnityTransition(async () => {
        const result = await getHospitalIndemnityQuotes(values);
        if (result.error) {
            setHospitalIndemnityError(result.error);
        }
        if (result.quotes && result.quotes.length > 0) {
            const processedQuotes = result.quotes.map(quote => {
                const uniqueBaseBenefits = quote.baseBenefits.reduce((acc, current) => {
                    if (!acc.find(item => item.amount === current.amount)) {
                        acc.push(current);
                    }
                    return acc;
                }, [] as HospitalIndemnityBenefit[]);

                const processedRiders = quote.riders.map(rider => ({
                    ...rider,
                    benefits: rider.benefits.reduce((acc, current) => {
                        if (!acc.find(item => item.amount === current.amount)) {
                            acc.push(current);
                        }
                        return acc;
                    }, [] as HospitalIndemnityBenefit[]),
                }));

                return { ...quote, baseBenefits: uniqueBaseBenefits, riders: processedRiders };
            });

            setHospitalIndemnityQuotes(processedQuotes);
            setFeaturedQuote(processedQuotes[0]);
        } else {
            setHospitalIndemnityQuotes([]);
            setFeaturedQuote(null);
        }
    });
  }

 const handleRiderToggle = (rider: HospitalIndemnityRider) => {
    const benefit = rider.benefits[0];
    if (!benefit) return;

    setSelectedRiders(prev => {
        const newSelections = { ...prev };
        if (newSelections[rider.name]) {
            delete newSelections[rider.name];
        } else {
            newSelections[rider.name] = benefit;
        }
        return newSelections;
    });
  };

  const handleRiderOptionSelect = (riderName: string, benefit: HospitalIndemnityBenefit | null) => {
      setSelectedRiders(prev => {
          const newSelections = { ...prev };
          if (benefit === null) {
              delete newSelections[riderName];
          } else {
              newSelections[riderName] = benefit;
          }
          return newSelections;
      });
  };

  const calculateTotalPremium = () => {
    if (!selectedBaseBenefit) return 0;
    const basePremium = selectedBaseBenefit.rate;
    const riderPremium = Object.values(selectedRiders).reduce((total, selection) => total + selection.rate, 0);
    return basePremium + riderPremium;
  };
  
  const totalPremium = calculateTotalPremium();
  const otherQuotes = hospitalIndemnityQuotes?.filter(q => q.id !== featuredQuote?.id);

  return (
    <div className="space-y-8 md:space-y-12">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Get Supplemental Quotes</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Select a plan type below to get instant quotes for Medigap, Dental, and other supplemental plans.
        </p>
      </div>

       <Accordion type="single" collapsible defaultValue="medigap" className="w-full space-y-6">
        <AccordionItem value="medigap" className="border-b-0">
          <Card>
            <AccordionTrigger className="p-6 sm:p-8 text-xl font-semibold hover:no-underline flex justify-between w-full">
              Medicare Supplement (Medigap)
            </AccordionTrigger>
            <AccordionContent className="px-6 sm:px-8 pb-8">
               <CardDescription className="mb-8">All fields are required to get your instant Medigap quotes.</CardDescription>
                <Form {...medigapForm}>
                    <form onSubmit={medigapForm.handleSubmit(onMedigapSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FormField control={medigapForm.control} name="zipCode" render={({ field }) => ( <FormItem><FormLabel>ZIP Code</FormLabel><FormControl><Input placeholder="e.g., 90210" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={medigapForm.control} name="age" render={({ field }) => ( <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={medigapForm.control} name="gender" render={({ field }) => (
                            <FormItem className="space-y-3">
                            <FormLabel>Gender</FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4 pt-2">
                                <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="female" /></FormControl><FormLabel className="font-normal">Female</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="male" /></FormControl><FormLabel className="font-normal">Male</FormLabel></FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField control={medigapForm.control} name="tobacco" render={({ field }) => (
                            <FormItem className="space-y-3">
                            <FormLabel>Uses Tobacco?</FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4 pt-2">
                                <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="false" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="true" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField control={medigapForm.control} name="plan" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Plan Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger></FormControl>
                                <SelectContent>
                                <SelectItem value="A">Plan A</SelectItem>
                                <SelectItem value="F">Plan F</SelectItem>
                                <SelectItem value="G">Plan G</SelectItem>
                                <SelectItem value="N">Plan N</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField control={medigapForm.control} name="effectiveDate" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Effective Date</FormLabel>
                            <FormControl><Input type="date" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField control={medigapForm.control} name="apply_discounts" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel>Apply Discounts</FormLabel>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isMedigapPending} size="lg">
                        {isMedigapPending ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching Quotes...</>
                        ) : (
                            <>Get Instant Quotes</>
                        )}
                        </Button>
                    </div>
                    </form>
                </Form>

                {isMedigapPending && (
                    <Card className="mt-8 flex flex-col items-center justify-center p-12">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                        <h3 className="mt-4 font-headline text-xl font-semibold">Finding the best rates...</h3>
                        <p className="mt-2 text-muted-foreground">Please wait a moment.</p>
                    </Card>
                )}
                {medigapError && (
                    <Alert variant="destructive" className="mt-8">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error Fetching Quotes</AlertTitle>
                    <AlertDescription>{medigapError}</AlertDescription>
                    </Alert>
                )}
                
                {medigapQuotes && (
                  <div className="mt-12">
                    <h3 className="text-2xl font-semibold mb-2">Your Medigap Quotes</h3>
                    <CardDescription className="mb-6">
                        Found {medigapQuotes.length} quote{medigapQuotes.length !== 1 ? 's' : ''} based on your information.
                    </CardDescription>
                    {medigapQuotes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {medigapQuotes.map((quote) => <MedigapQuoteCard key={quote.id} quote={quote} />)}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-muted-foreground">
                            <FileDigit className="h-10 w-10 mx-auto mb-4"/>
                            <p>No quotes found for the selected criteria.</p>
                            <p className="text-sm">Please try different options.</p>
                        </div>
                    )}
                  </div>
                )}
            </AccordionContent>
          </Card>
        </AccordionItem>
            
        <AccordionItem value="dental" className="border-b-0">
            <Card>
                <AccordionTrigger className="p-6 sm:p-8 text-xl font-semibold hover:no-underline flex justify-between w-full">
                    Dental Insurance
                </AccordionTrigger>
                <AccordionContent className="px-6 sm:px-8 pb-8">
                    <CardDescription className="mb-8">Fill out the fields below to get instant dental quotes.</CardDescription>
                    <Form {...dentalForm}>
                        <form onSubmit={dentalForm.handleSubmit(onDentalSubmit)} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <FormField control={dentalForm.control} name="zipCode" render={({ field }) => ( <FormItem><FormLabel>ZIP Code</FormLabel><FormControl><Input placeholder="e.g., 90210" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={dentalForm.control} name="age" render={({ field }) => ( <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={dentalForm.control} name="gender" render={({ field }) => (
                                <FormItem className="space-y-3">
                                <FormLabel>Gender</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4 pt-2">
                                    <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="female" /></FormControl><FormLabel className="font-normal">Female</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="male" /></FormControl><FormLabel className="font-normal">Male</FormLabel></FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField control={dentalForm.control} name="tobacco" render={({ field }) => (
                                <FormItem className="space-y-3">
                                <FormLabel>Uses Tobacco?</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4 pt-2">
                                    <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="false" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="true" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isDentalPending} size="lg">
                            {isDentalPending ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching Quotes...</>
                            ) : (
                                <>Get Dental Quotes</>
                            )}
                            </Button>
                        </div>
                        </form>
                    </Form>
                    
                    {isDentalPending && (
                        <Card className="mt-8 flex flex-col items-center justify-center p-12">
                            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                            <h3 className="mt-4 font-headline text-xl font-semibold">Finding dental plans...</h3>
                            <p className="mt-2 text-muted-foreground">Please wait a moment.</p>
                        </Card>
                    )}
                    {dentalError && (
                        <Alert variant="destructive" className="mt-8">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Error Fetching Dental Quotes</AlertTitle>
                        <AlertDescription>{dentalError}</AlertDescription>
                        </Alert>
                    )}

                    {dentalQuotes && (
                        <div className="mt-12">
                            <h3 className="text-2xl font-semibold mb-2">Your Dental Quotes</h3>
                            <CardDescription className="mb-6">
                                Found {dentalQuotes.length} quote{dentalQuotes.length !== 1 ? 's' : ''} based on your information.
                            </CardDescription>
                            {dentalQuotes.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {dentalQuotes.map((quote) => <DentalQuoteCard key={quote.id} quote={quote} />)}
                                </div>
                            ) : (
                                <div className="text-center py-16 text-muted-foreground">
                                    <FileDigit className="h-10 w-10 mx-auto mb-4"/>
                                    <p>No quotes found for the selected criteria.</p>
                                    <p className="text-sm">Please try different options.</p>
                                </div>
                            )}
                        </div>
                    )}
                </AccordionContent>
            </Card>
        </AccordionItem>
            
        <AccordionItem value="hospital-indemnity" className="border-b-0">
             <Card>
                <AccordionTrigger className="p-6 sm:p-8 text-xl font-semibold hover:no-underline flex justify-between w-full">
                    Hospital Indemnity
                </AccordionTrigger>
                <AccordionContent className="px-6 sm:px-8 pb-8">
                    <CardDescription className="mb-8">
                        Fill out the fields below to get instant quotes. Customize your plan with optional riders.
                    </CardDescription>
                   <Form {...hospitalIndemnityForm}>
                    <form onSubmit={hospitalIndemnityForm.handleSubmit(onHospitalIndemnitySubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FormField control={hospitalIndemnityForm.control} name="zipCode" render={({ field }) => ( <FormItem><FormLabel>ZIP Code</FormLabel><FormControl><Input placeholder="e.g., 90210" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={hospitalIndemnityForm.control} name="age" render={({ field }) => ( <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={hospitalIndemnityForm.control} name="gender" render={({ field }) => (
                            <FormItem className="space-y-3">
                            <FormLabel>Gender</FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4 pt-2">
                                <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="female" /></FormControl><FormLabel className="font-normal">Female</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="male" /></FormControl><FormLabel className="font-normal">Male</FormLabel></FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField control={hospitalIndemnityForm.control} name="tobacco" render={({ field }) => (
                            <FormItem className="space-y-3">
                            <FormLabel>Uses Tobacco?</FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4 pt-2">
                                <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="false" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="true" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isHospitalIndemnityPending} size="lg">
                        {isHospitalIndemnityPending ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching Quotes...</>
                        ) : (
                            <>Get Hospital Indemnity Quotes</>
                        )}
                        </Button>
                    </div>
                    </form>
                </Form>

                {isHospitalIndemnityPending && (
                    <Card className="mt-8 flex flex-col items-center justify-center p-12">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                        <h3 className="mt-4 font-headline text-xl font-semibold">Finding hospital indemnity plans...</h3>
                        <p className="mt-2 text-muted-foreground">Please wait a moment.</p>
                    </Card>
                )}
                {hospitalIndemnityError && (
                    <Alert variant="destructive" className="mt-8">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error Fetching Hospital Indemnity Quotes</AlertTitle>
                    <AlertDescription>{hospitalIndemnityError}</AlertDescription>
                    </Alert>
                )}

                {hospitalIndemnityQuotes && (
                    <div className="mt-12">
                        {featuredQuote ? (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <Card className="lg:col-span-2 p-8">
                                    <CardHeader className="p-0">
                                        <CardTitle className="font-headline text-2xl sm:text-3xl">{featuredQuote.carrier.name}</CardTitle>
                                        <CardDescription>{featuredQuote.plan_name}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0 mt-8 space-y-8">
                                        <div>
                                            <Label htmlFor="base-benefit-select" className="text-base font-semibold">Hospital Confinement Benefit</Label>
                                            <Select
                                                value={selectedBaseBenefit?.amount}
                                                onValueChange={(amount) => {
                                                    const newBenefit = featuredQuote.baseBenefits.find(b => b.amount === amount);
                                                    if (newBenefit) setSelectedBaseBenefit(newBenefit);
                                                }}
                                            >
                                                <SelectTrigger id="base-benefit-select" className="mt-2 h-11">
                                                    <SelectValue placeholder="Select a daily benefit" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {featuredQuote.baseBenefits.map(benefit => (
                                                        <SelectItem key={benefit.amount} value={benefit.amount}>
                                                            ${benefit.amount} / {benefit.quantifier} (+${benefit.rate.toFixed(2)}/mo)
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <Separator/>

                                        <div>
                                           <h4 className="font-semibold mb-4 text-base">Optional Riders</h4>
                                           <div className="space-y-4">
                                            {featuredQuote.riders?.filter(r => r.benefits.length > 0).map((rider, i) => {
                                                if (rider.included) {
                                                        return (
                                                        <div key={i} className="flex items-center p-4 rounded-md border bg-green-50 border-green-200">
                                                            <Check className="h-5 w-5 mr-4 text-green-600"/>
                                                            <div className="flex-1">
                                                                <p className="font-medium">{rider.name} (Included)</p>
                                                                {rider.note && <p className="text-xs text-muted-foreground mt-1">{rider.note}</p>}
                                                            </div>
                                                        </div>
                                                        )
                                                }
                                                
                                                if (rider.benefits.length === 1) {
                                                    const benefit = rider.benefits[0];
                                                    return (
                                                        <div key={i} className="flex items-center p-4 rounded-md border bg-background">
                                                            <Switch 
                                                                id={`rider-${i}`}
                                                                onCheckedChange={() => handleRiderToggle(rider)}
                                                                checked={!!selectedRiders[rider.name]}
                                                            />
                                                            <Label htmlFor={`rider-${i}`} className="ml-4 flex justify-between w-full cursor-pointer">
                                                                <div className="flex-1">
                                                                    <p className="font-medium">{rider.name}</p>
                                                                    {rider.note && <p className="text-xs text-muted-foreground mt-1">{rider.note}</p>}
                                                                </div>
                                                                <span className="font-semibold pl-4 whitespace-nowrap">+ ${benefit.rate.toFixed(2)}</span>
                                                            </Label>
                                                        </div>
                                                    )
                                                }

                                                if (rider.benefits.length > 1) {
                                                    return (
                                                        <div key={i} className="p-4 rounded-md border bg-background">
                                                            <p className="font-medium">{rider.name}</p>
                                                            {rider.note && <p className="text-xs text-muted-foreground mb-3 mt-1">{rider.note}</p>}
                                                            <RadioGroup
                                                                onValueChange={(value) => {
                                                                    if (value === 'none') {
                                                                        handleRiderOptionSelect(rider.name, null);
                                                                    } else {
                                                                        const selectedBenefit = rider.benefits.find(b => b.amount === value);
                                                                        if (selectedBenefit) handleRiderOptionSelect(rider.name, selectedBenefit);
                                                                    }
                                                                }}
                                                                value={selectedRiders[rider.name]?.amount || 'none'}
                                                                className="mt-2 space-y-2"
                                                            >
                                                                {rider.benefits.map((benefit, j) => (
                                                                    <div key={j} className="flex items-center">
                                                                        <RadioGroupItem value={benefit.amount} id={`rider-${i}-${j}`} />
                                                                        <Label htmlFor={`rider-${i}-${j}`} className="ml-3 flex justify-between w-full font-normal cursor-pointer">
                                                                            <span>{benefit.amount} / {benefit.quantifier}</span>
                                                                            <span className="font-medium">+ ${benefit.rate.toFixed(2)}</span>
                                                                        </Label>
                                                                    </div>
                                                                ))}
                                                                <div className="flex items-center">
                                                                    <RadioGroupItem value="none" id={`rider-${i}-none`} />
                                                                    <Label htmlFor={`rider-${i}-none`} className="ml-3 font-normal cursor-pointer">None</Label>
                                                                </div>
                                                            </RadioGroup>
                                                        </div>
                                                    )
                                                }
                                                return null;
                                            })}
                                        </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex-col items-stretch gap-4 border-t bg-muted/30 p-6 mt-8 -mx-8 -mb-8 rounded-b-3xl">
                                        <div className="flex justify-between items-center">
                                            <p className="font-semibold text-lg">Total Monthly Premium</p>
                                            <p className="font-headline text-3xl sm:text-4xl font-bold">${totalPremium.toFixed(2)}</p>
                                        </div>
                                         <Button size="lg" asChild><Link href="/dashboard/apply">Select This Plan</Link></Button>
                                    </CardFooter>
                                </Card>
                                <div className="space-y-4">
                                    <h3 className="font-headline text-xl font-semibold">Other Companies</h3>
                                    {otherQuotes && otherQuotes.length > 0 ? (
                                        <div className="space-y-4">
                                            {otherQuotes.map(quote => {
                                                const lowestRate = quote.baseBenefits.length > 0 ? 
                                                    [...quote.baseBenefits].sort((a,b) => a.rate - b.rate)[0].rate : 0;
                                                return (
                                                    <Card 
                                                        key={quote.id} 
                                                        className="p-6 flex justify-between items-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
                                                        onClick={() => setFeaturedQuote(quote)}
                                                    >
                                                        <div>
                                                            <p className="font-semibold text-lg">{quote.carrier.name}</p>
                                                            <p className="text-sm text-muted-foreground">{quote.plan_name}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-semibold text-lg">${lowestRate.toFixed(2)}</p>
                                                            <p className="text-xs text-muted-foreground">starts from</p>
                                                        </div>
                                                    </Card>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No other companies matched your criteria.</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                           <div className="text-center py-16 text-muted-foreground">
                                <FileDigit className="h-10 w-10 mx-auto mb-4"/>
                                <p>No quotes found for the selected criteria.</p>
                                <p className="text-sm">Please try different options.</p>
                            </div>
                        )}
                    </div>
                )}
                </AccordionContent>
            </Card>
        </AccordionItem>

        <AccordionItem value="life-insurance" className="border-b-0">
             <Card>
                <AccordionTrigger className="p-6 sm:p-8 text-xl font-semibold hover:no-underline flex justify-between w-full">
                    Life Insurance
                </AccordionTrigger>
                <AccordionContent className="px-6 sm:px-8 pb-8">
                    <CardDescription className="mb-6">
                        An agent will prepare a personalized quote for you.
                    </CardDescription>
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Instant Quotes Coming Soon!</AlertTitle>
                        <AlertDescription>
                            We are working to bring you instant online quotes for this plan type. For now, an agent will contact you.
                        </AlertDescription>
                    </Alert>
                     <div className="mt-6 flex justify-end">
                        <Button size="lg">Request Quote from Agent</Button>
                    </div>
                </AccordionContent>
            </Card>
        </AccordionItem>
       </Accordion>
    </div>
  );
}

    