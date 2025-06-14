import { ILogger } from "@/shared/logger";
import { IQueueService } from "@/shared/ports";
import { BullMQService } from "./bullmq.service";
import { allQueues } from "./queues";

export function createQueueService({
  logger,
}: {
  logger: ILogger;
}): IQueueService {
  return new BullMQService(logger, allQueues);
}
