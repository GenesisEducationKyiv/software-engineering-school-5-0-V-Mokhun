import { composeWorkers } from "./composition-root";
import { getDb } from "@/db";
import { createLogger } from "@logger/logger.factory";
import { MetricsFactory } from "../metrics";
import { env } from "@/config/env";

const logger = createLogger("notifications", env.NODE_ENV);
const db = getDb();
const metricsService = MetricsFactory.create();

export const workers = composeWorkers(db, logger, metricsService);
