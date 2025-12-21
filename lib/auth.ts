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
import { sendEmail, generateEmailHTML, EMAIL_TEMPLATES } from "./email";

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
    // requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }) => {
      console.log(
        "sendResetPassword called for user:",
        user.email,
        "url:",
        url,
        "token:",
        token
      );

      // Construct the correct reset URL pointing to our frontend page
      const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

      try {
        const html = generateEmailHTML.passwordReset({
          resetUrl,
          userName: user.name,
        });

        console.log(
          "Generated HTML for password reset, sending to:",
          user.email
        );

        const result = await sendEmail({
          to: user.email,
          subject: EMAIL_TEMPLATES.passwordReset.subject,
          html,
          from: EMAIL_TEMPLATES.passwordReset.from,
        });

        console.log(
          "Password reset email sent successfully to:",
          user.email,
          "result:",
          result
        );
      } catch (error) {
        console.error("Failed to send password reset email:", error);
        throw error;
      }
    },
  },

  ...(Object.keys(socialProviders).length > 0 && {
    socialProviders,
  }),

  plugins: [
    // Organization plugin (optional feature)
    organization({
      allowUserToCreateOrganization: true,
      cancelPendingInvitationsOnReInvite: true,
      // DO NOT auto-create - organizations are optional
      createOnSignUp: { enabled: false },
      async sendInvitationEmail(data) {
        try {
          const acceptUrl = `${env.NEXT_PUBLIC_APP_URL}/dashboard/invitations/${data.id}`;
          const html = generateEmailHTML.invitation({
            organizationName: data.organization.name,
            inviterName: data.inviter.user.name || data.inviter.user.email,
            acceptUrl,
          });

          await sendEmail({
            to: data.email,
            subject: EMAIL_TEMPLATES.invitation.subject,
            html,
            from: EMAIL_TEMPLATES.invitation.from,
          });

          console.log("Invitation email sent to:", data.email);
        } catch (error) {
          console.error("Failed to send invitation email:", error);
          throw error;
        }
      },
    }),

    // Stripe plugin
    stripePlugin({
      stripeClient: stripe,
      stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
      createCustomerOnSignUp: true,

      subscription: {
        enabled: true,
        requireEmailVerification: false,

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
