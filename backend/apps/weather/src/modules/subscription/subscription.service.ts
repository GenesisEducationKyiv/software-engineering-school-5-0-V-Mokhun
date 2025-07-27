import { env } from "@/config/env";
import {
  FREQUENCY_TO_CRON,
  SUBSCRIPTION_CONFIRMATION_EXPIRATION_TIME,
} from "@/constants";
import { IMetricsService, ISubscriptionRepository } from "@/shared/ports";
import { JOB_TYPES, QUEUE_TYPES } from "@common/constants";
import {
  ConfirmEmailJobData,
  UpdateWeatherDataJobData,
} from "@common/generated/proto/job_pb";
import { NotFoundException } from "@common/shared";
import { IQueueService } from "@common/shared/ports";
import { Frequency } from "@db";
import crypto from "crypto";
import { ISubscriptionService } from "./subscription.controller";
import { FREQUENCY_MAP, SubscribeBody } from "./subscription.schema";
import { ILogger } from "@logger/logger.interface";
import { getCallSites } from "util";

export class SubscriptionService implements ISubscriptionService {
  constructor(
    private readonly repo: ISubscriptionRepository,
    private readonly queueService: IQueueService,
    private readonly logger: ILogger,
    private readonly metricsService: IMetricsService
  ) {}

  async subscribe(data: SubscribeBody) {
    const { email, city, frequency } = data;

    try {
      const confirmToken = crypto.randomBytes(32).toString("hex");
      const unsubscribeToken = crypto.randomBytes(32).toString("hex");

      const confirmTokenExpiresAt = new Date(
        Date.now() + SUBSCRIPTION_CONFIRMATION_EXPIRATION_TIME
      );

      const subscription = await this.repo.upsertSubscription({
        email,
        city,
        frequency: FREQUENCY_MAP[frequency] as Frequency,
        confirmToken,
        confirmTokenExpiresAt,
        unsubscribeToken,
        confirmed: false,
      });

      if (!subscription) {
        throw new Error("Subscription not found after upsert");
      }

      const confirmUrl = `${env.API_URL}/api/confirm/${confirmToken}`;

      const jobData = new ConfirmEmailJobData({
        email,
        city,
        confirmUrl,
        subscriptionId: subscription.id,
      });

      await this.queueService.add(
        QUEUE_TYPES.CONFIRM_EMAIL,
        JOB_TYPES.CONFIRM_EMAIL,
        Buffer.from(jobData.toBinary())
      );

      this.metricsService.incrementSubscriptionCreatedCount();
      return { confirmToken, unsubscribeToken };
    } catch (error) {
      this.metricsService.incrementSubscriptionCreationErrorCount();
      this.logger.error({
        message: "Error creating subscription",
        callSites: getCallSites(),
        meta: {
          email,
          city,
          frequency,
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

  async confirmSubscription(token: string) {
    try {
      const now = new Date();
      const subscription = await this.repo.findValidByConfirmToken(token, now);
      if (!subscription) {
        throw new NotFoundException("Invalid or expired token");
      }

      await this.repo.confirmSubscription(subscription.id);

      const cron = FREQUENCY_TO_CRON[subscription.frequency];
      const schedulerId = `sub-${subscription.id}`;
      const jobData = new UpdateWeatherDataJobData({
        subscriptionId: subscription.id,
      });
      await this.queueService.schedule(
        QUEUE_TYPES.UPDATE_WEATHER_DATA,
        schedulerId,
        cron,
        JOB_TYPES.UPDATE_WEATHER_DATA,
        Buffer.from(jobData.toBinary())
      );

      this.metricsService.incrementSubscriptionsActiveCount();
      this.metricsService.incrementSubscriptionConfirmedCount();
      return subscription;
    } catch (error) {
      this.metricsService.incrementSubscriptionConfirmationErrorCount();
      throw error;
    }
  }

  async unsubscribe(token: string) {
    try {
      const subscription = await this.repo.findByUnsubscribeToken(token);
      if (!subscription) {
        throw new NotFoundException("Invalid token");
      }

      const schedulerId = `sub-${subscription.id}`;
      await this.queueService.removeSchedule(
        QUEUE_TYPES.UPDATE_WEATHER_DATA,
        schedulerId
      );
      await this.repo.deleteSubscription(subscription.id);

      this.metricsService.decrementSubscriptionsActiveCount();
      this.metricsService.incrementSubscriptionUnsubscribedCount();
      return subscription;
    } catch (error) {
      this.metricsService.incrementSubscriptionUnsubscribeErrorCount();
      throw error;
    }
  }

  async isAlreadySubscribed(email: string, city: string) {
    const existing = await this.repo.findConfirmedByEmailAndCity(email, city);
    return Boolean(existing);
  }
}
