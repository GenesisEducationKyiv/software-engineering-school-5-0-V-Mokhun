import { Job } from "bullmq";
import { IQueueService, ISubscriptionRepository } from "@/shared/ports";
import { JOB_TYPES, QUEUE_TYPES } from "../../constants";
import { JobProcessor } from "../../types";
import { UpdateWeatherDataJobData } from "./types";
import { IWeatherProvider } from "@/shared/ports";
import { ILogger } from "@/shared/logger/logger.interface";

export class UpdateWeatherDataProcessor
  implements JobProcessor<UpdateWeatherDataJobData>
{
  constructor(
    private readonly queueService: IQueueService,
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly weatherProvider: IWeatherProvider,
    private readonly logger: ILogger
  ) {}

  async handle(job: Job<UpdateWeatherDataJobData>) {
    const { subscriptionId } = job.data;
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

      await this.queueService.add(
        QUEUE_TYPES.SEND_WEATHER_UPDATE_EMAIL,
        JOB_TYPES.SEND_WEATHER_UPDATE_EMAIL,
        {
          email,
          city,
          unsubscribeToken,
          weatherData,
          subscriptionId,
        }
      );
    } catch (error) {
      this.logger.error(
        `Error processing weather update for subscription ID: ${subscriptionId}`,
        error as Error
      );
      throw error;
    }
  }

  completed(job: Job<UpdateWeatherDataJobData>) {
    this.logger.info(
      `Weather data update job completed for sub ${job.data.subscriptionId}`
    );
  }

  failed(job: Job<UpdateWeatherDataJobData> | undefined, error: Error) {
    this.logger.error(
      `Weather data update job failed for sub ${job?.data.subscriptionId}`,
      error,
      {
        jobId: job?.id,
        jobData: job?.data,
      }
    );
  }
}
