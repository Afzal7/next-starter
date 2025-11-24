/**
 * Graceful shutdown utilities
 * Handles cleanup on application termination
 */

import { closeDb } from "./db";

let isShuttingDown = false;

/**
 * Gracefully shuts down the application
 */
export async function gracefulShutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    console.warn(`[Shutdown] Already shutting down, ignoring ${signal}`);
    return;
  }

  isShuttingDown = true;
  console.log(`[Shutdown] Received ${signal}, starting graceful shutdown...`);

  try {
    // Close database connections
    await closeDb();

    console.log("[Shutdown] Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    console.error("[Shutdown] Error during shutdown:", error);
    process.exit(1);
  }
}

/**
 * Sets up graceful shutdown handlers
 * Should be called during application startup
 */
export function setupGracefulShutdown(): void {
  // Handle termination signals
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  // Handle uncaught exceptions
  process.on("uncaughtException", (error) => {
    console.error("[Uncaught Exception]", error);
    gracefulShutdown("uncaughtException");
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (reason, promise) => {
    console.error("[Unhandled Rejection]", reason, "at", promise);
    gracefulShutdown("unhandledRejection");
  });
}

