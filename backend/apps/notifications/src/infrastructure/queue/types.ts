import { ConnectionOptions, DefaultJobOptions, Job } from "bullmq";
import { QUEUE_TYPES, JOB_TYPES } from "@common/constants";

export type QueueType = (typeof QUEUE_TYPES)[keyof typeof QUEUE_TYPES];
export type JobType = (typeof JOB_TYPES)[keyof typeof JOB_TYPES];

export type BaseConfig = {
  queueName: QueueType;
  connection: ConnectionOptions;
};

export type WorkerConfig = BaseConfig & {
  concurrency?: number;
};

export type QueueConfig = BaseConfig & {
  defaultJobOptions?: DefaultJobOptions;
};

export type JobProcessor<T = Uint8Array> = {
  handle: (job: Job<T>) => Promise<any>;
  completed: (job: Job<T>) => void;
  failed: (job: Job<T> | undefined, error: Error) => void;
};
