import { Frequency } from "@db";

export const SUBSCRIPTION_CONFIRMATION_EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours

export const FREQUENCY_TO_CRON: Record<Frequency, string> = {
  [Frequency.HOURLY]: "0 * * * *",
  [Frequency.DAILY]: "0 9 * * *",
};
