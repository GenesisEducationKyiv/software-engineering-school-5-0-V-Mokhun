import { createWorker } from "../worker-factory";
import { rootConfig } from "../../config";
import { QUEUE_TYPES, JOB_TYPES } from "../../constants";
import { SendWeatherUpdateEmailProcessor } from "./processor";
import { WorkerConfig } from "../../types";
import { db } from "@/db";
import { createEmailService } from "../../../email/email.factory";
import { SubscriptionRepository } from "@/infrastructure/repositories/subscription.repository";
import { EmailLogRepository } from "@/infrastructure/repositories/email-log.repository";
import { getLogger } from "@/shared/logger/logger.factory";
import { env } from "@/config";

const config: WorkerConfig = {
  ...rootConfig,
  queueName: QUEUE_TYPES.SEND_WEATHER_UPDATE_EMAIL,
  concurrency: 5,
};

const logger = getLogger();
const emailService = createEmailService({
  logger,
  apiKey: env.SENDGRID_API_KEY,
  fromEmail: env.SENDGRID_FROM_EMAIL,
});
const subscriptionRepo = new SubscriptionRepository(db);
const emailLogRepo = new EmailLogRepository(db);

const processor = new SendWeatherUpdateEmailProcessor(
  emailService,
  subscriptionRepo,
  emailLogRepo,
  logger
);

export const SendWeatherUpdateEmailWorker = createWorker(
  config.queueName,
  config,
  processor,
  JOB_TYPES.SEND_WEATHER_UPDATE_EMAIL
);

export * from "./types";
