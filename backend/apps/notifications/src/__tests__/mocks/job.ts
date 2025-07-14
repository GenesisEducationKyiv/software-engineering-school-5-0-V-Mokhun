import {
  ConfirmEmailJobData,
  SendWeatherUpdateEmailJobData,
  UpdateWeatherDataJobData,
} from "@common/infrastructure/queue";
import { Job } from "bullmq";
import { mockWeatherData } from "./weather";

export const mockConfirmEmailJobData: ConfirmEmailJobData = {
  email: "test@example.com",
  city: "London",
  confirmToken: "confirm-token-456",
};

export const mockSendWeatherUpdateEmailJobData: SendWeatherUpdateEmailJobData =
  {
    subscriptionId: 1,
    ...mockConfirmEmailJobData,
    weatherData: mockWeatherData,
    unsubscribeToken: "unsubscribe-token-123",
  };

export const mockUpdateWeatherDataJobData: UpdateWeatherDataJobData = {
  subscriptionId: 1,
};

export const createMockJob = <T>(
  data: T,
  jobName = "test-job",
  jobId = "123"
): Job<T> =>
  ({
    id: jobId,
    data,
    name: jobName,
    queueName: "test-queue",
  } as Job<T>);
