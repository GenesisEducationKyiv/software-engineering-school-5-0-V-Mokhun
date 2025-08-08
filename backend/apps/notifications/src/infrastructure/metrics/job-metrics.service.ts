import { Counter, Histogram, Registry } from "prom-client";
import { IJobMetricsService } from "@/shared/ports";

export class JobMetricsService implements IJobMetricsService {
  private jobsEnqueuedTotal: Counter;
  private jobsProcessedTotal: Counter;
  private jobsFailedTotal: Counter;
  private jobsProcessingDuration: Histogram;

  constructor(registry: Registry) {
    this.jobsEnqueuedTotal = new Counter({
      name: "jobs_enqueued_total",
      help: "Total number of jobs enqueued",
      registers: [registry],
      labelNames: ["job_name"],
    });

    this.jobsProcessedTotal = new Counter({
      name: "jobs_processed_total",
      help: "Total number of jobs processed",
      registers: [registry],
      labelNames: ["job_name"],
    });

    this.jobsFailedTotal = new Counter({
      name: "jobs_failed_total",
      help: "Total number of jobs failed",
      registers: [registry],
      labelNames: ["job_name"],
    });

    this.jobsProcessingDuration = new Histogram({
      name: "jobs_processing_duration_seconds",
      help: "Duration of jobs processing",
      registers: [registry],
      labelNames: ["job_name"],
    });
  }

  incrementJobEnqueuedCount(jobName: string): void {
    this.jobsEnqueuedTotal.labels(jobName).inc();
  }

  incrementJobProcessedCount(jobName: string): void {
    this.jobsProcessedTotal.labels(jobName).inc();
  }

  incrementJobFailedCount(jobName: string): void {
    this.jobsFailedTotal.labels(jobName).inc();
  }

  recordJobProcessingDuration(jobName: string): () => number {
    return this.jobsProcessingDuration.startTimer({
      job_name: jobName,
    });
  }
} 

export class JobMetricsServiceFactory {
  static create(registry: Registry): IJobMetricsService {
    return new JobMetricsService(registry);
  }
}
