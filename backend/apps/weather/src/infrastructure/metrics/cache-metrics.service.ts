import { Counter, Registry } from "prom-client";
import { ICacheMetricsService } from "@/shared/ports";

export class CacheMetricsService implements ICacheMetricsService {
  private cacheHitsCounter: Counter;
  private cacheMissesCounter: Counter;

  constructor(registry: Registry) {
    this.cacheHitsCounter = new Counter({
      name: "cache_hits_total",
      help: "Total number of cache hits",
      labelNames: ["cache_name"],
      registers: [registry],
    });

    this.cacheMissesCounter = new Counter({
      name: "cache_misses_total",
      help: "Total number of cache misses",
      labelNames: ["cache_name"],
      registers: [registry],
    });
  }

  incrementCacheHit(cacheName: string): void {
    this.cacheHitsCounter.inc({ cache_name: cacheName });
  }

  incrementCacheMiss(cacheName: string): void {
    this.cacheMissesCounter.inc({ cache_name: cacheName });
  }
} 

export class CacheMetricsServiceFactory {
  static create(registry: Registry): ICacheMetricsService {
    return new CacheMetricsService(registry);
  }
}
