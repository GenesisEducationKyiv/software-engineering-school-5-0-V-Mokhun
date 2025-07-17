import { Job } from "bullmq";
import { IQueueService, ISubscriptionRepository } from "@common/shared/ports";
import { JOB_TYPES, QUEUE_TYPES } from "@common/constants";
import { JobProcessor } from "../../types";
import {
  UpdateWeatherDataJobData,
  WeatherData,
  SendWeatherUpdateEmailJobData,
} from "@common/generated/proto/job_pb";
import { IWeatherProvider } from "@common/shared/ports";
import { ILogger } from "@logger/logger.interface";

export class UpdateWeatherDataProcessor implements JobProcessor {
  constructor(
    private readonly queueService: IQueueService,
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly weatherProvider: IWeatherProvider,
    private readonly logger: ILogger
  ) {}

  async handle(job: Job<Uint8Array>) {
    const jobData = UpdateWeatherDataJobData.fromBinary(job.data);
    const { subscriptionId } = jobData;
    try {
      const subscription = await this.subscriptionRepo.findById(subscriptionId);

      if (!subscription?.confirmed) {
        this.logger.warn(
          `Skipping weather update for unconfirmed or non-existent subscription ID: ${subscriptionId}`
        );
        return;
      }

      const { email, city, unsubscribeToken } = subscription;

      const weatherData = await this.weatherProvider.getWeatherData(city);

      const emailJobData = new SendWeatherUpdateEmailJobData({
        email,
        city,
        unsubscribeToken,
        subscriptionId,
        weatherData: new WeatherData(weatherData),
      });

      await this.queueService.add(
        QUEUE_TYPES.SEND_WEATHER_UPDATE_EMAIL,
        JOB_TYPES.SEND_WEATHER_UPDATE_EMAIL,
        Buffer.from(emailJobData.toBinary())
      );
    } catch (error) {
      this.logger.error(
        `Error processing weather update for subscription ID: ${subscriptionId}`,
        error as Error
      );
      throw error;
    }
  }

  completed(job: Job<Uint8Array>) {
    const jobData = UpdateWeatherDataJobData.fromBinary(job.data);
    this.logger.info(
      `Weather data update job completed for sub ${jobData.subscriptionId}`
    );
  }

  failed(job: Job<Uint8Array> | undefined, error: Error) {
    const jobData = job
      ? UpdateWeatherDataJobData.fromBinary(job.data)
      : undefined;
    this.logger.error(
      `Weather data update job failed for sub ${jobData?.subscriptionId}`,
      error,
      {
        jobId: job?.id,
        jobData,
      }
    );
  }
}
