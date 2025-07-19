import { ILogger } from "@logger/logger.interface";
import { IWeatherProvider } from "@/shared/ports";
import { OpenMeteoProvider, WeatherApiProvider } from "./providers";
import { WeatherProvider } from "./weather.provider";
import { createCircuitBreakerProxy } from "@common/shared/circuit-breaker";

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
    const weatherApiProvider = new WeatherApiProvider(
      provLogger,
      weatherApiKey
    );
    providers.push(createCircuitBreakerProxy(weatherApiProvider, provLogger));
  } else {
    provLogger.warn("WeatherAPI key is not set. Skipping WeatherApiProvider.");
  }

  const openMeteoProvider = new OpenMeteoProvider(provLogger);
  providers.push(createCircuitBreakerProxy(openMeteoProvider, provLogger));

  if (providers.length === 0) {
    logger.error(
      "Weather provider cannot be created.",
      new Error("Weather provider cannot be created.")
    );
    throw new Error("Weather provider cannot be created.");
  }

  return new WeatherProvider(providers, logger);
}
