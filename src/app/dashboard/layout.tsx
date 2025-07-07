
"use client"

import { useEffect, useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  FileText,
  Settings,
  LogOut,
  Search,
  BookOpen,
  FileDigit,
  PiggyBank,
  Heart,
  LogIn,
  X,
  Beaker,
  User,
  Loader2,
} from "lucide-react";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";


function DashboardLayoutComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, loading, error] = useFirebaseAuth();
  
  const applicationType = searchParams.get('type');
  const isApplyFormPage = pathname === '/dashboard/apply' && !!applicationType;
  const isRetirementPlanPage = pathname === '/dashboard/recommendations';

  const isFullScreenForm = isApplyFormPage || isRetirementPlanPage;

  const isActive = (path: string) => pathname === path;
  
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);
  
  const handleExit = () => {
    setIsAlertOpen(false);
    if (isApplyFormPage) {
      router.push('/dashboard/apply');
    } else {
      router.push('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // or a redirect, but the effect handles it
  }

  if (isFullScreenForm) {
    return (
      <>
        <div className="relative w-screen h-screen bg-background overflow-y-auto grid place-items-center p-4 sm:p-6 md:p-8">
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 rounded-full"
                onClick={() => setIsAlertOpen(true)}
            >
                <X className="h-6 w-6" />
                <span className="sr-only">Exit Form</span>
            </Button>
            {children}
        </div>
         <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to exit?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Any unsaved changes will be lost. If you exit, your progress on this form will be cleared.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setIsAlertOpen(false)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleExit}>
                        Exit
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen md:flex">
        <Sidebar collapsible="icon">
          <SidebarRail/>
          <SidebarContent className="flex flex-col justify-between">
            <div>
              <SidebarHeader>
                <Logo />
              </SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/dashboard")} tooltip="Dashboard">
                    <Link href="/dashboard"><LayoutDashboard /><span>Dashboard</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/dashboard/recommendations")} tooltip="Retirement Plan">
                    <Link href="/dashboard/recommendations"><PiggyBank /><span>Retirement Plan</span></Link>
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
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/dashboard/documents")} tooltip="My Account">
                    <Link href="/dashboard/documents"><User /><span>My Account</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/dashboard/education")} tooltip="Education">
                    <Link href="/dashboard/education"><BookOpen /><span>Education</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>
            <SidebarFooter className="flex flex-col gap-2">
               <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/dashboard/settings")} tooltip="Settings">
                      <Link href="/dashboard/settings">
                        <Settings />
                        <span>Settings</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </SidebarContent>
        </Sidebar>
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-4 sm:px-8 backdrop-blur-sm">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden" />
                <div className="relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input placeholder="Search..." className="w-full rounded-lg bg-background pl-10 h-10 md:w-[200px] lg:w-[336px]" />
                </div>
            </div>
            <div className="flex items-center gap-4">
              <UserNav />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <DashboardLayoutComponent>{children}</DashboardLayoutComponent>
    </Suspense>
  )
}

    