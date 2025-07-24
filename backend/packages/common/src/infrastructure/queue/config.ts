import { RedisOptions } from "ioredis";

export const createRootConfig = ({
  host,
  port,
}: {
  host: string;
  port: number;
}): { connection: RedisOptions } => {
  return {
    connection: {
      host,
      port,
      maxRetriesPerRequest: null,
    },
  };
};
