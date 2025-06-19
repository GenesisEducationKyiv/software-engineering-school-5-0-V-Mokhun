import fs from "fs";
import { ILogger } from "./logger.interface";
import { env } from "@/config";

export class FileLogger implements ILogger {
  constructor(private readonly filePath: string) {}

  private log(level: string, message: string, meta?: Record<string, any>) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(
      this.filePath,
      JSON.stringify({
        timestamp,
        level,
        message,
        ...meta,
      }) + "\n"
    );
  }

  info(message: string, meta?: Record<string, any>): void {
    this.log("info", message, meta);
  }

  warn(message: string, meta?: Record<string, any>): void {
    this.log("warn", message, meta);
  }

  error(message: string, error: Error, meta?: Record<string, any>): void {
    this.log("error", message, {
      ...meta,
      stack: error.stack,
      name: error.name,
    });
  }

  debug(message: string, meta?: Record<string, any>): void {
    if (env.NODE_ENV !== "production") {
      this.log("debug", message, meta);
    }
  }
}
