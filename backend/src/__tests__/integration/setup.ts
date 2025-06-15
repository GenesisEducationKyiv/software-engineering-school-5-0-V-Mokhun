import { afterAll, afterEach, beforeAll, beforeEach } from "@jest/globals";
import { closeDb, connectDb, resetDb } from "@/db";
import { JobManager, workers } from "@/infrastructure/queue";
import { getLogger } from "@/shared/logger/logger.factory";
import { server } from "../mocks/node";

const logger = getLogger();
const jobManager = new JobManager(workers, logger);

beforeAll(() => {
  server.listen();
  jobManager.initializeWorkers();
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
  await jobManager.stopWorkers();
});
