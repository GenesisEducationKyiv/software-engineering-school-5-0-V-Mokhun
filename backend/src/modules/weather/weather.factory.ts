import { db } from "@/db";
import { WeatherRepository } from "./weather.repository";
import { WeatherService } from "./weather.service";
import { WeatherController } from "./weather.controller";
import { createWeatherProvider } from "@/infrastructure/weather";

export function createWeatherController(): WeatherController {
  const repo = new WeatherRepository(db);
  const provider = createWeatherProvider();
  const service = new WeatherService(repo, provider);
  return new WeatherController(service);
}
