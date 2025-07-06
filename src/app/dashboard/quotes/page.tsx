
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
import { getQuotes } from "./actions";
import type { Quote } from "@/types";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";


const medigapFormSchema = z.object({
  zipCode: z.string().length(5, "Enter a valid 5-digit ZIP code"),
  age: z.coerce.number().min(65, "Must be at least 65").max(120, "Age seems too high"),
  gender: z.enum(["female", "male"]),
  tobacco: z.enum(["false", "true"]),
  plan: z.enum(["A", "F", "G", "N"]),
  effectiveDate: z.string().optional(),
  apply_discounts: z.boolean().default(true).optional(),
});

const quoteRequestFormSchema = z.object({
    contactMethod: z.enum(["email", "text", "agent"]),
});

const getStarRating = (rating: string) => {
    if (!rating) return '☆☆☆☆☆';
    const filledStar = '★';
    const emptyStar = '☆';
    if (rating === 'A++' || rating === 'A+') return filledStar.repeat(5);
    if (rating === 'A') return filledStar.repeat(4) + emptyStar;
    if (rating === 'A-') return filledStar.repeat(3) + emptyStar.repeat(2);
    if (rating === 'B+' || rating === 'B') return filledStar.repeat(2) + emptyStar.repeat(3);
    if (rating) return filledStar + emptyStar.repeat(4);
    return emptyStar.repeat(5);
};

// New component for non-Medigap quote requests
function QuoteRequestForm({ planType }: { planType: string }) {
    const { toast } = useToast();
    const form = useForm<z.infer<typeof quoteRequestFormSchema>>({
        resolver: zodResolver(quoteRequestFormSchema),
        defaultValues: {
            contactMethod: "email",
        },
    });

    function onSubmit(values: z.infer<typeof quoteRequestFormSchema>) {
        toast({
            title: "Quote Request Sent!",
            description: `We've received your request for a ${planType} quote. A licensed agent will contact you via ${values.contactMethod} shortly.`,
        });
        form.reset();
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Request a {planType} Quote</CardTitle>
                <CardDescription>
                    Fill out your preferred contact method below, and a licensed agent will prepare a personalized quote for you.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Instant Quotes Coming Soon!</AlertTitle>
                    <AlertDescription>
                        We are working hard to bring you instant online quotes for this plan type. Thank you for your patience.
                    </AlertDescription>
                </Alert>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                         <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
                            <h3 className="font-medium">Your Information</h3>
                            <p className="text-sm text-muted-foreground">We will use the information on file for your quote.</p>
                            <ul className="text-sm space-y-1">
                                <li><strong>Name:</strong> Sarah Connor</li>
                                <li><strong>Email:</strong> s.connor@email.com</li>
                                <li><strong>Phone:</strong> 123-456-7890</li>
                            </ul>
                        </div>

                        <FormField
                            control={form.control}
                            name="contactMethod"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>How would you like to receive your quote?</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex flex-col space-y-1"
                                        >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl><RadioGroupItem value="email" /></FormControl>
                                                <FormLabel className="font-normal">Email</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl><RadioGroupItem value="text" /></FormControl>
                                                <FormLabel className="font-normal">Text Message</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl><RadioGroupItem value="agent" /></FormControl>
                                                <FormLabel className="font-normal">Talk to an Agent</FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end">
                            <Button type="submit" size="lg">Request Quote</Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}


export default function QuotesPage() {
  const [isPending, startTransition] = useTransition();
  const [quotes, setQuotes] = useState<Quote[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof medigapFormSchema>>({
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

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const planParam = urlParams.get('plan');
    const validPlans = medigapFormSchema.shape.plan.options;
    if (planParam && validPlans.includes(planParam.toUpperCase() as any)) {
        form.setValue('plan', planParam.toUpperCase() as z.infer<typeof medigapFormSchema>['plan']);
    }
  }, [form]);

  function onSubmit(values: z.infer<typeof medigapFormSchema>) {
    setError(null);
    setQuotes(null);
    startTransition(async () => {
      const result = await getQuotes({
        ...values,
        apply_discounts: values.apply_discounts || false,
      });
      if (result.error) {
        setError(result.error);
      }
      if (result.quotes) {
        setQuotes(result.quotes);
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
                <TabsTrigger value="dental-vision">Dental & Vision</TabsTrigger>
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
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <FormField control={form.control} name="zipCode" render={({ field }) => ( <FormItem><FormLabel>ZIP Code</FormLabel><FormControl><Input placeholder="e.g., 90210" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={form.control} name="age" render={({ field }) => ( <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={form.control} name="gender" render={({ field }) => (
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
                            <FormField control={form.control} name="tobacco" render={({ field }) => (
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
                            <FormField control={form.control} name="plan" render={({ field }) => (
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
                            <FormField control={form.control} name="effectiveDate" render={({ field }) => (
                                <FormItem>
                                <FormLabel>Effective Date</FormLabel>
                                <FormControl><Input type="date" {...field} /></FormControl>
                                <FormDescription>Optional</FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField control={form.control} name="apply_discounts" render={({ field }) => (
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
                            <Button type="submit" disabled={isPending} size="lg" className="bg-accent hover:bg-accent/90">
                            {isPending ? (
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
      
                {isPending && (
                    <Card className="mt-6 flex flex-col items-center justify-center p-12">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                        <h3 className="mt-4 font-headline text-xl font-semibold">Finding the best rates...</h3>
                        <p className="mt-2 text-muted-foreground">Please wait a moment.</p>
                    </Card>
                )}

                {error && (
                    <Alert variant="destructive" className="mt-6">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error Fetching Quotes</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                
                {quotes && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Your Medigap Quotes</CardTitle>
                            <CardDescription>
                                Found {quotes.length} quote{quotes.length !== 1 ? 's' : ''} based on your information.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {quotes.length > 0 ? (
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
                                        {quotes.map((quote) => (
                                            <TableRow key={quote.id}>
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
            <TabsContent value="dental-vision" className="mt-6">
                <QuoteRequestForm planType="Dental & Vision" />
            </TabsContent>
            <TabsContent value="life-insurance" className="mt-6">
                <QuoteRequestForm planType="Life Insurance" />
            </TabsContent>
            <TabsContent value="ltc" className="mt-6">
                <QuoteRequestForm planType="Long-Term Care" />
            </TabsContent>
        </Tabs>
    </div>
  );
}
