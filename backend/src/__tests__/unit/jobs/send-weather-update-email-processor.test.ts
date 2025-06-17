import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { SendWeatherUpdateEmailProcessor } from "@/infrastructure/queue/jobs/send-weather-update-email/processor";
import { SendWeatherUpdateEmailJobData } from "@/infrastructure/queue/jobs/send-weather-update-email/types";
import { WeatherData } from "@/shared/ports";
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
    const mockWeatherData: WeatherData = {
      temperature: 20,
      humidity: 60,
      description: "Sunny",
    };

    const completeJobData: SendWeatherUpdateEmailJobData = {
      subscriptionId: 1,
      email: "test@example.com",
      city: "London",
      unsubscribeToken: "unsubscribe-token-123",
      weatherData: mockWeatherData,
    };

    it("should send weather update email and log success", async () => {
      const job = createMockJob(completeJobData, "send-weather-update-email");

      await processor.handle(job);

      expect(mockEmailService.send).toHaveBeenCalledWith({
        to: "test@example.com",
        subject: "Weather Update for London",
        html: expect.stringContaining("London"),
      });

      expect(mockEmailLogRepo.create).toHaveBeenCalledWith({
        subscriptionId: 1,
        type: "weather_update",
        status: "sent",
        sentAt: expect.any(Date),
      });

      expect(mockSubscriptionRepo.updateLastSentAt).toHaveBeenCalledWith(
        1,
        expect.any(Date)
      );
    });

    it("should return early if some data is missing", async () => {
      const incompleteJobData = { ...completeJobData, email: "" };
      const job = createMockJob(incompleteJobData, "send-weather-update-email");

      await processor.handle(job);

      expect(mockEmailService.send).not.toHaveBeenCalled();
      expect(mockEmailLogRepo.create).not.toHaveBeenCalled();
      expect(mockSubscriptionRepo.updateLastSentAt).not.toHaveBeenCalled();
    });

    it("should handle email service error and log failure", async () => {
      const job = createMockJob(completeJobData, "send-weather-update-email");
      const emailError = new Error("Email service error");

      mockEmailService.send.mockRejectedValue(emailError);

      await expect(processor.handle(job)).rejects.toThrow(
        "Email service error"
      );

      expect(mockEmailService.send).toHaveBeenCalledWith({
        to: "test@example.com",
        subject: "Weather Update for London",
        html: expect.stringContaining("London"),
      });

      expect(mockEmailLogRepo.create).toHaveBeenCalledWith({
        subscriptionId: 1,
        status: "failed",
        type: "weather_update",
        errorMessage: "Email service error",
        sentAt: expect.any(Date),
      });

      expect(mockSubscriptionRepo.updateLastSentAt).not.toHaveBeenCalled();
    });

    it("should handle unknown error type in error logging", async () => {
      const job = createMockJob(completeJobData, "send-weather-update-email");
      const unknownError = "String error";

      mockEmailService.send.mockRejectedValue(unknownError);

      await expect(processor.handle(job)).rejects.toBe(unknownError);

      expect(mockEmailLogRepo.create).toHaveBeenCalledWith({
        subscriptionId: 1,
        status: "failed",
        type: "weather_update",
        errorMessage: "Unknown error",
        sentAt: expect.any(Date),
      });

      expect(mockSubscriptionRepo.updateLastSentAt).not.toHaveBeenCalled();
    });

    it("should handle email log repository error during success path", async () => {
      const job = createMockJob(completeJobData, "send-weather-update-email");
      const logError = new Error("Log repository error");

      mockEmailLogRepo.create.mockRejectedValueOnce(logError);

      await expect(processor.handle(job)).rejects.toThrow(
        "Log repository error"
      );

      expect(mockEmailService.send).toHaveBeenCalledWith({
        to: "test@example.com",
        subject: "Weather Update for London",
        html: expect.stringContaining("London"),
      });

      expect(mockEmailLogRepo.create).toHaveBeenCalledTimes(2);

      expect(mockEmailLogRepo.create).toHaveBeenNthCalledWith(1, {
        subscriptionId: 1,
        type: "weather_update",
        status: "sent",
        sentAt: expect.any(Date),
      });

      expect(mockEmailLogRepo.create).toHaveBeenNthCalledWith(2, {
        subscriptionId: 1,
        status: "failed",
        type: "weather_update",
        errorMessage: "Log repository error",
        sentAt: expect.any(Date),
      });

      expect(mockSubscriptionRepo.updateLastSentAt).not.toHaveBeenCalled();
    });

    it("should handle subscription repository error during success path", async () => {
      const job = createMockJob(completeJobData, "send-weather-update-email");
      const repoError = new Error("Repository error");

      mockEmailLogRepo.create.mockResolvedValue(undefined);
      mockSubscriptionRepo.updateLastSentAt.mockRejectedValue(repoError);

      await expect(processor.handle(job)).rejects.toThrow("Repository error");

      expect(mockEmailService.send).toHaveBeenCalledWith({
        to: "test@example.com",
        subject: "Weather Update for London",
        html: expect.stringContaining("London"),
      });

      expect(mockEmailLogRepo.create).toHaveBeenCalledWith({
        subscriptionId: 1,
        type: "weather_update",
        status: "sent",
        sentAt: expect.any(Date),
      });

      expect(mockSubscriptionRepo.updateLastSentAt).toHaveBeenCalledWith(
        1,
        expect.any(Date)
      );
    });
  });

  describe("completed", () => {
    it("should log completion message", () => {
      const jobData: SendWeatherUpdateEmailJobData = {
        subscriptionId: 1,
        email: "test@example.com",
        city: "London",
        unsubscribeToken: "unsubscribe-token-123",
        weatherData: {
          temperature: 20,
          humidity: 60,
          description: "Sunny",
        },
      };
      const job = createMockJob(jobData, "send-weather-update-email");

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
      const jobData: SendWeatherUpdateEmailJobData = {
        subscriptionId: 1,
        email: "test@example.com",
        city: "London",
        unsubscribeToken: "unsubscribe-token-123",
        weatherData: {
          temperature: 20,
          humidity: 60,
          description: "Sunny",
        },
      };
      const job = createMockJob(jobData, "send-weather-update-email");
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
