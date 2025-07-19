import { createEnv, loadEnv } from "@common/config/env";
import { z } from "zod";

loadEnv();

const weatherEnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]),
    API_PORT: z.coerce.number().int().nonnegative(),
    API_URL: z.string().url(),
    REDIS_HOST: z.string(),
    REDIS_PORT: z.coerce.number().int().nonnegative(),
    WEATHER_API_KEY: z.string(),
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
    LOG_FILE_PATH: z.string(),
  })
  .passthrough();

export const env = createEnv(weatherEnvSchema);
