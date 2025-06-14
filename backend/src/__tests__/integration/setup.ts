import { afterAll, afterEach, beforeAll, beforeEach } from "@jest/globals";
import { closeDb, connectDb, resetDb } from "@/db";
import { JobManager, workers } from "@/infrastructure/queue";
import { getLogger } from "@/shared/logger/logger.factory";

const logger = getLogger();
const jobManager = new JobManager(workers, logger);

beforeAll(async () => {
  return jobManager.initializeWorkers();
});

beforeEach(async () => {
  await connectDb();
  await resetDb();
});

afterEach(async () => {
  await closeDb();
});

afterAll(async () => {
  await jobManager.stopWorkers();
});
