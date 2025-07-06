"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { mockPlans } from "@/lib/mock-data"

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dob: z.string().min(1, "Date of birth is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(5, "Zip code is required"),
  phone: z.string().min(10, "Phone number is required"),
  email: z.string().email(),
  medicareClaimNumber: z.string().min(1, "Medicare Claim Number is required."),
  partAEffectiveDate: z.string().optional(),
  partBEffectiveDate: z.string().optional(),
  planId: z.string().min(1, "You must select a plan to apply for."),
  receiveByMail: z.boolean().default(false).optional(),
  signature: z.string().min(1, "Digital signature is required"),
});

export default function ApplyPage() {
    const { toast } = useToast()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            dob: "",
            address: "",
            city: "",
            state: "",
            zip: "",
            phone: "",
            email: "",
            medicareClaimNumber: "",
            partAEffectiveDate: "",
            partBEffectiveDate: "",
            planId: mockPlans[0].id,
            receiveByMail: false,
            signature: ""
        }
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
        toast({
            title: "Application Submitted!",
            description: "We have received your application and will be in touch shortly.",
        })
        form.reset();
    }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Submit Application</h1>
        <p className="text-muted-foreground">Complete the form below to apply for your selected Medicare plan.</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="firstName" render={({ field }) => <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="lastName" render={({ field }) => <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                    </div>
                    <FormField control={form.control} name="dob" render={({ field }) => <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name="address" render={({ field }) => <FormItem><FormLabel>Street Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name="city" render={({ field }) => <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="state" render={({ field }) => <FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="zip" render={({ field }) => <FormItem><FormLabel>Zip Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="phone" render={({ field }) => <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="email" render={({ field }) => <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Medicare Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="medicareClaimNumber" render={({ field }) => <FormItem><FormLabel>Medicare Claim Number</FormLabel><FormControl><Input placeholder="Found on your Medicare card" {...field} /></FormControl><FormMessage /></FormItem>} />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="partAEffectiveDate" render={({ field }) => <FormItem><FormLabel>Part A Effective Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormDescription>Optional</FormDescription><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="partBEffectiveDate" render={({ field }) => <FormItem><FormLabel>Part B Effective Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormDescription>Optional</FormDescription><FormMessage /></FormItem>} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Plan Selection & Signature</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <FormField control={form.control} name="planId" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Selected Plan</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a plan" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {mockPlans.map(plan => (
                                        <SelectItem key={plan.id} value={plan.id}>{plan.name} - {plan.provider}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="receiveByMail" render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>I want to receive my ID card and other plan information by mail.</FormLabel>
                            </div>
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="signature" render={({ field }) => (
                         <FormItem>
                             <FormLabel>Digital Signature</FormLabel>
                             <FormControl><Input placeholder="Type your full name" {...field} /></FormControl>
                             <FormDescription>By typing your name, you are electronically signing this application.</FormDescription>
                             <FormMessage />
                         </FormItem>
                     )} />
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button type="submit" size="lg" className="bg-accent hover:bg-accent/90">Submit Application</Button>
            </div>
        </form>
      </Form>
    </div>
  )
}
