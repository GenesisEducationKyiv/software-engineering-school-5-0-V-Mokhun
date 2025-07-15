import { closeDb, connectDb, resetDb } from "@common/db";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  jest,
} from "@jest/globals";
import { server } from "../mocks/node";
import { mockQueueService } from "../mocks";

jest.mock("@common/infrastructure/queue/queue.factory", () => ({
  createQueueService: () => mockQueueService,
}));

beforeAll(async () => {
  server.listen({
    onUnhandledRequest: "error",
  });
});

beforeEach(async () => {
  await connectDb();
  await resetDb();
});

afterEach(async () => {
  server.resetHandlers();
  await closeDb();
});

afterAll(async () => {
  server.close();
});
