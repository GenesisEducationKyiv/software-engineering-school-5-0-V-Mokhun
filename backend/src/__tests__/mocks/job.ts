import { Job } from "bullmq";

export const createMockJob = <T>(data: T, jobName = "test-job", jobId = "123"): Job<T> => ({
  id: jobId,
  data,
  name: jobName,
  queueName: "test-queue",
} as Job<T>); 
