import { app } from "./app";
import { env } from "@/config/env";
import { connectDb } from "@/db";
import { JobManager } from "@common/infrastructure/queue";
import { getLogger } from "@logger/logger.factory";
import { workers } from "./infrastructure/queue/workers";

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

      jobManager.stopWorkers().then(() => {
        logger.info("Workers stopped");
      });

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
