import { JOB_TYPES } from "@common/constants";
import { ILogger } from "@logger/logger.interface";
import { ISubscriptionRepository, IWeatherProvider } from "@/shared/ports";
import { WorkerConfig } from "@common/infrastructure/queue/types";
import { createWorker } from "@common/infrastructure/queue/job-worker.factory";
import { UpdateWeatherDataProcessor } from "./processor";
import { IQueueService } from "@common/shared/ports";

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
