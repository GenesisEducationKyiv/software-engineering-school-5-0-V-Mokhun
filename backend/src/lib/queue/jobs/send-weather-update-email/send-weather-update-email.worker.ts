import { createWorker } from "../worker-factory";
import { sendWeatherUpdateEmailConfig } from "./send-weather-update-email.config";
import { SendWeatherUpdateEmailProcessor } from "./send-weather-update-email.processor";
import { JOB_TYPES } from "../../constants";

const instance = new SendWeatherUpdateEmailProcessor();

export const SendWeatherUpdateEmailWorker = createWorker(
  sendWeatherUpdateEmailConfig.queueName,
  sendWeatherUpdateEmailConfig,
  instance,
  JOB_TYPES.SEND_WEATHER_UPDATE_EMAIL
);
