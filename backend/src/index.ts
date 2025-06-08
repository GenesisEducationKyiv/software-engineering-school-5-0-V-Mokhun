import { app } from "./app";
import { env } from "./config";
import {
  initializeJobs,
  redisConnection,
  stopJobs,
  weatherScheduler,
} from "./lib";

async function startServer() {
  try {
    const server = app.listen(env.API_PORT, () => {
      console.log(`Server is running on port ${env.API_PORT}`);
    });

    initializeJobs();
    await weatherScheduler.initialize();

    const shutdown = async () => {
      server.close(() => {
        console.log("Server shutdown");
      });

      await stopJobs();
      await redisConnection.quit();

      process.exit(0);
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

startServer();
