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

const router = Router();

const controller = createSubscriptionController();

router.get(
  "/confirm/:token",
  paramValidator(ConfirmSubscriptionParamsSchema),
  (req, res, next) =>
    controller.confirmSubscription(
      req as unknown as ConfirmSubscriptionRequest,
      res,
      next
    )
);

router.get(
  "/unsubscribe/:token",
  paramValidator(UnsubscribeParamsSchema),
  (req, res, next) =>
    controller.unsubscribe(req as unknown as UnsubscribeRequest, res, next)
);

router.post(
  "/subscribe",
  bodyValidator(SubscribeBodySchema),
  (req, res, next) =>
    controller.subscribe(req as unknown as SubscribeRequest, res, next)
);

export { router as subscriptionRouter };
