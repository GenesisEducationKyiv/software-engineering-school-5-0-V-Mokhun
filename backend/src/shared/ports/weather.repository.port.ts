import { WeatherCache } from "@prisma/client";
import { WeatherData } from "./weather.port";

export interface IWeatherRepository {
  findByCity(city: string): Promise<WeatherCache | null>;
  upsert(city: string, data: WeatherData): Promise<void>;
}
