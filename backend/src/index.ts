import { app } from "./app";
import { env } from "./config";
import { connectDb } from "./db";
import { JobManager, workers } from "./infrastructure/queue";
import { getLogger } from "./shared/logger/logger.factory";

async function startServer() {
  const logger = getLogger();

  try {
    const server = app.listen(env.API_PORT, () => {
      logger.info(`Server is running on port ${env.API_PORT}`);
    });
    await connectDb();

    const jobManager = new JobManager(workers, logger);
    jobManager.initializeWorkers();

    const shutdown = async () => {
      server.close(() => {
        logger.info("Server shutdown");
      });

      await jobManager.stopWorkers();

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
