'use client';

import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Users, Crown } from 'lucide-react';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { toast } from 'sonner';
import { useOrganizationMembers, useUpdateMemberRole, useRemoveMember } from '@/hooks/use-organization-members';


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
  const currentMember = members.find(m => m.role === 'owner' || m.role === 'admin'); // Simplified - adjust based on actual user

  const handleUpdateRole = (memberId: string, newRole: string) => {
    if (!currentMember || (currentMember.role !== 'owner' && currentMember.role !== 'admin')) {
      toast.warning('You do not have permission to update member roles.');
      return;
    }

    updateRoleMutation.mutate(
      {
        memberId,
        role: newRole as 'member' | 'admin' | 'owner',
        organizationId: orgId,
      },
      {
        onSuccess: () => {
          toast.success(`Role updated to ${newRole}`);
        },
        onError: (error) => {
          console.error('Failed to update role:', error);
          toast.warning('Failed to update member role. Please try again.');
        },
      }
    );
  };

  const handleRemoveMember = (_memberId: string, memberEmail: string) => {
    if (!currentMember || (currentMember.role !== 'owner' && currentMember.role !== 'admin')) {
      toast.warning('You do not have permission to remove members.');
      return;
    }

    removeMemberMutation.mutate({
      memberIdOrEmail: memberEmail,
      organizationId: orgId,
    } as const, {
      onSuccess: () => {
        toast.success('Member removed successfully');
      },
      onError: (error) => {
        console.error('Failed to remove member:', error);
        toast.warning('Failed to remove member. Please try again.');
      },
    });
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
          message={error?.message || 'This organization may not exist or you may not have access.'}
          type="page"
          onRetry={() => window.location.reload()}
          retryLabel="Try Again"
        />
      </div>
    );
  }

  const isOwner = currentMember?.role === 'owner';
  const canManageMembers = currentMember && (currentMember.role === 'owner' || currentMember.role === 'admin');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold"><span className="capitalize">{organization.name}</span> Members</h1>
          <p className="text-muted-foreground">Manage your organization members</p>
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
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {member.user?.name?.charAt(0)?.toUpperCase() || member.user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.user?.name || 'Unknown User'}</p>
                    <p className="text-sm text-muted-foreground">{member.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {member.id === currentMember?.id ? (
                    <Badge variant={member.role === 'owner' ? 'default' : 'secondary'} className="flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      {member.role}
                    </Badge>
                  ) : canManageMembers ? (
                    <>
                      <Label htmlFor={`role-${member.id}`} className="sr-only">
                        Role for {member.user?.name}
                      </Label>
                         <Select
                         value={member.role}
                         onValueChange={(value) => handleUpdateRole(member.id, value)}
                         disabled={updateRoleMutation.isPending}
                       >
                        <SelectTrigger className="w-28" id={`role-${member.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          {isOwner && <SelectItem value="owner">Owner</SelectItem>}
                        </SelectContent>
                      </Select>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="outline" size="sm" disabled={removeMemberMutation.isPending}>
                             Remove
                           </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Member</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove {member.user?.name || member.user?.email} from this organization? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveMember(member.id, member.user?.email || '')}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remove Member
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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