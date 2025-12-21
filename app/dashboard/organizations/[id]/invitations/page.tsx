'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { orgClient } from '@/lib/auth-client';
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
import type { Organization } from 'better-auth/plugins/organization';

export default function OrganizationInvitationsPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [invitations, setInvitations] = useState<{ id: string; email: string; role: string; status: string; createdAt: Date }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'admin'>('member');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [cancellingInvite, setCancellingInvite] = useState<string | null>(null);
  const [resendingInvite, setResendingInvite] = useState<string | null>(null);

  const orgId = params.id as string;

  useEffect(() => {
    const fetchOrganizationData = async () => {
      if (!session?.user || !orgId) return;

      try {
        setIsLoading(true);
        const { data: orgData, error: orgError } = await orgClient.getFullOrganization();

        if (orgError) {
          setError('Organization not found or access denied');
          return;
        }

        const { invitations: orgInvitations, ...org } = orgData || {};
        setOrganization(org);
        setInvitations(orgInvitations || []);
      } catch {
        setError('Failed to load organization');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizationData();
  }, [session?.user?.id, session?.user, orgId]);

  const handleCancelInvitation = async (invitationId: string) => {
    setCancellingInvite(invitationId);
    try {
      const { error } = await orgClient.cancelInvitation({ invitationId });

      if (error) {
        const errorMessage = error.message || 'Failed to cancel invitation';
        console.error('API error:', error);
        toast.warning(`Failed to cancel invitation: ${errorMessage}`);
        return;
      }

      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      toast.success('Invitation canceled successfully');
    } catch (error) {
      console.error('Failed to cancel invitation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel invitation';
      toast.warning(`Failed to cancel invitation: ${errorMessage}`);
    } finally {
      setCancellingInvite(null);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    setResendingInvite(invitationId);
    try {
      const invitation = invitations.find(inv => inv.id === invitationId);
      if (!invitation) return;

      const { error } = await orgClient.inviteMember({
        email: invitation.email,
        role: invitation.role as 'member' | 'admin' | 'owner',
        organizationId: orgId,
        resend: true,
      });

      if (error) {
        const errorMessage = error.message || 'Failed to resend invitation';
        console.error('Email service error:', error);
        toast.warning(`Failed to resend invitation: ${errorMessage}`);
        return;
      }

      toast.success('Invitation resent successfully');
    } catch (error) {
      console.error('Failed to resend invitation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend invitation';
      toast.warning(`Failed to resend invitation: ${errorMessage}`);
    } finally {
      setResendingInvite(null);
    }
  };

  const handleSendInvitation = async () => {
    if (!inviteEmail.trim() || !organization) return;

    setIsInviting(true);
    setInviteError(null);
    try {
      const { error } = await orgClient.inviteMember({
        email: inviteEmail,
        role: inviteRole,
        organizationId: organization.id,
      });

      if (error) {
        const errorMessage = error.message || 'Failed to send invitation';
        console.error('Email service error:', error);
        setInviteError(errorMessage);
        toast.warning(`Failed to send invitation: ${errorMessage}`);
        return;
      }

      const { data: inviteData } = await orgClient.listInvitations({
        query: { organizationId: organization.id },
      });
      setInvitations(inviteData || []);

      setInviteEmail('');
      setInviteRole('member');
      setShowInviteModal(false);
      toast.success('Invitation sent successfully');
    } catch (error) {
      console.error('Failed to send invitation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send invitation';
      setInviteError(errorMessage);
      toast.warning(`Failed to send invitation: ${errorMessage}`);
    } finally {
      setIsInviting(false);
    }
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
          message={error || 'This organization may not exist or you may not have access.'}
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
        <Button onClick={() => setShowInviteModal(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
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
                      disabled={resendingInvite === invitation.id}
                    >
                      {resendingInvite === invitation.id ? 'Sending...' : 'Resend'}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={cancellingInvite === invitation.id}
                          className="text-destructive hover:text-destructive"
                        >
                          {cancellingInvite === invitation.id ? 'Canceling...' : 'Cancel'}
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
                disabled={isInviting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={inviteRole}
                onValueChange={(value) => setInviteRole(value as 'member' | 'admin')}
                disabled={isInviting}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
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
              disabled={isInviting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendInvitation}
              disabled={!inviteEmail.trim() || isInviting}
            >
              {isInviting ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}