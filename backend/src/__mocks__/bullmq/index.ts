import { jest } from "@jest/globals";
import {
  Queue as BullQueue,
  Worker as BullWorker,
  QueueEvents as BullQueueEvents,
  QueueOptions,
  WorkerOptions,
  Processor,
  Job,
  QueueBaseOptions,
} from "bullmq";

// Mock event emitter methods
const createEventEmitterMock = () => ({
  on: jest.fn(),
  once: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  removeAllListeners: jest.fn(),
});

// Create the mock instances with basic functionality
export const queueMock = {
  name: "mock-queue",
  opts: {} as QueueBaseOptions,
  add: jest.fn(),
  addBulk: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  close: jest.fn(),
  clean: jest.fn(),
  obliterate: jest.fn(),
  ...createEventEmitterMock(),
} as unknown as jest.Mocked<BullQueue>;

export const workerMock = {
  name: "mock-worker",
  opts: {} as WorkerOptions,
  close: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  ...createEventEmitterMock(),
} as unknown as jest.Mocked<BullWorker>;

// Set default mock implementations
queueMock.add.mockResolvedValue({ id: "mock-job-id", data: {} } as Job);
queueMock.addBulk.mockResolvedValue([{ id: "mock-job-id", data: {} }] as Job[]);
queueMock.pause.mockResolvedValue();
queueMock.resume.mockResolvedValue();
queueMock.close.mockResolvedValue();
queueMock.clean.mockResolvedValue([]);
queueMock.obliterate.mockResolvedValue();

workerMock.close.mockResolvedValue();
workerMock.pause.mockResolvedValue();
workerMock.resume.mockImplementation(() => Promise.resolve());

// Queue class mock
export class Queue implements Partial<BullQueue> {
  constructor(_name: string, _options?: QueueOptions) {
    return queueMock;
  }
}

// Worker class mock
export class Worker implements Partial<BullWorker> {
  constructor(
    _queueName: string,
    _processor: Processor,
    _opts?: WorkerOptions
  ) {
    return workerMock;
  }
}

// QueueEvents class mock
export class QueueEvents implements Partial<BullQueueEvents> {
  constructor(_queueName: string) {
    return createEventEmitterMock() as unknown as BullQueueEvents;
  }
}

// Helper to clear all mocks
export const clearMocks = () => {
  Object.values(queueMock).forEach((method) => {
    if (typeof method === "function" && "mockClear" in method) {
      method.mockClear();
    }
  });
  Object.values(workerMock).forEach((method) => {
    if (typeof method === "function" && "mockClear" in method) {
      method.mockClear();
    }
  });
};

// Re-export types from bullmq
export * from "bullmq";
