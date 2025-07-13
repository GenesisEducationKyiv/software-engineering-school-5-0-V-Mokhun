import {
  IWeatherProvider,
  WeatherData,
  weatherDataSchema,
} from "@/shared/ports";
import { HttpException, ServerErrorException } from "@/shared";
import { ILogger } from "@/shared/logger";
import z from "zod";
import { mapWeatherCodeToDescription } from "../mappers";

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
  constructor(
    private readonly logger: ILogger,
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
      this.logger.error(`Failed to fetch coordinates for ${city}`, data.error, {
        data,
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
    try {
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
        this.logger.error(
          "Invalid weather data received from OpenMeteo",
          validated.error,
          { data }
        );
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
