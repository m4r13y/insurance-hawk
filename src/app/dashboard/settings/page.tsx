
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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Info, Pencil, Eye, EyeOff, Save, KeyRound, Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useFirebaseAuth } from "@/hooks/use-firebase-auth"
import { db, auth, storage } from "@/lib/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

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

const EditableCard = ({ title, children, FormComponent, onSave, profileData }: { title: string; children: React.ReactNode; FormComponent: React.FC<any>; onSave: (data: any) => void; profileData: any; }) => {
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
                    <FormComponent profileData={profileData} onSave={(data:any) => { onSave(data); setIsEditing(false); }} onCancel={() => setIsEditing(false)} />
                </div>
            </CardContent>
        </Card>
    );
};

const InfoRow = ({ label, value, isSensitive = false }: { label: string; value: string; isSensitive?: boolean; }) => {
    const [isVisible, setIsVisible] = useState(false);
    const displayValue = isSensitive ? (isVisible ? value : '•'.repeat(value?.length || 10)) : value;
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

const PersonalInfoForm = ({ onSave, onCancel, profileData }: { onSave: (data: any) => void; onCancel: () => void, profileData: any }) => {
    const form = useForm({ 
      resolver: zodResolver(profileSchema.pick({ firstName: true, lastName: true, dob: true })),
      defaultValues: {
        firstName: profileData?.firstName || '',
        lastName: profileData?.lastName || '',
        dob: profileData?.dob || '',
      }
    });
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

const ContactInfoForm = ({ onSave, onCancel, profileData }: { onSave: (data: any) => void; onCancel: () => void, profileData: any }) => {
    const form = useForm({ 
      resolver: zodResolver(profileSchema.pick({ phone: true, address: true, city: true, state: true, zip: true })),
      defaultValues: {
        phone: profileData?.phone || '',
        address: profileData?.address || '',
        city: profileData?.city || '',
        state: profileData?.state || '',
        zip: profileData?.zip || '',
      }
    });
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
                <FormField name="phone" control={form.control} render={({ field }) => <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
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

const FinancialInfoForm = ({ onSave, onCancel, profileData }: { onSave: (data: any) => void; onCancel: () => void, profileData: any }) => {
    const form = useForm({ 
      resolver: zodResolver(profileSchema.pick({ medicareId: true })),
      defaultValues: {
        medicareId: profileData?.medicareId || '',
      }
    });
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
    const { toast } = useToast();
    const [user, loading] = useFirebaseAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [profile, setProfile] = useState<any>({});
    const [isUploading, setIsUploading] = useState(false);

    const notificationsForm = useForm<z.infer<typeof notificationsFormSchema>>({
        resolver: zodResolver(notificationsFormSchema),
        defaultValues: { emailNotifications: true, smsNotifications: false },
    });

    const securityForm = useForm<z.infer<typeof securityFormSchema>>({
        resolver: zodResolver(securityFormSchema),
        defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    });

    useEffect(() => {
        if (user && db) {
            const userDocRef = doc(db, 'users', user.uid);
            getDoc(userDocRef).then(docSnap => {
                if (docSnap.exists()) {
                    setProfile(docSnap.data());
                    notificationsForm.reset(docSnap.data().notifications || {});
                } else {
                    // Pre-fill from auth if no firestore doc exists yet
                    setProfile({
                        displayName: user.displayName,
                        email: user.email,
                        firstName: user.displayName?.split(' ')[0] || '',
                        lastName: user.displayName?.split(' ')[1] || '',
                    });
                }
            });
        }
    }, [user, notificationsForm]);

    const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!user || !storage || !db || !auth.currentUser) return;
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const storagePath = `users/${user.uid}/profile/photo`;
        const storageRef = ref(storage, storagePath);

        try {
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            await updateProfile(auth.currentUser, { photoURL: downloadURL });
            await setDoc(doc(db, 'users', user.uid), { photoURL: downloadURL }, { merge: true });

            setProfile(prev => ({ ...prev, photoURL: downloadURL }));
            
            toast({ title: "Profile Photo Updated", description: "Your new photo has been saved." });
        } catch (error) {
            console.error("Error uploading photo:", error);
            toast({ variant: 'destructive', title: "Upload Failed", description: "Could not upload your new photo." });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleSaveProfile = async (newData: any) => {
        if (!user || !db) return;
        const userDocRef = doc(db, 'users', user.uid);
        try {
            const updatedProfileData = { ...profile, ...newData };
            await setDoc(userDocRef, newData, { merge: true });
            
            if (auth.currentUser && (newData.firstName || newData.lastName)) {
                 await updateProfile(auth.currentUser, { displayName: `${newData.firstName || profile.firstName} ${newData.lastName || profile.lastName}`.trim() });
            }

            setProfile(updatedProfileData);
            toast({ title: "Profile Updated", description: "Your information has been saved." });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: "Error", description: "Could not save profile." });
        }
    };

    const handleNotificationsSubmit = async (data: z.infer<typeof notificationsFormSchema>) => {
        if (!user || !db) return;
        const userDocRef = doc(db, 'users', user.uid);
        try {
            await setDoc(userDocRef, { notifications: data }, { merge: true });
            toast({ title: "Preferences Saved", description: "Your notification settings have been updated." });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: "Error", description: "Could not save preferences." });
        }
    };
    
    const handleSecuritySubmit = async (data: z.infer<typeof securityFormSchema>) => {
        if (!user || !auth.currentUser) return;
        
        try {
            const credential = EmailAuthProvider.credential(user.email!, data.currentPassword);
            await reauthenticateWithCredential(auth.currentUser, credential);
            await updatePassword(auth.currentUser, data.newPassword);
            toast({ title: "Password Changed", description: "Your password has been successfully updated." });
            securityForm.reset();
        } catch (error: any) {
             toast({
                variant: "destructive",
                title: "Password Change Failed",
                description: error.message?.replace('Firebase: ', '') || "An unknown error occurred.",
            });
        }
    };

    if (loading) { return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> }
  
    if (!user) { return null }

    const displayName = profile.firstName ? `${profile.firstName} ${profile.lastName}` : user.displayName;

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-base text-muted-foreground mt-1">Manage your account settings and preferences.</p>
      </div>

        <Card>
            <CardHeader className="flex flex-row items-center gap-6">
                <Avatar className="h-20 w-20">
                     {isUploading ? (
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                            <Loader2 className="h-8 w-8 animate-spin"/>
                        </div>
                    ) : (
                        <>
                            <AvatarImage src={profile.photoURL || user.photoURL || defaultHawkImage} alt="User avatar" />
                            <AvatarFallback>{displayName?.[0]}</AvatarFallback>
                        </>
                    )}
                </Avatar>
                <div className="space-y-2">
                    <CardTitle className="text-xl">{displayName}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                    <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                        Upload Photo
                    </Button>
                </div>
            </CardHeader>
        </Card>

        <EditableCard title="Personal Information" FormComponent={PersonalInfoForm} onSave={handleSaveProfile} profileData={profile}>
            <InfoRow label="Name" value={displayName || ''} />
            <Separator/>
            <InfoRow label="Date of Birth" value={profile.dob ? new Date(profile.dob).toLocaleDateString('en-US', { timeZone: 'UTC' }) : ''} />
        </EditableCard>

        <EditableCard title="Contact Information" FormComponent={ContactInfoForm} onSave={handleSaveProfile} profileData={profile}>
            <InfoRow label="Email" value={profile.email || user.email || ''} />
            <Separator/>
            <InfoRow label="Phone" value={profile.phone || ''} />
            <Separator/>
            <InfoRow label="Address" value={`${profile.address || ''} ${profile.city || ''} ${profile.state || ''} ${profile.zip || ''}`.trim()} />
        </EditableCard>

        <EditableCard title="Financial & Health IDs" FormComponent={FinancialInfoForm} onSave={handleSaveProfile} profileData={profile}>
            <InfoRow label="Medicare ID" value={profile.medicareId || ''} isSensitive={true}/>
        </EditableCard>


      <Card>
        <CardHeader>
           <CardTitle className="text-xl">Notification Settings</CardTitle>
          <CardDescription>Choose how you want to be notified.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <Form {...notificationsForm}>
            <form onSubmit={notificationsForm.handleSubmit(handleNotificationsSubmit)} className="space-y-6">
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
            <form onSubmit={securityForm.handleSubmit(handleSecuritySubmit)} className="space-y-8">
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
                <Button type="submit" variant="destructive" disabled={securityForm.formState.isSubmitting}>
                    {securityForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Change Password
                </Button>
                </div>
            </form>
           </Form>
        </CardContent>
      </Card>
    </div>
  )
}
