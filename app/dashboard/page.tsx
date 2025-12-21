/**
 * SaaS Dashboard - Starter Template
 *
 * This dashboard is designed as a reusable starting point for SaaS applications.
 * It provides common patterns like user management, organizations, billing, and metrics.
 *
 * CUSTOMIZATION GUIDE:
 * 1. Update DASHBOARD_CONFIG with your app's branding and features
 * 2. Replace sample metrics with real data from your app
 * 3. Customize card content and layouts as needed
 * 4. Add/remove cards using the enabledCards config
 * 5. Modify trial banners and upgrade flows for your pricing
 *
 * KEY COMPONENTS TO CUSTOMIZE:
 * - DASHBOARD_CONFIG: App branding, features, metrics
 * - Trial banner messages: Adapt to your pricing strategy
 * - Card layouts: Modify or replace with app-specific content
 * - Modal content: Update upgrade and creation flows
 */

"use client";

import { useSession, orgClient } from "@/lib/auth-client";
import { useEffect, useState, Suspense, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

import { Building2, Users, Download } from "lucide-react";
import { useRouter } from "next/navigation";

import { useSubscription } from "@/hooks/use-subscription";
import { useFeatureGate } from "@/hooks/use-feature-gate";
import { UpgradeModal } from "@/components/ui/upgrade-modal";
import { EmptyState } from "@/components/shared/empty-state";

// TODO: Customize these for your SaaS application
const DASHBOARD_CONFIG = {
  appName: "Your SaaS App", // TODO: Set NEXT_PUBLIC_APP_NAME env var
  features: [
    "Unlimited projects", // TODO: Replace with your app's features
    "Advanced analytics", // TODO: Replace with your app's features
    "Priority support", // TODO: Replace with your app's features
    "Export features", // TODO: Replace with your app's features
    "Team collaboration", // TODO: Replace with your app's features
  ],
  metrics: [
    { label: "Projects", key: "projectsCount" }, // TODO: Connect to real data
    { label: "Features Used", key: "featuresCount" }, // TODO: Connect to real data
    { label: "Team Members", key: "membersCount" }, // TODO: Connect to real data
  ],
  // TODO: Easily enable/disable dashboard cards
  enabledCards: {
    welcome: true,
    upgrade: true, // Only shown to free users
    organizations: true,
    usage: true,
  },
};

// TODO: Replace these with real data fetching functions
const getSampleMetrics = () => ({
  projectsCount: 12, // TODO: Connect to your app's project count
  featuresCount: 47, // TODO: Connect to your app's feature usage
  membersCount: 3, // TODO: Connect to your app's member count
});

function DashboardContent() {
  const { data: session } = useSession();
  const { isLoading: subscriptionLoading } = useSubscription();
  const {
    showUpgradeModal: showFeatureUpgradeModal,
    setShowUpgradeModal: setShowFeatureUpgradeModal,
    triggerUpgrade,
    isPro,
  } = useFeatureGate();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);
  const [organizations, setOrganizations] = useState<
    { id: string; name: string; members?: { id: string; userId: string }[] }[]
  >([]);
  const [orgsLoading, setOrgsLoading] = useState(true);
  const hasFetchedOrgsRef = useRef(false);
  const router = useRouter();

  // TODO: Replace with real metrics from your app
  const metrics = getSampleMetrics();

  useEffect(() => {
    if (!session?.user || hasFetchedOrgsRef.current) return;

    const fetchOrganizations = async () => {
      if (!session?.user || hasFetchedOrgsRef.current) return;

      try {
        setOrgsLoading(true);
        const { data, error } = await orgClient.list({
          query: { userId: session.user.id },
        });

        if (error) {
          // Failed to fetch organizations
          return;
        }

        setOrganizations(data || []);
        hasFetchedOrgsRef.current = true;
      } catch {
        // Organization fetch error
      } finally {
        setOrgsLoading(false);
      }
    };

    fetchOrganizations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  const handleUpgrade = () => {
    // TODO: Implement actual upgrade
    router.push("/dashboard/upgrade");
  };

  const handleConfirmUpgrade = () => {
    // TODO: Implement actual upgrade
    router.push("/dashboard/upgrade");
  };

  const handleCreateOrg = async () => {
    if (!orgName.trim() || !session?.user) return;

    setIsCreatingOrg(true);
    try {
      // Auto-generate slug from name if not provided
      const slug =
        orgSlug ||
        orgName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");

      const { data, error } = await orgClient.create({
        name: orgName,
        slug,
      });

      if (error) {
        alert("Failed to create organization. Please try again.");
        return;
      }

      // Reset form
      setOrgName("");
      setOrgSlug("");
      setShowCreateOrgModal(false);

      // Redirect to organization dashboard
      router.push(`/dashboard/organizations/${data?.id}`);
    } catch {
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsCreatingOrg(false);
    }
  };

  const handleOrgNameChange = (name: string) => {
    setOrgName(name);
    // Auto-generate slug from name
    setOrgSlug(
      name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
    );
  };

  if (subscriptionLoading) {
    return (
      <div className="space-y-6">
        {/* Trial Banner Skeleton */}
        <Skeleton className="h-16 w-full rounded-lg" />

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* TODO: Customize header for your app */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name || "User"}!
        </p>
      </div>

      {/* Upgrade banner for free users */}
      {!isPro && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">
                  Upgrade to Pro
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  Unlock unlimited features and premium tools
                </p>
              </div>
              <Button
                onClick={handleUpgrade}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Upgrade Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Organization Management Card - Common for B2B SaaS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {organizations.length > 0
                ? "Your Organizations"
                : "Organization Workspace"}
            </CardTitle>
            <CardDescription>
              {organizations.length > 0
                ? "Manage your team workspaces"
                : "Create a workspace for your team to collaborate"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orgsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : organizations.length > 0 ? (
              <div className="space-y-3">
                {organizations.slice(0, 2).map((org) => (
                  <div
                    key={org.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{org.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {org.members?.length || 0} members
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        router.push(`/dashboard/organizations/${org.id}`)
                      }
                    >
                      Manage
                    </Button>
                  </div>
                ))}
                {organizations.length > 2 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{organizations.length - 2} more organizations
                  </p>
                )}
              </div>
            ) : (
              <EmptyState
                icon={Users}
                title="No organizations yet"
                description="Set up an organization to invite team members and manage projects together."
                size="sm"
                variant="inline"
                action={{
                  label: "Create Organization",
                  onClick: () => setShowCreateOrgModal(true),
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* TODO: Replace with real usage metrics for your app */}
        <Card>
          <CardHeader>
            <CardTitle>Usage This Month</CardTitle>
            {/* TODO: Add description explaining what metrics mean */}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* Sample metrics - connect to your app's analytics */}
              {DASHBOARD_CONFIG.metrics.map((metric) => (
                <div key={metric.key} className="flex justify-between">
                  <span>{metric.label}</span>
                  <span>
                    {metrics[metric.key as keyof typeof metrics] || 0}
                  </span>
                </div>
              ))}
            </div>
            {/* TODO: Implement real export functionality */}
            <Button
              onClick={
                isPro ? () => alert("Exporting data...") : triggerUpgrade
              }
              variant={isPro ? "default" : "outline"}
              className="w-full mt-4"
            >
              <Download className="h-4 w-4 mr-2" />
              {isPro ? "Export Data" : "Export Data (Pro)"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* TODO: Customize upgrade modal content for your app */}
      {/* Reusable modal system - easy to adapt for different CTAs */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade to Pro</DialogTitle>
            <DialogDescription>
              You&apos;ve reached a Pro feature limit. Upgrade now to continue
              using all features.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">What you&apos;ll unlock:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {DASHBOARD_CONFIG.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
            <Button onClick={handleConfirmUpgrade} className="w-full">
              Start Free Trial
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* TODO: Customize organization creation flow for your app */}
      {/* This modal can be adapted for any resource creation workflow */}
      <Dialog open={showCreateOrgModal} onOpenChange={setShowCreateOrgModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Your Organization Workspace</DialogTitle>
            <DialogDescription>
              Set up a workspace for your team to collaborate and manage
              projects together.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                type="text"
                placeholder="Acme Corp"
                value={orgName}
                onChange={(e) => handleOrgNameChange(e.target.value)}
                disabled={isCreatingOrg}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-slug">Organization URL</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-sm text-foreground bg-muted border border-r-0 rounded-l-md">
                  {process.env.NEXT_PUBLIC_APP_URL?.replace(/https?:\/\//, "")}
                  /org/
                </span>
                <Input
                  id="org-slug"
                  type="text"
                  placeholder="acme-corp"
                  value={orgSlug}
                  onChange={(e) => setOrgSlug(e.target.value)}
                  className="rounded-l-none"
                  disabled={isCreatingOrg}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This will be your organization&apos;s URL. Only letters,
                numbers, and hyphens allowed.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateOrgModal(false)}
              disabled={isCreatingOrg}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateOrg}
              disabled={isCreatingOrg || !orgName.trim()}
            >
              {isCreatingOrg ? "Creating..." : "Create Organization"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feature Upgrade Modal */}
      <UpgradeModal
        open={showFeatureUpgradeModal}
        onOpenChange={setShowFeatureUpgradeModal}
        title="Unlock Data Export"
        description="Export your usage data and analytics with Pro."
        featureName="Data Export"
      />
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
