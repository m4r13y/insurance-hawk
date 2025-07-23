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
        // Map raw.result to expected table format
        const mappedQuotes = Array.isArray(result.raw.result)
          ? result.raw.result.map((q: { key: any; id: any; company_base: { name_full: any; name: any; ambest_rating: any; }; company: any; plan: any; plan_name: any; rate: { month: any; }; monthly_premium: any; plan_type: any; discounts: any; rate_type: any; }) => ({
              id: q.key || q.id || Math.random().toString(36).slice(2),
              carrier: q.company_base?.name_full || q.company_base?.name || q.company || "Unknown",
              plan_name: q.plan || q.plan_name || "Unknown",
              monthly_premium: Number(((q.rate?.month || q.monthly_premium || 0) / 100).toFixed(2)),
              plan_type: q.plan || q.plan_type || "",
              am_best_rating: q.company_base?.ambest_rating || "",
              discounts: q.discounts || [],
              rate_type: q.rate_type || "",
              // Add more fields as needed
            }))
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
                            )} />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                            <FormField control={medigapForm.control} name="gender" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="block mb-2 text-sm text-gray-700 font-medium dark:text-white">Gender</FormLabel>
                                <FormControl>
                                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4 pt-2">
                                    <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 transition-colors cursor-pointer">
                                      <RadioGroupItem value="female" className="text-blue-600" />
                                      <label className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Female</label>
                                    </div>
                                    <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 transition-colors cursor-pointer">
                                      <RadioGroupItem value="male" className="text-blue-600" />
                                      <label className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Male</label>
                                    </div>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={medigapForm.control} name="tobacco" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="block mb-2 text-sm text-gray-700 font-medium dark:text-white">Tobacco</FormLabel>
                                <FormControl>
                                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4 pt-2">
                                    <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 transition-colors cursor-pointer">
                                      <RadioGroupItem value="false" className="text-blue-600" />
                                      <label className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer">No</label>
                                    </div>
                                    <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 transition-colors cursor-pointer">
                                      <RadioGroupItem value="true" className="text-blue-600" />
                                      <label className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Yes</label>
                                    </div>
                                  </RadioGroup>
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
                  <QuoteResultsTable
                    quotes={medigapQuotes.slice(3)}
                    quoteType="medigap"
                    onViewDetails={(id: string) => {/* handle details popup or navigation */}}
                    onSelectQuote={(id: string) => {/* handle quote selection */}}
                  />
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-6 sm:p-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Dental Insurance Quotes
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">
                        Provide your information to receive competitive dental insurance quotes from leading providers.
                    </p>
                </div>
                
                <div className="p-6 sm:p-8">
                    <Form {...dentalForm}>
                        <form onSubmit={dentalForm.handleSubmit(onDentalSubmit)} className="space-y-8">
                            
                            {/* Location Information */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                        <span className="text-green-600 dark:text-green-400 font-semibold text-sm">1</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Location</h3>
                                </div>
                                <div className="ml-11">
                                    <FormField 
                                        control={dentalForm.control} 
                                        name="zipCode" 
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">ZIP Code</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        placeholder="Enter your ZIP code" 
                                                        {...field} 
                                                        className="text-lg py-3 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} 
                                    />
                                </div>
                            </div>

                            {/* Personal Information */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                        <span className="text-green-600 dark:text-green-400 font-semibold text-sm">2</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
                                </div>
                                <div className="ml-11 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <FormField 
                                        control={dentalForm.control} 
                                        name="age" 
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Age</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="number" 
                                                        placeholder="25" 
                                                        {...field} 
                                                        className="text-lg py-3 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} 
                                    />
                                    <FormField 
                                        control={dentalForm.control} 
                                        name="gender" 
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Gender</FormLabel>
                                                <FormControl>
                                                    <RadioGroup 
                                                        onValueChange={field.onChange} 
                                                        defaultValue={field.value} 
                                                        className="flex gap-4 pt-2"
                                                    >
                                                        <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-green-300 transition-colors cursor-pointer">
                                                            <RadioGroupItem value="female" className="text-green-600" />
                                                            <label className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Female</label>
                                                        </div>
                                                        <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-green-300 transition-colors cursor-pointer">
                                                            <RadioGroupItem value="male" className="text-green-600" />
                                                            <label className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer">Male</label>
                                                        </div>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Health Information */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                        <span className="text-green-600 dark:text-green-400 font-semibold text-sm">3</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Health Information</h3>
                                </div>
                                <div className="ml-11">
                                    <FormField 
                                        control={dentalForm.control} 
                                        name="tobacco" 
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Tobacco Use</FormLabel>
                                                <FormControl>
                                                    <RadioGroup 
                                                        onValueChange={field.onChange} 
                                                        defaultValue={field.value} 
                                                        className="flex gap-4 pt-2"
                                                    >
                                                        <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800 px-6 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-green-300 transition-colors cursor-pointer">
                                                            <RadioGroupItem value="false" className="text-green-600" />
                                                            <div>
                                                                <label className="font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">Non-Tobacco User</label>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">Preferred rates available</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800 px-6 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-green-300 transition-colors cursor-pointer">
                                                            <RadioGroupItem value="true" className="text-green-600" />
                                                            <div>
                                                                <label className="font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">Tobacco User</label>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">Standard rates apply</p>
                                                            </div>
                                                        </div>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-center pt-4">
                                <Button 
                                    type="submit" 
                                    disabled={isDentalPending} 
                                    size="lg" 
                                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isDentalPending ? (
                                        <>
                                            <Loader2 className="mr-3 h-5 w-5 animate-spin" /> 
                                            Generating Quotes...
                                        </>
                                    ) : (
                                        <>
                                            Get Dental Insurance Quotes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
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
            <Card>
                <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-lg sm:text-xl">Cancer Insurance Quote</CardTitle>
                    <CardDescription className="text-sm sm:text-base">Fill out the fields below to get a personalized cancer insurance quote.</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                    <Form {...cancerForm}>
                        <form onSubmit={cancerForm.handleSubmit(onCancerSubmit)} className="space-y-6 sm:space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                 <FormField control={cancerForm.control} name="state" render={({ field }) => ( <FormItem><FormLabel>State</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="TX">Texas</SelectItem><SelectItem value="GA">Georgia</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                                 <FormField control={cancerForm.control} name="age" render={({ field }) => ( <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                 <FormField control={cancerForm.control} name="tobaccoStatus" render={({ field }) => ( <FormItem><FormLabel>Tobacco Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Non-Tobacco">Non-Tobacco</SelectItem><SelectItem value="Tobacco">Tobacco</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                                 <FormField control={cancerForm.control} name="familyType" render={({ field }) => ( <FormItem className="sm:col-span-2 lg:col-span-2"><FormLabel>Family Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Applicant Only">Applicant Only</SelectItem><SelectItem value="Applicant and Spouse">Applicant and Spouse</SelectItem><SelectItem value="Applicant and Child(ren)">Applicant and Child(ren)</SelectItem><SelectItem value="Applicant and Spouse and Child(ren)">Applicant, Spouse, and Child(ren)</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                                 <FormField control={cancerForm.control} name="premiumMode" render={({ field }) => ( <FormItem><FormLabel>Premium Mode</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Monthly Bank Draft">Monthly Bank Draft</SelectItem><SelectItem value="Monthly Credit Card">Monthly Credit Card</SelectItem><SelectItem value="Monthly Direct Mail">Monthly Direct Mail</SelectItem><SelectItem value="Annual">Annual</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                                 <FormField control={cancerForm.control} name="carcinomaInSitu" render={({ field }) => ( <FormItem><FormLabel>Carcinoma In Situ</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="25%">25%</SelectItem><SelectItem value="100%">100%</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                                 <FormField control={cancerForm.control} name="benefitAmount" render={({ field }) => ( <FormItem><FormLabel>Benefit Amount</FormLabel><FormControl><Input type="number" step="1000" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            </div>
                            <div className="flex flex-col sm:flex-row justify-end items-center gap-3 sm:gap-4">
                                <Button type="submit" disabled={isCancerPending} size="lg" className="w-full sm:w-auto">
                                {isCancerPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Calculating...</> : "Get Quote"}
                                </Button>
                            </div>
                        </form>
                    </Form>

                    {cancerError && (
                        <Alert variant="destructive" className="mt-8">
                            <Terminal className="h-4 w-4" />
                            <AlertTitle>Error Calculating Quote</AlertTitle>
                            <AlertDescription>{cancerError}</AlertDescription>
                        </Alert>
                    )}
                    
                    <Dialog open={!!cancerQuote} onOpenChange={(open) => !open && setCancerQuote(null)}>
                        <DialogContent className="p-0 max-w-md border-0 bg-transparent shadow-none [&>button]:hidden">
                           {cancerQuote && (
                                <>
                                    <DialogHeader className="sr-only">
                                        <DialogTitle>Your Cancer Insurance Quote</DialogTitle>
                                        <DialogDescription>
                                            A quote from {cancerQuote.carrier} for {cancerQuote.plan_name}.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <CancerQuoteCard quote={cancerQuote} />
                                </>
                           )}
                        </DialogContent>
                    </Dialog>

                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="hospital-indemnity" className="mt-6">
             <Card>
                <CardHeader>
                    <CardTitle>Hospital Indemnity Quotes</CardTitle>
                    <CardDescription>Fill out the fields below to get instant quotes. Customize your plan with optional riders.</CardDescription>
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

                    {isHospitalIndemnityPending && (
                        <div className="mt-8 flex flex-col items-center justify-center p-12 border rounded-lg bg-slate-50/50">
                            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                            <h3 className="mt-4 font-headline text-xl font-semibold">Finding hospital indemnity plans...</h3>
                            <p className="mt-2 text-muted-foreground">Please wait a moment.</p>
                        </div>
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
                                    <div className="lg:col-span-2 overflow-hidden rounded-xl border">
                                        <div className="p-6">
                                        <h3 className="font-headline text-2xl sm:text-3xl">{featuredQuote.carrier.name}</h3>
                                        <p className="text-muted-foreground">{featuredQuote.plan_name}</p>
                                        </div>
                                        <div className="space-y-8 border-t p-6">
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
                                                            <div key={i} className="flex items-center rounded-md border bg-green-50 p-4">
                                                                <Check className="mr-4 h-5 w-5 text-green-600"/>
                                                                <div className="flex-1">
                                                                    <p className="font-medium">{rider.name} (Included)</p>
                                                                    {rider.note && <p className="mt-1 text-xs text-muted-foreground">{rider.note}</p>}
                                                                </div>
                                                            </div>
                                                            )
                                                    }
                                                    
                                                    if (rider.benefits.length === 1) {
                                                        const benefit = rider.benefits[0];
                                                        return (
                                                            <div key={i} className="flex items-center rounded-md border bg-background p-4">
                                                                <Switch 
                                                                    id={`rider-${i}`}
                                                                    onCheckedChange={() => handleRiderToggle(rider)}
                                                                    checked={!!selectedRiders[rider.name]}
                                                                />
                                                                <Label htmlFor={`rider-${i}`} className="ml-4 flex w-full cursor-pointer justify-between">
                                                                    <div className="flex-1">
                                                                        <p className="font-medium">{rider.name}</p>
                                                                        {rider.note && <p className="mt-1 text-xs text-muted-foreground">{rider.note}</p>}
                                                                    </div>
                                                                    <span className="whitespace-nowrap pl-4 font-semibold">+ ${benefit.rate.toFixed(2)}</span>
                                                                </Label>
                                                            </div>
                                                        )
                                                    }

                                                    if (rider.benefits.length > 1) {
                                                        return (
                                                            <div key={i} className="rounded-md border bg-background p-4">
                                                                <p className="font-medium">{rider.name}</p>
                                                                {rider.note && <p className="mb-3 mt-1 text-xs text-muted-foreground">{rider.note}</p>}
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
                                                                            <Label htmlFor={`rider-${i}-${j}`} className="ml-3 flex w-full cursor-pointer justify-between font-normal">
                                                                                <span>${benefit.amount} / {benefit.quantifier}</span>
                                                                                <span className="font-medium">+ ${benefit.rate.toFixed(2)}</span>
                                                                            </Label>
                                                                        </div>
                                                                    ))}
                                                                    <div className="flex items-center">
                                                                        <RadioGroupItem value="none" id={`rider-${i}-none`} />
                                                                        <Label htmlFor={`rider-${i}-none`} className="ml-3 cursor-pointer font-normal">None</Label>
                                                                    </div>
                                                                </RadioGroup>
                                                            </div>
                                                        )
                                                    }
                                                    return null;
                                                })}
                                            </div>
                                            </div>
                                        </div>
                                        <div className="mt-8 flex-col items-stretch gap-4 border-t bg-muted/30 p-6">
                                            <div className="flex items-center justify-between">
                                                <p className="text-lg font-semibold">Total Monthly Premium</p>
                                                <p className="font-headline text-3xl font-bold sm:text-4xl">${totalPremium.toFixed(2)}</p>
                                            </div>
                                            <Button size="lg" asChild className="mt-4 w-full"><Link href={`/dashboard/apply?type=hospital-indemnity&planName=${encodeURIComponent(featuredQuote.plan_name)}&provider=${encodeURIComponent(featuredQuote.carrier.name)}&premium=${totalPremium}`}>Select This Plan</Link></Button>
                                        </div>
                                    </div>
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
                                                            className="flex cursor-pointer items-center justify-between p-6 transition-colors hover:border-primary hover:bg-muted/50"
                                                            onClick={() => setFeaturedQuote(quote)}
                                                        >
                                                            <div>
                                                                <p className="text-lg font-semibold">{quote.carrier.name}</p>
                                                                <p className="text-sm text-muted-foreground">{quote.plan_name}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-lg font-semibold">${lowestRate.toFixed(2)}</p>
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
                            <div className="py-16 text-center text-muted-foreground">
                                    <FileDigit className="mx-auto mb-4 h-10 w-10"/>
                                    <p>No quotes found for the selected criteria.</p>
                                    <p className="text-sm">Please try different options.</p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
             </Card>
        </TabsContent>
        <TabsContent value="life-insurance" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Life Insurance</CardTitle>
                    <CardDescription>This is a simplified application. For a real quote, a licensed agent would contact you.</CardDescription>
                </CardHeader>
                <CardContent>
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
                </CardContent>
            </Card>
        </TabsContent>
       </Tabs>
      </div>
    </div>
  );
}

