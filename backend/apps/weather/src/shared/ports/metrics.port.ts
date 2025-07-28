export interface IMetricsService {
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
  incrementCacheHit(cacheName: string): void;
  incrementCacheMiss(cacheName: string): void;
  incrementWeatherProviderRequestCount(providerName: string): void;
  incrementWeatherProviderRequestErrorCount(providerName: string): void;
  recordWeatherProviderRequestDuration(providerName: string): () => number;
  incrementSubscriptionCreatedCount(): void;
  incrementSubscriptionCreationErrorCount(): void;
  incrementSubscriptionConfirmedCount(): void;
  incrementSubscriptionConfirmationErrorCount(): void;
  incrementSubscriptionUnsubscribedCount(): void;
  incrementSubscriptionUnsubscribeErrorCount(): void;
  incrementSubscriptionsActiveCount(): void;
  decrementSubscriptionsActiveCount(): void;
  getMetrics(): Promise<string>;
  getContentType(): string;
}
