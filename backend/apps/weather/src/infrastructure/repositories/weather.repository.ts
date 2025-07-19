import { WeatherCache } from "@prisma/client";
import { IDatabase } from "@common/shared/ports";
import { IWeatherRepository, WeatherData } from "@/shared/ports";

export class WeatherRepository implements IWeatherRepository {
  constructor(private readonly db: IDatabase) {}

  findByCity(city: string): Promise<WeatherCache | null> {
    return this.db.weatherCache.findUnique({ where: { city } });
  }

  async upsert(city: string, data: WeatherData): Promise<void> {
    const { temperature, humidity, description } = data;
    await this.db.weatherCache.upsert({
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
