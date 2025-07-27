import { IWeatherProvider, WeatherData } from "@/shared/ports";
import { ILogger } from "@logger/logger.interface";
import { getCallSites } from "util";

export class WeatherProvider implements IWeatherProvider {
  constructor(
    private readonly providers: IWeatherProvider[],
    private readonly logger: ILogger
  ) {}

  async getWeatherData(city: string): Promise<WeatherData> {
    for (const provider of this.providers) {
      try {
        const weatherData = await provider.getWeatherData(city);
        this.logger.info({
          message: `${provider.constructor.name}: fetched weather data for ${city}`,
          callSites: getCallSites(),
          meta: {
            city,
            provider: provider.constructor.name,
          },
        });
        return weatherData;
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error(JSON.stringify(error));
        this.logger.warn({
          message: `${provider.constructor.name}: failed to fetch weather data for ${city}`,
          callSites: getCallSites(),
          meta: {
            city,
            provider: provider.constructor.name,
          },
          error: {
            message: err.message,
            stack: err.stack,
            name: err.name,
          },
        });
      }
    }

    const errorMessage = `Could not fetch weather data for city: ${city} from any provider`;
    const error = new Error(errorMessage);
    this.logger.error({
      message: errorMessage,
      callSites: getCallSites(),
      meta: {
        city,
      },
      error: {
        message: errorMessage,
        stack: error.stack,
        name: error.name,
      },
    });

    throw error;
  }
}
