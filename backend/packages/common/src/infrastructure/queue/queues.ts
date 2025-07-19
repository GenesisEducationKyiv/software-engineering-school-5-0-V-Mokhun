import { QUEUE_TYPES } from "@common/constants";
import {
  ConfirmEmailJobData,
  SendWeatherUpdateEmailJobData,
  UpdateWeatherDataJobData,
} from "@common/generated/proto/job_pb";
import { Queue } from "bullmq";
import { createRootConfig } from "./config";
import { defaultQueueOptions } from "./queue.config";

export const getQueues = (config: { host: string; port: number }) => {
  const confirmEmailQueue = new Queue<ConfirmEmailJobData>(
    QUEUE_TYPES.CONFIRM_EMAIL,
    {
      ...createRootConfig(config),
      defaultJobOptions: defaultQueueOptions,
    }
  );

  const sendWeatherUpdateEmailQueue = new Queue<SendWeatherUpdateEmailJobData>(
    QUEUE_TYPES.SEND_WEATHER_UPDATE_EMAIL,
    {
      ...createRootConfig(config),
      defaultJobOptions: defaultQueueOptions,
    }
  );

  const updateWeatherDataQueue = new Queue<UpdateWeatherDataJobData>(
    QUEUE_TYPES.UPDATE_WEATHER_DATA,
    {
      ...createRootConfig(config),
      defaultJobOptions: {
        ...defaultQueueOptions,
        attempts: 5,
      },
    }
  );

  return [
    confirmEmailQueue,
    sendWeatherUpdateEmailQueue,
    updateWeatherDataQueue,
  ];
};

export const resumeQueues = async (queues: Queue[]) => {
  await Promise.all(queues.map((q) => q.resume()));
};

export const pauseQueues = async (queues: Queue[]) => {
  await Promise.all(queues.map((q) => q.pause()));
};

export const clearQueues = async (queues: Queue[]) => {
  await Promise.all(queues.map((q) => q.drain()));
};

export const obliterateQueues = async (queues: Queue[]) => {
  await Promise.all(queues.map((q) => q.obliterate({ force: true })));
};

export const closeQueues = async (queues: Queue[]) => {
  await Promise.all(queues.map((q) => q.close()));
};
