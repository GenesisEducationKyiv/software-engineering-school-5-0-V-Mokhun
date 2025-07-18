import { JOB_TYPES } from "@common/constants";
import { ILogger } from "@logger/logger.interface";
import {
  IEmailService,
  IEmailLogRepository,
} from "@common/shared/ports";
import { WorkerConfig } from "@common/infrastructure/queue/types";
import { createWorker } from "@common/infrastructure/queue/job-worker.factory";
import { SendWeatherUpdateEmailProcessor } from "./processor";

export type SendWeatherUpdateEmailDependencies = {
  logger: ILogger;
  emailService: IEmailService;
  emailLogRepo: IEmailLogRepository;
};

export const createSendWeatherUpdateEmailWorker = (
  config: WorkerConfig,
  dependencies: SendWeatherUpdateEmailDependencies,
) => {
  const processor = new SendWeatherUpdateEmailProcessor(
    dependencies.emailService,
    dependencies.emailLogRepo,
    dependencies.logger,
  );
  return createWorker(
    config.queueName,
    config,
    processor,
    JOB_TYPES.SEND_WEATHER_UPDATE_EMAIL,
  );
};
