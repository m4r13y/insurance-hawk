
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
import { Loader2 } from "lucide-react"
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
                    const data = docSnap.data();
                    setProfile(data);
                    notificationsForm.reset(data.notifications || {});
                } else {
                    // Pre-fill from auth if no firestore doc exists yet
                    setProfile({
                        displayName: user.displayName,
                        email: user.email,
                    });
                }
            });
        }
    }, [user, notificationsForm]);

    const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!user || !storage || !db || !auth?.currentUser) return;
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const storagePath = `users/${user.uid}/profile/photo`;
        const storageRef = ref(storage, storagePath);

        try {
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            await updateProfile(auth.currentUser!, { photoURL: downloadURL });
            await setDoc(doc(db, 'users', user.uid), { photoURL: downloadURL }, { merge: true });

            setProfile((prev: any) => ({ ...prev, photoURL: downloadURL }));
            
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
        if (!user || !auth?.currentUser) return;
        
        try {
            const credential = EmailAuthProvider.credential(user.email!, data.currentPassword);
            await reauthenticateWithCredential(auth.currentUser!, credential);
            await updatePassword(auth.currentUser!, data.newPassword);
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

    const displayName = profile.displayName || user.displayName;

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

    

    