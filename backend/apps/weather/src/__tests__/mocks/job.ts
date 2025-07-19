import { Job } from "bullmq";
import { UpdateWeatherDataJobData } from "@common/generated/proto/job_pb";

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
