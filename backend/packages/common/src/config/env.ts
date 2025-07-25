import path, { join } from "path";
import { z } from "zod";

export const createEnv = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) => {
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
