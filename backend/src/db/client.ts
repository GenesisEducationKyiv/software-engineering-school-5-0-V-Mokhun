import { env } from "../config";
import { PrismaClient } from "@prisma/client";

/**
 * Factory that creates a configured PrismaClient instance.
 * Keeping this in one place allows you to swap the implementation or the
 * constructor parameters (e.g. log level) without touching call-sites.
 */
function createPrismaClient() {
  return new PrismaClient({
    log: env.NODE_ENV === "production" ? ["error"] : ["info", "warn", "error"],
  });
}

// Holds the singleton instance (undefined until first access or override).
let dbInstance: PrismaClient | undefined;

/**
 * Returns the active Prisma client, creating it on first use.
 * In production this ensures a single connection pool is shared.
 * In tests you can call `overrideDb` _before_ any code requests the client.
 */
export function getDb(): PrismaClient {
  if (!dbInstance) {
    dbInstance = createPrismaClient();
  }
  return dbInstance;
}

/**
 * Replaces the internal Prisma client with a caller-provided instance.
 * Useful for unit tests (e.g. supply a mocked client or one connected to
 * an in-memory SQLite database).
 */
export function overrideDb(client: PrismaClient) {
  if (dbInstance) {
    // Close previous connection to avoid leaks in test runners.
    dbInstance.$disconnect().catch(() => {
      /* swallow */
    });
  }
  dbInstance = client;
}

/**
 * Explicitly disconnect (primarily for tests or graceful shutdown hooks).
 */
export async function closeDb() {
  if (dbInstance) {
    await dbInstance.$disconnect();
    dbInstance = undefined;
  }
}

/**
 * Convenience default export so existing imports (`import { db } from '../db'`) keep working.
 */
export const db = getDb();
