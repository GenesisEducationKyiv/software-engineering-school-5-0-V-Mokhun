import { ILogger } from "@logger/logger.interface";
import { IQueueService } from "@common/shared/ports";
import { Queue } from "bullmq";
import { getCallSites } from "util";

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
    this.logger.info({
      message: `Scheduled job ${jobName} on queue ${queueName} with cron ${cron}`,
      callSites: getCallSites(),
      meta: {
        queueName,
        jobName,
        cron,
      },
    });
  }

  public async removeSchedule(
    queueName: string,
    schedulerId: string
  ): Promise<void> {
    try {
      const queue = this.getQueue(queueName);
      await queue.removeJobScheduler(schedulerId);
    } catch (error) {
      this.logger.error({
        message: `Error removing job scheduler "${schedulerId}" from queue "${queueName}"`,
        callSites: getCallSites(),
        meta: {
          queueName,
          schedulerId,
        },
        error: {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : undefined,
        },
      });
    }
  }
}
