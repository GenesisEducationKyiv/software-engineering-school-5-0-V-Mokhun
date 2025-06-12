import { Job } from "bullmq";
import { JobProcessor } from "../../types";
import { ConfirmEmailJobData } from "./confirm-email.config";
import { confirmEmailTemplate, sendEmail } from "@/infrastructure/email";
import { db } from "@/db";

export class ConfirmEmailProcessor implements JobProcessor {
  async handle(job: Job<ConfirmEmailJobData>) {
    const { email, city, confirmToken } = job.data;

    try {
      await sendEmail(
        email,
        `Confirm your weather subscription for ${city}`,
        confirmEmailTemplate(city, confirmToken)
      );

      const subscription = await db.subscription.findFirst({
        where: { email, city },
      });

      if (!subscription) {
        throw new Error("Subscription not found");
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

      if (!subscription) {
        throw new Error("Subscription not found");
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
