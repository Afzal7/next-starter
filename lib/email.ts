/**
 * Email utilities using Resend
 * Pluggable email system for auth flows
 */

import { Resend } from "resend";
import { env } from "./env";

if (!env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is required but not set");
}

const resend = new Resend(env.RESEND_API_KEY);

/**
 * Email templates for different auth flows
 * From address configured via RESEND_FROM_EMAIL env var
 */
export const EMAIL_TEMPLATES = {
  verification: {
    subject: "Verify your email address",
    from: env.RESEND_FROM_EMAIL,
  },
  invitation: {
    subject: "You've been invited to join an organization",
    from: env.RESEND_FROM_EMAIL,
  },
  passwordReset: {
    subject: "Reset your password",
    from: env.RESEND_FROM_EMAIL,
  },
  trialReminder: {
    subject: "Your trial is ending soon",
    from: env.RESEND_FROM_EMAIL,
  },
} as const;

/**
 * Send email using Resend
 */
export async function sendEmail({
  to,
  subject,
  html,
  from,
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  console.log("[Email] Attempting to send to:", to, "subject:", subject);

  try {
    const result = await resend.emails.send({
      from: from || env.RESEND_FROM_EMAIL,
      to: [to],
      subject,
      html,
    });

    // Check if Resend returned an error
    if (result.error) {
      console.error("[Email] Resend API error:", result.error);
      throw new Error(result.error.message || 'Failed to send email via Resend');
    }

    console.log("[Email] Sent successfully:", result.data?.id);
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("[Email] Failed to send:", error);
    console.error("[Email] Error details:", error);
    throw error instanceof Error ? error : new Error(`Failed to send email: ${error}`);
  }
}

/**
 * Test email sending (for development/debugging)
 */
export async function testEmail(to: string) {
  return sendEmail({
    to,
    subject: "Test Email",
    html: "<h1>Test Email</h1><p>This is a test email from your SaaS app.</p>",
  });
}

/**
 * Generate HTML templates for different email types
 */
export const generateEmailHTML = {
  verification: (data: { verificationUrl: string; userName?: string }) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Verify Your Email</h1>
      <p>Hello${data.userName ? ` ${data.userName}` : ""},</p>
      <p>Please verify your email address by clicking the button below:</p>
      <a href="${
        data.verificationUrl
      }" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
        Verify Email
      </a>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `,

  invitation: (data: {
    organizationName: string;
    inviterName: string;
    acceptUrl: string;
  }) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Organization Invitation</h1>
      <p>Hello,</p>
      <p>${data.inviterName} has invited you to join <strong>${data.organizationName}</strong>.</p>
      <a href="${data.acceptUrl}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
        Accept Invitation
      </a>
      <p>If you don't want to join, you can safely ignore this email.</p>
    </div>
  `,

  passwordReset: (data: { resetUrl: string; userName?: string }) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Reset Your Password</h1>
      <p>Hello${data.userName ? ` ${data.userName}` : ""},</p>
      <p>You requested a password reset. Click the button below to reset your password:</p>
      <a href="${
        data.resetUrl
      }" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
        Reset Password
      </a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `,

  trialReminder: (data: {
    daysLeft: number;
    upgradeUrl: string;
    userName?: string;
  }) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Your Trial is Ending Soon</h1>
      <p>Hello${data.userName ? ` ${data.userName}` : ""},</p>
      <p>Your Pro trial ends in ${data.daysLeft} day${
    data.daysLeft !== 1 ? "s" : ""
  }. Upgrade now to continue using Pro features:</p>
      <a href="${
        data.upgradeUrl
      }" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
        Upgrade to Pro
      </a>
      <p>Don't lose access to your Pro features!</p>
    </div>
  `,
};
