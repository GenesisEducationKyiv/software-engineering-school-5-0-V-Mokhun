import {
  IWeatherProvider,
  WeatherData,
  weatherDataSchema,
} from "@/shared/ports";
import { HttpException, ServerErrorException } from "@common/shared";
import { ILogger } from "@logger/logger.interface";

export class WeatherApiProvider implements IWeatherProvider {
  constructor(
    private readonly logger: ILogger,
    private readonly apiKey: string,
    private readonly baseUrl: string = "https://api.weatherapi.com/v1"
  ) {}

  async getWeatherData(city: string): Promise<WeatherData> {
    try {
      const url = `${this.baseUrl}/current.json?key=${this.apiKey}&q=${city}&aqi=no`;

      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new HttpException(
          response.status,
          `Failed to fetch weather data for ${city}: ${response.statusText}`
        );
      }

      const data = await response.json();

      const validated = weatherDataSchema.safeParse({
        temperature: data?.current?.temp_c,
        humidity: data?.current?.humidity,
        description: data?.current?.condition?.text,
      });
      if (!validated.success) {
        throw new ServerErrorException(
          "Invalid weather data received from API"
        );
      }

      return validated.data;
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error(JSON.stringify(error));

      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(`Error fetching weather data for ${city}`, err);

      throw new ServerErrorException(
        "Failed to fetch weather data due to an unexpected error."
      );
    }
  }
}
