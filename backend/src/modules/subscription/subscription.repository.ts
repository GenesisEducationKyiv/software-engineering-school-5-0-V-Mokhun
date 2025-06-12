import { PrismaClient, Subscription } from "@prisma/client";
import { ISubscriptionRepository } from "./subscription.service";
import { SubscriptionCreate } from "./subscription.types";

export class SubscriptionRepository implements ISubscriptionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findConfirmedByEmailAndCity(
    email: string,
    city: string
  ): Promise<Subscription | null> {
    return this.prisma.subscription.findFirst({
      where: {
        email,
        city,
        confirmed: true,
      },
    });
  }

  async upsertSubscription(params: SubscriptionCreate): Promise<void> {
    const {
      email,
      city,
      frequency,
      confirmToken,
      confirmTokenExpiresAt,
      unsubscribeToken,
    } = params;

    await this.prisma.subscription.upsert({
      where: { email_city: { email, city } },
      update: {
        frequency,
        confirmToken,
        confirmTokenExpiresAt,
        unsubscribeToken,
        confirmed: false,
      },
      create: {
        email,
        city,
        frequency,
        confirmToken,
        confirmTokenExpiresAt,
        unsubscribeToken,
        confirmed: false,
      },
    });
  }

  async findValidByConfirmToken(
    token: string,
    now: Date
  ): Promise<Subscription | null> {
    return this.prisma.subscription.findFirst({
      where: {
        confirmToken: token,
        confirmTokenExpiresAt: { gt: now },
      },
    });
  }

  async confirmSubscription(id: number): Promise<void> {
    await this.prisma.subscription.update({
      where: { id },
      data: {
        confirmed: true,
        confirmToken: null,
        confirmTokenExpiresAt: null,
      },
    });
  }

  async findByUnsubscribeToken(token: string): Promise<Subscription | null> {
    return this.prisma.subscription.findFirst({
      where: { unsubscribeToken: token },
    });
  }

  async deleteSubscription(id: number): Promise<void> {
    await this.prisma.subscription.delete({ where: { id } });
  }
}
