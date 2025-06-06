import { env } from "@/config";
import {
  HttpException,
  NotFoundException,
  ServerErrorException,
} from "../error";

export interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
}

export class WeatherService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(
    apiKey = env.WEATHER_API_KEY,
    baseUrl = "https://api.weatherapi.com/v1"
  ) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async getWeatherData(city: string): Promise<WeatherData> {
    try {
      const response = await fetch(
        `${this.baseUrl}/current.json?key=${this.apiKey}&q=${city}&aqi=no`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new HttpException(
          response.status,
          `Failed to fetch weather data for ${city}: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!data.current) {
        throw new NotFoundException("Weather data not found");
      }

      return {
        temperature: data.current.temp_c,
        humidity: data.current.humidity,
        description: data.current.condition.text,
      };
    } catch (error) {
      console.error("Weather API error:", error);

      if (error instanceof HttpException) {
        throw error;
      }

      if (error instanceof Error) {
        throw new ServerErrorException(error.message);
      }

      throw new ServerErrorException("Failed to fetch weather data");
    }
  }
}

export const weatherService = new WeatherService();
