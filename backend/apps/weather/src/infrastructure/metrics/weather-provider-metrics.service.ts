import { Counter, Histogram, Registry } from "prom-client";
import { IWeatherProviderMetricsService } from "@/shared/ports";

export class WeatherProviderMetricsService
  implements IWeatherProviderMetricsService
{
  private weatherProviderRequestCount: Counter;
  private weatherProviderRequestErrorCount: Counter;
  private weatherProviderRequestDuration: Histogram;

  constructor(registry: Registry) {
    this.weatherProviderRequestCount = new Counter({
      name: "weather_provider_request_count_total",
      help: "Total number of weather provider requests",
      labelNames: ["provider_name"],
      registers: [registry],
    });

    this.weatherProviderRequestErrorCount = new Counter({
      name: "weather_provider_request_error_count_total",
      help: "Total number of weather provider request errors",
      labelNames: ["provider_name"],
      registers: [registry],
    });

    this.weatherProviderRequestDuration = new Histogram({
      name: "weather_provider_request_duration_seconds",
      help: "Duration of weather provider requests",
      labelNames: ["provider_name"],
      registers: [registry],
    });
  }

  incrementWeatherProviderRequestCount(providerName: string): void {
    this.weatherProviderRequestCount.inc({ provider_name: providerName });
  }

  incrementWeatherProviderRequestErrorCount(providerName: string): void {
    this.weatherProviderRequestErrorCount.inc({ provider_name: providerName });
  }

  recordWeatherProviderRequestDuration(providerName: string): () => number {
    const timer = this.weatherProviderRequestDuration.startTimer({
      provider_name: providerName,
    });
    return timer;
  }
}

export class WeatherProviderMetricsServiceFactory {
  static create(registry: Registry): IWeatherProviderMetricsService {
    return new WeatherProviderMetricsService(registry);
  }
}
