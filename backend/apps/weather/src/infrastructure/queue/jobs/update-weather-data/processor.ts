import { Job } from "bullmq";
import { ISubscriptionRepository, IWeatherProvider } from "@/shared/ports";
import { ILogger } from "@logger/logger.interface";
import { JOB_TYPES, QUEUE_TYPES } from "@common/constants";
import {
  SendWeatherUpdateEmailJobData,
  UpdateWeatherDataJobData,
  WeatherData,
} from "@common/generated/proto/job_pb";
import { IQueueService } from "@common/shared/ports";

export class UpdateWeatherDataProcessor {
  constructor(
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly weatherProvider: IWeatherProvider,
    private readonly queueService: IQueueService,
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

      const { email, city, unsubscribeToken, id } = subscription;

      const weatherData = await this.weatherProvider.getWeatherData(city);
      const unsubscribeUrl = `/api/unsubscribe/${unsubscribeToken}`;

      const emailJobData = new SendWeatherUpdateEmailJobData({
        email,
        city,
        unsubscribeUrl,
        subscriptionId: id,
        weatherData: new WeatherData({ ...weatherData }),
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
    const { subscriptionId } = jobData;
    this.logger.info(
      `Update weather data job completed for subscription ID: ${subscriptionId}`,
      { jobId: job.id }
    );
  }

  failed(job: Job<Uint8Array> | undefined, error: Error) {
    const jobData = job?.data
      ? UpdateWeatherDataJobData.fromBinary(job.data)
      : undefined;

    this.logger.error(
      `Update weather data job failed for subscription ID: ${jobData?.subscriptionId}`,
      error,
      {
        jobId: job?.id,
        jobData,
      }
    );
  }
}
