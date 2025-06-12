import { Job, Worker } from "bullmq";
import { JobProcessor, QueueType, WorkerConfig } from "../types";

export function createWorker(
  queueName: QueueType,
  config: WorkerConfig,
  processorInstance: JobProcessor,
  jobType: string
): Worker {
  const processor = async (job: Job) => {
    if (job.name === jobType) {
      return processorInstance.handle(job);
    }
  };

  const worker = new Worker(queueName, processor, config);

  worker.on("completed", processorInstance.completed.bind(processorInstance));
  worker.on("failed", processorInstance.failed.bind(processorInstance));

  return worker;
}
