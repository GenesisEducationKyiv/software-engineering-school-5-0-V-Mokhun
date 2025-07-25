import { PrismaClient } from "@prisma/client";

export type IDatabase = Omit<
  PrismaClient,
  "$on" | "$transaction" | "$use" | "$extends"
>;
