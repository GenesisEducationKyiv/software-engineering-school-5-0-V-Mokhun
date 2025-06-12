import { rootConfig } from "../../config";
import { QUEUE_TYPES } from "../../constants";
import { WorkerConfig } from "../../types";

export const updateWeatherDataConfig: WorkerConfig = {
  ...rootConfig,
  queueName: QUEUE_TYPES.WEATHER_UPDATE,
  concurrency: 1,
};

export type UpdateWeatherDataJobData = {
  subscriptionId: number;
};
