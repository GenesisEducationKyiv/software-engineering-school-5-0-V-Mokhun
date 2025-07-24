import { createEnv, loadEnv } from "@common/config/env";
import { z } from "zod";

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
  })
  .passthrough();

export const env = createEnv(notificationsEnvSchema); 
