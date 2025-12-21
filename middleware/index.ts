/**
 * Next.js middleware for authentication
 * REMOVED: Middleware-based auth is not secure in Next.js App Router
 *
 * Authentication is now handled at the page/layout level using Better Auth's
 * client-side session management for proper security and SSR compatibility.
 *
 * See: https://www.better-auth.com/docs/concepts/middleware
 */

// Middleware removed for security reasons
// Auth checks are now handled in dashboard/layout.tsx and individual pages

export const config = {
  matcher: [], // No routes protected by middleware
};
