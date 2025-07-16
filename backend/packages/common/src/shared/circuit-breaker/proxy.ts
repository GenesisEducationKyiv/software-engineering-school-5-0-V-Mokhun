import { ILogger } from "@logger/logger.interface";
import { ServerErrorException } from "@common/shared";
import opossum from "opossum";

const opossumOptions: opossum.Options = {
  timeout: 5000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000,
};

/**
 * Creates a proxy object that wraps all asynchronous methods of the target object
 * with a circuit breaker.
 *
 * @param target The object to wrap.
 * @param logger An instance of the logger for observing circuit breaker events.
 * @returns A proxy of the target object with circuit breaker protection.
 */
export function createCircuitBreakerProxy<T extends object>(
  target: T,
  logger: ILogger
): T {
  const proxy = {} as T;
  const targetName = target.constructor.name;

  const methodNames = Object.getOwnPropertyNames(
    target.constructor.prototype
  ).filter(
    (prop) =>
      prop !== "constructor" &&
      typeof (target as any)[prop] === "function" &&
      (target as any)[prop].constructor.name === "AsyncFunction"
  );

  for (const methodName of methodNames) {
    const originalMethod = (target as any)[methodName].bind(target);

    const breaker = new opossum(originalMethod, opossumOptions);

    breaker.on("open", () =>
      logger.warn(`[${targetName}.${methodName}] Circuit breaker is open.`)
    );
    breaker.on("close", () =>
      logger.info(`[${targetName}.${methodName}] Circuit breaker is closed.`)
    );
    breaker.fallback(() => {
      throw new ServerErrorException(
        `${targetName}.${methodName} is currently unavailable.`
      );
    });

    (proxy as any)[methodName] = (...args: any[]) => breaker.fire(...args);
  }

  // Ensure non-function properties are passed through
  const allProps = Object.getOwnPropertyNames(target);
  for (const prop of allProps) {
    if (typeof (target as any)[prop] !== "function") {
      Object.defineProperty(proxy, prop, {
        get: () => (target as any)[prop],
      });
    }
  }

  return proxy;
}
