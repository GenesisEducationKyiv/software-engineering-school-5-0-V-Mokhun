import { IHttpMetricsService } from "@/shared/ports";
import { Request, Response, NextFunction } from "express";

export const createMetricsMiddleware = (metrics: IHttpMetricsService) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const end = metrics.recordHttpRequestDuration(
      req.method,
      req.route?.path || req.path,
      res.statusCode.toString()
    );

    res.on("finish", () => {
      const labels = {
        method: req.method,
        route: req.route?.path || req.path,
        status_code: res.statusCode.toString(),
      };
      metrics.incrementHttpRequestCount(
        labels.method,
        labels.route,
        labels.status_code
      );
      end();

      if (res.statusCode >= 400) {
        metrics.incrementHttpRequestErrorCount(
          labels.method,
          labels.route,
          labels.status_code
        );
      }
    });

    next();
  };
};
