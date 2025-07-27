import { Job } from "bullmq";
import { JobProcessor } from "@common/infrastructure/queue/types";
import { SendWeatherUpdateEmailJobData } from "@common/generated/proto/job_pb";
import {
  IEmailService,
  IEmailLogRepository,
  IMetricsService,
} from "@/shared/ports";
import { ILogger } from "@logger/logger.interface";
import { JOB_TYPES } from "@common/constants";

export class SendWeatherUpdateEmailProcessor implements JobProcessor {
  constructor(
    private readonly emailService: IEmailService,
    private readonly emailLogRepo: IEmailLogRepository,
    private readonly logger: ILogger,
    private readonly metricsService: IMetricsService
  ) {}

  async handle(job: Job<Uint8Array>) {
    this.metricsService.incrementJobEnqueuedCount(
      JOB_TYPES.SEND_WEATHER_UPDATE_EMAIL
    );
    const end = this.metricsService.recordJobProcessingDuration(
      JOB_TYPES.SEND_WEATHER_UPDATE_EMAIL
    );
    const jobData = SendWeatherUpdateEmailJobData.fromBinary(job.data);
    const { email, city, unsubscribeUrl, weatherData, subscriptionId } =
      jobData;

    if (!email || !city || !unsubscribeUrl || !subscriptionId || !weatherData) {
      this.logger.warn("Skipping job due to missing data", { jobId: job.id });
      return;
    }

    try {
      await this.emailService.sendWeatherUpdateEmail({
        to: email,
        city,
        weatherData,
        unsubscribeUrl,
      });

      await this.emailLogRepo.create({
        subscriptionId,
        type: "weather_update",
        status: "sent",
        sentAt: new Date(),
      });

      this.metricsService.incrementJobProcessedCount(
        JOB_TYPES.SEND_WEATHER_UPDATE_EMAIL
      );
    } catch (error) {
      this.metricsService.incrementJobFailedCount(
        JOB_TYPES.SEND_WEATHER_UPDATE_EMAIL
      );
      await this.emailLogRepo.create({
        subscriptionId,
        status: "failed",
        type: "weather_update",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        sentAt: new Date(),
      });

      throw error;
    } finally {
      end();
    }
  }

  completed(job: Job<Uint8Array>) {
    const jobData = SendWeatherUpdateEmailJobData.fromBinary(job.data);
    this.logger.info("Send weather update email job completed", {
      jobId: job.id,
      email: jobData.email,
    });
  }

  failed(job: Job<Uint8Array> | undefined, error: Error) {
    const jobData = job
      ? SendWeatherUpdateEmailJobData.fromBinary(job.data)
      : undefined;
    this.logger.error("Send weather update email job failed", error, {
      jobId: job?.id,
      jobData,
    });
  }
}
