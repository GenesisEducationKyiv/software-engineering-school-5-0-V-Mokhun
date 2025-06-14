import sgMail from "@sendgrid/mail";
import { IEmailService, SendEmailParams } from "@/shared/ports";
import { ILogger } from "@/shared/logger";

export class SendgridEmailService implements IEmailService {
  constructor(
    private readonly logger: ILogger,
    apiKey: string,
    private readonly fromEmail: string
  ) {
    sgMail.setApiKey(apiKey);
    this.logger.info("SendGrid service configured.");
  }

  async send(params: SendEmailParams): Promise<void> {
    const msg = { ...params, from: this.fromEmail };
    try {
      await sgMail.send(msg);
      this.logger.info(`Email sent to ${params.to}`, {
        subject: params.subject,
      });
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error("Failed to send email via SendGrid", error, params);
      } else {
        this.logger.error(
          "An unknown error occurred while sending email via SendGrid",
          new Error(JSON.stringify(error)),
          params
        );
      }
      throw error;
    }
  }
}
