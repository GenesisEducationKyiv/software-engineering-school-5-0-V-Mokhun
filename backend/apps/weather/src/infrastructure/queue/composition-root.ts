import { env } from "@/config/env";
import { SubscriptionRepository } from "@/infrastructure/repositories/subscription.repository";
import { createWeatherProvider } from "@/infrastructure/weather/weather.factory";
import { IDatabase, IWeatherProviderMetricsService } from "@/shared/ports";
import { QUEUE_TYPES } from "@common/constants";
import { createQueueService } from "@common/infrastructure/queue";
import { WorkerConfig } from "@common/infrastructure/queue/types";
import { ILogger } from "@logger/logger.interface";
import { createRootConfig } from "./config";
import { createUpdateWeatherDataWorker } from "./jobs/update-weather-data";

export const composeWorkers = (
  db: IDatabase,
  logger: ILogger,
  weatherProviderMetricsService: IWeatherProviderMetricsService
) => {
  const rootConnectionConfig = createRootConfig({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  });
  const queueService = createQueueService({
    logger,
    connectionConfig: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
    },
  });
  const subscriptionRepo = new SubscriptionRepository(db);
  const weatherProvider = createWeatherProvider({
    logger,
    providersLogger: logger,
    weatherApiKey: env.WEATHER_API_KEY,
    metricsService: weatherProviderMetricsService,
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
