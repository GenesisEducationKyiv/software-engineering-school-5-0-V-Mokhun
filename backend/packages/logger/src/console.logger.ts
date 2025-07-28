import { ErrorLogData, ILogger, LogData, LogLevel } from "./logger.interface";

export class ConsoleLogger implements ILogger {
  logLevel: LogLevel;
  serviceName: string;
  env: string;

  constructor(serviceName: string, env: string, logLevel: LogLevel = "info") {
    this.logLevel = logLevel;
    this.serviceName = serviceName;
    this.env = env;
  }

  private log(level: LogLevel, meta: LogData | ErrorLogData) {
    console.log(
      JSON.stringify({
        service: this.serviceName,
        env: this.env,
        level,
        ...meta,
      })
    );
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
