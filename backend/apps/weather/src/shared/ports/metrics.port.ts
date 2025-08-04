import { Registry } from "prom-client";

export interface IRegistryManager {
  getRegistry(): Registry;
  getMetrics(): Promise<string>;
  getContentType(): string;
}

export interface IHttpMetricsService {
  incrementHttpRequestCount(
    method: string,
    route: string,
    statusCode: string
  ): void;
  incrementHttpRequestErrorCount(
    method: string,
    route: string,
    statusCode: string
  ): void;
  recordHttpRequestDuration(
    method: string,
    route: string,
    statusCode: string
  ): () => number;
}

export interface ICacheMetricsService {
  incrementCacheHit(cacheName: string): void;
  incrementCacheMiss(cacheName: string): void;
}

export interface IWeatherProviderMetricsService {
  incrementWeatherProviderRequestCount(providerName: string): void;
  incrementWeatherProviderRequestErrorCount(providerName: string): void;
  recordWeatherProviderRequestDuration(providerName: string): () => number;
}

export interface ISubscriptionMetricsService {
  incrementSubscriptionCreatedCount(): void;
  incrementSubscriptionCreationErrorCount(): void;
  incrementSubscriptionConfirmedCount(): void;
  incrementSubscriptionConfirmationErrorCount(): void;
  incrementSubscriptionUnsubscribedCount(): void;
  incrementSubscriptionUnsubscribeErrorCount(): void;
  incrementSubscriptionsActiveCount(): void;
  decrementSubscriptionsActiveCount(): void;
}
