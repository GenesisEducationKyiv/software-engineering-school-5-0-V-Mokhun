import { createWeatherProvider } from "@/infrastructure/weather";
import { IDatabase } from "@/shared/ports";
import { WeatherRepository } from "../../infrastructure/repositories/weather.repository";
import { WeatherController } from "./weather.controller";
import { WeatherService } from "./weather.service";
import { ILogger } from "@/shared/logger";

export function createWeatherController({
  db,
  logger,
  apiKey,
}: {
  db: IDatabase;
  logger: ILogger;
  apiKey: string;
}): WeatherController {
  const repo = new WeatherRepository(db);
  const provider = createWeatherProvider({
    logger,
    apiKey,
  });
  const service = new WeatherService(repo, provider);
  return new WeatherController(service);
}
