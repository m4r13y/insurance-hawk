
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
import { useState, useEffect } from "react"

const defaultHawkImage = "https://placehold.co/40x40.png";

export function UserNav() {
  const [userName, setUserName] = useState("Sarah Connor");
  const [userEmail, setUserEmail] = useState("s.connor@email.com");
  const [userImage, setUserImage] = useState(defaultHawkImage);

  useEffect(() => {
    const updateUserData = () => {
        const storedFirstName = localStorage.getItem("userFirstName");
        const storedLastName = localStorage.getItem("userLastName");
        const storedImage = localStorage.getItem("userProfilePicture");

        if (storedFirstName && storedLastName) {
            setUserName(`${storedFirstName} ${storedLastName}`);
        } else if (storedFirstName) {
            setUserName(storedFirstName);
        }

        if (storedImage) {
            setUserImage(storedImage);
        } else {
            setUserImage(defaultHawkImage);
        }
    };

    updateUserData();
    window.addEventListener('profileUpdate', updateUserData);
    return () => {
        window.removeEventListener('profileUpdate', updateUserData);
    };
  }, []);

  const fallback = userName ? userName.split(" ").map(n => n[0]).join("") : "SC";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userImage} alt="User avatar" {...(userImage === defaultHawkImage && { 'data-ai-hint': 'hawk' })} />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-slate-900">{userName}</p>
            <p className="text-xs leading-none text-slate-500">
              {userEmail}
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
          <DropdownMenuItem>
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
        <DropdownMenuItem asChild>
          <Link href="/">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
