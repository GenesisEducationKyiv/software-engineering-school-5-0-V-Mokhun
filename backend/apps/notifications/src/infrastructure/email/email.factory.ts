import { ILogger } from "@logger/logger.interface";
import { IEmailService } from "@/shared/ports";
import { SendgridEmailService } from "./sendgrid.email.service";

export function createEmailService({
  logger,
  apiKey,
  fromEmail,
}: {
  logger: ILogger;
  apiKey: string;
  fromEmail: string;
}): IEmailService {
  if (!apiKey || !fromEmail) {
    logger.error(
      "Email service cannot be created. apiKey or fromEmail is not set.",
      new Error("Missing EmailService configuration")
    );

    throw new Error("Cannot create EmailService due to missing configuration.");
  }

  return new SendgridEmailService(logger, apiKey, fromEmail);
}
