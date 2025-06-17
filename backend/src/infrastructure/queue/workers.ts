import { ConfirmEmailWorker } from "./jobs/confirm-email";
import { SendWeatherUpdateEmailWorker } from "./jobs/send-weather-update-email";
import { UpdateWeatherDataWorker } from "./jobs/update-weather-data";

export const workers = [
  ConfirmEmailWorker,
  SendWeatherUpdateEmailWorker,
  UpdateWeatherDataWorker,
];
