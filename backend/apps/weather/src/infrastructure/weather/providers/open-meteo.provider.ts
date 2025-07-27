import {
  IMetricsService,
  IWeatherProvider,
  WeatherData,
  weatherDataSchema,
} from "@/shared/ports";
import { HttpException, ServerErrorException } from "@common/shared";
import { ILogger } from "@logger/logger.interface";
import z from "zod";
import { mapWeatherCodeToDescription } from "../mappers";
import { getCallSites } from "util";

export const openMeteoGeocodingResponseSchema = z.object({
  results: z.array(
    z.object({
      latitude: z.number(),
      longitude: z.number(),
    })
  ),
});

export type OpenMeteoGeocodingResponse = z.infer<
  typeof openMeteoGeocodingResponseSchema
>;

export class OpenMeteoProvider implements IWeatherProvider {
  private readonly providerName = "OpenMeteo";
  constructor(
    private readonly logger: ILogger,
    private readonly metricsService: IMetricsService,
    private readonly geocodingApiUrl: string = "https://geocoding-api.open-meteo.com/v1",
    private readonly weatherApiUrl: string = "https://api.open-meteo.com/v1"
  ) {}

  private async getCoordinates(
    city: string
  ): Promise<{ latitude: number; longitude: number }> {
    const url = `${this.geocodingApiUrl}/search?name=${encodeURIComponent(
      city
    )}&count=1`;
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new ServerErrorException(`Failed to fetch coordinates for ${city}`);
    }

    const data = openMeteoGeocodingResponseSchema.safeParse(
      await response.json()
    );

    if (!data.success) {
      this.logger.error({
        message: `Failed to fetch coordinates for ${city}`,
        callSites: getCallSites(),
        meta: {
          city,
          provider: this.providerName,
        },
        error: {
          message: data.error.message,
          stack: data.error.stack,
          name: data.error.name,
        },
      });
      throw new ServerErrorException(`Failed to fetch coordinates for ${city}`);
    }

    const location = data.data?.results?.[0];

    if (!location) {
      throw new ServerErrorException(`Could not find coordinates for ${city}`);
    }

    return {
      latitude: location.latitude,
      longitude: location.longitude,
    };
  }

  async getWeatherData(city: string): Promise<WeatherData> {
    const end = this.metricsService.recordWeatherProviderRequestDuration(
      this.providerName
    );

    try {
      this.metricsService.incrementWeatherProviderRequestCount(
        this.providerName
      );
      const { latitude, longitude } = await this.getCoordinates(city);

      const url = `${this.weatherApiUrl}/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code&forecast_days=1`;

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
        temperature: data?.current?.temperature_2m,
        humidity: data?.current?.relative_humidity_2m,
        description: mapWeatherCodeToDescription(data?.current?.weather_code),
      });

      if (!validated.success) {
        this.logger.error({
          message: "Invalid weather data received from OpenMeteo",
          callSites: getCallSites(),
          meta: {
            city,
            provider: this.providerName,
          },
          error: {
            message: validated.error.message,
            stack: validated.error.stack,
            name: validated.error.name,
          },
        });
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
