/**
 * Subscription API route
 * Returns the current user's subscription status
 * Uses Better Auth's built-in stripe plugin API
 */

import { auth } from "@/lib/auth";
import { createErrorResponse, logError, UnauthorizedError } from "@/lib/errors";
import type { SubscriptionResponse } from "@/lib/types";
import { PRO_SUBSCRIPTION_STATUSES } from "@/lib/constants";
import { headers } from "next/headers";

export async function GET(): Promise<Response> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session) {
      throw new UnauthorizedError(
        "You must be authenticated to view subscription status"
      );
    }

    // Use Better Auth's built-in stripe plugin API
    const subscriptions = await auth.api.listActiveSubscriptions({
      query: { referenceId: session.user.id },
      headers: headersList,
    });

    // Get the first active subscription (or null if none)
    const subscription = subscriptions.length > 0 ? subscriptions[0] : null;

    const response: SubscriptionResponse = {
      subscription,
      isPro:
        subscription && subscription.status
          ? PRO_SUBSCRIPTION_STATUSES.includes(
              subscription.status as (typeof PRO_SUBSCRIPTION_STATUSES)[number]
            )
          : false,
    };

    return Response.json(response);
  } catch (error) {
    logError(error, {
      endpoint: "/api/subscription",
      method: "GET",
    });

    return createErrorResponse(error, process.env.NODE_ENV === "development");
  }
}
