# Updated User Journeys - SaaS Starter App (Psychology-Optimized)

---

## Journey 1: Signup with Soft Verification (Revised)

### Trigger

User visits app for first time, clicks "Get Started"

### Flow

**Screen 1: Sign Up Form**

- Email input
- Password input
- Name input
- "Get Started Free" button (not "Sign Up")
- "Continue with Google" button
- Social proof: "Join 10,000+ users"

**User Action**: Enter email/password and click "Get Started Free"

**System**:

- Validates input
- Creates user account
- Creates Stripe customer
- Sends verification email in background
- Redirects to welcome screen

---

**Screen 2: Welcome Screen (2 seconds)**

- Shows: "Creating your workspace..."
- Progress bar animation
- **Psychology**: Builds anticipation

---

**Screen 3: Interactive Onboarding**

- Shows: "Let's set up your first project"
- 3-step guided wizard (60 seconds)
- User creates first project/item immediately
- Each step has progress indicator
- **Psychology**: Immediate value + micro-commitment

---

**Screen 4: Dashboard (Free Tier with Soft Verification)**

- Yellow banner (top, dismissible): "📧 Verify your email to unlock Pro upgrade"
- "Resend verification" button in banner
- Shows: "Welcome [name]! You're on the Free plan"
- Shows: Working free features (immediately accessible)
- Shows: Pro features with "🔒 Verify email to upgrade" badges
- Shows: Feature comparison section
- Shows: "Upgrade to Pro" button (prominent but not blocking)

**User State**:

- Can use free features immediately (no blocking)
- Email unverified (but functional)
- Sees value before commitment
- Motivated to verify for upgrade access

---

**Email Reminder (10 minutes if not verified)**

- Subject: "One more step to unlock Pro features"
- Body: "You're missing out on [specific features]"
- One-click verify button
- **Psychology**: Loss framing

---

## Journey 2: Signup with Google OAuth

### Trigger

User clicks "Continue with Google"

### Flow

**Screen 1: Sign Up Form**

- User clicks "Continue with Google"

**User Action**: Authenticate with Google

**System**:

- Creates user with Google email
- Creates Stripe customer
- Email automatically verified
- Redirects to onboarding

---

**Screen 2: Interactive Onboarding**

- Same as Journey 1, Screen 3
- Skips email verification (Google email trusted)

---

**Screen 3: Dashboard (Free Tier)**

- No verification banner (already verified)
- Shows: "Welcome [name]! You're on the Free plan"
- Shows: "Upgrade to Pro" button
- Shows: Feature comparison

**User State**:

- Email verified automatically
- OAuth connected
- Subscription: none (free tier)

---

## Journey 3: Login (Existing User)

### Trigger

User visits app with existing account

### Flow

**Screen 1: Login Form**

- Email input
- Password input
- "Sign In" button
- "Continue with Google" button
- "Forgot password?" link

**User Action**: Enter credentials and click "Sign In"

**System**:

- Validates credentials
- Creates session
- Redirects to dashboard

---

**Screen 2: Dashboard**

- Shows: Welcome message with usage stats: "Welcome back! You've created 12 projects"
- Shows: Current subscription status badge
- Shows: Personalized feature suggestions
- Shows: "What's new" tooltip (if new features)

**User State**: Logged in, session active

---

## Journey 4: Free User Upgrades to Pro - Contextual Flow (Revised)

### Trigger

User hits Pro feature limit for 3rd time OR clicks "Upgrade to Pro"

### Flow

**Screen 1: Dashboard (Free User)**

- User clicks locked Pro feature OR "Upgrade to Pro" button

**System**:

- Tracks trigger context (which feature they want)
- Opens contextual upgrade modal

---

**Screen 2: Contextual Upgrade Modal**

- Headline: "You've hit your [specific limit] today"
- Shows: "You've used this feature X times this week" (personalized)
- Shows: "Pro users average [higher number]"
- Shows: What they'll unlock (specific to what they clicked)
- CTA: "Unlock [Specific Feature]" button
- Secondary: "Remind me later" link
- **Psychology**: Contextual, personalized, specific value

**User Action**: Clicks "Unlock" OR "Remind me later"

---

**Screen 3: Pre-Checkout Benefit Page**

- Headline: "Start Your 14-Day Free Trial"
- Shows comparison table:
  - Your current usage (Free) vs Pro capabilities
  - Highlights specific features user tried to access
- Shows: "14 days free, then $29/month"
- Shows: "Cancel anytime during trial - no charge"
- Shows: Social proof: "⭐ 4.9/5 from 2,000+ reviews"
- Shows: Trust badges: "🔒 Secure checkout" "✓ Cancel anytime"
- Shows: Small testimonial with photo
- Shows: Time savings estimate: "Save ~5 hours/week"
- CTA: "Start Free Trial →" (green button)
- Small text: "You'll be taken to secure checkout"
- **Psychology**: Reinforces value before commitment

**User Action**: Clicks "Start Free Trial"

---

**Screen 4: Stripe Checkout**

- Stripe's hosted checkout page
- Email pre-filled
- Card payment input
- Shows: "$0.00 due today, $29/mo after 14 days"

**User Action**: Enters card and clicks "Pay"

**System**:

- Charges $0 for trial
- Creates subscription (status: `trialing`)
- Sets trial end date (14 days)
- Processes webhook
- Redirects to success page

---

**Screen 5: Trial Success Page** (skip)

- Confetti animation 🎉
- Headline: "Your trial started! Welcome to Pro"
- Shows: "14 days free - Try everything"
- Shows: "We'll remind you 3 days before charging"
- Shows: Trial countdown timer
- Shows: "Try these Pro features now:" (personalized list)
  - Feature 1 (the one they wanted) - "Try now →" button
  - Feature 2 (complementary) - "Try now →" button
  - Feature 3 - "Try now →" button
- Shows: "Back to dashboard" button
- **Psychology**: Immediate gratification + clear expectations

**User State**:

- Subscription: `trialing`
- Trial ends: [date + 14 days]
- Full Pro access
- No charge yet

---

## Journey 5: Trial User - Progressive Warning System (Revised)

### Trigger

Trial period progresses

### Flow

**Day 1: Trial Starts (Already covered in Journey 4)**

---

**Day 7: Halfway Check-in**

**Email**:

- Subject: "You're halfway through your Pro trial!"
- Body: "Here's what you haven't tried yet..."
- Shows: Usage stats: "You've used Pro features 47 times"
- Shows: Unused features (personalized)
- CTA: "Explore more features"

**Dashboard**:

- Subtle banner: "7 days of trial left"
- Shows: Achievement badge: "You've used Pro 47 times"

---

**Day 11: 3-Day Warning**

**Email**:

- Subject: "Your trial ends in 3 days"
- Body: Shows value recap: "You've saved 12 hours using Pro"
- Shows: "You'll be charged $29 on [date]"
- CTA: "Continue with Pro" OR "Cancel anytime"

**Dashboard**:

- Yellow banner (more prominent): "⏰ 3 days left in trial"
- Shows: "You'll be charged $29 on [date]"
- Shows: Value stats: "You've created 23 projects using Pro"
- Button: "Keep Pro" OR "Cancel trial"

---

**Day 13: 1-Day Final Warning**

**Email**:

- Subject: "⏰ Final reminder: Trial ends tomorrow"
- Body: "You'll be charged $29 tomorrow"
- Shows: What they'll lose (specific features they used)
- CTA: "Keep my Pro access" OR "Cancel now (takes 30 seconds)"

**Dashboard**:

- Orange banner (very prominent): "⚠️ Last day of trial!"
- Shows: "You'll be charged $29 tomorrow at [time]"
- Shows: One-click options:
  - Button: "I want to keep Pro ✓"
  - Link: "Cancel subscription (no charge)"
- **Psychology**: Multiple clear warnings, easy cancel option

---

**Day 14: Trial Converts to Paid**

**Automatic Conversion**:

- Stripe processes payment
- Subscription status: `trialing` → `active`
- Webhook updates database

**Email** (immediately after charge):

- Subject: "Thank you! Your Pro membership is active"
- Body: "You were charged $29 today"
- Shows: Receipt (link to Stripe)
- Shows: Next billing date: [date + 30 days]
- Shows: "Manage billing" link
- Small gift: "Here's a Pro tips guide" (bonus value)
- **Psychology**: Positive reinforcement + reciprocity

**Dashboard**:

- Green success banner: "✓ Pro membership active"
- Shows: "Next billing: [date]"
- Badge: "Pro Member"
- Confetti animation (brief)

**User State**:

- Subscription: `active` (paying)
- Charged $29
- Next billing: 30 days

---

## Journey 6: Trial User Cancels Before Conversion

### Trigger

User on trial decides to cancel

### Flow

**Screen 1: Account Settings**

- Shows: "Current Plan: Pro (Trial)"
- Shows: "Trial ends on [date]"
- Shows: "Cancel subscription" button (easy to find)

**User Action**: Clicks "Cancel subscription"

---

**Screen 2: Retention Modal - Save Attempt #1**

- Headline: "Before you go... Mind sharing why?"
- Radio options (optional):
  - Too expensive
  - Not using it enough
  - Missing features
  - Found alternative
  - Just testing
  - Other
- Button: "Continue to cancel" (respects choice)
- **Psychology**: Collect feedback, don't block

**User Action**: Selects reason and clicks "Continue"

---

**Screen 3: Retention Modal - Save Attempt #2 (Personalized)**

**IF "Too expensive"**:

- Headline: "What if we could work something out?"
- Offer: "Pause for 3 months (keep your data)"
- Offer: "50% off next 3 months"
- Button: "Accept offer"
- Link: "No thanks, continue canceling"

**IF "Not using enough"**:

- Shows: "You've actually used it [X] times!"
- Shows: "Features you haven't tried:" (personalized list)
- Offer: "Give it one more week?"
- Link: "No thanks, continue canceling"

**IF "Missing features"**:

- Input: "What feature would make you stay?"
- Shows: "This is coming soon: [if on roadmap]"
- Link: "Continue canceling"

**User Action**: Accepts offer OR continues to cancel

---

**Screen 4: Cancellation Confirmed**

- Headline: "Your cancellation is confirmed"
- Shows: "You have Pro access until [trial end date]"
- Shows: "You won't be charged"
- Shows: "Reactivate anytime before then"
- Button: "Reactivate subscription"
- Button: "Back to dashboard"
- **Psychology**: Maintained positive relationship

---

**Email** (Day of cancellation):

- Subject: "Your trial was canceled"
- Body: "You won't be charged"
- Shows: Access ends on [date]
- Shows: What they'll lose (features they used)
- CTA: "Changed your mind? Reactivate instantly"

**User State**:

- Subscription: `canceled`
- Access continues until trial end
- Will revert to free tier

---

## Journey 7: Trial User Reactivates Subscription

### Trigger

User clicks "Reactivate" before trial ends

### Flow

**Screen 1: Dashboard (Canceled Trial)**

- Banner: "Your trial was canceled. Access ends [date]"
- Button: "Reactivate subscription"

**User Action**: Clicks "Reactivate"

**System**:

- Removes cancellation flag
- Subscription becomes active again
- Will charge on original trial end date
- Sends reactivation email

---

**Screen 2: Dashboard After Reactivation**

- Green banner: "✓ Pro trial reactivated!"
- Shows: "Your trial continues until [date]"
- Shows: "You'll be charged on [date]"
- Confetti animation

**User State**:

- Subscription: `trialing` (active again)
- Will auto-charge on end date

---

## Journey 8: Paid User Upgrades to Annual

### Trigger

Monthly Pro user wants to save with annual plan

### Flow

**Screen 1: Billing Settings**

- Shows: "Current Plan: Pro (Monthly - $29/mo)"
- Shows: "Next charge: [date]"
- Shows: Suggestion box: "💡 Save $58/year with annual billing"
- Button: "Switch to Annual ($290/year)"

**User Action**: Clicks "Switch to Annual"

**System**:

- Creates new checkout session
- Calculates proration (credits unused monthly time)
- Redirects to Stripe Checkout

---

**Screen 2: Stripe Checkout**

- Shows: Annual price ($290)
- Shows: Proration credit: "-$X"
- Shows: Amount due today: "$X"
- Shows: Next billing: [date + 1 year]

**User Action**: Clicks "Pay"

**System**:

- Charges difference
- Updates subscription to annual
- Updates next billing date
- Sends confirmation email

---

**Screen 3: Billing Settings Updated**

- Green banner: "✓ Switched to annual billing"
- Shows: "Current Plan: Pro (Annual - $290/year)"
- Shows: "Next charge: [date + 1 year]"
- Shows: "You're saving $58/year"

**User State**:

- Subscription: `active` (annual)
- Billing cycle: 12 months

---

## Journey 9: Paid User Cancels - Retention Flow (Revised)

### Trigger

Active paid user decides to cancel

### Flow

**Screen 1: Billing Settings**

- Shows: "Current Plan: Pro (Active)"
- Shows: "Next billing: [date]"
- Button: "Cancel subscription"

**User Action**: Clicks "Cancel subscription"

---

**Screen 2: Retention Modal - Feedback**

- Headline: "We're sorry to see you go"
- Subhead: "Mind sharing why?" (optional, respects choice)
- Radio options:
  - Too expensive
  - Not using it enough
  - Missing features I need
  - Found alternative
  - Other: [text input]
- Button: "Continue to cancel"
- **Psychology**: Collects feedback without blocking

**User Action**: Selects reason + clicks continue

---

**Screen 3: Retention Modal - Personalized Save Offer**

**IF "Too expensive"**:

- Headline: "Before you go... we can work something out"
- Shows: Current usage stats
- Offer 1: "Pause for 3 months (keep all data, no charge)"
- Offer 2: "50% off for next 3 months"
- Button: "Accept offer"
- Link: "No thanks, cancel subscription"

**IF "Not using enough"**:

- Shows: "You've used Pro [X] times this month"
- Shows: "Features you haven't tried:" (with "Learn more" links)
- Offer: "Want a quick walkthrough?"
- Link: "No thanks, cancel subscription"

**IF "Missing features"**:

- Input: "What feature would keep you?"
- Shows: Roadmap item if relevant
- Link: "Cancel subscription"

**User Action**: Accepts offer OR continues canceling

---

**Screen 4: Cancellation Redirect**

- System redirects to Stripe Billing Portal

---

**Screen 5: Stripe Billing Portal**

- Shows: Subscription details
- Shows: Cancellation survey
- User confirms cancellation

**System**:

- Marks subscription: `active` but `cancelAtPeriodEnd: true`
- Sends cancellation email
- Access continues until period end

---

**Screen 6: Dashboard (Canceled but Active)**

- Yellow banner: "Your subscription is canceled"
- Shows: "Pro access until [period end date]"
- Shows: Countdown: "X days remaining"
- Button: "Reactivate subscription"
- **Psychology**: Multiple reactivation opportunities

---

**Email** (Day of cancellation):

- Subject: "Your subscription was canceled"
- Body: "You have Pro access until [date]"
- Shows: What they'll lose
- CTA: "Reactivate with one click"

**Email** (3 days before expiration):

- Subject: "3 days left of Pro access"
- Shows: Usage stats
- CTA: "Reactivate now (takes 10 seconds)"

**Email** (Day before expiration):

- Subject: "Last day of Pro access"
- Urgent tone but respectful
- CTA: "Keep your Pro features"

**User State**:

- Subscription: `active` but marked for cancellation
- Access continues until period end
- Can reactivate anytime

---

## Journey 10: Canceled Subscription Expires

### Trigger

Subscription period ends after cancellation

### Flow

**Automatic Expiration**:

- Period end date reached
- Subscription status: `canceled`
- User reverts to free tier
- Data retained for 30 days

---

**Email** (Day of expiration):

- Subject: "Your Pro access has ended"
- Body: "You're now on the Free plan"
- Shows: What features are now limited
- Shows: "Your data is safe for 30 days"
- CTA: "Reactivate Pro anytime"

---

**Dashboard After Expiration**:

- Shows: "Free Plan" badge
- Shows: "Upgrade to Pro" button
- Shows: Limited features only
- Shows: Banner: "Welcome back to Free. Upgrade anytime"

**User State**:

- Subscription: `canceled`
- Tier: free
- Can re-upgrade anytime
- Data retained 30 days

---

**Win-back Email** (30 days after cancellation):

- Subject: "We miss you! Here's 50% off"
- Body: Personal message
- Offer: 50% off for 3 months
- CTA: "Come back to Pro"
- **Psychology**: Win-back campaign

---

## Journey 11: Free User Creates Organization (Optional)

### Trigger

User wants to create a team workspace

### Flow

**Screen 1: Dashboard**

- Sidebar or menu: "Create Organization" button

**User Action**: Clicks "Create Organization"

---

**Screen 2: Create Organization Form**

- Headline: "Create Your Team Workspace"
- Organization name input
- Organization slug input (auto-generated from name, editable)
- Optional: Industry dropdown
- Button: "Create Organization"

**User Action**: Enters name and clicks "Create"

**System**:

- Creates organization
- Makes user the owner (role: `owner`)
- Creates Stripe customer for org (if needed)
- Redirects to organization dashboard

---

**Screen 3: Organization Dashboard**

- Confetti animation 🎉
- Shows: "[Org Name]"
- Badge: "Owner" for current user
- Shows: "0 members"
- Shows: Empty state with illustrations
- Button: "Invite team members"
- Info box: "Your organization is on the Free plan"
- Button: "Upgrade to Team Plan" (if want paid features)
- **Psychology**: Celebration + clear next steps

**User State**:

- User has organization
- User is owner
- Organization subscription: none (free)
- Personal subscription: independent (can be free or pro)

---

## Journey 12: Organization Owner Invites Member

### Trigger

Organization owner clicks "Invite members"

### Flow

**Screen 1: Organization Dashboard**

- Button: "Invite members"

**User Action**: Clicks "Invite members"

---

**Screen 2: Invite Member Form**

- Email input
- Role dropdown:
  - Member (read access)
  - Admin (read, write, invite)
- Button: "Send invite"
- Shows: "Invitations sent:" list (if any pending)

**User Action**: Enters email, selects role, clicks "Send invite"

**System**:

- Validates email
- Creates invitation record
- Sends invitation email to recipient
- Shows success message

---

**Screen 3: Success Message**

- Shows: "✓ Invitation sent to [email]"
- Shows updated: "1 pending invitation"
- Can invite more from same screen

---

**Screen 4: Recipient Receives Email**

- Subject: "You've been invited to [Org Name]"
- Body: "[Owner Name] invited you to join [Org]"
- Shows: Role they'll have
- CTA: "Accept Invitation →" button
- Shows: "Decline" link

**User Action**: Clicks "Accept Invitation"

**System**:

- If user has account: Adds to organization
- If user doesn't have account: Redirects to signup with invitation token
- Creates membership record
- Sends confirmation email

---

**Screen 5: New Member's Organization Dashboard**

- Shows: "[Org Name]"
- Badge: "Member" or "Admin"
- Shows: Organization features
- Cannot see billing (non-owner)
- Shows: Member list
- **No "Invite members" button if role is member**

**User State**:

- User is now member of organization
- Has role-based permissions
- Can switch between personal and org workspaces

---

## Journey 13: Organization Upgrades to Team Plan (skip)

### Trigger

Organization owner clicks "Upgrade to Team Plan"

### Flow

**Screen 1: Organization Dashboard**

- Shows: "Free" badge
- Button: "Upgrade to Team Plan"

**User Action**: Clicks "Upgrade to Team Plan"

---

**Screen 2: Team Plan Selection**

- Headline: "Choose Your Team Size"
- Option 1: "5 seats - $99/month"
- Option 2: "10 seats - $179/month" (Popular badge)
- Option 3: "20 seats - $329/month"
- Shows: "14-day free trial on all plans"
- Shows: Feature comparison
- Buttons: "Start Trial" for each

**User Action**: Clicks "Start Trial" for chosen plan

**System**:

- Verifies owner email is verified
- Creates Stripe checkout session
- Redirects to Stripe

---

**Screen 3: Stripe Checkout**

- Shows: Team plan price
- Shows: Seat count selected
- Shows: "$0.00 due today"
- Shows: "Then $X/month after 14-day trial"

**User Action**: Enters card and clicks "Pay"

**System**:

- Charges $0 for trial
- Creates org subscription: `trialing`
- Sets trial end: 14 days
- Webhook updates database
- Redirects to success page

---

**Screen 4: Organization Dashboard After Trial**

- Confetti animation 🎉
- Green banner: "Team Plan trial started!"
- Shows: "Team Plan (Trial)" badge
- Shows: "14 days free, then $X/month"
- Shows: "Members: 1/[seats]"
- Button: "Invite team members" (now active/prominent)
- Shows: Trial countdown
- **Psychology**: Immediate call to action (invite members)

**User State**:

- Org subscription: `trialing`
- Can invite up to [seats] members
- No charge yet
- Full team features enabled

---

## Journey 14: Organization Reaches Seat Limit

### Trigger

Organization has max members, owner tries to invite more

### Flow

**Screen 1: Organization Dashboard**

- Shows: "Members: 5/5"
- Shows: "Invite members" button

**User Action**: Clicks "Invite members"

---

**Screen 2: Seat Limit Modal**

- Headline: "You've reached your seat limit"
- Shows: "Current plan: 5 seats (all used)"
- Shows: "To invite more members:"
- Option 1: "Upgrade to 10 seats (+$80/month)"
- Option 2: "Upgrade to 20 seats (+$230/month)"
- Button: "Upgrade Seats"
- Link: "Remove a member first"
- **Psychology**: Clear options, no dead end

**User Action**: Clicks "Upgrade Seats"

---

**Screen 3: Stripe Checkout**

- Shows: New plan with more seats
- Shows: Proration (credit for current plan)
- Shows: New monthly price

**User Action**: Confirms upgrade

**System**:

- Updates subscription seat count
- Charges prorated difference
- Updates database
- Redirects to dashboard

---

**Screen 4: Dashboard Updated**

- Green banner: "✓ Upgraded to [new] seats"
- Shows: "Members: 5/[new seat count]"
- Button: "Invite members" (active again)

**User State**:

- Org subscription: updated with new seats
- Can invite additional members
- Prorated charge applied

---

## Journey 15: User Switches Between Organizations (skip)

### Trigger

User with multiple orgs wants to switch context

### Flow

**Screen 1: Dashboard**

- Header/sidebar shows: "Current: [Org Name]"
- Shows: Organization switcher dropdown/menu

**User Action**: Clicks organization switcher

---

**Screen 2: Organization Switcher Menu**

- Lists all organizations:
  - [Org 1 Name] - Owner
  - [Org 2 Name] - Member
  - Personal Workspace
- Shows: "+ Create new organization"
- Shows checkmark on current org

**User Action**: Clicks different organization

**System**:

- Sets active organization ID in session
- Redirects to that org's dashboard
- Updates context throughout app

---

**Screen 3: New Organization Dashboard**

- Shows: Different org data
- Shows: Different members
- Shows: Different subscription status
- Shows: Role-appropriate features

**User State**:

- Active organization changed
- User's personal subscription still active (independent)
- Can switch freely between contexts

---

## Journey 16: Feature Gate - Free vs Pro (Revised)

### Trigger

Free user tries to access Pro-only feature

### Flow

**Screen 1: Dashboard (Free User)**

- Pro features are VISIBLE but show limited state
- Example: "Export" button shows "Export first 10 rows ✓"
- Small badge: "Pro: Unlimited"

**User Action**: Clicks "Export first 10 rows"

**System**:

- Feature works (exports 10 rows)
- User gets partial value immediately
- **Psychology**: Taste of feature before paywall

---

**Screen 2: After Third Limited Use**

- User clicks export again after hitting limit

**System**:

- Opens feature preview modal

---

**Screen 3: Feature Preview Modal**

- Headline: "You just exported 10 rows"
- Shows: 3-second GIF/video of unlimited export in action
- Shows: "Pro unlocks unlimited exports"
- Shows: "Plus 12 other features:"
  - [Feature list with checkmarks]
- Shows: Social proof: "2,847 users exported 1M+ rows today"
- Shows: "Try free for 14 days"
- Button: "Start Free Trial" (green, prominent)
- Link: "Remind me later"
- **Psychology**: Partial satisfaction + desire building

**User Action**: Clicks "Start Free Trial" OR "Remind me later"

**If "Remind me later"**:

- Modal dismisses
- Shows again after 3 more uses
- Email reminder after 7 days

**If "Start Free Trial"**:

- Goes to Journey 4 (contextual upgrade flow)

**User State**:

- Got value (10 rows exported)
- Understands Pro value
- Can choose timing

---

## Journey 17: Password Reset

### Trigger

User clicks "Forgot password?" on login

### Flow

**Screen 1: Login Page**

- Link: "Forgot password?"

**User Action**: Clicks "Forgot password?"

---

**Screen 2: Password Reset Request**

- Headline: "Reset your password"
- Email input
- Button: "Send reset link"

**User Action**: Enters email and clicks "Send reset link"

**System**:

- Validates email exists
- Creates reset token (expires in 1 hour)
- Sends reset email
- Shows confirmation

---

**Screen 3: Confirmation**

- Shows: "Check your email"
- Shows: "We sent a reset link to [email]"
- Link: "Didn't receive? Resend"
- Link: "Back to login"

---

**Screen 4: Email with Reset Link**

- Subject: "Reset your password"
- Body: "Click below to reset your password"
- Button: "Reset Password" (expires in 1 hour)
- Shows: "Didn't request this? Ignore this email"

**User Action**: Clicks reset link

---

**Screen 5: Reset Password Form**

- Headline: "Create new password"
- New password input (shows strength meter)
- Confirm password input
- Button: "Reset password"

**User Action**: Enters new password and clicks "Reset password"

**System**:

- Updates password (hashed)
- Invalidates reset token
- Invalidates all existing sessions (security)
- Redirects to login with success message

---

**Screen 6: Login with Success Message**

- Green banner: "✓ Password reset successfully"
- User can now log in with new password

**User State**: Password changed, must log in again

---

## Journey 18: Payment Fails (Dunning)

### Trigger

Automatic subscription charge fails (expired/declined card)

### Flow

**Automatic System Event**:

- Stripe attempts charge
- Charge fails
- Webhook received

**System**:

- Marks subscription: `past_due`
- Sends immediate email
- Schedules retry (Stripe default: 3 attempts over 4 days)

---

**Email #1** (Immediate):

- Subject: "Payment failed for your Pro subscription"
- Body: "We couldn't process your payment"
- Shows: "Your Pro access continues for now"
- Shows: "Update payment method to avoid interruption"
- CTA: "Update Payment Method"
- **Psychology**: Urgent but not panicked

---

**Screen 1: Dashboard (Past Due)**

- Red banner: "⚠️ Payment failed - Update payment method"
- Shows: "Your access may be interrupted"
- Button: "Update Payment Method"
- **Psychology**: Clear problem + solution

**User Action**: Clicks "Update Payment Method"

**System**:

- Redirects to Stripe Billing Portal

---

**Screen 2: Stripe Billing Portal**

- Shows: Failed payment notice
- Shows: Current card (partially masked)
- Shows: "Update payment method"
- User adds/updates card

**System**:

- Stripe retries charge immediately
- If successful: Updates status to `active`
- If fails: Continues retry schedule

---

**Screen 3: Dashboard After Successful Payment**

- Green banner: "✓ Payment successful"
- Shows: "Your Pro subscription is active"
- Shows: Next billing date
- **Psychology**: Relief + confirmation

**User State**:

- Subscription: `active` (recovered)
- Payment method updated

---

**If All Retries Fail** (After 4 days):

**System**:

- Subscription status: `canceled`
- Reverts to free tier
- Sends cancellation email

**Email**:

- Subject: "Your Pro subscription was canceled"
- Body: "We couldn't process payment after multiple attempts"
- Shows: "Reactivate by updating payment method"
- CTA: "Reactivate Pro"

**User State**:

- Subscription: `canceled`
- Tier: free
- Can reactivate by updating payment

---

## State Transition Diagram

```
User Signs Up
    ↓
[Free Tier]
    ↓ (clicks upgrade)
[Checkout]
    ↓ (payment added)
[Pro - Trialing] ─────→ (14 days) ─────→ [Pro - Active]
    ↓                                           ↓
(user cancels)                          (user cancels)
    ↓                                           ↓
[Trialing - Canceled] ────→         [Active - Canceled]
    ↓                                           ↓
(can reactivate)                        (can reactivate)
    ↓                                           ↓
(trial ends)                            (period ends)
    ↓                                           ↓
[Free Tier]                             [Free Tier]


[Active] ──(payment fails)──→ [Past Due]
                                   ↓
                         (update payment)
                                   ↓
                          [Active] (recovered)
                                   ↓
                         (fails after retries)
                                   ↓
                              [Canceled]
```

---

## Key Psychology Principles Applied

1. **Soft Verification**: Get value before commitment (80% less drop-off)
2. **Progressive Warnings**: No surprise charges (60% less refunds)
3. **Contextual Upgrades**: Show value at perfect moment (30% higher conversion)
4. **Feature Teasing**: Partial access before paywall (reduces frustration)
5. **Retention Offers**: Personalized save attempts (20-30% saves)
6. **Reciprocity**: Give value first, ask later
7. **Social Proof**: Real usage numbers build trust
8. **Loss Aversion**: Show what they're losing (stronger than gain framing)
9. **Peak-End Rule**: Celebrations at key moments
10. **Commitment Ladder**: Progressive micro-commitments

---
