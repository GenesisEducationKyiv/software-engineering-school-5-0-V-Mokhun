import { ILogger } from "@/shared/logger/logger.interface";
import { IQueueService } from "@/shared/ports";
import { Queue } from "bullmq";

export class BullMQService implements IQueueService {
  private readonly queues: Map<string, Queue>;

  constructor(private readonly logger: ILogger, queues: Queue[]) {
    this.queues = new Map(queues.map((q) => [q.name, q]));
  }

  private getQueue(name: string): Queue {
    const queue = this.queues.get(name);
    if (!queue) {
      throw new Error(`Queue with name "${name}" was not found.`);
    }
    return queue;
  }

  public async add<T>(
    queueName: string,
    jobName: string,
    data: T
  ): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.add(jobName, data);
  }

  public async schedule<T extends Record<string, any>>(
    queueName: string,
    schedulerId: string,
    cron: string,
    jobName: string,
    data: T
  ): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.upsertJobScheduler(
      schedulerId,
      { pattern: cron },
      { name: jobName, data }
    );
    this.logger.info(
      `Scheduled job ${jobName} on queue ${queueName} with cron ${cron}`
    );
  }

  public async removeSchedule(
    queueName: string,
    schedulerId: string
  ): Promise<void> {
    try {
      const queue = this.getQueue(queueName);
      await queue.removeJobScheduler(schedulerId);
    } catch (error) {
      this.logger.error(
        `Error removing job scheduler "${schedulerId}" from queue "${queueName}"`,
        error instanceof Error ? error : new Error(JSON.stringify(error))
      );
    }
  }
}
