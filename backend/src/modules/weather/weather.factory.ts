import { db } from "@/db";
import { WeatherRepository } from "./weather.repository";
import { WeatherService } from "./weather.service";
import { WeatherController } from "./weather.controller";

export function createWeatherController(): WeatherController {
  const repo = new WeatherRepository(db);
  const service = new WeatherService(repo);
  return new WeatherController(service);
} 
