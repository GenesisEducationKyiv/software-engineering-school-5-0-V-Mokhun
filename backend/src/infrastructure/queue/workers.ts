import { Worker } from "bullmq";
import { ConfirmEmailWorker } from "./jobs/confirm-email";
import { SendWeatherUpdateEmailWorker } from "./jobs/send-weather-update-email";
import { UpdateWeatherDataWorker } from "./jobs/update-weather-data";

export const workers: Worker[] = [
  ConfirmEmailWorker,
  SendWeatherUpdateEmailWorker,
  UpdateWeatherDataWorker,
];
