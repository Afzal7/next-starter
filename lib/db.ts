/**
 * MongoDB database client with connection pooling and singleton pattern
 * Ensures a single connection instance across the application
 */

import { MongoClient, Db } from "mongodb";
import { env } from "./env";
import { DATABASE_NAME } from "./constants";

// Global connection instance
let client: MongoClient | null = null;
let dbInstance: Db | null = null;

/**
 * Gets or creates the MongoDB client instance
 * Uses connection pooling for optimal performance
 */
function getClient(): MongoClient {
  if (!client) {
    client = new MongoClient(env.MONGODB_URI, {
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 2, // Minimum number of connections in the pool
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      serverSelectionTimeoutMS: 5000, // How long to try selecting a server
      socketTimeoutMS: 45000, // How long to wait for a socket connection
    });

    // Handle connection errors
    client.on("error", (error) => {
      console.error("[MongoDB] Connection error:", error);
    });

    // Handle connection close
    client.on("close", () => {
      console.warn("[MongoDB] Connection closed");
    });
  }

  return client;
}

/**
 * Gets the database instance
 * Connects to the database if not already connected
 */
export async function getDb(): Promise<Db> {
  if (!dbInstance) {
    const mongoClient = getClient();

    try {
      // Connect if not already connected
      // Check if client is already connected by attempting to access admin
      try {
        await mongoClient.db("admin").admin().ping();
      } catch {
        // Not connected, so connect
        await mongoClient.connect();
        console.log("[MongoDB] Connected successfully");
      }

      dbInstance = mongoClient.db(DATABASE_NAME);
    } catch (error) {
      console.error("[MongoDB] Failed to connect:", error);
      throw new Error(
        `Failed to connect to MongoDB: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  return dbInstance;
}

/**
 * Closes the database connection gracefully
 * Should be called during application shutdown
 */
export async function closeDb(): Promise<void> {
  if (client) {
    try {
      await client.close();
      console.log("[MongoDB] Connection closed gracefully");
      client = null;
      dbInstance = null;
    } catch (error) {
      console.error("[MongoDB] Error closing connection:", error);
      throw error;
    }
  }
}

/**
 * Synchronous database access for Better Auth adapter
 * Note: This assumes the connection is already established
 */
export const db = (() => {
  const mongoClient = getClient();
  return mongoClient.db(DATABASE_NAME);
})();
