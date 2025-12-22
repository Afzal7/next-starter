"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

interface OrganizationData {
  id: string;
  name: string;
}

interface OrgContext {
  orgId: string;
  isOrgPage: boolean;
  currentSection: string;
}

interface DashboardBreadcrumbProps {
  orgContext: OrgContext | null;
  userOrg: OrganizationData | null;
}

// Utility function to capitalize first letter
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Generate breadcrumbs dynamically from URL
function generateBreadcrumbs(
  pathname: string,
  orgContext: OrgContext | null,
  userOrg: OrganizationData | null
) {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: Array<{
    label: string;
    href?: string;
    isCurrent?: boolean;
  }> = [];

  // Special handling for dashboard routes
  if (segments[0] === "dashboard") {
    breadcrumbs.push({ label: "Dashboard", href: "/dashboard" });

    if (segments.length === 1) {
      // Just /dashboard - Dashboard is current page
      breadcrumbs[0].isCurrent = true;
    } else if (segments[1] === "settings") {
      // /dashboard/settings
      breadcrumbs.push({ label: "Settings", isCurrent: true });
    } else if (segments[1] === "organizations" && orgContext) {
      // Organization routes
      const orgName = userOrg?.name || "Organization";
      breadcrumbs.push({
        label: orgName,
        href: `/dashboard/organizations/${orgContext.orgId}`,
      });

      if (orgContext.currentSection !== "overview") {
        breadcrumbs.push({
          label: capitalize(orgContext.currentSection),
          isCurrent: true,
        });
      } else {
        // Organization overview is current page
        breadcrumbs[breadcrumbs.length - 1].isCurrent = true;
        breadcrumbs[breadcrumbs.length - 1].href = undefined;
      }
    }
  }

  return breadcrumbs;
}

export function DashboardBreadcrumb({
  orgContext,
  userOrg,
}: DashboardBreadcrumbProps) {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname, orgContext, userOrg);

  if (breadcrumbs.length === 0) return null;

  return (
    <Breadcrumb className="hidden sm:block">
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {crumb.isCurrent ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : crumb.href ? (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
