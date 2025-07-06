
"use client";

import { useState, useTransition, useEffect } from "react";
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
import { Loader2, Terminal, FileDigit, Star, Info } from "lucide-react";
import { getMedigapQuotes, getDentalQuotes } from "./actions";
import type { Quote, DentalQuote } from "@/types";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


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

const getStarRating = (rating: string) => {
    if (!rating || rating === "N/A") return <span className="text-muted-foreground">N/A</span>;
    const filledStar = '★';
    const emptyStar = '☆';
    if (rating === 'A++' || rating === 'A+') return filledStar.repeat(5);
    if (rating === 'A') return filledStar.repeat(4) + emptyStar;
    if (rating === 'A-') return filledStar.repeat(3) + emptyStar.repeat(2);
    if (rating === 'B+' || rating === 'B') return filledStar.repeat(2) + emptyStar.repeat(3);
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
                <TabsTrigger value="ltc">Long-Term Care</TabsTrigger>
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
                                            <TableHead>Carrier</TableHead>
                                            <TableHead>Plan</TableHead>
                                            <TableHead>Rating</TableHead>
                                            <TableHead className="text-right">Monthly Premium</TableHead>
                                            <TableHead className="text-right"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {medigapQuotes.map((quote, index) => (
                                            <TableRow key={`${quote.id}-${index}`}>
                                                <TableCell className="font-medium">{quote.carrier?.name || 'Unknown Carrier'}</TableCell>
                                                <TableCell>{quote.plan_name}</TableCell>
                                                <TableCell className="text-amber-500">{getStarRating(quote.am_best_rating)}</TableCell>
                                                <TableCell className="text-right font-bold">${quote.monthly_premium?.toFixed(2) ?? 'N/A'}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button asChild>
                                                        <Link href="/dashboard/apply">Select Plan</Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
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
                                            <TableHead>Carrier</TableHead>
                                            <TableHead>Plan Name</TableHead>
                                            <TableHead>Rating</TableHead>
                                            <TableHead className="text-right">Monthly Premium</TableHead>
                                            <TableHead className="text-right"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {dentalQuotes.map((quote, index) => (
                                            <TableRow key={`${quote.id}-${index}`}>
                                                <TableCell className="font-medium">{quote.carrier?.name || 'Unknown Carrier'}</TableCell>
                                                <TableCell>{quote.plan_name}</TableCell>
                                                <TableCell className="text-amber-500">{getStarRating(quote.am_best_rating)}</TableCell>
                                                <TableCell className="text-right font-bold">${quote.monthly_premium?.toFixed(2) ?? 'N/A'}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button asChild>
                                                        <Link href="/dashboard/apply">Select Plan</Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
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
            <TabsContent value="ltc" className="mt-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Request a Long-Term Care Quote</CardTitle>
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
       </Tabs>
    </div>
  );
}
