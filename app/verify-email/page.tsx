'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import { ErrorState } from '@/components/shared/error-state';
import { authClient } from '@/lib/auth-client';

function EmailVerificationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(() => {
    if (!token) return 'error';
    return 'loading';
  });
  const [message, setMessage] = useState(() => {
    if (!token) return 'Invalid verification link. Please check your email for the correct link.';
    return '';
  });

  useEffect(() => {
    if (!token) return;

    const verifyEmail = async () => {
      try {
        // Use Better Auth email verification
        await authClient.verifyEmail({
          query: { token: token! }
        });
        setStatus('success');
        setMessage('Email verified successfully! Redirecting to dashboard...');

        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } catch {
        setStatus('error');
        setMessage('Verification failed. The link may be expired or invalid.');
      }
    };

    verifyEmail();
  }, [token, router]);



  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-semibold mb-2">Verifying your email...</h2>
            <p className="text-muted-foreground">Please wait while we verify your email address.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <ErrorState
            message={message}
            type="page"
          />
          <div className="text-center">
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <CardTitle className="text-2xl text-green-600">Email Verified!</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={() => router.push('/dashboard')} className="w-full">
            Continue to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function EmailVerificationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <EmailVerificationContent />
    </Suspense>
  );
}