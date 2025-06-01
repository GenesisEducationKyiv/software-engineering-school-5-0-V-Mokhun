import { WeatherData } from "@/lib/weather";
import { rootConfig } from "../../config";
import { QUEUE_TYPES } from "../../constants";
import { WorkerConfig } from "../../types";

export const sendWeatherUpdateEmailConfig: WorkerConfig = {
  ...rootConfig,
  queueName: QUEUE_TYPES.SEND_WEATHER_UPDATE_EMAIL,
  concurrency: 1,
};

export type SendWeatherUpdateEmailJobData = {
  subscriptionId: number;
  email: string;
  city: string;
  unsubscribeToken: string;
  weatherData: WeatherData;
};
