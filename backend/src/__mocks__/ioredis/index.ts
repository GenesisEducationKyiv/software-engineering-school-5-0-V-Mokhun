import { jest } from '@jest/globals';

// Export the mock methods so they can be accessed in tests
export const mockGet = jest.fn().mockImplementation(() => Promise.resolve(null));
export const mockSet = jest.fn().mockImplementation(() => Promise.resolve("OK"));
export const mockDel = jest.fn().mockImplementation(() => Promise.resolve(1));
export const mockQuit = jest.fn().mockImplementation(() => Promise.resolve("OK"));
export const mockOn = jest.fn();
export const mockOff = jest.fn();
export const mockFlushall = jest.fn().mockImplementation(() => Promise.resolve("OK"));

// Create the Redis mock class
export class Redis {
  constructor() {
    return {
      get: mockGet,
      set: mockSet,
      del: mockDel,
      quit: mockQuit,
      on: mockOn,
      off: mockOff,
      flushall: mockFlushall,
    };
  }
}

// Export the Redis class as default
export default Redis; 
