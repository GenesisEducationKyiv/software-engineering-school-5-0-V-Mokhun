import { ILogger, LogLevel, SamplingConfig } from "./logger.interface";
import { WinstonLogger } from "./winston.logger";

export const LOG_SAMPLING_CONFIGS: Record<string, SamplingConfig> = {
  development: {
    error: 1.0,
    warn: 1.0,
    info: 1.0,
    debug: 0.5,
  },
  production: {
    error: 1.0,
    warn: 1.0,
    info: 0.1,
    debug: 0.01,
  },
  test: {
    error: 1.0,
    warn: 1.0,
    info: 1.0,
    debug: 1.0,
  },
};

export function createLogger({
  serviceName,
  env,
  lokiHost,
  logLevel = "info",
  samplingConfig,
}: {
  serviceName: string;
  env: string;
  logLevel?: LogLevel;
  samplingConfig?: SamplingConfig;
  lokiHost?: string;
}): ILogger {
  return new WinstonLogger(
    serviceName,
    env,
    samplingConfig || LOG_SAMPLING_CONFIGS[env],
    logLevel,
    lokiHost
  );
}
