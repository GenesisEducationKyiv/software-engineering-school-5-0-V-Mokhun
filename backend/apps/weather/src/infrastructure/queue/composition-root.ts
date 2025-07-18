import { SubscriptionRepository } from "@/infrastructure/repositories/subscription.repository";
import { createWeatherProvider } from "@/infrastructure/weather/weather.factory";
import { env } from "@common/config";
import { QUEUE_TYPES } from "@common/constants";
import {
  createQueueService,
  createRootConfig,
} from "@common/infrastructure/queue";
import { WorkerConfig } from "@common/infrastructure/queue/types";
import { IDatabase } from "@common/shared/ports";
import { ILogger } from "@logger/logger.interface";
import { createUpdateWeatherDataWorker } from "./jobs";

export const composeWorkers = (db: IDatabase, logger: ILogger) => {
  const rootConnectionConfig = createRootConfig();
  const queueService = createQueueService({ logger, ...rootConnectionConfig });
  const subscriptionRepo = new SubscriptionRepository(db);
  const weatherProvider = createWeatherProvider({
    logger,
    providersLogger: logger,
    weatherApiKey: env.WEATHER_API_KEY,
  });

  const updateWeatherDataWorkerConfig: WorkerConfig = {
    ...rootConnectionConfig,
    queueName: QUEUE_TYPES.UPDATE_WEATHER_DATA,
    concurrency: 1,
  };

  const updateWeatherDataWorker = createUpdateWeatherDataWorker(
    updateWeatherDataWorkerConfig,
    {
      queueService,
      subscriptionRepo,
      weatherProvider,
      logger,
    }
  );

  return [updateWeatherDataWorker];
};
