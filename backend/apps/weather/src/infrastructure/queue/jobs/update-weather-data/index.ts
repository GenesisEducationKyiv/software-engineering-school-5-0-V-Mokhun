import { JOB_TYPES } from "@common/constants";
import { ILogger } from "@logger/logger.interface";
import {
  IQueueService,
  ISubscriptionRepository,
  IWeatherProvider,
} from "@common/shared/ports";
import { WorkerConfig } from "@common/infrastructure/queue/types";
import { createWorker } from "@common/infrastructure/queue/job-worker.factory";
import { UpdateWeatherDataProcessor } from "./processor";

export type UpdateWeatherDataDependencies = {
  logger: ILogger;
  queueService: IQueueService;
  subscriptionRepo: ISubscriptionRepository;
  weatherProvider: IWeatherProvider;
};

export const createUpdateWeatherDataWorker = (
  config: WorkerConfig,
  dependencies: UpdateWeatherDataDependencies
) => {
  const processor = new UpdateWeatherDataProcessor(
    dependencies.subscriptionRepo,
    dependencies.weatherProvider,
    dependencies.queueService,
    dependencies.logger
  );
  return createWorker(
    config.queueName,
    config,
    processor,
    JOB_TYPES.UPDATE_WEATHER_DATA
  );
};
