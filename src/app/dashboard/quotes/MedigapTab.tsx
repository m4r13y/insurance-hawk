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


export default function MedigapTab(props: any) {
  // ...move Medigap tab content here...
  return (
    <div>MedigapTab</div>
  );
}
