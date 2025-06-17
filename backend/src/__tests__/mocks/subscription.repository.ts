import { jest } from "@jest/globals";
import { ISubscriptionRepository } from "@/shared/ports";

export const createMockSubscriptionRepository = (): jest.Mocked<ISubscriptionRepository> => ({
  findConfirmedByEmailAndCity: jest.fn(),
  upsertSubscription: jest.fn(),
  findValidByConfirmToken: jest.fn(),
  confirmSubscription: jest.fn(),
  findByUnsubscribeToken: jest.fn(),
  deleteSubscription: jest.fn(),
  findSubscriptionByEmailAndCity: jest.fn(),
  findById: jest.fn(),
  updateLastSentAt: jest.fn(),
});

export const mockSubscriptionRepository = createMockSubscriptionRepository(); 
