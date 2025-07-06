
"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreditCard, LogOut, Settings, User } from "lucide-react"
import Link from "next/link"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"


const defaultHawkImage = "https://placehold.co/40x40.png";

export function UserNav() {
  const [user] = useAuthState(auth);
  const router = useRouter();

  const handleLogout = () => {
    signOut(auth);
    router.push('/');
  }

  if (!user) {
    return null;
  }
  
  const fallback = user.displayName ? user.displayName.split(" ").map(n => n[0]).join("").substring(0,2) : user.email?.[0].toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.photoURL || defaultHawkImage} alt="User avatar" {...(!user.photoURL && { 'data-ai-hint': 'hawk' })} />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-slate-900">{user.displayName || 'User'}</p>
            <p className="text-xs leading-none text-slate-500">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
             <Link href="/dashboard/settings">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
             </Link>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing</span>
          </DropdownMenuItem>
           <DropdownMenuItem asChild>
             <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
             </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
