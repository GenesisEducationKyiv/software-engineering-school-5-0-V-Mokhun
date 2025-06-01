import { db } from "@/db";
import { WeatherData } from "@/lib/weather";

export const upsertWeatherCache = async (
  city: string,
  weatherData: WeatherData
) => {
  await db.weatherCache.upsert({
    where: { city },
    update: {
      temperature: weatherData.temperature,
      humidity: weatherData.humidity,
      description: weatherData.description,
      fetchedAt: new Date(),
    },
    create: {
      city,
      temperature: weatherData.temperature,
      humidity: weatherData.humidity,
      description: weatherData.description,
    },
  });
};
