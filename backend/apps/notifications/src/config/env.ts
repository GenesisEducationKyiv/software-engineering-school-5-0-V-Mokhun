import { createEnv } from "@common/config/env";
import { config } from "dotenv";
import { expand } from "dotenv-expand";
import path, { join } from "path";
import { z } from "zod";

export const loadEnv = () => {
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

const notificationsEnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]),
    REDIS_HOST: z.string(),
    REDIS_PORT: z.coerce.number().int().nonnegative(),
    SENDGRID_API_KEY: z.string(),
    SENDGRID_FROM_EMAIL: z.string().email(),
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
    LOG_FILE_PATH: z.string(),
    API_PORT: z.coerce.number().int().nonnegative(),
  })
  .passthrough();

export const env = createEnv(notificationsEnvSchema);
