import { SUBSCRIPTION_CONFIRMATION_EXPIRATION_TIME } from "@/constants";
import { Frequency, Subscription } from "@prisma/client";
import crypto from "crypto";
import { FREQUENCY_MAP, SubscribeBody } from "./subscription.schema";
import { SubscriptionCreate } from "./subscription.types";
import { ISubscriptionService } from "./subscription.controller";

export interface ISubscriptionRepository {
  findConfirmedByEmailAndCity(
    email: string,
    city: string
  ): Promise<Subscription | null>;

  upsertSubscription(params: SubscriptionCreate): Promise<void>;

  findValidByConfirmToken(
    token: string,
    now: Date
  ): Promise<Subscription | null>;

  confirmSubscription(id: number): Promise<void>;

  findByUnsubscribeToken(token: string): Promise<Subscription | null>;

  deleteSubscription(id: number): Promise<void>;
}

export class SubscriptionService implements ISubscriptionService {
  constructor(private readonly repo: ISubscriptionRepository) {}

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

    return { confirmToken, unsubscribeToken };
  }

  async confirmSubscription(token: string) {
    const now = new Date();
    const subscription = await this.repo.findValidByConfirmToken(token, now);
    if (!subscription) {
      throw new Error("Invalid or expired token");
    }
    await this.repo.confirmSubscription(subscription.id);
    return subscription;
  }

  async unsubscribe(token: string) {
    const subscription = await this.repo.findByUnsubscribeToken(token);
    if (!subscription) {
      throw new Error("Invalid token");
    }
    await this.repo.deleteSubscription(subscription.id);
    return subscription;
  }

  async isAlreadySubscribed(email: string, city: string) {
    const existing = await this.repo.findConfirmedByEmailAndCity(email, city);
    return Boolean(existing);
  }
}
