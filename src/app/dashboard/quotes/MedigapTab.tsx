"use client";

import React, { useState, useTransition, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { Loader2, Terminal, FileDigit, Info, Check, HeartCrack, FileText, Smile, Heart, Hospital, Shield } from "lucide-react";
import { getDentalQuotes } from "./dental-actions";
import { getMedigapQuotes } from "./actions";
import { getHospitalIndemnityQuotes } from "./hospital-indemnity-actions";
import type { Quote, DentalQuote, HospitalIndemnityQuote, HospitalIndemnityRider, HospitalIndemnityBenefit, CancerQuote, CancerQuoteRequestValues } from "@/types";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { MedigapQuoteCard } from "@/components/medigap-quote-card";
import { DentalQuoteCard } from "@/components/dental-quote-card";
import { CancerQuoteCard } from "@/components/cancer-quote-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { HospitalIndemnityQuoteCard } from "@/components/hospital-indemnity-quote-card";
import { useAutofillProfile } from "@/hooks/use-autofill-profile";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app as firebaseApp } from "@/lib/firebase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MedigapQuoteTable } from "./medigap-quote-table";
import { MedigapQuoteDetailsModal } from "./MedigapQuoteDetailsModal";

export default function MedigapTab() {

  // State for dialog and selected quote
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);

const medigapFormSchema = z.object({
  zipCode: z.string().length(5, "Enter a valid 5-digit ZIP code"),
  age: z.coerce.number().min(65, "Must be at least 65").max(120, "Age seems too high"),
  gender: z.enum(["female", "male"]),
  tobacco: z.enum(["false", "true"]),
  plan: z.enum(["G", "N", "F"]),
  effectiveDate: z.string().optional(),
  apply_discounts: z.boolean().default(true).optional(),
});

const [isMedigapPending, startMedigapTransition] = useTransition();
const [medigapQuotes, setMedigapQuotes] = useState<Quote[] | null>(null);
const [medigapError, setMedigapError] = useState<string | null>(null);
const [medigapRaw, setMedigapRaw] = useState<any>(null);

const { profileData, isLoading: isProfileLoading, getFieldValue } = useAutofillProfile();

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

    useEffect(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const planParam = urlParams.get('plan');
      const validPlans = medigapFormSchema.shape.plan.options;
      if (planParam && validPlans.includes(planParam.toUpperCase() as any)) {
          medigapForm.setValue('plan', planParam.toUpperCase() as z.infer<typeof medigapFormSchema>['plan']);
      }
    }, [medigapForm]);

    // Autofill forms with user profile data
      useEffect(() => {
        if (!isProfileLoading && profileData) {
          // Autofill zipCode for forms that use it
          const zipCode = getFieldValue('zip');
          if (zipCode) {
            medigapForm.setValue('zipCode', zipCode);
            
          }
      // Autofill gender for all forms
          const gender = getFieldValue('gender');
          if (gender) {
            const formattedGender = gender.toLowerCase();
            if (formattedGender === 'male' || formattedGender === 'female') {
              medigapForm.setValue('gender', formattedGender as 'male' | 'female');
            }
          }
    
          // Calculate age from date of birth if available
          const dob = getFieldValue('dob');
          if (dob) {
            const birthDate = new Date(dob);
            const today = new Date();
            const calculatedAge = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            const finalAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
              ? calculatedAge - 1 
              : calculatedAge;
            
            if (finalAge >= 18 && finalAge <= 120) {
              if (finalAge >= 65) {
                medigapForm.setValue('age', finalAge);
              }
            }
          }
        }
      }, [isProfileLoading, profileData, getFieldValue, medigapForm,]);
    
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
      } else if (result.quotes) {
        // Ensure every quote has a stable id property
        const quotesWithId = result.quotes.map((q: any, idx: number) => {
          if (!q.id) {
            // Attach a stable id property if missing
            q.id = `${q.plan_name || 'plan'}-${q.carrier?.name || q.company_base?.name || 'carrier'}-${idx}`;
          }
          return q;
        });
        setMedigapQuotes(quotesWithId);
      } else {
        setMedigapQuotes([]);
      }
    });
  }
    

  // Handler for viewing details
  function handleViewDetails(id: string) {
    const quote = (medigapQuotes ?? []).find((q) => (q?.id ?? "") === id);
    setSelectedQuote(quote);
    setDetailsOpen(true);
  }

  // Handler for selecting a quote (open modal, do not navigate directly)
  function handleSelectQuote(id: string) {
    const quote = (medigapQuotes ?? []).find((q) => (q?.id ?? "") === id);
    setSelectedQuote(quote);
    setDetailsOpen(true);
  }

  return (
    <div className="max-w-[85rem] px-4 py-8 sm:px-6 lg:px-8 mx-auto">
      <div className="grid md:grid-cols-2 items-center gap-12">
        {/* Left: Headline, description, features */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 sm:text-4xl lg:text-5xl lg:leading-tight dark:text-white">
            Medicare Supplement Quotes
          </h1>
          <p className="mt-1 md:text-lg text-gray-800 dark:text-neutral-200">
            Get instant quotes from top-rated insurers. Compare plans, save money, and enjoy peace of mind.
          </p>
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-neutral-200">
              Why choose us?
            </h2>
            <ul className="mt-2 space-y-2">
              <li className="flex gap-x-3">
                <Check className="shrink-0 mt-0.5 w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-gray-600 dark:text-neutral-400">Industry-leading carriers</span>
              </li>
              <li className="flex gap-x-3">
                <Check className="shrink-0 mt-0.5 w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-gray-600 dark:text-neutral-400">Personalized quotes in seconds</span>
              </li>
              <li className="flex gap-x-3">
                <Check className="shrink-0 mt-0.5 w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-gray-600 dark:text-neutral-400">No spam, no sales pressure</span>
              </li>
            </ul>
          </div>
        </div>
        {/* Right: Form in card */}
        <div className="relative">
          <div className="flex flex-col border border-gray-200 rounded-xl p-4 sm:p-6 lg:p-10 dark:border-neutral-700 bg-white dark:bg-gray-900">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-neutral-200 mb-2">
              Fill in the form
            </h2>
            <Form {...medigapForm}>
              <form onSubmit={medigapForm.handleSubmit(onMedigapSubmit)}>
                <div className="mt-2 grid gap-4 lg:gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    <FormField control={medigapForm.control} name="zipCode" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block mb-2 text-sm text-gray-700 font-medium dark:text-white">ZIP Code</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ZIP" className="py-2.5 sm:py-3 px-4 block w-full border-gray-200 rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={medigapForm.control} name="age" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block mb-2 text-sm text-gray-700 font-medium dark:text-white">Age</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} placeholder="65" className="py-2.5 sm:py-3 px-4 block w-full border-gray-200 rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    <FormField control={medigapForm.control} name="gender" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block mb-2 text-sm text-gray-700 font-medium dark:text-white">Gender</FormLabel>
                        <FormControl>
                          <div className="flex items-center bg-white dark:bg-neutral-900 px-4 py-3 rounded-lg border border-gray-200 dark:border-neutral-700 gap-6">
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-6">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="female" className="text-blue-600" />
                                <span className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Female</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="male" className="text-blue-600" />
                                <span className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Male</span>
                              </div>
                            </RadioGroup>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={medigapForm.control} name="tobacco" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block mb-2 text-sm text-gray-700 font-medium dark:text-white">Tobacco</FormLabel>
                        <FormControl>
                          <div className="flex items-center bg-white dark:bg-neutral-900 px-4 py-3 rounded-lg border border-gray-200 dark:border-neutral-700 gap-6">
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-6">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="false" className="text-blue-600" />
                                <span className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer">No</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="true" className="text-blue-600" />
                                <span className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Yes</span>
                              </div>
                            </RadioGroup>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    <FormField control={medigapForm.control} name="plan" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block mb-2 text-sm text-gray-700 font-medium dark:text-white">Plan</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className="text-base py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20">
                              <SelectValue placeholder="Plan" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A">A</SelectItem>
                              <SelectItem value="F">F</SelectItem>
                              <SelectItem value="G">G</SelectItem>
                              <SelectItem value="N">N</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={medigapForm.control} name="effectiveDate" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block mb-2 text-sm text-gray-700 font-medium dark:text-white">Effective Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="py-2.5 sm:py-3 px-4 block w-full border-gray-200 rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <FormField control={medigapForm.control} name="apply_discounts" render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between w-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-600 px-2 py-2">
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Discounts</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-blue-600" />
                        </FormControl>
                      </FormItem>
                    )} />
                  </div>
                </div>
                <div className="mt-6 grid">
                  <Button type="submit" disabled={isMedigapPending} size="lg" className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                    {isMedigapPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>Get Quotes</>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
            <div className="mt-3 text-center">
              <p className="text-sm text-gray-500 dark:text-neutral-500">
                We'll get back to you in 1-2 business days.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isMedigapPending && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Processing Your Request
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Comparing Medicare Supplement plans from multiple carriers...
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {medigapError && (
        <Alert variant="destructive" className="mt-6">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Unable to Process Request</AlertTitle>
          <AlertDescription>{medigapError}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {Array.isArray(medigapQuotes) && medigapQuotes !== null && medigapQuotes!.length > 0 ? (
        <div className="mt-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
          <MedigapQuoteTable
            quotes={(medigapQuotes ?? []).map((q) => {
              const companyBase = (q as any).company_base ?? {};
              const monthly_premium = Number((((typeof (q as any).rate?.month === "number" ? (q as any).rate.month : q?.monthly_premium ?? 0) / 100).toFixed(2)));
              return {
                id: q?.id ?? Math.random().toString(36).slice(2),
                premium: monthly_premium,
                monthly_premium,
                carrier: {
                  name: companyBase.name ?? companyBase.full_name ?? "Unknown",
                  logo_url: companyBase.logo_url ?? null,
                },
                plan_name: q?.plan_name ?? "Unknown",
                coverage: q?.plan_type ?? "",
                additionalInfo: '',
              };
            })}
            onViewDetails={handleViewDetails}
            onSelectQuote={handleSelectQuote}
          />
          {/* Details Dialog */}
          <MedigapQuoteDetailsModal
            open={detailsOpen}
            onClose={() => setDetailsOpen(false)}
            quote={selectedQuote}
          />
        </div>
      ) : (
        medigapQuotes && (
          <div className="mt-6 text-center text-gray-500 dark:text-gray-400">
            <FileDigit className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg mb-2">No Medigap quotes found</p>
            <p className="text-sm">Try different criteria above</p>
          </div>
        )
      )}
    </div>
  );
}
