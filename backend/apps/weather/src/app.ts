import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "@common/config";
import { getDb } from "@common/db";
import { MetricsFactory } from "./infrastructure/metrics";
import { errorMiddleware } from "./middleware";
import {
  createSubscriptionController,
  createSubscriptionRouter,
  createWeatherController,
  createWeatherRouter,
} from "@/modules";
import { getLogger } from "@logger/logger.factory";
import { FileLogger } from "@logger/file.logger";

export const app = express();

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else if (env.NODE_ENV === "production") {
  app.use(morgan("combined"));
}

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", async (_req, res) => {
  const db = getDb();

  const [dbStatus] = await Promise.all([
    db
      .$queryRawUnsafe("SELECT 1")
      .then(() => ({ status: "ok" }))
      .catch((e) => ({ status: "error", message: e.message })),
  ]);

  const isHealthy = dbStatus.status === "ok";

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "ok" : "error",
    uptime: process.uptime(),
    timestamp: Date.now(),
    checks: [{ name: "database", ...dbStatus }],
  });
});

const metricsService = MetricsFactory.create();
app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", metricsService.getContentType());
  res.end(await metricsService.getMetrics());
});

const weatherController = createWeatherController({
  db: getDb(),
  logger: new FileLogger(env.LOG_LEVEL, env.LOG_FILE_PATH),
  providersLogger: getLogger(),
  apiKey: env.WEATHER_API_KEY,
  metrics: metricsService,
});
const weatherRouter = createWeatherRouter(weatherController);

const subscriptionController = createSubscriptionController({
  logger: getLogger(),
  db: getDb(),
});
const subscriptionRouter = createSubscriptionRouter(subscriptionController);

app.use("/api", subscriptionRouter);
app.use("/api/weather", weatherRouter);

app.use(errorMiddleware);
