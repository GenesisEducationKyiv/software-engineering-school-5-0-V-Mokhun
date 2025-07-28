import { Job, Worker } from "bullmq";
import { ILogger } from "@logger/logger.interface";
import { getCallSites } from "util";

export class JobManager {
  constructor(
    private readonly workers: Worker[],
    private readonly logger: ILogger
  ) {}

  public initializeWorkers(): void {
    this.logger.info({
      message: "Initializing workers...",
      callSites: getCallSites(),
    });

    for (const worker of this.workers) {
      const queueName = worker.name;

      worker.on("error", (error: Error) => {
        this.logger.error({
          message: `Worker for queue ${queueName} error`,
          callSites: getCallSites(),
          meta: {
            queueName,
          },
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
          },
        });
      });

      worker.on("failed", (job: Job | undefined, error: Error) => {
        this.logger.error({
          message: `Worker for queue ${queueName} failed job ${
            job?.id ?? "N/A"
          }`,
          callSites: getCallSites(),
          meta: {
            queueName,
            jobId: job?.id,
          },
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
          },
        });
      });

      this.logger.info({
        message: `Initialized worker for queue: ${queueName}`,
        callSites: getCallSites(),
        meta: {
          queueName,
        },
      });
    }

    this.logger.info({
      message: "Workers initialized successfully.",
      callSites: getCallSites(),
    });
  }

  public async stopWorkers(): Promise<void> {
    this.logger.info({
      message: "Stopping all workers...",
      callSites: getCallSites(),
    });
    await Promise.all(this.workers.map((worker) => worker.close()));
    this.logger.info({
      message: "All workers stopped successfully.",
      callSites: getCallSites(),
    });
  }
}
