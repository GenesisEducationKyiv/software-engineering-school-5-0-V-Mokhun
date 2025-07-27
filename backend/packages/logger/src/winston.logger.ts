import { createLogger, format, Logger, transports } from "winston";
import { CallSiteObject } from "util";
import {
  ErrorLogData,
  ILogger,
  LogData,
  LogLevel,
  SamplingConfig,
} from "./logger.interface";
import LokiTransport from "winston-loki";

export class WinstonLogger implements ILogger {
  private logger: Logger;
  logLevel: LogLevel;
  private samplingConfig: SamplingConfig;

  constructor(
    serviceName: string,
    env: string,
    samplingConfig: SamplingConfig,
    logLevel: LogLevel = "info",
    lokiHost?: string
  ) {
    this.logLevel = logLevel;
    this.samplingConfig = samplingConfig;

    const usedTransports = [];
    if (lokiHost) {
      usedTransports.push(
        new LokiTransport({
          host: lokiHost,
          labels: { app: serviceName },
          json: true,
          format: format.json(),
          replaceTimestamp: true,
          onConnectionError: (err) => console.error("Loki error:", err),
        })
      );
    }

    this.logger = createLogger({
      level: this.logLevel,
      levels: {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3,
      },
      format: format.combine(format.timestamp(), format.json()),
      defaultMeta: {
        service: serviceName,
        timestamp: new Date().toISOString(),
        env,
      },
      transports: [
        ...usedTransports,
        new transports.Console({
          format: format.combine(format.simple(), format.colorize()),
        }),
      ],
    });
  }

  private shouldSample(level: LogLevel): boolean {
    const samplingRate = this.samplingConfig[level];

    if (samplingRate >= 1.0) {
      return true;
    }

    if (samplingRate <= 0.0) {
      return false;
    }

    return Math.random() < samplingRate;
  }

  private getCaller(callSites: CallSiteObject[]): string {
    const caller = callSites[0];
    return `${caller.functionName} (${caller.scriptName}:${caller.lineNumber})`;
  }

  info(data: LogData): void {
    if (!this.shouldSample("info")) {
      return;
    }

    const { callSites, ...rest } = data;
    const caller = callSites ? this.getCaller(callSites) : undefined;
    const meta = { ...rest, caller };

    this.logger.info(meta);
  }

  warn(data: ErrorLogData): void {
    if (!this.shouldSample("warn")) {
      return;
    }

    const { callSites, ...rest } = data;
    const caller = callSites ? this.getCaller(callSites) : undefined;
    const meta = { ...rest, caller };

    this.logger.warn(meta);
  }

  error(data: ErrorLogData): void {
    if (!this.shouldSample("error")) {
      return;
    }

    const { callSites, ...rest } = data;
    const caller = callSites ? this.getCaller(callSites) : undefined;
    const meta = { ...rest, caller };

    this.logger.error(meta);
  }

  debug(data: LogData): void {
    if (!this.shouldSample("debug")) {
      return;
    }

    const { callSites, ...rest } = data;
    const caller = callSites ? this.getCaller(callSites) : undefined;
    const meta = { ...rest, caller };

    this.logger.debug(meta);
  }
}
