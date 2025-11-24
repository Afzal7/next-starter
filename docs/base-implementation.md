# Better Auth + Stripe + MongoDB - Implementation Handoff (Revised)

## Overview

Build a Next.js SaaS starter with authentication and payment processing. Organizations are **optional** - users can use the app individually or create teams later.

**Subscription Model**: Free → Pro (with 14-day trial)

---

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Auth**: Better Auth
- **Database**: MongoDB
- **Payments**: Stripe (via Better Auth plugin)
- **Organizations**: Optional (Better Auth plugin)

---

## Installation

```bash
npm install better-auth mongodb stripe
```

---

## Environment Variables

```bash
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/saas_db

# Better Auth
BETTER_AUTH_SECRET=generate-random-32-char-string
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_ANNUAL_PRICE_ID=price_... # optional
```

---

## Core Files

```
/lib
  /db.ts                   # MongoDB client (3 lines)
  /stripe.ts               # Stripe client (3 lines)
  /auth.ts                 # Better Auth config (main file, ~40 lines)
  /auth-client.ts          # Client auth (5 lines)
/app/api/auth/[...all]/route.ts  # Auth API (1 line)
/middleware.ts             # Auth middleware (1 line)
```

**Total core implementation: ~53 lines of code**

---

## Implementation

### 1. Database Client

```typescript
// /lib/db.ts
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);
export const db = client.db("saas_db");
```

### 2. Stripe Client

```typescript
// /lib/stripe.ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});
```

### 3. Better Auth Configuration

```typescript
// /lib/auth.ts
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { stripe as stripePlugin } from "better-auth/plugins/stripe";
import { organization } from "better-auth/plugins/organization";
import { db } from "./db";
import { stripe } from "./stripe";

export const auth = betterAuth({
  database: mongodbAdapter(db),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

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
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      createCustomerOnSignUp: true,

      subscription: {
        enabled: true,
        requireEmailVerification: true,

        plans: [
          {
            name: "pro",
            priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
            annualDiscountPriceId: process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
            freeTrial: { days: 14 },
          },
        ],
      },
    }),
  ],

  secret: process.env.BETTER_AUTH_SECRET!,
});
```

### 4. Auth API Route

```typescript
// /app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";

export const { GET, POST } = auth.handler;
```

### 5. Client-Side Auth

```typescript
// /lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
import { stripeClient } from "better-auth/client/plugins";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [stripeClient(), organizationClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
export const { subscription } = authClient.stripe;
export const { organization: orgClient } = authClient;
```

### 6. Middleware

```typescript
// /middleware.ts
import { auth } from "@/lib/auth";

export default auth.middleware();

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
};
```

### 7. Stripe Webhook Setup

1. Stripe Dashboard → Webhooks → Add endpoint: `https://yourdomain.com/api/auth`
2. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
3. Copy webhook secret → `STRIPE_WEBHOOK_SECRET`

**Done. Better Auth handles all webhook processing automatically.**

---

## User Flows

### Flow 1: User Signs Up (Free Tier)

```typescript
// Any signup component
await signUp.email({ email, password, name });
// User is now on FREE tier
// Better Auth: Creates user + Stripe customer
// NO organization created (it's optional)
```

**User State**: Free tier, no subscription, no organization

### Flow 2: User Upgrades to Pro (14-Day Trial)

```typescript
"use client";
import { subscription, useSession } from "@/lib/auth-client";

export function UpgradeButton() {
  const { data: session } = useSession();

  return (
    <button
      onClick={async () => {
        await subscription.upgrade({
          plan: "pro",
          referenceId: session!.user.id,
          successUrl: "/dashboard",
          cancelUrl: "/pricing",
        });
      }}
    >
      Start Free Trial
    </button>
  );
}
```

**Better Auth automatically**:

- Creates checkout session
- Starts 14-day trial (no charge)
- Redirects to Stripe
- Processes webhook
- Updates subscription status to `trialing`

**User State**: Pro tier (trialing), 14 days to cancel

### Flow 3: Trial Converts to Paid

**Automatic** - After 14 days, Better Auth + Stripe:

- Charges the user automatically
- Updates subscription status to `active`
- Processes webhook

**User State**: Pro tier (active, paying)

### Flow 4: User Creates Organization (Optional)

```typescript
"use client";
import { orgClient } from "@/lib/auth-client";

export function CreateOrgButton() {
  return (
    <button
      onClick={async () => {
        await orgClient.create({
          name: "My Team",
          slug: "my-team",
        });
      }}
    >
      Create Team
    </button>
  );
}
```

**Better Auth**:

- Creates organization
- Makes user the owner
- User can now invite members

**User State**: Still individual Pro subscription OR can upgrade org separately

---

## Feature Gating

### Check User Subscription (Server)

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Dashboard() {
  const session = await auth.api.getSession({ headers: await headers() });

  const subscription = await auth.api.stripe.getSubscription({
    referenceId: session!.user.id,
  });

  const isPro = ["active", "trialing"].includes(subscription?.status || "");

  return <div>{isPro ? <ProFeatures /> : <FreeFeatures />}</div>;
}
```

### Check User Subscription (Client)

```typescript
"use client";
import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";

export function FeatureGate({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    if (session) {
      fetch(`/api/subscription`)
        .then((res) => res.json())
        .then((sub) => setIsPro(["active", "trialing"].includes(sub?.status)));
    }
  }, [session]);

  if (!isPro) {
    return <UpgradePrompt />;
  }

  return <>{children}</>;
}
```

### Simple API Route for Subscription Check

```typescript
// /app/api/subscription/route.ts
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const subscription = await auth.api.stripe.getSubscription({
    referenceId: session.user.id,
  });

  return Response.json(subscription);
}
```

---

## Subscription States

| State        | Stripe Status         | User Access        | Description                 |
| ------------ | --------------------- | ------------------ | --------------------------- |
| **Free**     | `null` or `undefined` | Free features only | Default after signup        |
| **Trial**    | `trialing`            | All Pro features   | 14-day trial, no charge yet |
| **Pro**      | `active`              | All Pro features   | Paying customer             |
| **Canceled** | `canceled`            | Free features only | Subscription ended          |
| **Past Due** | `past_due`            | Grace period       | Payment failed, retry       |

---

## Feature Matrix

| Feature              | Free | Pro |
| -------------------- | ---- | --- |
| Basic functionality  | ✅   | ✅  |
| Limited usage        | ✅   | ✅  |
| Advanced features    | ❌   | ✅  |
| Priority support     | ❌   | ✅  |
| Create organizations | ✅   | ✅  |
| Custom branding      | ❌   | ✅  |

**Implementation**: Check subscription status in components/pages to gate features.

---

## What Better Auth Handles (No Code Needed)

✅ User signup/signin  
✅ Email verification  
✅ Session management  
✅ Password reset  
✅ OAuth (Google)  
✅ Stripe customer creation  
✅ Checkout session creation  
✅ Webhook processing  
✅ Subscription status updates  
✅ Trial tracking  
✅ Trial abuse prevention (one trial per user)  
✅ Auth middleware  
✅ Organization CRUD  
✅ Member invitations  
✅ Role-based permissions

---

## What You Build

1. **UI Components** (~200-300 lines total)

   - Login/signup forms
   - Pricing page
   - Dashboard showing subscription status
   - Upgrade button
   - Feature gates/paywalls

2. **Feature Implementation** (varies)

   - Free tier features
   - Pro tier features
   - Business logic for your app

3. **Optional: Organization UI** (if using teams)
   - Create organization button
   - Member management UI
   - Organization switcher

**That's it. Everything else is handled by Better Auth.**

---

## Simplified Testing Checklist

### Authentication

- [ ] User can sign up
- [ ] User receives verification email
- [ ] User can sign in
- [ ] User starts on Free tier

### Subscriptions

- [ ] User can click "Upgrade to Pro"
- [ ] Stripe Checkout opens
- [ ] After payment, 14-day trial starts
- [ ] User has access to Pro features
- [ ] After 14 days, user is charged
- [ ] Subscription status shows correctly
- [ ] User cannot get second trial

### Feature Gating

- [ ] Free users see limited features
- [ ] Pro users (trialing or active) see all features
- [ ] Canceled users revert to free features

### Organizations (Optional)

- [ ] User can create organization (as free or pro user)
- [ ] User can invite members
- [ ] Members can join organization

---

## Critical Insights

### What I Removed from Original Doc

❌ **Seat limit hook** - Not needed for simple free/pro model  
❌ **Team/Enterprise plans** - Overcomplicating; start with pro  
❌ **Auto-organization creation** - Organizations should be optional  
❌ **Complex authorization logic** - Better Auth handles it  
❌ **Custom webhook handlers** - Better Auth does this  
❌ **Custom API routes for subscriptions** - Use Better Auth APIs  
❌ **Manual subscription queries** - Better Auth provides helpers

### What Actually Matters

✅ **One subscription plan**: Pro (with trial)  
✅ **Two states**: Free (no subscription) vs Pro (trialing/active)  
✅ **Organizations are optional**: Users decide if they want teams  
✅ **53 lines of setup code**: Everything else is Better Auth  
✅ **Focus on your features**: Not reinventing auth/billing

---

## Production Checklist

- [ ] Update all environment variables with production values
- [ ] Configure Stripe webhook with production URL
- [ ] Set up email provider (Resend recommended)
- [ ] Test checkout flow end-to-end
- [ ] Test trial→paid conversion
- [ ] Verify webhook delivery
- [ ] Test feature gating
- [ ] Add error boundaries and loading states

---

## Actual Code You Write

**Setup (once)**: 53 lines  
**UI Components**: ~300 lines  
**Feature logic**: Your app

**Better Auth handles**: ~10,000 lines of auth/billing/org logic you don't write.

---

## Final Note

If you find yourself writing:

- Custom middleware for auth checks
- Manual Stripe API calls
- Custom webhook handlers
- Manual subscription queries
- Custom organization authorization

**Stop. Better Auth already does this.**

Just configure it, use the built-in methods, and focus on building your actual product features.
