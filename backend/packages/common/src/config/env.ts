import { config } from "dotenv";
import { expand } from "dotenv-expand";
import path, { join } from "path";
import { z } from "zod";

let envFile = ".env";
if (process.env.NODE_ENV === "development") {
  envFile = ".env.development";
} else if (process.env.NODE_ENV === "test") {
  envFile = ".env.test";
}

const envPath = path.resolve(join(__dirname, "../..", envFile));

expand(config({ path: envPath }));

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]),
    API_PORT: z.coerce.number().int().nonnegative(),
    API_URL: z.string().url(),
    REDIS_HOST: z.string(),
    REDIS_PORT: z.coerce.number().int().nonnegative(),
    SENDGRID_API_KEY: z.string(),
    SENDGRID_FROM_EMAIL: z.string().email(),
    WEATHER_API_KEY: z.string(),
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
    LOG_FILE_PATH: z.string(),
  })
  .passthrough();

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment configuration:\n",
    parsed.error.format()
  );
  throw new Error("Environment configuration validation failed");
}

const rootDir = join(__dirname, "..", "..");

const transformedData = {
  ...parsed.data,
  LOG_FILE_PATH: path.resolve(rootDir, parsed.data.LOG_FILE_PATH),
};

export const env = Object.freeze(transformedData) as Readonly<
  z.infer<typeof envSchema>
>;
