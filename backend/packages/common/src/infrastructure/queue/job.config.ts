import { DefaultJobOptions } from "bullmq";

export const defaultJobOptions: DefaultJobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 1000,
  },
  removeOnComplete: {
    age: 3600,
    count: 200,
  },
  removeOnFail: {
    age: 24 * 3600,
    count: 1000,
  },
};
