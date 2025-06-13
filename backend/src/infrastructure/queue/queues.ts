import { Queue } from "bullmq";
import { redisConnection } from "./config";
import { defaultQueueOptions } from "./common/queue.config";
import { QUEUE_TYPES } from "./constants";
import { ConfirmEmailJobData } from "./jobs/confirm-email/types";
import { SendWeatherUpdateEmailJobData } from "./jobs/send-weather-update-email/types";
import { UpdateWeatherDataJobData } from "./jobs/update-weather-data/types";

const confirmEmailQueue = new Queue<ConfirmEmailJobData>(
  QUEUE_TYPES.CONFIRM_EMAIL,
  {
    connection: redisConnection,
    defaultJobOptions: defaultQueueOptions,
  }
);

const sendWeatherUpdateEmailQueue = new Queue<SendWeatherUpdateEmailJobData>(
  QUEUE_TYPES.SEND_WEATHER_UPDATE_EMAIL,
  {
    connection: redisConnection,
    defaultJobOptions: defaultQueueOptions,
  }
);

const updateWeatherDataQueue = new Queue<UpdateWeatherDataJobData>(
  QUEUE_TYPES.UPDATE_WEATHER_DATA,
  {
    connection: redisConnection,
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
