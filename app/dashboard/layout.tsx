"use client";

import {
  HomeIcon,
  SettingsIcon,
  Building2Icon,
  Users,
  Mail,
} from "lucide-react";
import { APP_CONFIG } from "@/lib/config";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import ProfileDropdown from "@/components/shadcn-studio/blocks/dropdown-profile";
import { useOrganizationContext } from "@/hooks/use-organization-context";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { orgClient } from "@/lib/auth-client";
import { FadeInRight } from "@/components/animations/fade-in";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgContext = useOrganizationContext();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [userOrg, setUserOrg] = useState<{ id: string; name: string } | null>(
    null
  );

  // Fetch user's organization (assuming only one)
  useEffect(() => {
    const fetchUserOrg = async () => {
      if (!session?.user) return;

      try {
        const { data, error } = await orgClient.list({
          query: { userId: session.user.id },
        });

        if (!error && data && data.length > 0) {
          setUserOrg(data[0]); // Take the first (and only) organization
        }
      } catch {
        // Ignore errors
      }
    };

    fetchUserOrg();
  }, [session?.user?.id, session?.user]);

  return (
    <div className="flex min-h-dvh w-full">
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            {/* Sidebar Header */}
            <div className="p-4 border-b">
              <div className="flex items-center space-x-3">
                <div className="flex size-10 items-center justify-center rounded-sm bg-linear-to-br from-sky-300 via-sky-500 to-sky-600">
                  <span className="text-xl text-primary-foreground">
                    {APP_CONFIG.logo.icon}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{APP_CONFIG.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {orgContext ? "Organization" : "Dashboard"}
                  </p>
                </div>
              </div>
            </div>

            {/* Default dashboard navigation */}
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/dashboard"}
                    >
                      <Link href="/dashboard">
                        <HomeIcon className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Organization Section - Single org per user */}
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={orgContext?.isOrgPage}>
                      <Link
                        href={
                          userOrg
                            ? `/dashboard/organizations/${userOrg.id}`
                            : "/dashboard"
                        }
                      >
                        <Building2Icon className="h-4 w-4" />
                        <span>Organization</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Organization-specific navigation when in org context */}
                  {orgContext && (
                    <>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={
                            pathname ===
                            `/dashboard/organizations/${orgContext.orgId}/members`
                          }
                          className="ml-6"
                        >
                          <Link
                            href={`/dashboard/organizations/${orgContext.orgId}/members`}
                          >
                            <Users className="h-3 w-3" />
                            <span className="text-sm">Members</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={
                            pathname ===
                            `/dashboard/organizations/${orgContext.orgId}/invitations`
                          }
                          className="ml-6"
                        >
                          <Link
                            href={`/dashboard/organizations/${orgContext.orgId}/invitations`}
                          >
                            <Mail className="h-3 w-3" />
                            <span className="text-sm">Invitations</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={
                            pathname ===
                            `/dashboard/organizations/${orgContext.orgId}/settings`
                          }
                          className="ml-6"
                        >
                          <Link
                            href={`/dashboard/organizations/${orgContext.orgId}/settings`}
                          >
                            <SettingsIcon className="h-3 w-3" />
                            <span className="text-sm">Settings</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  )}

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/dashboard/settings"}
                    >
                      <Link href="/dashboard/settings">
                        <SettingsIcon className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <div className="flex flex-1 flex-col">
          <header className="bg-card sticky top-0 z-50 border-b">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-2 sm:px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="[&_svg]:size-5!" />
                <Separator
                  orientation="vertical"
                  className="hidden h-4! sm:block"
                />
                <Breadcrumb className="hidden sm:block">
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/dashboard">
                        Dashboard
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {orgContext ? (
                      <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbLink href="/dashboard">
                            Organizations
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbPage>
                            {orgContext.currentSection === "overview"
                              ? "Overview"
                              : orgContext.currentSection === "members"
                              ? "Members"
                              : orgContext.currentSection === "invitations"
                              ? "Invitations"
                              : orgContext.currentSection === "settings"
                              ? "Settings"
                              : "Organization"}
                          </BreadcrumbPage>
                        </BreadcrumbItem>
                      </>
                    ) : null}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <div className="flex items-center gap-1.5">
                <ProfileDropdown
                  trigger={
                    <Button variant="ghost" size="icon" className="size-9.5">
                      <Avatar className="size-9.5 rounded-md">
                        <AvatarImage src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                    </Button>
                  }
                />
              </div>
            </div>
          </header>
          <main className="mx-auto size-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
            <FadeInRight key={pathname}>{children}</FadeInRight>
          </main>
          <footer>
            <div className="text-muted-foreground mx-auto flex size-full max-w-7xl items-center justify-center px-4 py-3 sm:px-6">
              <p className="text-sm text-balance text-center">
                {`©${new Date().getFullYear()}`} {APP_CONFIG.name}. Built with
                Next.js and Shadcn UI.
              </p>
            </div>
          </footer>
        </div>
      </SidebarProvider>
    </div>
  );
}
