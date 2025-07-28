import { IMetricsService } from "@/shared/ports";
import {
  collectDefaultMetrics,
  Counter,
  Histogram,
  Registry,
} from "prom-client";

export class MetricsService implements IMetricsService {
  private static instance: MetricsService;
  private readonly registry: Registry;

  private httpRequestsTotal: Counter;
  private httpRequestErrorsTotal: Counter;
  private httpRequestDuration: Histogram;

  private emailDeliveriesTotal: Counter;
  private emailDeliveryErrorsTotal: Counter;
  private emailDeliveryDuration: Histogram;

  private jobsEnqueuedTotal: Counter;
  private jobsProcessedTotal: Counter;
  private jobsFailedTotal: Counter;
  private jobsProcessingDuration: Histogram;

  private constructor() {
    this.registry = new Registry();
    this.registry.setDefaultLabels({
      serviceName: "notifications-service",
    });

    collectDefaultMetrics({
      register: this.registry,
    });

    this.httpRequestsTotal = new Counter({
      name: "http_requests_total",
      help: "Total number of HTTP requests",
      labelNames: ["method", "route", "status_code"],
      registers: [this.registry],
    });

    this.httpRequestErrorsTotal = new Counter({
      name: "http_request_errors_total",
      help: "Total number of HTTP request errors",
      labelNames: ["method", "route", "status_code"],
      registers: [this.registry],
    });

    this.httpRequestDuration = new Histogram({
      name: "http_request_duration_seconds",
      help: "Duration of HTTP requests",
      labelNames: ["method", "route", "status_code"],
      registers: [this.registry],
    });

    this.emailDeliveriesTotal = new Counter({
      name: "email_deliveries_total",
      help: "Total number of email deliveries",
      registers: [this.registry],
      labelNames: ["provider_name", "email_type"],
    });

    this.emailDeliveryErrorsTotal = new Counter({
      name: "email_delivery_errors_total",
      help: "Total number of email delivery errors",
      registers: [this.registry],
      labelNames: ["provider_name", "email_type"],
    });

    this.emailDeliveryDuration = new Histogram({
      name: "email_delivery_duration_seconds",
      help: "Duration of email deliveries",
      registers: [this.registry],
      labelNames: ["provider_name", "email_type"],
    });

    this.jobsEnqueuedTotal = new Counter({
      name: "jobs_enqueued_total",
      help: "Total number of jobs enqueued",
      registers: [this.registry],
      labelNames: ["job_name"],
    });

    this.jobsProcessedTotal = new Counter({
      name: "jobs_processed_total",
      help: "Total number of jobs processed",
      registers: [this.registry],
      labelNames: ["job_name"],
    });

    this.jobsFailedTotal = new Counter({
      name: "jobs_failed_total",
      help: "Total number of jobs failed",
      registers: [this.registry],
      labelNames: ["job_name"],
    });

    this.jobsProcessingDuration = new Histogram({
      name: "jobs_processing_duration_seconds",
      help: "Duration of jobs processing",
      registers: [this.registry],
      labelNames: ["job_name"],
    });
  }

  public static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  incrementHttpRequestCount(
    method: string,
    route: string,
    statusCode: string
  ): void {
    this.httpRequestsTotal.labels(method, route, statusCode).inc();
  }

  incrementHttpRequestErrorCount(
    method: string,
    route: string,
    statusCode: string
  ): void {
    this.httpRequestErrorsTotal.labels(method, route, statusCode).inc();
  }

  recordHttpRequestDuration(
    method: string,
    route: string,
    statusCode: string
  ): () => number {
    return this.httpRequestDuration.startTimer({
      method,
      route,
      status_code: statusCode,
    });
  }

  incrementJobEnqueuedCount(jobName: string): void {
    this.jobsEnqueuedTotal.labels(jobName).inc();
  }

  incrementJobProcessedCount(jobName: string): void {
    this.jobsProcessedTotal.labels(jobName).inc();
  }

  incrementJobFailedCount(jobName: string): void {
    this.jobsFailedTotal.labels(jobName).inc();
  }

  recordJobProcessingDuration(jobName: string): () => number {
    return this.jobsProcessingDuration.startTimer({
      job_name: jobName,
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

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getContentType(): string {
    return this.registry.contentType;
  }
}
