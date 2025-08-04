import { Counter, Histogram, Registry } from "prom-client";
import { IEmailMetricsService } from "@/shared/ports";

export class EmailMetricsService implements IEmailMetricsService {
  private emailDeliveriesTotal: Counter;
  private emailDeliveryErrorsTotal: Counter;
  private emailDeliveryDuration: Histogram;

  constructor(registry: Registry) {
    this.emailDeliveriesTotal = new Counter({
      name: "email_deliveries_total",
      help: "Total number of email deliveries",
      registers: [registry],
      labelNames: ["provider_name", "email_type"],
    });

    this.emailDeliveryErrorsTotal = new Counter({
      name: "email_delivery_errors_total",
      help: "Total number of email delivery errors",
      registers: [registry],
      labelNames: ["provider_name", "email_type"],
    });

    this.emailDeliveryDuration = new Histogram({
      name: "email_delivery_duration_seconds",
      help: "Duration of email deliveries",
      registers: [registry],
      labelNames: ["provider_name", "email_type"],
    });
  }

  incrementEmailDeliveryCount(providerName: string, emailType: string): void {
    this.emailDeliveriesTotal.labels(providerName, emailType).inc();
  }

  incrementEmailDeliveryErrorCount(
    providerName: string,
    emailType: string
  ): void {
    this.emailDeliveryErrorsTotal.labels(providerName, emailType).inc();
  }

  recordEmailDeliveryDuration(
    providerName: string,
    emailType: string
  ): () => number {
    return this.emailDeliveryDuration.startTimer({
      provider_name: providerName,
      email_type: emailType,
    });
  }
} 

export class EmailMetricsServiceFactory {
  static create(registry: Registry): IEmailMetricsService {
    return new EmailMetricsService(registry);
  }
}
