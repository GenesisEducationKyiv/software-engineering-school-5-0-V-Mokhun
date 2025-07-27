import { IMetricsService } from "@/shared/ports";
import { jest } from "@jest/globals";

export const createMockMetricsService = (): jest.Mocked<IMetricsService> => ({
  incrementHttpRequestCount: jest.fn(),
  incrementHttpRequestErrorCount: jest.fn(),
  recordHttpRequestDuration: jest.fn(),
  incrementJobEnqueuedCount: jest.fn(),
  incrementJobProcessedCount: jest.fn(),
  incrementJobFailedCount: jest.fn(),
  recordJobProcessingDuration: jest.fn(),
  incrementEmailDeliveryCount: jest.fn(),
  incrementEmailDeliveryErrorCount: jest.fn(),
  recordEmailDeliveryDuration: jest.fn(),
  getMetrics: jest.fn(),
  getContentType: jest.fn(),
});

export const mockMetricsService = createMockMetricsService();
