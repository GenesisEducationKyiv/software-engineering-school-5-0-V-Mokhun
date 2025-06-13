import { CACHE_THRESHOLD } from "@/constants";
import { IWeatherService } from "./weather.controller";
import {
  IWeatherProvider,
  IWeatherRepository,
  WeatherData,
} from "@/shared/ports";

export class WeatherService implements IWeatherService {
  constructor(
    private readonly repo: IWeatherRepository,
    private readonly provider: IWeatherProvider,
    private readonly threshold: number = CACHE_THRESHOLD
  ) {}

  async getWeather(city: string): Promise<WeatherData> {
    const cached = await this.repo.findByCity(city);
    const now = Date.now();

    if (cached && now - cached.fetchedAt.getTime() < this.threshold) {
      return {
        temperature: cached.temperature,
        humidity: cached.humidity,
        description: cached.description,
      };
    }

    const fresh = await this.provider.getWeatherData(city);
    await this.repo.upsert(city, fresh);
    return fresh;
  }

  upsertWeatherCache(city: string, data: WeatherData) {
    return this.repo.upsert(city, data);
  }
}
