import { config } from "dotenv";
import { expand } from "dotenv-expand";
import path, { join } from "path";

let envFile = ".env";
if (process.env.NODE_ENV === "development") {
  envFile = ".env.development";
} else if (process.env.NODE_ENV === "test") {
  envFile = ".env.test";
}

const envPath = path.resolve(join(__dirname, "../..", envFile));

expand(config({ path: envPath }));

type EnvConfig = {
  NODE_ENV: "development" | "production" | "test";
  API_PORT: number;
  API_URL: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  SENDGRID_API_KEY: string;
  SENDGRID_FROM_EMAIL: string;
  WEATHER_API_KEY: string;
};

function getEnvVar(key: keyof EnvConfig): string {
  const value = process.env[key];
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

function parseEnvVar<T>(key: keyof EnvConfig, parser: (value: string) => T): T {
  const value = getEnvVar(key);
  try {
    return parser(value);
  } catch (_) {
    throw new Error(`Failed to parse environment variable ${key}`);
  }
}

export const env: EnvConfig = {
  NODE_ENV: parseEnvVar("NODE_ENV", (value) => {
    if (value !== "development" && value !== "production" && value !== "test") {
      throw new Error(
        "NODE_ENV must be either 'development', 'production', or 'test'"
      );
    }
    return value;
  }),
  API_PORT: parseEnvVar("API_PORT", (value) => {
    const port = parseInt(value, 10);
    if (isNaN(port)) {
      throw new Error("PORT must be a number");
    }
    return port;
  }),
  API_URL: getEnvVar("API_URL"),
  REDIS_HOST: getEnvVar("REDIS_HOST"),
  REDIS_PORT: parseEnvVar("REDIS_PORT", (value) => {
    const port = parseInt(value, 10);
    if (isNaN(port)) {
      throw new Error("REDIS_PORT must be a number");
    }
    return port;
  }),
  SENDGRID_API_KEY: getEnvVar("SENDGRID_API_KEY"),
  SENDGRID_FROM_EMAIL: getEnvVar("SENDGRID_FROM_EMAIL"),
  WEATHER_API_KEY: getEnvVar("WEATHER_API_KEY"),
};

Object.freeze(env);
