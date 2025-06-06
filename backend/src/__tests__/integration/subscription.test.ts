//? Tests pass successfully, relative imports work but vscode doesnt pick up the types. Tried to fix but no luck. Decided to leave as is because it took too long ;)
import { prisma } from "@/__mocks__/@prisma/client";
import { app } from "@/app";
import { HTTP_STATUS_CODE } from "@/constants";
import { ConfirmEmailQueue, JOB_TYPES, weatherScheduler } from "@/lib";
import { SubscribeBody } from "@/modules/subscription/subscription.schema";
import * as subscriptionService from "@/modules/subscription/subscription.service";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Subscription } from "@prisma/client";
import request from "supertest";

jest.mock("@/modules/subscription/subscription.service", () => ({
  subscribe: jest.fn(),
  confirmSubscription: jest.fn(),
  unsubscribe: jest.fn(),
}));

jest.mock("@/lib/queue", () => ({
  ConfirmEmailQueue: {
    add: jest.fn(),
  },
  JOB_TYPES: {
    CONFIRM_EMAIL: "CONFIRM_EMAIL",
  },
  weatherScheduler: {
    scheduleSubscription: jest.fn(),
    removeSubscriptionSchedule: jest.fn(),
  },
}));

describe("Subscription Endpoints", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("POST /api/subscribe", () => {
    const subscribeData: SubscribeBody = {
      email: "test@example.com",
      city: "London",
      frequency: "hourly",
    };

    it("should successfully create new subscription and send confirmation email", async () => {
      jest.mocked(prisma.subscription.findFirst).mockResolvedValue(null);

      jest.mocked(subscriptionService.subscribe).mockResolvedValue({
        confirmToken: "test-confirm-token",
        unsubscribeToken: "test-unsubscribe-token",
      });

      const response = await request(app)
        .post("/api/subscribe")
        .send(subscribeData);

      expect(response.status).toBe(HTTP_STATUS_CODE.SUCCESS);
      expect(response.body).toEqual({
        message: "Subscription successful. Confirmation email sent.",
      });

      expect(ConfirmEmailQueue.add).toHaveBeenCalledWith(
        JOB_TYPES.CONFIRM_EMAIL,
        {
          email: subscribeData.email,
          city: subscribeData.city,
          confirmToken: "test-confirm-token",
        }
      );
    });

    it("should return 409 if email is already subscribed to the city", async () => {
      jest.mocked(prisma.subscription.findFirst).mockResolvedValue({
        id: 1,
        email: subscribeData.email,
        city: subscribeData.city,
        frequency: "DAILY",
        confirmed: true,
      } as Subscription);

      const response = await request(app)
        .post("/api/subscribe")
        .send(subscribeData);

      expect(response.status).toBe(HTTP_STATUS_CODE.CONFLICT);
      expect(response.body).toHaveProperty("message");
      expect(subscriptionService.subscribe).not.toHaveBeenCalled();
      expect(ConfirmEmailQueue.add).not.toHaveBeenCalled();
    });

    it("should return 400 for invalid email format", async () => {
      const response = await request(app)
        .post("/api/subscribe")
        .send({
          ...subscribeData,
          email: "invalid-email",
        });

      expect(response.status).toBe(HTTP_STATUS_CODE.BAD_REQUEST);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("errors");
    });

    it("should return 400 for missing required fields", async () => {
      const response = await request(app).post("/api/subscribe").send({
        email: subscribeData.email,
      });

      expect(response.status).toBe(HTTP_STATUS_CODE.BAD_REQUEST);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("errors");
    });
  });

  describe("GET /api/confirm/:token", () => {
    const mockSubscription: Subscription = {
      id: 1,
      email: "test@example.com",
      city: "London",
      frequency: "HOURLY",
      confirmed: false,
      confirmToken: "valid-token",
      confirmTokenExpiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      unsubscribeToken: "unsubscribe-token",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSentAt: null,
    };

    it("should successfully confirm subscription", async () => {
      jest
        .mocked(prisma.subscription.findFirst)
        .mockResolvedValue(mockSubscription);

      jest.mocked(subscriptionService.confirmSubscription).mockResolvedValue({
        ...mockSubscription,
        confirmed: true,
        confirmToken: null,
        confirmTokenExpiresAt: null,
      });

      const response = await request(app).get("/api/confirm/valid-token");

      expect(response.status).toBe(HTTP_STATUS_CODE.SUCCESS);
      expect(response.body).toEqual({
        message: "Subscription confirmed successfully",
      });

      expect(weatherScheduler.scheduleSubscription).toHaveBeenCalledWith(
        mockSubscription.id
      );
    });

    it("should return 404 for expired token", async () => {
      jest.mocked(prisma.subscription.findFirst).mockResolvedValue({
        ...mockSubscription,
        confirmTokenExpiresAt: new Date(Date.now() - 3600000), // 1 hour ago
      });

      const response = await request(app).get("/api/confirm/expired-token");

      expect(response.status).toBe(HTTP_STATUS_CODE.NOT_FOUND);
      expect(response.body).toHaveProperty("message");
      expect(subscriptionService.confirmSubscription).not.toHaveBeenCalled();
      expect(weatherScheduler.scheduleSubscription).not.toHaveBeenCalled();
    });

    it("should return 404 for invalid token", async () => {
      jest.mocked(prisma.subscription.findFirst).mockResolvedValue(null);

      const response = await request(app).get("/api/confirm/invalid-token");

      expect(response.status).toBe(HTTP_STATUS_CODE.NOT_FOUND);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("GET /api/unsubscribe/:token", () => {
    const mockSubscription: Subscription = {
      id: 1,
      email: "test@example.com",
      city: "London",
      frequency: "HOURLY",
      confirmed: true,
      confirmToken: null,
      confirmTokenExpiresAt: null,
      unsubscribeToken: "valid-token",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSentAt: null,
    };

    it("should successfully unsubscribe", async () => {
      jest
        .mocked(prisma.subscription.findFirst)
        .mockResolvedValue(mockSubscription);

      jest.mocked(subscriptionService.unsubscribe).mockResolvedValue({
        ...mockSubscription,
        confirmed: false,
      });

      const response = await request(app).get("/api/unsubscribe/valid-token");

      expect(response.status).toBe(HTTP_STATUS_CODE.SUCCESS);
      expect(response.body).toEqual({
        message: "Unsubscribed successfully",
      });

      expect(weatherScheduler.removeSubscriptionSchedule).toHaveBeenCalledWith(
        mockSubscription.id
      );
      expect(subscriptionService.unsubscribe).toHaveBeenCalledWith(
        mockSubscription.id
      );
    });

    it("should return 404 for invalid token", async () => {
      jest.mocked(prisma.subscription.findFirst).mockResolvedValue(null);

      const response = await request(app).get("/api/unsubscribe/invalid-token");

      expect(response.status).toBe(HTTP_STATUS_CODE.NOT_FOUND);
      expect(response.body).toHaveProperty("message");
      expect(
        weatherScheduler.removeSubscriptionSchedule
      ).not.toHaveBeenCalled();
      expect(subscriptionService.unsubscribe).not.toHaveBeenCalled();
    });
  });
});
