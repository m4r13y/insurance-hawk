"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, ShieldCheck } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Simple mock authentication
    if (email === "s.connor@email.com" && password.length > 0) {
      router.push("/dashboard")
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Please use 's.connor@email.com' and any password.",
      })
    }
  }

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="hidden bg-login-gradient lg:flex lg:flex-col lg:items-center lg:justify-between lg:p-12 text-primary-foreground">
        <div className="self-start">
            <Logo className="text-white"/>
        </div>
        <div className="text-center">
            <h2 className="font-headline text-4xl font-bold">Your Policies, All in One Nest.</h2>
            <p className="mt-4 text-lg text-primary-foreground/80">Securely manage your insurance and financial plans from one convenient place.</p>
        </div>
        <div className="w-full max-w-md text-sm">
            <ul className="space-y-4">
                <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-300" />
                    <span>Compare plans from top carriers instantly.</span>
                </li>
                <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-300" />
                    <span>Get personalized, AI-driven recommendations.</span>
                </li>
                 <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-300" />
                    <span>Securely apply and manage your documents online.</span>
                </li>
            </ul>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4">
        <div className="mx-auto grid w-[380px] gap-8">
          <div className="grid gap-2 text-center">
            <h1 className="text-4xl font-bold">Welcome Back</h1>
            <p className="text-muted-foreground">
              Enter your credentials to access your portal.
            </p>
          </div>
          <Card>
            <CardContent className="p-8">
                 <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="s.connor@email.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                         <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            <Link href="#" className="ml-auto inline-block text-sm font-medium text-primary hover:underline" prefetch={false}>
                            Forgot password?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
                        Sign In
                    </Button>
                </form>
            </CardContent>
          </Card>
          <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="#" className="font-medium text-primary hover:underline" prefetch={false}>
                  Contact us
              </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
