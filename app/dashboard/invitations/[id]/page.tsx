'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useInvitation, useAcceptInvitation, useRejectInvitation } from '@/hooks/use-user-invitations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, CheckCircle } from 'lucide-react';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { ErrorState } from '@/components/shared/error-state';



export default function AcceptInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const invitationId = params.id as string;

  // Use new TanStack Query hooks
  const { data: invitation, isLoading, error } = useInvitation(invitationId);
  const acceptInvitationMutation = useAcceptInvitation();
  const rejectInvitationMutation = useRejectInvitation();

  // Local UI state
  const [modalError, setModalError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAccept = () => {
    if (!invitation) return;

    setModalError('');
    acceptInvitationMutation.mutate(
      { invitationId },
      {
        onSuccess: () => {
          setSuccess('Invitation accepted successfully! Redirecting...');
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        },
        onError: (error) => {
          console.error('Failed to accept invitation:', error);
          setModalError(error.message || 'Failed to accept invitation. Please try again.');
        },
      }
    );
  };

  const handleReject = () => {
    if (!invitation) return;

    setModalError('');
    rejectInvitationMutation.mutate(
      { invitationId },
      {
        onSuccess: () => {
          setSuccess('Invitation rejected.');
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        },
        onError: (error) => {
          console.error('Failed to reject invitation:', error);
          setModalError(error.message || 'Failed to reject invitation. Please try again.');
        },
      }
    );
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
            message={error?.message}
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
              You&apos;ve been invited to join an organization
            </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {invitation && invitation.status === 'pending' ? (
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Organization</span>
                <span className="text-sm text-muted-foreground">Organization</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Your Role</span>
                <span className="text-sm text-muted-foreground capitalize">{invitation.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Invited By</span>
                <span className="text-sm text-muted-foreground">Organization Admin</span>
              </div>
            </div>
          ) : invitation?.status === 'canceled' ? (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-center space-x-2 text-red-700">
                <span className="text-sm font-medium">This invitation has been cancelled</span>
              </div>
              <p className="text-sm text-red-600 mt-2">
                The invitation has been cancelled by the organization owner.
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
              <AlertDescription>{error?.message}</AlertDescription>
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
                  disabled={acceptInvitationMutation.isPending || rejectInvitationMutation.isPending}
                >
                  Accept Invitation
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReject}
                  className="flex-1"
                  disabled={acceptInvitationMutation.isPending || rejectInvitationMutation.isPending}
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