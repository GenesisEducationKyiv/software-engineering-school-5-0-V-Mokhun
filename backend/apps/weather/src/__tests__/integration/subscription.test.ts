import { app } from "@/app";
import { FREQUENCY_TO_CRON, JOB_TYPES, QUEUE_TYPES } from "@common/constants";
import { db } from "@common/db";
import { SubscriptionCreate } from "@common/shared/ports";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { mockQueueService, mockSubscription } from "../mocks";

describe("Subscription Endpoints", () => {
  beforeEach(async () => {
    jest.resetAllMocks();
  });

  const createSubscription = async (data: Partial<SubscriptionCreate> = {}) => {
    const subscription = await db.subscription.create({
      data: {
        ...mockSubscription,
        ...data,
      },
    });
    return subscription;
  };

  describe("POST /api/subscribe", () => {
    it("should create a subscription and queue a confirmation email job", async () => {
      const response = await request(app).post("/api/subscribe").send({
        email: mockSubscription.email,
        city: mockSubscription.city,
        frequency: "daily",
      });

      expect(response.status).toBe(StatusCodes.CREATED);

      const subscription = await db.subscription.findUnique({
        where: {
          email_city: {
            email: mockSubscription.email,
            city: mockSubscription.city,
          },
        },
      });
      expect(subscription).toBeTruthy();
      expect(subscription?.confirmed).toBeFalsy();
      expect(subscription?.confirmToken).toBeTruthy();

      expect(mockQueueService.add).toHaveBeenCalledWith(
        QUEUE_TYPES.CONFIRM_EMAIL,
        JOB_TYPES.CONFIRM_EMAIL,
        {
          email: subscription?.email,
          city: subscription?.city,
          confirmToken: subscription?.confirmToken,
        }
      );
      // const jobs = await confirmEmailQueue.getJobs();
      // const [job] = jobs;
      // expect(job).toBeTruthy();
      // expect(job?.data?.email).toBe(subscription?.email);
      // expect(job?.data?.city).toBe(subscription?.city);
      // expect(job?.data?.confirmToken).toBe(subscription?.confirmToken);
    });

    it("should return 409 if email is already subscribed", async () => {
      await createSubscription({
        confirmed: true,
      });

      const response = await request(app).post("/api/subscribe").send({
        email: mockSubscription.email,
        city: mockSubscription.city,
        frequency: "daily",
      });

      expect(response.status).toBe(StatusCodes.CONFLICT);
    });
  });

  describe("GET /api/confirm/:token", () => {
    it("should confirm a subscription and schedule a weather update", async () => {
      const subscription = await createSubscription();

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

      expect(mockQueueService.schedule).toHaveBeenCalledWith(
        QUEUE_TYPES.UPDATE_WEATHER_DATA,
        `sub-${subscription.id}`,
        FREQUENCY_TO_CRON[subscription.frequency],
        QUEUE_TYPES.UPDATE_WEATHER_DATA,
        { city: subscription.city }
      );
    });

    it("should return 404 if confirm token is invalid", async () => {
      await createSubscription();

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
      expect(mockQueueService.removeSchedule).toHaveBeenCalledWith(
        QUEUE_TYPES.UPDATE_WEATHER_DATA,
        `sub-${subscription.id}`
      );
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
