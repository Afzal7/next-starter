"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Label } from "@/components/ui/label";
import { Users, Crown } from "lucide-react";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { toast } from "sonner";
import {
  useOrganizationMembers,
  useUpdateMemberRole,
  useRemoveMember,
} from "@/hooks/use-organization-members";
import { useSession } from "@/lib/auth-client";
import type { Member } from "better-auth/plugins/organization";

export default function OrganizationMembersPage() {
  const params = useParams();
  const orgId = params.id as string;

  // Use new TanStack Query hooks
  const { data: orgData, isLoading, error } = useOrganizationMembers(orgId);
  const updateRoleMutation = useUpdateMemberRole();
  const removeMemberMutation = useRemoveMember();

  // Extract data from query result
  const organization = orgData || null;
  const members = orgData?.members || [];
  // Find current user's membership in this organization
  const { data: session } = useSession();
  const currentMember = members.find((m) => m.userId === session?.user?.id);

  // Check if current user can manage members (owners and admins)
  const canManageMembers = currentMember?.role === 'owner' || currentMember?.role === 'admin';

  const handleUpdateRole = (memberId: string, newRole: string) => {
    // Find target member to check permissions
    const targetMember = members.find((m) => m.id === memberId);
    if (!targetMember) {
      toast.warning("Member not found.");
      return;
    }

    // Check if current user can modify this specific member
    if (!canModifyMember(targetMember)) {
      toast.warning("You do not have permission to modify this member's role.");
      return;
    }

    // Prevent demoting the last owner
    if (targetMember.role === "owner" && newRole !== "owner") {
      const ownerCount = members.filter((m) => m.role === "owner").length;
      if (ownerCount <= 1) {
        toast.warning(
          "Cannot remove the last owner. Promote another member to owner first."
        );
        return;
      }
    }

    updateRoleMutation.mutate(
      {
        memberId,
        role: newRole as "member" | "admin" | "owner",
        organizationId: orgId,
      },
      {
        onSuccess: () => {
          toast.success(`Role updated to ${newRole}`);
        },
        onError: (error) => {
          console.error("Failed to update role:", error);
          toast.warning("Failed to update member role. Please try again.");
        },
      }
    );
  };

  const handleRemoveMember = (memberId: string, _memberEmail: string) => {
    // Prevent self-removal
    if (memberId === currentMember?.id) {
      toast.warning(
        'Use "Leave Organization" to remove yourself from the organization.'
      );
      return;
    }

    // Find target member to check their role
    const targetMember = members.find((m) => m.id === memberId);
    if (!targetMember) {
      toast.warning("Member not found.");
      return;
    }

    // Prevent removing the last owner
    if (targetMember.role === "owner") {
      const ownerCount = members.filter((m) => m.role === "owner").length;
      if (ownerCount <= 1) {
        toast.warning(
          "Cannot remove the last owner. Transfer ownership to another member first."
        );
        return;
      }
    }

    // Prevent removing owners unless you're an owner
    if (targetMember.role === "owner" && currentMember?.role !== "owner") {
      toast.warning("Only owners can remove other owners.");
      return;
    }

     // Check if current user has permission to remove members
     if (!canManageMembers) {
       toast.warning("You do not have permission to remove members.");
       return;
     }

    removeMemberMutation.mutate(
      {
        memberIdOrEmail: memberId, // Use memberId instead of email for consistency
        organizationId: orgId,
      } as const,
      {
        onSuccess: () => {
          toast.success("Member removed successfully");
        },
        onError: (error) => {
          console.error("Failed to remove member:", error);
          toast.warning("Failed to remove member. Please try again.");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" count={6} />
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="space-y-6">
        <ErrorState
          message={
            error?.message ||
            "This organization may not exist or you may not have access."
          }
          type="page"
          onRetry={() => window.location.reload()}
          retryLabel="Try Again"
        />
      </div>
    );
  }

  const _isOwner = currentMember?.role === "owner";

  // Helper function to check if current user can modify a specific member's role
  const canModifyMember = (member: Member) => {
    if (!currentMember) return false;
    if (member.id === currentMember.id) return false; // Can't modify own role
    if (member.role === "owner" && currentMember.role !== "owner") return false; // Only owners can modify owner roles
    return canManageMembers;
  };

  // Helper function to check if current user can remove a specific member
  const canRemoveMember = (member: Member) => {
    if (!currentMember) return false;
    if (member.id === currentMember.id) return false; // Can't remove self
    if (member.role === "owner" && currentMember.role !== "owner") return false; // Only owners can remove owners
    return canManageMembers;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            <span className="capitalize">{organization.name}</span> Members
          </h1>
          <p className="text-muted-foreground">
            Manage your organization members
          </p>
        </div>
        <Badge variant="outline">{members.length} members</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </CardTitle>
          <CardDescription>
            View and manage organization members and their roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {member.user?.name?.charAt(0)?.toUpperCase() ||
                        member.user?.email?.charAt(0)?.toUpperCase() ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {member.user?.name || "Unknown User"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {member.user?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {member.id === currentMember?.id ? (
                    <Badge
                      variant="default"
                      className="flex items-center gap-1"
                    >
                      <Crown className="h-3 w-3" />
                      {member.role}
                    </Badge>
                  ) : canModifyMember(member) ? (
                    <>
                      <Label htmlFor={`role-${member.id}`} className="sr-only">
                        Role for {member.user?.name}
                      </Label>
                      <Select
                        value={member.role}
                        onValueChange={(value) =>
                          handleUpdateRole(member.id, value)
                        }
                        disabled={updateRoleMutation.isPending}
                      >
                        <SelectTrigger
                          className="w-28"
                          id={`role-${member.id}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          {_isOwner && (
                            <SelectItem value="owner">Owner</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {canRemoveMember(member) && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={removeMemberMutation.isPending}
                            >
                              Remove
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove{" "}
                                {member.user?.name || member.user?.email} from
                                this organization? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleRemoveMember(
                                    member.id,
                                    member.user?.email || ""
                                  )
                                }
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove Member
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </>
                  ) : (
                    <Badge variant="secondary">{member.role}</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
