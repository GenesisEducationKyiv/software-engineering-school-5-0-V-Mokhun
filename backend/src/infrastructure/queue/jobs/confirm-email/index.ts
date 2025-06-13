import { createWorker } from "../worker-factory";
import { rootConfig } from "../../config";
import { QUEUE_TYPES, JOB_TYPES } from "../../constants";
import { ConfirmEmailProcessor } from "./processor";
import { WorkerConfig } from "../../types";
import { createEmailService } from "../../../email/email.factory";
import { db } from "@/db";
import { EmailLogRepository } from "@/infrastructure/repositories/email-log.repository";
import { SubscriptionRepository } from "@/infrastructure/repositories/subscription.repository";
import { getLogger } from "@/shared/logger/logger.factory";

const config: WorkerConfig = {
  ...rootConfig,
  queueName: QUEUE_TYPES.CONFIRM_EMAIL,
  concurrency: 1,
};

const emailService = createEmailService();
const subscriptionRepo = new SubscriptionRepository(db);
const emailLogRepo = new EmailLogRepository(db);
const logger = getLogger();

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
