import { ISubscriptionRepository, SubscriptionCreate } from "@/shared/ports";
import { IDatabase } from "@common/shared/ports/database.port";
import { Subscription } from "@prisma/client";

export class SubscriptionRepository implements ISubscriptionRepository {
  constructor(private readonly db: IDatabase) {}

  async upsertSubscription(data: SubscriptionCreate): Promise<Subscription> {
    const { email, city, ...rest } = data;
    return this.db.subscription.upsert({
      where: { email_city: { email, city } },
      update: { ...rest },
      create: { email, city, ...rest },
    });
  }

  async confirmSubscription(id: number): Promise<Subscription> {
    return this.db.subscription.update({
      where: { id },
      data: {
        confirmed: true,
        confirmToken: null,
        confirmTokenExpiresAt: null,
      },
    });
  }

  async deleteSubscription(id: number): Promise<Subscription> {
    return this.db.subscription.delete({ where: { id } });
  }

  async findSubscriptionByEmailAndCity(
    email: string,
    city: string
  ): Promise<Subscription | null> {
    return this.db.subscription.findFirst({
      where: { email, city },
    });
  }

  async findConfirmedByEmailAndCity(
    email: string,
    city: string
  ): Promise<Subscription | null> {
    return this.db.subscription.findFirst({
      where: { email, city, confirmed: true },
    });
  }

  async findValidByConfirmToken(
    token: string,
    date: Date
  ): Promise<Subscription | null> {
    return this.db.subscription.findFirst({
      where: {
        confirmToken: token,
        confirmTokenExpiresAt: { gt: date },
      },
    });
  }

  async findByUnsubscribeToken(token: string): Promise<Subscription | null> {
    return this.db.subscription.findFirst({
      where: { unsubscribeToken: token },
    });
  }

  async findAllConfirmed(): Promise<Subscription[]> {
    return this.db.subscription.findMany({ where: { confirmed: true } });
  }

  async findById(id: number): Promise<Subscription | null> {
    return this.db.subscription.findUnique({ where: { id } });
  }
}
