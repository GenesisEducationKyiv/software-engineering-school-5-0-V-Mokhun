import { bodyValidator, paramValidator } from "@/middleware";
import { ParsedRequest } from "@/types/global";
import { Router } from "express";
import * as subscriptionController from "./subscription.controller";
import {
  ConfirmSubscriptionParams,
  ConfirmSubscriptionParamsSchema,
  SubscribeBody,
  SubscribeBodySchema,
  UnsubscribeParams,
  UnsubscribeParamsSchema,
} from "./subscription.schema";

const router = Router();

export type ConfirmSubscriptionRequest =
  ParsedRequest<ConfirmSubscriptionParams>;
router.get(
  "/confirm/:token",
  paramValidator(ConfirmSubscriptionParamsSchema),
  (req, res, next) =>
    subscriptionController.confirmSubscription(
      req as unknown as ConfirmSubscriptionRequest,
      res,
      next
    )
);

export type UnsubscribeRequest = ParsedRequest<UnsubscribeParams>;
router.get(
  "/unsubscribe/:token",
  paramValidator(UnsubscribeParamsSchema),
  (req, res, next) =>
    subscriptionController.unsubscribe(
      req as unknown as UnsubscribeRequest,
      res,
      next
    )
);

export type SubscribeRequest = ParsedRequest<{}, {}, SubscribeBody>;
router.post(
  "/subscribe",
  bodyValidator(SubscribeBodySchema),
  (req, res, next) =>
    subscriptionController.subscribe(
      req as unknown as SubscribeRequest,
      res,
      next
    )
);

export { router as subscriptionRouter };
