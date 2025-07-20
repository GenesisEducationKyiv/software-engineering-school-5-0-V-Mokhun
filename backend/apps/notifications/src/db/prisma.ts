import { IDatabase } from "@/shared/ports";
import { PrismaClient } from "@db";
import { env } from "@/config";

function createPrismaClient(): IDatabase {
  return new PrismaClient({
    log: env.NODE_ENV === "development" ? ["info", "warn", "error"] : ["error"],
  });
}

let dbInstance: IDatabase | undefined;

export function getDb(): IDatabase {
  if (!dbInstance) {
    dbInstance = createPrismaClient();
  }
  return dbInstance as IDatabase;
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
  await (dbInstance as IDatabase).$connect();
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
    .map(({ tablename }: { tablename: string }) => tablename)
    .filter((name: string) => name !== "_prisma_migrations")
    .map((name: string) => `"public"."${name}"`)
    .join(", ");

  await getDb().$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
}

export const db = getDb();
