import { env } from "../config";
import { PrismaClient } from "@prisma/client";

const globalForDb = globalThis as unknown as { db: PrismaClient };

export const db =
  globalForDb.db ||
  new PrismaClient({
    log: env.NODE_ENV === "production" ? ["error"] : ["info", "warn", "error"],
  });

if (env.NODE_ENV !== "production") globalForDb.db = db;
