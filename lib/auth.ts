/**
 * Better Auth configuration with conditional providers
 * Only enables features when required environment variables are present
 */

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { stripe as stripePlugin } from "@better-auth/stripe";
import { organization } from "better-auth/plugins/organization";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";
import { stripe } from "./stripe";
import { env } from "./env";

// Build social providers conditionally
const socialProviders: Record<
  string,
  { clientId: string; clientSecret: string }
> = {};

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
  };
}

export const auth = betterAuth({
  database: mongodbAdapter(db),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  ...(Object.keys(socialProviders).length > 0 && {
    socialProviders,
  }),

  plugins: [
    // Organization plugin (optional feature)
    organization({
      allowUserToCreateOrganization: true,
      // DO NOT auto-create - organizations are optional
      createOnSignUp: { enabled: false },
    }),

    // Stripe plugin
    stripePlugin({
      stripeClient: stripe,
      stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
      createCustomerOnSignUp: true,

      subscription: {
        enabled: true,
        requireEmailVerification: true,

        plans: [
          {
            name: "pro",
            priceId: env.STRIPE_PRO_MONTHLY_PRICE_ID,
            annualDiscountPriceId: env.STRIPE_PRO_ANNUAL_PRICE_ID || undefined,
            freeTrial: { days: 14 },
          },
        ],
      },
    }),

    // Next.js cookies plugin - automatically sets cookies in server actions
    // Must be the last plugin in the array
    nextCookies(),
  ],

  secret: env.BETTER_AUTH_SECRET,
});
