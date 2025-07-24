import { Frequency } from "@prisma/client";

export const mockSubscription = {
  id: 1,
  email: "test@example.com",
  city: "London",
  frequency: Frequency.DAILY,
  confirmed: false,
  unsubscribeToken: "unsubscribe-token-123",
  confirmToken: "confirm-token-456",
  confirmTokenExpiresAt: new Date(Date.now() + 3600000),
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSentAt: null,
};

export const mockConfirmedSubscription = {
  ...mockSubscription,
  confirmed: true,
};
