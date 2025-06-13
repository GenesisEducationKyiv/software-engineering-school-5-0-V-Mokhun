import { env } from "@/config";
import { Redis, RedisOptions } from "ioredis";

export const createRedisConnection = (options?: RedisOptions) => {
  return new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    maxRetriesPerRequest: null,
    ...options,
  });
};

export const redisConnection = createRedisConnection();

export const rootConfig = {
  connection: redisConnection,
};
