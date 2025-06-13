import { env } from "../config";
import { PrismaClient } from "@prisma/client";

function createPrismaClient() {
  return new PrismaClient({
    log: env.NODE_ENV === "production" ? ["error"] : ["info", "warn", "error"],
  });
}

let dbInstance: PrismaClient | undefined;

export function getDb(): PrismaClient {
  if (!dbInstance) {
    dbInstance = createPrismaClient();
  }
  return dbInstance;
}

export function overrideDb(client: PrismaClient) {
  if (dbInstance) {
    dbInstance.$disconnect().catch(() => {});
  }
  dbInstance = client;
}

export async function closeDb() {
  if (dbInstance) {
    await dbInstance.$disconnect();
    dbInstance = undefined;
  }
}

export const db = getDb();
