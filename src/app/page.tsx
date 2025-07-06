
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
import { CheckCircle, UserPlus } from "lucide-react"
import { isFirebaseConfigured } from "@/lib/firebase"


function AuthFlow() {
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [isSignUp, setIsSignUp] = useState(false)
  
  useEffect(() => {
    if (searchParams.get('mode') === 'signup') {
      setIsSignUp(true)
    }
  }, [searchParams])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
     toast({
        variant: "destructive",
        title: "Feature Disabled",
        description: "User authentication requires Firebase setup. Please continue as a guest.",
    })
  }

    return (
        <>
            <div className="grid gap-2 text-center">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                {isSignUp ? 'Create an Account' : 'Welcome Back'}
                </h1>
                <p className="text-slate-600">
                {isSignUp ? 'Enter your details to get started.' : 'Enter your credentials to access your portal.'}
                </p>
            </div>
            <Card>
              <CardContent className="p-6 sm:p-8">
                  {isSignUp ? (
                      <form onSubmit={handleSubmit} className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                  <Label htmlFor="firstName">First Name</Label>
                                  <Input id="firstName" required />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="lastName">Last Name</Label>
                                  <Input id="lastName" required />
                              </div>
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="email">Email address</Label>
                              <Input id="email" type="email" placeholder="you@example.com" required />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="password">Password</Label>
                              <Input id="password" type="password" required minLength={6} />
                          </div>
                          <Button type="submit" className="w-full">
                              <UserPlus className="mr-2 h-4 w-4" />
                              Create Account
                          </Button>
                      </form>
                  ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                          <div className="space-y-2">
                              <Label htmlFor="email">Email address</Label>
                              <Input id="email" type="email" placeholder="you@example.com" required />
                          </div>
                          <div className="space-y-2">
                              <div className="flex items-center">
                                  <Label htmlFor="password">Password</Label>
                                  <Link href="#" className="ml-auto inline-block text-sm font-medium text-sky-600 hover:underline" prefetch={false}>
                                  Forgot password?
                                  </Link>
                              </div>
                              <Input id="password" type="password" required />
                          </div>
                          <Button type="submit" className="w-full">
                              Sign In
                          </Button>
                      </form>
                  )}
              </CardContent>
            </Card>
            <div className="mt-4 text-center text-sm text-slate-600">
                <p>
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{" "}
                    <button onClick={() => setIsSignUp(!isSignUp)} className="font-medium text-sky-600 hover:underline">
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                </p>
            </div>
        </>
    )
}


function LoginPageContent() {
  const router = useRouter()
  const { toast } = useToast()

  const handleGuestLogin = () => {
    localStorage.setItem("hawk-auth", "true");
    localStorage.setItem("userFirstName", "Guest");
    localStorage.setItem("isNewUser", "true"); 
    router.push("/dashboard");
    toast({
        title: "Welcome, Guest!",
        description: "You are browsing as a guest. Some features will be limited.",
    })
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="hidden bg-slate-100 lg:flex lg:flex-col lg:items-center lg:justify-between lg:p-12 xl:p-24">
        <div className="self-start">
            <Logo />
        </div>
        <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Your Policies, All in One Nest.</h2>
            <p className="mt-4 text-lg text-slate-600">Securely manage your insurance and financial plans from one convenient place.</p>
        </div>
        <div className="w-full max-w-md text-slate-800">
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
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">
                Or
              </span>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleGuestLogin}>
            Continue as Guest
          </Button>

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
