import { app } from "./app";
import { env } from "./config";
import { redisConnection } from "./infrastructure/queue";
import { JobManager } from "./infrastructure/queue/job-manager.service";
import { workers } from "./infrastructure/queue/workers";
import { getLogger } from "./shared/logger/logger.factory";

async function startServer() {
  const logger = getLogger();

  try {
    const server = app.listen(env.API_PORT, () => {
      logger.info(`Server is running on port ${env.API_PORT}`);
    });

    const jobManager = new JobManager(workers, logger);
    jobManager.initializeWorkers();

    const shutdown = async () => {
      server.close(() => {
        logger.info("Server shutdown");
      });

      await jobManager.stopWorkers();
      await redisConnection.quit();

      process.exit(0);
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    logger.error(
      "Failed to start server",
      error instanceof Error ? error : new Error(JSON.stringify(error))
    );
    process.exit(1);
  }
}

startServer();
