import { createWorker } from "../worker-factory";
import { rootConfig } from "../../config";
import { QUEUE_TYPES, JOB_TYPES } from "../../constants";
import { UpdateWeatherDataProcessor } from "./processor";
import { WorkerConfig } from "../../types";
import { createQueueService } from "../../queue.factory";
import { SubscriptionRepository } from "@/infrastructure/repositories/subscription.repository";
import { db } from "@/db";
import { createWeatherProvider } from "@/infrastructure/weather/weather.factory";
import { getLogger } from "@/shared/logger/logger.factory";
import { env } from "@/config";

const config: WorkerConfig = {
  ...rootConfig,
  queueName: QUEUE_TYPES.UPDATE_WEATHER_DATA,
};

const logger = getLogger();

const queueService = createQueueService({ logger });
const subscriptionRepo = new SubscriptionRepository(db);
const weatherProvider = createWeatherProvider({
  logger,
  apiKey: env.WEATHER_API_KEY,
});

const processor = new UpdateWeatherDataProcessor(
  queueService,
  subscriptionRepo,
  weatherProvider,
  logger
);

export const UpdateWeatherDataWorker = createWorker(
  config.queueName,
  config,
  processor,
  JOB_TYPES.UPDATE_WEATHER_DATA
);

export * from "./types";
