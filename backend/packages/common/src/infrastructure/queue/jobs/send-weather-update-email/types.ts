import { WeatherData } from "@common/shared/ports";

export const SEND_WEATHER_UPDATE_EMAIL_JOB = "send-weather-update-email";

export interface SendWeatherUpdateEmailJobData {
  subscriptionId: number;
  email: string;
  city: string;
  unsubscribeToken: string;
  weatherData: WeatherData;
}
