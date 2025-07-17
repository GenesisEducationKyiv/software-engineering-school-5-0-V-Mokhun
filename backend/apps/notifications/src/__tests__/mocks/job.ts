import { Job } from "bullmq";
import { mockWeatherData } from "./weather";
import {
  ConfirmEmailJobData,
  SendWeatherUpdateEmailJobData,
  UpdateWeatherDataJobData,
  WeatherData,
} from "@common/generated/proto/job_pb";

export const mockConfirmEmailJobData = new ConfirmEmailJobData({
  email: "test@example.com",
  city: "London",
  confirmToken: "confirm-token-456",
});

export const mockSendWeatherUpdateEmailJobData =
  new SendWeatherUpdateEmailJobData({
    subscriptionId: 1,
    email: "test@example.com",
    city: "London",
    weatherData: new WeatherData(mockWeatherData),
    unsubscribeToken: "unsubscribe-token-123",
  });

export const mockUpdateWeatherDataJobData = new UpdateWeatherDataJobData({
  subscriptionId: 1,
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
