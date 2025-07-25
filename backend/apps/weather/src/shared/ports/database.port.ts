import { PrismaClient } from "@db";

export type IDatabase = Omit<
  PrismaClient,
  "$on" | "$transaction" | "$use" | "$extends"
>;
