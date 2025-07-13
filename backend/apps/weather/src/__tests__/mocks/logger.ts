import { jest } from "@jest/globals";
import { ILogger } from "@/shared/logger/logger.interface";

export const createMockLogger = (): jest.Mocked<ILogger> => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
});

export const mockLogger = createMockLogger(); 
