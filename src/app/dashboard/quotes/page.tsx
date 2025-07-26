"use client";

import React, { useState, useTransition, useEffect, useRef } from "react";
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
import { getMedigapQuotes, getDentalQuotes, getHospitalIndemnityQuotes } from "./actions";
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
import { useAutofillProfile } from "@/hooks/use-autofill-profile";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app as firebaseApp } from "@/lib/firebase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { QuoteResultsTable } from "./quote-results-table";


const medigapFormSchema = z.object({
  zipCode: z.string().length(5, "Enter a valid 5-digit ZIP code"),
  age: z.coerce.number().min(65, "Must be at least 65").max(120, "Age seems too high"),
  gender: z.enum(["female", "male"]),
  tobacco: z.enum(["false", "true"]),
  plan: z.enum(["A", "F", "G", "N"]), // Plan A is included but CSG might not support it
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

const cancerFormSchema = z.object({
    state: z.enum(["TX", "GA"], { required_error: "Please select a state."}),
    age: z.coerce.number().min(18, "Age must be at least 18").max(99, "Age must be between 18 and 99."),
    familyType: z.enum(["Applicant Only", "Applicant and Spouse", "Applicant and Child(ren)", "Applicant and Spouse and Child(ren)"], { required_error: "Please select a family type."}),
    tobaccoStatus: z.enum(["Non-Tobacco", "Tobacco"], { required_error: "Please select a tobacco status."}),
    premiumMode: z.enum(["Monthly Bank Draft", "Monthly Credit Card", "Monthly Direct Mail", "Annual"], { required_error: "Please select a premium mode."}),
    carcinomaInSitu: z.enum(["25%", "100%"], { required_error: "Please select a Carcinoma In Situ option."}),
    benefitAmount: z.coerce.number().min(5000, "Benefit amount must be at least $5,000").max(75000, "Benefit amount cannot exceed $75,000").refine(val => val % 1000 === 0, { message: "Benefit amount must be in increments of $1000." }),
});

export default function QuotesPage() {
  // Tab animation state
  const [activeTab, setActiveTab] = useState("medigap");
  const tabsRef = useRef<HTMLDivElement>(null);
  const [sliderStyle, setSliderStyle] = useState<React.CSSProperties>({});

  const [isMedigapPending, startMedigapTransition] = useTransition();
  const [medigapQuotes, setMedigapQuotes] = useState<Quote[] | null>(null);
  const [medigapError, setMedigapError] = useState<string | null>(null);
  const [medigapRaw, setMedigapRaw] = useState<any>(null);

  const [isDentalPending, startDentalTransition] = useTransition();
  const [dentalQuotes, setDentalQuotes] = useState<DentalQuote[] | null>(null);
  const [dentalError, setDentalError] = useState<string | null>(null);

  const [isHospitalIndemnityPending, startHospitalIndemnityTransition] = useTransition();
  const [hospitalIndemnityQuotes, setHospitalIndemnityQuotes] = useState<HospitalIndemnityQuote[] | null>(null);
  const [hospitalIndemnityError, setHospitalIndemnityError] = useState<string | null>(null);
  const [featuredQuote, setFeaturedQuote] = useState<HospitalIndemnityQuote | null>(null);
  const [selectedBaseBenefit, setSelectedBaseBenefit] = useState<HospitalIndemnityBenefit | null>(null);
  const [selectedRiders, setSelectedRiders] = useState<Record<string, HospitalIndemnityBenefit>>({});
  
  const [isCancerPending, startCancerTransition] = useTransition();
  const [cancerQuote, setCancerQuote] = useState<CancerQuote | null>(null);
  const [cancerError, setCancerError] = useState<string | null>(null);
  const { toast } = useToast();

  // Use autofill profile for user data
  const { profileData, isLoading: isProfileLoading, getFieldValue } = useAutofillProfile();

  // Tab configuration
  const tabs = [
    { id: "medigap", label: "Medicare Supplement", shortLabel: "Medicare", icon: FileText },
    { id: "dental", label: "Dental", shortLabel: "Dental", icon: Smile },
    { id: "cancer", label: "Cancer", shortLabel: "Cancer", icon: HeartCrack },
    { id: "hospital-indemnity", label: "Hospital Indemnity", shortLabel: "Hospital", icon: Hospital },
    { id: "life-insurance", label: "Life Insurance", shortLabel: "Life", icon: Shield },
  ];

  // Update slider position when active tab changes
  useEffect(() => {
    if (tabsRef.current) {
      const activeTabElement = tabsRef.current.querySelector(`[data-value="${activeTab}"]`) as HTMLElement;
      if (activeTabElement) {
        const tabsContainer = tabsRef.current;
        const containerRect = tabsContainer.getBoundingClientRect();
        const tabRect = activeTabElement.getBoundingClientRect();
        
        const left = tabRect.left - containerRect.left;
        const width = tabRect.width;
        
        setSliderStyle({
          transform: `translateX(${left}px)`,
          width: `${width}px`,
        });
      }
    }
  }, [activeTab]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
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

   const cancerForm = useForm<z.infer<typeof cancerFormSchema>>({
        resolver: zodResolver(cancerFormSchema),
        defaultValues: {
            state: "TX", // Changed default to Texas
            age: 65,
            familyType: "Applicant Only",
            tobaccoStatus: "Non-Tobacco",
            premiumMode: "Monthly Bank Draft",
            carcinomaInSitu: "25%",
            benefitAmount: 25000,
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
        dentalForm.setValue('zipCode', zipCode);
        hospitalIndemnityForm.setValue('zipCode', zipCode);
      }

      // Autofill gender for all forms
      const gender = getFieldValue('gender');
      if (gender) {
        const formattedGender = gender.toLowerCase();
        if (formattedGender === 'male' || formattedGender === 'female') {
          medigapForm.setValue('gender', formattedGender as 'male' | 'female');
          dentalForm.setValue('gender', formattedGender as 'male' | 'female');
          hospitalIndemnityForm.setValue('gender', formattedGender as 'male' | 'female');
        }
      }

      // Autofill state for cancer insurance (convert to state abbreviation if needed)
      const state = getFieldValue('state');
      if (state) {
        // If state is a full name, convert to abbreviation
        const stateMapping: Record<string, string> = {
          'Texas': 'TX',
          'Georgia': 'GA',
          'TX': 'TX',
          'GA': 'GA'
        };
        const stateAbbr = stateMapping[state] || state;
        if (stateAbbr === 'TX' || stateAbbr === 'GA') {
          cancerForm.setValue('state', stateAbbr as 'TX' | 'GA');
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
          if (finalAge >= 18) {
            dentalForm.setValue('age', finalAge);
            hospitalIndemnityForm.setValue('age', finalAge);
          }
          if (finalAge >= 18 && finalAge <= 99) {
            cancerForm.setValue('age', finalAge);
          }
        }
      }
    }
  }, [isProfileLoading, profileData, getFieldValue, medigapForm, dentalForm, hospitalIndemnityForm, cancerForm]);

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
    setMedigapRaw(null);
    startMedigapTransition(async () => {
      const result = await getMedigapQuotes({
        ...values,
        apply_discounts: values.apply_discounts || false,
      });
      if (result.error) {
        setMedigapError(result.error);
      }
      if (result.raw) {
        setMedigapRaw(result.raw);
        // Map raw.result to expected table format, safely check for result property
        const rawResult = (result.raw as { result?: any[] }).result;
        const mappedQuotes = Array.isArray(rawResult)
          ? rawResult.map((q: { key: any; id: any; company_base: { name_full: any; name: any; ambest_rating: any; logo_url?: string | null }; company: any; plan: any; plan_name: any; rate: { month: any; }; monthly_premium: any; plan_type: any; discounts: any; rate_type: any; }) => {
              const monthly_premium = Number(((q.rate?.month || q.monthly_premium || 0) / 100).toFixed(2));
              return {
                id: q.key || q.id || Math.random().toString(36).slice(2),
                premium: monthly_premium,
                monthly_premium,
                carrier: {
                  name: q.company_base?.name_full || q.company_base?.name || q.company || "Unknown",
                  logo_url: q.company_base?.logo_url || null,
                },
                plan_name: q.plan || q.plan_name || "Unknown",
                plan_type: q.plan || q.plan_type || "",
                am_best_rating: q.company_base?.ambest_rating || "",
                discounts: q.discounts || [],
                rate_type: q.rate_type || "",
              };
            })
          : [];
        setMedigapQuotes(mappedQuotes);
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
  
  async function onCancerSubmit(values: z.infer<typeof cancerFormSchema>) {
    setCancerError(null);
    setCancerQuote(null);
    startCancerTransition(async () => {
      try {
        if (!firebaseApp) {
          throw new Error("Firebase is not configured. Please contact support.");
        }
        const functions = getFunctions(firebaseApp);
        const getCancerQuoteFunction = httpsCallable<CancerQuoteRequestValues, CancerQuote>(functions, 'getCancerInsuranceQuote');
        
        const result = await getCancerQuoteFunction(values);
        setCancerQuote(result.data);

      } catch (error: any) {
        console.error("Cancer Quote Error:", error);
        setCancerError(error.message || "An unknown error occurred while fetching your quote.");
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
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="relative overflow-x-auto" ref={tabsRef}>
            {/* Animated slider background */}
            <div 
              className="absolute top-2 h-[calc(100%-16px)] bg-white dark:bg-blue-900 rounded-lg shadow-lg transition-all duration-300 ease-in-out z-0"
              style={sliderStyle}
            />
            
            <TabsList className="relative grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800 shadow-lg rounded-xl p-2 z-10 min-w-fit">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger 
                    key={tab.id}
                    value={tab.id}
                    data-value={tab.id}
                    className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium rounded-lg transition-all duration-300 relative z-20 whitespace-nowrap ${
                      activeTab === tab.id 
                        ? 'text-blue-700 dark:text-blue-200' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    {/* Medicare Supplement responsive text */}
                    {tab.id === 'medigap' && (
                      <>
                        <span className="hidden lg:inline">Medicare Supplement</span>
                        <span className="lg:hidden">Medicare</span>
                      </>
                    )}
                    {/* Hospital Indemnity responsive text */}
                    {tab.id === 'hospital-indemnity' && (
                      <>
                        <span className="hidden lg:inline">Hospital Indemnity</span>
                        <span className="lg:hidden">Hospital</span>
                      </>
                    )}
                    {/* Life Insurance responsive text */}
                    {tab.id === 'life-insurance' && (
                      <>
                        <span className="hidden lg:inline">Life Insurance</span>
                        <span className="lg:hidden">Life</span>
                      </>
                    )}
                    {/* Simple labels for Dental and Cancer */}
                    {(tab.id === 'dental' || tab.id === 'cancer') && (
                      <span>{tab.label}</span>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
        <TabsContent value="medigap" className="mt-4 sm:mt-6">
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
                            )} />s
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
                                        <label className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Female</label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="male" className="text-blue-600" />
                                        <label className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Male</label>
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
                                        <label className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer">No</label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="true" className="text-blue-600" />
                                        <label className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Yes</label>
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
            {medigapQuotes && (
              <div className="mt-6">
                {/* Top 3 MedigapQuoteCards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {medigapQuotes.slice(0, 3).map((quote) => (
                    <MedigapQuoteCard key={quote.id} quote={quote} />
                  ))}
                </div>
                {/* Remaining quotes in table */}
                {medigapQuotes.length > 3 && (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
                    <QuoteResultsTable
                      quotes={medigapQuotes.slice(3)}
                      quoteType="medigap"
                      onViewDetails={(id: string) => {/* handle details popup or navigation */}}
                      onSelectQuote={(id: string) => {/* handle quote selection */}}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Raw API Response - Debugging */}
            {medigapRaw && (
              <div className="mt-6 bg-yellow-50 dark:bg-yellow-900 rounded-2xl shadow-lg border border-yellow-200 dark:border-yellow-700 p-6">
                <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-100 mb-2">Medigap Raw API Response</h3>
                <pre className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 text-xs overflow-x-auto max-h-[600px]">
                  {JSON.stringify(medigapRaw, null, 2)}
                </pre>
              </div>
            )}
        </TabsContent>
        <TabsContent value="dental" className="mt-4 sm:mt-6">
            <div className="max-w-[85rem] px-4 py-8 sm:px-6 lg:px-8 mx-auto">
              <div className="grid md:grid-cols-2 items-center gap-12">
                {/* Left: Headline, description, features */}
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 sm:text-4xl lg:text-5xl lg:leading-tight dark:text-white">
                    Dental Insurance Quotes
                  </h1>
                  <p className="mt-1 md:text-lg text-gray-800 dark:text-neutral-200">
                    Provide your information to receive competitive dental insurance quotes from leading providers.
                  </p>
                  <div className="mt-8">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-neutral-200">
                      Why choose us?
                    </h2>
                    <ul className="mt-2 space-y-2">
                      <li className="flex gap-x-3">
                        <Check className="shrink-0 mt-0.5 w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="text-gray-600 dark:text-neutral-400">Top dental carriers</span>
                      </li>
                      <li className="flex gap-x-3">
                        <Check className="shrink-0 mt-0.5 w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="text-gray-600 dark:text-neutral-400">Instant quotes, no spam</span>
                      </li>
                      <li className="flex gap-x-3">
                        <Check className="shrink-0 mt-0.5 w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="text-gray-600 dark:text-neutral-400">Affordable plans</span>
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
                    <Form {...dentalForm}>
                      <form onSubmit={dentalForm.handleSubmit(onDentalSubmit)}>
                        <div className="mt-2 grid gap-4 lg:gap-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                            <FormField control={dentalForm.control} name="zipCode" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="block mb-2 text-sm text-gray-700 font-medium dark:text-white">ZIP Code</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="ZIP" className="py-2.5 sm:py-3 px-4 block w-full border-gray-200 rounded-lg sm:text-sm focus:border-green-500 focus:ring-green-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={dentalForm.control} name="age" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="block mb-2 text-sm text-gray-700 font-medium dark:text-white">Age</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} placeholder="25" className="py-2.5 sm:py-3 px-4 block w-full border-gray-200 rounded-lg sm:text-sm focus:border-green-500 focus:ring-green-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                            <FormField control={dentalForm.control} name="gender" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="block mb-2 text-sm text-gray-700 font-medium dark:text-white">Gender</FormLabel>
                                <FormControl>
                                  <div className="flex items-center bg-white dark:bg-neutral-900 px-4 py-3 rounded-lg border border-gray-200 dark:border-neutral-700 gap-6">
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-6">
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="female" className="text-green-600" />
                                        <label className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Female</label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="male" className="text-green-600" />
                                        <label className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Male</label>
                                      </div>
                                    </RadioGroup>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={dentalForm.control} name="tobacco" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="block mb-2 text-sm text-gray-700 font-medium dark:text-white">Tobacco</FormLabel>
                                <FormControl>
                                  <div className="flex items-center bg-white dark:bg-neutral-900 px-4 py-3 rounded-lg border border-gray-200 dark:border-neutral-700 gap-6">
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-6">
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="false" className="text-green-600" />
                                        <label className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer">No</label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="true" className="text-green-600" />
                                        <label className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Yes</label>
                                      </div>
                                    </RadioGroup>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                        </div>
                        <div className="mt-6 grid">
                          <Button type="submit" disabled={isDentalPending} size="lg" className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-green-600 text-white hover:bg-green-700 focus:outline-hidden focus:bg-green-700 disabled:opacity-50 disabled:pointer-events-none">
                            {isDentalPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating Quotes...
                              </>
                            ) : (
                              <>Get Dental Insurance Quotes</>
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
            </div>

            {/* Loading State */}
            {isDentalPending && (
                <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                            <Loader2 className="w-8 h-8 text-green-600 dark:text-green-400 animate-spin" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Processing Your Request
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Comparing dental insurance plans from multiple providers...
                        </p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {dentalError && (
                <Alert variant="destructive" className="mt-6">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Unable to Process Request</AlertTitle>
                    <AlertDescription>{dentalError}</AlertDescription>
                </Alert>
            )}

            {/* Results */}
            {dentalQuotes && (
                <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
                    <div className="text-center mb-8">
                        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Your Dental Insurance Quotes
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                            {dentalQuotes.length} plan{dentalQuotes.length !== 1 ? 's' : ''} available based on your criteria
                        </p>
                    </div>
                    
                    {dentalQuotes.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                            {dentalQuotes.map((quote) => <DentalQuoteCard key={quote.id} quote={quote} />)}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <FileDigit className="h-12 w-12 mx-auto mb-4 text-gray-400"/>
                            <p className="text-lg mb-2">No dental plans found</p>
                            <p className="text-sm">Try different criteria above</p>
                        </div>
                    )}
                </div>
            )}
        </TabsContent>
        <TabsContent value="cancer" className="mt-4 sm:mt-6">
            <div className="max-w-[85rem] px-4 py-8 sm:px-6 lg:px-8 mx-auto">
              <div className="grid md:grid-cols-2 items-center gap-12">
                {/* Left: Headline, description, features */}
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 sm:text-4xl lg:text-5xl lg:leading-tight dark:text-white">
                    Cancer Insurance Quote
                  </h1>
                  <p className="mt-1 md:text-lg text-gray-800 dark:text-neutral-200">
                    Fill out the fields below to get a personalized cancer insurance quote.
                  </p>
                  <div className="mt-8">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-neutral-200">
                      Why choose us?
                    </h2>
                    <ul className="mt-2 space-y-2">
                      <li className="flex gap-x-3">
                        <Check className="shrink-0 mt-0.5 w-5 h-5 text-pink-600 dark:text-pink-400" />
                        <span className="text-gray-600 dark:text-neutral-400">Specialized cancer plans</span>
                      </li>
                      <li className="flex gap-x-3">
                        <Check className="shrink-0 mt-0.5 w-5 h-5 text-pink-600 dark:text-pink-400" />
                        <span className="text-gray-600 dark:text-neutral-400">Fast, confidential quotes</span>
                      </li>
                      <li className="flex gap-x-3">
                        <Check className="shrink-0 mt-0.5 w-5 h-5 text-pink-600 dark:text-pink-400" />
                        <span className="text-gray-600 dark:text-neutral-400">Flexible coverage options</span>
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
                    <Form {...cancerForm}>
                      <form onSubmit={cancerForm.handleSubmit(onCancerSubmit)}>
                        <div className="mt-2 grid gap-4 lg:gap-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                            <FormField control={cancerForm.control} name="state" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="block mb-2 text-sm text-gray-700 font-medium dark:text-white">State</FormLabel>
                                <FormControl>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className="text-base py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-600 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/20">
                                      <SelectValue placeholder="State" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="TX">Texas</SelectItem>
                                      <SelectItem value="GA">Georgia</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={cancerForm.control} name="age" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="block mb-2 text-sm text-gray-700 font-medium dark:text-white">Age</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} placeholder="65" className="py-2.5 sm:py-3 px-4 block w-full border-gray-200 rounded-lg sm:text-sm focus:border-pink-500 focus:ring-pink-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                            <FormField control={cancerForm.control} name="tobaccoStatus" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="block mb-2 text-sm text-gray-700 font-medium dark:text-white">Tobacco Status</FormLabel>
                                <FormControl>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className="text-base py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-600 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/20">
                                      <SelectValue placeholder="Tobacco Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Non-Tobacco">Non-Tobacco</SelectItem>
                                      <SelectItem value="Tobacco">Tobacco</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={cancerForm.control} name="familyType" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="block mb-2 text-sm text-gray-700 font-medium dark:text-white">Family Type</FormLabel>
                                <FormControl>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className="text-base py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-600 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/20">
                                      <SelectValue placeholder="Family Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Applicant Only">Applicant Only</SelectItem>
                                      <SelectItem value="Applicant and Spouse">Applicant and Spouse</SelectItem>
                                      <SelectItem value="Applicant and Child(ren)">Applicant and Child(ren)</SelectItem>
                                      <SelectItem value="Applicant and Spouse and Child(ren)">Applicant, Spouse, and Child(ren)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                            <FormField control={cancerForm.control} name="premiumMode" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="block mb-2 text-sm text-gray-700 font-medium dark:text-white">Premium Mode</FormLabel>
                                <FormControl>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className="text-base py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-600 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/20">
                                      <SelectValue placeholder="Premium Mode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Monthly Bank Draft">Monthly Bank Draft</SelectItem>
                                      <SelectItem value="Monthly Credit Card">Monthly Credit Card</SelectItem>
                                      <SelectItem value="Monthly Direct Mail">Monthly Direct Mail</SelectItem>
                                      <SelectItem value="Annual">Annual</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={cancerForm.control} name="carcinomaInSitu" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="block mb-2 text-sm text-gray-700 font-medium dark:text-white">Carcinoma In Situ</FormLabel>
                                <FormControl>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className="text-base py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-600 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/20">
                                      <SelectValue placeholder="Carcinoma In Situ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="25%">25%</SelectItem>
                                      <SelectItem value="100%">100%</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                          <div className="grid grid-cols-1 gap-4">
                            <FormField control={cancerForm.control} name="benefitAmount" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="block mb-2 text-sm text-gray-700 font-medium dark:text-white">Benefit Amount</FormLabel>
                                <FormControl>
                                  <Input type="number" step="1000" {...field} placeholder="$25,000" className="py-2.5 sm:py-3 px-4 block w-full border-gray-200 rounded-lg sm:text-sm focus:border-pink-500 focus:ring-pink-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                        </div>
                        <div className="mt-6 grid">
                          <Button type="submit" disabled={isCancerPending} size="lg" className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-pink-600 text-white hover:bg-pink-700 focus:outline-hidden focus:bg-pink-700 disabled:opacity-50 disabled:pointer-events-none">
                            {isCancerPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Calculating...
                              </>
                            ) : (
                              <>Get Cancer Insurance Quote</>
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
            </div>
        </TabsContent>
        <TabsContent value="hospital-indemnity" className="mt-6">
            <div className="max-w-[85rem] px-4 py-8 sm:px-6 lg:px-8 mx-auto">
              <div className="grid md:grid-cols-2 items-center gap-12">
                {/* Left: Headline, description, features */}
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 sm:text-4xl lg:text-5xl lg:leading-tight dark:text-white">
                    Hospital Indemnity Quotes
                  </h1>
                  <p className="mt-1 md:text-lg text-gray-800 dark:text-neutral-200">
                    Fill out the fields below to get instant quotes. Customize your plan with optional riders.
                  </p>
                  <div className="mt-8">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-neutral-200">
                      Why choose us?
                    </h2>
                    <ul className="mt-2 space-y-2">
                      <li className="flex gap-x-3">
                        <Check className="shrink-0 mt-0.5 w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-gray-600 dark:text-neutral-400">Customize your coverage</span>
                      </li>
                      <li className="flex gap-x-3">
                        <Check className="shrink-0 mt-0.5 w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-gray-600 dark:text-neutral-400">Top-rated carriers</span>
                      </li>
                      <li className="flex gap-x-3">
                        <Check className="shrink-0 mt-0.5 w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-gray-600 dark:text-neutral-400">Instant quotes</span>
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
                    <Form {...hospitalIndemnityForm}>
                      <form onSubmit={hospitalIndemnityForm.handleSubmit(onHospitalIndemnitySubmit)}>
                        <div className="mt-2 grid gap-4 lg:gap-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                            <FormField control={hospitalIndemnityForm.control} name="zipCode" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="block mb-2 text-sm text-gray-700 font-medium dark:text-white">ZIP Code</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="ZIP" className="py-2.5 sm:py-3 px-4 block w-full border-gray-200 rounded-lg sm:text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={hospitalIndemnityForm.control} name="age" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="block mb-2 text-sm text-gray-700 font-medium dark:text-white">Age</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} placeholder="65" className="py-2.5 sm:py-3 px-4 block w-full border-gray-200 rounded-lg sm:text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                            <FormField control={hospitalIndemnityForm.control} name="gender" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="block mb-2 text-sm text-gray-700 font-medium dark:text-white">Gender</FormLabel>
                                <FormControl>
                                  <div className="flex items-center bg-white dark:bg-neutral-900 px-4 py-3 rounded-lg border border-gray-200 dark:border-neutral-700 gap-6">
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-6">
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="female" className="text-indigo-600" />
                                        <label className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Female</label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="male" className="text-indigo-600" />
                                        <label className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Male</label>
                                      </div>
                                    </RadioGroup>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={hospitalIndemnityForm.control} name="tobacco" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="block mb-2 text-sm text-gray-700 font-medium dark:text-white">Tobacco</FormLabel>
                                <FormControl>
                                  <div className="flex items-center bg-white dark:bg-neutral-900 px-4 py-3 rounded-lg border border-gray-200 dark:border-neutral-700 gap-6">
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-6">
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="false" className="text-indigo-600" />
                                        <label className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer">No</label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="true" className="text-indigo-600" />
                                        <label className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Yes</label>
                                      </div>
                                    </RadioGroup>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                        </div>
                        <div className="mt-6 grid">
                          <Button type="submit" disabled={isHospitalIndemnityPending} size="lg" className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-hidden focus:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none">
                            {isHospitalIndemnityPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating Quotes...
                              </>
                            ) : (
                              <>Get Hospital Indemnity Quotes</>
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
            </div>
        </TabsContent>
        <TabsContent value="life-insurance" className="mt-6">
            <div className="max-w-[85rem] px-4 py-8 sm:px-6 lg:px-8 mx-auto">
              <div className="grid md:grid-cols-2 items-center gap-12">
                {/* Left: Headline, description, features */}
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 sm:text-4xl lg:text-5xl lg:leading-tight dark:text-white">
                    Life Insurance
                  </h1>
                  <p className="mt-1 md:text-lg text-gray-800 dark:text-neutral-200">
                    This is a simplified application. For a real quote, a licensed agent would contact you.
                  </p>
                  <div className="mt-8">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-neutral-200">
                      Why choose us?
                    </h2>
                    <ul className="mt-2 space-y-2">
                      <li className="flex gap-x-3">
                        <Check className="shrink-0 mt-0.5 w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-gray-600 dark:text-neutral-400">Simple online application</span>
                      </li>
                      <li className="flex gap-x-3">
                        <Check className="shrink-0 mt-0.5 w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-gray-600 dark:text-neutral-400">Trusted by thousands</span>
                      </li>
                      <li className="flex gap-x-3">
                        <Check className="shrink-0 mt-0.5 w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-gray-600 dark:text-neutral-400">Expert support</span>
                      </li>
                    </ul>
                  </div>
                </div>
                {/* Right: Form in card */}
                <div className="relative">
                  <div className="flex flex-col border border-gray-200 rounded-xl p-4 sm:p-6 lg:p-10 dark:border-neutral-700 bg-white dark:bg-gray-900">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-neutral-200 mb-2">
                      Start your application
                    </h2>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Full Application Coming Soon!</AlertTitle>
                      <AlertDescription>
                        We are working to bring you a full online application for this plan type. For now, you can use this simplified version.
                      </AlertDescription>
                    </Alert>
                    <div className="mt-6 flex justify-end">
                      <Button asChild size="lg"><Link href="/dashboard/apply?type=life-insurance">Start Life Insurance Application</Link></Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </TabsContent>
       </Tabs>
      </div>
    </div>
  );
}

