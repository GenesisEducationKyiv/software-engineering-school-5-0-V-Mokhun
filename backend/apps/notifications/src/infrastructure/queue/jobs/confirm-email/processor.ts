import { Job } from "bullmq";
import { JobProcessor } from "../../types";
import { ConfirmEmailJobData } from "@common/generated/proto/job_pb";
import {
  IEmailService,
  ISubscriptionRepository,
  IEmailLogRepository,
} from "@common/shared/ports";
import { ILogger } from "@logger/logger.interface";
import { Subscription } from "@prisma/client";

export class ConfirmEmailProcessor implements JobProcessor {
  constructor(
    private readonly emailService: IEmailService,
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly emailLogRepo: IEmailLogRepository,
    private readonly logger: ILogger
  ) {}

  async handle(job: Job<Uint8Array>) {
    const jobData = ConfirmEmailJobData.fromBinary(job.data);
    const { email, city, confirmToken } = jobData;
    let subscription: Subscription | null = null;
    let subscriptionLookedUp = false;

    try {
      await this.emailService.sendConfirmationEmail({
        to: email,
        city,
        confirmToken,
      });

      subscription = await this.subscriptionRepo.findSubscriptionByEmailAndCity(
        email,
        city
      );

      subscriptionLookedUp = true;

      if (!subscription) {
        throw new Error(
          "Subscription not found after sending confirmation email."
        );
      }

      await this.emailLogRepo.create({
        subscriptionId: subscription.id,
        type: "subscription_confirmation",
        status: "sent",
        sentAt: new Date(),
      });
    } catch (error) {
      if (!subscriptionLookedUp) {
        subscription =
          await this.subscriptionRepo.findSubscriptionByEmailAndCity(
            email,
            city
          );
      }

      if (subscription) {
        await this.emailLogRepo.create({
          subscriptionId: subscription.id,
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
