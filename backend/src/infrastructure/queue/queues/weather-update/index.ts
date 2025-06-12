import { QUEUE_TYPES } from "../../constants";
import { createQueue } from "../queue-factory";
import { UpdateWeatherDataJobData } from "../../jobs";

export const WeatherUpdateQueue = createQueue<UpdateWeatherDataJobData>(
  QUEUE_TYPES.WEATHER_UPDATE
);
