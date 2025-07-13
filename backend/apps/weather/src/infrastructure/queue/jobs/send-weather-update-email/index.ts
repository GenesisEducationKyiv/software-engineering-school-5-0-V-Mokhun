import { JOB_TYPES } from "@/constants";
import { ILogger } from "@/shared/logger";
import {
  IEmailService,
  IEmailLogRepository,
  ISubscriptionRepository,
} from "@/shared/ports";
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

export * from "./types";
