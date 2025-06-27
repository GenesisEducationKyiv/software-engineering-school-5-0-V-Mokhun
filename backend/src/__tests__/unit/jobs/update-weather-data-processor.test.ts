import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { UpdateWeatherDataProcessor } from "@/infrastructure/queue/jobs/update-weather-data/processor";
import { UpdateWeatherDataJobData } from "@/infrastructure/queue/jobs/update-weather-data/types";
import { WeatherData } from "@/shared/ports";
import { QUEUE_TYPES, JOB_TYPES } from "@/infrastructure/queue/constants";
import { Frequency } from "@prisma/client";
import {
  createMockQueueService,
  createMockSubscriptionRepository,
  createMockWeatherProvider,
  createMockLogger,
  createMockJob,
} from "@/__tests__/mocks";

const mockQueueService = createMockQueueService();
const mockSubscriptionRepo = createMockSubscriptionRepository();
const mockWeatherProvider = createMockWeatherProvider();
const mockLogger = createMockLogger();

describe("UpdateWeatherDataProcessor", () => {
  let processor: UpdateWeatherDataProcessor;

  beforeEach(() => {
    jest.resetAllMocks();
    processor = new UpdateWeatherDataProcessor(
      mockQueueService,
      mockSubscriptionRepo,
      mockWeatherProvider,
      mockLogger
    );
  });

  describe("handle", () => {
    const mockWeatherData: WeatherData = {
      temperature: 20,
      humidity: 60,
      description: "Sunny",
    };

    const mockSubscription = {
      id: 1,
      email: "test@example.com",
      city: "London",
      frequency: Frequency.DAILY,
      confirmed: true,
      unsubscribeToken: "unsubscribe-token-123",
      confirmToken: null,
      confirmTokenExpiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSentAt: null,
    };

    it("should process weather update for confirmed subscription", async () => {
      const jobData: UpdateWeatherDataJobData = { subscriptionId: 1 };
      const job = createMockJob(jobData, "update-weather-data");

      mockSubscriptionRepo.findById.mockResolvedValue(mockSubscription);
      mockWeatherProvider.getWeatherData.mockResolvedValue(mockWeatherData);

      await processor.handle(job);

      expect(mockSubscriptionRepo.findById).toHaveBeenCalledWith(1);
      expect(mockWeatherProvider.getWeatherData).toHaveBeenCalledWith("London");
      expect(mockQueueService.add).toHaveBeenCalledWith(
        QUEUE_TYPES.SEND_WEATHER_UPDATE_EMAIL,
        JOB_TYPES.SEND_WEATHER_UPDATE_EMAIL,
        {
          email: "test@example.com",
          city: "London",
          unsubscribeToken: "unsubscribe-token-123",
          weatherData: mockWeatherData,
          subscriptionId: 1,
        }
      );
    });

    it("should skip processing for unconfirmed subscription", async () => {
      const jobData: UpdateWeatherDataJobData = { subscriptionId: 1 };
      const job = createMockJob(jobData, "update-weather-data");
      const unconfirmedSubscription = { ...mockSubscription, confirmed: false };

      mockSubscriptionRepo.findById.mockResolvedValue(unconfirmedSubscription);

      await processor.handle(job);

      expect(mockSubscriptionRepo.findById).toHaveBeenCalledWith(1);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining("1")
      );
      expect(mockWeatherProvider.getWeatherData).not.toHaveBeenCalled();
      expect(mockQueueService.add).not.toHaveBeenCalled();
    });

    it("should skip processing for non-existent subscription", async () => {
      const jobData: UpdateWeatherDataJobData = { subscriptionId: 999 };
      const job = createMockJob(jobData, "update-weather-data");

      mockSubscriptionRepo.findById.mockResolvedValue(null);

      await processor.handle(job);

      expect(mockSubscriptionRepo.findById).toHaveBeenCalledWith(999);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining("999")
      );
      expect(mockWeatherProvider.getWeatherData).not.toHaveBeenCalled();
      expect(mockQueueService.add).not.toHaveBeenCalled();
    });

    it("should propagate weather provider errors", async () => {
      const jobData: UpdateWeatherDataJobData = { subscriptionId: 1 };
      const job = createMockJob(jobData, "update-weather-data");
      const error = new Error("Weather API error");

      mockSubscriptionRepo.findById.mockResolvedValue(mockSubscription);
      mockWeatherProvider.getWeatherData.mockRejectedValue(error);

      await expect(processor.handle(job)).rejects.toThrow("Weather API error");

      expect(mockSubscriptionRepo.findById).toHaveBeenCalledWith(1);
      expect(mockWeatherProvider.getWeatherData).toHaveBeenCalledWith("London");
      expect(mockQueueService.add).not.toHaveBeenCalled();
    });

    it("should propagate queue service errors", async () => {
      const jobData: UpdateWeatherDataJobData = { subscriptionId: 1 };
      const job = createMockJob(jobData, "update-weather-data");
      const error = new Error("Queue service error");

      mockSubscriptionRepo.findById.mockResolvedValue(mockSubscription);
      mockWeatherProvider.getWeatherData.mockResolvedValue(mockWeatherData);
      mockQueueService.add.mockRejectedValue(error);

      await expect(processor.handle(job)).rejects.toThrow(
        "Queue service error"
      );

      expect(mockSubscriptionRepo.findById).toHaveBeenCalledWith(1);
      expect(mockWeatherProvider.getWeatherData).toHaveBeenCalledWith("London");
      expect(mockQueueService.add).toHaveBeenCalledWith(
        QUEUE_TYPES.SEND_WEATHER_UPDATE_EMAIL,
        JOB_TYPES.SEND_WEATHER_UPDATE_EMAIL,
        {
          email: "test@example.com",
          city: "London",
          unsubscribeToken: "unsubscribe-token-123",
          weatherData: mockWeatherData,
          subscriptionId: 1,
        }
      );
    });
  });

  describe("completed", () => {
    it("should log completion message", () => {
      const jobData: UpdateWeatherDataJobData = { subscriptionId: 1 };
      const job = createMockJob(jobData, "update-weather-data");

      processor.completed(job);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("sub 1")
      );
    });
  });

  describe("failed", () => {
    it("should log failure message with job data", () => {
      const jobData: UpdateWeatherDataJobData = { subscriptionId: 1 };
      const job = createMockJob(jobData, "update-weather-data");
      const error = new Error("Test error");

      processor.failed(job, error);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("sub 1"),
        error,
        {
          jobId: job?.id,
          jobData: job?.data,
        }
      );
    });

    it("should log failure message without job data when job is undefined", () => {
      const error = new Error("Test error");

      processor.failed(undefined, error);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("sub undefined"),
        error,
        {
          jobId: undefined,
          jobData: undefined,
        }
      );
    });
  });
});
