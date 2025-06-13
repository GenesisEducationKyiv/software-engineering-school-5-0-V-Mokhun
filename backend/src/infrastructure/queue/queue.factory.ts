import { getLogger } from "@/shared/logger";
import { IQueueService } from "@/shared/ports";
import { BullMQService } from "./bullmq.service";
import { allQueues } from './queues';

export function createQueueService(): IQueueService {
  const logger = getLogger();
  return new BullMQService(logger, allQueues);
}
