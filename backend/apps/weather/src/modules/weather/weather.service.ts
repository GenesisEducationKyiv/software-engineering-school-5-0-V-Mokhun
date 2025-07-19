import { CACHE_THRESHOLD } from "@common/constants";
import { IWeatherService } from "./weather.controller";
import { IMetricsService } from "@/shared/ports";
import {
  IWeatherProvider,
  IWeatherRepository,
  WeatherData,
} from "@/shared/ports";

export class WeatherService implements IWeatherService {
  constructor(
    private readonly repo: IWeatherRepository,
    private readonly provider: IWeatherProvider,
    private readonly metrics: IMetricsService,
    private readonly threshold: number = CACHE_THRESHOLD
  ) {}

  async getWeather(city: string): Promise<WeatherData> {
    const cached = await this.repo.findByCity(city);
    const now = Date.now();

    if (cached && now - cached.fetchedAt.getTime() < this.threshold) {
      this.metrics.incrementCacheHit("weather");
      return {
        temperature: cached.temperature,
        humidity: cached.humidity,
        description: cached.description,
      };
    }

    this.metrics.incrementCacheMiss("weather");
    const fresh = await this.provider.getWeatherData(city);
    await this.repo.upsert(city, fresh);
    return fresh;
  }
}
