import { Queue } from "bullmq";
import { rootConfig } from "../config";
import { QueueConfig, QueueType } from "../types";

export function createQueue<T = any, R = any>(
  queueName: QueueType
): Queue<T, R> {
  const queueConfig: QueueConfig = {
    ...rootConfig,
    queueName,
    defaultJobOptions: {
      removeOnComplete: {
        age: 3600,
        count: 200,
      },
      removeOnFail: {
        age: 24 * 3600,
        count: 1000,
      },
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
    },
  };

  const { queueName: name, ...config } = queueConfig;
  return new Queue(name, config);
}
