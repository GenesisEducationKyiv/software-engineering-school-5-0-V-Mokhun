import { IMetricsService } from "@/shared/ports";
import { MetricsService } from "./metrics.service";

export class MetricsFactory {
  static create(): IMetricsService {
    return MetricsService.getInstance();
  }
}
