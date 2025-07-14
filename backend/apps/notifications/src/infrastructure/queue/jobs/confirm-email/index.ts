import { JOB_TYPES } from "@common/constants";
import { ILogger } from "@logger/logger.interface";
import {
  IEmailService,
  IEmailLogRepository,
  ISubscriptionRepository,
} from "@common/shared/ports";
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
