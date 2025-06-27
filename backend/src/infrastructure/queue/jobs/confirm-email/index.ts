import { createWorker } from "../worker-factory";
import { QUEUE_TYPES, JOB_TYPES } from "../../constants";
import { ConfirmEmailProcessor } from "./processor";
import { WorkerConfig } from "../../types";
import { createEmailService } from "@/infrastructure/email/email.factory";
import { db } from "@/db";
import { EmailLogRepository } from "@/infrastructure/repositories/email-log.repository";
import { SubscriptionRepository } from "@/infrastructure/repositories/subscription.repository";
import { getLogger } from "@/shared/logger/logger.factory";
import { env } from "@/config";
import { createRootConfig } from "../../config";

const config: WorkerConfig = {
  ...createRootConfig(),
  queueName: QUEUE_TYPES.CONFIRM_EMAIL,
  concurrency: 1,
};

const logger = getLogger();
const emailService = createEmailService({
  logger,
  apiKey: env.SENDGRID_API_KEY,
  fromEmail: env.SENDGRID_FROM_EMAIL,
});
const subscriptionRepo = new SubscriptionRepository(db);
const emailLogRepo = new EmailLogRepository(db);

const processor = new ConfirmEmailProcessor(
  emailService,
  subscriptionRepo,
  emailLogRepo,
  logger
);

export const ConfirmEmailWorker = createWorker(
  config.queueName,
  config,
  processor,
  JOB_TYPES.CONFIRM_EMAIL
);

export * from "./types";
