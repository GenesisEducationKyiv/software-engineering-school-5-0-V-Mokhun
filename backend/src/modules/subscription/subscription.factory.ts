import { db } from "@/db";
import { SubscriptionRepository } from "./subscription.repository";
import { SubscriptionService } from "./subscription.service";
import { SubscriptionController } from "./subscription.controller";

/**
 * Composition root for the Subscription module.
 * Creates the concrete repository, service, and controller instances wired
 * together with the shared Prisma client.
 */
export function createSubscriptionController(): SubscriptionController {
  const repo = new SubscriptionRepository(db);
  const service = new SubscriptionService(repo);
  return new SubscriptionController(service);
} 
