import { SUBSCRIPTION_CONFIRMATION_EXPIRATION_TIME } from "@common/constants";
import { Frequency } from "@prisma/client";
import crypto from "crypto";
import { FREQUENCY_MAP, SubscribeBody } from "./subscription.schema";
import { ISubscriptionService } from "./subscription.controller";
import { IQueueService } from "@common/shared/ports";
import { ISubscriptionRepository } from "@/shared/ports";
import { NotFoundException } from "@common/shared";
import { JOB_TYPES, QUEUE_TYPES } from "@common/constants";
import { FREQUENCY_TO_CRON } from "@common/constants";
import {
  ConfirmEmailJobData,
  UpdateWeatherDataJobData,
} from "@common/generated/proto/job_pb";
import { env } from "@/config/env";

export class SubscriptionService implements ISubscriptionService {
  constructor(
    private readonly repo: ISubscriptionRepository,
    private readonly queueService: IQueueService
  ) {}

  async subscribe(data: SubscribeBody) {
    const { email, city, frequency } = data;

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

    return { confirmToken, unsubscribeToken };
  }

  async confirmSubscription(token: string) {
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

    return subscription;
  }

  async unsubscribe(token: string) {
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

    return subscription;
  }

  async isAlreadySubscribed(email: string, city: string) {
    const existing = await this.repo.findConfirmedByEmailAndCity(email, city);
    return Boolean(existing);
  }
}
