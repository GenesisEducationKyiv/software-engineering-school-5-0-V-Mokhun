export type LogLevel = "debug" | "info" | "warn" | "error";
export interface ILogger {
  logLevel: LogLevel;
  info(message: string, meta?: Record<string, any>): void;
  warn(message: string, meta?: Record<string, any>): void;
  error(message: string, error: Error, meta?: Record<string, any>): void;
  debug(message: string, meta?: Record<string, any>): void;
} 
