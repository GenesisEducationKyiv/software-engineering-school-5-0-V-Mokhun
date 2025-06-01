import { db } from "@/db";
import { WeatherUpdateQueue } from "../queues";
import { Frequency } from "@prisma/client";
import { JOB_TYPES } from "../constants";

/**
 * Scheduler for weather update jobs using BullMQ's Job Schedulers
 */
class WeatherScheduler {
  private getRepeatPattern(frequency: Frequency) {
    switch (frequency) {
      case "HOURLY":
        return "0 * * * *";
      case "DAILY":
        return "0 8 * * *";
      default:
        return "0 8 * * *";
    }
  }

  /**
   * Initialize and schedule all confirmed subscriptions
   */
  async initialize(): Promise<void> {
    try {
      console.info("Initializing weather update scheduler...");
      await this.scheduleAllSubscriptions();
      console.info("Weather update scheduler initialized");
    } catch (error) {
      console.error("Failed to initialize weather scheduler:", error);
      throw error;
    }
  }

  /**
   * Schedule all confirmed subscriptions
   */
  async scheduleAllSubscriptions(): Promise<void> {
    console.info("Scheduling all confirmed subscriptions...");

    // Get all confirmed subscriptions
    const subscriptions = await db.subscription.findMany({
      where: {
        confirmed: true,
        confirmToken: null, // Ensure it's really confirmed
        confirmTokenExpiresAt: null, // Ensure it's really confirmed
      },
    });

    // Remove all existing job schedulers
    const schedulers = await WeatherUpdateQueue.getJobSchedulers();
    for (const scheduler of schedulers) {
      await WeatherUpdateQueue.removeJobScheduler(scheduler.key);
    }

    // Schedule each subscription
    for (const subscription of subscriptions) {
      await this.scheduleSubscription(subscription.id);
    }

    console.info(`Scheduled ${subscriptions.length} subscriptions`);
  }

  /**
   * Schedule a single subscription
   */
  async scheduleSubscription(subscriptionId: number): Promise<void> {
    const subscription = await db.subscription.findFirst({
      where: {
        id: subscriptionId,
        confirmed: true,
        confirmToken: null,
        confirmTokenExpiresAt: null,
      },
    });

    if (!subscription) {
      console.warn(
        `Cannot schedule: Subscription ${subscriptionId} not found or not confirmed`
      );
      return;
    }

    const { frequency } = subscription;

    const repeatOptions = { pattern: this.getRepeatPattern(frequency) };
    const schedulerId = `subscription-${subscriptionId}`;

    try {
      await WeatherUpdateQueue.upsertJobScheduler(schedulerId, repeatOptions, {
        name: JOB_TYPES.UPDATE_WEATHER_DATA,
        data: { subscriptionId },
      });

      console.info(
        `Scheduled ${frequency.toLowerCase()} weather updates for subscription ${subscriptionId}`
      );
    } catch (error) {
      console.error(
        `Failed to schedule subscription ${subscriptionId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Remove a subscription's schedule
   */
  async removeSubscriptionSchedule(subscriptionId: number): Promise<void> {
    const schedulerId = `subscription-${subscriptionId}`;

    try {
      // Remove the job scheduler
      await WeatherUpdateQueue.removeJobScheduler(schedulerId);
      console.info(`Removed schedule for subscription ${subscriptionId}`);
    } catch (error) {
      console.error(
        `Failed to remove schedule for subscription ${subscriptionId}:`,
        error
      );
      throw error;
    }
  }
}

export const weatherScheduler = new WeatherScheduler();
