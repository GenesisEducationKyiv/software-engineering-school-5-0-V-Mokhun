import { jest } from "@jest/globals";
import { IEmailLogRepository } from "@/shared/ports";

export const createMockEmailLogRepository = (): jest.Mocked<IEmailLogRepository> => ({
  create: jest.fn(),
});

export const mockEmailLogRepository = createMockEmailLogRepository(); 
