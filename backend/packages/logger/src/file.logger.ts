import path from "path";
import fs from "fs";
import { ILogger, LogData, LogLevel, ErrorLogData } from "./logger.interface";

export class FileLogger implements ILogger {
  logLevel: LogLevel;
  serviceName: string;
  env: string;
  private logFilePath: string;

  constructor(
    serviceName: string,
    env: string,
    logLevel: LogLevel = "info",
    logDir: string = "log"
  ) {
    this.logLevel = logLevel;
    this.serviceName = serviceName;
    this.env = env;
    const logPath = path.resolve(process.cwd(), "..", "..", logDir);
    if (!fs.existsSync(logPath)) {
      fs.mkdirSync(logPath, { recursive: true });
    }
    this.logFilePath = path.join(logPath, `app-${serviceName}-${env}.log`);
  }

  private log(level: string, meta: LogData | ErrorLogData) {
    const logMessage =
      JSON.stringify({
        service: this.serviceName,
        env: this.env,
        level,
        ...meta,
      }) + "\n";
    fs.appendFileSync(this.logFilePath, logMessage);
  }

  info(meta: LogData): void {
    this.log("info", meta);
  }

  warn(meta: LogData): void {
    this.log("warn", meta);
  }

  error(meta: ErrorLogData): void {
    this.log("error", meta);
  }

  debug(meta: LogData): void {
    this.log("debug", meta);
  }
}
