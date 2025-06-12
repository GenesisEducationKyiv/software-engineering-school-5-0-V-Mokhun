import { ILogger } from "./logger.interface";

export class ConsoleLogger implements ILogger {
  private log(level: string, message: string, meta?: Record<string, any>) {
    const timestamp = new Date().toISOString();
    console.log(
      JSON.stringify({
        timestamp,
        level,
        message,
        ...meta,
      })
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
    if (process.env.NODE_ENV !== "production") {
      this.log("debug", message, meta);
    }
  }
}
