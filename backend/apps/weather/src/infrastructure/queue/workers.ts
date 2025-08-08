import { composeWorkers } from "./composition-root";
import { getDb } from "@/db";
import { createLogger } from "@logger/logger.factory";
import { env } from "@/config/env";
import {
  registryManager,
  WeatherProviderMetricsServiceFactory,
} from "../metrics";

const logger = createLogger({
  serviceName: "weather",
  env: env.NODE_ENV,
  lokiHost: env.LOKI_HOST,
});
const db = getDb();
const weatherProviderMetricsService =
  WeatherProviderMetricsServiceFactory.create(registryManager.getRegistry());

export const workers = composeWorkers(
  db,
  logger,
  weatherProviderMetricsService
);
