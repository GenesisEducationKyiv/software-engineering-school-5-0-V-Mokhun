import { ConflictException } from "@/shared";
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

      await this.service.subscribe(req.body);

      res.status(201).json({
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
      await this.service.confirmSubscription(token);
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
      await this.service.unsubscribe(token);
      res.status(200).json({ message: "Unsubscribed successfully" });
    } catch (error) {
      next(error);
    }
  };
}
