'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function WelcomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!session?.user) {
      router.push('/login');
      return;
    }

    // Auto-advance to onboarding after 2 seconds
    const timer = setTimeout(() => {
      setStep(1);
    }, 2000);

    return () => clearTimeout(timer);
  }, [session, router]);

  const handleStartOnboarding = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      router.push('/onboarding');
    }, 500);
  };

  if (step === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to our platform!
              </h1>
              <p className="text-gray-600">
                Creating your workspace...
              </p>
            </div>
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <CardTitle className="text-2xl">Account Created Successfully!</CardTitle>
          <CardDescription>
            Welcome {session?.user?.name || 'there'}! Let&apos;s get you set up.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-sm">Account created</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
              </div>
              <span className="text-sm">Setting up your workspace</span>
            </div>
             <div className="flex items-center space-x-3 opacity-50">
               <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                 <span className="text-xs font-medium text-gray-600">3</span>
               </div>
               <span className="text-sm">Complete your setup</span>
             </div>
          </div>

          <Button onClick={handleStartOnboarding} className="w-full" size="lg">
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}