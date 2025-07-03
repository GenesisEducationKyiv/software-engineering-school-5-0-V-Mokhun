import {
  createMockJob,
  createMockLogger,
  createMockQueueService,
  createMockSubscriptionRepository,
  createMockWeatherProvider,
  mockConfirmedSubscription,
  mockSubscription,
  mockUpdateWeatherDataJobData,
  mockWeatherData,
} from "@/__tests__/mocks";
import { JOB_TYPES, QUEUE_TYPES } from "@/constants";
import { UpdateWeatherDataProcessor } from "@/infrastructure/queue/jobs/update-weather-data/processor";
import { UpdateWeatherDataJobData } from "@/infrastructure/queue/jobs/update-weather-data/types";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

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
    it("should process weather update for confirmed subscription", async () => {
      const job = createMockJob(
        mockUpdateWeatherDataJobData,
        "update-weather-data"
      );

      mockSubscriptionRepo.findById.mockResolvedValue(
        mockConfirmedSubscription
      );
      mockWeatherProvider.getWeatherData.mockResolvedValue(mockWeatherData);

      await processor.handle(job);

      expect(mockSubscriptionRepo.findById).toHaveBeenCalledWith(
        mockUpdateWeatherDataJobData.subscriptionId
      );
      expect(mockWeatherProvider.getWeatherData).toHaveBeenCalledWith(
        mockSubscription.city
      );
      expect(mockQueueService.add).toHaveBeenCalledWith(
        QUEUE_TYPES.SEND_WEATHER_UPDATE_EMAIL,
        JOB_TYPES.SEND_WEATHER_UPDATE_EMAIL,
        {
          email: mockSubscription.email,
          city: mockSubscription.city,
          unsubscribeToken: mockSubscription.unsubscribeToken,
          weatherData: mockWeatherData,
          subscriptionId: mockUpdateWeatherDataJobData.subscriptionId,
        }
      );
    });

    it("should skip processing for unconfirmed subscription", async () => {
      const job = createMockJob(
        mockUpdateWeatherDataJobData,
        "update-weather-data"
      );

      mockSubscriptionRepo.findById.mockResolvedValue(mockSubscription);

      await processor.handle(job);

      expect(mockSubscriptionRepo.findById).toHaveBeenCalledWith(
        mockUpdateWeatherDataJobData.subscriptionId
      );
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          mockUpdateWeatherDataJobData.subscriptionId.toString()
        )
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
      const job = createMockJob(
        mockUpdateWeatherDataJobData,
        "update-weather-data"
      );
      const errorMessage = "Weather API error";
      const error = new Error(errorMessage);

      mockSubscriptionRepo.findById.mockResolvedValue(
        mockConfirmedSubscription
      );
      mockWeatherProvider.getWeatherData.mockRejectedValue(error);

      await expect(processor.handle(job)).rejects.toThrow(errorMessage);

      expect(mockSubscriptionRepo.findById).toHaveBeenCalledWith(
        mockUpdateWeatherDataJobData.subscriptionId
      );
      expect(mockWeatherProvider.getWeatherData).toHaveBeenCalledWith(
        mockSubscription.city
      );
      expect(mockQueueService.add).not.toHaveBeenCalled();
    });

    it("should propagate queue service errors", async () => {
      const job = createMockJob(
        mockUpdateWeatherDataJobData,
        "update-weather-data"
      );
      const errorMessage = "Queue service error";
      const error = new Error(errorMessage);

      mockSubscriptionRepo.findById.mockResolvedValue(
        mockConfirmedSubscription
      );
      mockWeatherProvider.getWeatherData.mockResolvedValue(mockWeatherData);
      mockQueueService.add.mockRejectedValue(error);

      await expect(processor.handle(job)).rejects.toThrow(errorMessage);

      expect(mockSubscriptionRepo.findById).toHaveBeenCalledWith(
        mockUpdateWeatherDataJobData.subscriptionId
      );
      expect(mockWeatherProvider.getWeatherData).toHaveBeenCalledWith(
        mockSubscription.city
      );
      expect(mockQueueService.add).toHaveBeenCalledWith(
        QUEUE_TYPES.SEND_WEATHER_UPDATE_EMAIL,
        JOB_TYPES.SEND_WEATHER_UPDATE_EMAIL,
        {
          email: mockSubscription.email,
          city: mockSubscription.city,
          unsubscribeToken: mockSubscription.unsubscribeToken,
          weatherData: mockWeatherData,
          subscriptionId: mockUpdateWeatherDataJobData.subscriptionId,
        }
      );
    });
  });

  describe("completed", () => {
    it("should log completion message", () => {
      const job = createMockJob(
        mockUpdateWeatherDataJobData,
        "update-weather-data"
      );

      processor.completed(job);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining(`sub ${job?.data.subscriptionId}`)
      );
    });
  });

  describe("failed", () => {
    it("should log failure message with job data", () => {
      const job = createMockJob(
        mockUpdateWeatherDataJobData,
        "update-weather-data"
      );
      const errorMessage = "Test error";
      const error = new Error(errorMessage);

      processor.failed(job, error);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining(`sub ${job?.data.subscriptionId}`),
        error,
        {
          jobId: job?.id,
          jobData: job?.data,
        }
      );
    });

    it("should log failure message without job data when job is undefined", () => {
      const errorMessage = "Test error";
      const error = new Error(errorMessage);

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
