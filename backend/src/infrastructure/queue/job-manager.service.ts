import { Job, Worker } from "bullmq";
import { ILogger } from "../../shared/logger/logger.interface";

export class JobManager {
  constructor(
    private readonly workers: Worker[],
    private readonly logger: ILogger
  ) {}

  public initializeWorkers(): void {
    this.logger.info("Initializing workers...");

    this.workers.forEach((worker) => {
      const queueName = worker.name;

      worker.on("error", (error: Error) => {
        this.logger.error(`Worker for queue ${queueName} error`, error);
      });

      worker.on("failed", (job: Job | undefined, error: Error) => {
        this.logger.error(
          `Worker for queue ${queueName} failed job ${job?.id ?? "N/A"}`,
          error
        );
      });

      this.logger.info(`Initialized worker for queue: ${queueName}`);
    });

    this.logger.info("Workers initialized successfully.");
  }

  public async stopWorkers(): Promise<void> {
    this.logger.info("Stopping all workers...");
    await Promise.all(this.workers.map((worker) => worker.close()));
    this.logger.info("All workers stopped successfully.");
  }
}
