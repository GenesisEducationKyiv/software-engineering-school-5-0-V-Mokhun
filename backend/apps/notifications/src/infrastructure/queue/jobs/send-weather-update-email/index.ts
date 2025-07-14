import { JOB_TYPES } from "@common/constants";
import { ILogger } from "@logger/logger.interface";
import {
  IEmailService,
  IEmailLogRepository,
  ISubscriptionRepository,
} from "@common/shared/ports";
import { WorkerConfig } from "../../types";
import { createWorker } from "../worker-factory";
import { SendWeatherUpdateEmailProcessor } from "./processor";

export const createSendWeatherUpdateEmailWorker = (
  config: WorkerConfig,
  dependencies: {
    emailService: IEmailService;
    subscriptionRepo: ISubscriptionRepository;
    emailLogRepo: IEmailLogRepository;
    logger: ILogger;
  }
) => {
  const processor = new SendWeatherUpdateEmailProcessor(
    dependencies.emailService,
    dependencies.subscriptionRepo,
    dependencies.emailLogRepo,
    dependencies.logger
  );

  return createWorker(
    config.queueName,
    config,
    processor,
    JOB_TYPES.SEND_WEATHER_UPDATE_EMAIL
  );
};
