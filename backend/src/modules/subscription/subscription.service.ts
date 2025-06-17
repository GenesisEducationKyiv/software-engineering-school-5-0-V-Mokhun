import { SUBSCRIPTION_CONFIRMATION_EXPIRATION_TIME } from "@/constants";
import { Frequency } from "@prisma/client";
import crypto from "crypto";
import { FREQUENCY_MAP, SubscribeBody } from "./subscription.schema";
import { ISubscriptionService } from "./subscription.controller";
import { IQueueService, ISubscriptionRepository } from "@/shared/ports";
import { NotFoundException } from "@/shared";
import { JOB_TYPES, QUEUE_TYPES } from "@/infrastructure/queue";

const FREQUENCY_TO_CRON: Record<Frequency, string> = {
  [Frequency.HOURLY]: "0 * * * *",
  [Frequency.DAILY]: "0 9 * * *",
};

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

    await this.repo.upsertSubscription({
      email,
      city,
      frequency: FREQUENCY_MAP[frequency] as Frequency,
      confirmToken,
      confirmTokenExpiresAt,
      unsubscribeToken,
    });

    await this.queueService.add(
      QUEUE_TYPES.CONFIRM_EMAIL,
      JOB_TYPES.CONFIRM_EMAIL,
      { email, city, confirmToken }
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
    await this.queueService.schedule(
      QUEUE_TYPES.UPDATE_WEATHER_DATA,
      schedulerId,
      cron,
      JOB_TYPES.UPDATE_WEATHER_DATA,
      { subscriptionId: subscription.id }
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
