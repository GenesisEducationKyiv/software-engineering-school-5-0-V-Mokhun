import { env } from "@/config";
import { getLogger } from "@/shared/logger";
import { IWeatherProvider } from "@/shared/ports";
import { WeatherApiProvider } from "./weatherapi.service";

export function createWeatherProvider(): IWeatherProvider {
  const logger = getLogger();
  const apiKey = env.WEATHER_API_KEY;

  if (!apiKey) {
    logger.error(
      "Weather provider cannot be created. WEATHER_API_KEY is not set.",
      new Error("Missing Weather API Key")
    );
    throw new Error(
      "Cannot create WeatherProvider due to missing configuration."
    );
  }

  return new WeatherApiProvider(logger, apiKey);
}
