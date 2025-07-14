import { jest } from "@jest/globals";
import { IEmailLogRepository } from "@common/shared/ports";

export const createMockEmailLogRepository =
  (): jest.Mocked<IEmailLogRepository> => ({
    create: jest.fn(),
  });

export const mockEmailLogRepository = createMockEmailLogRepository();
