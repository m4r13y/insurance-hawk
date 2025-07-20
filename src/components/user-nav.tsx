
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
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useFirebaseAuth } from "@/hooks/use-firebase-auth"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { HugeiconsIcon } from "@hugeicons/react"
import { Billing01Icon, Logout02Icon, Setting01Icon, User01Icon } from '@hugeicons/core-free-icons';


const defaultHawkImage = "/hawk-profile.jpg";

export function UserNav() {
  const router = useRouter();
  const [user, loading, error] = useFirebaseAuth();

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
    router.push('/');
  }

  if (loading) return null;
  if (!user) return null;
  
  const fallback = user.displayName ? user.displayName.split(" ").map(n => n[0]).join("").substring(0,2) : user.email?.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.photoURL || defaultHawkImage} alt={user.displayName || "User avatar"} />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-slate-900">{user.displayName}</p>
            <p className="text-xs leading-none text-slate-500">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
             <Link href="/dashboard/settings">
                <HugeiconsIcon icon={User01Icon} className="mr-2 h-4 w-4" />
                <span>Profile</span>
             </Link>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <HugeiconsIcon icon={Billing01Icon} className="mr-2 h-4 w-4" />
            <span>Billing</span>
          </DropdownMenuItem>
           <DropdownMenuItem asChild>
             <Link href="/dashboard/settings">
                <HugeiconsIcon icon={Setting01Icon} className="mr-2 h-4 w-4" />
                <span>Settings</span>
             </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <HugeiconsIcon icon={Logout02Icon} className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
