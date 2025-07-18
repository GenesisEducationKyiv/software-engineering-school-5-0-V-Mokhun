import {
  createMockEmailLogRepository,
  createMockEmailService,
  createMockJob,
  createMockLogger,
  mockConfirmEmailJobData,
} from "@/__tests__/mocks";
import { ConfirmEmailProcessor } from "@/infrastructure/queue/jobs/confirm-email/processor";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const mockEmailService = createMockEmailService();
const mockEmailLogRepo = createMockEmailLogRepository();
const mockLogger = createMockLogger();

describe("ConfirmEmailProcessor", () => {
  let processor: ConfirmEmailProcessor;

  beforeEach(() => {
    jest.resetAllMocks();

    processor = new ConfirmEmailProcessor(
      mockEmailService,
      mockEmailLogRepo,
      mockLogger
    );
  });

  describe("handle", () => {
    it("should send confirmation email and log success", async () => {
      const job = createMockJob(
        mockConfirmEmailJobData.toBinary(),
        "confirm-email"
      );

      await processor.handle(job);

      expect(mockEmailService.sendConfirmationEmail).toHaveBeenCalledWith({
        to: mockConfirmEmailJobData.email,
        city: mockConfirmEmailJobData.city,
        confirmToken: mockConfirmEmailJobData.confirmToken,
      });

      expect(mockEmailLogRepo.create).toHaveBeenCalledWith({
        subscriptionId: 1,
        type: "subscription_confirmation",
        status: "sent",
        sentAt: expect.any(Date),
      });
    });

    it("should handle email service error and log failure", async () => {
      const job = createMockJob(
        mockConfirmEmailJobData.toBinary(),
        "confirm-email"
      );
      const errorMessage = "Email service error";
      const emailError = new Error(errorMessage);

      mockEmailService.sendConfirmationEmail.mockRejectedValue(emailError);

      await expect(processor.handle(job)).rejects.toThrow(errorMessage);

      expect(mockEmailService.sendConfirmationEmail).toHaveBeenCalledWith({
        to: mockConfirmEmailJobData.email,
        city: mockConfirmEmailJobData.city,
        confirmToken: mockConfirmEmailJobData.confirmToken,
      });

      expect(mockEmailLogRepo.create).toHaveBeenCalledWith({
        subscriptionId: 1,
        status: "failed",
        type: "subscription_confirmation",
        errorMessage,
        sentAt: expect.any(Date),
      });
    });

    it("should handle unknown error type in error logging", async () => {
      const job = createMockJob(
        mockConfirmEmailJobData.toBinary(),
        "confirm-email"
      );
      const unknownError = "String error";

      mockEmailService.sendConfirmationEmail.mockRejectedValue(unknownError);

      await expect(processor.handle(job)).rejects.toBe(unknownError);

      expect(mockEmailLogRepo.create).toHaveBeenCalledWith({
        subscriptionId: 1,
        status: "failed",
        type: "subscription_confirmation",
        errorMessage: "Unknown error",
        sentAt: expect.any(Date),
      });
    });
  });

  describe("completed", () => {
    it("should log completion message", () => {
      const job = createMockJob(
        mockConfirmEmailJobData.toBinary(),
        "confirm-email",
        "123"
      );

      processor.completed(job);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          jobId: "123",
          email: mockConfirmEmailJobData.email,
        })
      );
    });
  });

  describe("failed", () => {
    it("should log failure message with job data", () => {
      const job = createMockJob(
        mockConfirmEmailJobData.toBinary(),
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
  });
});
