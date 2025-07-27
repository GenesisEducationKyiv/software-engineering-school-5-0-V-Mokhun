export interface IMetricsService {
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
  incrementJobEnqueuedCount(jobName: string): void;
  incrementJobProcessedCount(jobName: string): void;
  incrementJobFailedCount(jobName: string): void;
  recordJobProcessingDuration(jobName: string): () => number;
  incrementEmailDeliveryCount(providerName: string, emailType: string): void;
  incrementEmailDeliveryErrorCount(
    providerName: string,
    emailType: string
  ): void;
  recordEmailDeliveryDuration(
    providerName: string,
    emailType: string
  ): () => number;
  getMetrics(): Promise<string>;
  getContentType(): string;
}
