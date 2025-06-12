import { Job } from "bullmq";
import { JobProcessor } from "../../types";
import { SendWeatherUpdateEmailJobData } from "./send-weather-update-email.config";
import { sendEmail, weatherUpdateTemplate } from "@/infrastructure/email";
import { db } from "@/db";

export class SendWeatherUpdateEmailProcessor implements JobProcessor {
  async handle(job: Job<SendWeatherUpdateEmailJobData>) {
    const { email, city, unsubscribeToken, weatherData, subscriptionId } =
      job.data;

    if (
      !email ||
      !city ||
      !unsubscribeToken ||
      !subscriptionId ||
      !weatherData
    ) {
      console.error("Invalid job data", job.data);
      return;
    }

    try {
      const emailContent = weatherUpdateTemplate(
        city,
        weatherData,
        unsubscribeToken
      );

      await sendEmail(email, `Weather Update for ${city}`, emailContent);

      await db.emailLog.create({
        data: {
          subscriptionId,
          type: "weather_update",
          status: "sent",
          sentAt: new Date(),
        },
      });
      await db.subscription.update({
        where: { id: subscriptionId },
        data: { lastSentAt: new Date() },
      });
    } catch (error) {
      console.error("Failed to send weather update email", error);

      await db.emailLog.create({
        data: {
          subscriptionId,
          status: "failed",
          type: "weather_update",
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
          sentAt: new Date(),
        },
      });

      throw error;
    }
  }

  completed(job: Job) {
    console.log("Weather update email job completed", job.id);
  }

  failed(job: Job | undefined, error: Error) {
    console.error("Weather update email job failed", job?.id, error);
  }
}
