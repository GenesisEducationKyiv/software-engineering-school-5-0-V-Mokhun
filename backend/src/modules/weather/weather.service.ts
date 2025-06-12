import {
  WeatherData,
  WeatherService as ExternalWeatherService,
} from "@/lib/weather";
import { CACHE_THRESHOLD } from "@/constants";
import { IWeatherService } from "./weather.controller";
import { WeatherCache } from "@prisma/client";

export interface IWeatherProvider {
  getWeatherData(city: string): Promise<WeatherData>;
}

export interface IWeatherRepository {
  findByCity(city: string): Promise<WeatherCache | null>;
  upsert(city: string, data: WeatherData): Promise<void>;
}

export class WeatherService implements IWeatherService {
  constructor(
    private readonly repo: IWeatherRepository,
    private readonly provider: IWeatherProvider = new ExternalWeatherService(),
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
