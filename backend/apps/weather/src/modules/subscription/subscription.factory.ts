import { IQueueService } from "@common/shared/ports";
import { createQueueService } from "@common/infrastructure/queue/queue.factory";
import { ILogger } from "@logger/logger.interface";
import { IDatabase, ISubscriptionMetricsService } from "@/shared/ports";
import { SubscriptionRepository } from "@/infrastructure/repositories/subscription.repository";
import { SubscriptionController } from "./subscription.controller";
import { SubscriptionService } from "./subscription.service";
import { env } from "@/config";

export function createSubscriptionController({
  logger,
  db,
  queueService,
  metricsService,
}: {
  logger: ILogger;
  db: IDatabase;
  queueService?: IQueueService;
  metricsService: ISubscriptionMetricsService;
}): SubscriptionController {
  const repo = new SubscriptionRepository(db);
  const queue =
    queueService ||
    createQueueService({
      logger,
      connectionConfig: { host: env.REDIS_HOST, port: env.REDIS_PORT },
    });
  const service = new SubscriptionService(repo, queue, logger, metricsService);
  return new SubscriptionController(service);
}
