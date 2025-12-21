'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

const steps = [
  {
    title: "Welcome to your workspace",
    description: "Let&apos;s set up your first project to get you started.",
    content: (
      <div className="text-center space-y-4">
        <Sparkles className="h-12 w-12 text-blue-600 mx-auto" />
        <p className="text-gray-600">
          We&apos;ll guide you through creating your first project in just a few steps.
        </p>
      </div>
    ),
  },
  {
    title: "Create your first project",
    description: "Give your project a name and description.",
    content: (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="project-name">Project Name</Label>
          <Input
            id="project-name"
            placeholder="My Awesome Project"
            defaultValue="My First Project"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="project-description">Description (optional)</Label>
          <Textarea
            id="project-description"
            placeholder="Describe what this project is about..."
            rows={3}
          />
        </div>
      </div>
    ),
  },
  {
    title: "You're all set!",
    description: "Your workspace is ready to go.",
    content: (
      <div className="text-center space-y-4">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
        <p className="text-gray-600">
          Congratulations! You&apos;ve successfully set up your workspace.
          You can now start using all the features.
        </p>
      </div>
    ),
  },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    // TODO: Save project data
    await new Promise(resolve => setTimeout(resolve, 1000));
    router.push('/dashboard');
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <CardTitle className="text-2xl">{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {steps[currentStep].content}
          </motion.div>

          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <Button onClick={handleNext} loading={isCompleting}>
              {currentStep === steps.length - 1 ? (
                'Complete Setup'
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}