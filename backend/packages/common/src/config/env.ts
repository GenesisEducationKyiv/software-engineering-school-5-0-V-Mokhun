import { config } from "dotenv";
import { expand } from "dotenv-expand";
import path, { join } from "path";
import { z, ZodType, ZodTypeDef } from "zod";

export const loadEnv = () => {
  let envFile = ".env";
  if (process.env.NODE_ENV === "development") {
    envFile = ".env.development";
  } else if (process.env.NODE_ENV === "test") {
    envFile = ".env.test";
  }
  const envPath = path.resolve(join(__dirname, "../../../..", envFile));
  expand(config({ path: envPath }));
};

export const createEnv = <T extends z.ZodRawShape>(
  schema: z.ZodObject<T>
) => {
  const parsed = schema.safeParse(process.env);

  if (!parsed.success) {
    console.error(
      "❌ Invalid environment configuration:\n",
      parsed.error.format()
    );
    throw new Error(
      `Environment configuration validation failed: ${parsed.error.message}`
    );
  }

  const rootDir = join(__dirname, "..", "..");

  const transformedData =
    "LOG_FILE_PATH" in parsed.data
      ? {
          ...parsed.data,
          LOG_FILE_PATH: path.resolve(
            rootDir,
            parsed.data.LOG_FILE_PATH as string
          ),
        }
      : parsed.data;

  return Object.freeze(transformedData) as Readonly<z.infer<typeof schema>>;
};
