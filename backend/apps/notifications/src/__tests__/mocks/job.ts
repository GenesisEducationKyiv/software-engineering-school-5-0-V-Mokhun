import { Job } from "bullmq";
import {
  ConfirmEmailJobData,
  SendWeatherUpdateEmailJobData,
  WeatherData,
} from "@common/generated/proto/job_pb";

export const mockConfirmEmailJobData = new ConfirmEmailJobData({
  email: "test@example.com",
  city: "London",
  confirmUrl: "confirm-url-456",
  subscriptionId: 1,
});

export const mockSendWeatherUpdateEmailJobData =
  new SendWeatherUpdateEmailJobData({
    subscriptionId: 1,
    email: "test@example.com",
    city: "London",
    weatherData: new WeatherData({
      temperature: 20,
      humidity: 60,
      description: "Sunny",
    }),
    unsubscribeUrl: "unsubscribe-url-123",
  });

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
