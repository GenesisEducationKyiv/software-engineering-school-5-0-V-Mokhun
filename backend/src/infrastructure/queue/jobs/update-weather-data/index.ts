import { env } from "@/config";
import { db } from "@/db";
import { SubscriptionRepository } from "@/infrastructure/repositories/subscription.repository";
import { createWeatherProvider } from "@/infrastructure/weather/weather.factory";
import { FileLogger, getLogger } from "@/shared/logger";
import { createRootConfig } from "../../config";
import { JOB_TYPES, QUEUE_TYPES } from "../../constants";
import { createQueueService } from "../../queue.factory";
import { WorkerConfig } from "../../types";
import { createWorker } from "../worker-factory";
import { UpdateWeatherDataProcessor } from "./processor";

const config: WorkerConfig = {
  ...createRootConfig(),
  queueName: QUEUE_TYPES.UPDATE_WEATHER_DATA,
  concurrency: 1,
};

const logger = new FileLogger(env.LOG_FILE_PATH);

const queueService = createQueueService({ logger });
const subscriptionRepo = new SubscriptionRepository(db);
const weatherProvider = createWeatherProvider({
  logger,
  providersLogger: getLogger(),
  weatherApiKey: env.WEATHER_API_KEY,
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
