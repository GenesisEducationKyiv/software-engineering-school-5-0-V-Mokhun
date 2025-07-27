import { composeWorkers } from "./composition-root";
import { getDb } from "@/db";
import { createLogger } from "@logger/logger.factory";
import { MetricsFactory } from "../metrics";
import { env } from "@/config/env";

const logger = createLogger({
  serviceName: "weather",
  env: env.NODE_ENV,
  lokiHost: env.LOKI_HOST,
});
const db = getDb();
const metricsService = MetricsFactory.create();

export const workers = composeWorkers(db, logger, metricsService);
