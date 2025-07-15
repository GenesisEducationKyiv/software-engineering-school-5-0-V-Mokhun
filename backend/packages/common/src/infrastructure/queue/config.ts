import { env } from "@common/config";
import { RedisOptions } from "ioredis";

export const createRootConfig = ({
  host = env.REDIS_HOST,
  port = env.REDIS_PORT,
}: {
  host?: string;
  port?: number;
} = {}): { connection: RedisOptions } => {
  return {
    connection: {
      host,
      port,
      maxRetriesPerRequest: null,
    },
  };
};
