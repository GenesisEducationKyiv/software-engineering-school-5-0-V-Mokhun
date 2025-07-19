import { jest } from "@jest/globals";
import { IQueueService } from "@common/shared/ports";

export const createMockQueueService = (): jest.Mocked<IQueueService> => ({
  add: jest.fn(),
  schedule: jest.fn(),
  removeSchedule: jest.fn(),
});

export const mockQueueService = createMockQueueService(); 
