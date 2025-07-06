
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
import { Loader2, Terminal, FileDigit, Star } from "lucide-react";
import { getQuotes } from "./actions";
import type { Quote } from "@/types";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  zipCode: z.string().length(5, "Enter a valid 5-digit ZIP code"),
  age: z.coerce.number().min(65, "Must be at least 65").max(120, "Age seems too high"),
  gender: z.enum(["female", "male"]),
  tobacco: z.enum(["false", "true"]),
  plan: z.enum(["A", "F", "G", "N"]),
  effectiveDate: z.string().optional(),
  apply_discounts: z.boolean().default(true).optional(),
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

export default function QuotesPage() {
  const [isPending, startTransition] = useTransition();
  const [quotes, setQuotes] = useState<Quote[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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
    const validPlans = formSchema.shape.plan.options;
    if (planParam && validPlans.includes(planParam.toUpperCase())) {
        form.setValue('plan', planParam.toUpperCase() as z.infer<typeof formSchema>['plan']);
    }
  }, [form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
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
        <h1 className="font-headline text-3xl font-bold">Medicare Supplement Quotes</h1>
        <p className="text-muted-foreground">
          Enter your information to get instant quotes from top carriers.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Get Your Quotes</CardTitle>
          <CardDescription>All fields are required unless noted.</CardDescription>
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
                    <>Get Quotes</>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {isPending && (
          <Card className="flex flex-col items-center justify-center p-12">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <h3 className="mt-4 font-headline text-xl font-semibold">Finding the best rates...</h3>
            <p className="mt-2 text-muted-foreground">Please wait a moment.</p>
          </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Fetching Quotes</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {quotes && (
        <Card>
            <CardHeader>
                <CardTitle>Your Quotes</CardTitle>
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
                                    <TableCell className="font-medium">{quote.carrier.name}</TableCell>
                                    <TableCell>{quote.plan_name}</TableCell>
                                    <TableCell className="text-amber-500">{getStarRating(quote.am_best_rating)}</TableCell>
                                    <TableCell className="text-right font-bold">${quote.monthly_premium.toFixed(2)}</TableCell>
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
    </div>
  );
}
