import { IQueueService } from "@common/shared/ports";
import { createQueueService } from "@common/infrastructure/queue/queue.factory";
import { ILogger } from "@logger/logger.interface";
import { IDatabase } from "@common/shared/ports";
import { SubscriptionRepository } from "@/infrastructure/repositories/subscription.repository";
import { SubscriptionController } from "./subscription.controller";
import { SubscriptionService } from "./subscription.service";

export function createSubscriptionController({
  logger,
  db,
  queueService,
}: {
  logger: ILogger;
  db: IDatabase;
  queueService?: IQueueService;
}): SubscriptionController {
  const repo = new SubscriptionRepository(db);
  const queue = queueService || createQueueService({ logger });
  const service = new SubscriptionService(repo, queue);
  return new SubscriptionController(service);
}
