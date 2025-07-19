import { IWeatherProvider, WeatherData } from "@/shared/ports";
import { ILogger } from "@logger/logger.interface";

export class WeatherProvider implements IWeatherProvider {
  constructor(
    private readonly providers: IWeatherProvider[],
    private readonly logger: ILogger
  ) {}

  async getWeatherData(city: string): Promise<WeatherData> {
    for (const provider of this.providers) {
      try {
        const weatherData = await provider.getWeatherData(city);
        this.logger.info(
          `${provider.constructor.name}: fetched weather data for ${city}`,
          {
            city,
            weatherData,
          }
        );
        return weatherData;
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error(JSON.stringify(error));
        this.logger.warn(
          `${provider.constructor.name}: failed to fetch weather data for ${city}`,
          { error: err.message, city }
        );
      }
    }

    this.logger.error(
      `Could not fetch weather data for city: ${city}`,
      new Error(`Could not fetch weather data for city: ${city}`)
    );
    throw new Error(`Could not fetch weather data for city: ${city}`);
  }
}
