import { WeatherData } from "./weather.port";

export type ConfirmationEmailParams = {
  to: string;
  city: string;
  confirmToken: string;
};

export type WeatherUpdateEmailParams = {
  to: string;
  city: string;
  weatherData: WeatherData;
  unsubscribeToken: string;
};

export interface IEmailService {
  sendConfirmationEmail(params: ConfirmationEmailParams): Promise<void>;

  sendWeatherUpdateEmail(params: WeatherUpdateEmailParams): Promise<void>;
}
