
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Info, Pencil, Eye, EyeOff, Save, KeyRound } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// --- Schemas --- //
const notificationsFormSchema = z.object({
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
});

const securityFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dob: z.string().optional(),
  email: z.string().email("Invalid email").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  medicareId: z.string().optional(),
});


// --- Helper Components --- //

const EditableCard = ({ title, children, FormComponent, onSave }: { title: string; children: React.ReactNode; FormComponent: React.FC<any>; onSave: (data: any) => void; }) => {
    const [isEditing, setIsEditing] = useState(false);
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">{title}</CardTitle>
                 {!isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                <div className={cn(!isEditing ? "block" : "hidden")}>{children}</div>
                <div className={cn(isEditing ? "block" : "hidden")}>
                    <FormComponent onSave={(data:any) => { onSave(data); setIsEditing(false); }} onCancel={() => setIsEditing(false)} />
                </div>
            </CardContent>
        </Card>
    );
};

const InfoRow = ({ label, value, isSensitive = false }: { label: string; value: string; isSensitive?: boolean; }) => {
    const [isVisible, setIsVisible] = useState(false);
    const displayValue = isSensitive ? (isVisible ? value : '•'.repeat(value.length || 10)) : value;
    return (
        <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">{label}</span>
            <div className="flex items-center gap-2">
                <span className="font-medium">{displayValue || 'N/A'}</span>
                {isSensitive && value && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsVisible(!isVisible)}>
                        {isVisible ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                    </Button>
                )}
            </div>
        </div>
    );
};

const PersonalInfoForm = ({ onSave, onCancel }: { onSave: (data: any) => void; onCancel: () => void }) => {
    const form = useForm({ resolver: zodResolver(profileSchema.pick({ firstName: true, lastName: true, dob: true })) });
     useEffect(() => {
        const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        form.reset(profile);
    }, [form]);
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField name="firstName" control={form.control} render={({ field }) => <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField name="lastName" control={form.control} render={({ field }) => <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                </div>
                <FormField name="dob" control={form.control} render={({ field }) => <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>} />
                <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button><Button type="submit">Save</Button></div>
            </form>
        </Form>
    );
};

const ContactInfoForm = ({ onSave, onCancel }: { onSave: (data: any) => void; onCancel: () => void }) => {
    const form = useForm({ resolver: zodResolver(profileSchema.pick({ email: true, phone: true, address: true, city: true, state: true, zip: true })) });
     useEffect(() => {
        const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        form.reset(profile);
    }, [form]);
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField name="email" control={form.control} render={({ field }) => <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField name="phone" control={form.control} render={({ field }) => <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                </div>
                 <FormField name="address" control={form.control} render={({ field }) => <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <div className="grid grid-cols-3 gap-4">
                     <FormField name="city" control={form.control} render={({ field }) => <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                     <FormField name="state" control={form.control} render={({ field }) => <FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                     <FormField name="zip" control={form.control} render={({ field }) => <FormItem><FormLabel>Zip</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                </div>
                <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button><Button type="submit">Save</Button></div>
            </form>
        </Form>
    );
};

const FinancialInfoForm = ({ onSave, onCancel }: { onSave: (data: any) => void; onCancel: () => void }) => {
    const form = useForm({ resolver: zodResolver(profileSchema.pick({ medicareId: true })) });
     useEffect(() => {
        const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        form.reset(profile);
    }, [form]);
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
                <FormField name="medicareId" control={form.control} render={({ field }) => <FormItem><FormLabel>Medicare ID</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button><Button type="submit">Save</Button></div>
            </form>
        </Form>
    );
};

const defaultHawkImage = "/hawk-profile.jpg";


// --- Main Component --- //

export default function SettingsPage() {
    const { toast } = useToast()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [firstName, setFirstName] = useState("Guest");
    const [profile, setProfile] = useState<any>({});

    const notificationsForm = useForm<z.infer<typeof notificationsFormSchema>>({
        resolver: zodResolver(notificationsFormSchema),
        defaultValues: { emailNotifications: true, smsNotifications: false },
    })

    const securityForm = useForm<z.infer<typeof securityFormSchema>>({
        resolver: zodResolver(securityFormSchema),
        defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    })

     useEffect(() => {
        const guestAuth = localStorage.getItem("hawk-auth") === "true";
        setIsLoggedIn(guestAuth);
        
        const name = localStorage.getItem("userFirstName") || "Guest";
        setFirstName(name);
        setImagePreview(defaultHawkImage);

        const storedProfile = localStorage.getItem("userProfile");
        if(storedProfile) {
            setProfile(JSON.parse(storedProfile));
        } else if (name !== "Guest") {
             const defaultProfile = { firstName: name, lastName: "", dob: "" };
             setProfile(defaultProfile);
             localStorage.setItem("userProfile", JSON.stringify(defaultProfile));
        }

        setLoading(false);
    }, [])
    
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "userProfile") {
                const updatedProfile = localStorage.getItem("userProfile");
                setProfile(updatedProfile ? JSON.parse(updatedProfile) : {});
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleDisabledSubmit = () => {
         toast({
            variant: "destructive",
            title: "Feature Disabled",
            description: "This feature is only available for registered users.",
        })
    }

    const handleSaveProfile = (newData: any) => {
        const updatedProfile = { ...profile, ...newData };
        setProfile(updatedProfile);
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        toast({ title: "Profile Updated", description: "Your information has been saved." });
    };
    
    const handleImageChange = () => { handleDisabledSubmit(); };

  if (loading) { return <p>Loading settings...</p> }
  
  if (!isLoggedIn) {
      return (
        <div className="text-center">
            <p>You must be logged in to view settings.</p>
            <Button asChild className="mt-4"><Link href="/">Login</Link></Button>
        </div>
      )
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-base text-muted-foreground mt-1">Manage your account settings and preferences.</p>
      </div>

       <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Guest Mode</AlertTitle>
          <AlertDescription>
            You are currently browsing as a guest. All data is stored locally in your browser and will not be saved to an account.
          </AlertDescription>
      </Alert>

        <Card>
            <CardHeader className="flex flex-row items-center gap-6">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={imagePreview || defaultHawkImage} alt="User avatar" />
                    <AvatarFallback>{firstName?.[0]}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                    <CardTitle className="text-xl">Your Profile</CardTitle>
                    <CardDescription>This information helps us personalize your experience.</CardDescription>
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>Upload Photo</Button>
                </div>
            </CardHeader>
        </Card>

        <EditableCard title="Personal Information" FormComponent={PersonalInfoForm} onSave={handleSaveProfile}>
            <InfoRow label="Name" value={`${profile.firstName || ''} ${profile.lastName || ''}`} />
            <Separator/>
            <InfoRow label="Date of Birth" value={profile.dob ? new Date(profile.dob).toLocaleDateString('en-US', { timeZone: 'UTC' }) : ''} />
        </EditableCard>

        <EditableCard title="Contact Information" FormComponent={ContactInfoForm} onSave={handleSaveProfile}>
            <InfoRow label="Email" value={profile.email || ''} />
            <Separator/>
            <InfoRow label="Phone" value={profile.phone || ''} />
            <Separator/>
            <InfoRow label="Address" value={`${profile.address || ''} ${profile.city || ''} ${profile.state || ''} ${profile.zip || ''}`.trim()} />
        </EditableCard>

        <EditableCard title="Financial & Health IDs" FormComponent={FinancialInfoForm} onSave={handleSaveProfile}>
            <InfoRow label="Medicare ID" value={profile.medicareId || ''} isSensitive={true}/>
        </EditableCard>


      <Card>
        <CardHeader>
           <CardTitle className="text-xl">Notification Settings</CardTitle>
          <CardDescription>Choose how you want to be notified.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <Form {...notificationsForm}>
            <form onSubmit={notificationsForm.handleSubmit(handleDisabledSubmit)} className="space-y-6">
                <fieldset disabled className="space-y-6">
                    <FormField control={notificationsForm.control} name="emailNotifications" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 sm:p-6">
                            <div className="space-y-1.5">
                                <FormLabel className="text-base">Email Notifications</FormLabel>
                                <FormDescription>Receive notifications about your account, applications, and updates via email.</FormDescription>
                            </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )} />
                     <FormField control={notificationsForm.control} name="smsNotifications" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 sm:p-6">
                            <div className="space-y-1.5">
                                <FormLabel className="text-base">SMS Text Notifications</FormLabel>
                                <FormDescription>Get important alerts and status updates via text message.</FormDescription>
                            </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )} />
                     <div className="flex justify-end">
                        <Button type="submit">Save Preferences</Button>
                    </div>
                </fieldset>
            </form>
           </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="text-xl">Change Password</CardTitle>
          <CardDescription>For your security, we recommend using a strong password that you don't use elsewhere.</CardDescription>
        </CardHeader>
        <CardContent>
           <Form {...securityForm}>
            <form onSubmit={securityForm.handleSubmit(handleDisabledSubmit)} className="space-y-8">
                <fieldset disabled className="space-y-8">
                     <FormField control={securityForm.control} name="currentPassword" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl><Input type="password" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={securityForm.control} name="newPassword" render={({ field }) => (
                        <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl><Input type="password" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={securityForm.control} name="confirmPassword" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl><Input type="password" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <div className="flex justify-end">
                        <Button type="submit" variant="destructive">Change Password</Button>
                    </div>
                </fieldset>
            </form>
           </Form>
        </CardContent>
      </Card>
    </div>
  )
}
