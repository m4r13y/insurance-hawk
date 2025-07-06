
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

const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email(),
  phone: z.string().min(10, "A valid phone number is required"),
});

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


const defaultHawkImage = "https://placehold.co/80x80.png";

export default function SettingsPage() {
    const { toast } = useToast()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    const profileForm = useForm<z.infer<typeof profileFormSchema>>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            firstName: "Sarah",
            lastName: "Connor",
            email: "s.connor@email.com",
            phone: "123-456-7890",
        },
    })

    const notificationsForm = useForm<z.infer<typeof notificationsFormSchema>>({
        resolver: zodResolver(notificationsFormSchema),
        defaultValues: {
            emailNotifications: true,
            smsNotifications: false,
        },
    })

    const securityForm = useForm<z.infer<typeof securityFormSchema>>({
        resolver: zodResolver(securityFormSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    })

    useEffect(() => {
        const storedFirstName = localStorage.getItem("userFirstName")
        if (storedFirstName) {
            profileForm.setValue("firstName", storedFirstName)
        }
        const storedLastName = localStorage.getItem("userLastName")
        if (storedLastName) {
            profileForm.setValue("lastName", storedLastName)
        }
        const storedImage = localStorage.getItem("userProfilePicture")
        if (storedImage) {
            setImagePreview(storedImage)
        }
    }, [profileForm])

    const onProfileSubmit = (values: z.infer<typeof profileFormSchema>) => {
        console.log(values)
        localStorage.setItem("userFirstName", values.firstName)
        localStorage.setItem("userLastName", values.lastName)
        window.dispatchEvent(new Event("profileUpdate"))
        toast({ title: "Profile Updated", description: "Your personal information has been saved." })
    }

    const onNotificationsSubmit = (values: z.infer<typeof notificationsFormSchema>) => {
        console.log(values)
        toast({ title: "Notifications Updated", description: "Your notification preferences have been saved." })
    }
    
    const onSecuritySubmit = (values: z.infer<typeof securityFormSchema>) => {
        console.log(values)
        toast({ title: "Password Changed", description: "Your password has been successfully updated." })
        securityForm.reset();
    }
    
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                setImagePreview(dataUrl);
                localStorage.setItem("userProfilePicture", dataUrl);
                window.dispatchEvent(new Event("profileUpdate"));
                toast({ title: "Profile Picture Updated" })
            };
            reader.readAsDataURL(file);
        }
    };


  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-base text-muted-foreground mt-1">Manage your account settings and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
                <AvatarImage src={imagePreview || defaultHawkImage} alt="User avatar" {...(!imagePreview && { 'data-ai-hint': 'hawk' })}/>
                <AvatarFallback>SC</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
                <CardTitle className="text-xl">Profile Information</CardTitle>
                <CardDescription>Update your personal details here.</CardDescription>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    Upload Photo
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
           <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={profileForm.control} name="firstName" render={({ field }) => (
                        <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={profileForm.control} name="lastName" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={profileForm.control} name="email" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl><Input type="email" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={profileForm.control} name="phone" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl><Input type="tel" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                <div className="flex justify-end">
                    <Button type="submit">Save Changes</Button>
                </div>
            </form>
           </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
           <CardTitle className="text-xl">Notification Settings</CardTitle>
          <CardDescription>Choose how you want to be notified.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <Form {...notificationsForm}>
            <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-6">
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
            <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-8">
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
            </form>
           </Form>
        </CardContent>
      </Card>
    </div>
  )
}
