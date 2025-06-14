import { createQueueService } from "@/infrastructure/queue/queue.factory";
import { SubscriptionRepository } from "@/infrastructure/repositories/subscription.repository";
import { ILogger } from "@/shared/logger";
import { IDatabase } from "@/shared/ports/database.port";
import { SubscriptionController } from "./subscription.controller";
import { SubscriptionService } from "./subscription.service";

export function createSubscriptionController({
  logger,
  db
}: {
  logger: ILogger;
  db: IDatabase;
}): SubscriptionController {
  const repo = new SubscriptionRepository(db);
  const queueService = createQueueService({ logger });
  const service = new SubscriptionService(repo, queueService);
  return new SubscriptionController(service);
}
