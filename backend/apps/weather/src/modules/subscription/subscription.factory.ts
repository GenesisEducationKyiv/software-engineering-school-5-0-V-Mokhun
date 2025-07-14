import { createQueueService } from "@common/infrastructure/queue/queue.factory";
import { ILogger } from "@logger/logger.interface";
import { IDatabase } from "@common/shared/ports";
import { SubscriptionRepository } from "@common/infrastructure/repositories/subscription.repository";
import { SubscriptionController } from "./subscription.controller";
import { SubscriptionService } from "./subscription.service";

export function createSubscriptionController({
  logger,
  db,
}: {
  logger: ILogger;
  db: IDatabase;
}): SubscriptionController {
  const repo = new SubscriptionRepository(db);
  const queueService = createQueueService({ logger });
  const service = new SubscriptionService(repo, queueService);
  return new SubscriptionController(service);
}
