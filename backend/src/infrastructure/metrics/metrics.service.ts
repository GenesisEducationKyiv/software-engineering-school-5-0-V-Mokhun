import { Counter, Registry } from "prom-client";
import { IMetricsService } from "@/shared/ports";

export class MetricsService implements IMetricsService {
  private static instance: MetricsService;
  private readonly registry: Registry;
  private cacheHitsCounter: Counter;
  private cacheMissesCounter: Counter;

  private constructor() {
    this.registry = new Registry();
    this.registry.setDefaultLabels({
      serviceName: "backend",
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
  }

  public static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  incrementCacheHit(cacheName: string): void {
    this.cacheHitsCounter.labels(cacheName).inc();
  }

  incrementCacheMiss(cacheName: string): void {
    this.cacheMissesCounter.labels(cacheName).inc();
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getContentType(): string {
    return this.registry.contentType;
  }
}
