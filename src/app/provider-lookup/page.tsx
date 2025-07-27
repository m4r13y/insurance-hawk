"use client";

import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { searchMedicareProviders } from './actions';
import type { ProviderService } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Search, AlertCircle, Building, User, Info, DollarSign, Stethoscope, BriefcaseMedical } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from '@/components/ui/badge';
import { ProviderResultsTable } from './provider-results-table';
import { Separator } from '@/components/ui/separator';

const searchSchema = z.object({
  npi: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
}).refine(data => !!data.npi || (!!data.lastName && !!data.city && !!data.state), {
  message: "Either NPI or Last Name, City, and State are required.",
  path: ["npi"],
});

type SearchFormValues = z.infer<typeof searchSchema>;

type GroupedProviders = {
  [key: string]: {
    providerDetails: Pick<ProviderService, 
      'rndrng_npi' | 
      'rndrng_prvdr_last_org_name' | 
      'rndrng_prvdr_first_name' | 
      'rndrng_prvdr_mi' | 
      'rndrng_prvdr_crdntls' | 
      'rndrng_prvdr_ent_cd' | 
      'rndrng_prvdr_st1' | 
      'rndrng_prvdr_st2' | 
      'rndrng_prvdr_city' | 
      'rndrng_prvdr_state_abrvtn' | 
      'rndrng_prvdr_zip5' | 
      'rndrng_prvdr_type'
    >;
    services: Pick<ProviderService, 'hcpcs_cd' | 'hcpcs_desc' | 'hcpcs_drug_ind' | 'place_of_srvc' | 'tot_benes' | 'tot_srvcs' | 'avg_sbmtd_chrg' | 'avg_mdcr_alowd_amt' | 'avg_mdcr_pymt_amt'>[];
  };
};

export default function ProviderLookupPage() {
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState<GroupedProviders | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      npi: "",
      firstName: "",
      lastName: "",
      city: "",
      state: "",
    },
  });

  const onSubmit = (values: SearchFormValues) => {
    setError(null);
    setResults(null);
    setTotalCount(0);
    startTransition(async () => {
      const response = await searchMedicareProviders(values);
      if (response.error) {
        setError(response.error);
        return;
      }
      
      // Parse the streaming response format
      let parsedData: any[] = [];
      
      if (typeof response.data === 'string') {
        // Handle streaming response with multiple JSON objects
        const responseStr: string = response.data;
        
        // Split by looking for patterns that indicate new JSON objects
        const jsonPattern = /\{"Rndrng_NPI":/g;
        const matches: number[] = [];
        let match: RegExpExecArray | null;
        
        while ((match = jsonPattern.exec(responseStr)) !== null) {
          matches.push(match.index);
        }
        
        // Extract each JSON object
        for (let i = 0; i < matches.length; i++) {
          const start = matches[i];
          const end = i < matches.length - 1 ? matches[i + 1] : responseStr.length;
          const jsonStr = responseStr.substring(start, end);
          
          // Clean up the JSON string (remove trailing commas, etc.)
          const cleanedJsonStr = jsonStr.replace(/,\s*$/, '').trim();
          
          try {
            // Skip the metadata objects (those starting with {"a":)
            if (!cleanedJsonStr.startsWith('{"a":')) {
              const jsonObj = JSON.parse(cleanedJsonStr);
              parsedData.push(jsonObj);
            }
          } catch (parseError) {
            console.warn('Failed to parse JSON object:', cleanedJsonStr, parseError);
          }
        }
      } else if (Array.isArray(response.data)) {
        // Handle array response format
        parsedData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Handle single object response
        parsedData = [response.data];
      }
      
      const grouped = parsedData.reduce((acc: GroupedProviders, service) => {
        // Handle both camelCase and PascalCase field names
        const npi = service.rndrng_npi || service.Rndrng_NPI;
        if (!acc[npi]) {
          acc[npi] = {
            providerDetails: {
              rndrng_npi: service.rndrng_npi || service.Rndrng_NPI,
              rndrng_prvdr_last_org_name: service.rndrng_prvdr_last_org_name || service.Rndrng_Prvdr_Last_Org_Name,
              rndrng_prvdr_first_name: service.rndrng_prvdr_first_name || service.Rndrng_Prvdr_First_Name,
              rndrng_prvdr_mi: service.rndrng_prvdr_mi || service.Rndrng_Prvdr_MI,
              rndrng_prvdr_crdntls: service.rndrng_prvdr_crdntls || service.Rndrng_Prvdr_Crdntls,
              rndrng_prvdr_ent_cd: service.rndrng_prvdr_ent_cd || service.Rndrng_Prvdr_Ent_Cd,
              rndrng_prvdr_st1: service.rndrng_prvdr_st1 || service.Rndrng_Prvdr_St1,
              rndrng_prvdr_st2: service.rndrng_prvdr_st2 || service.Rndrng_Prvdr_St2,
              rndrng_prvdr_city: service.rndrng_prvdr_city || service.Rndrng_Prvdr_City,
              rndrng_prvdr_state_abrvtn: service.rndrng_prvdr_state_abrvtn || service.Rndrng_Prvdr_State_Abrvtn,
              rndrng_prvdr_zip5: service.rndrng_prvdr_zip5 || service.Rndrng_Prvdr_Zip5,
              rndrng_prvdr_type: service.rndrng_prvdr_type || service.Rndrng_Prvdr_Type,
            },
            services: [],
          };
        }
        acc[npi].services.push({
          hcpcs_cd: service.hcpcs_cd || service.HCPCS_Cd,
          hcpcs_desc: service.hcpcs_desc || service.HCPCS_Desc,
          hcpcs_drug_ind: service.hcpcs_drug_ind || service.HCPCS_Drug_Ind,
          place_of_srvc: service.place_of_srvc || service.Place_Of_Srvc,
          tot_benes: parseInt(service.tot_benes || service.Tot_Benes || '0'),
          tot_srvcs: parseInt(service.tot_srvcs || service.Tot_Srvcs || '0'),
          avg_sbmtd_chrg: parseFloat(service.avg_sbmtd_chrg || service.Avg_Sbmtd_Chrg || '0'),
          avg_mdcr_alowd_amt: parseFloat(service.avg_mdcr_alowd_amt || service.Avg_Mdcr_Alowd_Amt || '0'),
          avg_mdcr_pymt_amt: parseFloat(service.avg_mdcr_pymt_amt || service.Avg_Mdcr_Pymt_Amt || '0'),
        });
        return acc;
      }, {});

      setResults(grouped);
      setTotalCount(Object.keys(grouped).length);
    });
  };

  return (
    <div className="bg-gray-50 dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        <Card className="shadow-lg border-0 bg-white dark:bg-neutral-800">
          <CardHeader>
            <CardTitle>Provider Search</CardTitle>
            <CardDescription>Search by NPI, or by name and location. You can find a provider's NPI using the <a href="https://npiregistry.cms.hhs.gov/" target="_blank" rel="noopener noreferrer" className="underline">NPI Registry</a>.</CardDescription>
          </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="npi" render={({ field }) => (
                  <FormItem>
                    <FormLabel>National Provider Identifier (NPI)</FormLabel>
                    <FormControl><Input {...field} placeholder="Enter 10-digit NPI" /></FormControl>
                  </FormItem>
                )} />
              </div>
              <div className="flex items-center gap-4">
                <Separator className="flex-1" />
                <span className="text-muted-foreground text-sm">OR</span>
                <Separator className="flex-1" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name / Organization Name</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g., Smith" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name (optional)</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g., John" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="city" render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g., Baltimore" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="state" render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g., MD" /></FormControl>
                  </FormItem>
                )} />
              </div>
              <FormMessage>{form.formState.errors.npi?.message}</FormMessage>
              <div className="flex justify-end">
                <Button type="submit" disabled={isPending}>
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                  Search Providers
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {isPending && (
          <div className="text-center py-12">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary"/>
              <p className="mt-4 text-muted-foreground">Searching for providers...</p>
          </div>
      )}

      {results && (
        <ProviderResultsTable
          results={results}
          totalCount={totalCount}
          onViewDetails={(npi) => {
            // Handle view details action
            console.log('View details for NPI:', npi);
          }}
          onSelectProvider={(npi) => {
            // Handle select provider action
            console.log('Select provider with NPI:', npi);
          }}
        />
      )}
      </div>
    </div>
  );
}

const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number | undefined }) => {
    if (value === undefined || value === null || value === '') return null;
    return (
        <div className="flex items-start gap-2">
            <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0"/>
            <div>
                <p className="font-medium">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
            </div>
        </div>
    )
}
