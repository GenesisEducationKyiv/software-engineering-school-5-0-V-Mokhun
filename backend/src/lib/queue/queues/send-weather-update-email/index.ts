import { QUEUE_TYPES } from "../../constants";
import { createQueue } from "../queue-factory";
import { SendWeatherUpdateEmailJobData } from "../../jobs";

export const SendWeatherUpdateEmailQueue =
  createQueue<SendWeatherUpdateEmailJobData>(
    QUEUE_TYPES.SEND_WEATHER_UPDATE_EMAIL
  );
