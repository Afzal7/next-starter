"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Optional: Track 404 errors for analytics
    console.log("404 - Page not found:", window.location.pathname);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 size-20 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-2xl font-bold text-red-600">404</span>
          </div>
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
          <CardDescription>
            {"The page you're looking for doesn't exist or has been moved."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="grow"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={() => router.push("/")} className="grow">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </div>
          <div className="text-sm text-muted-foreground text-center">
            If you believe this is an error, please contact support.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
