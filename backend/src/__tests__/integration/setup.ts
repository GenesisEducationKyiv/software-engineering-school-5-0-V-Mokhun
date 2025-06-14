import { afterEach, beforeEach } from "@jest/globals";
import { closeDb, connectDb, resetDb } from "@/db";

beforeEach(async () => {
  await connectDb();
  await resetDb();
});

afterEach(async () => {
  await closeDb();
});
