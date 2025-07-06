
"use client"

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar";
import { UserNav } from "@/components/user-nav";
import {
  LayoutDashboard,
  ShieldCheck,
  FileText,
  UploadCloud,
  Settings,
  LogOut,
  Search,
  BookOpen,
  FileDigit,
  PiggyBank,
  Heart,
  UserPlus,
  LogIn
} from "lucide-react";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (path: string) => pathname === path;
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO FOR PRODUCTION: Replace localStorage with a proper authentication check.
    // This should involve verifying a session or token from a secure context provider, not localStorage.
    const loggedInStatus = localStorage.getItem("hawk-auth") === "true";
    setIsLoggedIn(loggedInStatus);
    setIsLoading(false);
  }, [pathname]); // Rerun on path change to ensure state is up-to-date

  const handleLogout = () => {
    // TODO FOR PRODUCTION: This should call a backend endpoint to invalidate the user's session/token.
    localStorage.removeItem("hawk-auth");
    setIsLoggedIn(false);
    router.push("/");
  };
  
  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen lg:flex">
        <Sidebar collapsible="icon">
          <SidebarRail/>
          <SidebarContent className="flex flex-col justify-between">
            <div>
              <SidebarHeader>
                <Logo />
              </SidebarHeader>
              <SidebarMenu>
                {isLoggedIn && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/dashboard")} tooltip="Dashboard">
                      <Link href="/dashboard"><LayoutDashboard /><span>Dashboard</span></Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/dashboard/recommendations")} tooltip="Financial Plan">
                    <Link href="/dashboard/recommendations"><PiggyBank /><span>Financial Plan</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/dashboard/plans")} tooltip="Browse Plans">
                    <Link href="/dashboard/plans"><ShieldCheck /><span>Browse Plans</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/dashboard/health-quotes")} tooltip="Health Quotes">
                    <Link href="/dashboard/health-quotes"><Heart /><span>Health Quotes</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/dashboard/quotes")} tooltip="Supplemental Quotes">
                    <Link href="/dashboard/quotes"><FileDigit /><span>Supplemental Quotes</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/dashboard/apply")} tooltip="Submit Application">
                    <Link href="/dashboard/apply"><FileText /><span>Submit Application</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {isLoggedIn && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/dashboard/documents")} tooltip="Documents">
                      <Link href="/dashboard/documents"><UploadCloud /><span>Documents</span></Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/dashboard/education")} tooltip="Education">
                    <Link href="/dashboard/education"><BookOpen /><span>Education</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>
            <SidebarFooter className="flex flex-col gap-2">
               <SidebarMenu>
                {isLoggedIn ? (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={isActive("/dashboard/settings")} tooltip="Settings">
                        <Link href="/dashboard/settings">
                          <Settings />
                          <span>Settings</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton onClick={handleLogout} tooltip="Log Out">
                          <LogOut />
                          <span>Log Out</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                ) : (
                  <>
                    <SidebarMenuItem>
                       <SidebarMenuButton asChild isActive={isActive("/") && !pathname.includes('signup')} tooltip="Login">
                        <Link href="/">
                          <LogIn />
                          <span>Login</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                       <SidebarMenuButton asChild isActive={pathname.includes('signup')} tooltip="Sign Up">
                        <Link href="/?mode=signup">
                          <UserPlus />
                          <span>Sign Up</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}
              </SidebarMenu>
            </SidebarFooter>
          </SidebarContent>
        </Sidebar>
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-white/80 px-4 sm:px-8 backdrop-blur-sm">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="lg:hidden" />
                <div className="relative hidden lg:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <Input placeholder="Search..." className="w-full rounded-lg bg-white pl-10 h-10 md:w-[200px] lg:w-[336px]" />
                </div>
            </div>
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <UserNav />
              ) : (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" asChild><Link href="/">Login</Link></Button>
                    <Button asChild><Link href="/?mode=signup">Sign Up</Link></Button>
                </div>
              )}
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-12">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
