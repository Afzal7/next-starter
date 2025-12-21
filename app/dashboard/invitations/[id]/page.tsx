'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { orgClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, CheckCircle } from 'lucide-react';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';

interface Invitation {
  id: string;
  email: string;
  role: string;
  organizationId: string;
  inviterId: string;
  status: string;
  inviter?: {
    user: {
      name?: string;
      email: string;
    };
  };
}

interface Organization {
  id: string;
  name: string;
}

export default function AcceptInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [error, setError] = useState('');
  const [modalError, setModalError] = useState('');
  const [success, setSuccess] = useState('');

  const invitationId = params.id as string;

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!invitationId) return;

      try {
        setIsLoading(true);
        const { data, error } = await orgClient.getInvitation({
          query: { id: invitationId },
        });

        if (error) {
          setError('Invitation not found or expired');
          return;
        }

        setInvitation(data);

        // For now, we'll display the invitation without detailed org/inviter info
        // This can be enhanced later with proper organization fetching
        setOrganization({ id: data.organizationId, name: 'Organization' });
      } catch {
        setError('Failed to load invitation');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvitation();
  }, [invitationId]);

  const handleAccept = async () => {
    if (!session?.user) {
      // Redirect to login if not authenticated
      router.push(`/login?redirect=/accept-invitation/${invitationId}`);
      return;
    }

    if (invitation?.status !== 'pending') {
      setModalError('This invitation is no longer valid.');
      return;
    }

    setIsAccepting(true);
    setModalError('');
    try {
      const { error } = await orgClient.acceptInvitation({
        invitationId,
      });

      if (error) {
        setModalError(error.message || 'Failed to accept invitation');
        return;
      }

      setSuccess('Successfully joined the organization!');
      // Redirect to organization page after a delay
      setTimeout(() => {
        router.push(`/dashboard/organizations/${invitation?.organizationId}`);
      }, 2000);
    } catch {
      setModalError('Failed to accept invitation');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async () => {
    if (!session?.user) {
      setModalError('You must be logged in to reject invitations');
      return;
    }

    setIsRejecting(true);
    setModalError('');
    try {
      const { error } = await orgClient.rejectInvitation({
        invitationId,
      });

      if (error) {
        setModalError(error.message || 'Failed to reject invitation');
        return;
      }

      setSuccess('Invitation rejected');
      // Redirect to dashboard after a delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch {
      setModalError('Failed to reject invitation');
    } finally {
      setIsRejecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <LoadingSkeleton type="card" />
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Invitation</h1>
            <p className="text-muted-foreground mt-2">Join your team workspace</p>
          </div>
          <ErrorState
            message={error}
            type="page"
            onRetry={() => window.location.reload()}
            retryLabel="Try Again"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Team Invitation</CardTitle>
            <CardDescription>
              You&apos;ve been invited to join {organization?.name || 'an organization'}
            </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {invitation && invitation.status === 'pending' ? (
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Organization</span>
                <span className="text-sm text-muted-foreground">{organization?.name}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Your Role</span>
                <span className="text-sm text-muted-foreground capitalize">{invitation.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Invited By</span>
                <span className="text-sm text-muted-foreground">{invitation.inviter?.user?.name || invitation.inviter?.user?.email}</span>
              </div>
            </div>
          ) : invitation?.status === 'cancelled' ? (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-center space-x-2 text-red-700">
                <span className="text-sm font-medium">This invitation has been cancelled</span>
              </div>
              <p className="text-sm text-red-600 mt-2">
                The invitation to join {organization?.name} has been cancelled by the organization owner.
              </p>
             </div>
           ) : (
             <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
               <div className="flex items-center space-x-2 text-yellow-700">
                 <span className="text-sm font-medium">Invitation no longer valid</span>
               </div>
               <p className="text-sm text-yellow-600 mt-2">
                 This invitation is no longer valid. Please contact the organization owner for a new invitation.
               </p>
             </div>
           )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

           {success && (
             <Alert>
               <CheckCircle className="h-4 w-4" />
               <AlertDescription>{success}</AlertDescription>
             </Alert>
           )}

           {modalError && (
             <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
               {modalError}
             </div>
           )}

            {!success && invitation?.status === 'pending' && (
             <div className="flex gap-3">
                <Button
                  onClick={handleAccept}
                  className="flex-1"
                  loading={isAccepting}
                  disabled={isRejecting}
                >
                  Accept Invitation
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReject}
                  className="flex-1"
                  loading={isRejecting}
                  disabled={isAccepting}
                >
                  Decline
                </Button>
             </div>
            )}

            {invitation?.status !== 'pending' && !success && (
              <div className="text-center">
                <Button onClick={() => router.push('/dashboard')} variant="outline">
                  Back to Dashboard
                </Button>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}