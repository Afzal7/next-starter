"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/use-subscription";

export function SubscriptionStatus() {
  const router = useRouter();
  const { data: subscriptionData, isLoading: loading } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-5 w-12 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  // Check if user has active Pro subscription (active or trialing)
  const hasActiveProSubscription = subscriptionData?.subscription?.status === 'active' ||
                                   subscriptionData?.subscription?.status === 'trialing';

  // Pro user - premium badge
  if (hasActiveProSubscription) {
    return (
      <Badge
        variant="default"
        className="text-sm bg-slate-900 text-white border-0 font-medium"
      >
        Pro
      </Badge>
    );
  }

  // Free user - show badge with upgrade button
  return (
    <div className="flex items-center gap-2">
      <Badge
        variant="outline"
        className="text-sm border-slate-200 text-slate-600"
      >
        Free
      </Badge>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-sm text-slate-500 hover:text-slate-700"
        onClick={() => router.push('/dashboard/upgrade')}
      >
        Upgrade
      </Button>
    </div>
  );

  // TODO: Trial-specific logic for future implementation
  /*
  const isTrialing = subscriptionData?.subscription?.status === "trialing";
  const trialEnd = subscriptionData?.subscription?.periodEnd
    ? new Date(subscriptionData.subscription.periodEnd)
    : null;
  const daysLeft = trialEnd
    ? Math.ceil((trialEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const isExpired = subscriptionData?.subscription?.status === "canceled" &&
    trialEnd && trialEnd < new Date();

  if (isExpired) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          Free
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => router.push("/dashboard/upgrade")}
        >
          Upgrade
        </Button>
      </div>
    );
  }

  if (isPro && !isTrialing) {
    return (
      <Badge variant="default" className="text-xs bg-gradient-to-r from-blue-600 to-purple-600">
        Pro
      </Badge>
    );
  }

  if (isTrialing && trialEnd) {
    const isUrgent = daysLeft <= 3;
    return (
      <div className="flex items-center gap-2">
        <Badge
          variant={isUrgent ? "destructive" : "secondary"}
          className="text-xs"
        >
          Trial {isUrgent ? `• ${daysLeft}d` : ""}
        </Badge>
        {isUrgent && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => router.push("/dashboard/upgrade")}
          >
            Upgrade
          </Button>
        )}
      </div>
    );
  }
  */
}
