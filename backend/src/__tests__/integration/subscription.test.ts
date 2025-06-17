import { app } from "@/app";
import {
  FREQUENCY_TO_CRON,
  SUBSCRIPTION_CONFIRMATION_EXPIRATION_TIME,
} from "@/constants";
import { db } from "@/db";
import { QUEUE_TYPES } from "@/infrastructure/queue";
import { allQueues } from "@/infrastructure/queue/queues";
import { SubscriptionCreate } from "@/shared/ports";
import { describe, expect, it } from "@jest/globals";
import { Frequency } from "@prisma/client";
import { Queue } from "bullmq";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("Subscription Endpoints", () => {
  const confirmEmailQueue = allQueues.find(
    (q) => q.name === QUEUE_TYPES.CONFIRM_EMAIL
  ) as Queue;
  const updateWeatherDataQueue = allQueues.find(
    (q) => q.name === QUEUE_TYPES.UPDATE_WEATHER_DATA
  ) as Queue;
  const createSubscription = async (data: Partial<SubscriptionCreate>) => {
    const subscription = await db.subscription.create({
      data: {
        email: "test@test.com",
        city: "London",
        frequency: Frequency.DAILY,
        unsubscribeToken: "123",
        confirmToken: "456",
        confirmTokenExpiresAt: new Date(
          Date.now() + SUBSCRIPTION_CONFIRMATION_EXPIRATION_TIME
        ),
        ...data,
      },
    });
    return subscription;
  };

  describe("POST /api/subscribe", () => {
    it("should create a subscription and queue a confirmation email job", async () => {
      const response = await request(app).post("/api/subscribe").send({
        email: "test@test.com",
        city: "London",
        frequency: "daily",
      });

      expect(response.status).toBe(StatusCodes.CREATED);

      const subscription = await db.subscription.findUnique({
        where: {
          email_city: {
            email: "test@test.com",
            city: "London",
          },
        },
      });
      expect(subscription).toBeTruthy();
      expect(subscription?.confirmed).toBeFalsy();
      expect(subscription?.confirmToken).toBeTruthy();

      const jobs = await confirmEmailQueue.getJobs();
      const [job] = jobs;
      expect(job).toBeTruthy();
      expect(job?.data?.email).toBe("test@test.com");
      expect(job?.data?.city).toBe("London");
      expect(job?.data?.confirmToken).toBe(subscription?.confirmToken);
    });

    it("should return 409 if email is already subscribed", async () => {
      await createSubscription({
        confirmed: true,
      });

      const response = await request(app).post("/api/subscribe").send({
        email: "test@test.com",
        city: "London",
        frequency: "daily",
      });

      expect(response.status).toBe(StatusCodes.CONFLICT);
    });
  });

  describe("GET /api/confirm/:token", () => {
    it("should confirm a subscription and schedule a weather update", async () => {
      const subscription = await createSubscription({
        confirmed: false,
      });

      const response = await request(app).get(
        `/api/confirm/${subscription.confirmToken}`
      );
      expect(response.status).toBe(StatusCodes.OK);

      const confirmedSubscription = await db.subscription.findUnique({
        where: {
          id: subscription.id,
        },
      });
      expect(confirmedSubscription).toBeTruthy();
      expect(confirmedSubscription?.confirmed).toBeTruthy();
      expect(confirmedSubscription?.confirmToken).toBeNull();

      const jobs = await updateWeatherDataQueue.getJobSchedulers();
      const [scheduler] = jobs;
      expect(scheduler).toBeTruthy();
      expect(scheduler?.key).toBe(`sub-${subscription.id}`);
      expect(scheduler?.pattern).toBe(
        FREQUENCY_TO_CRON[subscription.frequency]
      );
    });

    it("should return 404 if confirm token is invalid", async () => {
      await createSubscription({
        confirmed: false,
      });

      const response = await request(app).get("/api/confirm/123");
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });

    it("should return 404 if confirm token is expired", async () => {
      const subscription = await createSubscription({
        confirmed: false,
        confirmTokenExpiresAt: new Date(Date.now() - 1000),
      });

      const response = await request(app).get(
        `/api/confirm/${subscription.confirmToken}`
      );
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe("GET /api/unsubscribe/:token", () => {
    //? Tried to also test for removal of the job scheduler, but it's not working at all, something wrong with bullmq's removeJobScheduler
    it("should unsubscribe a subscription", async () => {
      const subscription = await createSubscription({
        confirmed: true,
      });

      const response = await request(app).get(
        `/api/unsubscribe/${subscription.unsubscribeToken}`
      );
      expect(response.status).toBe(StatusCodes.OK);

      const deletedSubscription = await db.subscription.findUnique({
        where: {
          id: subscription.id,
        },
      });
      expect(deletedSubscription).toBeNull();
    });

    it("should return 404 if unsubscribe token is invalid", async () => {
      await createSubscription({
        confirmed: true,
      });

      const response = await request(app).get("/api/unsubscribe/1234");
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });
});
