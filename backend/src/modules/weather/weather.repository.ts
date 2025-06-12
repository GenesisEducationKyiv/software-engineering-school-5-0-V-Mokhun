import { PrismaClient, WeatherCache } from "@prisma/client";
import { IWeatherRepository } from "./weather.service";
import { WeatherData } from "@/shared/ports";

export class WeatherRepository implements IWeatherRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findByCity(city: string): Promise<WeatherCache | null> {
    return this.prisma.weatherCache.findUnique({ where: { city } });
  }

  async upsert(city: string, data: WeatherData): Promise<void> {
    const { temperature, humidity, description } = data;
    await this.prisma.weatherCache.upsert({
      where: { city },
      update: {
        temperature,
        humidity,
        description,
        fetchedAt: new Date(),
      },
      create: {
        city,
        temperature,
        humidity,
        description,
      },
    });
  }
}
