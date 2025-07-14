import { ConsoleLogger } from './console.logger';
import { ILogger } from './logger.interface';

const singletonLogger = new ConsoleLogger();

export function getLogger(): ILogger {
  return singletonLogger;
}
