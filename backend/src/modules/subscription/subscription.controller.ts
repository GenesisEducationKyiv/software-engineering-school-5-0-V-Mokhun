import {
  ConfirmEmailQueue,
  JOB_TYPES,
  weatherScheduler,
} from "@/infrastructure/queue";
import { ConflictException, NotFoundException } from "@/shared";
import { Subscription } from "@prisma/client";
import { NextFunction, Response } from "express";
import { SubscribeBody } from "./subscription.schema";
import {
  ConfirmSubscriptionRequest,
  SubscribeRequest,
  UnsubscribeRequest,
} from "./subscription.types";

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
        throw new ConflictException("Email already subscribed");
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

      const subscription = await this.service.confirmSubscription(token);
      if (!subscription) {
        throw new NotFoundException("Invalid or expired token");
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

      const subscription = await this.service.unsubscribe(token);
      if (!subscription) {
        throw new NotFoundException("Invalid token");
      }

      await weatherScheduler.removeSubscriptionSchedule(subscription.id);

      res.status(200).json({ message: "Unsubscribed successfully" });
    } catch (error) {
      next(error);
    }
  };
}
