"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Settings, Trash2 } from "lucide-react";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { toast } from "sonner";
import { useOrganizationMembers } from "@/hooks/use-organization-members";
import { useUpdateOrganization, useDeleteOrganization, useLeaveOrganization } from "@/hooks/use-organization-crud";
import { useSession } from "@/lib/auth-client";

export default function OrganizationSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.id as string;

  // Use new TanStack Query hooks
  const { data: session } = useSession();
  const { data: orgData, isLoading, error } = useOrganizationMembers(orgId);
  const updateOrgMutation = useUpdateOrganization();
  const deleteOrgMutation = useDeleteOrganization();
  const leaveOrgMutation = useLeaveOrganization();


  // Extract data from query result
  const organization = orgData || null;
  const members = orgData?.members || [];
  const currentMember = members.find(m => m.userId === session?.user?.id);

  // Check permissions based on role
  const canEdit = currentMember?.role === "owner";
  const canDelete = currentMember?.role === "owner";
  const canLeave = !!currentMember; // All members can leave

  // Local state for form
  const [name, setName] = useState(organization?.name || "");
  const [slug, setSlug] = useState(organization?.slug || "");

  // Update local state when organization data loads
  React.useEffect(() => {
    if (organization) {
      setName(organization.name);
      setSlug(organization.slug);
    }
  }, [organization]);

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (newName: string) => {
    setName(newName);
    setSlug(generateSlug(newName));
  };

  const handleSave = () => {
    if (!organization || !currentMember || currentMember.role !== "owner") {
      toast.warning("You don't have permission to update organization settings.");
      return;
    }

    updateOrgMutation.mutate(
      {
        organizationId: organization.id,
        name: name !== organization.name ? name : undefined,
        slug: slug !== organization.slug ? slug : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Organization settings updated successfully");
        },
        onError: (error) => {
          console.error("Failed to update organization:", error);
          toast.warning("Failed to update organization settings");
        },
      }
    );
  };

  const handleDelete = () => {
    if (!organization || !currentMember || currentMember.role !== "owner") {
      toast.warning("You don't have permission to delete this organization.");
      return;
    }

    deleteOrgMutation.mutate(
      { organizationId: organization.id },
      {
        onSuccess: () => {
          toast.success("Organization deleted successfully");
          router.push("/dashboard");
        },
        onError: (error) => {
          console.error("Failed to delete organization:", error);
          toast.warning("Failed to delete organization");
        },
      }
    );
  };

  const handleLeaveOrganization = () => {
    if (!organization) return;

    leaveOrgMutation.mutate(
      { organizationId: organization.id },
      {
        onSuccess: () => {
          toast.success("You have left the organization");
          router.push("/dashboard");
        },
        onError: (error) => {
          console.error("Failed to leave organization:", error);
          toast.warning("Failed to leave organization. Please try again.");
        },
      }
    );
  };



  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="form" />
      </div>
    );
  }

  if (error || !organization || !currentMember) {
    return (
      <div className="space-y-6">
        <ErrorState
          message={error?.message || 'This organization may not exist or you may not have access.'}
          type="page"
          onRetry={() => window.location.reload()}
          retryLabel="Try Again"
        />
      </div>
    );
  }



  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          <span className="capitalize">{organization.name}</span> Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your organization settings
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>
              {canEdit ? "Update your organization information" : "View organization information"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={!canEdit}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Organization Slug</Label>
              <Input
                id="slug"
                value={slug}
                disabled={true}
                placeholder="Auto-generated from name"
              />
              <p className="text-sm text-muted-foreground">
                Auto-generated from organization name. Used in URLs and cannot contain spaces or special characters.
              </p>
            </div>

            {canEdit && (
              <Button
                onClick={handleSave}
                disabled={updateOrgMutation.isPending}
              >
                {updateOrgMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </CardContent>
        </Card>

        {canDelete && (
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Deleting your organization will permanently remove all data,
                members, and projects.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    Delete Organization
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Organization</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete{" "}
                      <strong>{organization.name}</strong>? This action cannot
                      be undone and will permanently remove all organization
                      data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={deleteOrgMutation.isPending}
                    >
                      {deleteOrgMutation.isPending ? "Deleting..." : "Delete Organization"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        )}

        {canLeave && (
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Leave Organization</CardTitle>
              <CardDescription>Remove yourself from this organization</CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    Leave Organization
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Leave Organization</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to leave {organization?.name}? You will lose access to all organization resources and projects.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleLeaveOrganization}
                      disabled={leaveOrgMutation.isPending}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {leaveOrgMutation.isPending ? "Leaving..." : "Leave Organization"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
