import { Counter, Gauge, Registry } from "prom-client";
import { ISubscriptionMetricsService } from "@/shared/ports";

export class SubscriptionMetricsService implements ISubscriptionMetricsService {
  private subscriptionCreatedCount: Counter;
  private subscriptionCreationErrorCount: Counter;
  private subscriptionConfirmedCount: Counter;
  private subscriptionConfirmationErrorCount: Counter;
  private subscriptionUnsubscribedCount: Counter;
  private subscriptionUnsubscribeErrorCount: Counter;
  private subscriptionsActiveCount: Gauge;

  constructor(registry: Registry) {
    this.subscriptionCreatedCount = new Counter({
      name: "subscription_created_count_total",
      help: "Total number of subscriptions created",
      registers: [registry],
    });

    this.subscriptionCreationErrorCount = new Counter({
      name: "subscription_creation_error_count_total",
      help: "Total number of subscription creation errors",
      registers: [registry],
    });

    this.subscriptionConfirmedCount = new Counter({
      name: "subscription_confirmed_count_total",
      help: "Total number of subscriptions confirmed",
      registers: [registry],
    });

    this.subscriptionConfirmationErrorCount = new Counter({
      name: "subscription_confirmation_error_count_total",
      help: "Total number of subscription confirmation errors",
      registers: [registry],
    });

    this.subscriptionUnsubscribedCount = new Counter({
      name: "subscription_unsubscribed_count_total",
      help: "Total number of subscriptions unsubscribed",
      registers: [registry],
    });

    this.subscriptionUnsubscribeErrorCount = new Counter({
      name: "subscription_unsubscribe_error_count_total",
      help: "Total number of subscription unsubscribe errors",
      registers: [registry],
    });

    this.subscriptionsActiveCount = new Gauge({
      name: "subscriptions_active_count",
      help: "Current number of active subscriptions",
      registers: [registry],
    });
  }

  incrementSubscriptionCreatedCount(): void {
    this.subscriptionCreatedCount.inc();
  }

  incrementSubscriptionCreationErrorCount(): void {
    this.subscriptionCreationErrorCount.inc();
  }

  incrementSubscriptionConfirmedCount(): void {
    this.subscriptionConfirmedCount.inc();
  }

  incrementSubscriptionConfirmationErrorCount(): void {
    this.subscriptionConfirmationErrorCount.inc();
  }

  incrementSubscriptionUnsubscribedCount(): void {
    this.subscriptionUnsubscribedCount.inc();
  }

  incrementSubscriptionUnsubscribeErrorCount(): void {
    this.subscriptionUnsubscribeErrorCount.inc();
  }

  incrementSubscriptionsActiveCount(): void {
    this.subscriptionsActiveCount.inc();
  }

  decrementSubscriptionsActiveCount(): void {
    this.subscriptionsActiveCount.dec();
  }
} 

export class SubscriptionMetricsServiceFactory {
  static create(registry: Registry): ISubscriptionMetricsService {
    return new SubscriptionMetricsService(registry);
  }
}
