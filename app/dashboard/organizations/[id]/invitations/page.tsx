'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, UserPlus, Clock } from 'lucide-react';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { toast } from 'sonner';
import { useOrganizationInvitations, useInviteMember, useCancelInvitation, useResendInvitation } from '@/hooks/use-organization-invitations';
import { useOrganizationMembers } from '@/hooks/use-organization-members';
import { useSession } from '@/lib/auth-client';
import type { Member } from 'better-auth/plugins/organization';


export default function OrganizationInvitationsPage() {
  const params = useParams();
  const orgId = params.id as string;

  // Use new TanStack Query hooks
  const { data: session } = useSession();
  const { data: orgData, isLoading, error } = useOrganizationInvitations(orgId);
  const { data: memberData } = useOrganizationMembers(orgId);
  const inviteMemberMutation = useInviteMember();
  const cancelInvitationMutation = useCancelInvitation();
  const resendInvitationMutation = useResendInvitation();

  // Extract data from query result
  const organization = orgData || null;
  const invitations = orgData?.invitations || [];
  const members = memberData?.members || [];

  // Find current user's membership
  const currentMember = members.find((m: Member) => m.userId === session?.user?.id);

  // Check if current user can invite members (owners and admins)
  const canInviteMembers = currentMember?.role === 'owner' || currentMember?.role === 'admin';

  // Local state for UI
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'admin' | 'owner'>('member');
  const [inviteError, setInviteError] = useState<string | null>(null);

  const handleCancelInvitation = (invitationId: string) => {
    cancelInvitationMutation.mutate({ invitationId }, {
      onSuccess: () => {
        toast.success('Invitation canceled successfully');
      },
      onError: (error) => {
        console.error('Failed to cancel invitation:', error);
        toast.warning('Failed to cancel invitation. Please try again.');
      },
    });
  };

  const handleResendInvitation = (invitationId: string) => {
    const invitation = invitations.find(inv => inv.id === invitationId);
    if (!invitation) return;

    resendInvitationMutation.mutate(
      {
        invitationId,
        email: invitation.email,
        role: invitation.role as 'member' | 'admin',
        organizationId: orgId,
      },
      {
        onSuccess: () => {
          toast.success('Invitation resent successfully');
        },
        onError: (error) => {
          console.error('Failed to resend invitation:', error);
          toast.warning('Failed to resend invitation. Please try again.');
        },
      }
    );
  };

  const handleSendInvitation = () => {
    if (!inviteEmail.trim() || !organization) return;

     // Check if current user has permission to send invitations
     if (!canInviteMembers) {
       toast.warning('You do not have permission to send invitations.');
       setInviteError('Insufficient permissions to send invitations.');
       return;
     }

    setInviteError(null);
    inviteMemberMutation.mutate(
      {
        email: inviteEmail,
        role: inviteRole,
        organizationId: organization.id,
      },
      {
        onSuccess: () => {
          setInviteEmail('');
          setInviteRole('member');
          setShowInviteModal(false);
          toast.success('Invitation sent successfully');
        },
        onError: (error) => {
          console.error('Failed to send invitation:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to send invitation';
          setInviteError(errorMessage);
          toast.warning(`Failed to send invitation: ${errorMessage}`);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" count={4} />
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

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold"><span className="capitalize">{organization.name}</span> Invitations</h1>
        <p className="text-muted-foreground">Manage pending invitations</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{pendingInvitations.length} pending</Badge>
        </div>
        {canInviteMembers && (
          <Button onClick={() => setShowInviteModal(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Pending Invitations
          </CardTitle>
          <CardDescription>
            Invitations waiting for acceptance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingInvitations.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No pending invitations</h3>
              <p className="text-muted-foreground mb-4">All invitations have been accepted or expired.</p>
              <Button onClick={() => setShowInviteModal(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Send New Invitation
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingInvitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                      <Mail className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium">{invitation.email}</p>
                      <p className="text-sm text-muted-foreground">Invited as {invitation.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Pending
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResendInvitation(invitation.id)}
                      disabled={resendInvitationMutation.isPending}
                    >
                      {resendInvitationMutation.isPending ? 'Sending...' : 'Resend'}
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={cancelInvitationMutation.isPending}
                            className="text-destructive hover:text-destructive"
                          >
                            {cancelInvitationMutation.isPending ? 'Canceling...' : 'Cancel'}
                          </Button>
                        </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to cancel the invitation to <strong>{invitation.email}</strong>? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleCancelInvitation(invitation.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Cancel Invitation
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Organization Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join {organization?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="member@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={inviteMemberMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={inviteRole}
                onValueChange={(value) => setInviteRole(value as 'member' | 'admin' | 'owner')}
                disabled={inviteMemberMutation.isPending}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  {canInviteMembers && (
                    <SelectItem value="owner">Owner</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Members can view and edit content. Admins can manage team members and settings.
              </p>
            </div>

            {inviteError && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {inviteError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowInviteModal(false)}
              disabled={inviteMemberMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendInvitation}
              disabled={!inviteEmail.trim() || inviteMemberMutation.isPending}
            >
              {inviteMemberMutation.isPending ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}