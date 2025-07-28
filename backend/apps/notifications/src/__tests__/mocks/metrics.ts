import { IMetricsService } from "@/shared/ports";
import { jest } from "@jest/globals";

export const createMockMetricsService = (): jest.Mocked<IMetricsService> => {
  const mockEndFunction = jest.fn(() => 0);

  return {
    incrementHttpRequestCount: jest.fn(),
    incrementHttpRequestErrorCount: jest.fn(),
    recordHttpRequestDuration: jest
      .fn()
      .mockReturnValue(mockEndFunction) as any,
    incrementJobEnqueuedCount: jest.fn(),
    incrementJobProcessedCount: jest.fn(),
    incrementJobFailedCount: jest.fn(),
    recordJobProcessingDuration: jest
      .fn()
      .mockReturnValue(mockEndFunction) as any,
    incrementEmailDeliveryCount: jest.fn(),
    incrementEmailDeliveryErrorCount: jest.fn(),
    recordEmailDeliveryDuration: jest
      .fn()
      .mockReturnValue(mockEndFunction) as any,
    getMetrics: jest.fn(),
    getContentType: jest.fn(),
  };
};

export const mockMetricsService = createMockMetricsService();
