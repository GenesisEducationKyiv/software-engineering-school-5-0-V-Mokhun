import {
  IMetricsService,
  IWeatherProvider,
  WeatherData,
  weatherDataSchema,
} from "@/shared/ports";
import { HttpException, ServerErrorException } from "@common/shared";
import { ILogger } from "@logger/logger.interface";
import { getCallSites } from "util";

export class WeatherApiProvider implements IWeatherProvider {
  private readonly providerName = "WeatherAPI";
  constructor(
    private readonly logger: ILogger,
    private readonly metricsService: IMetricsService,
    private readonly apiKey: string,
    private readonly baseUrl: string = "https://api.weatherapi.com/v1"
  ) {}

  async getWeatherData(city: string): Promise<WeatherData> {
    const end = this.metricsService.recordWeatherProviderRequestDuration(
      this.providerName
    );

    try {
      this.metricsService.incrementWeatherProviderRequestCount(
        this.providerName
      );

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
      this.metricsService.incrementWeatherProviderRequestErrorCount(
        this.providerName
      );

      const err =
        error instanceof Error ? error : new Error(JSON.stringify(error));

      this.logger.error({
        message: `Error fetching weather data for ${city}`,
        callSites: getCallSites(),
        meta: {
          city,
          provider: this.providerName,
        },
        error: {
          message: err.message,
          stack: err.stack,
          name: err.name,
        },
      });

      if (error instanceof HttpException) {
        throw error;
      }

      throw new ServerErrorException(
        "Failed to fetch weather data due to an unexpected error."
      );
    } finally {
      end();
    }
  }
}
