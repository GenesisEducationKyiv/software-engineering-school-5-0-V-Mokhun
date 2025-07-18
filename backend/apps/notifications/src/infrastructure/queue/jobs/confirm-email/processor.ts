import { Job } from "bullmq";
import { JobProcessor } from "@common/infrastructure/queue/types";
import { ConfirmEmailJobData } from "@common/generated/proto/job_pb";
import { IEmailService, IEmailLogRepository } from "@common/shared/ports";
import { ILogger } from "@logger/logger.interface";

export class ConfirmEmailProcessor implements JobProcessor {
  constructor(
    private readonly emailService: IEmailService,
    private readonly emailLogRepo: IEmailLogRepository,
    private readonly logger: ILogger
  ) {}

  async handle(job: Job<Uint8Array>) {
    const jobData = ConfirmEmailJobData.fromBinary(job.data);
    const { email, city, confirmToken, subscriptionId } = jobData;

    try {
      await this.emailService.sendConfirmationEmail({
        to: email,
        city,
        confirmToken,
      });

      if (!subscriptionId) {
        throw new Error(
          "Subscription ID not found in job data after sending confirmation email."
        );
      }

      await this.emailLogRepo.create({
        subscriptionId,
        type: "subscription_confirmation",
        status: "sent",
        sentAt: new Date(),
      });
    } catch (error) {
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
    }
  }

  completed(job: Job<Uint8Array>) {
    const jobData = ConfirmEmailJobData.fromBinary(job.data);
    this.logger.info("Confirm email job completed", {
      jobId: job.id,
      email: jobData.email,
    });
  }

  failed(job: Job<Uint8Array> | undefined, error: Error) {
    const jobData = job ? ConfirmEmailJobData.fromBinary(job.data) : undefined;
    this.logger.error("Confirm email job failed", error, {
      jobId: job?.id,
      jobData,
    });
  }
}
