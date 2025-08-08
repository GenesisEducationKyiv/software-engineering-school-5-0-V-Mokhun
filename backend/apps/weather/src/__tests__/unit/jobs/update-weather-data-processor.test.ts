import { UpdateWeatherDataProcessor } from "@/infrastructure/queue/jobs/update-weather-data/processor";
import { JOB_TYPES, QUEUE_TYPES } from "@common/constants";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import {
  createMockLogger,
  createMockQueueService,
  createMockSubscriptionRepository,
  createMockWeatherProvider,
  mockConfirmedSubscription,
  mockWeatherData,
} from "../../mocks";
import { createMockJob, mockUpdateWeatherDataJobData } from "../../mocks/job";

const mockSubscriptionRepo = createMockSubscriptionRepository();
const mockWeatherProvider = createMockWeatherProvider();
const mockQueueService = createMockQueueService();
const mockLogger = createMockLogger();

describe("UpdateWeatherDataProcessor", () => {
  let processor: UpdateWeatherDataProcessor;

  beforeEach(() => {
    jest.resetAllMocks();

    processor = new UpdateWeatherDataProcessor(
      mockSubscriptionRepo,
      mockWeatherProvider,
      mockQueueService,
      mockLogger
    );
  });

  describe("handle", () => {
    it("should process weather data update and enqueue email job", async () => {
      const job = createMockJob(
        Buffer.from(mockUpdateWeatherDataJobData.toBinary()),
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
        mockConfirmedSubscription.city
      );
      expect(mockQueueService.add).toHaveBeenCalledWith(
        QUEUE_TYPES.SEND_WEATHER_UPDATE_EMAIL,
        JOB_TYPES.SEND_WEATHER_UPDATE_EMAIL,
        expect.any(Buffer)
      );
    });

    it("should not process if subscription is not found or not confirmed", async () => {
      const job = createMockJob(
        Buffer.from(mockUpdateWeatherDataJobData.toBinary()),
        "update-weather-data"
      );

      mockSubscriptionRepo.findById.mockResolvedValue(null);

      await processor.handle(job);

      expect(mockWeatherProvider.getWeatherData).not.toHaveBeenCalled();
      expect(mockQueueService.add).not.toHaveBeenCalled();
    });

    it("should propagate weather provider errors", async () => {
      const job = createMockJob(
        Buffer.from(mockUpdateWeatherDataJobData.toBinary()),
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
        mockConfirmedSubscription.city
      );
      expect(mockQueueService.add).not.toHaveBeenCalled();
    });

    it("should propagate queue service errors", async () => {
      const job = createMockJob(
        Buffer.from(mockUpdateWeatherDataJobData.toBinary()),
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
        mockConfirmedSubscription.city
      );
      expect(mockQueueService.add).toHaveBeenCalledWith(
        QUEUE_TYPES.SEND_WEATHER_UPDATE_EMAIL,
        JOB_TYPES.SEND_WEATHER_UPDATE_EMAIL,
        expect.any(Buffer)
      );
    });
  });

  describe("completed", () => {
    it("should log completion message", () => {
      const job = createMockJob(
        Buffer.from(mockUpdateWeatherDataJobData.toBinary()),
        "update-weather-data"
      );

      processor.completed(job);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
          meta: expect.objectContaining({
            jobId: job.id,
            subscriptionId: mockUpdateWeatherDataJobData.subscriptionId,
          }),
        })
      );
    });
  });

  describe("failed", () => {
    it("should log failure message with job data", () => {
      const job = createMockJob(
        Buffer.from(mockUpdateWeatherDataJobData.toBinary()),
        "update-weather-data"
      );
      const errorMessage = "Test error";
      const error = new Error(errorMessage);

      processor.failed(job, error);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
          meta: expect.objectContaining({
            jobId: job?.id,
            subscriptionId: mockUpdateWeatherDataJobData.subscriptionId,
          }),
          error: expect.objectContaining({
            message: errorMessage,
          }),
        })
      );
    });

    it("should log failure message without job data when job is undefined", () => {
      const errorMessage = "Test error";
      const error = new Error(errorMessage);

      processor.failed(undefined, error);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
          meta: expect.objectContaining({
            jobId: undefined,
          }),
          error: expect.objectContaining({
            message: errorMessage,
          }),
        })
      );
    });
  });
});
