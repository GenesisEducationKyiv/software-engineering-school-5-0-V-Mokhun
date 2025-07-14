import { JOB_TYPES } from "@common/constants";
import { ILogger } from "@logger/logger.interface";
import {
  IQueueService,
  ISubscriptionRepository,
  IWeatherProvider,
} from "@common/shared/ports";
import { WorkerConfig } from "../../types";
import { createWorker } from "../worker-factory";
import { UpdateWeatherDataProcessor } from "./processor";

export const createUpdateWeatherDataWorker = (
  config: WorkerConfig,
  dependencies: {
    queueService: IQueueService;
    subscriptionRepo: ISubscriptionRepository;
    weatherProvider: IWeatherProvider;
    logger: ILogger;
  }
) => {
  const processor = new UpdateWeatherDataProcessor(
    dependencies.queueService,
    dependencies.subscriptionRepo,
    dependencies.weatherProvider,
    dependencies.logger
  );

  return createWorker(
    config.queueName,
    config,
    processor,
    JOB_TYPES.UPDATE_WEATHER_DATA
  );
};
