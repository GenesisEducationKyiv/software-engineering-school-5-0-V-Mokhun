import { ILogger } from "@logger/logger.interface";
import { IQueueService } from "@common/shared/ports";
import { BullMQService } from "./bullmq.service";
import { getQueues } from "./queues";

export function createQueueService({
  logger,
  connectionConfig,
}: {
  logger: ILogger;
  connectionConfig: { host: string; port: number };
}): IQueueService {
  return new BullMQService(logger, getQueues(connectionConfig));
}
