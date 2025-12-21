/**
 * Client-side Better Auth configuration
 * Validates environment variables and exports auth methods
 */

import { createAuthClient } from "better-auth/react";
import { stripeClient } from "@better-auth/stripe/client";
import { organizationClient } from "better-auth/client/plugins";

const baseURL = process.env.NEXT_PUBLIC_APP_URL;

if (!baseURL) {
  throw new Error(
    "NEXT_PUBLIC_APP_URL is required but not set. Please check your environment variables."
  );
}

export const authClient = createAuthClient({
  baseURL,
  plugins: [
    stripeClient({
      subscription: true, // Enable subscription methods
    }),
    organizationClient(),
  ],
  // You can pass client configuration here
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  subscription,
  organization: orgClient,
} = authClient;
