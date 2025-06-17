import { createWorker } from "../worker-factory";
import { QUEUE_TYPES, JOB_TYPES } from "../../constants";
import { UpdateWeatherDataProcessor } from "./processor";
import { WorkerConfig } from "../../types";
import { db } from "@/db";
import { SubscriptionRepository } from "@/infrastructure/repositories/subscription.repository";
import { getLogger } from "@/shared/logger/logger.factory";
import { createRootConfig } from "../../config";
import { createQueueService } from "../../queue.factory";
import { createWeatherProvider } from "@/infrastructure/weather/weather.factory";
import { env } from "@/config";

const config: WorkerConfig = {
  ...createRootConfig(),
  queueName: QUEUE_TYPES.UPDATE_WEATHER_DATA,
  concurrency: 1,
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
