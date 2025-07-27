import { composeWorkers } from "./composition-root";
import { getDb } from "@/db";
import { getLogger } from "@logger/logger.factory";
import { MetricsFactory } from "../metrics";

const logger = getLogger();
const db = getDb();
const metricsService = MetricsFactory.create();

export const workers = composeWorkers(db, logger, metricsService);
