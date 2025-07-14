import { env } from "@common/config";
import { IDatabase } from "@common/shared/ports";
import { ILogger } from "@logger/logger.interface";
import { createEmailService } from "@/infrastructure/email/email.factory";
import { EmailLogRepository } from "@common/infrastructure/repositories/email-log.repository";
import { SubscriptionRepository } from "@common/infrastructure/repositories/subscription.repository";
import { createWeatherProvider } from "@common/infrastructure/weather/weather.factory";
import {
  createConfirmEmailWorker,
  createSendWeatherUpdateEmailWorker,
  createUpdateWeatherDataWorker,
} from "./jobs";
import { createQueueService, createRootConfig } from "@common/infrastructure/queue";
import { WorkerConfig } from "./types";
import { QUEUE_TYPES } from "@common/constants";

export const composeWorkers = (db: IDatabase, logger: ILogger) => {
  const rootConnectionConfig = createRootConfig();

  const emailService = createEmailService({
    logger,
    apiKey: env.SENDGRID_API_KEY,
    fromEmail: env.SENDGRID_FROM_EMAIL,
  });
  const subscriptionRepo = new SubscriptionRepository(db);
  const emailLogRepo = new EmailLogRepository(db);
  const queueService = createQueueService({ logger, ...rootConnectionConfig });
  const weatherProvider = createWeatherProvider({
    logger,
    providersLogger: logger,
    weatherApiKey: env.WEATHER_API_KEY,
  });

  const confirmEmailWorkerConfig: WorkerConfig = {
    ...rootConnectionConfig,
    queueName: QUEUE_TYPES.CONFIRM_EMAIL,
    concurrency: 1,
  };
  const confirmEmailWorker = createConfirmEmailWorker(
    confirmEmailWorkerConfig,
    {
      emailService,
      subscriptionRepo,
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
      subscriptionRepo,
      emailLogRepo,
      logger,
    }
  );

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

  return [
    confirmEmailWorker,
    sendWeatherUpdateEmailWorker,
    updateWeatherDataWorker,
  ];
};
