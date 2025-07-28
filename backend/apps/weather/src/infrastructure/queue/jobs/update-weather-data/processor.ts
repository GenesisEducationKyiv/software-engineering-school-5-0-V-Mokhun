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
import { getCallSites } from "util";

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
        this.logger.warn({
          message: `Skipping weather update for unconfirmed or non-existent subscription ID: ${subscriptionId}`,
          callSites: getCallSites(),
          meta: {
            subscriptionId,
          },
        });
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
      this.logger.error({
        message: `Error processing weather update for subscription ID: ${subscriptionId}`,
        callSites: getCallSites(),
        meta: {
          subscriptionId,
        },
        error: {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : undefined,
        },
      });
      throw error;
    }
  }

  completed(job: Job<Uint8Array>) {
    const jobData = UpdateWeatherDataJobData.fromBinary(job.data);
    const { subscriptionId } = jobData;
    this.logger.info({
      message: `Update weather data job completed for subscription ID: ${subscriptionId}`,
      callSites: getCallSites(),
      meta: {
        subscriptionId,
        jobId: job.id,
      },
    });
  }

  failed(job: Job<Uint8Array> | undefined, error: Error) {
    const jobData = job?.data
      ? UpdateWeatherDataJobData.fromBinary(job.data)
      : undefined;

    this.logger.error({
      message: `Update weather data job failed for subscription ID: ${jobData?.subscriptionId}`,
      callSites: getCallSites(),
      meta: {
        jobId: job?.id,
        subscriptionId: jobData?.subscriptionId,
      },
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
    });
  }
}
