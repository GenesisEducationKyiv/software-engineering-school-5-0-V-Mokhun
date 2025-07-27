import path from "path";
import fs from "fs";
import { ILogger, LogLevel } from "./logger.interface";

export class FileLogger implements ILogger {
  logLevel: LogLevel;
  private logFilePath: string;

  constructor(logLevel: LogLevel = "info", logDir: string = "log") {
    this.logLevel = logLevel;
    const logPath = path.resolve(process.cwd(), "..", "..", logDir);
    if (!fs.existsSync(logPath)) {
      fs.mkdirSync(logPath, { recursive: true });
    }
    this.logFilePath = path.join(logPath, "app.log");
  }

  private log(level: string, message: string, meta?: Record<string, any>) {
    const timestamp = new Date().toISOString();
    const logMessage =
      JSON.stringify({
        timestamp,
        level,
        message,
        ...meta,
      }) + "\\n";
    fs.appendFileSync(this.logFilePath, logMessage);
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
