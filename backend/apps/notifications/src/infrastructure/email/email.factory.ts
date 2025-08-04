import { ILogger } from "@logger/logger.interface";
import { IEmailMetricsService, IEmailService } from "@/shared/ports";
import { SendgridEmailService } from "./sendgrid.email.service";
import { getCallSites } from "util";

export function createEmailService({
  logger,
  apiKey,
  fromEmail,
  metricsService,
}: {
  logger: ILogger;
  apiKey: string;
  fromEmail: string;
  metricsService: IEmailMetricsService;
}): IEmailService {
  if (!apiKey || !fromEmail) {
    const errorMessage =
      "Email service cannot be created. apiKey or fromEmail is not set.";
    const error = new Error(errorMessage);
    logger.error({
      message: errorMessage,
      callSites: getCallSites(),
      error: {
        message: errorMessage,
        stack: error.stack,
        name: error.name,
      },
    });

    throw error;
  }

  return new SendgridEmailService(apiKey, fromEmail, logger, metricsService);
}
