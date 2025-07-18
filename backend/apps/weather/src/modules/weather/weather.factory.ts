import { createWeatherProvider } from "@/infrastructure/weather/weather.factory";
import { ILogger } from "@logger/logger.interface";
import { IDatabase } from "@common/shared/ports";
import { WeatherRepository } from "@/infrastructure/repositories/weather.repository";
import { WeatherController } from "./weather.controller";
import { WeatherService } from "./weather.service";
import { IMetricsService } from "@/shared/ports";

export function createWeatherController({
  db,
  logger,
  providersLogger,
  apiKey,
  metrics,
}: {
  db: IDatabase;
  logger: ILogger;
  providersLogger?: ILogger;
  apiKey: string;
  metrics: IMetricsService;
}): WeatherController {
  const repo = new WeatherRepository(db);
  const provider = createWeatherProvider({
    logger,
    providersLogger,
    weatherApiKey: apiKey,
  });
  const service = new WeatherService(repo, provider, metrics);
  return new WeatherController(service);
}
