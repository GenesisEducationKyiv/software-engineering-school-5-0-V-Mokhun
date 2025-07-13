import {
  createMockEmailLogRepository,
  createMockEmailService,
  createMockJob,
  createMockLogger,
  createMockSubscriptionRepository,
  mockSendWeatherUpdateEmailJobData,
} from "@/__tests__/mocks";
import { SendWeatherUpdateEmailProcessor } from "@/infrastructure/queue/jobs/send-weather-update-email/processor";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const mockEmailService = createMockEmailService();
const mockSubscriptionRepo = createMockSubscriptionRepository();
const mockEmailLogRepo = createMockEmailLogRepository();
const mockLogger = createMockLogger();

describe("SendWeatherUpdateEmailProcessor", () => {
  let processor: SendWeatherUpdateEmailProcessor;

  beforeEach(() => {
    jest.resetAllMocks();

    processor = new SendWeatherUpdateEmailProcessor(
      mockEmailService,
      mockSubscriptionRepo,
      mockEmailLogRepo,
      mockLogger
    );
  });

  describe("handle", () => {
    it("should send weather update email and log success", async () => {
      const job = createMockJob(
        mockSendWeatherUpdateEmailJobData,
        "send-weather-update-email"
      );

      await processor.handle(job);

      expect(mockEmailService.sendWeatherUpdateEmail).toHaveBeenCalledWith({
        to: mockSendWeatherUpdateEmailJobData.email,
        city: mockSendWeatherUpdateEmailJobData.city,
        weatherData: mockSendWeatherUpdateEmailJobData.weatherData,
        unsubscribeToken: mockSendWeatherUpdateEmailJobData.unsubscribeToken,
      });

      expect(mockEmailLogRepo.create).toHaveBeenCalledWith({
        subscriptionId: mockSendWeatherUpdateEmailJobData.subscriptionId,
        type: "weather_update",
        status: "sent",
        sentAt: expect.any(Date),
      });

      expect(mockSubscriptionRepo.updateLastSentAt).toHaveBeenCalledWith(
        mockSendWeatherUpdateEmailJobData.subscriptionId,
        expect.any(Date)
      );
    });

    it("should return early if some data is missing", async () => {
      const incompleteJobData = {
        ...mockSendWeatherUpdateEmailJobData,
        email: "",
      };
      const job = createMockJob(incompleteJobData, "send-weather-update-email");

      await processor.handle(job);

      expect(mockEmailService.sendWeatherUpdateEmail).not.toHaveBeenCalled();
      expect(mockEmailLogRepo.create).not.toHaveBeenCalled();
      expect(mockSubscriptionRepo.updateLastSentAt).not.toHaveBeenCalled();
    });

    it("should handle email service error and log failure", async () => {
      const job = createMockJob(
        mockSendWeatherUpdateEmailJobData,
        "send-weather-update-email"
      );
      const errorMessage = "Email service error";
      const emailError = new Error(errorMessage);

      mockEmailService.sendWeatherUpdateEmail.mockRejectedValue(emailError);

      await expect(processor.handle(job)).rejects.toThrow(errorMessage);

      expect(mockEmailService.sendWeatherUpdateEmail).toHaveBeenCalledWith(
        {
          to: mockSendWeatherUpdateEmailJobData.email,
          city: mockSendWeatherUpdateEmailJobData.city,
          weatherData: mockSendWeatherUpdateEmailJobData.weatherData,
          unsubscribeToken: mockSendWeatherUpdateEmailJobData.unsubscribeToken,
        }
      );

      expect(mockEmailLogRepo.create).toHaveBeenCalledWith({
        subscriptionId: mockSendWeatherUpdateEmailJobData.subscriptionId,
        status: "failed",
        type: "weather_update",
        errorMessage,
        sentAt: expect.any(Date),
      });

      expect(mockSubscriptionRepo.updateLastSentAt).not.toHaveBeenCalled();
    });

    it("should handle unknown error type in error logging", async () => {
      const job = createMockJob(
        mockSendWeatherUpdateEmailJobData,
        "send-weather-update-email"
      );
      const unknownError = "String error";

      mockEmailService.sendWeatherUpdateEmail.mockRejectedValue(unknownError);

      await expect(processor.handle(job)).rejects.toBe(unknownError);

      expect(mockEmailLogRepo.create).toHaveBeenCalledWith({
        subscriptionId: mockSendWeatherUpdateEmailJobData.subscriptionId,
        status: "failed",
        type: "weather_update",
        errorMessage: "Unknown error",
        sentAt: expect.any(Date),
      });

      expect(mockSubscriptionRepo.updateLastSentAt).not.toHaveBeenCalled();
    });

    it("should handle email log repository error during success path", async () => {
      const job = createMockJob(
        mockSendWeatherUpdateEmailJobData,
        "send-weather-update-email"
      );
      const errorMessage = "Log repository error";
      const logError = new Error(errorMessage);

      mockEmailLogRepo.create.mockRejectedValueOnce(logError);

      await expect(processor.handle(job)).rejects.toThrow(errorMessage);

      expect(mockEmailService.sendWeatherUpdateEmail).toHaveBeenCalledWith(
        {
          to: mockSendWeatherUpdateEmailJobData.email,
          city: mockSendWeatherUpdateEmailJobData.city,
          weatherData: mockSendWeatherUpdateEmailJobData.weatherData,
          unsubscribeToken: mockSendWeatherUpdateEmailJobData.unsubscribeToken,
        }
      );

      expect(mockEmailLogRepo.create).toHaveBeenCalledTimes(2);

      expect(mockEmailLogRepo.create).toHaveBeenNthCalledWith(1, {
        subscriptionId: mockSendWeatherUpdateEmailJobData.subscriptionId,
        type: "weather_update",
        status: "sent",
        sentAt: expect.any(Date),
      });

      expect(mockEmailLogRepo.create).toHaveBeenNthCalledWith(2, {
        subscriptionId: mockSendWeatherUpdateEmailJobData.subscriptionId,
        status: "failed",
        type: "weather_update",
        errorMessage,
        sentAt: expect.any(Date),
      });

      expect(mockSubscriptionRepo.updateLastSentAt).not.toHaveBeenCalled();
    });

    it("should handle subscription repository error during success path", async () => {
      const job = createMockJob(
        mockSendWeatherUpdateEmailJobData,
        "send-weather-update-email"
      );
      const errorMessage = "Repository error";
      const repoError = new Error(errorMessage);

      mockEmailLogRepo.create.mockResolvedValue(undefined);
      mockSubscriptionRepo.updateLastSentAt.mockRejectedValue(repoError);

      await expect(processor.handle(job)).rejects.toThrow(errorMessage);

      expect(mockEmailService.sendWeatherUpdateEmail).toHaveBeenCalledWith({
        to: mockSendWeatherUpdateEmailJobData.email,
        city: mockSendWeatherUpdateEmailJobData.city,
        weatherData: mockSendWeatherUpdateEmailJobData.weatherData,
        unsubscribeToken: mockSendWeatherUpdateEmailJobData.unsubscribeToken,
      });

      expect(mockEmailLogRepo.create).toHaveBeenCalledWith({
        subscriptionId: mockSendWeatherUpdateEmailJobData.subscriptionId,
        type: "weather_update",
        status: "sent",
        sentAt: expect.any(Date),
      });

      expect(mockSubscriptionRepo.updateLastSentAt).toHaveBeenCalledWith(
        mockSendWeatherUpdateEmailJobData.subscriptionId,
        expect.any(Date)
      );
    });
  });

  describe("completed", () => {
    it("should log completion message", () => {
      const job = createMockJob(
        mockSendWeatherUpdateEmailJobData,
        "send-weather-update-email",
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
        mockSendWeatherUpdateEmailJobData,
        "send-weather-update-email",
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
