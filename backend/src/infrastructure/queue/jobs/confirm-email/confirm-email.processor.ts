import { Job } from "bullmq";
import { JobProcessor } from "../../types";
import { ConfirmEmailJobData } from "./confirm-email.config";
import { confirmEmailTemplate } from "@/infrastructure/email";
import { db } from "@/db";
import { IEmailService } from "@/shared/ports/email.port";
import { createEmailService } from "@/infrastructure/email/email.factory";

export class ConfirmEmailProcessor implements JobProcessor {
  private readonly emailService: IEmailService;

  // The Composition Root is now responsible for creating the email service.
  // We can call the factory directly here for simplicity, or have it passed in
  // if this processor were itself part of a larger factory.
  constructor() {
    this.emailService = createEmailService();
  }

  async handle(job: Job<ConfirmEmailJobData>) {
    const { email, city, confirmToken } = job.data;

    try {
      await this.emailService.send({
        to: email,
        subject: `Confirm your weather subscription for ${city}`,
        html: confirmEmailTemplate(city, confirmToken),
      });

      const subscription = await db.subscription.findFirst({
        where: { email, city },
      });

      if (!subscription) {
        throw new Error("Subscription not found after sending confirmation email.");
      }

      await db.emailLog.create({
        data: {
          subscriptionId: subscription.id,
          type: "subscription_confirmation",
          status: "sent",
          sentAt: new Date(),
        },
      });
    } catch (error) {
      const subscription = await db.subscription.findFirst({
        where: { email, city },
      });

      // Log the failure, but don't throw if the subscription is gone.
      if (!subscription) {
        console.error(
          "Failed to log email failure as subscription was not found.",
          { email, city, error }
        );
        throw error;
      }

      console.error("Failed to send confirm email", error);
      await db.emailLog.create({
        data: {
          subscriptionId: subscription.id,
          status: "failed",
          type: "subscription_confirmation",
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
          sentAt: new Date(),
        },
      });

      throw error;
    }
  }

  completed(job: Job) {
    console.log("Confirm email job completed", job.id);
  }

  failed(job: Job | undefined, error: Error) {
    console.error("Confirm email job failed", job?.id, error);
  }
}
