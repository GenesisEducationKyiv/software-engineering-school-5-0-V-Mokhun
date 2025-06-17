import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { ConfirmEmailProcessor } from "@/infrastructure/queue/jobs/confirm-email/processor";
import { ConfirmEmailJobData } from "@/infrastructure/queue/jobs/confirm-email/types";
import { Frequency } from "@prisma/client";
import {
  createMockEmailService,
  createMockSubscriptionRepository,
  createMockEmailLogRepository,
  createMockLogger,
  createMockJob,
} from "@/__tests__/mocks";

const mockEmailService = createMockEmailService();
const mockSubscriptionRepo = createMockSubscriptionRepository();
const mockEmailLogRepo = createMockEmailLogRepository();
const mockLogger = createMockLogger();

describe("ConfirmEmailProcessor", () => {
  let processor: ConfirmEmailProcessor;

  beforeEach(() => {
    jest.resetAllMocks();

    processor = new ConfirmEmailProcessor(
      mockEmailService,
      mockSubscriptionRepo,
      mockEmailLogRepo,
      mockLogger
    );
  });

  describe("handle", () => {
    const mockSubscription = {
      id: 1,
      email: "test@example.com",
      city: "London",
      frequency: Frequency.DAILY,
      confirmed: false,
      unsubscribeToken: "unsubscribe-token-123",
      confirmToken: "confirm-token-456",
      confirmTokenExpiresAt: new Date(Date.now() + 3600000),
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSentAt: null,
    };

    const jobData: ConfirmEmailJobData = {
      email: "test@example.com",
      city: "London",
      confirmToken: "confirm-token-456",
    };

    it("should send confirmation email and log success", async () => {
      const job = createMockJob(jobData, "confirm-email");

      mockSubscriptionRepo.findSubscriptionByEmailAndCity.mockResolvedValue(
        mockSubscription
      );

      await processor.handle(job);

      expect(mockEmailService.send).toHaveBeenCalledWith({
        to: "test@example.com",
        subject: "Confirm your weather subscription for London",
        html: expect.stringContaining("London"),
      });

      expect(
        mockSubscriptionRepo.findSubscriptionByEmailAndCity
      ).toHaveBeenCalledWith("test@example.com", "London");

      expect(mockEmailLogRepo.create).toHaveBeenCalledWith({
        subscriptionId: 1,
        type: "subscription_confirmation",
        status: "sent",
        sentAt: expect.any(Date),
      });
    });

    it("should handle email service error and log failure", async () => {
      const job = createMockJob(jobData, "confirm-email");
      const emailError = new Error("Email service error");

      mockEmailService.send.mockRejectedValue(emailError);
      mockSubscriptionRepo.findSubscriptionByEmailAndCity.mockResolvedValue(
        mockSubscription
      );

      await expect(processor.handle(job)).rejects.toThrow(
        "Email service error"
      );

      expect(mockEmailService.send).toHaveBeenCalledWith({
        to: "test@example.com",
        subject: "Confirm your weather subscription for London",
        html: expect.stringContaining("London"),
      });

      expect(
        mockSubscriptionRepo.findSubscriptionByEmailAndCity
      ).toHaveBeenCalledWith("test@example.com", "London");

      expect(mockEmailLogRepo.create).toHaveBeenCalledWith({
        subscriptionId: 1,
        status: "failed",
        type: "subscription_confirmation",
        errorMessage: "Email service error",
        sentAt: expect.any(Date),
      });
    });

    it("should throw error when subscription not found after sending email", async () => {
      const job = createMockJob(jobData, "confirm-email");

      mockSubscriptionRepo.findSubscriptionByEmailAndCity.mockResolvedValue(
        null
      );

      await expect(processor.handle(job)).rejects.toThrow();

      expect(mockEmailService.send).toHaveBeenCalledWith({
        to: "test@example.com",
        subject: "Confirm your weather subscription for London",
        html: expect.stringContaining("London"),
      });

      expect(
        mockSubscriptionRepo.findSubscriptionByEmailAndCity
      ).toHaveBeenCalledWith("test@example.com", "London");

      expect(mockEmailLogRepo.create).not.toHaveBeenCalled();
    });

    it("should handle unknown error type in error logging", async () => {
      const job = createMockJob(jobData, "confirm-email");
      const unknownError = "String error";

      mockEmailService.send.mockRejectedValue(unknownError);
      mockSubscriptionRepo.findSubscriptionByEmailAndCity.mockResolvedValue(
        mockSubscription
      );

      await expect(processor.handle(job)).rejects.toBe(unknownError);

      expect(mockEmailLogRepo.create).toHaveBeenCalledWith({
        subscriptionId: 1,
        status: "failed",
        type: "subscription_confirmation",
        errorMessage: "Unknown error",
        sentAt: expect.any(Date),
      });
    });

    it("should handle email log repository error during success path", async () => {
      const job = createMockJob(jobData, "confirm-email");
      const logError = new Error("Log repository error");

      mockSubscriptionRepo.findSubscriptionByEmailAndCity.mockResolvedValue(
        mockSubscription
      );
      mockEmailLogRepo.create.mockRejectedValueOnce(logError);

      await expect(processor.handle(job)).rejects.toThrow(
        "Log repository error"
      );

      expect(mockEmailService.send).toHaveBeenCalledWith({
        to: "test@example.com",
        subject: "Confirm your weather subscription for London",
        html: expect.stringContaining("London"),
      });

      expect(
        mockSubscriptionRepo.findSubscriptionByEmailAndCity
      ).toHaveBeenCalledWith("test@example.com", "London");

      expect(mockEmailLogRepo.create).toHaveBeenCalledTimes(2);

      expect(mockEmailLogRepo.create).toHaveBeenNthCalledWith(1, {
        subscriptionId: 1,
        type: "subscription_confirmation",
        status: "sent",
        sentAt: expect.any(Date),
      });

      expect(mockEmailLogRepo.create).toHaveBeenNthCalledWith(2, {
        subscriptionId: 1,
        status: "failed",
        type: "subscription_confirmation",
        errorMessage: "Log repository error",
        sentAt: expect.any(Date),
      });
    });
  });

  describe("completed", () => {
    it("should log completion message", () => {
      const jobData: ConfirmEmailJobData = {
        email: "test@example.com",
        city: "London",
        confirmToken: "confirm-token-456",
      };
      const job = createMockJob(jobData, "confirm-email");

      processor.completed(job);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          jobId: "123",
        })
      );
    });
  });

  describe("failed", () => {
    it("should log failure message with job data", () => {
      const jobData: ConfirmEmailJobData = {
        email: "test@example.com",
        city: "London",
        confirmToken: "confirm-token-456",
      };
      const job = createMockJob(jobData, "confirm-email");
      const error = new Error("Test error");

      processor.failed(job, error);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.any(String),
        error,
        expect.objectContaining({
          jobId: "123",
        })
      );
    });

    it("should log failure message without job data when job is undefined", () => {
      const error = new Error("Test error");

      processor.failed(undefined, error);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.any(String),
        error,
        expect.objectContaining({
          jobId: undefined,
        })
      );
    });
  });
});
