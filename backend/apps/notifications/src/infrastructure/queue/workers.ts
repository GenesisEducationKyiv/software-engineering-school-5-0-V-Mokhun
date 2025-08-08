import { env } from "@/config/env";
import { getDb } from "@/db";
import { createLogger } from "@logger/logger.factory";
import { EmailMetricsServiceFactory, JobMetricsServiceFactory, registryManager } from "../metrics";
import { composeWorkers } from "./composition-root";

const logger = createLogger({
  serviceName: "notifications",
  env: env.NODE_ENV,
  lokiHost: env.LOKI_HOST,
});
const db = getDb();
const jobMetricsService = JobMetricsServiceFactory.create(registryManager.getRegistry());
const emailMetricsService = EmailMetricsServiceFactory.create(registryManager.getRegistry());

export const workers = composeWorkers(db, logger, jobMetricsService, emailMetricsService);
