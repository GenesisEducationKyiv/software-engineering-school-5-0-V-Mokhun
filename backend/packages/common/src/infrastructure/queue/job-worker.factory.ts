import { Job, Worker } from "bullmq";
import { JobProcessor, QueueType, WorkerConfig } from "./types";

export function createWorker<T>(
  queueName: QueueType,
  config: WorkerConfig,
  processorInstance: JobProcessor<T>,
  jobType: string
): Worker<T> {
  const processor = async (job: Job<T>) => {
    if (job.name === jobType) {
      return processorInstance.handle(job);
    }
  };

  const worker = new Worker<T>(queueName, processor, config);

  worker.on("completed", (job: Job<T>) => {
    processorInstance.completed(job);
  });
  worker.on("failed", (job: Job<T> | undefined, error: Error) => {
    processorInstance.failed(job, error);
  });

  return worker;
}
