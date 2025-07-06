
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Terminal, FileDigit, Star, Info, ChevronDown } from "lucide-react";
import { getMedigapQuotes, getDentalQuotes, getHospitalIndemnityQuotes } from "./actions";
import type { Quote, DentalQuote, HospitalIndemnityQuote, HospitalIndemnityRider } from "@/types";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";


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

const getStarRating = (rating: string) => {
    if (!rating || rating === "N/A") return <span className="text-muted-foreground">N/A</span>;
    const filledStar = '★';
    const emptyStar = '☆';
    if (rating === 'A++' || rating === 'A+') return filledStar.repeat(5);
    if (rating === 'A') return filledStar.repeat(4) + emptyStar;
    if (rating === 'A-') return filledStar.repeat(3) + emptyStar.repeat(2);
    if (rating === 'B+' || 'B') return filledStar.repeat(2) + emptyStar.repeat(3);
    if (rating) return filledStar + emptyStar.repeat(4);
    return emptyStar.repeat(5);
};


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

  const [openRows, setOpenRows] = useState<string[]>([]);

  // State for hospital indemnity riders
  const [selectedRiders, setSelectedRiders] = useState<Record<string, Record<string, { rate: number; amount: string }>>>({});

  const toggleRow = (id: string) => {
    setOpenRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

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

  function onMedigapSubmit(values: z.infer<typeof medigapFormSchema>) {
    setMedigapError(null);
    setMedigapQuotes(null);
    setOpenRows([]);
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
    setOpenRows([]);
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
    setOpenRows([]);
    setSelectedRiders({});
    startHospitalIndemnityTransition(async () => {
        const result = await getHospitalIndemnityQuotes(values);
        if (result.error) {
            setHospitalIndemnityError(result.error);
        }
        if (result.quotes) {
            setHospitalIndemnityQuotes(result.quotes);
        }
    });
  }

  const handleRiderToggle = (quoteId: string, rider: HospitalIndemnityRider) => {
    const riderBenefit = rider.benefits[0];
    if (!riderBenefit) return;

    setSelectedRiders(prev => {
        const quoteSelections = { ...(prev[quoteId] || {}) };
        if (quoteSelections[rider.name]) {
            delete quoteSelections[rider.name];
        } else {
            quoteSelections[rider.name] = { rate: riderBenefit.rate, amount: riderBenefit.amount };
        }
        return { ...prev, [quoteId]: quoteSelections };
    });
  };

  const handleRiderOptionSelect = (quoteId: string, riderName: string, benefit: { rate: number; amount: string } | null) => {
    setSelectedRiders(prev => {
        const quoteSelections = { ...(prev[quoteId] || {}) };
        if (benefit === null) {
            delete quoteSelections[riderName];
        } else {
            quoteSelections[riderName] = benefit;
        }
        return { ...prev, [quoteId]: quoteSelections };
    });
  };

  const calculateTotalPremium = (quote: HospitalIndemnityQuote) => {
    const basePremium = quote.monthly_premium;
    const selections = selectedRiders[quote.id] || {};
    const riderPremium = Object.values(selections).reduce((total, selection) => total + selection.rate, 0);
    return basePremium + riderPremium;
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Get Quotes</h1>
        <p className="text-muted-foreground">
          Select a plan type below to get instant quotes or request information.
        </p>
      </div>

       <Tabs defaultValue="medigap" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="medigap">Medigap</TabsTrigger>
                <TabsTrigger value="dental">Dental</TabsTrigger>
                <TabsTrigger value="life-insurance">Life Insurance</TabsTrigger>
                <TabsTrigger value="hospital-indemnity">Hospital Indemnity</TabsTrigger>
            </TabsList>
            <TabsContent value="medigap" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Medicare Supplement Quotes</CardTitle>
                        <CardDescription>All fields are required unless noted to get your instant Medigap quotes.</CardDescription>
                    </CardHeader>
                    <CardContent>
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
                                <FormDescription>Optional</FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField control={medigapForm.control} name="apply_discounts" render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 h-full justify-center">
                                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Apply Discounts</FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isMedigapPending} size="lg" className="bg-accent hover:bg-accent/90">
                            {isMedigapPending ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching Quotes...</>
                            ) : (
                                <>Get Instant Quotes</>
                            )}
                            </Button>
                        </div>
                        </form>
                    </Form>
                    </CardContent>
                </Card>
      
                {isMedigapPending && (
                    <Card className="mt-6 flex flex-col items-center justify-center p-12">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                        <h3 className="mt-4 font-headline text-xl font-semibold">Finding the best rates...</h3>
                        <p className="mt-2 text-muted-foreground">Please wait a moment.</p>
                    </Card>
                )}

                {medigapError && (
                    <Alert variant="destructive" className="mt-6">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error Fetching Quotes</AlertTitle>
                    <AlertDescription>{medigapError}</AlertDescription>
                    </Alert>
                )}
                
                {medigapQuotes && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Your Medigap Quotes</CardTitle>
                            <CardDescription>
                                Found {medigapQuotes.length} quote{medigapQuotes.length !== 1 ? 's' : ''} based on your information.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {medigapQuotes.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]"></TableHead>
                                            <TableHead>Carrier</TableHead>
                                            <TableHead>Plan</TableHead>
                                            <TableHead>Rating</TableHead>
                                            <TableHead className="text-right">Monthly Premium</TableHead>
                                            <TableHead className="w-[120px] text-right"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {medigapQuotes.map((quote, index) => {
                                            const key = `${quote.id}-${index}`;
                                            const isOpen = openRows.includes(key);
                                            return (
                                                <React.Fragment key={key}>
                                                    <TableRow onClick={() => toggleRow(key)} className="cursor-pointer">
                                                        <TableCell>
                                                            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                                        </TableCell>
                                                        <TableCell className="font-medium">{quote.carrier?.name || 'Unknown Carrier'}</TableCell>
                                                        <TableCell>{quote.plan_name}</TableCell>
                                                        <TableCell className="text-amber-500">{getStarRating(quote.am_best_rating)}</TableCell>
                                                        <TableCell className="text-right font-bold">${quote.monthly_premium?.toFixed(2) ?? 'N/A'}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button asChild onClick={(e) => e.stopPropagation()}>
                                                                <Link href="/dashboard/apply">Select Plan</Link>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                    {isOpen && (
                                                        <TableRow>
                                                            <TableCell colSpan={6} className="p-0">
                                                                <div className="p-4 bg-muted/50 text-sm">
                                                                    <h4 className="font-semibold mb-2">Plan Details</h4>
                                                                    <p><strong className="text-muted-foreground">Rate Type:</strong> {quote.rate_type || 'N/A'}</p>
                                                                    {quote.discounts?.length > 0 && (
                                                                        <div className="mt-2">
                                                                            <p className="font-semibold text-muted-foreground">Available Discounts:</p>
                                                                            <ul className="list-disc pl-5">
                                                                                {quote.discounts.map((d, i) => <li key={i} className="capitalize">{d.name}: {d.value * 100}%</li>)}
                                                                            </ul>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </React.Fragment>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <FileDigit className="h-10 w-10 mx-auto mb-4"/>
                                    <p>No quotes found for the selected criteria.</p>
                                    <p className="text-sm">Please try different options.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </TabsContent>
            <TabsContent value="dental" className="mt-6">
               <Card>
                    <CardHeader>
                        <CardTitle>Dental Plan Quotes</CardTitle>
                        <CardDescription>Fill out the fields below to get instant dental quotes.</CardDescription>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                </Card>

                 {isDentalPending && (
                    <Card className="mt-6 flex flex-col items-center justify-center p-12">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                        <h3 className="mt-4 font-headline text-xl font-semibold">Finding dental plans...</h3>
                        <p className="mt-2 text-muted-foreground">Please wait a moment.</p>
                    </Card>
                )}

                {dentalError && (
                    <Alert variant="destructive" className="mt-6">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error Fetching Dental Quotes</AlertTitle>
                    <AlertDescription>{dentalError}</AlertDescription>
                    </Alert>
                )}

                {dentalQuotes && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Your Dental Quotes</CardTitle>
                            <CardDescription>
                                Found {dentalQuotes.length} quote{dentalQuotes.length !== 1 ? 's' : ''} based on your information.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {dentalQuotes.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]"></TableHead>
                                            <TableHead>Carrier</TableHead>
                                            <TableHead>Plan Name</TableHead>
                                            <TableHead>Benefit</TableHead>
                                            <TableHead className="text-right">Monthly Premium</TableHead>
                                            <TableHead className="w-[120px] text-right"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {dentalQuotes.map((quote, index) => {
                                            const key = `${quote.id}-${index}`;
                                            const isOpen = openRows.includes(key);
                                            return (
                                                <React.Fragment key={key}>
                                                    <TableRow onClick={() => toggleRow(key)} className="cursor-pointer">
                                                        <TableCell>
                                                            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                                        </TableCell>
                                                        <TableCell className="font-medium">{quote.carrier?.name || 'Unknown Carrier'}</TableCell>
                                                        <TableCell>{quote.plan_name}</TableCell>
                                                        <TableCell>
                                                            <div className="font-medium">{quote.benefit_amount !== 'N/A' ? `$${new Intl.NumberFormat().format(Number(quote.benefit_amount))}` : 'N/A'}</div>
                                                            <div className="text-xs text-muted-foreground">{quote.benefit_quantifier}</div>
                                                        </TableCell>
                                                        <TableCell className="text-right font-bold">${quote.monthly_premium?.toFixed(2) ?? 'N/A'}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button asChild onClick={(e) => e.stopPropagation()}>
                                                                <Link href="/dashboard/apply">Select Plan</Link>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                    {isOpen && (
                                                        <TableRow>
                                                            <TableCell colSpan={6} className="p-0">
                                                                <div className="p-4 bg-muted/50 text-sm space-y-2">
                                                                    <div>
                                                                        <h4 className="font-semibold text-muted-foreground">Benefit Notes</h4>
                                                                        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: quote.benefit_notes || 'N/A' }} />
                                                                    </div>
                                                                     <div>
                                                                        <h4 className="font-semibold text-muted-foreground">Limitation Notes</h4>
                                                                        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: quote.limitation_notes || 'N/A' }} />
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </React.Fragment>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <FileDigit className="h-10 w-10 mx-auto mb-4"/>
                                    <p>No quotes found for the selected criteria.</p>
                                    <p className="text-sm">Please try different options.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </TabsContent>
            <TabsContent value="life-insurance" className="mt-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Request a Life Insurance Quote</CardTitle>
                        <CardDescription>
                            An agent will prepare a personalized quote for you.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="hospital-indemnity" className="mt-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Hospital Indemnity Quotes</CardTitle>
                        <CardDescription>
                            Fill out the fields below to get instant quotes. Customize your plan with optional riders.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                </Card>
                {isHospitalIndemnityPending && (
                    <Card className="mt-6 flex flex-col items-center justify-center p-12">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                        <h3 className="mt-4 font-headline text-xl font-semibold">Finding hospital indemnity plans...</h3>
                        <p className="mt-2 text-muted-foreground">Please wait a moment.</p>
                    </Card>
                )}
                {hospitalIndemnityError && (
                    <Alert variant="destructive" className="mt-6">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error Fetching Hospital Indemnity Quotes</AlertTitle>
                    <AlertDescription>{hospitalIndemnityError}</AlertDescription>
                    </Alert>
                )}
                {hospitalIndemnityQuotes && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Your Hospital Indemnity Quotes</CardTitle>
                            <CardDescription>
                                Found {hospitalIndemnityQuotes.length} plan{hospitalIndemnityQuotes.length !== 1 ? 's' : ''} based on your information. Click a row to see riders.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {hospitalIndemnityQuotes.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]"></TableHead>
                                            <TableHead>Carrier</TableHead>
                                            <TableHead>Plan Name</TableHead>
                                            <TableHead>Benefit</TableHead>
                                            <TableHead className="text-right">Monthly Premium</TableHead>
                                            <TableHead className="w-[120px] text-right"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {hospitalIndemnityQuotes.map((quote, index) => {
                                            const key = `${quote.id}-${index}`;
                                            const isOpen = openRows.includes(key);
                                            const totalPremium = calculateTotalPremium(quote);
                                            return (
                                                <React.Fragment key={key}>
                                                    <TableRow onClick={() => toggleRow(key)} className="cursor-pointer">
                                                        <TableCell>
                                                            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                                        </TableCell>
                                                        <TableCell className="font-medium">{quote.carrier?.name || 'Unknown Carrier'}</TableCell>
                                                        <TableCell>{quote.plan_name}</TableCell>
                                                        <TableCell>
                                                            <div className="font-medium">${new Intl.NumberFormat().format(Number(quote.benefit_amount))}</div>
                                                            <div className="text-xs text-muted-foreground">per {quote.benefit_quantifier}</div>
                                                        </TableCell>
                                                        <TableCell className="text-right font-bold">${totalPremium.toFixed(2)}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button asChild onClick={(e) => e.stopPropagation()}><Link href="/dashboard/apply">Select Plan</Link></Button>
                                                        </TableCell>
                                                    </TableRow>
                                                    {isOpen && (
                                                        <TableRow>
                                                            <TableCell colSpan={6} className="p-0">
                                                                <div className="p-4 bg-muted/50 text-sm">
                                                                    <h4 className="font-semibold mb-3">Available Riders</h4>
                                                                    {quote.riders?.filter(r => r.benefits.length > 0).length > 0 ? (
                                                                        <div className="space-y-4">
                                                                            {quote.riders.map((rider, i) => {
                                                                                if (rider.included) {
                                                                                     return (
                                                                                        <div key={i} className="p-2 bg-green-50 border border-green-200 rounded-md">
                                                                                            <p><strong>{rider.name} (Included):</strong> {rider.note || 'No additional details.'}</p>
                                                                                        </div>
                                                                                     )
                                                                                }
                                                                                
                                                                                if (rider.benefits.length === 1) {
                                                                                    const benefit = rider.benefits[0];
                                                                                    return (
                                                                                        <div key={i} className="flex items-center p-2 rounded-md border bg-background">
                                                                                            <Checkbox 
                                                                                                id={`${key}-rider-${i}`}
                                                                                                onCheckedChange={() => handleRiderToggle(quote.id, rider)}
                                                                                                checked={!!selectedRiders[quote.id]?.[rider.name]}
                                                                                            />
                                                                                            <Label htmlFor={`${key}-rider-${i}`} className="ml-3 flex justify-between w-full cursor-pointer">
                                                                                                <div className="flex-1">
                                                                                                    <p className="font-medium">{rider.name}</p>
                                                                                                    {rider.note && <p className="text-xs text-muted-foreground mt-1">{rider.note}</p>}
                                                                                                </div>
                                                                                                <span className="font-semibold pl-4">+${benefit.rate.toFixed(2)}</span>
                                                                                            </Label>
                                                                                        </div>
                                                                                    )
                                                                                }

                                                                                if (rider.benefits.length > 1) {
                                                                                    return (
                                                                                        <div key={i} className="p-3 rounded-md border bg-background">
                                                                                            <p className="font-medium">{rider.name}</p>
                                                                                            {rider.note && <p className="text-xs text-muted-foreground mb-2 mt-1">{rider.note}</p>}
                                                                                            <RadioGroup
                                                                                                onValueChange={(value) => {
                                                                                                    if (value === 'none') {
                                                                                                         handleRiderOptionSelect(quote.id, rider.name, null);
                                                                                                    } else {
                                                                                                        const selectedBenefit = rider.benefits.find(b => b.amount === value);
                                                                                                        if (selectedBenefit) handleRiderOptionSelect(quote.id, rider.name, selectedBenefit);
                                                                                                    }
                                                                                                }}
                                                                                                value={selectedRiders[quote.id]?.[rider.name]?.amount || 'none'}
                                                                                                className="mt-2 space-y-1"
                                                                                            >
                                                                                                {rider.benefits.map((benefit, j) => (
                                                                                                    <div key={j} className="flex items-center">
                                                                                                        <RadioGroupItem value={benefit.amount} id={`${key}-rider-${i}-${j}`} />
                                                                                                        <Label htmlFor={`${key}-rider-${i}-${j}`} className="ml-2 flex justify-between w-full font-normal cursor-pointer">
                                                                                                            <span>{benefit.amount} / {benefit.quantifier}</span>
                                                                                                            <span className="font-medium">+${benefit.rate.toFixed(2)}</span>
                                                                                                        </Label>
                                                                                                    </div>
                                                                                                ))}
                                                                                                <div className="flex items-center">
                                                                                                    <RadioGroupItem value="none" id={`${key}-rider-${i}-none`} />
                                                                                                    <Label htmlFor={`${key}-rider-${i}-none`} className="ml-2 font-normal cursor-pointer">None</Label>
                                                                                                </div>
                                                                                            </RadioGroup>
                                                                                        </div>
                                                                                    )
                                                                                }
                                                                                return null;
                                                                            })}
                                                                        </div>
                                                                    ) : (
                                                                        <p>No optional riders available for this plan.</p>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </React.Fragment>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <FileDigit className="h-10 w-10 mx-auto mb-4"/>
                                    <p>No quotes found for the selected criteria.</p>
                                    <p className="text-sm">Please try different options.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </TabsContent>
       </Tabs>
    </div>
  );
}
