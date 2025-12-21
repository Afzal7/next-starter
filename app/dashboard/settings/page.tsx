"use client";


import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangleIcon, CheckIcon, TrendingUpIcon } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";
import {
  useCancelSubscription,
  useUpgradeSubscription,
} from "@/hooks/use-subscription-mutations";
import { SUBSCRIPTION_PRICING } from "@/lib/constants";

function SettingsPageContent() {
  const searchParams = useSearchParams();
  // Use TanStack Query hooks
  const { data: subscriptionData, isLoading } = useSubscription();
  const cancelSubscriptionMutation = useCancelSubscription();
  const upgradeSubscriptionMutation = useUpgradeSubscription();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [hasProcessedSuccess, setHasProcessedSuccess] = useState(false);
  const [showRetentionModal, setShowRetentionModal] = useState(false);
  const [showSaveOffer, setShowSaveOffer] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showAnnualSuccess, setShowAnnualSuccess] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [offerType, setOfferType] = useState<"discount" | "pause" | null>(null);

  useEffect(() => {
    // Check for annual upgrade success
    const success = searchParams.get("success");
    if (success === "annual" && !hasProcessedSuccess) {
      setHasProcessedSuccess(true);
      setShowAnnualSuccess(true);
      // Remove the parameter from URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("success");
      window.history.replaceState({}, "", newUrl.toString());
      // Hide alert after 5 seconds
      setTimeout(() => {
        setShowAnnualSuccess(false);
        setHasProcessedSuccess(false); // Reset for future uses
      }, 5000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Only depend on searchParams to avoid cascading renders

  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleRetentionSubmit = () => {
    // Determine save offer based on reason
    if (cancelReason === "expensive") {
      setOfferType("discount");
      setShowRetentionModal(false);
      setShowSaveOffer(true);
    } else if (cancelReason === "not-using") {
      setOfferType("pause");
      setShowRetentionModal(false);
      setShowSaveOffer(true);
    } else {
      // For other reasons, proceed to confirmation
      setShowRetentionModal(false);
      setShowConfirmation(true);
    }
  };

  const handleAcceptOffer = () => {
    // TODO: Implement offer acceptance
    alert("Offer accepted! (This would update subscription)");
    setShowSaveOffer(false);
  };

  const handleProceedCancel = async () => {
    try {
      // Redirect to Stripe Billing Portal for cancellation
      cancelSubscriptionMutation.mutate({
        returnUrl: window.location.href,
      });
      // User will be redirected to Stripe Billing Portal
    } catch (error) {
      console.error("Cancellation failed:", error);
      alert("Failed to initiate cancellation. Please try again.");
    }
  };

  const handleUpgradeToAnnual = async () => {
    try {
      upgradeSubscriptionMutation.mutate({
        plan: "pro",
        annual: true,
        successUrl: `${window.location.origin}/dashboard/settings?success=annual`,
        cancelUrl: window.location.href,
      });
    } catch (error) {
      console.error("Annual upgrade failed:", error);
      alert("Failed to upgrade to annual plan. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const isPro =
    subscriptionData?.subscription?.status === "active" ||
    subscriptionData?.subscription?.status === "trialing";
  const isTrialing = subscriptionData?.subscription?.status === "trialing";
  const trialEnd = subscriptionData?.subscription?.periodEnd
    ? new Date(subscriptionData.subscription.periodEnd)
    : null;

  return (
    <div className="space-y-6">
      {/* Annual Upgrade Success Alert */}
      {showAnnualSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckIcon className="h-5 w-5 text-green-600" />
            <div>
              <h4 className="font-semibold text-green-900">
                ✓ Switched to annual billing
              </h4>
              <p className="text-green-800 text-sm">
                You&apos;re now on the Pro Annual plan. You&apos;re saving
                $58/year!
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and subscription
        </p>
      </div>

      {/* Subscription Management */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">Current Plan:</span>
                <Badge variant={isPro ? "default" : "secondary"}>
                  {isPro ? (isTrialing ? "Pro Trial" : "Pro Monthly") : "Free"}
                </Badge>
              </div>
              {isTrialing && trialEnd && (
                <p className="text-sm text-muted-foreground">
                  Trial ends on {trialEnd.toLocaleDateString()}
                </p>
              )}
              {isPro && !isTrialing && (
                <p className="text-sm text-muted-foreground">
                  Next billing: {trialEnd?.toLocaleDateString()}
                </p>
              )}
            </div>
            {isPro && (
              <Button variant="destructive" onClick={handleCancelClick}>
                Cancel Subscription
              </Button>
            )}
          </div>

          {/* Annual Upgrade Suggestion */}
          {isPro && !isTrialing && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <TrendingUpIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900">
                    💡 Save $58/year with annual billing
                  </h4>
                  <p className="text-blue-700 text-sm mt-1">
                    Switch to annual and pay $
                    {SUBSCRIPTION_PRICING.PRO_ANNUAL.price / 100}/year instead
                    of ${SUBSCRIPTION_PRICING.PRO_MONTHLY.price / 100}/month.
                  </p>
                  <Button
                    onClick={handleUpgradeToAnnual}
                    className="mt-3"
                    size="sm"
                  >
                    Switch to Annual ($
                    {SUBSCRIPTION_PRICING.PRO_ANNUAL.price / 100}/year)
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Cancellation</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription? You&apos;ll be
              redirected to Stripe&apos;s secure billing portal to complete the
              cancellation.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
            >
              Keep Subscription
            </Button>
            <Button variant="destructive" onClick={handleProceedCancel}>
              Continue to Billing Portal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Retention Modal */}
      <Dialog open={showRetentionModal} onOpenChange={setShowRetentionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>We&apos;re sorry to see you go</DialogTitle>
            <DialogDescription>
              Mind sharing why? (optional, but helps us improve)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <RadioGroup value={cancelReason} onValueChange={setCancelReason}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expensive" id="expensive-retention" />
                <Label htmlFor="expensive-retention">Too expensive</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not-using" id="not-using-retention" />
                <Label htmlFor="not-using-retention">Not using it enough</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="missing-features"
                  id="missing-features-retention"
                />
                <Label htmlFor="missing-features-retention">
                  Missing features
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other-retention" />
                <Label htmlFor="other-retention">Other</Label>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button onClick={handleRetentionSubmit}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Offer Modal */}
      <Dialog open={showSaveOffer} onOpenChange={setShowSaveOffer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Before you go... we can work something out
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {offerType === "discount" && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900">
                  50% off for 3 months
                </h4>
                <p className="text-blue-700">
                  Keep your Pro features at half price for the next 3 billing
                  cycles.
                </p>
              </div>
            )}
            {offerType === "pause" && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900">
                  Pause for 3 months
                </h4>
                <p className="text-green-700">
                  Keep all your data and features, but pause billing for 3
                  months. Perfect if you&apos;re taking a break.
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleAcceptOffer} className="flex-1">
                {offerType === "discount"
                  ? "Accept 50% Off"
                  : "Accept Pause Offer"}
              </Button>
              <Button variant="outline" onClick={handleProceedCancel}>
                No thanks, cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancellation Confirmation */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckIcon className="h-5 w-5 text-green-600" />
              Cancellation Confirmed
            </DialogTitle>
            <DialogDescription>
              Your subscription has been canceled. You can continue using Pro
              features until {trialEnd?.toLocaleDateString()}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-900">
                    What happens next?
                  </h4>
                  <ul className="text-yellow-800 text-sm mt-2 space-y-1">
                    <li>• You won&apos;t be charged</li>
                    <li>• Access continues until trial end</li>
                    <li>• Data is preserved for 30 days</li>
                    <li>• Reactivate anytime before expiration</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowConfirmation(false)}>
              Back to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SettingsPageContent />
    </Suspense>
  );
}
