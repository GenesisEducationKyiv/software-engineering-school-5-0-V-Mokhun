import { Prisma, Subscription } from "@db";

export type SubscriptionCreate = Prisma.SubscriptionUpsertArgs["create"];

export interface ISubscriptionRepository {
  upsertSubscription(data: SubscriptionCreate): Promise<Subscription>;
  confirmSubscription(id: number): Promise<Subscription>;
  deleteSubscription(id: number): Promise<Subscription>;
  findSubscriptionByEmailAndCity(
    email: string,
    city: string
  ): Promise<Subscription | null>;
  findConfirmedByEmailAndCity(
    email: string,
    city: string
  ): Promise<Subscription | null>;
  findValidByConfirmToken(
    token: string,
    date: Date
  ): Promise<Subscription | null>;
  findByUnsubscribeToken(token: string): Promise<Subscription | null>;
  findAllConfirmed(): Promise<Subscription[]>;
  findById(id: number): Promise<Subscription | null>;
}
