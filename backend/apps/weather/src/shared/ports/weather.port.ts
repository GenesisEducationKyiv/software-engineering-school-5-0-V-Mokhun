import { z } from "zod";

export const weatherDataSchema = z.object({
  temperature: z.number(),
  humidity: z.number(),
  description: z.string(),
});

export type WeatherData = z.infer<typeof weatherDataSchema>;

export interface IWeatherProvider {
  getWeatherData(city: string): Promise<WeatherData>;
}
