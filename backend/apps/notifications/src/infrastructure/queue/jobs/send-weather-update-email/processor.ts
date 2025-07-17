import { Job } from "bullmq";
import { JobProcessor } from "../../types";
import {
  SendWeatherUpdateEmailJobData,
  WeatherData,
} from "@common/generated/proto/job_pb";
import {
  IEmailService,
  ISubscriptionRepository,
  IEmailLogRepository,
} from "@common/shared/ports";
import { ILogger } from "@logger/logger.interface";

export class SendWeatherUpdateEmailProcessor implements JobProcessor {
  constructor(
    private readonly emailService: IEmailService,
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly emailLogRepo: IEmailLogRepository,
    private readonly logger: ILogger
  ) {}

  async handle(job: Job<Uint8Array>) {
    const jobData = SendWeatherUpdateEmailJobData.fromBinary(job.data);
    const { email, city, unsubscribeToken, weatherData, subscriptionId } =
      jobData;

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
      await this.emailService.sendWeatherUpdateEmail({
        to: email,
        city,
        weatherData,
        unsubscribeToken,
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

  completed(job: Job<Uint8Array>) {
    this.logger.info("Weather update email job completed", { jobId: job.id });
  }

  failed(job: Job<Uint8Array> | undefined, error: Error) {
    const jobData = job
      ? SendWeatherUpdateEmailJobData.fromBinary(job.data)
      : undefined;
    this.logger.error("Weather update email job failed", error, {
      jobId: job?.id,
      jobData,
    });
  }
}
