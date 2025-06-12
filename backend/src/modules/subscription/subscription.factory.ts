import { db } from "@/db";
import { SubscriptionRepository } from "./subscription.repository";
import { SubscriptionService } from "./subscription.service";
import { SubscriptionController } from "./subscription.controller";

export function createSubscriptionController(): SubscriptionController {
  const repo = new SubscriptionRepository(db);
  const service = new SubscriptionService(repo);
  return new SubscriptionController(service);
}
