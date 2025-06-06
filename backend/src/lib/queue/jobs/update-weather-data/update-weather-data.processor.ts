import { Job } from "bullmq";
import { JobProcessor } from "../../types";
import { UpdateWeatherDataJobData } from "./update-weather-data.config";
import {
  WeatherData,
  weatherService as weatherExternalService,
} from "@/lib/weather";
import { db } from "@/db";
import { CACHE_THRESHOLD } from "@/constants";
import { SendWeatherUpdateEmailQueue } from "../../queues";
import { JOB_TYPES } from "../../constants";
import * as weatherService from "@/modules/weather/weather.service";
export class UpdateWeatherDataProcessor implements JobProcessor {
  async handle(job: Job<UpdateWeatherDataJobData>) {
    const { subscriptionId } = job.data;

    try {
      const subscription = await db.subscription.findUnique({
        where: { id: subscriptionId },
      });

      if (!subscription) {
        console.warn(`Subscription not found for ID: ${subscriptionId}`);
        return;
      }

      if (!subscription.confirmed) {
        console.warn(
          `Skipping unconfirmed subscription for ${subscription.email} - ${subscription.city}`
        );
        return;
      }

      const { email, city, unsubscribeToken } = subscription;

      const cachedWeather = await db.weatherCache.findUnique({
        where: { city },
      });
      const now = new Date();

      let weatherData: WeatherData;
      if (
        cachedWeather &&
        now.getTime() - cachedWeather.fetchedAt.getTime() < CACHE_THRESHOLD
      ) {
        weatherData = {
          temperature: cachedWeather.temperature,
          humidity: cachedWeather.humidity,
          description: cachedWeather.description,
        };
      } else {
        weatherData = await weatherExternalService.getWeatherData(city);

        await weatherService.upsertWeatherCache(city, weatherData);
      }

      await SendWeatherUpdateEmailQueue.add(
        JOB_TYPES.SEND_WEATHER_UPDATE_EMAIL,
        {
          email,
          city,
          unsubscribeToken,
          weatherData,
          subscriptionId,
        }
      );
    } catch (error) {
      console.error(
        `Failed to update weather data for ${subscriptionId}`,
        error
      );
      throw error;
    }
  }

  completed(job: Job) {
    console.log("Weather data update job completed", job.id);
  }

  failed(job: Job | undefined, error: Error) {
    console.error("Weather data update job failed", job?.id, error);
  }
}
