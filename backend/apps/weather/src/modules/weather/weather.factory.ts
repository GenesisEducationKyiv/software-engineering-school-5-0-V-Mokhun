import { createWeatherProvider } from "@/infrastructure/weather/weather.factory";
import { ILogger } from "@logger/logger.interface";
import {
  ICacheMetricsService,
  IDatabase,
  IWeatherProviderMetricsService,
} from "@/shared/ports";
import { WeatherRepository } from "@/infrastructure/repositories/weather.repository";
import { WeatherController } from "./weather.controller";
import { WeatherService } from "./weather.service";

export function createWeatherController({
  db,
  logger,
  providersLogger,
  apiKey,
  cacheMetricsService,
  weatherProviderMetricsService,
}: {
  db: IDatabase;
  logger: ILogger;
  providersLogger?: ILogger;
  apiKey: string;
  cacheMetricsService: ICacheMetricsService;
  weatherProviderMetricsService: IWeatherProviderMetricsService;
}): WeatherController {
  const repo = new WeatherRepository(db);
  const provider = createWeatherProvider({
    logger,
    providersLogger,
    weatherApiKey: apiKey,
    metricsService: weatherProviderMetricsService,
  });
  const service = new WeatherService(repo, provider, cacheMetricsService);
  return new WeatherController(service);
}
