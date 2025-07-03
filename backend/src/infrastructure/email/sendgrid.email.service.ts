import sgMail from "@sendgrid/mail";
import {
  ConfirmationEmailParams,
  IEmailService,
  WeatherUpdateEmailParams,
} from "@/shared/ports";
import { ILogger } from "@/shared/logger";
import { confirmEmailTemplate, weatherUpdateTemplate } from "./templates";

export class SendgridEmailService implements IEmailService {
  constructor(
    private readonly logger: ILogger,
    apiKey: string,
    private readonly fromEmail: string
  ) {
    sgMail.setApiKey(apiKey);
    this.logger.info("SendGrid service configured.");
  }

  private async send(params: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
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

  async sendConfirmationEmail(params: ConfirmationEmailParams): Promise<void> {
    const subject = `Confirm your weather subscription for ${params.city}`;
    const html = confirmEmailTemplate(params.city, params.confirmToken);
    await this.send({ to: params.to, subject, html });
  }

  async sendWeatherUpdateEmail(
    params: WeatherUpdateEmailParams
  ): Promise<void> {
    const subject = `Weather Update for ${params.city}`;
    const html = weatherUpdateTemplate(
      params.city,
      params.weatherData,
      params.unsubscribeToken
    );
    await this.send({ to: params.to, subject, html });
  }
}
