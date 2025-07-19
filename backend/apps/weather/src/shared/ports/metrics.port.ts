export interface IMetricsService {
  incrementCacheHit(cacheName: string): void;
  incrementCacheMiss(cacheName: string): void;
  getMetrics(): Promise<string>;
  getContentType(): string;
} 
