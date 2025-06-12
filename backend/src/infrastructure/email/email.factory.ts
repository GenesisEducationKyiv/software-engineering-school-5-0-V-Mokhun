import { env } from "@/config";
import { getLogger } from "@/shared/logger";
import { IEmailService } from "@/shared/ports/email.port";
import { SendgridEmailService } from "./sendgrid.email.service";

export function createEmailService(): IEmailService {
  const logger = getLogger();
  const apiKey = env.SENDGRID_API_KEY;
  const fromEmail = env.SENDGRID_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    logger.error(
      "Email service cannot be created. SENDGRID_API_KEY or SENDGRID_FROM_EMAIL is not set.",
      new Error("Missing SendGrid environment variables")
    );

    throw new Error("Cannot create EmailService due to missing configuration.");
  }

  return new SendgridEmailService(logger, apiKey, fromEmail);
}
