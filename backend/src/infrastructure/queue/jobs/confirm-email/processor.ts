import { Job } from "bullmq";
import { JobProcessor } from "../../types";
import { ConfirmEmailJobData } from "./types";
import { confirmEmailTemplate } from "../../../email";
import {
  IEmailService,
  ISubscriptionRepository,
  IEmailLogRepository,
} from "@/shared/ports";
import { ILogger } from "@/shared/logger/logger.interface";
import { Subscription } from "@prisma/client";

export class ConfirmEmailProcessor
  implements JobProcessor<ConfirmEmailJobData>
{
  constructor(
    private readonly emailService: IEmailService,
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly emailLogRepo: IEmailLogRepository,
    private readonly logger: ILogger
  ) {}

  async handle(job: Job<ConfirmEmailJobData>) {
    const { email, city, confirmToken } = job.data;
    let subscription: Subscription | null = null;
    let subscriptionLookedUp = false;

    try {
      await this.emailService.send({
        to: email,
        subject: `Confirm your weather subscription for ${city}`,
        html: confirmEmailTemplate(city, confirmToken),
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

  completed(job: Job<ConfirmEmailJobData>) {
    this.logger.info("Confirm email job completed", { jobId: job.id });
  }

  failed(job: Job<ConfirmEmailJobData> | undefined, error: Error) {
    this.logger.error("Confirm email job failed", error, {
      jobId: job?.id,
      jobData: job?.data,
    });
  }
}
