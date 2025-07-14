import { ISubscriptionRepository, SubscriptionCreate } from "@/shared/ports";
import { IDatabase } from "@/shared/ports/database.port";
import { Subscription } from "@prisma/client";

export class SubscriptionRepository implements ISubscriptionRepository {
  constructor(private readonly db: IDatabase) {}

  async findConfirmedByEmailAndCity(
    email: string,
    city: string
  ): Promise<Subscription | null> {
    return this.db.subscription.findFirst({
      where: { email, city, confirmed: true },
    });
  }

  async upsertSubscription(params: SubscriptionCreate): Promise<void> {
    await this.db.subscription.upsert({
      where: { email_city: { email: params.email, city: params.city } },
      update: {
        frequency: params.frequency,
        confirmToken: params.confirmToken,
        confirmTokenExpiresAt: params.confirmTokenExpiresAt,
        confirmed: false,
      },
      create: params,
    });
  }

  async findValidByConfirmToken(
    token: string,
    now: Date
  ): Promise<Subscription | null> {
    return this.db.subscription.findFirst({
      where: {
        confirmToken: token,
        confirmed: false,
        confirmTokenExpiresAt: {
          gt: now,
        },
      },
    });
  }

  async confirmSubscription(id: number): Promise<void> {
    await this.db.subscription.update({
      where: { id },
      data: {
        confirmed: true,
        confirmToken: null,
        confirmTokenExpiresAt: null,
      },
    });
  }

  async findByUnsubscribeToken(token: string): Promise<Subscription | null> {
    return this.db.subscription.findFirst({
      where: { unsubscribeToken: token },
    });
  }

  async deleteSubscription(id: number): Promise<void> {
    await this.db.subscription.delete({ where: { id } });
  }

  async findSubscriptionByEmailAndCity(
    email: string,
    city: string
  ): Promise<Subscription | null> {
    return this.db.subscription.findFirst({ where: { email, city } });
  }

  async findById(id: number): Promise<Subscription | null> {
    return this.db.subscription.findUnique({ where: { id } });
  }

  async updateLastSentAt(id: number, date: Date): Promise<void> {
    await this.db.subscription.update({
      where: { id },
      data: { lastSentAt: date },
    });
  }
}
