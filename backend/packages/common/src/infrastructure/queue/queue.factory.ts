import { ILogger } from "@logger/logger.interface";
import { IQueueService } from "@common/shared/ports";
import { BullMQService } from "./bullmq.service";
import { allQueues } from "./queues";

export function createQueueService({
  logger,
}: {
  logger: ILogger;
}): IQueueService {
  return new BullMQService(logger, allQueues);
}
