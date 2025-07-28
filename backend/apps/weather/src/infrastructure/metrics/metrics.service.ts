import {
  collectDefaultMetrics,
  Counter,
  Gauge,
  Histogram,
  Registry,
} from "prom-client";
import { IMetricsService } from "@/shared/ports";

export class MetricsService implements IMetricsService {
  private static instance: MetricsService;
  private readonly registry: Registry;

  private httpRequestsTotal: Counter;
  private httpRequestErrorsTotal: Counter;
  private httpRequestDuration: Histogram;

  private cacheHitsCounter: Counter;
  private cacheMissesCounter: Counter;

  private weatherProviderRequestDuration: Histogram;
  private weatherProviderRequestCount: Counter;
  private weatherProviderRequestErrorCount: Counter;

  private subscriptionCreatedCount: Counter;
  private subscriptionCreationErrorCount: Counter;
  private subscriptionConfirmedCount: Counter;
  private subscriptionConfirmationErrorCount: Counter;
  private subscriptionUnsubscribedCount: Counter;
  private subscriptionUnsubscribeErrorCount: Counter;

  private subscriptionsActiveCount: Gauge;

  private constructor() {
    this.registry = new Registry();
    this.registry.setDefaultLabels({
      serviceName: "weather-service",
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

    this.cacheHitsCounter = new Counter({
      name: "cache_hits_total",
      help: "Total number of cache hits",
      labelNames: ["cache_name"],
      registers: [this.registry],
    });

    this.cacheMissesCounter = new Counter({
      name: "cache_misses_total",
      help: "Total number of cache misses",
      labelNames: ["cache_name"],
      registers: [this.registry],
    });

    this.weatherProviderRequestCount = new Counter({
      name: "weather_provider_request_count_total",
      help: "Total number of weather provider requests",
      labelNames: ["provider_name"],
      registers: [this.registry],
    });

    this.weatherProviderRequestErrorCount = new Counter({
      name: "weather_provider_request_error_count_total",
      help: "Total number of weather provider request errors",
      labelNames: ["provider_name"],
      registers: [this.registry],
    });

    this.weatherProviderRequestDuration = new Histogram({
      name: "weather_provider_request_duration_seconds",
      help: "Duration of weather provider requests",
      labelNames: ["provider_name"],
      registers: [this.registry],
    });

    this.subscriptionCreatedCount = new Counter({
      name: "subscription_created_count_total",
      help: "Total number of subscriptions created",
      registers: [this.registry],
    });

    this.subscriptionCreationErrorCount = new Counter({
      name: "subscription_creation_error_count_total",
      help: "Total number of subscription creation errors",
      registers: [this.registry],
    });

    this.subscriptionConfirmedCount = new Counter({
      name: "subscription_confirmed_count_total",
      help: "Total number of subscriptions confirmed",
      registers: [this.registry],
    });

    this.subscriptionConfirmationErrorCount = new Counter({
      name: "subscription_confirmation_error_count_total",
      help: "Total number of subscription confirmation errors",
      registers: [this.registry],
    });

    this.subscriptionUnsubscribedCount = new Counter({
      name: "subscription_unsubscribed_count_total",
      help: "Total number of subscriptions unsubscribed",
      registers: [this.registry],
    });

    this.subscriptionUnsubscribeErrorCount = new Counter({
      name: "subscription_unsubscribe_error_count_total",
      help: "Total number of subscription unsubscribe errors",
      registers: [this.registry],
    });

    this.subscriptionsActiveCount = new Gauge({
      name: "subscriptions_active_count",
      help: "Total number of active subscriptions",
      registers: [this.registry],
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

  incrementCacheHit(cacheName: string): void {
    this.cacheHitsCounter.labels(cacheName).inc();
  }

  incrementCacheMiss(cacheName: string): void {
    this.cacheMissesCounter.labels(cacheName).inc();
  }

  incrementWeatherProviderRequestCount(providerName: string): void {
    this.weatherProviderRequestCount.labels(providerName).inc();
  }

  incrementWeatherProviderRequestErrorCount(providerName: string): void {
    this.weatherProviderRequestErrorCount.labels(providerName).inc();
  }

  recordWeatherProviderRequestDuration(providerName: string): () => number {
    return this.weatherProviderRequestDuration.startTimer({
      provider_name: providerName,
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

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getContentType(): string {
    return this.registry.contentType;
  }
}
