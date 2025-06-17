import { Prisma, Subscription } from "@prisma/client";

export type SubscriptionCreate = Prisma.SubscriptionUpsertArgs["create"];

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

  findSubscriptionByEmailAndCity(
    email: string,
    city: string
  ): Promise<Subscription | null>;

  findById(id: number): Promise<Subscription | null>;

  updateLastSentAt(id: number, date: Date): Promise<void>;
}
