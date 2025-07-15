import { closeDb, connectDb, resetDb } from "@common/db";
import {
  clearQueues,
  closeQueues,
  pauseQueues,
} from "@common/infrastructure/queue";
import { afterAll, afterEach, beforeAll, beforeEach } from "@jest/globals";
import { server } from "../mocks/node";

beforeAll(async () => {
  server.listen({
    onUnhandledRequest: "error",
  });
  await pauseQueues();
});

beforeEach(async () => {
  await connectDb();
  await resetDb();
});

afterEach(async () => {
  server.resetHandlers();
  await closeDb();
  await clearQueues();
});

afterAll(async () => {
  server.close();
  await closeQueues();
});
