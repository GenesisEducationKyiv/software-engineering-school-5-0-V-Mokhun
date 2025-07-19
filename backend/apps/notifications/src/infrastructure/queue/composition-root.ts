import { env } from "@/config/env";
import { ILogger } from "@logger/logger.interface";
import { QUEUE_TYPES } from "@common/constants";
import { IDatabase } from "@common/shared/ports";
import { createEmailService } from "@/infrastructure/email/email.factory";
import { EmailLogRepository } from "@/infrastructure/repositories/email-log.repository";
import {
  createConfirmEmailWorker,
  createSendWeatherUpdateEmailWorker,
} from "./jobs";
import { WorkerConfig } from "@common/infrastructure/queue/types";
import { createRootConfig } from "./config";

export const composeWorkers = (db: IDatabase, logger: ILogger) => {
  const rootConnectionConfig = createRootConfig();

  const emailService = createEmailService({
    logger,
    apiKey: env.SENDGRID_API_KEY,
    fromEmail: env.SENDGRID_FROM_EMAIL,
  });
  const emailLogRepo = new EmailLogRepository(db);

  const confirmEmailWorkerConfig: WorkerConfig = {
    ...rootConnectionConfig,
    queueName: QUEUE_TYPES.CONFIRM_EMAIL,
    concurrency: 1,
  };
  const confirmEmailWorker = createConfirmEmailWorker(
    confirmEmailWorkerConfig,
    {
      emailService,
      emailLogRepo,
      logger,
    }
  );

  const sendWeatherUpdateEmailWorkerConfig: WorkerConfig = {
    ...rootConnectionConfig,
    queueName: QUEUE_TYPES.SEND_WEATHER_UPDATE_EMAIL,
    concurrency: 1,
  };
  const sendWeatherUpdateEmailWorker = createSendWeatherUpdateEmailWorker(
    sendWeatherUpdateEmailWorkerConfig,
    {
      emailService,
      emailLogRepo,
      logger,
    }
  );

  return [confirmEmailWorker, sendWeatherUpdateEmailWorker];
};
