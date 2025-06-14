import { Job } from "bullmq";
import { JobProcessor } from "../../types";
import { SendWeatherUpdateEmailJobData } from "./types";
import { weatherUpdateTemplate } from "../../../email";
import {
  IEmailService,
  ISubscriptionRepository,
  IEmailLogRepository,
} from "@/shared/ports";
import { ILogger } from "@/shared/logger/logger.interface";

export class SendWeatherUpdateEmailProcessor
  implements JobProcessor<SendWeatherUpdateEmailJobData>
{
  constructor(
    private readonly emailService: IEmailService,
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly emailLogRepo: IEmailLogRepository,
    private readonly logger: ILogger
  ) {}

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
      return;
    }

    try {
      const emailContent = weatherUpdateTemplate(
        city,
        weatherData,
        unsubscribeToken
      );

      await this.emailService.send({
        to: email,
        subject: `Weather Update for ${city}`,
        html: emailContent,
      });

      await this.emailLogRepo.create({
        subscriptionId,
        type: "weather_update",
        status: "sent",
        sentAt: new Date(),
      });
      await this.subscriptionRepo.updateLastSentAt(subscriptionId, new Date());
    } catch (error) {
      await this.emailLogRepo.create({
        subscriptionId,
        status: "failed",
        type: "weather_update",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        sentAt: new Date(),
      });

      throw error;
    }
  }

  completed(job: Job<SendWeatherUpdateEmailJobData>) {
    this.logger.info("Weather update email job completed", { jobId: job.id });
  }

  failed(job: Job<SendWeatherUpdateEmailJobData> | undefined, error: Error) {
    this.logger.error("Weather update email job failed", error, {
      jobId: job?.id,
    });
  }
}
