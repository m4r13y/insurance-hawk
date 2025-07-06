"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, ArrowRight, Info, Heart, Eye, Ear, Pill } from "lucide-react";
import { getInitialRecommendationInstructions, getPlanRecommendation } from "./actions";
import type { Plan } from "@/types";

const formSchema = z.object({
  age: z.coerce.number().min(64, "Must be at least 64"),
  zipCode: z.string().length(5, "Enter a valid 5-digit zip code"),
  healthStatus: z.enum(["excellent", "good", "fair", "poor"]),
  conditions: z.string().optional(),
  medications: z.string().optional(),
  preferences: z.array(z.string()).optional(),
});

type Recommendation = {
  plan: Plan;
  explanation: string;
};

export default function RecommendationsPage() {
  const [isPending, startTransition] = useTransition();
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<string>("");

  useEffect(() => {
    getInitialRecommendationInstructions("Sarah").then(res => {
      if (res.instructions) {
        setInstructions(res.instructions);
      }
    });
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      zipCode: "",
      preferences: [],
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null);
    setRecommendation(null);
    startTransition(async () => {
      const result = await getPlanRecommendation(values);
      if (result.error) {
        setError(result.error);
      }
      if (result.recommendation) {
        setRecommendation(result.recommendation);
      }
    });
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="space-y-6">
        <div className="space-y-2">
            <h1 className="font-headline text-3xl font-bold">AI Plan Recommendations</h1>
            <p className="text-muted-foreground">
                Let our AI find the best Medicare plan for your needs.
            </p>
        </div>

        {instructions && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>How to get the best recommendations</AlertTitle>
            <AlertDescription>{instructions}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
            <CardDescription>
              Please provide details about your health and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="age" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="zipCode" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zip Code</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField control={form.control} name="healthStatus" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Overall Health</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select your health status" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="conditions" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chronic Conditions</FormLabel>
                      <FormControl><Textarea placeholder="e.g., Diabetes, Hypertension, Arthritis" {...field} /></FormControl>
                      <FormDescription>List any ongoing health conditions.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="medications" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prescription Drugs</FormLabel>
                      <FormControl><Textarea placeholder="e.g., Lisinopril, Metformin" {...field} /></FormControl>
                      <FormDescription>List your current medications.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isPending} className="w-full bg-accent hover:bg-accent/90">
                  {isPending ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait...</>) : (<>Get My Recommendation</>)}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        {isPending && (
          <Card className="flex h-full flex-col items-center justify-center">
            <CardContent className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <h3 className="mt-4 font-headline text-xl font-semibold">Analyzing your needs...</h3>
              <p className="mt-2 text-muted-foreground">Our AI is crafting your personalized recommendation.</p>
            </CardContent>
          </Card>
        )}
        {error && (
            <Card className="flex h-full flex-col items-center justify-center bg-destructive/10 border-destructive">
                <CardContent className="text-center text-destructive-foreground">
                    <h3 className="mt-4 font-headline text-xl font-semibold">An Error Occurred</h3>
                    <p className="mt-2 text-red-800">{error}</p>
                </CardContent>
            </Card>
        )}
        {recommendation && (
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                <Sparkles className="h-6 w-6 text-accent" />
                AI Recommended Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border bg-card p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <Badge variant="secondary" className="mb-2">{recommendation.plan.type}</Badge>
                        <h4 className="text-lg font-bold">{recommendation.plan.name}</h4>
                        <p className="text-muted-foreground">{recommendation.plan.provider}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold">${recommendation.plan.premium}</p>
                        <p className="text-sm text-muted-foreground">/monthly</p>
                    </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div><p className="text-muted-foreground">Deductible</p><p className="font-medium">${recommendation.plan.deductible}</p></div>
                    <div><p className="text-muted-foreground">Max Out-of-Pocket</p><p className="font-medium">${recommendation.plan.maxOutOfPocket}</p></div>
                </div>
                 <div className="mt-4 flex flex-wrap gap-2">
                    {recommendation.plan.features.prescriptionDrug && <Badge variant="outline"><Pill className="mr-1.5 h-3 w-3"/>Drugs</Badge>}
                    {recommendation.plan.features.dental && <Badge variant="outline"><Heart className="mr-1.5 h-3 w-3"/>Dental</Badge>}
                    {recommendation.plan.features.vision && <Badge variant="outline"><Eye className="mr-1.5 h-3 w-3"/>Vision</Badge>}
                    {recommendation.plan.features.hearing && <Badge variant="outline"><Ear className="mr-1.5 h-3 w-3"/>Hearing</Badge>}
                </div>
              </div>
              <div className="mt-4">
                <h5 className="font-semibold">Why we recommend this plan:</h5>
                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{recommendation.explanation}</p>
              </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" asChild>
                    <Link href="/dashboard/apply">Apply for this Plan <ArrowRight className="ml-2 h-4 w-4"/></Link>
                </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
