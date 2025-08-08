import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { getDb } from "@/db";
import {
  HttpMetricsServiceFactory,
  registryManager,
} from "./infrastructure/metrics";
import { createMetricsMiddleware, errorMiddleware } from "./middleware";
import Redis from "ioredis";
import { env } from "./config";
import morgan from "morgan";

const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
});

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
app.use(
  createMetricsMiddleware(
    HttpMetricsServiceFactory.create(registryManager.getRegistry())
  )
);

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

app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", registryManager.getContentType());
  res.end(await registryManager.getMetrics());
});

app.use(errorMiddleware);
