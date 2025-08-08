import { Counter, Histogram, Registry } from "prom-client";
import { IHttpMetricsService } from "@/shared/ports";

export class HttpMetricsService implements IHttpMetricsService {
  private httpRequestsTotal: Counter;
  private httpRequestErrorsTotal: Counter;
  private httpRequestDuration: Histogram;

  constructor(registry: Registry) {
    this.httpRequestsTotal = new Counter({
      name: "http_requests_total",
      help: "Total number of HTTP requests",
      labelNames: ["method", "route", "status_code"],
      registers: [registry],
    });

    this.httpRequestErrorsTotal = new Counter({
      name: "http_request_errors_total",
      help: "Total number of HTTP request errors",
      labelNames: ["method", "route", "status_code"],
      registers: [registry],
    });

    this.httpRequestDuration = new Histogram({
      name: "http_request_duration_seconds",
      help: "Duration of HTTP requests",
      labelNames: ["method", "route", "status_code"],
      registers: [registry],
    });
  }

  incrementHttpRequestCount(
    method: string,
    route: string,
    statusCode: string
  ): void {
    this.httpRequestsTotal.labels(method, route, statusCode).inc();
  }

  incrementHttpRequestErrorCount(
    method: string,
    route: string,
    statusCode: string
  ): void {
    this.httpRequestErrorsTotal.labels(method, route, statusCode).inc();
  }

  recordHttpRequestDuration(
    method: string,
    route: string,
    statusCode: string
  ): () => number {
    return this.httpRequestDuration.startTimer({
      method,
      route,
      status_code: statusCode,
    });
  }
} 

export class HttpMetricsServiceFactory {
  static create(registry: Registry): IHttpMetricsService {
    return new HttpMetricsService(registry);
  }
}
