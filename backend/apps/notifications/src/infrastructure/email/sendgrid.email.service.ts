import {
  ConfirmationEmailParams,
  IEmailService,
  IMetricsService,
  WeatherUpdateEmailParams,
} from "@/shared/ports";
import { JOB_TYPES } from "@common/constants";
import { ILogger } from "@logger/logger.interface";
import sgMail from "@sendgrid/mail";
import { getConfirmEmailTemplate, getWeatherUpdateTemplate } from "./templates";
import { getCallSites } from "util";

export class SendgridEmailService implements IEmailService {
  constructor(
    apiKey: string,
    private readonly fromEmail: string,
    private readonly logger: ILogger,
    private readonly metricsService: IMetricsService
  ) {
    sgMail.setApiKey(apiKey);
    this.logger.info({
      message: "SendGrid service configured.",
      callSites: getCallSites(),
    });
  }

  private readonly providerName = "sendgrid";

  private async send(params: {
    to: string;
    subject: string;
    html: string;
    emailType: string;
  }): Promise<void> {
    const end = this.metricsService.recordEmailDeliveryDuration(
      this.providerName,
      params.emailType
    );
    const msg = { ...params, from: this.fromEmail };
    try {
      await sgMail.send(msg);
      this.logger.info({
        message: `Email sent to ${params.to}`,
        callSites: getCallSites(),
        meta: {
          subject: params.subject,
          to: params.to,
          emailType: params.emailType,
        },
      });
      this.metricsService.incrementEmailDeliveryCount(
        this.providerName,
        params.emailType
      );
    } catch (error) {
      this.metricsService.incrementEmailDeliveryErrorCount(
        this.providerName,
        params.emailType
      );
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error({
        message: errorMessage,
        callSites: getCallSites(),
        meta: {
          subject: params.subject,
          to: params.to,
          emailType: params.emailType,
        },
        error: {
          message: errorMessage,
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : undefined,
        },
      });
      throw error;
    } finally {
      end();
    }
  }

  async sendConfirmationEmail(params: ConfirmationEmailParams): Promise<void> {
    const subject = `Confirm your weather subscription for ${params.city}`;
    const html = getConfirmEmailTemplate(params.city, params.confirmUrl);
    await this.send({
      to: params.to,
      subject,
      html,
      emailType: JOB_TYPES.CONFIRM_EMAIL,
    });
  }

  async sendWeatherUpdateEmail(
    params: WeatherUpdateEmailParams
  ): Promise<void> {
    const subject = `Weather Update for ${params.city}`;
    const html = getWeatherUpdateTemplate(
      params.city,
      params.weatherData,
      params.unsubscribeUrl
    );
    await this.send({
      to: params.to,
      subject,
      html,
      emailType: JOB_TYPES.SEND_WEATHER_UPDATE_EMAIL,
    });
  }
}
