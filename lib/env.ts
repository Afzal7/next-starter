/**
 * Environment variable validation and type-safe access
 * Validates required environment variables at startup
 */

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. Please check your .env file.`
    );
  }

  return value;
}

function getOptionalEnvVar(key: string): string | undefined {
  return process.env[key];
}

export const env = {
  // MongoDB
  MONGODB_URI: getEnvVar("MONGODB_URI"),

  // Better Auth
  BETTER_AUTH_SECRET: getEnvVar("BETTER_AUTH_SECRET"),
  NEXT_PUBLIC_APP_URL: getEnvVar("NEXT_PUBLIC_APP_URL"),

  // Google OAuth (optional)
  GOOGLE_CLIENT_ID: getOptionalEnvVar("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: getOptionalEnvVar("GOOGLE_CLIENT_SECRET"),

  // Stripe
  STRIPE_SECRET_KEY: getEnvVar("STRIPE_SECRET_KEY"),
  STRIPE_WEBHOOK_SECRET: getEnvVar("STRIPE_WEBHOOK_SECRET"),
  STRIPE_PRO_MONTHLY_PRICE_ID: getEnvVar("STRIPE_PRO_MONTHLY_PRICE_ID"),
  STRIPE_PRO_ANNUAL_PRICE_ID: getOptionalEnvVar("STRIPE_PRO_ANNUAL_PRICE_ID"),

  // Resend (Email)
  RESEND_API_KEY: getEnvVar("RESEND_API_KEY"),
  RESEND_FROM_EMAIL: getOptionalEnvVar("RESEND_FROM_EMAIL") || "onboarding@resend.dev",

  // Node environment
  NODE_ENV: process.env.NODE_ENV || "development",
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
} as const;

// Validate MongoDB URI format
if (!env.MONGODB_URI.startsWith("mongodb://") && !env.MONGODB_URI.startsWith("mongodb+srv://")) {
  throw new Error(
    "Invalid MONGODB_URI format. Must start with 'mongodb://' or 'mongodb+srv://'"
  );
}

// Validate BETTER_AUTH_SECRET length
if (env.BETTER_AUTH_SECRET.length < 32) {
  throw new Error(
    "BETTER_AUTH_SECRET must be at least 32 characters long for security"
  );
}

// Validate NEXT_PUBLIC_APP_URL format
try {
  new URL(env.NEXT_PUBLIC_APP_URL);
} catch {
  throw new Error("NEXT_PUBLIC_APP_URL must be a valid URL");
}

// Validate Stripe key format
if (!env.STRIPE_SECRET_KEY.startsWith("sk_")) {
  throw new Error(
    "Invalid STRIPE_SECRET_KEY format. Must start with 'sk_'"
  );
}

// Validate Stripe webhook secret format
if (!env.STRIPE_WEBHOOK_SECRET.startsWith("whsec_")) {
  throw new Error(
    "Invalid STRIPE_WEBHOOK_SECRET format. Must start with 'whsec_'"
  );
}

// Validate Stripe price ID format
if (!env.STRIPE_PRO_MONTHLY_PRICE_ID.startsWith("price_")) {
  throw new Error(
    "Invalid STRIPE_PRO_MONTHLY_PRICE_ID format. Must start with 'price_'"
  );
}

if (env.STRIPE_PRO_ANNUAL_PRICE_ID && !env.STRIPE_PRO_ANNUAL_PRICE_ID.startsWith("price_")) {
  throw new Error(
    "Invalid STRIPE_PRO_ANNUAL_PRICE_ID format. Must start with 'price_'"
  );
}

