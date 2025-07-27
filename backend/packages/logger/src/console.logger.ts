import { ILogger, LogLevel } from "./logger.interface";

export class ConsoleLogger implements ILogger {
  logLevel: LogLevel;

  constructor(logLevel: LogLevel = "info") {
    this.logLevel = logLevel;
  }

  private log(level: LogLevel, message: string, meta?: Record<string, any>) {
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
    if (this.logLevel === "debug") {
      this.log("debug", message, meta);
    }
  }
}
