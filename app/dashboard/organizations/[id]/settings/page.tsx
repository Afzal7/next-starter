"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { orgClient } from "@/lib/auth-client";
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

interface Organization {
  id: string;
  name: string;
  slug: string;
  metadata?: Record<string, unknown>;
}

interface Member {
  id: string;
  role: string;
}

export default function OrganizationSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

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

  const orgId = params.id as string;

  useEffect(() => {
    const fetchOrganization = async () => {
      if (!session?.user || !orgId) return;

      try {
        setIsLoading(true);
        setError("");

        const { data: orgData, error: orgError } =
          await orgClient.getFullOrganization();
        if (orgError) throw new Error(orgError.message);

        const org = orgData;
        if (!org) throw new Error("Organization not found");

        const { members, ...orgInfo } = org;
        setOrganization(orgInfo);
        setName(orgInfo.name);
        setSlug(orgInfo.slug);

        const member = members?.find((m) => m.userId === session.user.id);
        setCurrentMember(member || null);
      } catch (err) {
        console.error("Failed to fetch organization:", err);
        setError("Failed to load organization settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganization();
  }, [session, orgId]);

  const handleSave = async () => {
    if (!organization || !currentMember || currentMember.role !== "owner")
      return;

    setIsSaving(true);
    try {
      const { error } = await orgClient.update({
        organizationId: organization.id,
        data: {
          name,
          slug,
        },
      });

      if (error) {
        toast.warning(`Failed to update organization: ${error.message}`);
        return;
      }

      // Update local state
        // Update local state with supported fields
        setOrganization((prev) =>
        prev
          ? {
              ...prev,
              name,
              slug,
            }
          : null
      );

      toast.success("Organization settings updated successfully");
    } catch (err) {
      console.error("Failed to update organization:", err);
      toast.warning("Failed to update organization settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!organization || !currentMember || currentMember.role !== "owner")
      return;

    setIsDeleting(true);
    try {
      const { error } = await orgClient.delete({
        organizationId: organization.id,
      });

      if (error) {
        toast.warning(`Failed to delete organization: ${error.message}`);
        return;
      }

      toast.success("Organization deleted successfully");
      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to delete organization:", err);
      toast.warning("Failed to delete organization");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!organization || !currentMember) {
    return <ErrorState message="Organization not found" />;
  }

  const canEdit = currentMember.role === "owner";
  const canDelete = currentMember.role === "owner";

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
              Update your organization information
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
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
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
                      disabled={isDeleting}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {isDeleting ? "Deleting..." : "Delete Organization"}
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
