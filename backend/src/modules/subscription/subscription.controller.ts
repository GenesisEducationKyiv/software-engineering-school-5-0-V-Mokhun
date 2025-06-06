import { db } from "@/db";
import {
  ConfirmEmailQueue,
  conflictResponse,
  JOB_TYPES,
  notFoundResponse,
  weatherScheduler,
} from "@/lib";
import { NextFunction, Response } from "express";
import {
  ConfirmSubscriptionRequest,
  SubscribeRequest,
  UnsubscribeRequest,
} from "./subscription.route";
import * as subscriptionService from "./subscription.service";

export async function subscribe(
  req: SubscribeRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, city } = req.body;

    const existingSubscription = await db.subscription.findFirst({
      where: {
        email,
        city,
        confirmed: true,
      },
    });

    if (existingSubscription) {
      return conflictResponse(req, res, "Email already subscribed");
    }

    const { confirmToken } = await subscriptionService.subscribe(req.body);

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
}

export async function confirmSubscription(
  req: ConfirmSubscriptionRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { token } = req.params;

    const subscription = await db.subscription.findFirst({
      where: {
        confirmToken: token,
        confirmTokenExpiresAt: {
          gt: new Date(),
        },
      },
    });

    if (
      !subscription ||
      !subscription.confirmTokenExpiresAt ||
      subscription.confirmTokenExpiresAt < new Date()
    ) {
      return notFoundResponse(req, res, "Invalid or expired token");
    }

    await subscriptionService.confirmSubscription(subscription.id);
    await weatherScheduler.scheduleSubscription(subscription.id);

    res.status(200).json({ message: "Subscription confirmed successfully" });
  } catch (error) {
    next(error);
  }
}

export async function unsubscribe(
  req: UnsubscribeRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { token } = req.params;

    const subscription = await db.subscription.findFirst({
      where: { unsubscribeToken: token },
    });

    if (!subscription) {
      return notFoundResponse(req, res, "Invalid token");
    }

    await weatherScheduler.removeSubscriptionSchedule(subscription.id);

    await subscriptionService.unsubscribe(subscription.id);

    res.status(200).json({ message: "Unsubscribed successfully" });
  } catch (error) {
    next(error);
  }
}
