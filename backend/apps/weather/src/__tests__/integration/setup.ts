import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  jest,
} from "@jest/globals";
import { closeDb, connectDb, resetDb } from "@common/db";
import { JobManager } from "@common/infrastructure/queue";
import {
  clearQueues,
  closeQueues,
  pauseQueues,
} from "@common/infrastructure/queue/queues";
import { getLogger } from "@logger/logger.factory";
import { mockEmailService } from "../mocks/email.service";
import { server } from "../mocks/node";
import { createEmailService } from "@/infrastructure/email/email.factory";

jest.mock("@/infrastructure/email/email.factory", () => ({
  createEmailService: jest.fn(),
}));
const mockedCreateEmailService = createEmailService as jest.Mock;

const logger = getLogger();
let jobManager: JobManager;

beforeAll(async () => {
  mockedCreateEmailService.mockReturnValue(mockEmailService);

  const { workers } = await import("@/infrastructure/queue/workers");
  jobManager = new JobManager(workers, logger);

  server.listen({
    onUnhandledRequest: "error",
  });
  jobManager.initializeWorkers();
  await pauseQueues();
});

beforeEach(async () => {
  mockEmailService.clear();
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
  await jobManager.stopWorkers();
  await closeQueues();
});
