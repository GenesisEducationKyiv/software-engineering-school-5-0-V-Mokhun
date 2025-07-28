import { config } from "dotenv";
import { expand } from "dotenv-expand";
import path, { join } from "path";
import { z } from "zod";
import { createEnv } from "@common/config/env";

const loadEnv = () => {
  let envFile = ".env";
  if (process.env.NODE_ENV === "development") {
    envFile = ".env.development";
  } else if (process.env.NODE_ENV === "test") {
    envFile = ".env.test";
  }

  const envPath = path.resolve(join(__dirname, "../..", envFile));
  expand(config({ path: envPath }));
};

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
    LOKI_HOST: z.string().optional(),
  })
  .passthrough();

export const env = createEnv(weatherEnvSchema);
