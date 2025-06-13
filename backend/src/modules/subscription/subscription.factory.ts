import { db } from "@/db";
import { SubscriptionRepository } from "@/infrastructure/repositories/subscription.repository";
import { SubscriptionService } from "./subscription.service";
import { SubscriptionController } from "./subscription.controller";
import { createQueueService } from "@/infrastructure/queue/queue.factory";

export function createSubscriptionController(): SubscriptionController {
  const repo = new SubscriptionRepository(db);
  const queueService = createQueueService();
  const service = new SubscriptionService(repo, queueService);
  return new SubscriptionController(service);
}
