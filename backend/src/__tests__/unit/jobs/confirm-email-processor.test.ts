import {
  createMockEmailLogRepository,
  createMockEmailService,
  createMockJob,
  createMockLogger,
  createMockSubscriptionRepository,
  mockConfirmEmailJobData,
  mockSubscription,
} from "@/__tests__/mocks";
import { ConfirmEmailProcessor } from "@/infrastructure/queue/jobs/confirm-email/processor";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

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
    it("should send confirmation email and log success", async () => {
      const job = createMockJob(mockConfirmEmailJobData, "confirm-email");

      mockSubscriptionRepo.findSubscriptionByEmailAndCity.mockResolvedValue(
        mockSubscription
      );

      await processor.handle(job);

      expect(mockEmailService.send).toHaveBeenCalledWith({
        to: mockConfirmEmailJobData.email,
        subject: expect.stringContaining(mockConfirmEmailJobData.city),
        html: expect.stringContaining(mockConfirmEmailJobData.city),
      });

      expect(
        mockSubscriptionRepo.findSubscriptionByEmailAndCity
      ).toHaveBeenCalledWith(
        mockConfirmEmailJobData.email,
        mockConfirmEmailJobData.city
      );

      expect(mockEmailLogRepo.create).toHaveBeenCalledWith({
        subscriptionId: 1,
        type: "subscription_confirmation",
        status: "sent",
        sentAt: expect.any(Date),
      });
    });

    it("should handle email service error and log failure", async () => {
      const job = createMockJob(mockConfirmEmailJobData, "confirm-email");
      const errorMessage = "Email service error";
      const emailError = new Error(errorMessage);

      mockEmailService.send.mockRejectedValue(emailError);
      mockSubscriptionRepo.findSubscriptionByEmailAndCity.mockResolvedValue(
        mockSubscription
      );

      await expect(processor.handle(job)).rejects.toThrow(errorMessage);

      expect(mockEmailService.send).toHaveBeenCalledWith({
        to: mockConfirmEmailJobData.email,
        subject: expect.stringContaining(mockConfirmEmailJobData.city),
        html: expect.stringContaining(mockConfirmEmailJobData.city),
      });

      expect(
        mockSubscriptionRepo.findSubscriptionByEmailAndCity
      ).toHaveBeenCalledWith(
        mockConfirmEmailJobData.email,
        mockConfirmEmailJobData.city
      );

      expect(mockEmailLogRepo.create).toHaveBeenCalledWith({
        subscriptionId: 1,
        status: "failed",
        type: "subscription_confirmation",
        errorMessage,
        sentAt: expect.any(Date),
      });
    });

    it("should throw error when subscription not found after sending email", async () => {
      const job = createMockJob(mockConfirmEmailJobData, "confirm-email");

      mockSubscriptionRepo.findSubscriptionByEmailAndCity.mockResolvedValue(
        null
      );

      await expect(processor.handle(job)).rejects.toThrow();

      expect(mockEmailService.send).toHaveBeenCalledWith({
        to: mockConfirmEmailJobData.email,
        subject: expect.stringContaining(mockConfirmEmailJobData.city),
        html: expect.stringContaining(mockConfirmEmailJobData.city),
      });

      expect(
        mockSubscriptionRepo.findSubscriptionByEmailAndCity
      ).toHaveBeenCalledWith(
        mockConfirmEmailJobData.email,
        mockConfirmEmailJobData.city
      );

      expect(mockEmailLogRepo.create).not.toHaveBeenCalled();
    });

    it("should handle unknown error type in error logging", async () => {
      const job = createMockJob(mockConfirmEmailJobData, "confirm-email");
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
      const job = createMockJob(mockConfirmEmailJobData, "confirm-email");
      const errorMessage = "Log repository error";
      const logError = new Error(errorMessage);

      mockSubscriptionRepo.findSubscriptionByEmailAndCity.mockResolvedValue(
        mockSubscription
      );
      mockEmailLogRepo.create.mockRejectedValueOnce(logError);

      await expect(processor.handle(job)).rejects.toThrow(errorMessage);

      expect(mockEmailService.send).toHaveBeenCalledWith({
        to: mockConfirmEmailJobData.email,
        subject: expect.stringContaining(mockConfirmEmailJobData.city),
        html: expect.stringContaining(mockConfirmEmailJobData.city),
      });

      expect(
        mockSubscriptionRepo.findSubscriptionByEmailAndCity
      ).toHaveBeenCalledWith(
        mockConfirmEmailJobData.email,
        mockConfirmEmailJobData.city
      );

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
        errorMessage,
        sentAt: expect.any(Date),
      });
    });
  });

  describe("completed", () => {
    it("should log completion message", () => {
      const job = createMockJob(
        mockConfirmEmailJobData,
        "confirm-email",
        "123"
      );

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
      const job = createMockJob(
        mockConfirmEmailJobData,
        "confirm-email",
        "123"
      );
      const errorMessage = "Test error";
      const error = new Error(errorMessage);

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
      const errorMessage = "Test error";
      const error = new Error(errorMessage);

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
