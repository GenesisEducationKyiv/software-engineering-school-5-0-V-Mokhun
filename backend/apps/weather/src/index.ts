import { app } from "./app";
import { env } from "@/config/env";
import { connectDb } from "@/db";
import { JobManager } from "@common/infrastructure/queue";
import { createLogger } from "@logger/logger.factory";
import { workers } from "./infrastructure/queue/workers";
import { getCallSites } from "util";

async function startServer() {
  const logger = createLogger("weather", env.NODE_ENV);

  try {
    await connectDb();
    const server = app.listen(env.API_PORT, () => {
      logger.info({
        message: `Server is running on port ${env.API_PORT}`,
        callSites: getCallSites(),
      });
    });

    const jobManager = new JobManager(workers, logger);
    jobManager.initializeWorkers();

    const shutdown = async () => {
      server.close(() => {
        logger.info({
          message: "Server shutdown",
          callSites: getCallSites(),
        });
      });

      jobManager.stopWorkers().then(() => {
        logger.info({
          message: "Workers stopped",
          callSites: getCallSites(),
        });
      });

      process.exit(0);
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    logger.error({
      message: "Failed to start server",
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
      },
      callSites: getCallSites(),
    });
    process.exit(1);
  }
}

startServer();
