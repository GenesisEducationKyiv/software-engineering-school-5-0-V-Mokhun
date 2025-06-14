import { Queue } from "bullmq";
import { defaultQueueOptions } from "./common/queue.config";
import { QUEUE_TYPES } from "./constants";
import { ConfirmEmailJobData } from "./jobs/confirm-email/types";
import { SendWeatherUpdateEmailJobData } from "./jobs/send-weather-update-email/types";
import { UpdateWeatherDataJobData } from "./jobs/update-weather-data/types";
import { createRootConfig } from "./config";

const confirmEmailQueue = new Queue<ConfirmEmailJobData>(
  QUEUE_TYPES.CONFIRM_EMAIL,
  {
    ...createRootConfig(),
    defaultJobOptions: defaultQueueOptions,
  }
);

const sendWeatherUpdateEmailQueue = new Queue<SendWeatherUpdateEmailJobData>(
  QUEUE_TYPES.SEND_WEATHER_UPDATE_EMAIL,
  {
    ...createRootConfig(),
    defaultJobOptions: defaultQueueOptions,
  }
);

const updateWeatherDataQueue = new Queue<UpdateWeatherDataJobData>(
  QUEUE_TYPES.UPDATE_WEATHER_DATA,
  {
    ...createRootConfig(),
    defaultJobOptions: {
      ...defaultQueueOptions,
      attempts: 5,
    },
  }
);

export const allQueues = [
  confirmEmailQueue,
  sendWeatherUpdateEmailQueue,
  updateWeatherDataQueue,
];
