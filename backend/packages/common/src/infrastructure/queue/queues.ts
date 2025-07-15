import { Queue } from "bullmq";
import { defaultQueueOptions } from "./queue.config";
import { QUEUE_TYPES } from "@common/constants";
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

export const resumeQueues = async () => {
  await Promise.all(allQueues.map((q) => q.resume()));
};

export const pauseQueues = async () => {
  await Promise.all(allQueues.map((q) => q.pause()));
};

export const clearQueues = async () => {
  await Promise.all(allQueues.map((q) => q.drain()));
};

export const obliterateQueues = async () => {
  await Promise.all(allQueues.map((q) => q.obliterate({ force: true })));
};

export const closeQueues = async () => {
  await Promise.all(allQueues.map((q) => q.close()));
};
