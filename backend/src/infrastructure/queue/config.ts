import { env } from "@/config";
import { Redis } from "ioredis";

export const redisConnection = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null,
});

export const rootConfig = {
  connection: redisConnection,
};
