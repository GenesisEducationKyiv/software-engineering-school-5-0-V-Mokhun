import { WeatherData } from "@common/generated/proto/job_pb";

export type ConfirmationEmailParams = {
  to: string;
  city: string;
  confirmUrl: string;
};

export type WeatherUpdateEmailParams = {
  to: string;
  city: string;
  weatherData: WeatherData;
  unsubscribeUrl: string;
};

export interface IEmailService {
  sendConfirmationEmail(params: ConfirmationEmailParams): Promise<void>;

  sendWeatherUpdateEmail(params: WeatherUpdateEmailParams): Promise<void>;
}
