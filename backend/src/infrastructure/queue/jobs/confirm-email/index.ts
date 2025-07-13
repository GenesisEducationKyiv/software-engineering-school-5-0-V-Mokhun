import { JOB_TYPES } from "@/constants";
import { ILogger } from "@/shared/logger";
import {
  IEmailService,
  IEmailLogRepository,
  ISubscriptionRepository,
} from "@/shared/ports";
import { WorkerConfig } from "../../types";
import { createWorker } from "../worker-factory";
import { ConfirmEmailProcessor } from "./processor";

export const createConfirmEmailWorker = (
  config: WorkerConfig,
  dependencies: {
    emailService: IEmailService;
    subscriptionRepo: ISubscriptionRepository;
    emailLogRepo: IEmailLogRepository;
    logger: ILogger;
  }
) => {
  const processor = new ConfirmEmailProcessor(
    dependencies.emailService,
    dependencies.subscriptionRepo,
    dependencies.emailLogRepo,
    dependencies.logger
  );

  return createWorker(
    config.queueName,
    config,
    processor,
    JOB_TYPES.CONFIRM_EMAIL
  );
};

export * from "./types";
