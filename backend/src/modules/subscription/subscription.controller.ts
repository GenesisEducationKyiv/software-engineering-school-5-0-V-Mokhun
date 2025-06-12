import { NextFunction, Response } from "express";
import {
  conflictResponse,
  ConfirmEmailQueue,
  JOB_TYPES,
  notFoundResponse,
  weatherScheduler,
} from "@/lib";
import {
  ConfirmSubscriptionRequest,
  SubscribeRequest,
  UnsubscribeRequest,
} from "./subscription.types";
import { SubscribeBody } from "./subscription.schema";
import { Subscription } from "@prisma/client";

export interface ISubscriptionService {
  subscribe(data: SubscribeBody): Promise<{ confirmToken: string }>;
  confirmSubscription(token: string): Promise<Subscription>;
  unsubscribe(token: string): Promise<Subscription>;
  isAlreadySubscribed(email: string, city: string): Promise<boolean>;
}

export class SubscriptionController {
  constructor(private readonly service: ISubscriptionService) {}

  subscribe = async (
    req: SubscribeRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email, city } = req.body;

      const existing = await this.service.isAlreadySubscribed(email, city);
      if (existing) {
        return conflictResponse(req, res, "Email already subscribed");
      }

      const { confirmToken } = await this.service.subscribe(req.body);

      await ConfirmEmailQueue.add(JOB_TYPES.CONFIRM_EMAIL, {
        email,
        city,
        confirmToken,
      });

      res.status(200).json({
        message: "Subscription successful. Confirmation email sent.",
      });
    } catch (error) {
      next(error);
    }
  };

  confirmSubscription = async (
    req: ConfirmSubscriptionRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { token } = req.params;

      let subscription;
      try {
        subscription = await this.service.confirmSubscription(token);
      } catch (_) {
        return notFoundResponse(req, res, "Invalid or expired token");
      }

      await weatherScheduler.scheduleSubscription(subscription.id);

      res.status(200).json({ message: "Subscription confirmed successfully" });
    } catch (error) {
      next(error);
    }
  };

  unsubscribe = async (
    req: UnsubscribeRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { token } = req.params;

      let subscription;
      try {
        subscription = await this.service.unsubscribe(token);
      } catch (_) {
        return notFoundResponse(req, res, "Invalid token");
      }

      await weatherScheduler.removeSubscriptionSchedule(subscription.id);

      res.status(200).json({ message: "Unsubscribed successfully" });
    } catch (error) {
      next(error);
    }
  };
}
