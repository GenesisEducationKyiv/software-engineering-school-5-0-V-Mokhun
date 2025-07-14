import { ILogger } from "@logger/logger.interface";
import { IWeatherProvider } from "@/shared/ports";
import { OpenMeteoProvider, WeatherApiProvider } from "./providers";
import { WeatherProvider } from "./weather.provider";

export function createWeatherProvider({
  providersLogger,
  logger,
  weatherApiKey,
}: {
  providersLogger?: ILogger;
  logger: ILogger;
  weatherApiKey: string;
}): IWeatherProvider {
  const provLogger = providersLogger ?? logger;
  const providers: IWeatherProvider[] = [];

  if (weatherApiKey) {
    providers.push(new WeatherApiProvider(provLogger, weatherApiKey));
  } else {
    provLogger.warn("WeatherAPI key is not set. Skipping WeatherApiProvider.");
  }

  providers.push(new OpenMeteoProvider(provLogger));

  if (providers.length === 0) {
    logger.error(
      "Weather provider cannot be created.",
      new Error("Weather provider cannot be created.")
    );
    throw new Error("Weather provider cannot be created.");
  }

  return new WeatherProvider(providers, logger);
}
