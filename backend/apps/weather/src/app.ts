import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "@/config/env";
import { getDb } from "@/db";
import { MetricsFactory } from "./infrastructure/metrics";
import { errorMiddleware, metricsMiddleware } from "./middleware";
import {
  createSubscriptionController,
  createSubscriptionRouter,
  createWeatherController,
  createWeatherRouter,
} from "@/modules";
import { createLogger } from "@logger/logger.factory";
import Redis from "ioredis";

const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
});

const logger = createLogger("weather", env.NODE_ENV);

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
app.use(metricsMiddleware);

app.get("/health", async (_req, res) => {
  const db = getDb();

  const [dbStatus, redisStatus] = await Promise.all([
    db
      .$queryRawUnsafe("SELECT 1")
      .then(() => ({ status: "ok" }))
      .catch((e) => ({ status: "error", message: e.message })),
    redis
      .ping()
      .then((res) =>
        res === "PONG"
          ? { status: "ok" }
          : { status: "error", message: "Redis connection failed" }
      )
      .catch((e) => ({ status: "error", message: e.message })),
  ]);

  const isHealthy = dbStatus.status === "ok" && redisStatus.status === "ok";

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "ok" : "error",
    uptime: process.uptime(),
    timestamp: Date.now(),
    checks: [
      { name: "database", ...dbStatus },
      { name: "redis", ...redisStatus },
    ],
  });
});

const metricsService = MetricsFactory.create();
app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", metricsService.getContentType());
  res.end(await metricsService.getMetrics());
});

const weatherController = createWeatherController({
  db: getDb(),
  logger,
  apiKey: env.WEATHER_API_KEY,
  metricsService,
});
const weatherRouter = createWeatherRouter(weatherController);

const subscriptionController = createSubscriptionController({
  logger,
  db: getDb(),
  metricsService,
});
const subscriptionRouter = createSubscriptionRouter(subscriptionController);

app.use("/api", subscriptionRouter);
app.use("/api/weather", weatherRouter);

app.use(errorMiddleware);
