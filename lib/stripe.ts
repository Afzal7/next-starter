/**
 * Stripe client initialization with error handling
 */

import Stripe from "stripe";
import { env } from "./env";

if (!env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is required but not set");
}

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-11-17.clover",
  typescript: true,
  maxNetworkRetries: 2, // Retry failed requests twice
  timeout: 20000, // 20 second timeout
});

/**
 * Validates Stripe webhook signature
 */
export async function validateWebhookSignature(
  payload: string | Buffer,
  signature: string
): Promise<boolean> {
  try {
    await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
    return true;
  } catch (error) {
    console.error("[Stripe] Webhook signature validation failed:", error);
    return false;
  }
}
