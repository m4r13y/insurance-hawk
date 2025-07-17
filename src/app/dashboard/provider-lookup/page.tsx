
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
    providerDetails: Omit<ProviderService, 'hcpcs_cd'>;
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
      
      const grouped = (response.data || []).reduce((acc: GroupedProviders, service) => {
        const npi = service.rndrng_npi;
        if (!acc[npi]) {
          acc[npi] = {
            providerDetails: {
              rndrng_npi: service.rndrng_npi,
              rndrng_prvdr_last_org_name: service.rndrng_prvdr_last_org_name,
              rndrng_prvdr_first_name: service.rndrng_prvdr_first_name,
              rndrng_prvdr_mi: service.rndrng_prvdr_mi,
              rndrng_prvdr_crdntls: service.rndrng_prvdr_crdntls,
              rndrng_prvdr_ent_cd: service.rndrng_prvdr_ent_cd,
              rndrng_prvdr_st1: service.rndrng_prvdr_st1,
              rndrng_prvdr_st2: service.rndrng_prvdr_st2,
              rndrng_prvdr_city: service.rndrng_prvdr_city,
              rndrng_prvdr_state_abrvtn: service.rndrng_prvdr_state_abrvtn,
              rndrng_prvdr_zip5: service.rndrng_prvdr_zip5,
              rndrng_prvdr_type: service.rndrng_prvdr_type,
            },
            services: [],
          };
        }
        acc[npi].services.push({
          hcpcs_cd: service.hcpcs_cd,
          hcpcs_desc: service.hcpcs_desc,
          hcpcs_drug_ind: service.hcpcs_drug_ind,
          place_of_srvc: service.place_of_srvc,
          tot_benes: service.tot_benes,
          tot_srvcs: service.tot_srvcs,
          avg_sbmtd_chrg: service.avg_sbmtd_chrg,
          avg_mdcr_alowd_amt: service.avg_mdcr_alowd_amt,
          avg_mdcr_pymt_amt: service.avg_mdcr_pymt_amt,
        });
        return acc;
      }, {});

      setResults(grouped);
      setTotalCount(Object.keys(grouped).length);
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Medicare Provider Lookup</h1>
        <p className="text-base text-muted-foreground mt-1">
          Search for providers and view services delivered to Original Medicare beneficiaries.
        </p>
      </div>

      <Card>
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
        <div className="space-y-6">
           <h2 className="text-xl font-semibold">Search Results ({totalCount})</h2>
            {totalCount > 0 ? (
                <div className="space-y-4">
                    {Object.values(results).map(({ providerDetails, services }, index) => (
                        <Card key={`${providerDetails.rndrng_npi}-${index}`}>
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row justify-between gap-2">
                                    <div>
                                        <CardTitle className="flex items-center gap-3">
                                            {providerDetails.rndrng_prvdr_ent_cd === 'I' ? <User /> : <Building />}
                                            {providerDetails.rndrng_prvdr_first_name} {providerDetails.rndrng_prvdr_mi} {providerDetails.rndrng_prvdr_last_org_name}, {providerDetails.rndrng_prvdr_crdntls}
                                        </CardTitle>
                                        <CardDescription className="mt-2">NPI: {providerDetails.rndrng_npi}</CardDescription>
                                    </div>
                                    <div className="text-sm text-muted-foreground text-left sm:text-right">
                                        <p>{providerDetails.rndrng_prvdr_st1}</p>
                                        <p>{providerDetails.rndrng_prvdr_city}, {providerDetails.rndrng_prvdr_state_abrvtn} {providerDetails.rndrng_prvdr_zip5}</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-4">
                                    <Badge variant="secondary"><BriefcaseMedical className="h-3 w-3 mr-1.5"/>{providerDetails.rndrng_prvdr_type}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible>
                                    <AccordionItem value="services">
                                        <AccordionTrigger className="text-base">View Services ({services.length})</AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-4 pt-4">
                                                {services.map((service, serviceIndex) => (
                                                    <div key={`${service.hcpcs_cd}-${service.place_of_srvc}-${serviceIndex}`} className="p-4 border rounded-lg">
                                                        <p className="font-semibold">{service.hcpcs_desc}</p>
                                                        <p className="text-sm text-muted-foreground">HCPCS Code: {service.hcpcs_cd} ({service.place_of_srvc === 'F' ? 'Facility' : 'Office'})</p>
                                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4 text-sm">
                                                            <InfoItem icon={Stethoscope} label="Beneficiaries" value={service.tot_benes?.toLocaleString()} />
                                                            <InfoItem icon={BriefcaseMedical} label="Services" value={service.tot_srvcs?.toLocaleString()} />
                                                            <InfoItem icon={DollarSign} label="Avg. Submitted" value={`$${service.avg_sbmtd_chrg?.toFixed(2)}`} />
                                                            <InfoItem icon={DollarSign} label="Avg. Allowed" value={`$${service.avg_mdcr_alowd_amt?.toFixed(2)}`} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No providers found for your search criteria.</p>
                </div>
            )}
        </div>
      )}
    </div>
  );
}

const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number | undefined }) => {
    if (value === undefined || value === null) return null;
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
