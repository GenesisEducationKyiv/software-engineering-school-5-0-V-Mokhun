import { ILogger } from "@/shared/logger";
import { IWeatherProvider } from "@/shared/ports";
import { WeatherApiProvider } from "./weatherapi.service";

export function createWeatherProvider({
  logger,
  apiKey,
}: {
  logger: ILogger;
  apiKey: string;
}): IWeatherProvider {
  if (!apiKey) {
    logger.error(
      "Weather provider cannot be created. apiKey is not set.",
      new Error("Missing Weather API Key")
    );
    throw new Error(
      "Cannot create WeatherProvider due to missing configuration."
    );
  }

  return new WeatherApiProvider(logger, apiKey);
}
