import {
  IEmailLogRepository,
  IEmailService,
  IJobMetricsService
} from "@/shared/ports";
import { JOB_TYPES } from "@common/constants";
import { createWorker } from "@common/infrastructure/queue/job-worker.factory";
import { WorkerConfig } from "@common/infrastructure/queue/types";
import { ILogger } from "@logger/logger.interface";
import { SendWeatherUpdateEmailProcessor } from "./processor";

export type SendWeatherUpdateEmailDependencies = {
  logger: ILogger;
  emailService: IEmailService;
  emailLogRepo: IEmailLogRepository;
  metricsService: IJobMetricsService;
};

export const createSendWeatherUpdateEmailWorker = (
  config: WorkerConfig,
  dependencies: SendWeatherUpdateEmailDependencies,
) => {
  const processor = new SendWeatherUpdateEmailProcessor(
    dependencies.emailService,
    dependencies.emailLogRepo,
    dependencies.logger,
    dependencies.metricsService,
  );
  return createWorker(
    config.queueName,
    config,
    processor,
    JOB_TYPES.SEND_WEATHER_UPDATE_EMAIL,
  );
};
