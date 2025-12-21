/**
 * Application constants
 */

export const APP_NAME = "Next Starter";
export const APP_VERSION = "1.0.0";

/**
 * Subscription plan names
 */
export const SUBSCRIPTION_PLANS = {
  FREE: "free",
  PRO: "pro",
} as const;

/**
 * Subscription statuses that grant Pro access
 */
export const PRO_SUBSCRIPTION_STATUSES = ["active", "trialing"] as const;

/**
 * Free trial duration in days
 */
export const FREE_TRIAL_DAYS = 14;

/**
 * Subscription pricing (in cents for Stripe)
 */
export const SUBSCRIPTION_PRICING = {
  PRO_MONTHLY: {
    price: 2900, // $29.00
    interval: 'month',
    name: 'Pro Monthly'
  },
  PRO_ANNUAL: {
    price: 29000, // $290.00
    interval: 'year',
    name: 'Pro Annual'
  }
} as const;

/**
 * Database name
 */
export const DATABASE_NAME = "saas_db";

