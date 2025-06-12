import { ConnectionOptions, DefaultJobOptions, Job } from "bullmq";
import { QUEUE_TYPES, JOB_TYPES } from "./constants";

export type QueueType = (typeof QUEUE_TYPES)[keyof typeof QUEUE_TYPES];
export type JobType = (typeof JOB_TYPES)[keyof typeof JOB_TYPES];

export type BaseConfig = {
  queueName: QueueType;
  connection: ConnectionOptions;
};

export type WorkerConfig = BaseConfig & {
  concurrency?: number;
  useWorkerThreads?: boolean;
};

export type QueueConfig = BaseConfig & {
  defaultJobOptions?: DefaultJobOptions;
};

export type JobProcessor = {
  handle: (job: Job) => Promise<any>;
  completed: (job: Job) => void;
  failed: (job: Job | undefined, error: Error) => void;
};
