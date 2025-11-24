/**
 * Next.js middleware for authentication
 * Protects routes defined in the matcher configuration
 * Uses Better Auth's built-in getSession API
 *
 * Note: For Next.js 16+, consider migrating to proxy.ts (see Better Auth docs)
 * This middleware uses Node.js runtime for full session validation
 */

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { headers } from "next/headers";

export async function middleware(request: NextRequest) {
  // Use Better Auth's built-in getSession API
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // THIS IS NOT SECURE!
  // This is the recommended approach to optimistically redirect users
  // We recommend handling auth checks in each page/route
  if (!session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs", // Required for auth.api calls
  matcher: ["/dashboard/:path*", "/settings/:path*"],
};
