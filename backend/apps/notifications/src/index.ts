import { connectDb } from "@/db";
import { JobManager } from "@common/infrastructure/queue";
import { workers } from "./infrastructure/queue/workers";
import { getLogger } from "@logger/logger.factory";

async function startService() {
  const logger = getLogger();

  try {
    await connectDb();

    const jobManager = new JobManager(workers, logger);
    jobManager.initializeWorkers();

    const shutdown = async () => {
      await jobManager.stopWorkers();

      process.exit(0);
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    logger.error(
      "Failed to start notifications service",
      error instanceof Error ? error : new Error(JSON.stringify(error))
    );
    process.exit(1);
  }
}

startService();
