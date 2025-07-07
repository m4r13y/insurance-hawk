
"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, UserPlus, Loader2 } from "lucide-react"
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth"
import { getFirestore, doc, setDoc } from "firebase/firestore"
import { auth, db, isFirebaseConfigured } from "@/lib/firebase"


function AuthFlow() {
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  useEffect(() => {
    if (searchParams.get('mode') === 'signup') {
      setIsSignUp(true)
    }
  }, [searchParams])

  const handleAuthSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFirebaseConfigured || !auth || !db) {
         toast({
            variant: "destructive",
            title: "Feature Disabled",
            description: "This application is not configured for user authentication.",
        });
        return;
    }

    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    try {
        if (isSignUp) {
            const firstName = formData.get('firstName') as string;
            const lastName = formData.get('lastName') as string;

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            await updateProfile(user, { displayName: `${firstName} ${lastName}` });

            // Create a document in Firestore for the new user
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                displayName: `${firstName} ${lastName}`,
                firstName,
                lastName,
                createdAt: new Date().toISOString(),
            });

            router.push('/dashboard');
            toast({ title: "Account Created!", description: "Welcome to HawkNest." });

        } else { // Sign In
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/dashboard');
            toast({ title: "Signed In", description: "Welcome back!" });
        }
    } catch (error: any) {
        console.error("Firebase Auth Error:", error);
        toast({
            variant: "destructive",
            title: "Authentication Failed",
            description: error.message?.replace('Firebase: ', '') || "An unknown error occurred.",
        });
    } finally {
        setIsLoading(false);
    }
  }

    return (
        <>
            <div className="grid gap-2 text-center">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                {isSignUp ? 'Create an Account' : 'Welcome Back'}
                </h1>
                <p className="text-muted-foreground">
                {isSignUp ? 'Enter your details to get started.' : 'Enter your credentials to access your portal.'}
                </p>
            </div>
            <Card>
              <CardContent className="p-6 sm:p-8">
                  <form onSubmit={handleAuthSubmit} className="space-y-6">
                      {isSignUp && (
                          <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                  <Label htmlFor="firstName">First Name</Label>
                                  <Input name="firstName" id="firstName" required />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="lastName">Last Name</Label>
                                  <Input name="lastName" id="lastName" required />
                              </div>
                          </div>
                      )}
                      <div className="space-y-2">
                          <Label htmlFor="email">Email address</Label>
                          <Input name="email" id="email" type="email" placeholder="you@example.com" required />
                      </div>
                      <div className="space-y-2">
                          <div className="flex items-center">
                              <Label htmlFor="password">Password</Label>
                              {!isSignUp && (
                                <Link href="#" className="ml-auto inline-block text-sm font-medium text-primary hover:underline" prefetch={false}>
                                  Forgot password?
                                </Link>
                              )}
                          </div>
                          <Input name="password" id="password" type="password" required minLength={6} />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isSignUp && <UserPlus className="mr-2 h-4 w-4" />)}
                          {isLoading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
                      </Button>
                  </form>
              </CardContent>
            </Card>
            <div className="mt-4 text-center text-sm text-muted-foreground">
                <p>
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{" "}
                    <button onClick={() => setIsSignUp(!isSignUp)} className="font-medium text-primary hover:underline" disabled={isLoading}>
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                </p>
            </div>
        </>
    )
}


function LoginPageContent() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="hidden bg-muted lg:flex lg:flex-col lg:items-center lg:justify-between lg:p-12 xl:p-24">
        <div className="self-start">
            <Logo />
        </div>
        <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Your Policies, All in One Nest.</h2>
            <p className="mt-4 text-lg text-muted-foreground">Securely manage your insurance and financial plans from one convenient place.</p>
        </div>
        <div className="w-full max-w-md">
            <ul className="space-y-4">
                <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-teal-500" />
                    <span>Compare plans from top carriers instantly.</span>
                </li>
                <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-teal-500" />
                    <span>Get personalized, AI-driven recommendations.</span>
                </li>
                 <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-teal-500" />
                    <span>Securely apply and manage your documents online.</span>
                </li>
            </ul>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4">
        <div className="mx-auto grid w-full max-w-md gap-6">
          <AuthFlow />
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  // Suspense is needed because useSearchParams is a client hook
  // that can only be used in a Client Component.
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  )
}
