import { WeatherCache } from "@db";
import { WeatherData } from "./weather.port";

export interface IWeatherRepository {
  findByCity(city: string): Promise<WeatherCache | null>;
  upsert(city: string, data: WeatherData): Promise<void>;
}
