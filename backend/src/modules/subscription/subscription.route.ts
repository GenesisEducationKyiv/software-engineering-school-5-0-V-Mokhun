import { bodyValidator, paramValidator } from "@/middleware";
import { Router } from "express";
import { createSubscriptionController } from "./subscription.factory";
import {
  ConfirmSubscriptionParamsSchema,
  SubscribeBodySchema,
  UnsubscribeParamsSchema,
} from "./subscription.schema";
import {
  ConfirmSubscriptionRequest,
  SubscribeRequest,
  UnsubscribeRequest,
} from "./subscription.types";
import { getLogger } from "@/shared/logger";
import { getDb } from "@/db";

const router = Router();

const controller = createSubscriptionController({
  logger: getLogger(),
  db: getDb(),
});

router.get(
  "/confirm/:token",
  paramValidator(ConfirmSubscriptionParamsSchema),
  (req, res, next) =>
    controller.confirmSubscription(
      req as ConfirmSubscriptionRequest,
      res,
      next
    )
);

router.get(
  "/unsubscribe/:token",
  paramValidator(UnsubscribeParamsSchema),
  (req, res, next) =>
    controller.unsubscribe(req as UnsubscribeRequest, res, next)
);

router.post(
  "/subscribe",
  bodyValidator(SubscribeBodySchema),
  (req, res, next) =>
    controller.subscribe(req as SubscribeRequest, res, next)
);

export { router as subscriptionRouter };
