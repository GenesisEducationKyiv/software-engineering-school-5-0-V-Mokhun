import { SUBSCRIPTION_CONFIRMATION_EXPIRATION_TIME } from "@/constants";
import { db } from "@/db";
import { FREQUENCY_MAP, SubscribeBody } from "./subscription.schema";
import crypto from "crypto";

export const subscribe = async (data: SubscribeBody) => {
  const { email, city, frequency } = data;

  const confirmToken = crypto.randomBytes(32).toString("hex");
  const unsubscribeToken = crypto.randomBytes(32).toString("hex");

  const confirmTokenExpiresAt = new Date(
    Date.now() + SUBSCRIPTION_CONFIRMATION_EXPIRATION_TIME
  );

  await db.subscription.upsert({
    where: {
      email_city: {
        email,
        city,
      },
    },
    update: {
      frequency: FREQUENCY_MAP[frequency],
      confirmToken,
      confirmTokenExpiresAt,
      unsubscribeToken,
      confirmed: false,
    },
    create: {
      email,
      city,
      frequency: FREQUENCY_MAP[frequency],
      confirmToken,
      confirmTokenExpiresAt,
      unsubscribeToken,
      confirmed: false,
    },
  });

  return {
    confirmToken,
    unsubscribeToken,
  };
};

export const confirmSubscription = async (subscriptionId: number) => {
  return db.subscription.update({
    where: { id: subscriptionId },
    data: {
      confirmed: true,
      confirmToken: null,
      confirmTokenExpiresAt: null,
    },
  });
};

export const unsubscribe = async (subscriptionId: number) => {
  return db.subscription.delete({
    where: { id: subscriptionId },
  });
};
