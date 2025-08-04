import { Registry } from "prom-client";

export interface IRegistryManager {
  getRegistry(): Registry;
  getMetrics(): Promise<string>;
  getContentType(): string;
}

export interface IHttpMetricsService {
  incrementHttpRequestCount(
    method: string,
    route: string,
    statusCode: string
  ): void;
  incrementHttpRequestErrorCount(
    method: string,
    route: string,
    statusCode: string
  ): void;
  recordHttpRequestDuration(
    method: string,
    route: string,
    statusCode: string
  ): () => number;
}

export interface IJobMetricsService {
  incrementJobEnqueuedCount(jobName: string): void;
  incrementJobProcessedCount(jobName: string): void;
  incrementJobFailedCount(jobName: string): void;
  recordJobProcessingDuration(jobName: string): () => number;
}

export interface IEmailMetricsService {
  incrementEmailDeliveryCount(providerName: string, emailType: string): void;
  incrementEmailDeliveryErrorCount(
    providerName: string,
    emailType: string
  ): void;
  recordEmailDeliveryDuration(
    providerName: string,
    emailType: string
  ): () => number;
}
