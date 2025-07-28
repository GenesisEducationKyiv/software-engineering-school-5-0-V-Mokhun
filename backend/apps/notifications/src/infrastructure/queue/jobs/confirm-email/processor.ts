import { Job } from "bullmq";
import { JobProcessor } from "@common/infrastructure/queue/types";
import { ConfirmEmailJobData } from "@common/generated/proto/job_pb";
import {
  IEmailService,
  IEmailLogRepository,
  IMetricsService,
} from "@/shared/ports";
import { ILogger } from "@logger/logger.interface";
import { JOB_TYPES } from "@common/constants";
import { getCallSites } from "util";

export class ConfirmEmailProcessor implements JobProcessor {
  constructor(
    private readonly emailService: IEmailService,
    private readonly emailLogRepo: IEmailLogRepository,
    private readonly logger: ILogger,
    private readonly metricsService: IMetricsService
  ) {}

  async handle(job: Job<Uint8Array>) {
    this.metricsService.incrementJobEnqueuedCount(JOB_TYPES.CONFIRM_EMAIL);
    const end = this.metricsService.recordJobProcessingDuration(
      JOB_TYPES.CONFIRM_EMAIL
    );
    const jobData = ConfirmEmailJobData.fromBinary(job.data);
    const { email, city, confirmUrl, subscriptionId } = jobData;

    try {
      await this.emailService.sendConfirmationEmail({
        to: email,
        city,
        confirmUrl,
      });

      await this.emailLogRepo.create({
        subscriptionId,
        type: "subscription_confirmation",
        status: "sent",
        sentAt: new Date(),
      });
      this.metricsService.incrementJobProcessedCount(JOB_TYPES.CONFIRM_EMAIL);
    } catch (error) {
      this.metricsService.incrementJobFailedCount(JOB_TYPES.CONFIRM_EMAIL);
      if (subscriptionId) {
        await this.emailLogRepo.create({
          subscriptionId,
          status: "failed",
          type: "subscription_confirmation",
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
          sentAt: new Date(),
        });
      }
      throw error;
    } finally {
      end();
    }
  }

  completed(job: Job<Uint8Array>) {
    const jobData = ConfirmEmailJobData.fromBinary(job.data);
    this.logger.info({
      message: "Confirm email job completed",
      callSites: getCallSites(),
      meta: {
        jobId: job.id,
        email: jobData.email,
      },
    });
  }

  failed(job: Job<Uint8Array> | undefined, error: Error) {
    const jobData = job ? ConfirmEmailJobData.fromBinary(job.data) : undefined;
    this.logger.error({
      message: "Confirm email job failed",
      callSites: getCallSites(),
      meta: {
        jobId: job?.id,
        jobData,
      },
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
    });
  }
}
