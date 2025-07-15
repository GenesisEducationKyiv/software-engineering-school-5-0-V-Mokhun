import { IDatabase } from "@common/shared/ports";
import { env } from "@common/config";
import { PrismaClient } from "@prisma/client";

function createPrismaClient() {
  return new PrismaClient({
    log: env.NODE_ENV === "development" ? ["info", "warn", "error"] : ["error"],
  });
}

let dbInstance: IDatabase | undefined;

export function getDb(): IDatabase {
  if (!dbInstance) {
    dbInstance = createPrismaClient();
  }
  return dbInstance;
}

export function overrideDb(client: IDatabase) {
  if (dbInstance) {
    dbInstance.$disconnect().catch(() => {});
  }
  dbInstance = client;
}

export async function connectDb() {
  if (!dbInstance) {
    dbInstance = createPrismaClient();
  }
  await dbInstance.$connect();
}

export async function closeDb() {
  if (dbInstance) {
    await dbInstance.$disconnect();
    dbInstance = undefined;
  }
}

export async function resetDb() {
  const tablenames = await getDb().$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== "_prisma_migrations")
    .map((name) => `"public"."${name}"`)
    .join(", ");

  await getDb().$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
}

export const db = getDb();
