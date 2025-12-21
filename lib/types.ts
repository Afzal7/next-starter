/**
 * Type definitions for the application
 */



/**
 * Subscription status types
 */
export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | null
  | undefined;

/**
 * User subscription information
 */
export interface UserSubscription {
  id: string;
  status: SubscriptionStatus;
  plan: "free" | "pro";
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  trialEnd: Date | null;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Subscription type from Better Auth stripe plugin
 * Based on listActiveSubscriptions return type
 */
export interface Subscription {
  limits: Record<string, unknown> | undefined;
  priceId: string | undefined;
  id: string;
  plan: string;
  stripeCustomerId?: string | undefined;
  stripeSubscriptionId?: string | undefined;
  trialStart?: Date | undefined;
  trialEnd?: Date | undefined;
  referenceId: string;
  status:
    | "active"
    | "canceled"
    | "incomplete"
    | "incomplete_expired"
    | "past_due"
    | "paused"
    | "trialing"
    | "unpaid";
  periodStart?: Date | undefined;
  periodEnd?: Date | undefined;
  cancelAtPeriodEnd?: boolean | undefined;
  groupId?: string | undefined;
  seats?: number | undefined;
}

/**
 * Subscription API response
 */
export interface SubscriptionResponse {
  subscription: Subscription | null;
  isPro: boolean;
}
