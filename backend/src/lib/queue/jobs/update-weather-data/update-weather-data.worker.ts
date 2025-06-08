import { createWorker } from "../worker-factory";
import { updateWeatherDataConfig } from "./update-weather-data.config";
import { UpdateWeatherDataProcessor } from "./update-weather-data.processor";
import { JOB_TYPES } from "../../constants";

const instance = new UpdateWeatherDataProcessor();

export const UpdateWeatherDataWorker = createWorker(
  updateWeatherDataConfig.queueName,
  updateWeatherDataConfig,
  instance,
  JOB_TYPES.UPDATE_WEATHER_DATA
);
