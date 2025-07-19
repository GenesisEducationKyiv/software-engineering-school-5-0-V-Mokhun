export interface IQueueService {
  add<T>(queueName: string, jobName: string, data: T): Promise<void>;

  schedule<T extends Record<string, any>>(
    queueName: string,
    schedulerId: string,
    cron: string,
    jobName: string,
    data: T
  ): Promise<void>;

  removeSchedule(queueName: string, schedulerId: string): Promise<void>;
}
