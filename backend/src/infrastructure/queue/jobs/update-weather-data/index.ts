import { JOB_TYPES } from "@/constants";
import { ILogger } from "@/shared/logger";
import {
  IQueueService,
  ISubscriptionRepository,
  IWeatherProvider,
} from "@/shared/ports";
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

export * from "./types";
