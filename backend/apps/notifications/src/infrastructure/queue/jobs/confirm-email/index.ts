import { JOB_TYPES } from "@common/constants";
import { ILogger } from "@logger/logger.interface";
import {
  IEmailService,
  IEmailLogRepository,
  IMetricsService,
} from "@/shared/ports";
import { WorkerConfig } from "@common/infrastructure/queue/types";
import { createWorker } from "@common/infrastructure/queue/job-worker.factory";
import { ConfirmEmailProcessor } from "./processor";

export type ConfirmEmailDependencies = {
  logger: ILogger;
  emailService: IEmailService;
  emailLogRepo: IEmailLogRepository;
  metricsService: IMetricsService;
};

export const createConfirmEmailWorker = (
  config: WorkerConfig,
  dependencies: ConfirmEmailDependencies,
) => {
  const processor = new ConfirmEmailProcessor(
    dependencies.emailService,
    dependencies.emailLogRepo,
    dependencies.logger,
    dependencies.metricsService,
  );
  return createWorker(
    config.queueName,
    config,
    processor,
    JOB_TYPES.CONFIRM_EMAIL,
  );
};
