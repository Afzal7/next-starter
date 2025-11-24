/**
 * Health check endpoint
 * Used for monitoring and load balancer health checks
 */

import { getDb } from "@/lib/db";

export async function GET(): Promise<Response> {
  try {
    // Check database connection
    await getDb();

    return Response.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        services: {
          database: "connected",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        services: {
          database: "disconnected",
        },
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 503 }
    );
  }
}

