/**
 * Better Auth API route handler
 * Handles all authentication endpoints (sign in, sign up, OAuth, etc.)
 * Uses Better Auth's official Next.js integration
 */

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth.handler);
