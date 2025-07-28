import { ILogger } from "@logger/logger.interface";
import { IMetricsService, IWeatherProvider } from "@/shared/ports";
import { OpenMeteoProvider, WeatherApiProvider } from "./providers";
import { WeatherProvider } from "./weather.provider";
import { createCircuitBreakerProxy } from "@common/shared/circuit-breaker";
import { getCallSites } from "util";

export function createWeatherProvider({
  providersLogger,
  logger,
  weatherApiKey,
  metricsService,
}: {
  providersLogger?: ILogger;
  logger: ILogger;
  weatherApiKey: string;
  metricsService: IMetricsService;
}): IWeatherProvider {
  const provLogger = providersLogger ?? logger;
  const providers: IWeatherProvider[] = [];

  if (weatherApiKey) {
    const weatherApiProvider = new WeatherApiProvider(
      provLogger,
      metricsService,
      weatherApiKey
    );
    providers.push(createCircuitBreakerProxy(weatherApiProvider, provLogger));
  } else {
    provLogger.warn({
      message: "WeatherAPI key is not set. Skipping WeatherApiProvider.",
      callSites: getCallSites(),
    });
  }

  const openMeteoProvider = new OpenMeteoProvider(provLogger, metricsService);
  providers.push(createCircuitBreakerProxy(openMeteoProvider, provLogger));

  if (providers.length === 0) {
    const errorMessage = "Weather provider cannot be created.";
    const error = new Error(errorMessage);
    logger.error({
      message: errorMessage,
      callSites: getCallSites(),
      error: {
        message: errorMessage,
        stack: error.stack,
        name: error.name,
      },
    });
    throw error;
  }

  return new WeatherProvider(providers, logger);
}
