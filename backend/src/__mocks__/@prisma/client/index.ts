import { jest } from "@jest/globals";
import { PrismaClient as PrismaClientOriginal } from "@prisma/client";

// Define the mock methods with proper typing
type MockPrismaClient = jest.Mocked<PrismaClientOriginal>;

// Create base mock methods
const createMockModelMethods = () => ({
  findUnique: jest.fn(),
  findFirst: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  upsert: jest.fn(),
  delete: jest.fn(),
  deleteMany: jest.fn(),
  count: jest.fn(),
});

// Create the mock client with all models
export const prisma = {
  subscription: {
    ...createMockModelMethods(),
    // Add any subscription-specific mock methods here
  },
  weatherCache: {
    ...createMockModelMethods(),
    // Add any weatherCache-specific mock methods here
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $transaction: jest.fn(),
  $use: jest.fn(),
  $on: jest.fn(),
} as unknown as MockPrismaClient;

export const PrismaClient = jest.fn(() => prisma);

export * from "@prisma/client";
