import { jest } from "@jest/globals";
import { ILogger } from "@logger/logger.interface";

export const createMockLogger = (): jest.Mocked<ILogger> => ({
  logLevel: "info",
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
});

export const mockLogger = createMockLogger();
